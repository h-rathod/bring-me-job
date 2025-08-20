import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { parseResumeToProfile } from '../services/geminiService';
import prisma from '../lib/prisma';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).user!.userId;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { skills: true },
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({
      fullName: profile.fullName,
      headline: profile.headline || '',
      skills: profile.skills.map((s) => s.name),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/upload-resume', requireAuth, upload.single('resume'), async (req: AuthedRequest & { file?: Express.Multer.File }, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: 'Only PDF files are supported at the moment' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text || '';

    const parsed = await parseResumeToProfile(text);
    const userId = (req as AuthedRequest).user!.userId;

    // Ensure profile exists
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName: parsed.fullName || undefined,
        headline: parsed.headline || undefined,
      },
      create: {
        userId,
        fullName: parsed.fullName || 'Unknown',
        headline: parsed.headline || '',
      },
    });

    // Replace skills
    await prisma.skill.deleteMany({ where: { profileId: profile.id } });
    const skills = (parsed.skills || []).slice(0, 50); // sanity cap
    if (skills.length) {
      await prisma.skill.createMany({
        data: skills.map((name: string) => ({ profileId: profile.id, name })),
        skipDuplicates: true,
      });
    }

    const updated = await prisma.profile.findUnique({ where: { id: profile.id }, include: { skills: true } });
    res.json({
      message: 'Resume parsed and profile updated',
      profile: {
        fullName: updated?.fullName,
        headline: updated?.headline,
        skills: updated?.skills.map((s) => s.name) || [],
      },
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max 5MB.' });
    }
    const msg = (typeof err?.message === 'string' && err.message.includes('GEMINI_API_KEY'))
      ? 'Server is missing GEMINI_API_KEY. Please configure the API key.'
      : (typeof err?.message === 'string' ? err.message : 'Failed to process resume');
    res.status(500).json({ error: msg });
  }
});

export default router;
