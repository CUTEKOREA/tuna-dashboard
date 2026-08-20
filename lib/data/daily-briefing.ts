import rawBriefing from '../../public/data/tuna_daily_briefing.json';

export type DailyBriefingDigestItem = {
  readonly title: string;
};

export type DailyBriefingArticle = {
  readonly titleKo: string;
  readonly titleEn?: string;
  readonly paragraphs: readonly string[];
  /** 그 기사에서 만든 인포그래픽 경로. 매칭이 확실한 기사에만 붙는다 — 없는 날이 정상이다. */
  readonly image?: string;
};

export type DailyBriefing = {
  readonly date: string;
  readonly digest: readonly DailyBriefingDigestItem[];
  readonly articles: readonly DailyBriefingArticle[];
};

export type DailyBriefingTakeaways = {
  readonly situation: string;
  /** 실행 지침 문장. 관측·보고형 기사만 있는 날엔 없다 — 없는 걸 지어내지 않는다. */
  readonly actionPlan: string | null;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 2026-08-15: 8/14 실기사에서 '해야 한다' 종결 지침 확인 — 패턴 실측 확장 (scripts/sync_daily_briefing.py와 동기 유지)
const DIRECTIVE_PATTERN = /(촉구했다|권고했다|요구했다|제안했다|주문했다|요청했다|경고했다|해야 한다|필요가 있다)[.!?]?$/;

function recordAt(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}는 객체여야 합니다.`);
  }
  return value as Record<string, unknown>;
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${path}는 비어 있지 않은 문자열이어야 합니다.`);
  }
  return value.trim();
}

function arrayAt(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path}는 배열이어야 합니다.`);
  }
  return value;
}

function validateIsoDate(value: unknown): string {
  const rawDate = stringAt(value, 'date');
  if (!ISO_DATE_PATTERN.test(rawDate)) {
    throw new Error('date는 YYYY-MM-DD 형식이어야 합니다.');
  }
  const parsed = new Date(`${rawDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== rawDate) {
    throw new Error(`date가 유효하지 않습니다: ${rawDate}`);
  }
  return rawDate;
}

export function parseDailyBriefing(value: unknown): DailyBriefing {
  const root = recordAt(value, 'briefing');
  const digest = arrayAt(root.digest, 'digest').map((item, index) => {
    const record = recordAt(item, `digest[${index}]`);
    return { title: stringAt(record.title, `digest[${index}].title`) };
  });
  const articles = arrayAt(root.articles, 'articles').map((item, index) => {
    const record = recordAt(item, `articles[${index}]`);
    const titleEn = record.titleEn === undefined
      ? undefined
      : stringAt(record.titleEn, `articles[${index}].titleEn`);
    const image = record.image === undefined
      ? undefined
      : stringAt(record.image, `articles[${index}].image`);
    const paragraphs = arrayAt(
      record.paragraphs,
      `articles[${index}].paragraphs`,
    ).map((paragraph, paragraphIndex) => stringAt(
      paragraph,
      `articles[${index}].paragraphs[${paragraphIndex}]`,
    ));

    if (paragraphs.length === 0) {
      throw new Error(`articles[${index}].paragraphs는 비어 있을 수 없습니다.`);
    }

    return {
      titleKo: stringAt(record.titleKo, `articles[${index}].titleKo`),
      ...(titleEn ? { titleEn } : {}),
      ...(image ? { image } : {}),
      paragraphs,
    };
  });

  if (digest.length < 3) {
    throw new Error(`digest는 3건 이상이어야 합니다: ${digest.length}건`);
  }
  if (articles.length < 3) {
    throw new Error(`articles는 3건 이상이어야 합니다: ${articles.length}건`);
  }

  return {
    date: validateIsoDate(root.date),
    digest,
    articles,
  };
}

function asSentence(value: string): string {
  return /[.!?。]$/.test(value) ? value : `${value}.`;
}

function splitSentences(paragraph: string): string[] {
  return (paragraph.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function buildDailyBriefingTakeaways(
  briefing: DailyBriefing,
): DailyBriefingTakeaways {
  // W-03: SIT 전체에 숫자가 포함되면 된다 — 문장마다 요구하면 8/14처럼 정성 헤드라인이 섞인 날 깨진다.
  // 숫자 포함 헤드라인을 우선 선발하되 원문 순서를 보존한다.
  const numeric = briefing.digest.filter(({ title }) => /\d/.test(title));
  const rest = briefing.digest.filter(({ title }) => !/\d/.test(title));
  const topDigest = [...numeric, ...rest].slice(0, 2)
    .sort((a, b) => briefing.digest.indexOf(a) - briefing.digest.indexOf(b));
  if (topDigest.length !== 2 || !topDigest.some(({ title }) => /\d/.test(title))) {
    throw new Error('SIT에는 숫자가 포함된 다이제스트가 최소 1건 필요합니다.');
  }

  const actionPlan = briefing.articles
    .flatMap((article) => article.paragraphs)
    .flatMap(splitSentences)
    .find((sentence) => DIRECTIVE_PATTERN.test(sentence));

  // 2026-08-17: 실행 지침이 없는 날이 정상적으로 존재한다(8/17 기사 5건 전부 관측·보고형).
  // 이때 throw 하면 그날 회차가 통째로 막힌다. TAK 은 데일리 브리핑 렌더에 쓰이지 않으므로
  // 없으면 없는 대로 둔다 — 지침을 지어내는 것이 무-창작 원칙 위반이다.
  return {
    situation: topDigest.map(({ title }) => asSentence(title)).join(' '),
    actionPlan: actionPlan ?? null,
  };
}

export const dailyBriefing = parseDailyBriefing(rawBriefing);

/* ── V3 뉴스 임팩트 표현 (A안: 리드 기사 + 임팩트 넘버, 2026-08-15 사용자 확정) ── */

export type BriefingCategory = '시장' | '규제' | '원료가' | '무역' | '조업' | '뉴스';

/** 키워드 기반 태그 — 표시용 배지일 뿐 사실 주장 아님. 미매칭은 «뉴스» */
const CATEGORY_RULES: readonly { category: BriefingCategory; pattern: RegExp }[] = [
  { category: '규제', pattern: /WCPFC|IOTC|ICCAT|규제|위원회|쿼터|자원평가|FAD|협정|IUU/ },
  { category: '원료가', pattern: /원료가|원료 가|가격 상승|가격 하락|시세|달러.*(상승|하락)|USD [\d,]+/ },
  { category: '무역', pattern: /수출|수입|관세|무역|통관/ },
  { category: '조업', pattern: /조업|어획|선단|어장|폭풍|참사|해역/ },
  { category: '시장', pattern: /판매|소비자|소매|수요|시장|물가|인플레이션/ },
];

export function categorizeBriefingTitle(title: string): BriefingCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(title)) return rule.category;
  }
  return '뉴스';
}

export type BriefingImpactNumber = {
  /** 원문에서 그대로 뽑은 수치 토큰 (창작·재계산 금지) */
  readonly value: string;
  /** 수치를 품은 다이제스트 문구 (라벨) */
  readonly label: string;
};

const NUMBER_TOKEN_PATTERN = /([+-]?\d[\d,.]*\s?%|USD\s?[\d,.]+|\$[\d,.]+|[\d,.]+\s?(?:달러|톤|만))/;

/**
 * 다이제스트 문구에서 수치 토큰을 원문 그대로 추출해 임팩트 넘버로 쓴다.
 * 숫자가 없는 항목은 건너뛴다 — 수치를 만들어내지 않는다 (fail-closed).
 */
export function buildBriefingImpactNumbers(
  briefing: DailyBriefing,
  limit = 3,
): readonly BriefingImpactNumber[] {
  const numbers: BriefingImpactNumber[] = [];
  for (const item of briefing.digest) {
    const match = item.title.match(NUMBER_TOKEN_PATTERN);
    if (!match || match.index === undefined) continue;
    // 라벨 = 수치 앞의 문구 (조사·구두점 정리). 너무 짧으면 항목 전체에서 수치만 제거.
    let label = item.title
      .slice(0, match.index)
      .replace(/[,·]\s*$/, '')
      .replace(/(으로|로)\s*$/, '')
      .trim();
    if (label.length < 4) {
      label = item.title.replace(NUMBER_TOKEN_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
    }
    numbers.push({ value: match[0].trim(), label });
    if (numbers.length >= limit) break;
  }
  return numbers;
}
