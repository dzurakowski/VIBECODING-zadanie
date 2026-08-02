-- Blokuje zapisy na wydarzenia, których termin już minął.

create or replace function public.register_for_event(p_event_id uuid, p_user_id uuid)
returns public.registrations language plpgsql security definer set search_path = public as $$
declare event_row public.events; result public.registrations;
begin
  select * into event_row from public.events where id = p_event_id for update;
  if not found then raise exception 'EVENT_NOT_FOUND'; end if;
  if event_row.status <> 'current' then raise exception 'EVENT_ARCHIVED'; end if;
  if event_row.event_datetime < now() then raise exception 'EVENT_PAST'; end if;
  if exists (select 1 from public.registrations where event_id = p_event_id and user_id = p_user_id) then raise exception 'ALREADY_REGISTERED'; end if;
  if (select count(*) from public.registrations where event_id = p_event_id) >= event_row.capacity then raise exception 'EVENT_FULL'; end if;
  insert into public.registrations(event_id, user_id) values (p_event_id, p_user_id) returning * into result;
  return result;
end; $$;
