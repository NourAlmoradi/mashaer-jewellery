import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story behind Mashaer Jewellery — quiet luxury, child-safe craftsmanship, and a QR Memory keepsake in every piece.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}
