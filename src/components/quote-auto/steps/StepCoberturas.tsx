import { useState } from "react";
import { Car, ChevronLeft, ChevronRight, LifeBuoy, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export type CoberturasData = {
  carro_reserva: boolean;
  vidros: boolean;
  terceiros: boolean;
  guincho_24h: boolean;
};

const ITEMS: { key: keyof CoberturasData; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "carro_reserva", label: "Carro reserva", hint: "Enquanto o seu está na oficina", icon: Car },
  { key: "vidros", label: "Vidros, faróis e retrovisores", hint: "Sem franquia ou com franquia reduzida", icon: Sparkles },
  { key: "terceiros", label: "Danos a terceiros", hint: "Se você bater em outro veículo", icon: ShieldCheck },
  { key: "guincho_24h", label: "Guincho 24h", hint: "Assistência em qualquer horário", icon: Truck },
];

export function StepCoberturas({
  initial,
  onBack,
  onNext,
}: {
  initial: CoberturasData;
  onBack: () => void;
  onNext: (v: CoberturasData) => void;
}) {
  const [data, setData] = useState(initial);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-medium text-brand">
        <LifeBuoy className="h-4 w-4" />
        Coberturas adicionais
      </div>
      <p className="text-sm text-muted-foreground">
        Marque o que você quer incluir. Sem compromisso — é só pra afinar a cotação.
      </p>

      <div className="flex flex-col gap-2.5">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <label key={it.key} className="flex items-center justify-between gap-3 rounded-xl border bg-secondary/40 px-4 py-3">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{it.label}</span>
                  <span className="block text-xs text-muted-foreground">{it.hint}</span>
                </span>
              </span>
              <Switch checked={data[it.key]} onCheckedChange={(v) => setData((d) => ({ ...d, [it.key]: v }))} />
            </label>
          );
        })}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent sm:w-1/3">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <button type="button" onClick={() => onNext(data)}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground shadow-sm transition hover:bg-cta-hover">
          Ver resumo <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
