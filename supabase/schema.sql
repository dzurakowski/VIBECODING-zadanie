-- Uruchom ten plik w SQL Editorze projektu Supabase przed uruchomieniem aplikacji.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_datetime timestamptz not null,
  status text not null default 'current' check (status in ('current', 'archived')),
  capacity integer not null check (capacity > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);
create index registrations_event_id_idx on public.registrations(event_id);
create index registrations_user_id_idx on public.registrations(user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();

create table public.app_settings (
  id integer primary key default 1 check (id = 1),
  registration_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;
create trigger app_settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

-- Atomowy zapis: blokada wiersza wydarzenia zapobiega przekroczeniu limitu przy równoczesnych żądaniach.
create or replace function public.register_for_event(p_event_id uuid, p_user_id uuid)
returns public.registrations language plpgsql security definer set search_path = public as $$
declare event_row public.events; result public.registrations;
begin
  select * into event_row from public.events where id = p_event_id for update;
  if not found then raise exception 'EVENT_NOT_FOUND'; end if;
  if event_row.status <> 'current' then raise exception 'EVENT_ARCHIVED'; end if;
  if exists (select 1 from public.registrations where event_id = p_event_id and user_id = p_user_id) then raise exception 'ALREADY_REGISTERED'; end if;
  if (select count(*) from public.registrations where event_id = p_event_id) >= event_row.capacity then raise exception 'EVENT_FULL'; end if;
  insert into public.registrations(event_id, user_id) values (p_event_id, p_user_id) returning * into result;
  return result;
end; $$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.app_settings enable row level security;

create policy "profile: own read" on public.profiles for select using (id = auth.uid());
create policy "events: current read" on public.events for select using (status = 'current');
create policy "registrations: own read" on public.registrations for select using (user_id = auth.uid());
-- Operacje administracyjne wykonuje wyłącznie backend z kluczem service_role.

-- Tabele zostały utworzone przez właściciela bazy, więc backendowa rola service_role
-- potrzebuje jawnych uprawnień do wykonywania bezpiecznych operacji serwerowych.
grant usage on schema public to service_role;
grant all privileges on table public.profiles, public.events, public.registrations, public.app_settings to service_role;
grant execute on function public.register_for_event(uuid, uuid) to service_role;
