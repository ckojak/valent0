import { CheckCircle2, Clock, Users } from "lucide-react";
import { QuoteWizard } from "@/components/quote/QuoteWizard";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft via-background to-background" />
      <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-cta/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cta/10 px-3 py-1 text-xs font-semibold text-cta">
            <CheckCircle2 className="h-3.5 w-3.5" /> Cotação em 1 minuto · 100% online
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-brand sm:text-5xl lg:text-6xl">
            Cote online, compare e economize no seu seguro
          </h1>
          <p className="mt-3 font-display text-lg font-semibold italic text-cta sm:text-xl">
            Mais rápido em direção ao seu destino.
          </p>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Compare propostas das maiores seguradoras do Brasil e contrate sem sair de casa.
            Sem ligações, sem letras miúdas.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Feature icon={<Clock className="h-4 w-4" />} label="Cotação em 60s" />
            <Feature icon={<Users className="h-4 w-4" />} label="+500 mil clientes" />
            <Feature icon={<CheckCircle2 className="h-4 w-4" />} label="Dados seguros" />
          </ul>
        </div>

        <div className="lg:pl-4">
          <QuoteWizard />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2 rounded-xl border bg-card/60 px-3 py-2.5 text-sm font-medium text-foreground">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cta/10 text-cta">
        {icon}
      </span>
      {label}
    </li>
  );
}
