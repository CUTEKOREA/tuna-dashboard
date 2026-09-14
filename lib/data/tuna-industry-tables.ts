/**
 * 「시장 이해 > 참치」 표 인테이크.
 *
 * 보고서 발행본(HTML)의 표를 단계 단위로 추출한 JSON 을 읽는다.
 * 추출기는 `scripts/build_commodity_tables.py` 이고 **재계산하지 않는다** —
 * 표의 숫자는 발행본에 실린 문자열 그대로다.
 *
 * 근거는 「한국 참치 산업 해부」 통합본(2026-08-23)이다. 대시보드 차트가 같은 주제를 다른
 * 원자료로 이미 그리는 표 셋(어종별 세계 어획·국가 순위·선사별 선단)은 숫자 두 벌이 뜨지 않게 뺐다.
 *
 * 아키텍처 가드: 원본 JSON import 는 이 인테이크 모듈에서만 한다.
 */
import raw from './tuna-tables.json';

export interface TunaReportTable {
  /** 표 바로 앞 소제목. 없으면 헤더 서명(앞 세 열)이 대신 온다 */
  title: string;
  head: string[];
  /** 열마다 우측정렬 여부. 발행본의 `td.num` 에서 왔다 */
  num: boolean[];
  rows: string[][];
  /** 보고서 절 키(`s02` 등). 대시보드 단계 키와 다르다 */
  sid: string;
  section: string;
  /** 절 본문 안의 문자 오프셋. 원문 순서로 되돌릴 때 쓴다 */
  ord: number;
  caption?: string;
  note?: string;
}

interface Stage {
  tables: TunaReportTable[];
}

const STAGES = raw as Record<string, Stage>;

/** 단계 키(`s01`~`s09`)로 그 단계에 배치된 보고서 표를 가져온다. */
export function getTunaTables(stage: string): TunaReportTable[] {
  return STAGES[stage]?.tables ?? [];
}

export function getTunaTableStages(): string[] {
  return Object.keys(STAGES);
}

/** 검증용 — 발행본에서 옮긴 표 총수. */
export function getTunaTableCount(): number {
  let n = 0;
  for (const s of Object.values(STAGES)) n += s.tables.length;
  return n;
}
