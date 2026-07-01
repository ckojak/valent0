import { CheckCircle2, ChevronRight, GitCompare, Trophy } from "lucide-react";
import { formatBRL } from "@/lib/masks";
import type { QuoteAuto } from "@/lib/quote-auto-data";

// MOCK: cards de resultado. Cada card representa uma seguradora fake.
export function StepResultados({
  quotes,
  onCompare,
  onSelect,
}: {
  quotes: QuoteAuto[];
  onCompare: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Encontramos {quotes.length} ofertas pra você
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preços simulados. O valor final é confirmado pela seguradora após análise do perfil.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {quotes.map((q, i) => (
          <div
            key={q.id}
            className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold text-white"
                style={{ backgroundColor: q.cor }}
              >
                {q.iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-extrabold text-foreground">{q.seguradora}</span>
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                      <Trophy className="h-3 w-3" />
                      Melhor preço
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{q.destaque}</span>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Prêmio anual</span>
                <span className="font-display text-2xl font-extrabold text-foreground">{formatBRL(q.premio_total)}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ou {q.parcelas}x de {formatBRL(q.premio_total / q.parcelas)} sem juros
                </span>
              </div>
            </div>

            <ul className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />Casco 100%</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />Terceiros até {formatBRL(q.coberturas.terceiros_corporais)}</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />Carro reserva {q.coberturas.carro_reserva_dias} dias</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" />Guincho {q.coberturas.guincho_km} km</li>
            </ul>

            <button
              type="button"
              onClick={() => onSelect(q.id)}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-brand-foreground transition hover:bg-cta-hover"
            >
              Quero contratar
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCompare}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/40 bg-brand-soft text-sm font-semibold text-brand transition hover:bg-brand/10"
      >
        <GitCompare className="h-4 w-4" />
        Comparar as 3 lado a lado
      </button>
    </div>
  );
}
