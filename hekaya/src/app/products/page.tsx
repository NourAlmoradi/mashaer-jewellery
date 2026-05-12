import { Suspense } from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="container-h py-20 text-center">Loading…</div>}
    >
      <ProductsExplorer />
    </Suspense>
  );
}
