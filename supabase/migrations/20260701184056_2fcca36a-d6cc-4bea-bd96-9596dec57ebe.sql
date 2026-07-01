
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
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "anon insere leads" on public.leads for insert to anon with check (true);
create policy "auth insere leads" on public.leads for insert to authenticated with check (true);
create policy "auth le leads" on public.leads for select to authenticated using (true);
create policy "auth atualiza leads" on public.leads for update to authenticated using (true) with check (true);
create policy "auth deleta leads" on public.leads for delete to authenticated using (true);

create table public.configuracoes (
  chave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);
grant select on public.configuracoes to anon;
grant select, insert, update, delete on public.configuracoes to authenticated;
grant all on public.configuracoes to service_role;
alter table public.configuracoes enable row level security;
create policy "publico le config" on public.configuracoes for select to anon, authenticated using (true);
create policy "auth gerencia config" on public.configuracoes for all to authenticated using (true) with check (true);
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
grant select on public.promocoes to anon;
grant select, insert, update, delete on public.promocoes to authenticated;
grant all on public.promocoes to service_role;
alter table public.promocoes enable row level security;
create policy "publico le promocoes ativas" on public.promocoes for select to anon using (ativo = true);
create policy "auth le todas promocoes" on public.promocoes for select to authenticated using (true);
create policy "auth gerencia promocoes" on public.promocoes for all to authenticated using (true) with check (true);
