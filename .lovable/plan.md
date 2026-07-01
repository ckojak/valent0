# Plano de expansão VALENT — 3 frentes

Mantém identidade visual atual (laranja/branco, Header/Hero/Footer/TrustStrip/HowItWorks/Faq/Benefits) e componentes existentes. Nenhum cálculo real de seguro — tudo mock com comentário claro para integração futura.

## Ordem de execução

1. **Wizard completo Auto** (rota dedicada) — mais visível
2. **Páginas de categoria** — reaproveitam template único
3. **Supabase: leads + admin** — mínimo viável (tabela leads garantida)

---

## 1. Wizard de cotação Auto — `/cotacao/auto`

Página inteira (não modal), com barra de progresso topo e navegação Voltar/Continuar. State machine self-contained em `QuoteAutoWizard.tsx`.

**Novos arquivos:**
- `src/routes/cotacao/auto.tsx` — rota, monta o wizard
- `src/components/quote-auto/QuoteAutoWizard.tsx` — orquestrador + progresso
- `src/components/quote-auto/steps/StepSituacao.tsx` (comprei / vou comprar / renovar / pesquisando — cards)
- `src/components/quote-auto/steps/StepVeiculo.tsx` (marca, modelo, ano fab, ano modelo, versão, placa opcional — selects mockados; placa é placeholder visual, comentário `// MOCK FIPE/API paga`)
- `src/components/quote-auto/steps/StepCondutor.tsx` (nome, nascimento, CPF, CEP, estado civil, uso)
- `src/components/quote-auto/steps/StepPrioridade.tsx` (radio cards)
- `src/components/quote-auto/steps/StepCoberturas.tsx` (toggles: reserva, vidros, terceiros, guincho 24h)
- `src/components/quote-auto/steps/StepResumo.tsx`
- `src/components/quote-auto/steps/StepLoadingAnalise.tsx`
- `src/components/quote-auto/steps/StepResultados.tsx` (3 cards mock — Porto/Azul/Allianz, `// MOCK: substituir por API real de multicálculo`)
- `src/components/quote-auto/steps/StepComparativo.tsx` (tabela lado a lado)
- `src/components/quote-auto/steps/StepContatoFinal.tsx` (nome, WhatsApp, e-mail opcional; salva lead)
- `src/components/quote-auto/steps/StepSucesso.tsx` (CTA WhatsApp com `wa.me/<telefone>?text=<resumo pré-preenchido>`)
- `src/lib/quote-auto-data.ts` (marcas, modelos, mock quotes, tipos)
- `src/lib/wa.ts` — helper `buildWhatsappUrl({phone, message})`

CTA final: `wa.me/{telefone_configuracao}?text=` codificado com nome + veículo + prioridade.

## 2. Páginas dedicadas de categoria

Rotas: `/seguros/auto`, `/seguros/residencial`, `/seguros/empresarial`, `/seguros/vida`, `/seguros/condominio`.

**Template único** parametrizado — edito só o config depois:

- `src/components/category/CategoryPage.tsx` recebe `config: CategoryConfig`
  - `<Header/>`, `<CategoryHero/>`, `<CoverageGrid/>` (cards expansíveis com Collapsible), `<PersonasSection/>` (3-4 cards), `<CategoryFaq/>` (Accordion), `<CategoryCTA/>` (grande, abre wizard), `<Footer/>`
- `src/lib/category-configs.ts` — objeto `CATEGORY_CONFIGS: Record<slug, CategoryConfig>` com todo o copy (hero title/subtitle/badge, coverages[], personas[], faq[], ctaLabel, quoteHref)
- Tipo `CategoryConfig` com todos os textos e ícones (referências Lucide por nome, resolvidos via mapa)
- Rotas: 5 arquivos finos `src/routes/seguros/{slug}.tsx` que importam o template + config correto e definem `head()` com título/descrição próprios.

Categoria Auto: `ctaHref = "/cotacao/auto"`. Outras: abrem `QuoteWizardDialog` existente com `defaultCategory`.

`CategoryMenu` atualizado: cada item vira `<Link to="/seguros/$slug">` (via `Link` do TanStack). Item Carro continua exibindo ícone destacado; agora navega para a página em vez de abrir modal.

## 3. Backend: Leads + Admin (Supabase / Lovable Cloud)

Habilita Lovable Cloud (`supabase--enable`).

**Migrations:**

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text,
  tipo_seguro text not null,
  dados jsonb not null default '{}'::jsonb,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);
grant insert on public.leads to anon;
grant select, update, insert on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "anon insere leads" on public.leads for insert to anon with check (true);
create policy "auth le leads" on public.leads for select to authenticated using (true);
create policy "auth atualiza leads" on public.leads for update to authenticated using (true);

create table public.configuracoes (
  chave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);
grant select on public.configuracoes to anon, authenticated;
grant all on public.configuracoes to authenticated, service_role;
alter table public.configuracoes enable row level security;
create policy "todos leem config" on public.configuracoes for select using (true);
create policy "auth escreve config" on public.configuracoes for all to authenticated using (true) with check (true);
insert into public.configuracoes (chave, valor) values ('telefone_contato','5511999999999') on conflict do nothing;

create table public.promocoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  imagem_url text,
  link text,
  valido_ate date,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.promocoes to anon, authenticated;
grant all on public.promocoes to authenticated, service_role;
alter table public.promocoes enable row level security;
create policy "publico le promocoes ativas" on public.promocoes for select using (ativo = true);
create policy "auth gerencia promocoes" on public.promocoes for all to authenticated using (true) with check (true);
```

**Rotas:**
- `/admin/login` (pública) — email+senha via `supabase.auth.signInWithPassword`, sem link de cadastro. Instrução no rodapé: "Crie o primeiro admin no painel Lovable Cloud → Users".
- `/_authenticated/admin/index.tsx` — dashboard com tabs: **Leads** (tabela + filtro por status + botão marcar como contatado/perdido/ganho), **Promoções** (CRUD simples), **Configurações** (edita `telefone_contato`).

**Componentes:**
- `src/components/admin/LeadsTable.tsx`, `PromocoesManager.tsx`, `ConfigForm.tsx`
- `src/components/landing/PromoBanner.tsx` — carrega promoções ativas via Supabase publishable e exibe carrossel simples na home (acima de CategoryMenu).

**Inserção de lead:** função helper `src/lib/leads.ts::insertLead(payload)` usando `supabase` publishable client (RLS permite anon insert). Chamada no `StepContatoFinal` do wizard Auto e no `StepContact` do wizard modal simplificado das outras categorias. Falha de rede → toast erro, mas NÃO bloqueia o fluxo para WhatsApp.

**CTAs do site** (Header WhatsApp, Hero, footer) leem `telefone_contato` de `configuracoes` via query cacheada (hook `useContatoTelefone`), fallback hardcoded.

## Ordem final de commits

1. Habilitar Lovable Cloud + migrations (leads/configuracoes/promocoes)
2. `wa.ts`, `leads.ts`, `useContatoTelefone`
3. Wizard Auto completo + rota `/cotacao/auto`
4. Template categoria + 5 rotas + configs + atualizar `CategoryMenu` para Link
5. Rotas admin (`/admin/login`, `/_authenticated/admin`) + PromoBanner na home

## Fora de escopo (explícito)

- Cálculo real de seguro, integração FIPE, API multicálculo real (todos marcados `// MOCK`)
- Cadastro público de admin (feito manualmente no painel Cloud)
- Upload de imagem de promoção (usa URL colada; Storage fica para depois se pedirem)
