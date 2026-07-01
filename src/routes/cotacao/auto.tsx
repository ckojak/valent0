import { createFileRoute } from "@tanstack/react-router";
import { QuoteAutoWizard } from "@/components/quote-auto/QuoteAutoWizard";

export const Route = createFileRoute("/cotacao/auto")({
  head: () => ({
    meta: [
      { title: "Cotação Seguro Auto — VALENT Seguros" },
      { name: "description", content: "Cote seu seguro auto online em poucos passos. Compare Porto, Azul e Allianz." },
      { property: "og:title", content: "Cotação Seguro Auto — VALENT Seguros" },
      { property: "og:description", content: "Cote seu seguro auto online em poucos passos." },
    ],
  }),
  component: PageCotacaoAuto,
});

function PageCotacaoAuto() {
  return <QuoteAutoWizard />;
}
