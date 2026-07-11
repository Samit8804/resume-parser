import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { prisma } from "../index";
import { parseResume } from "../services/parser";
import { matchCandidate, JobRequirements } from "../services/matcher";
import { sendEmail, replaceTemplateVariables, createNotification } from "../services/email";

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "public-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Unsupported file type. Only PDF and DOCX are allowed."));
  },
});

const applySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  currentCompany: z.string().optional(),
  currentCtc: z.coerce.number().optional(),
  expectedCtc: z.coerce.number().optional(),
  noticePeriod: z.string().optional(),
  coverLetter: z.string().optional(),
});

router.get("/jobs/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const job = await prisma.job.findFirst({
      where: { slug, status: "ACTIVE" },
      include: { skills: true, company: true },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    const { creatorId, ...safe } = job;
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/jobs", async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true, title: true, slug: true, department: true,
        type: true, location: true, description: true,
        experienceMin: true, experienceMax: true,
        salaryMin: true, salaryMax: true,
        benefits: true, deadline: true, company: true,
        skills: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/jobs/:slug/apply", upload.single("resume"), async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const data = applySchema.parse(req.body);

    const job = await prisma.job.findFirst({
      where: { slug, status: "ACTIVE" },
      include: { skills: true, company: true, creator: true },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const file = req.file;
    let rawResumePath: string | undefined;
    if (file) {
      rawResumePath = file.path;
    }

    const candidate = await prisma.candidate.create({
      data: {
        jobId: job.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        linkedIn: data.linkedIn,
        github: data.github,
        portfolio: data.portfolio,
        currentCompany: data.currentCompany,
        currentCtc: data.currentCtc,
        expectedCtc: data.expectedCtc,
        noticePeriod: data.noticePeriod,
        coverLetter: data.coverLetter,
        source: "PUBLIC_APPLICATION",
        status: "APPLIED",
        rawResumePath,
      },
    });

    if (rawResumePath) {
      try {
        const parsed = await parseResume(rawResumePath);
        const jd: JobRequirements = {
          title: job.title,
          skills: job.skills.map((s: any) => ({
            name: s.name,
            isRequired: s.isRequired,
            category: s.category || undefined,
          })),
          experienceMin: job.experienceMin || undefined,
          experienceMax: job.experienceMax || undefined,
          education: job.education || undefined,
          description: job.description || undefined,
        };
        const match = await matchCandidate(parsed, jd);

        await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            name: parsed.name || candidate.name,
            email: parsed.email || candidate.email,
            phone: parsed.phone || candidate.phone,
            linkedIn: parsed.linkedIn || candidate.linkedIn,
            github: parsed.github || candidate.github,
            portfolio: parsed.portfolio || candidate.portfolio,
            currentCompany: parsed.currentCompany || candidate.currentCompany,
            experience: parsed.experience,
            education: parsed.education || candidate.education,
            aiSummary: parsed.summary,
            matchScore: match.overallScore,
            confidenceScore: match.confidenceScore,
            strengths: match.strengths?.join("\n"),
            weaknesses: match.weaknesses?.join("\n"),
            verdict: match.verdict,
            parsedData: parsed as any,
          },
        });

        if (parsed.skills?.length) {
          await prisma.candidateSkill.createMany({
            data: parsed.skills.map((s: any) => ({
              candidateId: candidate.id,
              name: typeof s === "string" ? s : s.name,
              category: s.category,
              yearsOfExperience: s.yearsOfExperience,
              level: s.level,
            })),
          });
        }
        if (parsed.projects?.length) {
          await prisma.candidateProject.createMany({
            data: parsed.projects.map((p: any) => ({
              candidateId: candidate.id,
              name: p.name || p,
              techStack: p.techStack,
              description: p.description,
              link: p.link,
            })),
          });
        }
        if (parsed.certifications?.length) {
          await prisma.candidateCertification.createMany({
            data: parsed.certifications.map((c: any) => ({
              candidateId: candidate.id,
              name: typeof c === "string" ? c : c.name,
              issuer: c.issuer,
              year: c.year,
            })),
          });
        }
      } catch (parseErr: any) {
        console.error("Auto-parse failed:", parseErr.message);
      }
    }

    const template = await prisma.emailTemplate.findFirst({
      where: { name: "Application Received" },
    });

    if (template && data.email) {
      const vars: Record<string, string> = {
        candidateName: data.name,
        jobTitle: job.title,
        companyName: job.company?.name || "Company",
        applicationLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/jobs/${slug}`,
      };
      await sendEmail({
        subject: replaceTemplateVariables(template.subject, vars),
        body: replaceTemplateVariables(template.body, vars),
        recipient: data.email,
        senderId: job.creatorId,
        candidateId: candidate.id,
        jobId: job.id,
      });
    }

    await createNotification({
      userId: job.creatorId,
      title: "New Application",
      message: `${data.name} applied for ${job.title}`,
      type: "application",
      link: `/dashboard/candidates/${candidate.id}`,
    });

    res.status(201).json({ success: true, candidateId: candidate.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
