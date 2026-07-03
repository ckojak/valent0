import { Link } from "@tanstack/react-router";
import { ShieldCheck, Building2, Headphones, Star, ArrowRight, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-family.jpg";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";

const CARD_ITEMS = [
  { icon: ShieldCheck, label: "Atendimento", label2: "personalizado" },
  { icon: Building2, label: "Diversas", label2: "seguradoras" },
  { icon: Headphones, label: "Suporte antes e", label2: "depois da contratação" },
  { icon: Star, label: "Consultoria", label2: "especializada" },
];

export function Hero() {
  const telefone = useContatoTelefone();
  const waUrl = buildWhatsappUrl(telefone, "Olá! Vim pelo site da VALENT e quero falar com um especialista.");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft/40 via-background to-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-16 lg:pb-20">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Proteção inteligente para o que realmente <span className="text-brand">importa.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Na Valent Seguros você encontra as melhores opções de seguros com análise personalizada, comparação
            entre seguradoras e atendimento especializado.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cotacao/auto"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground shadow-[0_14px_32px_-14px_oklch(0.7_0.19_47/0.75)] transition hover:brightness-110"
            >
              Quero cotar meu seguro
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-6 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-brand hover:text-brand"
            >
              <MessageCircle className="h-4 w-4 text-[oklch(0.55_0.11_165)]" />
              Falar com especialista
            </a>
          </div>
        </div>

        {/* Right: image + overlay card */}
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-[0_30px_60px_-30px_oklch(0.2_0.05_60/0.35)] lg:aspect-[5/4]">
            <img
              src={heroImg}
              alt="Família feliz protegida pela Valent Seguros"
              width={1280}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute right-4 top-1/2 hidden w-64 -translate-y-1/2 rounded-2xl bg-navy p-5 text-navy-foreground shadow-2xl sm:right-6 sm:block md:w-72 lg:right-[-16px]">
            <ul className="flex flex-col gap-4">
              {CARD_ITEMS.map(({ icon: Icon, label, label2 }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-brand ring-1 ring-white/10">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm leading-tight text-white/95">
                    {label}
                    <br />
                    {label2}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile-only value list */}
        <ul className="grid grid-cols-2 gap-3 sm:hidden">
          {CARD_ITEMS.map(({ icon: Icon, label, label2 }) => (
            <li key={label} className="flex items-start gap-2 rounded-xl bg-navy p-3 text-navy-foreground">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span className="text-xs leading-tight">{label} {label2}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
