import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre a Valent — VALENT Corretora & Consultoria de Seguros" }] }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <PageShell
      title="Sobre a Valent"
      subtitle="Corretora & Consultoria de Seguros"
    >
      <Section title="Quem somos">
        <p>
          A VALENT nasceu para simplificar a forma como as pessoas e empresas se protegem. Somos uma
          corretora independente, o que significa que não vendemos apólices de uma seguradora só —
          comparamos as principais seguradoras do mercado para encontrar a opção que realmente faz
          sentido para o seu momento, sem letras miúdas.
        </p>
        <p>
          Somos registrados na SUSEP (Superintendência de Seguros Privados) sob o nº 212126836,
          o órgão que regula e fiscaliza corretoras e seguradoras no Brasil.
        </p>
      </Section>

      <Section title="Como trabalhamos">
        <p>
          Nosso processo é simples: entendemos sua necessidade, comparamos coberturas e preços entre
          parceiros, e te acompanhamos do orçamento até o momento em que você mais precisa — na hora
          de acionar o seguro.
        </p>
      </Section>

      <Section title="Nossos diferenciais">
        <ul className="list-disc space-y-1 pl-5">
          <li>Atendimento personalizado, de humano para humano</li>
          <li>Comparação entre diversas seguradoras parceiras</li>
          <li>Suporte antes, durante e depois da contratação</li>
          <li>Consultoria especializada por tipo de seguro</li>
        </ul>
      </Section>
    </PageShell>
  );
}