import rawBriefing from '../../public/data/tuna_daily_briefing.json';
import rawWeeklyBriefing from '../../public/data/tuna_weekly_briefing.json';

export type DailyBriefingDigestItem = {
  readonly title: string;
};

export type DailyBriefingFig = {
  readonly value: string;
  readonly caption: string;
};

export type DailyBriefingArticle = {
  readonly titleKo: string;
  readonly titleEn?: string;
  readonly paragraphs: readonly string[];
  readonly figs?: readonly DailyBriefingFig[];
};

export type DailyBriefing = {
  readonly date: string;
  readonly digest: readonly DailyBriefingDigestItem[];
  readonly articles: readonly DailyBriefingArticle[];
};

export type WeeklyBriefing = {
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly days: readonly DailyBriefing[];
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

function validateIsoDateField(value: unknown, field: string): string {
  const rawDate = stringAt(value, field);
  if (!ISO_DATE_PATTERN.test(rawDate)) {
    throw new Error(`${field}는 YYYY-MM-DD 형식이어야 합니다.`);
  }
  const parsed = new Date(`${rawDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== rawDate) {
    throw new Error(`${field}가 유효하지 않습니다: ${rawDate}`);
  }
  return rawDate;
}

function validateIsoDate(value: unknown): string {
  return validateIsoDateField(value, 'date');
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

    const figs = record.figs === undefined
      ? undefined
      : arrayAt(record.figs, `articles[${index}].figs`).map((fig, figIndex) => {
        const figRecord = recordAt(fig, `articles[${index}].figs[${figIndex}]`);
        return {
          value: stringAt(figRecord.value, `articles[${index}].figs[${figIndex}].value`),
          caption: stringAt(figRecord.caption, `articles[${index}].figs[${figIndex}].caption`),
        };
      });

    return {
      titleKo: stringAt(record.titleKo, `articles[${index}].titleKo`),
      ...(titleEn ? { titleEn } : {}),
      paragraphs,
      ...(figs ? { figs } : {}),
    };
  });

  if (digest.length < 3) {
    throw new Error(`digest는 3건 이상이어야 합니다: ${digest.length}건`);
  }
  if (articles.length < 3) {
    throw new Error(`articles는 3건 이상이어야 합니다: ${articles.length}건`);
  }
  // 「오늘의 수치」는 리드 기사 figs 만 읽는다. 비면 위젯이 조용히 빈칸으로 나가므로
  // 렌더가 아니라 빌드에서 막는다(파이프라인 게이트와 같은 조건).
  if ((articles[0].figs?.length ?? 0) !== 3) {
    throw new Error(
      `articles[0].figs는 3건이어야 합니다: ${articles[0].figs?.length ?? 0}건`,
    );
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

export function parseWeeklyBriefing(value: unknown): WeeklyBriefing {
  const root = recordAt(value, 'weeklyBriefing');
  const weekStart = validateIsoDateField(root.weekStart, 'weekStart');
  const weekEnd = validateIsoDateField(root.weekEnd, 'weekEnd');
  const monday = new Date(`${weekStart}T00:00:00Z`);
  const friday = new Date(monday);
  friday.setUTCDate(friday.getUTCDate() + 4);
  if (monday.getUTCDay() !== 1 || friday.toISOString().slice(0, 10) !== weekEnd) {
    throw new Error('weekStart와 weekEnd는 같은 주의 월요일부터 금요일이어야 합니다.');
  }
  const days = arrayAt(root.days, 'days').map((day, index) => (
    parseDailyBriefing(recordAt(day, `days[${index}]`))
  ));
  if (days.length === 0) {
    throw new Error('days는 비어 있을 수 없습니다.');
  }
  for (const day of days) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    if (weekday === 0 || weekday === 6) {
      throw new Error(`주말 브리핑은 주간 파일에 넣을 수 없습니다: ${day.date}`);
    }
    if (day.date < weekStart || day.date > weekEnd) {
      throw new Error(`days.date가 주간 범위를 벗어났습니다: ${day.date}`);
    }
  }
  for (let index = 1; index < days.length; index += 1) {
    if (days[index - 1].date === days[index].date) {
      throw new Error(`days.date가 중복되었습니다: ${days[index].date}`);
    }
    if (days[index - 1].date > days[index].date) {
      throw new Error('days는 날짜 오름차순이어야 합니다.');
    }
  }
  return { weekStart, weekEnd, days };
}

export const dailyBriefing = parseDailyBriefing(rawBriefing);
export const weeklyBriefing = parseWeeklyBriefing(rawWeeklyBriefing);

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
  /** 기사 figs 스트립의 값 (창작·재계산 금지) */
  readonly value: string;
  /** 기사 figs 스트립의 캡션 (라벨) */
  readonly label: string;
};

/** 리드 기사(articles[0])의 핵심수치 스트립(figs)을 순서대로 임팩트 넘버로 쓴다. */
export function buildBriefingImpactNumbers(
  briefing: DailyBriefing,
  limit = 3,
): readonly BriefingImpactNumber[] {
  const leadFigs = briefing.articles[0]?.figs ?? [];
  return leadFigs.slice(0, limit).map((fig) => ({
    value: fig.value,
    label: fig.caption,
  }));
}
