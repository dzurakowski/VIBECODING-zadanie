-- Uruchom jednorazowo w SQL Editorze dla istniejącej bazy Supabase.
-- Atomowo blokuje sytuację, w której równoczesne żądania (np. dwóch administratorów
-- degradujących się nawzajem w tym samym momencie) mogłyby ominąć aplikacyjny
-- check "ostatni aktywny administrator" i doprowadzić do zera aktywnych adminów.
-- Blokada zabezpiecza na poziomie bazy, niezależnie od ścieżki wywołania
-- (backend aplikacji albo kaskadowe usunięcie profilu przez Supabase Auth API).

create or replace function public.guard_last_admin() returns trigger
language plpgsql as $$
declare admin_count integer; was_admin boolean; becomes_admin boolean;
begin
  perform pg_advisory_xact_lock(hashtext('guard_last_admin'));

  if TG_OP = 'DELETE' then
    was_admin := old.role = 'admin' and old.is_active;
    if was_admin then
      select count(*) into admin_count from public.profiles where role = 'admin' and is_active = true and id <> old.id;
      if admin_count = 0 then raise exception 'LAST_ADMIN'; end if;
    end if;
    return old;
  end if;

  was_admin := old.role = 'admin' and old.is_active;
  becomes_admin := new.role = 'admin' and new.is_active;
  if was_admin and not becomes_admin then
    select count(*) into admin_count from public.profiles where role = 'admin' and is_active = true and id <> old.id;
    if admin_count = 0 then raise exception 'LAST_ADMIN'; end if;
  end if;
  return new;
end; $$;

drop trigger if exists profiles_guard_last_admin on public.profiles;
create trigger profiles_guard_last_admin
  before update or delete on public.profiles
  for each row execute function public.guard_last_admin();
