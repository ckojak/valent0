
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "admin le user_roles" on public.user_roles
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "admin gerencia user_roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Retighten policies: only admins can read/write privileged rows.
drop policy if exists "auth le leads" on public.leads;
drop policy if exists "auth insere leads" on public.leads;
drop policy if exists "auth atualiza leads" on public.leads;
drop policy if exists "auth deleta leads" on public.leads;
create policy "admin le leads" on public.leads
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin atualiza leads" on public.leads
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "admin deleta leads" on public.leads
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "auth gerencia config" on public.configuracoes;
create policy "admin gerencia config" on public.configuracoes
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "auth le todas promocoes" on public.promocoes;
drop policy if exists "auth gerencia promocoes" on public.promocoes;
create policy "admin le todas promocoes" on public.promocoes
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin gerencia promocoes" on public.promocoes
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
