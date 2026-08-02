-- Uruchom jednorazowo w SQL Editorze dla istniejącej bazy Supabase.
-- Dodaje przełącznik rejestracji nowych użytkowników używany przez aplikację.

create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  registration_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, registration_enabled)
values (1, true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'app_settings_updated_at'
  ) then
    create trigger app_settings_updated_at
      before update on public.app_settings
      for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.app_settings enable row level security;

grant usage on schema public to service_role;
grant all privileges on table public.app_settings to service_role;
