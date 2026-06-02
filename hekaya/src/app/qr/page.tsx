import type { Metadata } from "next";
import QrClient from "./QrClient";

export const metadata: Metadata = {
  title: "QR Memory — A Story in Every Piece",
  description:
    "Discover how Mashaer's QR Memory works: scan the card inside your jewellery to unlock a private, PIN-protected page of photos and messages.",
  alternates: { canonical: "/qr" },
};

export default function QrInfoPage() {
  return <QrClient />;
}
