"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { findProduct } from "@/data/products";
import { useProductBySlug } from "@/lib/useProducts";
import { ProductDetail } from "@/components/products/ProductDetail";

export default function ProductPageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  // Prefer store-merged product (so admin edits / custom products win),
  // then fall back to the static seed.
  const fromStore = useProductBySlug(slug);
  const product = fromStore ?? findProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
