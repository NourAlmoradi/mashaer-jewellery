import type { Metadata } from "next";
import { products, findProduct } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import ProductPageClient from "./ProductPageClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mashaerjewellery.com";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  const title = `${product.name.en} | ${product.name.ar}`;
  const description =
    product.shortDescription?.en ||
    product.description?.en ||
    `${product.name.en} — ${formatPrice(product.price, "en")}. Premium children's jewellery with a private QR Memory keepsake.`;
  const url = `${SITE_URL}/product/${product.slug}`;
  const images = product.images.filter(Boolean).slice(0, 1);

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name.en,
        alternateName: product.name.ar,
        description:
          product.shortDescription?.en || product.description?.en || undefined,
        image: product.images.filter(Boolean),
        sku: product.id,
        brand: { "@type": "Brand", name: "Mashaer Jewellery" },
        offers: {
          "@type": "Offer",
          priceCurrency: "AED",
          price: product.price,
          availability:
            (product.stock ?? 1) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/product/${product.slug}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient params={params} />
    </>
  );
}
