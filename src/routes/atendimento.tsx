import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/atendimento")({
  head: () => ({ meta: [{ title: "Atendimento — VALENT" }] }),
  component: AtendimentoPage,
});

function AtendimentoPage() {
  return (
    <PageShell title="Atendimento" subtitle="Estamos aqui para ajudar antes, durante e depois da contratação">
      <Section title="Canais de atendimento">
        <ul className="list-disc space-y-1 pl-5">
          <li>WhatsApp: (21) 99762-5607</li>
          <li>Telefone: (21) 99762-5607</li>
          <li>E-mail: valentseguros@valent.com.br</li>
        </ul>
      </Section>

      <Section title="Horário de atendimento">
        <p>Segunda a sexta, das 9h às 18h. Fora desse horário, deixe sua mensagem no WhatsApp que retornamos no próximo dia útil.</p>
      </Section>

      <Section title="Como acionar seu seguro (sinistro)">
        <p>
          Em caso de sinistro, entre em contato imediatamente pelo WhatsApp ou telefone acima —
          vamos te orientar sobre a central de sinistros da sua seguradora específica e acompanhar o processo.
        </p>
      </Section>

      <Section title="Dúvidas frequentes">
        <p>
          Perguntas específicas sobre coberturas de cada tipo de seguro estão nas páginas de cada categoria
          (Auto, Residencial, Empresarial, Vida e Condomínio), na seção de perguntas frequentes.
        </p>
      </Section>
    </PageShell>
  );
}