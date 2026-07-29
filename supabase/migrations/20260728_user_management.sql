-- Uruchom jednorazowo w SQL Editorze dla projektu, który ma już wykonany schema.sql.
alter table public.profiles add column if not exists is_active boolean not null default true;
