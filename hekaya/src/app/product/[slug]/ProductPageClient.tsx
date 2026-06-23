"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useProductBySlug, useCatalogLoading } from "@/lib/useProducts";
import { ProductDetail } from "@/components/products/ProductDetail";

export default function ProductPageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const loading = useCatalogLoading();
  const product = useProductBySlug(slug);

  // Wait for the catalog to load before deciding the product is missing,
  // otherwise a valid product would briefly 404 on first render.
  if (loading) {
    return (
      <div className="container-h flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
      </div>
    );
  }
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
