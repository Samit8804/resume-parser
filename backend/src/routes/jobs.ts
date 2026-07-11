import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { authMiddleware } from "../middleware/auth";
import { generateSlug } from "../utils/slug";

const router = Router();

const createJobSchema = z.object({
  title: z.string().min(1),
  department: z.string().optional(),
  type: z.string().optional(),
  experienceMin: z.number().optional(),
  experienceMax: z.number().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  deadline: z.string().optional(),
  education: z.string().optional(),
  applicationMethod: z.enum(["PUBLIC_LINK", "MANUAL_UPLOAD", "BOTH"]).optional(),
  skills: z.array(z.object({ name: z.string(), isRequired: z.boolean().default(true), category: z.string().optional() })).optional(),
});

router.use(authMiddleware);

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createJobSchema.parse(req.body);
    const baseSlug = generateSlug(data.title);
    const existing = await prisma.job.findFirst({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const job = await prisma.job.create({
      data: {
        title: data.title,
        slug,
        department: data.department,
        type: data.type,
        experienceMin: data.experienceMin,
        experienceMax: data.experienceMax,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        location: data.location,
        description: data.description,
        responsibilities: data.responsibilities,
        benefits: data.benefits,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        education: data.education,
        applicationMethod: data.applicationMethod || "BOTH",
        creatorId: req.userId!,
        skills: data.skills ? { create: data.skills } : undefined,
      },
      include: { skills: true },
    });
    res.status(201).json(job);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { creatorId: req.userId },
      include: { skills: true, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const job = await prisma.job.findFirst({
      where: { id, creatorId: req.userId },
      include: { skills: true, candidates: { include: { skills: true, projects: true, certifications: true }, orderBy: { matchScore: "desc" } } },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const job = await prisma.job.findFirst({
      where: { id, creatorId: req.userId },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    const updated = await prisma.job.update({
      where: { id },
      data: req.body,
      include: { skills: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
