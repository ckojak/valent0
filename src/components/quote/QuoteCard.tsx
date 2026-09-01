import { Check, ShieldCheck, Star } from "lucide-react";
import { InsurerLogo } from "./InsurerLogo";
import type { Quote } from "@/lib/quote-data";
import { formatBRL } from "@/lib/masks";

export function QuoteCard({ quote, best }: { quote: Quote; best?: boolean }) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
        best ? "border-cta ring-2 ring-cta/20" : "border-border/80"
      }`}
    >
      <div className={`h-1 w-full ${best ? "bg-cta" : "bg-brand/15"}`} />

      {best && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-cta px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cta-foreground shadow-sm">
          <Star className="h-3 w-3 fill-current" /> Mais escolhido
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <InsurerLogo insurer={quote.insurer} />
          <div className="min-w-0 pr-1">
            <h3 className="truncate font-display text-base font-bold text-brand">
              {quote.insurer.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {quote.insurer.coverage}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-brand-soft/70 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
            <ShieldCheck className="h-3.5 w-3.5" /> Cobertura completa
          </div>
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

        <button type="button" className="mt-4 inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cta px-4 text-sm font-semibold text-cta-foreground transition hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2">
          <Check className="h-4 w-4" /> Contratar
        </button>
      </div>
    </div>
  );
}
