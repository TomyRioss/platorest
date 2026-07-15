"use client";

import { QrCode } from "lucide-react";

export function QrDownloadButton({ menuUrl, slug }: { menuUrl: string; slug: string }) {
  async function handleDownload() {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `qr-${slug}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("[QrDownloadButton] failed to download QR", err);
      alert("No se pudo descargar el QR. Intentá de nuevo.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
    >
      <QrCode className="h-6 w-6" />
      QR y enlaces
    </button>
  );
}
