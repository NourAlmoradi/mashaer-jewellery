"use client";

import QRCode from "qrcode";

export async function generateQrDataUrl(
  text: string,
  size = 320,
  color: { dark?: string; light?: string } = {},
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: color.dark ?? "#c9a96e",
      light: color.light ?? "#ffffff",
    },
  });
}

export function memoryUrlFor(token: string): string {
  if (typeof window === "undefined") return `/memory/${token}`;
  return `${window.location.origin}/memory/${token}`;
}
