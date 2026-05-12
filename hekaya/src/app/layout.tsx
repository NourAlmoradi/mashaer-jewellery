import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Providers } from "@/components/Providers";
import type { Locale } from "@/types";

export const metadata: Metadata = {
  title: "Hekaya Jewellery — A Story in Every Piece | مجوهرات حكاية",
  description:
    "Premium children's jewellery for the UAE — every piece comes with a private QR Memory card to keep your moments forever. مجوهرات أطفال فاخرة مع بطاقة ذكرى رقمية.",
  keywords: ["jewellery", "UAE", "children", "QR memory", "Hekaya", "مجوهرات"],
  openGraph: {
    title: "Hekaya Jewellery",
    description: "A Story in Every Piece — في كل قطعة… حكاية",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("hekaya-locale")?.value;
  const locale: Locale = cookieLocale === "en" ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <Providers initialLocale={locale}>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingActions />
        </Providers>
      </body>
    </html>
  );
}
