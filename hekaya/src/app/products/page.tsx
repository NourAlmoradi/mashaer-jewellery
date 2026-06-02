import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";

export const metadata: Metadata = {
  title: "Shop All Jewellery",
  description:
    "Browse Mashaer's premium children's jewellery — rings, necklaces, bracelets and earrings, each with a private QR Memory keepsake.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="container-h py-20 text-center">Loading…</div>}
    >
      <ProductsExplorer />
    </Suspense>
  );
}
