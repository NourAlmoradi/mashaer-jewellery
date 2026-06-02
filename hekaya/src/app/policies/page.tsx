import type { Metadata } from "next";
import PoliciesClient from "./PoliciesClient";

export const metadata: Metadata = {
  title: "Policies — Shipping, Returns & Privacy",
  description:
    "Mashaer Jewellery policies: shipping across the UAE, returns, privacy, and terms of service.",
  alternates: { canonical: "/policies" },
};

export default function PoliciesPage() {
  return <PoliciesClient />;
}
