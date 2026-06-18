import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "A cotação é gratuita?",
    a: "Sim, é 100% gratuita e sem compromisso. Você só paga se decidir contratar.",
  },
  {
    q: "Quanto tempo leva para cotar?",
    a: "Em média 1 minuto. Basta informar a placa do veículo e seus dados de contato.",
  },
  {
    q: "Quais seguradoras vocês trabalham?",
    a: "Porto Seguro, Bradesco, Tokio Marine, Allianz, HDI, SulAmérica, entre outras.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Seguimos a LGPD e não compartilhamos seus dados com terceiros sem permissão.",
  },
  {
    q: "Posso contratar 100% online?",
    a: "Sim, do início ao fim. A apólice é enviada por e-mail logo após a contratação.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-cta">Dúvidas frequentes</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-brand sm:text-4xl">
            Tudo que você precisa saber
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-8 w-full">
          {ITEMS.map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-brand">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
