import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedQuote } from "@/components/quote-personalizada/PersonalizedQuote";

export const Route = createFileRoute("/cotacao/personalizada")({
  validateSearch: (search: Record<string, unknown>) => ({
    tipo: typeof search.tipo === "string" ? search.tipo : "saude",
  }),
  component: PageCotacaoPersonalizada,
});

function PageCotacaoPersonalizada() {
  const { tipo } = Route.useSearch();
  const validTipos = ["saude", "dental", "celular", "equipamentos", "viagem", "consorcio", "personalizado"] as const;
  const safeTipo = validTipos.includes(tipo as (typeof validTipos)[number]) ? (tipo as (typeof validTipos)[number]) : "saude";

  return <PersonalizedQuote tipoInicial={safeTipo} />;
}
