"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function LinkPreviewCard({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[LinkPreviewCard] failed to copy link", err);
      alert("No se pudo copiar el link. Copialo manualmente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-40 w-full overflow-hidden rounded-lg border border-border bg-surface"
        >
          <iframe
            src={url}
            title={`Preview de ${title}`}
            tabIndex={-1}
            className="pointer-events-none absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50"
          />
        </a>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-xs text-text-secondary underline underline-offset-2"
          >
            {url}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
