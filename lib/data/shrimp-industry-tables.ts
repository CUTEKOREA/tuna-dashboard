/**
 * 「시장 이해 > 새우」 표 인테이크.
 *
 * 보고서 발행본(HTML)의 표를 단계 단위로 추출한 JSON 을 읽는다.
 * 추출기는 `scripts/build_commodity_tables.py` 이고 **재계산하지 않는다** —
 * 표의 숫자는 발행본에 실린 문자열 그대로다.
 *
 * 발행본이 정본인 이유는 정정이 거기 쌓이기 때문이다. 이 편은 「세번 안에 종이 없다」가
 * 한 장을 통째로 차지할 만큼 종 경계(흰다리·블랙타이거·홍새우)가 표마다 다르게 걸리고,
 * 그 경계가 발행본의 머리행·주석에 붙어 있다. 숫자만 다시 계산하면 경계가 떨어진다.
 *
 * 아키텍처 가드: 원본 JSON import 는 이 인테이크 모듈에서만 한다.
 */
import raw from './shrimp-tables.json';

export interface ShrimpReportTable {
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
  tables: ShrimpReportTable[];
}

const STAGES = raw as Record<string, Stage>;

/** 단계 키(`s01`~`s09`)로 그 단계에 배치된 보고서 표를 가져온다. */
export function getShrimpTables(stage: string): ShrimpReportTable[] {
  return STAGES[stage]?.tables ?? [];
}

export function getShrimpTableStages(): string[] {
  return Object.keys(STAGES);
}

/** 검증용 — 발행본에서 옮긴 표 총수. */
export function getShrimpTableCount(): number {
  let n = 0;
  for (const s of Object.values(STAGES)) n += s.tables.length;
  return n;
}
