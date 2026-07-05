import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({ meta: [{ title: "Termos de Uso — VALENT" }] }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <PageShell title="Termos de Uso" subtitle="Última atualização: julho de 2026">
      <Section title="1. Aceitação dos termos">
        <p>
          Ao acessar e utilizar o site da VALENT Corretora &amp; Consultoria de Seguros ([CNPJ]),
          você concorda com estes Termos de Uso. Se não concordar, pedimos que não utilize o site.
        </p>
      </Section>
      <Section title="2. Sobre o serviço">
        <p>
          Este site tem finalidade informativa e de intermediação: apresentamos opções de seguros de
          seguradoras parceiras e coletamos dados para que um especialista da Valent entre em contato.
          A contratação efetiva da apólice é sempre feita com a seguradora escolhida, sob as condições
          gerais dela.
        </p>
      </Section>
      <Section title="3. Responsabilidades do usuário">
        <p>
          Você se compromete a fornecer informações verdadeiras nos formulários de cotação. Dados
          incorretos podem invalidar a cotação ou a apólice futura.
        </p>
      </Section>
      <Section title="4. Propriedade intelectual">
        <p>
          Marca, layout, textos e identidade visual deste site pertencem à VALENT e não podem ser
          reproduzidos sem autorização.
        </p>
      </Section>
      <Section title="5. Limitação de responsabilidade">
        <p>
          A Valent atua como corretora intermediária. Coberturas, prazos e valores finais são
          definidos pela seguradora escolhida em suas condições gerais, disponibilizadas antes da contratação.
        </p>
      </Section>
      <Section title="6. Alterações">
        <p>Estes termos podem ser atualizados periodicamente. A data da última atualização está sempre no topo desta página.</p>
      </Section>
      <Section title="7. Legislação aplicável">
        <p>Estes termos são regidos pela legislação brasileira, foro da comarca do domicílio da VALENT.</p>
      </Section>
      <Section title="Contato">
        <p>Dúvidas sobre estes termos: valentseguros@valent.com.br</p>
      </Section>
    </PageShell>
  );
}