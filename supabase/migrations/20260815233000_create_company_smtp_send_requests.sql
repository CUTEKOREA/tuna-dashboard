create table if not exists public.company_smtp_send_requests (
  request_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  status text not null check (status in ('pending', 'sent', 'unknown')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists company_smtp_send_requests_user_created_idx
  on public.company_smtp_send_requests (user_id, created_at desc);

alter table public.company_smtp_send_requests enable row level security;
revoke all on table public.company_smtp_send_requests from public;
revoke all on table public.company_smtp_send_requests from anon, authenticated;
grant select, insert, update, delete on table public.company_smtp_send_requests to service_role;

create or replace function public.reserve_company_smtp_send_request(
  p_user_id uuid,
  p_request_id uuid,
  p_payload_hash text
)
returns table(decision text, existing_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.company_smtp_send_requests%rowtype;
  v_minute_count bigint;
  v_day_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('company_smtp_send:' || p_user_id::text, 0)
  );

  if p_payload_hash !~ '^[a-f0-9]{64}$' then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select request.* into v_existing
    from public.company_smtp_send_requests as request
   where request.request_id = p_request_id
     and request.user_id = p_user_id;

  if found then
    if v_existing.payload_hash <> p_payload_hash then
      return query select 'invalid'::text, null::text;
      return;
    end if;
    return query select 'existing'::text, v_existing.status;
    return;
  end if;

  if exists (
    select 1 from public.company_smtp_send_requests as request
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
    from public.company_smtp_send_requests as request
   where request.user_id = p_user_id;

  if v_minute_count >= 5 or v_day_count >= 50 then
    return query select 'rate_limited'::text, null::text;
    return;
  end if;

  insert into public.company_smtp_send_requests (request_id, user_id, payload_hash, status)
  values (p_request_id, p_user_id, p_payload_hash, 'pending');
  return query select 'reserved'::text, 'pending'::text;
end;
$$;

create or replace function public.complete_company_smtp_send_request(
  p_user_id uuid,
  p_request_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'unknown') then return false; end if;
  update public.company_smtp_send_requests
     set status = p_status,
         completed_at = now()
   where request_id = p_request_id
     and user_id = p_user_id
     and status = 'pending';
  return found;
end;
$$;

revoke all on function public.reserve_company_smtp_send_request(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.complete_company_smtp_send_request(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_company_smtp_send_request(uuid, uuid, text) to service_role;
grant execute on function public.complete_company_smtp_send_request(uuid, uuid, text) to service_role;
