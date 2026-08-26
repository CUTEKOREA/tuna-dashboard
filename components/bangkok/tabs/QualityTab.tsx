'use client';

import { Grid, Panel, Sec, Stat, Stats, Table } from '../../panofi/PanofiUi';
import {
  BANGKOK_REPORT_URL,
  bangkokCorrectionSummary,
  bangkokDupes,
  bangkokMeta,
  bangkokMismatch,
  bangkokPriceFlags,
} from '@/lib/data/bangkok-weekly';

const SRC = '방콕사무소 주간보고 종합분석 (2020.05~2026.08, 287주)';

const num = (v: number) => v.toLocaleString('ko-KR');

/** 지표별 커버 주차의 커버율 — 고유 보고 주차 대비 */
const cover = (weeks: number) =>
  `커버율 ${Math.round((weeks / bangkokMeta.reports) * 100)}%`;

/** 정정 유형 한글 라벨 (L-01) — 미등록 유형은 원문 그대로 노출 */
const CORRECTION_LABELS: Record<string, string> = {
  'decimal-comma': '소수점 콤마 표기 정정',
  'rejection-scale': '리젝션 물량 단위 정정',
};

/* 데이터 품질 탭 — 커버리지·정합성·정제 내역을 있는 그대로 보여준다. */
export function QualityTab() {
  const correctionTotal = bangkokCorrectionSummary.reduce((sum, c) => sum + c.count, 0);
  return (
    <>
      <Stats>
        <Stat k="원본 파일" v={num(bangkokMeta.files)} unit="개" d="중복 포함" />
        <Stat
          k="고유 보고"
          v={num(bangkokMeta.reports)}
          unit="주"
          d={`${bangkokMeta.first} ~ ${bangkokMeta.last}`}
        />
        <Stat k="시세 커버" v={num(bangkokMeta.priceWeeks)} unit="주" d={cover(bangkokMeta.priceWeeks)} />
        <Stat k="하역 커버" v={num(bangkokMeta.unloadWeeks)} unit="주" d={cover(bangkokMeta.unloadWeeks)} />
        <Stat k="캐너리 커버" v={num(bangkokMeta.canneryWeeks)} unit="주" d={cover(bangkokMeta.canneryWeeks)} />
        <Stat k="트레이더 커버" v={num(bangkokMeta.traderWeeks)} unit="주" d={cover(bangkokMeta.traderWeeks)} />
        <Stat k="클레임 커버" v={num(bangkokMeta.claimWeeks)} unit="주" d={cover(bangkokMeta.claimWeeks)} />
      </Stats>

      <Sec>집계·보고 정합성</Sec>
      <Grid>
        <Panel
          span={12}
          title="집계값과 보고값 불일치"
          unit={`${num(bangkokMismatch.length)}건`}
          note="주간 행을 직접 합산한 값과 보고서 발표치가 다른 구간. 척수 단위는 (척), 물량 단위는 (MT)이며 항목명에 지표가 적혀 있다."
          src={SRC}
        >
          <Table head={['항목', '집계값', '보고값', '차이', '출처 보고서']}>
            {bangkokMismatch.map((m) => (
              <tr key={`${m.where}-${m.sourceFile}`}>
                <td>{m.where}</td>
                <td>{num(m.calc)}</td>
                <td>{num(m.reported)}</td>
                <td>{num(m.diff)}</td>
                <td>{m.sourceFile}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>

      <Sec>원문 정제 내역</Sec>
      <Grid>
        <Panel
          span={4}
          title="표기 정정 요약"
          unit="(건)"
          note={`원문 표기 오류를 유형별로 정정한 내역 - 총 ${num(correctionTotal)}건.`}
          src={SRC}
        >
          <Table head={['유형', '건수']}>
            {bangkokCorrectionSummary.map((c) => (
              <tr key={c.type}>
                <td>{CORRECTION_LABELS[c.type] ?? c.type}</td>
                <td>{num(c.count)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={8}
          title="중복 보고"
          unit={`${num(bangkokDupes.length)}건`}
          note="같은 주차에 파일이 두 개인 경우 - 채택 파일 한 개만 시계열에 반영했다."
          src={SRC}
        >
          <Table head={['보고일', '채택 파일', '제외 파일']}>
            {bangkokDupes.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.kept}</td>
                <td>{d.dropped}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6}
          title="시세 이상치 의심"
          unit="(달러/톤)"
          note="이웃 주차 중앙값 대비 급변한 시세 - 정정하지 않고 의심 플래그만 남겼다."
          src={SRC}
        >
          <Table head={['보고일', '보고 시세', '이웃 중앙값']}>
            {bangkokPriceFlags.map((f) => (
              <tr key={f.date}>
                <td>{f.date}</td>
                <td>{num(f.value)}</td>
                <td>{num(f.neighborsMedian)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6}
          title="원본 보고서"
          note="정제 전 원문을 그대로 담은 다크 표시본."
          src={SRC}
        >
          <div className="pf-note">
            <a href={BANGKOK_REPORT_URL} target="_blank" rel="noopener">
              원본 보고서 열기(새 탭)
            </a>
          </div>
        </Panel>
      </Grid>
    </>
  );
}
