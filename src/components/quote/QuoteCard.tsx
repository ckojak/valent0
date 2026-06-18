import { Check, Star } from "lucide-react";
import { InsurerLogo } from "./InsurerLogo";
import type { Quote } from "@/lib/quote-data";
import { formatBRL } from "@/lib/masks";

export function QuoteCard({ quote, best }: { quote: Quote; best?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md sm:p-5 ${
        best ? "border-cta ring-2 ring-cta/20" : ""
      }`}
    >
      {best && (
        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-cta px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cta-foreground">
          <Star className="h-3 w-3 fill-current" /> Mais escolhido
        </div>
      )}

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <InsurerLogo insurer={quote.insurer} />
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-brand">
            {quote.insurer.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {quote.insurer.coverage}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t pt-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Anual a partir de
          </p>
          <p className="font-display text-2xl font-extrabold text-brand">
            {formatBRL(quote.total)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ou 12x de <span className="font-semibold text-foreground">{formatBRL(quote.installment)}</span> sem juros
          </p>
        </div>
        <button className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cta px-4 text-sm font-semibold text-cta-foreground transition hover:bg-cta-hover">
          <Check className="h-4 w-4" /> Contratar
        </button>
      </div>
    </div>
  );
}
