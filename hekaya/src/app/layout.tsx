import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Amiri,
  Noto_Sans_Arabic,
} from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Providers } from "@/components/Providers";
import type { Locale } from "@/types";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-arabic",
  display: "swap",
});

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
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${amiri.variable} ${notoArabic.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <Providers initialLocale={locale}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
