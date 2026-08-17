'use client';

import { useMemo, useState } from 'react';

import { Grid, Panel, Pills, Sec, Stat, Stats, Table } from '../../panofi/PanofiUi';
import {
  companyName,
  headsOf,
  registrySorted,
  reportFor,
  seasiaCountries,
  summaryFor,
  tagCounts,
  text,
  type Cell,
  type Row,
} from '@/lib/data/seasia-processors';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const num = (v: number | null | undefined) =>
  v === null || v === undefined ? '–' : v.toLocaleString('ko-KR');

/**
 * 셀 하나를 그린다. 값 뒤에 원본이 붙인 신뢰도 태그와 등급을 작게 단다 —
 * 어느 칸이 확인된 사실이고 어느 칸이 추정인지 표에서 바로 읽혀야 한다.
 * 색은 새로 만들지 않고 기존 토큰(--cosmo-*)만 쓴다. 테마 전환은 그래서 따라온다.
 */
function CellView({ c }: { c: Cell | undefined }) {
  if (!c) return <>–</>;
  const tags = c.tags ?? [];
  const grades = c.grade ? (Array.isArray(c.grade) ? c.grade : [c.grade]) : [];
  return (
    <>
      {text(c)}
      {c.sub?.length ? (
        <span className="pf-stat-k" style={{ marginLeft: 6 }}>{c.sub.join(' · ')}</span>
      ) : null}
      {grades.map((g) => (
        <span key={g} className="pf-stat-k" style={{ marginLeft: 6 }}>[{g}]</span>
      ))}
      {tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="pf-stat-k"
          style={{
            marginLeft: 6,
            color: t === '확인' || t === '실측' ? 'var(--cosmo-ok)'
              : t === '추정' ? 'var(--cosmo-warn)' : 'var(--cosmo-muted)',
          }}
        >
          {t}
        </span>
      ))}
    </>
  );
}

function RowsTable({ rows, limit }: { rows: Row[]; limit?: number }) {
  const heads = headsOf(rows);
  const shown = limit ? rows.slice(0, limit) : rows;
  if (!heads.length) return <div className="pf-note">자료 없음</div>;
  return (
    <Table head={heads}>
      {shown.map((r, i) => (
        <tr key={i}>
          {heads.map((h) => (
            <td key={h} style={{ textAlign: 'left' }}><CellView c={r[h]} /></td>
          ))}
        </tr>
      ))}
    </Table>
  );
}

const SRC = '신라교역 사내 조사보고서 — 15_수산물_가공공장';

export function ProcessorsTab() {
  const options = useMemo(
    () => seasiaCountries.map((c) => ({ key: c, label: c })),
    [],
  );
  const [country, setCountry] = useState<string>(seasiaCountries[0] ?? '태국');
  const [showAll, setShowAll] = useState(false);

  const rep = reportFor(country);
  const sum = summaryFor(country);
  const tags = tagCounts(country);
  const registry = useMemo(() => registrySorted(country), [country]);

  if (!rep || !sum) {
    return <div className="pf-note">조사 자료를 불러오지 못했다.</div>;
  }

  const src = `${SRC} · ${rep.sourceFile} · SHA-256 ${rep.sha256}…`;
  const top = registry[0];

  return (
    <>
      <Pills options={options} value={country} onChange={setCountry} label="조사 대상국" />

      <Stats>
        <Stat k="심층 프로파일" v={String(sum.profiles)} unit="개사" d="원본 비교표 전량" />
        <Stat k="인수 매력도 순위" v={String(sum.shortlist)} unit="개사" d="Shortlist 등재" />
        <Stat k="한국 거래처 전수" v={num(sum.registry)} unit="개사" d="통관 표기 기준" />
        <Stat k="총 선적 건수" v={num(sum.totalShipments)} unit="건" d="전수표 합계" />
        <Stat
          k="최다 선적사"
          v={num(sum.topShipments)}
          unit="건"
          d={top ? companyName(top) : '–'}
        />
      </Stats>

      <Sec>주목 상위 후보</Sec>
      <Grid>
        <Panel
          span={12}
          title="Top Picks"
          unit={`${country} · 조사자 선별`}
          note="조사자가 먼저 추린 후보다. 아래 심층 프로파일·순위표와 함께 읽는다."
          src={src}
        >
          <RowsTable rows={rep.topPicks} />
        </Panel>
      </Grid>

      <Sec>인수 매력도 순위</Sec>
      <Grid>
        <Panel
          span={12}
          title="Shortlist"
          unit="규모 · 인증 · 한국 비중 · 접근성 · 종합"
          note="등급은 원본 보고서가 매긴 것을 그대로 옮겼다. 재계산하거나 재정렬하지 않았다."
          src={src}
        >
          <RowsTable rows={rep.shortlist} />
        </Panel>
      </Grid>

      <Sec>심층 프로파일</Sec>
      <Grid>
        <Panel
          span={12}
          title={`${country} 가공사 비교표`}
          unit={`${sum.profiles}개사 · 소재·지배구조·캐파·품목·인증·재무`}
          note={`칸마다 붙은 표시는 원본이 매긴 신뢰도다 — ${Object.entries(tags)
            .map(([k, v]) => `${k} ${v}`)
            .join(' · ')}. 「불가」는 자료를 못 구했다는 뜻이지 값이 0이라는 뜻이 아니다.`}
          src={src}
        >
          <RowsTable rows={rep.profiles} />
        </Panel>
      </Grid>

      <Sec>한국 거래처 전수표</Sec>
      <Grid>
        <Panel
          span={12}
          title="통관 표기 기준 전수"
          unit={`${num(sum.registry)}개사 · 선적 건수 내림차순`}
          note={
            showAll
              ? '전량 표시 중이다.'
              : `상위 30개사만 보이고 있다. 전체 ${num(sum.registry)}개사를 보려면 아래 버튼을 누른다.`
          }
          src={src}
        >
          <RowsTable rows={registry} limit={showAll ? undefined : 30} />
          {registry.length > 30 && (
            <button
              type="button"
              className="pf-more"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? '상위 30개사만 보기' : `전체 ${num(registry.length)}개사 보기`}
            </button>
          )}
        </Panel>
      </Grid>
    </>
  );
}
