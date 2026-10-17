import "server-only";
import { resend, FROM, ADMIN_ALERT } from "./resend";
import { esc } from "./escape";
import { BUDGETS, PIECES, optionLabel, requestReference, type StoredBespokeBrief } from "@/lib/bespoke";

export async function sendBespokeAlert(id: string, brief: StoredBespokeBrief, origin: string): Promise<boolean> {
  if (!resend || !ADMIN_ALERT) return false;
  try {
    const site = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, "");
    const detail = `${site}/admin/custom-requests?request=${encodeURIComponent(id)}`;
    const { error } = await resend.emails.send({
      from: FROM, to: ADMIN_ALERT, ...(brief.email ? { replyTo: brief.email } : {}),
      subject: `طلب تصميم خاص ${requestReference(id)} — ${brief.name.replace(/[\r\n]/g, " ")}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.9;color:#30271f"><h1>فكرة جديدة لمشاعر</h1><p>${esc(requestReference(id))} · ${esc(brief.name)}</p><p><strong>القطعة:</strong> ${esc(optionLabel(PIECES, brief.piece, "ar"))}<br><strong>الميزانية:</strong> ${esc(optionLabel(BUDGETS, brief.budget, "ar"))}<br><strong>التواصل:</strong> ${esc(brief.phone)} ${esc(brief.email)}</p><p style="white-space:pre-wrap">${esc(brief.idea)}</p><p>الصور والتفاصيل الكاملة خاصة، وتظهر بعد تسجيل دخول صاحب المتجر.</p><a href="${esc(detail)}">فتح الطلب في لوحة المتجر</a></div>`,
    }, { idempotencyKey: `bespoke-alert-${id}` });
    return !error;
  } catch { return false; }
}
