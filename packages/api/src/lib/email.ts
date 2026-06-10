import { env } from "@pram/env/server";
import nodemailer from "nodemailer";

const smtpConfigured =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM;

if (!smtpConfigured) {
  console.warn(
    "[email] SMTP not configured — email features (verification, password reset) will be disabled. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM in apps/server/.env to enable."
  );
}

const smtpPort = Number(env.SMTP_PORT) || 587;
const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

const subjects: Record<string, string> = {
  "email-verification": "Verifikasi Email Pram",
  "forget-password": "Reset Password Pram",
};

const messages: Record<string, string> = {
  "email-verification": "Gunakan kode berikut untuk memverifikasi email Anda:",
  "forget-password": "Gunakan kode berikut untuk mereset password Anda:",
};

type SendOtpEmailProps = {
  to: string;
  otp: string;
  type: "email-verification" | "forget-password";
};

export async function sendOtpEmail({ to, otp, type }: SendOtpEmailProps) {
  if (!transporter) {
    console.warn(`[email] Skipping OTP email to ${to} — SMTP not configured.`);
    return;
  }

  const subject = subjects[type] || "Kode Verifikasi Pram";
  const message = messages[type] || "Kode verifikasi Anda:";

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Pram</h2>
        <p>${message}</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Kode berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.</p>
      </div>
    `,
  });
}
