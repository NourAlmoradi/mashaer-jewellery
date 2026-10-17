import type { Metadata } from "next";
import { BespokeExperience } from "@/components/bespoke/BespokeExperience";

export const metadata: Metadata = {
  title: "تصميم قطعتك الخاصة | Bespoke Jewellery",
  description: "قطعة تبدأ منك وتحمل حكايتك. شارك مشاعر فكرة قطعتك في طلب خاص، وناقش التصميم والسعر قبل التنفيذ. Private bespoke jewellery requests in the UAE.",
  alternates: { canonical: "/bespoke" },
};
export default async function BespokePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const params = await searchParams;
  const productSlug = typeof params.product === "string" ? params.product.slice(0, 100) : "";
  return <BespokeExperience productSlug={productSlug} />;
}
