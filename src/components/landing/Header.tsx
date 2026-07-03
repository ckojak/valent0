import { Home, MessageCircle, Phone } from "lucide-react";
import { useContatoTelefone } from "@/hooks/use-contato-telefone";
import { buildWhatsappUrl } from "@/lib/wa";

function formatPhoneDisplay(digits: string): string {
  // 5521997625607 → (21) 99762-5607
  const d = digits.replace(/\D/g, "");
  const local = d.startsWith("55") ? d.slice(2) : d;
  if (local.length < 10) return digits;
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}

export function Header() {
  const telefone = useContatoTelefone();
  const waUrl = buildWhatsappUrl(telefone, "Olá! Vim pelo site da VALENT e gostaria de tirar uma dúvida.");
  const display = formatPhoneDisplay(telefone);
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_6px_18px_-6px_oklch(0.7_0.19_47/0.6)]">
            <Home className="h-5 w-5" strokeWidth={2.4} />
            <span className="absolute -left-1 bottom-0 h-3 w-2 rounded-l-full bg-brand/70" aria-hidden />
            <span className="absolute -right-1 bottom-0 h-3 w-2 rounded-r-full bg-brand/70" aria-hidden />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              VAL<span className="text-brand">ENT</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Corretora &amp; Consultoria
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={`tel:+${telefone.replace(/\D/g, "")}`}
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent sm:inline-flex"
          >
            <Phone className="h-4 w-4 text-brand" />
            {display}
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#128C7E] px-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
