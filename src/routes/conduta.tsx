import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/conduta")({
  head: () => ({ meta: [{ title: "Código de Conduta — VALENT" }] }),
  component: CondutaPage,
});

function CondutaPage() {
  return (
    <PageShell title="Código de Conduta">
      <Section title="Nosso compromisso">
        <p>
          Como corretora registrada na SUSEP (nº 212126836), a VALENT atua com transparência,
          honestidade e no melhor interesse do cliente na intermediação de seguros.
        </p>
      </Section>
      <Section title="Princípios">
        <ul className="list-disc space-y-1 pl-5">
          <li>Recomendamos coberturas com base na necessidade real do cliente, não na maior comissão</li>
          <li>Explicamos condições, exclusões e prazos antes da contratação, sem letras miúdas escondidas</li>
          <li>Tratamos dados pessoais em conformidade com a LGPD</li>
          <li>Não toleramos qualquer forma de discriminação no atendimento</li>
        </ul>
      </Section>
      <Section title="Canal de denúncia">
        <p>
          Se você identificar qualquer conduta em desacordo com estes princípios, escreva para
          valentseguros@valent.com.br.
        </p>
      </Section>
    </PageShell>
  );
}