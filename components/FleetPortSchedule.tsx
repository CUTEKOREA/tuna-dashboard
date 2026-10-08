'use client';

import { useEffect, useState } from 'react';

import type { FleetPortSchedule as Schedule } from '@/lib/contracts/fleet-port-schedule';
import { validateFleetPortScheduleResponse } from '@/lib/contracts/fleet-port-schedule';

type State =
  | { status: 'loading' }
  | { status: 'ready'; schedule: Schedule }
  | { status: 'denied' | 'error' };

const crewText = (label: string, roles: readonly string[]) =>
  roles.length ? `${label} ${roles.length}명: ${roles.join(' · ')}` : null;

/** 화면 표 — 보호 경로에서 받은 일정만 그린다(서버 렌더·정적 번들에는 값이 없다). */
export function FleetPortScheduleTable({ schedule }: { schedule: Schedule }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table data-fleet-port-schedule style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: 760 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border, #e2e4e9)' }}>
            <th style={{ padding: '6px 8px' }}>선박</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>선적량 (톤)</th>
            <th style={{ padding: '6px 8px' }}>입항지</th>
            <th style={{ padding: '6px 8px' }}>입항</th>
            <th style={{ padding: '6px 8px' }}>출항</th>
            <th style={{ padding: '6px 8px' }}>옵서버 교체</th>
            <th style={{ padding: '6px 8px' }}>선원 교대 (직책)</th>
            <th style={{ padding: '6px 8px' }}>수리 계획</th>
          </tr>
        </thead>
        <tbody>
          {schedule.rows.map((r) => {
            const crew = [crewText('승선', r.crewOn), crewText('하선', r.crewOff)].filter(Boolean).join(' / ');
            return (
              <tr key={r.vessel} style={{ borderBottom: '1px solid var(--card-border, #eef0f3)', verticalAlign: 'top' }}>
                <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.vessel}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.loadedMt == null ? '-' : r.loadedMt.toLocaleString('en-US')}</td>
                <td style={{ padding: '6px 8px' }}>{r.port ?? '미정'}</td>
                <td style={{ padding: '6px 8px' }}>{r.eta ?? '미정'}</td>
                <td style={{ padding: '6px 8px' }}>{r.etd ?? '미정'}</td>
                <td style={{ padding: '6px 8px' }}>{r.observerChange ? '교체' : '-'}</td>
                <td style={{ padding: '6px 8px', minWidth: 220 }}>{crew || '-'}</td>
                <td style={{ padding: '6px 8px', minWidth: 220 }}>{r.repair ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 선박·수역 탭 — 「선박 입항일정 및 선원 교대/선박 수리 계획」. /api/fleet/daily 와 같은 권한이다. */
export default function FleetPortSchedule() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/fleet/schedule', {
      cache: 'no-store', credentials: 'same-origin',
      headers: { Accept: 'application/json' }, signal: controller.signal,
    }).then(async (response) => {
      const payload = validateFleetPortScheduleResponse(await response.json());
      if (response.ok && payload.ok) return setState({ status: 'ready', schedule: payload.schedule });
      if (!payload.ok && ['authentication_required', 'fleet_access_required', 'mfa_required'].includes(payload.code)) {
        return setState({ status: 'denied' });
      }
      setState({ status: 'error' });
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setState({ status: 'error' });
    });
    return () => controller.abort();
  }, []);

  return (
    <section style={{ marginTop: 18 }} aria-labelledby="fleet-port-schedule-title">
      <h3 id="fleet-port-schedule-title" style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>입항 일정 · 선원 교대 · 수리 계획</h3>
      <p style={{ margin: '0 0 8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {state.status === 'ready'
          ? `${state.schedule.asOf} 기준 · 원문 「선박 입항일정 및 선원 교대/선박 수리 계획」 · 선원 교대는 직책만 표시(실명 제외)`
          : state.status === 'loading'
            ? '불러오는 중'
            : state.status === 'denied'
              ? '로그인 후 표시(선박 상세와 같은 권한)'
              : '일정 자료를 불러오지 못했습니다'}
      </p>
      {state.status === 'ready' && <FleetPortScheduleTable schedule={state.schedule} />}
    </section>
  );
}
