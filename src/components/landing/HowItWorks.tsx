import { Search, Scale, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Preencha a placa",
    desc: "Em menos de 1 minuto, nos diga sobre seu veículo e contato.",
  },
  {
    icon: Scale,
    title: "Compare as ofertas",
    desc: "Receba propostas das maiores seguradoras lado a lado.",
  },
  {
    icon: ShieldCheck,
    title: "Contrate online",
    desc: "Escolha a melhor e finalize 100% digital, com apólice no e-mail.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Como funciona</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Seu seguro, do jeito simples
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sem corretor te ligando às 19h. Você no controle, do início ao fim.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="absolute right-4 top-4 font-display text-4xl font-extrabold text-brand/15">
                0{i + 1}
              </span>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
