"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Inbox, LockKeyhole, Mail, MessageCircle, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/useT";
import { BESPOKE_STATUSES, BUDGETS, PIECES, optionLabel, type StoredBespokeBrief, type BespokeStatus } from "@/lib/bespoke";
import { formatDate, whatsappUrl } from "@/lib/utils";
import { emirateLabel } from "@/lib/emirates";

type CustomRequest = StoredBespokeBrief & { id: string; reference: string; createdAt: string };
export default function CustomRequests() {
  const { locale } = useT();
  const ar = locale === "ar";
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const load = useCallback(async (nextPage = 0) => {
    setLoading(true); setFailed(false);
    try {
      const response = await fetch(`/api/admin/custom-requests?page=${nextPage}`, { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const data = await response.json();
      const linkedId = !nextPage ? new URLSearchParams(window.location.search).get("request") : null;
      if (linkedId && !data.requests.some((request: CustomRequest) => request.id === linkedId)) {
        const linked = await fetch(`/api/admin/custom-requests?request=${encodeURIComponent(linkedId)}`, { cache: "no-store" });
        if (linked.ok) {
          const details = await linked.json();
          data.requests = [...data.requests, ...details.requests];
        }
      }
      setRequests((current) => nextPage ? [...current, ...data.requests.filter((request: CustomRequest) => !current.some((item) => item.id === request.id))] : data.requests);
      setHasMore(data.hasMore); setPage(nextPage);
      if (!nextPage) setSelected((current) => current || new URLSearchParams(window.location.search).get("request") || data.requests[0]?.id || "");
    } catch { setFailed(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const visible = requests.filter((request) => (!filter || request.status === filter) && `${request.name} ${request.phone} ${request.email} ${request.reference}`.toLowerCase().includes(query.toLowerCase()));
  const active = visible.find((request) => request.id === selected) ?? visible[0];
  async function update(status: BespokeStatus) {
    if (!active) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/custom-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, status }) });
      if (!response.ok) throw new Error("save");
      setRequests((current) => current.map((request) => request.id === active.id ? { ...request, status } : request));
      toast.success(ar ? "تم تحديث حالة الطلب" : "Request status updated");
    } catch { toast.error(ar ? "تعذّر حفظ الحالة. حدّث القائمة وحاول مجددًا." : "Couldn't save the status. Refresh and try again."); }
    finally { setSaving(false); }
  }
  async function retryNotification() {
    if (!active) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/custom-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, action: "notify" }) });
      if (!response.ok) throw new Error("notify");
      setRequests((current) => current.map((request) => request.id === active.id ? { ...request, notificationStatus: "sent" } : request));
      toast.success(ar ? "تم إرسال التنبيه" : "Notification sent");
    } catch { toast.error(ar ? "تعذّر إرسال التنبيه. راجع إعدادات البريد؛ الطلب محفوظ هنا." : "Couldn't send the notification. Check email settings; the request is saved here."); }
    finally { setSaving(false); }
  }
  const whatsapp = active ? whatsappUrl(active.phone, ar ? `مرحبًا ${active.name}، معك فريق مشاعر بخصوص طلب التصميم الخاص ${active.reference}.` : `Hello ${active.name}, this is the Mashaer team about your custom request ${active.reference}.`) : null;
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-3xl text-white sm:text-4xl">{ar ? "طلبات التصميم الخاص" : "Custom Requests"}</h1><p className="mt-2 flex items-center gap-2 text-xs leading-6 text-white/50"><LockKeyhole size={14} />{ar ? "طلبات العملاء وصورهم خاصة. فتح التفاصيل والصور يحتاج تسجيل دخول صاحب المتجر." : "Customer requests and images are private. Viewing details or images requires the store owner's login."}</p></div><button onClick={() => void load()} disabled={loading} className="flex items-center gap-2 rounded border border-white/15 px-4 py-3 text-xs text-white/70 disabled:opacity-40"><RefreshCw size={14} />{ar ? "تحديث" : "Refresh"}</button></div>
    <div className="mt-7 flex flex-wrap gap-3"><label className="relative block min-w-52 flex-1"><Search className="absolute start-3 top-3.5 text-white/40" size={16} /><span className="sr-only">{ar ? "ابحث في الطلبات" : "Search requests"}</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ar ? "الاسم، الهاتف، أو رقم الطلب" : "Name, phone, or reference"} className="w-full rounded border border-white/10 bg-[#151515] py-3 pe-3 ps-10 text-sm text-white" /></label><select aria-label={ar ? "تصفية حسب الحالة" : "Filter by status"} value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border border-white/10 bg-[#151515] px-4 py-3 text-xs text-white"><option value="">{ar ? "كل الحالات" : "All statuses"}</option>{BESPOKE_STATUSES.map((status) => <option key={status.id} value={status.id}>{status[locale]}</option>)}</select></div>
    {failed && <p role="alert" className="mt-5 border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200">{ar ? "تعذّر تحميل الطلبات. يمكنك إعادة المحاولة بزر التحديث." : "Couldn't load requests. Use Refresh to try again."}</p>}
    {loading && !requests.length ? <p role="status" className="py-20 text-center text-sm text-white/50">{ar ? "نحمّل الطلبات…" : "Loading requests…"}</p> : !requests.length && !failed ? <div className="mt-8 flex flex-col items-center gap-4 rounded border border-white/10 py-20 text-center text-white/40"><Inbox size={36} strokeWidth={1} /><h2 className="text-lg text-white/70">{ar ? "مساحة لأفكار جديدة" : "A space for new ideas"}</h2><p className="max-w-md px-4 text-sm leading-7">{ar ? "عندما يرسل عميل طلب تصميم خاص، ستجد فكرته وصوره وبيانات التواصل هنا." : "When a customer sends a custom request, their idea, references and contact details appear here."}</p><Link href="/bespoke" className="border-b border-[#c9a96e]/50 pb-1 text-xs text-[#c9a96e]">{ar ? "عرض تجربة العميل" : "View the customer experience"}</Link></div> : <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
      <div className="space-y-2">{visible.length === 0 && <p className="py-8 text-sm text-white/40">{ar ? "لا توجد نتائج مطابقة." : "No matching requests."}</p>}{visible.map((request) => <button key={request.id} onClick={() => setSelected(request.id)} className={`w-full rounded border p-4 text-start transition ${active?.id === request.id ? "border-[#c9a96e]/60 bg-[#c9a96e]/10" : "border-white/10 bg-[#151515] hover:border-white/30"}`}><div className="flex justify-between gap-3"><strong className="text-sm font-medium text-white">{request.name}</strong><span className="text-[10px] text-[#c9a96e]">{optionLabel(BESPOKE_STATUSES, request.status, locale)}</span></div><p className="mt-2 text-xs text-white/40">{request.reference} · {formatDate(request.createdAt, locale)}</p><p className="mt-3 line-clamp-2 text-xs leading-6 text-white/60">{request.idea}</p></button>)}{hasMore && <button disabled={loading} onClick={() => void load(page + 1)} className="w-full p-4 text-xs text-[#c9a96e]">{ar ? "تحميل المزيد" : "Load more"}</button>}</div>
      {active ? <article className="min-w-0 rounded border border-white/10 bg-[#151515] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-[#c9a96e]" dir="ltr">{active.reference}</p><h2 className="mt-2 text-2xl text-white">{active.name}</h2><p className="mt-2 text-xs text-white/40">{formatDate(active.createdAt, locale)}</p></div><label className="text-xs text-white/50">{ar ? "حالة الطلب" : "Request status"}<select value={active.status} onChange={(e) => void update(e.target.value as BespokeStatus)} disabled={saving} className="mt-2 block rounded border border-white/15 bg-[#202020] p-2.5 text-white">{BESPOKE_STATUSES.map((status) => <option key={status.id} value={status.id}>{status[locale]}</option>)}</select></label></div>
        {(active.notificationStatus === "failed" || active.notificationStatus === "pending") && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-amber-200/15 bg-amber-200/5 p-3 text-xs leading-6 text-amber-100/70"><p>{active.notificationStatus === "failed" ? (ar ? "تعذّر إرسال تنبيه البريد. الطلب محفوظ هنا." : "The email notification couldn't be sent. This request is safely saved here.") : (ar ? "حالة تنبيه البريد غير مؤكدة. الطلب محفوظ هنا." : "Email notification status is unconfirmed. This request is saved here.")}</p><button disabled={saving} onClick={() => void retryNotification()} className="border-b border-amber-100/40 disabled:opacity-40">{ar ? "إعادة إرسال التنبيه" : "Retry notification"}</button></div>}
        <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-white/10 py-5 text-xs"><dt className="text-white/40">{ar ? "القطعة" : "Piece"}</dt><dd className="text-white/80">{optionLabel(PIECES, active.piece, locale)}</dd><dt className="text-white/40">{ar ? "الميزانية" : "Budget"}</dt><dd className="text-white/80">{optionLabel(BUDGETS, active.budget, locale)}</dd><dt className="text-white/40">{ar ? "التواصل المفضّل" : "Preferred contact"}</dt><dd className="text-white/80">{active.contactMethod === "whatsapp" ? "WhatsApp" : "Email"}</dd>{active.occasion && <><dt className="text-white/40">{ar ? "المناسبة" : "Occasion"}</dt><dd className="text-white/80">{active.occasion}</dd></>}{active.desiredDate && <><dt className="text-white/40">{ar ? "الموعد المطلوب" : "Requested date"}</dt><dd className="text-white/80">{active.desiredDate}</dd></>}{active.emirate && <><dt className="text-white/40">{ar ? "الإمارة" : "Emirate"}</dt><dd className="text-white/80">{emirateLabel(active.emirate, locale)}</dd></>}</dl>
        <h3 className="mt-6 text-sm text-[#c9a96e]">{ar ? "فكرة العميل" : "Customer's idea"}</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-8 text-white/80">{active.idea}</p>{active.productSlug && <Link href={`/product/${encodeURIComponent(active.productSlug)}`} target="_blank" className="mt-4 inline-block border-b border-[#c9a96e]/40 text-xs text-[#c9a96e]">{ar ? "القطعة التي ألهمت العميل" : "The customer's starting piece"}</Link>}
        {active.references.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{active.references.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded border border-white/10"><Image src={url} alt={ar ? `مرجع خاص ${index + 1}` : `Private reference ${index + 1}`} width={350} height={350} unoptimized className="aspect-square w-full object-cover" /></a>)}</div>}
        <div className="mt-8 border-t border-white/10 pt-5"><p className="text-xs text-white/40">{ar ? "التواصل بشأن هذا الطلب" : "Discuss this request"}</p><p className="mt-3 text-sm text-white/70" dir="ltr">{active.phone}{active.email ? ` · ${active.email}` : ""}</p><div className="mt-4 flex flex-wrap gap-3">{whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded border border-[#c9a96e]/40 px-4 py-3 text-xs text-[#c9a96e]"><MessageCircle size={15} />{ar ? "فتح محادثة واتساب" : "Open WhatsApp conversation"}</a>}{active.email && <a href={`mailto:${active.email}?subject=${encodeURIComponent(`Mashaer · ${active.reference}`)}`} className="flex items-center gap-2 rounded border border-white/15 px-4 py-3 text-xs text-white/70"><Mail size={15} />{ar ? "الرد بالبريد" : "Reply by email"}</a>}</div></div>
      </article> : <div className="p-10 text-center text-sm text-white/40">{ar ? "اختر طلبًا للاطّلاع على تفاصيله." : "Select a request to view its details."}</div>}
    </div>}
  </>;
}
