import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { parseResume } from "../services/parser";
import { matchCandidate, JobRequirements } from "../services/matcher";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only PDF and DOCX are allowed."));
    }
  },
});

router.use(authMiddleware);

async function autoAnalyze(candidateId: string, jobId: string) {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { skills: true } });
    if (!candidate || !job || !candidate.rawResumePath) return;

    const parsed = await parseResume(candidate.rawResumePath);
    const jobReq: JobRequirements = {
      title: job.title,
      skills: job.skills.map(s => ({ name: s.name, isRequired: s.isRequired, category: s.category || undefined })),
      experienceMin: job.experienceMin || undefined,
      experienceMax: job.experienceMax || undefined,
      education: job.education || undefined,
    };

    const match = matchCandidate(parsed, jobReq);

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        name: parsed.name || candidate.name,
        email: parsed.email || candidate.email,
        phone: parsed.phone || undefined,
        linkedIn: parsed.linkedIn || undefined,
        github: parsed.github || undefined,
        portfolio: parsed.portfolio || undefined,
        experience: parsed.experience || undefined,
        education: parsed.education || undefined,
        currentCompany: parsed.currentCompany || undefined,
        currentTitle: parsed.currentTitle || undefined,
        matchScore: match.overallScore,
        confidenceScore: match.confidenceScore,
        aiSummary: parsed.summary,
        strengths: JSON.stringify(match.strengths),
        weaknesses: JSON.stringify(match.weaknesses),
        verdict: match.verdict,
        parsedData: parsed as any,
        skills: {
          deleteMany: {},
          create: parsed.skills.map(s => ({ name: s.name, category: s.category, level: s.level })),
        },
        projects: {
          deleteMany: {},
          create: parsed.projects.map(p => ({ name: p.name, techStack: p.techStack, description: p.description, link: p.link })),
        },
        certifications: {
          deleteMany: {},
          create: parsed.certifications.map(c => ({ name: c.name, issuer: c.issuer, year: c.year || undefined })),
        },
      },
    });
  } catch (err) {
    console.error("Auto-analysis failed for candidate", candidateId, err);
  }
}

router.post("/", upload.single("resume"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    const job = await prisma.job.findFirst({ where: { id: jobId, creatorId: req.userId } });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const candidate = await prisma.candidate.create({
      data: { jobId, name: "Processing...", rawResumePath: req.file.path, parsedData: {} },
    });

    autoAnalyze(candidate.id, jobId);

    res.status(201).json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.post("/bulk", upload.array("resumes", 100), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { jobId } = req.body;
    if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });
    if (!jobId) return res.status(400).json({ error: "jobId is required" });

    const job = await prisma.job.findFirst({ where: { id: jobId, creatorId: req.userId } });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const candidates = await Promise.all(
      files.map((file) =>
        prisma.candidate.create({
          data: { jobId, name: path.parse(file.originalname).name, rawResumePath: file.path, parsedData: {} },
        })
      )
    );

    candidates.forEach((c) => autoAnalyze(c.id, jobId));

    res.status(201).json({ count: candidates.length, candidates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
