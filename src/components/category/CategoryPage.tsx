import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { QuoteWizardDialog } from "@/components/quote/QuoteWizardDialog";
import type { CategoryConfig } from "@/lib/category-configs";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";

export function CategoryPage({ config }: { config: CategoryConfig }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const telefone = useContatoTelefone();
  const Icon = config.icon;

  const openQuote = () => {
    if (config.quoteHref) return; // navigation handled by Link component
    setWizardOpen(true);
  };

  const waUrl = buildWhatsappUrl(
    telefone,
    `Olá! Tenho interesse em ${config.eyebrow.toLowerCase()}.`,
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CategoryHero config={config} onQuote={openQuote} waUrl={waUrl} Icon={Icon} />
        <CoverageGrid coberturas={config.coberturas} />
        <PersonasSection personas={config.personas} eyebrow={config.eyebrow} />
        <CategoryFaq items={config.faq} />
        <CategoryCTA config={config} onQuote={openQuote} />
      </main>
      <Footer />
      <QuoteWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}

function CategoryHero({
  config,
  onQuote,
  waUrl,
  Icon,
}: {
  config: CategoryConfig;
  onQuote: () => void;
  waUrl: string;
  Icon: CategoryConfig["icon"];
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-soft via-background to-background" />
      <div className="absolute -top-32 -right-32 -z-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <Icon className="h-3.5 w-3.5" />
          {config.eyebrow}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
          {config.titulo} <span className="text-brand">{config.destaque}</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{config.subtitulo}</p>

        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {config.heroBadges.map((b) => (
            <li key={b} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          {config.quoteHref ? (
            <Link
              to={config.quoteHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-brand-foreground shadow-sm transition hover:bg-cta-hover"
            >
              {config.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onQuote}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-brand-foreground shadow-sm transition hover:bg-cta-hover"
            >
              {config.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function CoverageGrid({ coberturas }: { coberturas: CategoryConfig["coberturas"] }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Coberturas e assistências
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clique em cada card para ver os detalhes.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {coberturas.map((c) => (
          <CoverageCard key={c.titulo} cobertura={c} />
        ))}
      </div>
    </section>
  );
}

function CoverageCard({ cobertura }: { cobertura: CategoryConfig["coberturas"][number] }) {
  const [open, setOpen] = useState(false);
  const Icon = cobertura.icon;
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-brand-soft">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex-1 font-display text-sm font-bold text-foreground">{cobertura.titulo}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 py-3 text-sm text-muted-foreground">
        {cobertura.descricao}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PersonasSection({ personas, eyebrow }: { personas: CategoryConfig["personas"]; eyebrow: string }) {
  return (
    <section className="bg-brand-soft/40">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
            Para quem é o {eyebrow.toLowerCase()}?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perfis que aproveitam ao máximo essa categoria.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.titulo} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-display text-sm font-extrabold text-foreground">{p.titulo}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryFaq({ items }: { items: CategoryConfig["faq"] }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          Perguntas frequentes
        </h2>
      </div>
      <Accordion type="single" collapsible className="rounded-2xl border bg-card shadow-[var(--shadow-card)]">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="px-5">
            <AccordionTrigger className="text-left font-display text-sm font-bold text-foreground">
              {it.pergunta}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{it.resposta}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CategoryCTA({ config, onQuote }: { config: CategoryConfig; onQuote: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <div className="rounded-3xl bg-brand p-8 text-center text-brand-foreground shadow-lg">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{config.ctaTitulo}</h2>
        <p className="mt-2 text-sm opacity-90">{config.ctaSubtitulo}</p>
        <div className="mt-5">
          {config.quoteHref ? (
            <Link
              to={config.quoteHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-bold text-brand shadow-sm transition hover:brightness-105"
            >
              {config.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onQuote}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-bold text-brand shadow-sm transition hover:brightness-105"
            >
              {config.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
