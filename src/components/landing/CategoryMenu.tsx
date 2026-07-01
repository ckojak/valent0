import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { MENU_SECTIONS, type MenuItem } from "@/lib/menu-data";
import { QuoteWizardDialog } from "@/components/quote/QuoteWizardDialog";

export function CategoryMenu() {
  const [openSection, setOpenSection] = useState<string | null>("veiculo");
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleQuoteClick = (item: MenuItem) => {
    if (item.quote) {
      setWizardOpen(true);
    } else if (!item.href) {
      toast("Em breve!", {
        description: "Fale com um consultor pelo WhatsApp para essa categoria.",
      });
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
      <div className="flex flex-col gap-4">
        {MENU_SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)]">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-brand-soft"
                aria-expanded={isOpen}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
                  <SectionIcon className="h-5 w-5" />
                </span>
                <span className="flex-1 font-display text-base font-extrabold text-foreground">
                  {section.title}
                </span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <ul className="border-t">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <MenuRow item={item} onQuoteClick={handleQuoteClick} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <QuoteWizardDialog open={wizardOpen} onOpenChange={setWizardOpen} />
    </section>
  );
}

function MenuRow({ item, onQuoteClick }: { item: MenuItem; onQuoteClick: (i: MenuItem) => void }) {
  const Icon = item.icon;
  const ActionIcon = item.href || item.quote ? ShoppingCart : ChevronRight;
  const rowClass =
    "group flex w-full min-h-[64px] items-center gap-3 border-b px-5 py-3 text-left transition last:border-b-0 hover:bg-brand-soft active:bg-brand-soft";
  const iconWrap =
    "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-brand-foreground";
  const actionWrap =
    item.href || item.quote
      ? "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground transition group-hover:bg-cta-hover"
      : "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition group-hover:bg-brand/10 group-hover:text-brand";

  const inner = (
    <>
      <span className={iconWrap}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold text-foreground">{item.label}</span>
        {item.subtitle && (
          <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
        )}
      </span>
      <span className={actionWrap}>
        <ActionIcon className="h-4 w-4" />
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link to={item.href} className={rowClass}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onQuoteClick(item)} className={rowClass}>
      {inner}
    </button>
  );
}
