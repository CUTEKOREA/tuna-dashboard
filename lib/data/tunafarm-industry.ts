/**
 * 「시장 이해 > 참치 양식」 인테이크.
 *
 * 보고서 발행본(HTML)에서 표·캡션·콜아웃을 장(章) 단위로 추출한 JSON 을 읽는다.
 * 추출기는 `scripts/extract_tunafarm_tables.py` 이고, **재계산하지 않는다** —
 * 표의 숫자는 발행본에 실린 문자열 그대로다.
 *
 * 이렇게 하는 이유는 하나다. 이 편은 적대 검증 세 축에서 P0 아홉을 받았고
 * 그 정정이 전부 발행본에 들어가 있다. 대시보드가 숫자를 다시 계산하면
 * 정정 이전 값으로 되돌아갈 길이 생긴다. **발행본이 정본이다.**
 *
 * 아키텍처 가드: 원본 JSON import 는 이 인테이크 모듈에서만 한다.
 */
import raw from './tunafarm-tables.json';

/** 표 한 줄. `emph` 는 발행본에서 합계·강조 행이던 것. */
export interface TunafarmTableRow {
  cells: string[];
  emph: boolean;
}

export interface TunafarmTable {
  /** 발행본에서 이 표를 감싸던 절 제목 */
  title: string;
  cols: string[];
  rows: TunafarmTableRow[];
  caption: string;
}

export interface TunafarmCallout {
  kind: 'warn' | 'good' | 'note';
  head: string;
  body: string;
}

export interface TunafarmChapter {
  tables: TunafarmTable[];
  callouts: TunafarmCallout[];
}

const CHAPTERS = raw as Record<string, TunafarmChapter>;

/**
 * 장 이름은 발행본의 로마숫자 표기 그대로다(예: `Ⅲ · 명부`).
 * 단계 키(s01~)와의 짝은 콘텐츠 모듈이 정한다 — 인테이크는 이름만 안다.
 */
export function getTunafarmChapter(name: string): TunafarmChapter {
  return CHAPTERS[name] ?? { tables: [], callouts: [] };
}

export function getTunafarmChapterNames(): string[] {
  return Object.keys(CHAPTERS);
}

/** 검증용 — 발행본에서 옮긴 표·콜아웃 총수. */
export function getTunafarmCounts(): { tables: number; callouts: number } {
  let tables = 0;
  let callouts = 0;
  for (const c of Object.values(CHAPTERS)) {
    tables += c.tables.length;
    callouts += c.callouts.length;
  }
  return { tables, callouts };
}
