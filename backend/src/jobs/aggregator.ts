import 'dotenv/config';
import prisma from '../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Use Remotive public API to avoid API key complexity
const REMOTIVE_API = 'https://remotive.com/api/remote-jobs';
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const genAI = new GoogleGenerativeAI(apiKey);
  // The embeddings endpoint is available via embedContent on an embedding-capable model
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const res = await model.embedContent(text.slice(0, 8000));
  const vector = (res as any).embedding?.values || [];
  if (!Array.isArray(vector) || vector.length === 0) throw new Error('Failed to obtain embedding');
  return vector as number[];
}

function vectorLiteral(vec: number[]): string {
  // pgvector accepts literals like [0.1, 0.2, ...]
  return `[${vec.map((v) => (Number.isFinite(v) ? v.toFixed(6) : 0)).join(', ')}]`;
}

async function fetchRemotiveJobs(): Promise<any[]> {
  const res = await fetch(REMOTIVE_API);
  if (!res.ok) throw new Error(`Remotive fetch failed: ${res.status}`);
  const data: any = await res.json();
  return Array.isArray((data as any)?.jobs) ? (data as any).jobs : [];
}

async function upsertJob(job: any, embedding: number[]) {
  const title: string = job.title || 'Untitled';
  const company: string = job.company_name || job.company || 'Unknown';
  const description: string = job.description || '';
  const location: string | undefined = job.candidate_required_location || job.location || undefined;
  const url: string | undefined = job.url || job.apply_url || job.job_url || undefined;

  // Create or update job by unique URL+title+company composite key (best-effort)
  const record = await prisma.job.create({
    data: {
      title,
      company,
      description,
      location,
      url,
      // leave JSON fields undefined
    },
  });

  // Update embedding column using raw SQL (pgvector). We maintain a dedicated `embedding` vector column.
  const literal = vectorLiteral(embedding);
  // pgvector literal must be a quoted string like '[0.1, 0.2, ...]'::vector
  await prisma.$executeRawUnsafe(`UPDATE "Job" SET embedding = '${literal}'::vector WHERE id = $1`, record.id);
}

async function main() {
  console.log('Fetching jobs from Remotive...');
  const jobs = await fetchRemotiveJobs();
  console.log(`Fetched ${jobs.length} jobs. Creating embeddings and saving...`);

  // Limit to first N jobs to keep within quotas
  const limit = Number(process.env.AGGREGATOR_LIMIT || 50);
  let count = 0;
  for (const job of jobs) {
    if (count >= limit) break;
    const text = `${job.title || ''}\n${job.company_name || ''}\n${job.description || ''}`.slice(0, 12000);
    try {
      const emb = await getEmbedding(text);
      await upsertJob(job, emb);
      count++;
      if (count % 10 === 0) console.log(`Inserted ${count} jobs...`);
    } catch (err) {
      console.warn('Skipped a job due to error:', (err as Error).message);
    }
  }
  console.log(`Done. Inserted ${count} jobs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
