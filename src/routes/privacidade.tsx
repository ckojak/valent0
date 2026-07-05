import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Política de Privacidade (LGPD) — VALENT" }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <PageShell title="Política de Privacidade" subtitle="Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)">
      <Section title="1. Quem é o controlador dos seus dados">
        <p>
          VALENT Corretora &amp; Consultoria de Seguros, CNPJ [CNPJ], registro SUSEP nº 212126836,
          sediada em [endereço completo], é a controladora dos dados pessoais coletados neste site.
        </p>
      </Section>
      <Section title="2. Quais dados coletamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Dados de identificação: nome, CPF, data de nascimento</li>
          <li>Dados de contato: telefone/WhatsApp, e-mail, CEP</li>
          <li>Dados do bem segurado: veículo, endereço, etc., conforme o tipo de seguro cotado</li>
        </ul>
      </Section>
      <Section title="3. Para que usamos seus dados">
        <p>
          Usamos seus dados exclusivamente para elaborar cotações, comparar seguradoras parceiras e
          permitir que um especialista Valent entre em contato pelo WhatsApp. Não vendemos seus dados
          a terceiros.
        </p>
      </Section>
      <Section title="4. Base legal (Art. 7º da LGPD)">
        <p>
          Tratamos seus dados com base no seu consentimento (ao preencher o formulário) e na execução
          de procedimentos preliminares relacionados a um possível contrato de seguro.
        </p>
      </Section>
      <Section title="5. Compartilhamento">
        <p>
          Compartilhamos dados apenas com as seguradoras parceiras necessárias para gerar a cotação
          solicitada por você — nunca com terceiros para fins de marketing não relacionado.
        </p>
      </Section>
      <Section title="6. Seus direitos (Art. 18 da LGPD)">
        <p>
          Você pode solicitar a qualquer momento: confirmação de tratamento, acesso, correção,
          anonimização, portabilidade ou eliminação dos seus dados. Basta escrever para
          valentseguros@valent.com.br.
        </p>
      </Section>
      <Section title="7. Retenção e segurança">
        <p>
          Mantemos seus dados pelo tempo necessário para o atendimento e obrigações legais/regulatórias
          da atividade de corretagem, com medidas técnicas razoáveis de segurança.
        </p>
      </Section>
      <Section title="8. Cookies">
        <p>Veja detalhes na nossa <a href="/cookies" className="text-brand hover:underline">Política de Cookies</a>.</p>
      </Section>
    </PageShell>
  );
}