import ProductPageClient from "./ProductPageClient";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ProductPageClient params={params} />;
}
