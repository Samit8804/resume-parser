import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { authMiddleware } from "../middleware/auth";
import { parseResume } from "../services/parser";
import { matchCandidate, JobRequirements } from "../services/matcher";

const router = Router();

router.use(authMiddleware);

router.post("/:candidateId", async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params as { candidateId: string };
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: { include: { skills: true } } },
    });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    if (!candidate.rawResumePath) return res.status(400).json({ error: "No resume file found" });
    if (!candidate.job) return res.status(400).json({ error: "Candidate has no associated job" });

    const parsed = await parseResume(candidate.rawResumePath);

    const job: JobRequirements = {
      title: candidate.job.title,
      skills: candidate.job.skills.map((s: any) => ({
        name: s.name,
        isRequired: s.isRequired,
        category: s.category || undefined,
      })),
      experienceMin: candidate.job.experienceMin || undefined,
      experienceMax: candidate.job.experienceMax || undefined,
      education: candidate.job.education || undefined,
      description: candidate.job.description || undefined,
    };

    const match = matchCandidate(parsed, job);

    const updated = await prisma.candidate.update({
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
          create: parsed.skills.map(s => ({
            name: s.name,
            category: s.category,
            level: s.level,
          })),
        },
        projects: {
          deleteMany: {},
          create: parsed.projects.map(p => ({
            name: p.name,
            techStack: p.techStack,
            description: p.description,
            link: p.link,
          })),
        },
        certifications: {
          deleteMany: {},
          create: parsed.certifications.map(c => ({
            name: c.name,
            issuer: c.issuer,
            year: c.year || undefined,
          })),
        },
      },
      include: { skills: true, projects: true, certifications: true },
    });

    res.json({ candidate: updated, match, parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

router.post("/match", async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId || !jobId) {
      return res.status(400).json({ error: "candidateId and jobId are required" });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { skills: true, projects: true, certifications: true },
    });
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: true },
    });

    if (!candidate || !job) {
      return res.status(404).json({ error: "Candidate or Job not found" });
    }

    const parsed: any = {
      name: candidate.name,
      email: candidate.email || "",
      phone: candidate.phone || "",
      linkedIn: candidate.linkedIn || "",
      github: candidate.github || "",
      portfolio: candidate.portfolio || "",
      address: "",
      experience: candidate.experience || 0,
      education: candidate.education || "",
      currentCompany: candidate.currentCompany || "",
      currentTitle: candidate.currentTitle || "",
      skills: (candidate.skills || []).map(s => ({ name: s.name, category: s.category || "", level: s.level || "beginner" })),
      projects: (candidate.projects || []).map(p => ({ name: p.name, techStack: p.techStack || "", description: p.description || "", link: p.link || "" })),
      certifications: (candidate.certifications || []).map(c => ({ name: c.name, issuer: c.issuer || "", year: c.year || 0 })),
      summary: candidate.aiSummary || "",
      rawText: "",
      confidence: candidate.confidenceScore || 70,
    };

    const jobReq: JobRequirements = {
      title: job.title,
      skills: job.skills.map(s => ({ name: s.name, isRequired: s.isRequired, category: s.category || undefined })),
      experienceMin: job.experienceMin || undefined,
      experienceMax: job.experienceMax || undefined,
      education: job.education || undefined,
      description: job.description || undefined,
    };

    const match = matchCandidate(parsed, jobReq);
    res.json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Matching failed" });
  }
});

export default router;