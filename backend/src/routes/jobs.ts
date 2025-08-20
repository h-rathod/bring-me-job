import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

async function embedSkills(skills: string[]): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const text = skills.join(', ');
  const res = await model.embedContent(text.slice(0, 8000));
  const vec = (res as any).embedding?.values || [];
  if (!Array.isArray(vec) || vec.length === 0) throw new Error('Embedding failed for skills');
  return vec as number[];
}

function vectorLiteral(vec: number[]): string {
  return `[${vec.map((v) => (Number.isFinite(v) ? v.toFixed(6) : 0)).join(', ')}]`;
}

// --- Helpers for Skill Gap ---
const COMMON_TECH_KEYWORDS = [
  'javascript','typescript','node','express','react','vite','next','angular','vue','redux','tailwind','css','html','graphql','rest',
  'postgres','mysql','prisma','mongodb','redis','docker','kubernetes','aws','gcp','azure','ci','cd','git','testing','jest','vitest',
  'python','java','go','rust','c#','c++','nlp','llm','gemini','openai','api','websocket','oauth','jwt','microservices'
];

function normalizeSkill(s: string) {
  return s.trim().toLowerCase();
}

function extractJobSkillsFromDescription(description: string, userSkills: string[]): string[] {
  const text = (description || '').toLowerCase();
  const found = new Set<string>();
  // Match explicit user skills present in description
  for (const s of userSkills) {
    const k = normalizeSkill(s);
    if (k && text.includes(k)) found.add(k);
  }
  // Add common tech keywords present in description
  for (const k of COMMON_TECH_KEYWORDS) {
    if (text.includes(k)) found.add(k);
  }
  return Array.from(found);
}

// Simple in-memory cache for YouTube results to reduce quota hits
const YT_TTL_MS = 12 * 60 * 60 * 1000; // 12h
const ytCache = new Map<string, { at: number; items: { skill: string; title: string; url: string }[] }>();

function fallbackLearningResources(skills: string[]) {
  const catalog: Record<string, { title: string; url: string }[]> = {
    javascript: [
      { title: 'JavaScript Full Course – freeCodeCamp', url: 'https://www.youtube.com/watch?v=jS4aFq5-91M' },
      { title: 'MDN – JavaScript Guide', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
    ],
    typescript: [
      { title: 'TypeScript for Beginners – freeCodeCamp', url: 'https://www.youtube.com/watch?v=30LWjhZzg50' },
      { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
    ],
    node: [
      { title: 'Node.js Crash Course – Traversy', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4' },
      { title: 'Node.js Docs', url: 'https://nodejs.org/en/learn' },
    ],
    express: [
      { title: 'Express.js Crash Course – Traversy', url: 'https://www.youtube.com/watch?v=L72fhGm1tfE' },
      { title: 'Express Guide', url: 'https://expressjs.com/en/starter/installing.html' },
    ],
    react: [
      { title: 'React Docs (Beta)', url: 'https://react.dev/learn' },
      { title: 'React Course – freeCodeCamp', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
    ],
    docker: [
      { title: 'Docker Tutorial – freeCodeCamp', url: 'https://www.youtube.com/watch?v=9zUHg7xjIqQ' },
      { title: 'Docker Docs – Get Started', url: 'https://docs.docker.com/get-started/' },
    ],
    kubernetes: [
      { title: 'Kubernetes Course – freeCodeCamp', url: 'https://www.youtube.com/watch?v=d6WC5n9G_sM' },
      { title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
    ],
    postgres: [
      { title: 'PostgreSQL Tutorial – freeCodeCamp', url: 'https://www.youtube.com/watch?v=qw--VYLpxG4' },
      { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
    ],
    aws: [
      { title: 'AWS Cloud Practitioner – freeCodeCamp', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc' },
      { title: 'AWS Training', url: 'https://www.aws.training/' },
    ],
    gcp: [
      { title: 'Google Cloud Training', url: 'https://cloud.google.com/training' },
    ],
    redis: [
      { title: 'Redis Crash Course – Traversy', url: 'https://www.youtube.com/watch?v=jgpVdJB2sKQ' },
      { title: 'Redis Docs', url: 'https://redis.io/docs/latest/develop/' },
    ],
    ci: [
      { title: 'CI/CD Explained – Fireship', url: 'https://www.youtube.com/watch?v=scEDHsr3APg' },
    ],
    cd: [
      { title: 'CI/CD Explained – Fireship', url: 'https://www.youtube.com/watch?v=scEDHsr3APg' },
    ],
    api: [
      { title: 'REST API Tutorial – freeCodeCamp', url: 'https://www.youtube.com/watch?v=-MTSQjw5DrM' },
      { title: 'RESTful API Design', url: 'https://restfulapi.net/' },
    ],
    rest: [
      { title: 'REST API Tutorial – freeCodeCamp', url: 'https://www.youtube.com/watch?v=-MTSQjw5DrM' },
      { title: 'RESTful API Design', url: 'https://restfulapi.net/' },
    ],
    go: [
      { title: 'Go Tutorial – freeCodeCamp', url: 'https://www.youtube.com/watch?v=un6ZyFkqFKo' },
      { title: 'Tour of Go', url: 'https://go.dev/tour/welcome/1' },
    ],
  };
  const out: { skill: string; title: string; url: string }[] = [];
  for (const s of skills) {
    const key = s.toLowerCase();
    const picks = catalog[key];
    if (picks) {
      out.push(...picks.slice(0, 1).map((r) => ({ skill: s, title: r.title, url: r.url })));
    }
  }
  return out;
}

async function fetchYouTubeLearningResources(skills: string[], maxPerSkill = 1) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY missing; skipping YouTube learning resources');
    return [] as { skill: string; title: string; url: string }[];
  }
  if (skills.length === 0) return [] as { skill: string; title: string; url: string }[];

  const out: { skill: string; title: string; url: string }[] = [];
  const doFetch: typeof fetch | undefined = typeof fetch === 'function' ? fetch : undefined;
  if (!doFetch) {
    console.warn('Global fetch is unavailable. Run Node 18+ or install a fetch polyfill.');
    return out;
  }

  // Fetch for all provided missing skills
  const targetSkills = skills;
  //for least of 3
  //const targetSkills = skills.slice(0,3);

  for (const raw of targetSkills) {
    const skill = raw.trim();
    if (!skill) continue;

    // Cache check
    const cached = ytCache.get(skill);
    if (cached && Date.now() - cached.at < YT_TTL_MS) {
      out.push(...cached.items);
      continue;
    }
    try {
      const q = encodeURIComponent(`${skill} tutorial`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&maxResults=${maxPerSkill}&q=${q}&key=${apiKey}`;
      const resp = await doFetch(url);
      if (!resp.ok) {
        const body = await resp.text();
        console.warn('YouTube API non-OK response', resp.status, body);
        // If quota exceeded, provide deterministic fallback links
        if (resp.status === 403 && body.includes('quotaExceeded')) {
          const fb = fallbackLearningResources([skill]);
          if (fb.length) {
            ytCache.set(skill, { at: Date.now(), items: fb });
            out.push(...fb);
          }
        }
        continue;
      }
      const data: any = await resp.json();
      const items: any[] = Array.isArray(data.items) ? data.items : [];
      const collected: { skill: string; title: string; url: string }[] = [];
      for (const it of items) {
        const title = it?.snippet?.title as string;
        const vid = it?.id?.videoId as string;
        if (title && vid) collected.push({ skill, title, url: `https://www.youtube.com/watch?v=${vid}` });
      }
      if (collected.length) {
        ytCache.set(skill, { at: Date.now(), items: collected });
        out.push(...collected);
      }
    } catch (e) {
      console.warn('YouTube API fetch error for skill', skill, e);
    }
  }
  return out;
}

router.get('/matches', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user!.userId;
    // Get user's skills
    const profile = await prisma.profile.findUnique({ where: { userId }, include: { skills: true } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    const skills = profile.skills.map((s) => s.name);
    if (!skills.length) {
      // Fallback: return recent jobs if no skills yet
      const recent = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
      return res.json({ jobs: recent.map(j => ({ ...j, similarity: null })) });
    }

    // Create embedding of user skills
    const embedding = await embedSkills(skills);
    const literal = vectorLiteral(embedding);

    // Use pgvector cosine distance operator <=> to find closest jobs
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, title, company, description, location, url, "createdAt",
               1 - (embedding <=> '${literal}'::vector) AS similarity
        FROM "Job"
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> '${literal}'::vector ASC
        LIMIT 20`
    );
    if (!rows || rows.length === 0) {
      // Fallback to recent jobs if no vector matches
      const recent = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
      return res.json({ jobs: recent.map(j => ({ ...j, similarity: null })) });
    }
    return res.json({ jobs: rows });
  } catch (err: any) {
    console.error('matches error:', err);
    try {
      // Final fallback: recent jobs
      const recent = await prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
      return res.json({ jobs: recent.map(j => ({ ...j, similarity: null })) });
    } catch (_e) {
      return res.status(500).json({ error: err?.message || 'Failed to fetch matches' });
    }
  }
});

// GET /api/jobs/:jobId/skill-gap (protected)
router.get('/:jobId/skill-gap', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user!.userId;
    const jobId = String(req.params.jobId);

    const [profile, job] = await Promise.all([
      prisma.profile.findUnique({ where: { userId }, include: { skills: true } }),
      prisma.job.findUnique({ where: { id: jobId } })
    ]);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const userSkills = profile.skills.map(s => normalizeSkill(s.name)).filter(Boolean);
    const jobSkills = extractJobSkillsFromDescription(job.description || '', userSkills);

    // If we couldn't extract any job skills, treat as 0 required to avoid division by zero
    const requiredCount = jobSkills.length;
    const matchingSkills = jobSkills.filter(js => userSkills.includes(js));
    const missingSkills = jobSkills.filter(js => !userSkills.includes(js));

    const score = requiredCount > 0 ? Math.round((matchingSkills.length / requiredCount) * 100) : 0;

    const learningResources = await fetchYouTubeLearningResources(missingSkills, 1);

    return res.json({
      jobId,
      score,
      matchingSkills,
      missingSkills,
      learningResources
    });
  } catch (err: any) {
    console.error('skill-gap error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to compute skill gap' });
  }
});

export default router;
