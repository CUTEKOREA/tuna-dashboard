create table if not exists public.mail_send_requests (
  request_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'sent', 'unknown')),
  gmail_message_id text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists mail_send_requests_user_created_idx
  on public.mail_send_requests (user_id, created_at desc);

alter table public.mail_send_requests enable row level security;
revoke all on table public.mail_send_requests from anon, authenticated;

create or replace function public.reserve_mail_send_request(
  p_user_id uuid,
  p_request_id uuid
)
returns table(decision text, existing_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_minute_count bigint;
  v_day_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));

  select request.status
    into v_status
    from public.mail_send_requests as request
   where request.request_id = p_request_id
     and request.user_id = p_user_id;

  if found then
    return query select 'existing'::text, v_status;
    return;
  end if;

  if exists (
    select 1
      from public.mail_send_requests as request
     where request.request_id = p_request_id
       and request.user_id <> p_user_id
  ) then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select
    count(*) filter (where request.created_at >= now() - interval '1 minute'),
    count(*) filter (where request.created_at >= now() - interval '1 day')
    into v_minute_count, v_day_count
    from public.mail_send_requests as request
   where request.user_id = p_user_id;

  if v_minute_count >= 5 or v_day_count >= 50 then
    return query select 'rate_limited'::text, null::text;
    return;
  end if;

  insert into public.mail_send_requests (request_id, user_id, status)
  values (p_request_id, p_user_id, 'pending');

  return query select 'reserved'::text, 'pending'::text;
end;
$$;

create or replace function public.complete_mail_send_request(
  p_user_id uuid,
  p_request_id uuid,
  p_status text,
  p_gmail_message_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'unknown') then
    return false;
  end if;

  update public.mail_send_requests
     set status = p_status,
         gmail_message_id = case when p_status = 'sent' then p_gmail_message_id else null end,
         completed_at = now()
   where request_id = p_request_id
     and user_id = p_user_id
     and status = 'pending';

  return found;
end;
$$;

revoke all on function public.reserve_mail_send_request(uuid, uuid) from public, anon, authenticated;
revoke all on function public.complete_mail_send_request(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.reserve_mail_send_request(uuid, uuid) to service_role;
grant execute on function public.complete_mail_send_request(uuid, uuid, text, text) to service_role;
