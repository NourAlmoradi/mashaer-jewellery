"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "shipping", key: "policy_shipping" as const },
  { id: "returns", key: "policy_returns" as const },
  { id: "privacy", key: "policy_privacy" as const },
  { id: "terms", key: "policy_terms" as const },
] as const;
type Tab = (typeof TABS)[number]["id"];

function PoliciesInner() {
  const { t, locale } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("tab") as Tab) || "shipping";
  const [active, setActive] = useState<Tab>(initial);

  const setTab = (tab: Tab) => {
    setActive(tab);
    router.replace(`/policies?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="container-h py-14 lg:py-20">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">
        {t("policies_title")}
      </h1>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition",
              active === tab.id
                ? "text-[var(--color-primary-dark)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            {t(tab.key)}
            {active === tab.id && (
              <span className="absolute -bottom-px start-0 h-0.5 w-full bg-[var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>

      <article className="prose-h mt-8 max-w-3xl rounded-xl bg-white p-7 ring-1 ring-[var(--color-border)]">
        {active === "shipping" &&
          (locale === "ar" ? <ShippingAr /> : <ShippingEn />)}
        {active === "returns" &&
          (locale === "ar" ? <ReturnsAr /> : <ReturnsEn />)}
        {active === "privacy" &&
          (locale === "ar" ? <PrivacyAr /> : <PrivacyEn />)}
        {active === "terms" && (locale === "ar" ? <TermsAr /> : <TermsEn />)}
      </article>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense>
      <PoliciesInner />
    </Suspense>
  );
}

const ShippingAr = () => (
  <>
    <h2>الشحن والتوصيل</h2>
    <p>نقوم بشحن جميع طلبيات مشاعر بعناية فائقة ضمن صناديق هدية أنيقة.</p>
    <ul>
      <li>التوصيل داخل الإمارات: ٢ – ٤ أيام عمل.</li>
      <li>تحتسب رسوم الشحن حسب الإمارة عند إتمام الطلب.</li>
      <li>كل طلب مغلّف بصندوق هدية مع بطاقة ذكرى.</li>
    </ul>
  </>
);
const ShippingEn = () => (
  <>
    <h2>Shipping & Delivery</h2>
    <p>Every Mashaer order ships in our signature gift packaging.</p>
    <ul>
      <li>UAE delivery: 2 – 4 business days.</li>
      <li>Shipping is calculated by emirate at checkout.</li>
      <li>All orders include a gift box & memory card.</li>
    </ul>
  </>
);
const ReturnsAr = () => (
  <>
    <h2>الاستبدال والإرجاع</h2>
    <p>
      نظرًا للطابع الشخصي لقطعنا، جميع المبيعات نهائية ولا تقبل الإرجاع أو
      الاستبدال.
    </p>
    <ul>
      <li>يُرجى مراجعة المقاس والتفاصيل بعناية قبل إتمام الطلب.</li>
      <li>في حال وصول قطعة بها عيب تصنيع، تواصلي معنا خلال ٤٨ ساعة.</li>
    </ul>
  </>
);
const ReturnsEn = () => (
  <>
    <h2>Returns & Exchanges</h2>
    <p>
      Because every piece is personal, all sales are final — we do not accept
      returns or exchanges.
    </p>
    <ul>
      <li>Please review size and details carefully before ordering.</li>
      <li>
        If an item arrives with a manufacturing defect, contact us within 48
        hours.
      </li>
    </ul>
  </>
);
const PrivacyAr = () => (
  <>
    <h2>الخصوصية</h2>
    <p>
      نحن نحترم خصوصيتك. بياناتك تُستخدم فقط لإتمام طلبك وتقديم تجربة شخصية.
    </p>
    <p>صور وذكريات QR لا تظهر إلا لمن يعرف رمز PIN.</p>
  </>
);
const PrivacyEn = () => (
  <>
    <h2>Privacy</h2>
    <p>
      We respect your privacy. Your data is used only to fulfil your order and
      personalise your experience.
    </p>
    <p>
      QR Memory photos and messages are visible only to those who know your PIN.
    </p>
  </>
);
const TermsAr = () => (
  <>
    <h2>الشروط والأحكام</h2>
    <p>باستخدامك لموقع مشاعر فإنك توافق على هذه الشروط.</p>
    <p>جميع الأسعار بالدرهم الإماراتي وتشمل ضريبة القيمة المضافة.</p>
  </>
);
const TermsEn = () => (
  <>
    <h2>Terms & Conditions</h2>
    <p>By using Mashaer, you agree to these terms.</p>
    <p>All prices in AED, inclusive of VAT.</p>
  </>
);
