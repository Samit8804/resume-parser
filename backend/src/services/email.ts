import nodemailer from "nodemailer";
import { prisma } from "../index";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export function replaceTemplateVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

export async function sendEmail(params: {
  subject: string;
  body: string;
  recipient: string;
  senderId: string;
  candidateId?: string;
  jobId?: string;
  scheduledAt?: Date;
}) {
  const email = await prisma.email.create({
    data: {
      subject: params.subject,
      body: params.body,
      recipient: params.recipient,
      senderId: params.senderId,
      candidateId: params.candidateId,
      jobId: params.jobId,
      status: params.scheduledAt ? "SCHEDULED" : "SENT",
      scheduledAt: params.scheduledAt,
      sentAt: params.scheduledAt ? undefined : new Date(),
    },
  });

  if (params.scheduledAt && params.scheduledAt > new Date()) {
    return email;
  }

  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"ResumeRank AI" <noreply@resumerank.ai>`,
        to: params.recipient,
        subject: params.subject,
        html: params.body,
      });
      await prisma.email.update({
        where: { id: email.id },
        data: { status: "SENT", deliveryStatus: "delivered", sentAt: new Date() },
      });
    } else {
      console.log(`[EMAIL] To: ${params.recipient} | Subject: ${params.subject}`);
      console.log(`[EMAIL] Body: ${params.body.substring(0, 200)}...`);
      await prisma.email.update({
        where: { id: email.id },
        data: { deliveryStatus: "logged" },
      });
    }
  } catch (err: any) {
    console.error("[EMAIL] Failed:", err.message);
    await prisma.email.update({
      where: { id: email.id },
      data: { status: "FAILED", deliveryStatus: err.message },
    });
  }

  return email;
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  return prisma.notification.create({ data: params });
}
