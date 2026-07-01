import { ChevronLeft, ChevronRight, Target, Shield, LifeBuoy, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PRIORIDADE_LABEL, type Prioridade } from "@/lib/quote-auto-data";

const OPCOES: { id: Prioridade; icon: LucideIcon; hint: string }[] = [
  { id: "menor_preco", icon: Target, hint: "Quero pagar o menor valor possível" },
  { id: "melhor_cobertura", icon: Shield, hint: "Cobertura ampla vale mais que preço" },
  { id: "mais_assistencia", icon: LifeBuoy, hint: "Guincho, carro reserva, apoio 24h" },
  { id: "equilibrio", icon: Scale, hint: "Um bom meio-termo entre tudo" },
];

export function StepPrioridade({
  value,
  onBack,
  onNext,
}: {
  value: Prioridade | null;
  onBack: () => void;
  onNext: (v: Prioridade) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          O que é mais importante pra você?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Usamos isso para ranquear as ofertas que você vai ver.
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
                  {PRIORIDADE_LABEL[opt.id]}
                </span>
                <span className="block text-xs text-muted-foreground">{opt.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex">
        <button type="button" onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>
    </div>
  );
}
