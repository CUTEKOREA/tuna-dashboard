-- 발송 활성화·SMTP 설정과 무관하게 인증된 cron에서 보관기간을 정리한다.
create or replace function public.prune_dashboard_security_events()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz;
begin
  -- claim과 동일한 잠금으로 독립 정리 작업도 발송 예약과 직렬화한다.
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
  perform public.prune_dashboard_security_events();
  v_now := pg_catalog.clock_timestamp();

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

revoke all on function public.prune_dashboard_security_events() from public, anon, authenticated;
revoke all on function public.claim_dashboard_security_alert() from public, anon, authenticated;
grant execute on function public.prune_dashboard_security_events() to service_role;
grant execute on function public.claim_dashboard_security_alert() to service_role;
