import rawBriefing from '../../public/data/tuna_daily_briefing.json';

export type DailyBriefingDigestItem = {
  readonly title: string;
};

export type DailyBriefingArticle = {
  readonly titleKo: string;
  readonly titleEn?: string;
  readonly paragraphs: readonly string[];
};

export type DailyBriefing = {
  readonly date: string;
  readonly digest: readonly DailyBriefingDigestItem[];
  readonly articles: readonly DailyBriefingArticle[];
};

export type DailyBriefingTakeaways = {
  readonly situation: string;
  readonly actionPlan: string;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DIRECTIVE_PATTERN = /(촉구했다|권고했다|요구했다)[.!?]?$/;

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
  const topDigest = briefing.digest.slice(0, 2);
  if (topDigest.length !== 2 || topDigest.some(({ title }) => !/\d/.test(title))) {
    throw new Error('SIT에는 숫자가 포함된 상위 다이제스트 2건이 필요합니다.');
  }

  const actionPlan = briefing.articles
    .flatMap((article) => article.paragraphs)
    .flatMap(splitSentences)
    .find((sentence) => DIRECTIVE_PATTERN.test(sentence));

  if (!actionPlan) {
    throw new Error('기사 본문에서 실행 지침 문장을 찾지 못했습니다.');
  }

  return {
    situation: topDigest.map(({ title }) => asSentence(title)).join(' '),
    actionPlan,
  };
}

export const dailyBriefing = parseDailyBriefing(rawBriefing);
