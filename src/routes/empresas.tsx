import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/institutional/PageShell";

export const Route = createFileRoute("/empresas")({
  head: () => ({ meta: [{ title: "Seguros para Empresas — VALENT" }] }),
  component: EmpresasPage,
});

function EmpresasPage() {
  return (
    <PageShell
      title="Valent para Empresas"
      subtitle="Proteção sob medida para o seu negócio, do pequeno ao grande porte"
    >
      <Section title="Consultoria corporativa completa">
        <p>
          Empresas têm riscos diferentes de pessoas físicas: frota, patrimônio, responsabilidade civil,
          saúde dos colaboradores. A Valent monta um pacote de seguros consultivo, comparando
          seguradoras parceiras para reduzir custo sem abrir mão de cobertura.
        </p>
      </Section>

      <Section title="O que cobrimos para empresas">
        <ul className="list-disc space-y-1 pl-5">
          <li>Seguro Empresarial (patrimônio, incêndio, responsabilidade civil)</li>
          <li>Frota de veículos</li>
          <li>Seguro de vida em grupo e benefícios para colaboradores</li>
          <li>Seguro condomínio e áreas comerciais</li>
        </ul>
      </Section>

      <Section title="Fale com um consultor">
        <p>
          Cada empresa é diferente — por isso essa cotação é feita por um especialista, e não pelo
          formulário automático do site.
        </p>
        <Link
          to="/#contato"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold uppercase tracking-wide text-brand-foreground transition hover:brightness-110"
        >
          Falar com um consultor
        </Link>
      </Section>
    </PageShell>
  );
}