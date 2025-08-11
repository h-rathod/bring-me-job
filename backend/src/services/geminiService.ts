import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getModel(genAI: GoogleGenerativeAI, model: string) {
  return genAI.getGenerativeModel({ model });
}

function truncate(input: string, maxChars = 15000) {
  if (!input) return '';
  return input.length > maxChars ? input.slice(0, maxChars) : input;
}

export async function parseResumeToProfile(text: string): Promise<{ fullName?: string; headline?: string; skills?: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = `Extract the following fields from the resume text. Return STRICT JSON only with keys: fullName (string), headline (string), skills (string[] of unique skill names). If missing, use empty values.\n\nResume Text:\n"""\n${truncate(text)}\n"""`;

  let modelName = DEFAULT_MODEL;
  try {
    const model = getModel(genAI, modelName);
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    return parseJson(content, text);
  } catch (err: any) {
    const msg = String(err?.message || '');
    const is429 = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
    const isAlreadyFlash = modelName.includes('flash');
    if (is429 && !isAlreadyFlash) {
      // Fallback to flash model
      modelName = 'gemini-2.5-flash';
      const model = getModel(genAI, modelName);
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      return parseJson(content, text);
    }
    throw err;
  }
}

function parseJson(content: string, originalText: string) {
  // Attempt to parse JSON safely
  try {
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const jsonStr = jsonStart >= 0 && jsonEnd >= 0 ? content.slice(jsonStart, jsonEnd + 1) : content;
    const parsed = JSON.parse(jsonStr);
    const skills: string[] = Array.isArray(parsed.skills)
      ? Array.from(new Set(parsed.skills.map((s: any) => String(s).trim()).filter(Boolean)))
      : [];
    return {
      fullName: parsed.fullName || '',
      headline: parsed.headline || '',
      skills,
    };
  } catch (_err) {
    // Fallback minimal extraction
    const firstLine = originalText.split('\n').map(l => l.trim()).filter(Boolean)[0] || '';
    return { fullName: firstLine.slice(0, 80), headline: '', skills: [] };
  }
}
