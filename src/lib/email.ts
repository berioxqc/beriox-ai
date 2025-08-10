import nodemailer from "nodemailer";
import { Resend } from "resend";

type EmailArgs = { to?: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailArgs) {
  const provider = process.env.EMAIL_PROVIDER || "resend";
  const recipient = to || process.env.EMAIL_DEFAULT_TO;

  if (provider === "resend") {
    const key = process.env.RESEND_API_KEY;
    if (!key || !recipient) return;
    const resend = new Resend(key);
    await resend.emails.send({ from: "no-reply@beriox.ai", to: recipient, subject, html });
    return;
  }

  if (provider === "smtp") {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env as any;
    if (!SMTP_HOST || !SMTP_PORT || !recipient) return;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
    await transporter.sendMail({ from: "no-reply@beriox.ai", to: recipient, subject, html });
  }
}


