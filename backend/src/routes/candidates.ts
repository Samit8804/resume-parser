import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { jobId, search, status, minScore, maxScore } = req.query;
    const where: any = { job: { creatorId: req.userId } };

    if (jobId) where.jobId = jobId as string;
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }
    if (minScore) where.matchScore = { ...where.matchScore, gte: parseFloat(minScore as string) };
    if (maxScore) where.matchScore = { ...where.matchScore, lte: parseFloat(maxScore as string) };

    const candidates = await prisma.candidate.findMany({
      where,
      include: { skills: true, projects: true, certifications: true, notes: true },
      orderBy: { matchScore: "desc" },
    });
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const candidate = await prisma.candidate.findFirst({
      where: { id, job: { creatorId: req.userId } },
      include: {
        skills: true,
        projects: true,
        certifications: true,
        notes: { include: { author: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
        pipelineLogs: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id, job: { creatorId: req.userId } } });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const updated = await prisma.candidate.update({
      where: { id },
      data: { status },
    });

    await prisma.pipelineLog.create({
      data: {
        candidateId: id,
        fromStatus: candidate.status,
        toStatus: status,
        changedById: req.userId,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/notes", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const candidate = await prisma.candidate.findFirst({ where: { id, job: { creatorId: req.userId } } });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    const note = await prisma.note.create({
      data: { content: req.body.content, candidateId: id, authorId: req.userId! },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
