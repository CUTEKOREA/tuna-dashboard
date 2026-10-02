'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { FleetDailyDetailState } from '@/lib/contracts/fleet-daily-api';
import { validateFleetDailyDetailResponse } from '@/lib/contracts/fleet-daily-api';
import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';

/** 일일보고의 선박 표기 → 화면 이름. 원장(추정실적)은 P/COMM·P/QUE·P/GRA 로 줄여 써서 표가 따로다. */
const FLEET_LABEL: Record<string, string> = {
  'P/MAS': '마스터', 'P/DIS': '디스커버러', 'P/FORE': '포러너', 'P/PATH': '패스파인더',
  'P/COM': '커맨더', 'P/QUEEN': '퀸', 'P/GRACE': '그레이스',
};
const RECENT = 7;

/** 비고의 교대 인원 이름을 가린다 - 실명은 /fleet 선장 실적표에만 둔다. 예: 「어기교대(홍길동 → 김철수)」 → 「어기교대(○○○ → ○○○)」 */
export function maskCrewNames(note: string): string {
  return note.replace(/(교대\s*\()([^)]*)(\))/g, (_, open: string, inner: string, close: string) =>
    open + inner.replace(/[가-힣]{2,4}/g, '○○○') + close);
}

/**
 * 대서양 선망 7척의 선박별 현황.
 * 어획 계열·적재 증가일은 공개 집계에서, 적재량·어창·비고는 /fleet 와 같은 보호 경로에서 받는다.
 * 위치(좌표)는 받지도 그리지도 않는다 - /fleet 밖으로 내보내지 않는 원칙.
 */
export function AtlanticVesselTable() {
  const [state, setState] = useState<FleetDailyDetailState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/fleet/daily', {
      cache: 'no-store', credentials: 'same-origin',
      headers: { Accept: 'application/json' }, signal: controller.signal,
    }).then(async (response) => {
      const payload = validateFleetDailyDetailResponse(await response.json());
      if (response.ok && payload.ok) return setState({ status: 'ready', detail: payload.detail });
      if (!payload.ok) {
        const denied = ['authentication_required', 'fleet_access_required', 'mfa_required'].includes(payload.code);
        return setState({ status: denied ? 'denied' : 'error', code: payload.code });
      }
      setState({ status: 'error', code: 'fleet_data_unavailable' });
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setState({ status: 'error', code: 'fleet_data_unavailable' });
    });
    return () => controller.abort();
  }, []);

  const { dates, atlantic } = fleetDailyPublicSeries;
  const detail = state.status === 'ready' ? state.detail.atlantic.vessels : [];
  const rows = Object.entries(atlantic.vessels).map(([key, values]) => {
    const recent = values.slice(-RECENT);
    const d = detail.find((v) => v.name === key);
    const note = d?.note && d.note.trim() !== '-' ? maskCrewNames(d.note) : null;
    return {
      key, label: FLEET_LABEL[key] ?? key,
      today: values[values.length - 1],
      recentSum: recent.reduce<number>((a, v) => a + (v ?? 0), 0),
      lastLoad: atlantic.lastLoadIncreaseDates[key] ?? null,
      loadedMt: d?.loadedMt ?? null,
      hold: d?.holdCapacity ?? null,
      note,
    };
  });
  const fromDate = dates[Math.max(0, dates.length - RECENT)];
  const md = (iso: string | null) => (iso ? `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}` : '-');
  const t = (v: number | null | undefined) => (v == null ? '-' : v.toLocaleString('en-US'));

  return (
    <div className="pf-table-wrap" style={{ margin: '0 0 8px' }}>
      <table className="pf-table" data-atlantic-vessels>
        <thead>
          <tr>
            <th>선박</th><th>금일 어획 (톤)</th><th>최근 {RECENT}보고일 (톤)</th><th>마지막 적재 증가</th>
            <th>적재 (톤)</th><th>어창 (㎥)</th><th>비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td>{t(r.today)}</td>
              <td>{t(r.recentSum)}</td>
              <td>{md(r.lastLoad)}</td>
              <td>{state.status === 'ready' ? t(r.loadedMt) : '·'}</td>
              <td>{state.status === 'ready' ? t(r.hold?.value) : '·'}</td>
              <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 180 }}>{state.status === 'ready' ? (r.note ?? '-') : '·'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pf-src" style={{ margin: '6px 0 0' }}>
        어획은 보고일 기준(최근 {RECENT}보고일 = {md(fromDate)}~{md(dates[dates.length - 1])} 보고) · 주말 어획은 다음 보고의 적재 증가로만 드러난다.
        {' '}적재·어창·비고는 {state.status === 'ready' ? `${state.detail.reportDate} 보고` : state.status === 'loading' ? '불러오는 중' : <>로그인 후 표시(<Link href="/fleet">/fleet</Link>와 같은 권한)</>}.
        {' '}어창은 국제대서양참치보존위원회(ICCAT) 등록 용적.
      </p>
    </div>
  );
}
