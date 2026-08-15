create or replace function public.reserve_mail_message_action(
  p_user_id uuid,
  p_request_id uuid,
  p_gmail_message_id_hash text
)
returns table(decision text, existing_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_message_id_hash text;
  v_minute_count bigint;
  v_day_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('mail_message_action:' || p_user_id::text, 0)
  );

  if p_gmail_message_id_hash !~ '^[a-f0-9]{64}$' then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select action.status, action.gmail_message_id_hash
    into v_status, v_message_id_hash
    from public.mail_message_actions as action
   where action.request_id = p_request_id
     and action.user_id = p_user_id;

  if found then
    if v_message_id_hash <> p_gmail_message_id_hash then
      return query select 'invalid'::text, null::text;
      return;
    end if;
    if v_status = 'unknown' then
      update public.mail_message_actions
         set status = 'pending',
             completed_at = null
       where request_id = p_request_id
         and user_id = p_user_id
         and status = 'unknown';
      return query select 'reserved'::text, 'pending'::text;
      return;
    end if;
    return query select 'existing'::text, v_status;
    return;
  end if;

  if exists (
    select 1
      from public.mail_message_actions as action
     where action.request_id = p_request_id
       and action.user_id <> p_user_id
  ) then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  if exists (
    select 1
      from public.mail_message_actions as action
     where action.user_id = p_user_id
       and action.gmail_message_id_hash = p_gmail_message_id_hash
       and action.request_id <> p_request_id
       and action.status in ('pending', 'unknown')
  ) then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select
    count(*) filter (where action.created_at >= now() - interval '1 minute'),
    count(*) filter (where action.created_at >= now() - interval '1 day')
    into v_minute_count, v_day_count
    from public.mail_message_actions as action
   where action.user_id = p_user_id;

  if v_minute_count >= 50 or v_day_count >= 200 then
    return query select 'rate_limited'::text, null::text;
    return;
  end if;

  insert into public.mail_message_actions (request_id, user_id, action, status, gmail_message_id_hash)
  values (p_request_id, p_user_id, 'trash', 'pending', p_gmail_message_id_hash);

  return query select 'reserved'::text, 'pending'::text;
end;
$$;

revoke all on function public.reserve_mail_message_action(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_mail_message_action(uuid, uuid, text) to service_role;
