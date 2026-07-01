import { ChevronLeft } from "lucide-react";
import { formatBRL } from "@/lib/masks";
import type { QuoteAuto } from "@/lib/quote-auto-data";

export function StepComparativo({
  quotes,
  onBack,
  onSelect,
}: {
  quotes: QuoteAuto[];
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Comparativo lado a lado
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mesmo perfil, cotado nas três seguradoras.
        </p>
      </div>

      <div className="-mx-5 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"></th>
              {quotes.map((q) => (
                <th key={q.id} className="p-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="grid h-10 w-10 place-items-center rounded-lg text-xs font-extrabold text-white" style={{ backgroundColor: q.cor }}>
                      {q.iniciais}
                    </div>
                    <span className="text-xs font-bold text-foreground">{q.seguradora}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <Row label="Prêmio anual" values={quotes.map((q) => <strong className="text-brand">{formatBRL(q.premio_total)}</strong>)} />
            <Row label="Parcelamento" values={quotes.map((q) => `${q.parcelas}x sem juros`)} />
            <Row label="Franquia" values={quotes.map((q) => formatBRL(q.franquia))} />
            <Row label="Terceiros corporais" values={quotes.map((q) => formatBRL(q.coberturas.terceiros_corporais))} />
            <Row label="Terceiros materiais" values={quotes.map((q) => formatBRL(q.coberturas.terceiros_materiais))} />
            <Row label="Vidros" values={quotes.map((q) => q.coberturas.vidros ? "Sim" : "Opcional")} />
            <Row label="Carro reserva" values={quotes.map((q) => `${q.coberturas.carro_reserva_dias} dias`)} />
            <Row label="Guincho" values={quotes.map((q) => `${q.coberturas.guincho_km} km`)} />
            <tr>
              <td />
              {quotes.map((q) => (
                <td key={q.id} className="p-3">
                  <button
                    type="button"
                    onClick={() => onSelect(q.id)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand text-xs font-semibold text-brand-foreground transition hover:bg-cta-hover"
                  >
                    Escolher
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex">
        <button type="button" onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
          Voltar aos resultados
        </button>
      </div>
    </div>
  );
}

function Row({ label, values }: { label: string; values: React.ReactNode[] }) {
  return (
    <tr className="border-t">
      <td className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-3 text-center text-sm text-foreground">{v}</td>
      ))}
    </tr>
  );
}
