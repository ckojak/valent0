import { ChevronRight, ShoppingCart, RefreshCw, Search, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SITUACAO_LABEL, type Situacao } from "@/lib/quote-auto-data";

const OPCOES: { id: Situacao; icon: LucideIcon; hint: string }[] = [
  { id: "comprei", icon: Sparkles, hint: "Já é meu, quero proteger agora" },
  { id: "vou_comprar", icon: ShoppingCart, hint: "Quero saber quanto vou pagar" },
  { id: "renovar", icon: RefreshCw, hint: "Já tenho seguro e quero comparar" },
  { id: "pesquisando", icon: Search, hint: "Só olhando por enquanto" },
];

export function StepSituacao({
  value,
  onNext,
}: {
  value: Situacao | null;
  onNext: (v: Situacao) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Qual é a sua situação?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Isso ajuda a gente a te recomendar as coberturas certas.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPCOES.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onNext(opt.id)}
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:border-brand hover:bg-brand-soft ${
                active ? "border-brand bg-brand-soft" : "bg-card"
              }`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-foreground">
                  {SITUACAO_LABEL[opt.id]}
                </span>
                <span className="block text-xs text-muted-foreground">{opt.hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:text-brand" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
