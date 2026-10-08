-- 원문·이메일·IP·토큰 없이 고정 분류와 가명 해시만 집계한다.
create table public.dashboard_security_buckets (
  kind text not null check (kind in ('auth_denied', 'sensitive_read_request')),
  actor_hash text not null check (actor_hash ~ '^[a-f0-9]{64}$'),
  route_group text not null check (route_group in ('protected_api', 'sensitive_api')),
  window_start timestamptz not null,
  event_count integer not null check (event_count between 1 and 100000),
  check (
    (kind = 'auth_denied' and route_group = 'protected_api')
    or (kind = 'sensitive_read_request' and route_group = 'sensitive_api')
  ),
  primary key (kind, actor_hash, route_group, window_start)
);

create index dashboard_security_buckets_retention_idx
  on public.dashboard_security_buckets (window_start);

create table public.dashboard_security_alerts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  kind text not null check (kind in (
    'auth_denied', 'sensitive_read_request', 'firewall_attack', 'firewall_rule_anomaly'
  )),
  route_group text not null check (route_group in (
    'protected_api', 'sensitive_api', 'vercel_firewall'
  )),
  event_count integer not null check (event_count between 1 and 100000),
  occurred_at timestamptz not null default pg_catalog.now(),
  related_alerts integer not null default 1 check (related_alerts >= 1),
  actor_hash text check (actor_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz,
  dedupe_key text not null unique check (pg_catalog.length(dedupe_key) between 1 and 180),
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'unknown', 'suppressed')),
  claimed_at timestamptz,
  completed_at timestamptz,
  unique (kind, actor_hash, window_start),
  check (
    (kind = 'auth_denied' and route_group = 'protected_api')
    or (kind = 'sensitive_read_request' and route_group = 'sensitive_api')
    or (kind in ('firewall_attack', 'firewall_rule_anomaly') and route_group = 'vercel_firewall')
  ),
  check (
    (kind in ('auth_denied', 'sensitive_read_request') and actor_hash is not null and window_start is not null)
    or (kind in ('firewall_attack', 'firewall_rule_anomaly') and actor_hash is null and window_start is null)
  ),
  check (
    (status = 'pending' and claimed_at is null and completed_at is null)
    or (status = 'sending' and claimed_at is not null and completed_at is null)
    or (status in ('sent', 'unknown') and claimed_at is not null and completed_at is not null)
    or (status = 'suppressed' and claimed_at is null and completed_at is not null)
  )
);

create index dashboard_security_alerts_pending_idx
  on public.dashboard_security_alerts (kind, occurred_at desc, id) where status = 'pending';
create index dashboard_security_alerts_claimed_idx
  on public.dashboard_security_alerts (claimed_at desc) where claimed_at is not null;
create index dashboard_security_alerts_retention_idx
  on public.dashboard_security_alerts (occurred_at);

create table public.dashboard_firewall_event_receipts (
  event_key text primary key check (event_key ~ '^[a-f0-9]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  kind text not null check (kind in ('firewall_attack', 'firewall_rule_anomaly')),
  received_at timestamptz not null default pg_catalog.now()
);

create index dashboard_firewall_event_receipts_retention_idx
  on public.dashboard_firewall_event_receipts (received_at);

alter table public.dashboard_security_buckets enable row level security;
alter table public.dashboard_security_alerts enable row level security;
alter table public.dashboard_firewall_event_receipts enable row level security;

revoke all on table public.dashboard_security_buckets from public, anon, authenticated;
revoke all on table public.dashboard_security_alerts from public, anon, authenticated;
revoke all on table public.dashboard_firewall_event_receipts from public, anon, authenticated;

grant select, insert, update, delete on table public.dashboard_security_buckets to service_role;
grant select, insert, update, delete on table public.dashboard_security_alerts to service_role;
grant select, insert, delete on table public.dashboard_firewall_event_receipts to service_role;

create or replace function public.record_dashboard_security_event(
  p_kind text,
  p_actor_hash text,
  p_route_group text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_window_start timestamptz;
  v_actor_hash text;
  v_event_count integer;
  v_threshold integer;
  v_dedupe_key text;
begin
  if p_kind is null or p_kind not in ('auth_denied', 'sensitive_read_request')
    or p_actor_hash is null or p_actor_hash !~ '^[a-f0-9]{64}$'
    or p_route_group is null or p_route_group not in ('protected_api', 'sensitive_api')
    or (p_kind = 'auth_denied' and p_route_group <> 'protected_api')
    or (p_kind = 'sensitive_read_request' and p_route_group <> 'sensitive_api')
  then
    return false;
  end if;

  -- 익명 거부는 입력 해시가 달라도 한 버킷으로 모아 행 수를 제한한다.
  v_actor_hash := case when p_kind = 'auth_denied'
    then pg_catalog.repeat('0', 64) else p_actor_hash end;
  v_window_start := pg_catalog.date_trunc('hour', v_now)
    + (extract(minute from v_now)::integer / 10) * interval '10 minutes';
  v_threshold := case when p_kind = 'auth_denied' then 30 else 300 end;

  insert into public.dashboard_security_buckets as bucket (
    kind, actor_hash, route_group, window_start, event_count
  ) values (p_kind, v_actor_hash, p_route_group, v_window_start, 1)
  on conflict (kind, actor_hash, route_group, window_start)
  do update set event_count = least(bucket.event_count + 1, 100000)
  returning event_count into v_event_count;

  if v_event_count >= v_threshold then
    v_dedupe_key := p_kind || ':' || v_actor_hash || ':'
      || extract(epoch from v_window_start)::bigint::text;
    insert into public.dashboard_security_alerts as alert (
      kind, route_group, event_count, occurred_at, actor_hash, window_start, dedupe_key
    ) values (
      p_kind, p_route_group, v_event_count, v_now, v_actor_hash, v_window_start, v_dedupe_key
    )
    on conflict (dedupe_key) do update
      set event_count = greatest(alert.event_count, excluded.event_count)
      where alert.status = 'pending';
  end if;

  return true;
end;
$$;

create or replace function public.record_dashboard_firewall_event(
  p_event_key text,
  p_payload_hash text,
  p_kind text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inserted_key text;
  v_existing_payload_hash text;
  v_existing_kind text;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if p_event_key is null or p_event_key !~ '^[a-f0-9]{64}$'
    or p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$'
    or p_kind is null or p_kind not in ('firewall_attack', 'firewall_rule_anomaly')
  then
    raise exception 'Invalid security event' using errcode = '22023';
  end if;

  insert into public.dashboard_firewall_event_receipts (event_key, payload_hash, kind, received_at)
  values (p_event_key, p_payload_hash, p_kind, v_now)
  on conflict (event_key) do nothing
  returning event_key into v_inserted_key;

  if v_inserted_key is null then
    select receipt.payload_hash, receipt.kind into v_existing_payload_hash, v_existing_kind
      from public.dashboard_firewall_event_receipts as receipt
     where receipt.event_key = p_event_key;
    if v_existing_payload_hash = p_payload_hash and v_existing_kind = p_kind then
      return 'duplicate';
    end if;
    return 'conflict';
  end if;

  insert into public.dashboard_security_alerts (
    kind, route_group, event_count, occurred_at, dedupe_key
  ) values (
    p_kind, 'vercel_firewall', 1, v_now, 'firewall:' || p_event_key
  );
  return 'recorded';
end;
$$;

create or replace function public.claim_dashboard_security_alert()
returns table (
  id uuid,
  kind text,
  route_group text,
  event_count integer,
  occurred_at timestamptz,
  related_alerts integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz;
  v_alert_id uuid;
  v_pending_ids uuid[];
  v_suppressed_count bigint;
begin
  -- 서로 다른 서버 인스턴스·cron 재시도도 전역 발송 간격을 공유한다.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('dashboard_security_alert_claim', 0)
  );
  v_now := pg_catalog.clock_timestamp();

  -- SMTP 수락 여부가 불명확한 오래된 예약은 재전송하지 않는다.
  update public.dashboard_security_alerts as alert
     set status = 'unknown', completed_at = v_now
   where alert.status = 'sending' and alert.claimed_at <= v_now - interval '1 hour';

  delete from public.dashboard_security_buckets as bucket
   where bucket.window_start < v_now - interval '24 hours';
  delete from public.dashboard_security_alerts as alert
   where alert.occurred_at < v_now - interval '30 days'
     and (alert.claimed_at is null or alert.claimed_at <= v_now - interval '1 hour');
  delete from public.dashboard_firewall_event_receipts as receipt
   where receipt.received_at < v_now - interval '30 days';

  if exists (
    select 1 from public.dashboard_security_alerts as alert
     where alert.claimed_at > v_now - interval '1 hour'
  ) then
    return;
  end if;

  -- 한 스냅샷에서 잠근 후보만 묶는다. 선택 직후 들어온 경보는 다음 발송 대상으로 남긴다.
  select pg_catalog.array_agg(candidate.id order by
    case when candidate.kind in ('firewall_attack', 'firewall_rule_anomaly') then 0 else 1 end,
    candidate.occurred_at desc, candidate.id
  ) into v_pending_ids
    from (
      select alert.id, alert.kind, alert.occurred_at
        from public.dashboard_security_alerts as alert
       where alert.status = 'pending'
       for update skip locked
    ) as candidate;
  v_alert_id := v_pending_ids[1];

  if v_alert_id is null then return; end if;

  -- 대표 경보 외의 대기 행은 보존하되 이후 cron에서 다시 보내지 않는다.
  update public.dashboard_security_alerts as alert
     set status = 'suppressed', completed_at = v_now
   where alert.status = 'pending' and alert.id = any(v_pending_ids) and alert.id <> v_alert_id;
  get diagnostics v_suppressed_count = row_count;

  return query
  update public.dashboard_security_alerts as alert
     set status = 'sending', claimed_at = v_now,
         related_alerts = least(v_suppressed_count + 1, 2147483647)::integer
   where alert.id = v_alert_id and alert.status = 'pending'
  returning alert.id, alert.kind, alert.route_group, alert.event_count, alert.occurred_at,
    alert.related_alerts;
end;
$$;

create or replace function public.complete_dashboard_security_alert(
  p_id uuid,
  p_status text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_id is null or p_status is null or p_status not in ('sent', 'unknown') then
    return false;
  end if;

  update public.dashboard_security_alerts as alert
     set status = p_status, completed_at = pg_catalog.clock_timestamp()
   where alert.id = p_id and alert.status = 'sending';
  return found;
end;
$$;

revoke all on function public.record_dashboard_security_event(text, text, text) from public, anon, authenticated;
revoke all on function public.record_dashboard_firewall_event(text, text, text) from public, anon, authenticated;
revoke all on function public.claim_dashboard_security_alert() from public, anon, authenticated;
revoke all on function public.complete_dashboard_security_alert(uuid, text) from public, anon, authenticated;

grant execute on function public.record_dashboard_security_event(text, text, text) to service_role;
grant execute on function public.record_dashboard_firewall_event(text, text, text) to service_role;
grant execute on function public.claim_dashboard_security_alert() to service_role;
grant execute on function public.complete_dashboard_security_alert(uuid, text) to service_role;
