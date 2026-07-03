import { Home, Phone, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";

function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  const local = d.startsWith("55") ? d.slice(2) : d;
  if (local.length < 10) return digits;
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}

const NAV = [
  { label: "Início", href: "/" as const },
  { label: "Seguros", href: "/#categorias" as const, hasCaret: true },
  { label: "Empresas", href: "/seguros/empresarial" as const },
  { label: "Sobre a Valent", href: "/#sobre" as const },
  { label: "Contato", href: "/#contato" as const },
];

export function Header() {
  const telefone = useContatoTelefone();
  const display = formatPhoneDisplay(telefone);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_6px_18px_-6px_oklch(0.7_0.19_47/0.55)]">
            <Home className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl font-extrabold tracking-tight text-brand">
              VALENT
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Corretora &amp; Consultoria de Seguros
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-foreground/80 transition hover:text-brand"
            >
              {item.label}
              {item.hasCaret && <ChevronDown className="h-4 w-4" />}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:+${telefone.replace(/\D/g, "")}`}
            className="hidden items-center gap-2 text-sm font-semibold text-foreground md:inline-flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-brand/30 text-brand">
              <Phone className="h-4 w-4" />
            </span>
            {display}
          </a>
          <Link
            to="/cotacao/auto"
            className="hidden h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold uppercase tracking-wide text-brand-foreground shadow-[0_10px_24px_-10px_oklch(0.7_0.19_47/0.7)] transition hover:brightness-110 sm:inline-flex"
          >
            Faça sua cotação
          </Link>
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base font-medium text-foreground"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/cotacao/auto"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold uppercase text-brand-foreground"
            >
              Faça sua cotação
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
