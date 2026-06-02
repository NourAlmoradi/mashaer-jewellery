import type { Metadata } from "next";
import { CollectionsGallery } from "@/components/collections/CollectionsGallery";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore Mashaer's curated jewellery collections — timeless pieces designed to hold a memory.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return <CollectionsGallery />;
}
