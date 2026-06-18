import { Car, HeartPulse, ShieldAlert } from "lucide-react";

export type ProductType = "auto" | "vida" | "acidentes";

const PRODUCTS: {
  id: ProductType;
  title: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "auto",
    title: "Seguro Auto",
    desc: "Compare propostas das melhores seguradoras.",
    icon: <Car className="h-6 w-6" />,
  },
  {
    id: "vida",
    title: "Seguro de Vida",
    desc: "Proteção financeira para quem você ama.",
    icon: <HeartPulse className="h-6 w-6" />,
  },
  {
    id: "acidentes",
    title: "Acidentes Pessoais",
    desc: "Cobertura para imprevistos do dia a dia.",
    icon: <ShieldAlert className="h-6 w-6" />,
  },
];

export function StepProduct({ onSelect }: { onSelect: (p: ProductType) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-medium text-brand">
        Etapa 1 · Qual seguro você procura?
      </div>
      <div className="grid gap-3">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 text-left transition hover:border-cta hover:bg-cta/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-cta group-hover:text-cta-foreground">
              {p.icon}
            </span>
            <span className="flex-1">
              <span className="block font-display text-base font-bold text-brand">
                {p.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {p.desc}
              </span>
            </span>
            <span className="text-cta opacity-0 transition group-hover:opacity-100">
              →
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        🔒 Cotação 100% online, sem compromisso.
      </p>
    </div>
  );
}
