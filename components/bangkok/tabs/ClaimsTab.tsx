'use client';

import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Table } from '../../panofi/PanofiUi';
import { bangkokClaimsYear, bangkokSalt, bangkokWeeklyKpi } from '@/lib/data/bangkok-weekly';
import { C } from '../palette';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const num = (v: number) => Math.round(v).toLocaleString('ko-KR');

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key, name, color, ...extra,
});

const SRC_BASE = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;
const SRC_SALT = `하이솔트 원장 「${bangkokSalt.source}」 (${num(bangkokSalt.rows)}건, 최신 ${bangkokSalt.latest})`;

/** 정산 상태 원문(영문 코드) → 한글 라벨 (L-01) */
const SETTLE_LABELS: Record<string, string> = {
  'CLOSED $0': '종결 (0달러)',
  'CLAIM RECORDED': '클레임 기록',
  OPEN: '미결',
  'PHYSICAL REJECT': '현물 리젝트',
  'SOLD / VERIFY': '매각·확인 대기',
  'DATA CHECK': '데이터 점검',
};

/* ── 품질 클레임 (하이솔트 / 리젝트) ────────────────────────────────────── */

export function ClaimsTab() {
  const yearly = bangkokSalt.yearly;

  // 발표치(주간 누적 중복 포함) — 경고 문구용 누계. 원장 건수는 bangkokSalt.rows(761)가 정본이고
  // claimsYear의 salt_unique 합(568)은 주간보고 파생 환산치라 여기 쓰지 않는다 (2026-08-15 반증 정정).
  const saltPublished = bangkokClaimsYear.reduce((a, c) => a + c.saltPublished, 0);

  const canneryTop = [...bangkokSalt.byCannery].sort((a, b) => b.issueT - a.issueT).slice(0, 8);
  const reeferTop = [...bangkokSalt.byReefer].sort((a, b) => b.issueT - a.issueT).slice(0, 8);
  const settlement = [...bangkokSalt.settlement].sort((a, b) => b.rows - a.rows);
  const settleTotal = settlement.reduce((a, s) => a + s.rows, 0);

  return (
    <>
      <Sec>연도별 추이</Sec>
      <Grid>
        <Panel
          span={6}
          title="클레임 제기액 vs 확정액"
          unit="천 달러"
          note={`주간보고 발표 건수 누계 ${num(saltPublished)}건은 주간 누적 중복 포함이라 원장 ${num(bangkokSalt.rows)}건과 다르다 - 건수·금액은 원장 기준으로 읽는다.`}
          src={`${SRC_BASE} · ${SRC_SALT}`}
        >
          <Chart
            data={yearly.map((y) => ({
              연도: String(y.year),
              제기액: Math.round(y.claimUsd / 1000),
              확정액: Math.round(y.finalUsd / 1000),
            }))}
            x="연도"
            height={240}
            series={[
              S('제기액', '제기액', C.s1, { type: 'bar', fmt: (v) => `${num(v)}천 달러` }),
              S('확정액', '확정액', C.s2, { type: 'bar', fmt: (v) => `${num(v)}천 달러` }),
            ]}
            yFmt={num}
          />
          <Legend items={[
            { name: '제기액', color: C.s1, box: true },
            { name: '확정액', color: C.s2, box: true },
          ]} />
        </Panel>

        <Panel
          span={6}
          title="이슈 물량 vs 리젝트 물량"
          unit="톤 (t)"
          note="이슈 물량은 하이솔트 지적이 걸린 하역분 전체, 리젝트 물량은 그중 실제 인수 거부된 분량이다."
          src={SRC_SALT}
        >
          <Chart
            data={yearly.map((y) => ({
              연도: String(y.year),
              이슈물량: Math.round(y.issueT),
              리젝트물량: Math.round(y.rejectT),
            }))}
            x="연도"
            height={240}
            series={[
              S('이슈물량', '이슈 물량', C.s1, { type: 'bar', fmt: (v) => `${num(v)}t` }),
              S('리젝트물량', '리젝트 물량', C.danger, { type: 'bar', fmt: (v) => `${num(v)}t` }),
            ]}
            yFmt={num}
          />
          <Legend items={[
            { name: '이슈 물량', color: C.s1, box: true },
            { name: '리젝트 물량', color: C.danger, box: true },
          ]} />
        </Panel>
      </Grid>

      <Sec>주체별 집중도</Sec>
      <Grid>
        <Panel
          span={6}
          title="캐너리별 하이솔트"
          note={`전체 ${num(bangkokSalt.byCannery.length)}개 캐너리 중 이슈 물량 상위 8.`}
          src={SRC_SALT}
        >
          <Table head={['캐너리', '건수 (건)', '이슈 물량 (t)', '확정액 (달러)']}>
            {canneryTop.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td>{num(r.rows)}</td>
                <td>{num(r.issueT)}</td>
                <td>{num(r.finalUsd)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6}
          title="운반선별 하이솔트"
          note={`전체 ${num(bangkokSalt.byReefer.length)}척 중 이슈 물량 상위 8.`}
          src={SRC_SALT}
        >
          <Table head={['운반선', '건수 (건)', '이슈 물량 (t)', '확정액 (달러)']}>
            {reeferTop.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td>{num(r.rows)}</td>
                <td>{num(r.issueT)}</td>
                <td>{num(r.finalUsd)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>

      <Sec>정산 상태</Sec>
      <Grid>
        <Panel
          span={12}
          title="정산 상태 요약"
          note={`원장 ${num(bangkokSalt.rows)}건 전량 분류 - 상태 합계 ${num(settleTotal)}건.`}
          src={SRC_SALT}
        >
          <Table head={['정산 상태', '건수 (건)', '비중 (%)']}>
            {settlement.map((s) => (
              <tr key={s.status}>
                <td>{SETTLE_LABELS[s.status] ?? s.status}</td>
                <td>{num(s.rows)}</td>
                <td>{((s.rows / settleTotal) * 100).toFixed(1)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>
    </>
  );
}
