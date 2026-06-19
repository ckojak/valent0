import { Wallet, Smartphone, Headphones, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: Wallet, title: "Economize de verdade", desc: "Comparamos preços para você pagar menos sem perder cobertura." },
  { icon: Smartphone, title: "100% online", desc: "Cotação, contratação e apólice direto do seu celular." },
  { icon: Headphones, title: "Consultoria humana", desc: "Especialistas prontos para te ajudar quando precisar." },
  { icon: BadgeCheck, title: "Regulamentada SUSEP", desc: "Corretora autorizada, transparente e segura." },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Por que a VALENT</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            A forma mais inteligente de proteger o que importa
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{it.title}</h3>
              <p className="mt-1 text-sm text-white/70">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
