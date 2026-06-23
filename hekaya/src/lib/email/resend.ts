import { Resend } from "resend";

// Server-only. Throws at boot if the key is missing in production.
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM = process.env.EMAIL_FROM ?? "Mashaer <onboarding@resend.dev>";
export const REPLY_TO = process.env.EMAIL_REPLY_TO;
export const ADMIN_ALERT = process.env.ADMIN_ALERT_EMAIL;
