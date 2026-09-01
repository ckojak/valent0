import { useState } from "react";
import { Check, Copy, Hash } from "lucide-react";

export function ProtocoloBadge({
  protocolo,
  variant = "inline",
}: {
  protocolo: string;
  variant?: "inline" | "destaque";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(protocolo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
        <Hash className="h-3 w-3" />
        {protocolo}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface-muted px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Protocolo de atendimento
        </p>
        <p className="font-display text-lg font-extrabold text-brand">{protocolo}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-accent"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
