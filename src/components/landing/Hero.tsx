import { ShieldCheck, UserRound, Building2, PiggyBank, ListChecks } from "lucide-react";

const VALUES = [
  { icon: UserRound, label: "Atendimento personalizado" },
  { icon: Building2, label: "Melhores seguradoras" },
  { icon: PiggyBank, label: "Melhor custo-benefício" },
  { icon: ListChecks, label: "Acompanhamento passo a passo" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft via-background to-background" />
      <div className="absolute -top-32 -right-32 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="mx-auto max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <ShieldCheck className="h-3.5 w-3.5" />
          VALENT Corretora &amp; Consultoria de Seguros
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Proteção inteligente para o que{" "}
          <span className="text-brand">realmente importa.</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Escolha abaixo a categoria do seu seguro e cote agora mesmo, 100% online.
        </p>

        <ul className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          {VALUES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-[0_4px_16px_-8px_oklch(0.2_0.05_60/0.12)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
