import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: [{ title: "Política de Cookies — VALENT" }] }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <PageShell title="Política de Cookies">
      <Section title="O que são cookies">
        <p>
          Cookies são pequenos arquivos que o site armazena no seu navegador para lembrar preferências
          e melhorar sua experiência de navegação.
        </p>
      </Section>
      <Section title="Cookies que utilizamos">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Necessários:</strong> essenciais para o funcionamento do site (ex: navegação entre páginas)</li>
          <li><strong>Desempenho/análise:</strong> nos ajudam a entender como o site é usado, de forma agregada</li>
        </ul>
      </Section>
      <Section title="Como gerenciar cookies">
        <p>
          Você pode limpar ou bloquear cookies diretamente nas configurações do seu navegador. Bloquear
          cookies necessários pode afetar o funcionamento do site.
        </p>
      </Section>
    </PageShell>
  );
}