import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { authMiddleware } from "../middleware/auth";
import { sendEmail, replaceTemplateVariables } from "../services/email";

const router = Router();

router.use(authMiddleware);

const sendSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  recipient: z.string().email(),
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  scheduledAt: z.string().optional(),
});

router.post("/send", async (req: Request, res: Response) => {
  try {
    const data = sendSchema.parse(req.body);
    const email = await sendEmail({
      ...data,
      senderId: req.user!.id,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    });
    res.json(email);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const { candidateIds, subject, body, scheduledAt } = req.body;
    if (!candidateIds?.length || !subject || !body) {
      return res.status(400).json({ error: "candidateIds, subject, body required" });
    }
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      include: { job: true },
    });
    if (!candidates.length) return res.status(404).json({ error: "No candidates found" });

    const results = [];
    for (const c of candidates) {
      if (!c.email) continue;
      const vars: Record<string, string> = {
        candidateName: c.name,
        jobTitle: c.job?.title || "",
      };
      const email = await sendEmail({
        subject: replaceTemplateVariables(subject, vars),
        body: replaceTemplateVariables(body, vars),
        recipient: c.email,
        senderId: req.user!.id,
        candidateId: c.id,
        jobId: c.jobId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });
      results.push(email);
    }
    res.json({ sent: results.length, total: candidates.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.query;
    const where: any = {};
    if (candidateId) where.candidateId = candidateId as string;
    if (jobId) where.jobId = jobId as string;
    const emails = await prisma.email.findMany({
      where,
      include: { candidate: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(emails);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics", async (_req: Request, res: Response) => {
  try {
    const total = await prisma.email.count();
    const sent = await prisma.email.count({ where: { status: "SENT" } });
    const failed = await prisma.email.count({ where: { status: "FAILED" } });
    const scheduled = await prisma.email.count({ where: { status: "SCHEDULED" } });
    const opened = await prisma.email.count({ where: { openStatus: true } });
    res.json({
      total,
      sent,
      failed,
      scheduled,
      opened,
      deliveryRate: total ? ((sent / total) * 100).toFixed(1) : "0",
      openRate: sent ? ((opened / sent) * 100).toFixed(1) : "0",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/templates", async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/templates", async (req: Request, res: Response) => {
  try {
    const { name, subject, body, category } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: "name, subject, body required" });
    const template = await prisma.emailTemplate.create({
      data: { name, subject, body, category: category || "custom" },
    });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, subject, body, category } = req.body;
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, body, category },
    });
    res.json(template);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/templates/:id", async (req: Request, res: Response) => {
  try {
    await prisma.emailTemplate.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/templates/seed", async (_req: Request, res: Response) => {
  const defaults = [
    {
      name: "Application Received",
      subject: "Application Received - {{jobTitle}} at {{companyName}}",
      body: `<h2>Hi {{candidateName}},</h2><p>Thank you for applying to the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p><p>We have received your application and our team will review it shortly.</p><p>You can track your application status here: <a href="{{applicationLink}}">{{applicationLink}}</a></p><br/><p>Best regards,<br/>{{companyName}} Recruitment Team</p>`,
      category: "application",
    },
    {
      name: "Shortlisted",
      subject: "Congratulations! You're Shortlisted for {{jobTitle}}",
      body: `<h2>Hi {{candidateName}},</h2><p>Congratulations! Based on your profile, you have been <strong>shortlisted</strong> for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p><p>Our recruitment team will reach out to you shortly to schedule the next steps.</p><br/><p>Best regards,<br/>{{companyName}} Recruitment Team</p>`,
      category: "shortlist",
    },
    {
      name: "Rejected",
      subject: "Update on your application for {{jobTitle}}",
      body: `<h2>Hi {{candidateName}},</h2><p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p><p>After careful review, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our requirements.</p><p>We wish you the best in your job search.</p><br/><p>Best regards,<br/>{{companyName}} Recruitment Team</p>`,
      category: "rejection",
    },
    {
      name: "Interview Invite",
      subject: "Interview Invitation for {{jobTitle}} at {{companyName}}",
      body: `<h2>Hi {{candidateName}},</h2><p>We are pleased to invite you for an interview for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p><p><strong>Date:</strong> {{interviewDate}}<br/><strong>Time:</strong> {{interviewTime}}</p><p>Please confirm your availability at your earliest convenience.</p><br/><p>Best regards,<br/>{{recruiterName}}<br/>{{companyName}} Recruitment Team</p>`,
      category: "interview",
    },
    {
      name: "Offer Letter",
      subject: "Offer Letter - {{jobTitle}} at {{companyName}}",
      body: `<h2>Hi {{candidateName}},</h2><p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p><p>Please find attached the official offer letter with details regarding compensation, benefits, and start date.</p><p>We look forward to welcoming you to the team!</p><br/><p>Best regards,<br/>{{recruiterName}}<br/>{{companyName}}</p>`,
      category: "offer",
    },
  ];

  for (const t of defaults) {
    const existing = await prisma.emailTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.emailTemplate.create({ data: t });
    }
  }
  const all = await prisma.emailTemplate.findMany();
  res.json(all);
});

export default router;
