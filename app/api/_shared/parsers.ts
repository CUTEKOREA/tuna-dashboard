/**
 * API 응답 파서 — XML/JSON 공통 헬퍼
 *
 * 사용 예:
 *   const items = parseDataGoKrXml(text);
 *   const json = await safeJsonParse(text);
 */

/**
 * 공공데이터포털 XML 응답 파서 (regex 기반, 외부 라이브러리 불필요).
 * 응답 구조: <response><body><items><item>...</item>...</items></body></response>
 */
export function parseDataGoKrXml(text: string): { ok: boolean; items: Record<string, string>[]; resultCode?: string; resultMsg?: string } {
  if (!text || !text.includes("<response>")) return { ok: false, items: [] };

  const resultCode = text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
  const resultMsg = text.match(/<resultMsg>([^<]+)<\/resultMsg>/)?.[1];

  const items: Record<string, string>[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const fieldRegex = /<([\w]+)>([^<]*)<\/\1>/g;

  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(text)) !== null) {
    const fields: Record<string, string> = {};
    let fm: RegExpExecArray | null;
    while ((fm = fieldRegex.exec(m[1])) !== null) {
      fields[fm[1]] = fm[2];
    }
    items.push(fields);
  }

  return { ok: resultCode === "00", items, resultCode, resultMsg };
}

/**
 * KAMIS XML 응답 파서 (도매/소매 가격).
 * 응답 구조: <result><data>...</data></result>
 */
export function parseKamisXml(text: string): { ok: boolean; items: Record<string, string>[] } {
  if (!text) return { ok: false, items: [] };

  // KAMIS는 다양한 XML 구조 — 단순화: <data>...</data> 블록 추출
  const items: Record<string, string>[] = [];
  const dataRegex = /<data>([\s\S]*?)<\/data>/g;
  const fieldRegex = /<([\w]+)>([^<]*)<\/\1>/g;

  let m: RegExpExecArray | null;
  while ((m = dataRegex.exec(text)) !== null) {
    const fields: Record<string, string> = {};
    let fm: RegExpExecArray | null;
    while ((fm = fieldRegex.exec(m[1])) !== null) {
      fields[fm[1]] = fm[2];
    }
    items.push(fields);
  }

  return { ok: items.length > 0, items };
}

/**
 * 안전한 JSON 파싱 — 실패 시 null 반환.
 */
export function safeJsonParse(text: string | undefined): any | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 숫자 안전 변환 (콤마·공백 처리).
 */
export function safeNum(v: any, fallback = 0): number {
  if (v == null) return fallback;
  const s = String(v).replace(/,/g, "").trim();
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}
