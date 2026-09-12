/**
 * 공공데이터포털(data.go.kr) 호출 한 입구.
 *
 * 라우트마다 따로 짜다가 같은 함정을 세 번 밟았다. 여기 한 곳에 모은다.
 *
 *  1. **키가 여러 벌이고 서비스마다 통하는 벌이 다르다.** 계정 하나가 인증키를 여러 개 갖고,
 *     활용신청은 그중 한 벌에 붙는다. 재발급하면 이전 값이 죽는다. 그래서 한 벌만 골라 쓰면
 *     어느 벌을 고르든 절반이 코드 30으로 막힌다 — 목록으로 시도하고 키 계통 코드면 다음 벌로 넘어간다.
 *  2. **봉투 이름이 기관마다 다르다.** 해수부 1192000 은 `responseJson`, 관세청은 `response` 다.
 *     이름을 놓치면 본문 대신 전체 객체를 뒤지게 되고, 행이 안 잡혀 **빈 배열이 성공으로** 나간다.
 *  3. **JSON 을 달라고 해도 XML 로 준다.** 관세청 운송비용은 `resultType=json` 을 무시한다.
 *     키·활용신청 오류도 XML(OpenAPI_ServiceResponse)로 오고, 그때 HTTP 상태는 200 이기도 하다.
 */
import { dataGoKrKeys, DATA_GO_KR_KEY_ERRORS } from './env';

export type DataGoEnvelope = {
  rows: any[];
  code: string;
  message: string;
  total: number | null;
};

/** 성공으로 인정하는 결과코드. 그 밖의 코드는 전부 실패다. */
const SUCCESS_CODES = new Set(['00', '0']);

export function readDataGoEnvelope(text: string): DataGoEnvelope {
  let code = '';
  let message = '';
  let rows: any[] = [];
  let total: number | null = null;

  try {
    const data = JSON.parse(text);
    const envelope = data?.responseJson ?? data?.response ?? data?.OpenAPI_ServiceResponse ?? data;
    const body = envelope?.body ?? data?.body ?? data;
    const header = envelope?.header ?? envelope?.cmmMsgHeader ?? data?.header ?? {};
    code = String(header.resultCode ?? header.returnReasonCode ?? data?.resultCode ?? '');
    message = String(header.resultMsg ?? header.returnAuthMsg ?? header.errMsg ?? data?.resultMsg ?? '');
    const items = body?.items?.item ?? body?.items ?? body?.item ?? [];
    rows = Array.isArray(items) ? items : items ? [items] : [];
    const totalRaw = body?.totalCount ?? header?.totalCount;
    total = totalRaw != null ? Number(totalRaw) : null;
  } catch {
    code = text.match(/<resultCode>([^<]*)</)?.[1] ?? text.match(/<returnReasonCode>([^<]*)</)?.[1] ?? '';
    message =
      text.match(/<resultMsg>([^<]*)</)?.[1] ??
      text.match(/<returnAuthMsg>([^<]*)</)?.[1] ??
      text.match(/<errMsg>([^<]*)</)?.[1] ??
      text.slice(0, 200);
    for (const m of text.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const row: Record<string, string> = {};
      for (const f of m[1].matchAll(/<(\w+)>([^<]*)<\/\1>/g)) row[f[1]] = f[2];
      rows.push(row);
    }
    const totalText = text.match(/<totalCount>(\d+)</)?.[1];
    total = totalText != null ? Number(totalText) : null;
  }
  return { rows, code, message, total };
}

export type DataGoResult =
  | { ok: true; rows: any[]; total: number | null; code: string }
  | { ok: false; error: string; code: string };

/**
 * GET 한 번. 인증키만 바꿔 가며 최대 키 개수만큼 시도한다.
 * 실패는 실패로 돌려준다 — 빈 배열을 성공으로 위장하지 않는다.
 */
export async function fetchDataGo(
  url: string,
  params: Record<string, string>,
  { timeout = 10000 }: { timeout?: number } = {},
): Promise<DataGoResult> {
  const keys = dataGoKrKeys();
  if (keys.length === 0) return { ok: false, error: '인증키가 설정되지 않았다', code: 'ENV' };

  let last: DataGoResult = { ok: false, error: '시도한 적 없음', code: '' };
  for (const key of keys) {
    const query = new URLSearchParams({ ...params, serviceKey: key });
    try {
      const response = await fetch(`${url}?${query.toString()}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(timeout),
      });
      const { rows, code, message, total } = readDataGoEnvelope(await response.text());

      if (SUCCESS_CODES.has(code)) return { ok: true, rows, total, code };
      if (code) {
        last = { ok: false, error: `결과코드 ${code}: ${message}`, code };
        // 키 계통이면 다음 키가 통할 수 있다. 그 밖의 코드는 키를 바꿔도 같다.
        if (DATA_GO_KR_KEY_ERRORS.has(code)) continue;
        return last;
      }
      // 결과코드가 없는 응답도 있다. 행이 있으면 통과, 없으면 실패다 —
      // 여기서 빈 배열을 통과시키면 조용한 오답이 그대로 화면에 오른다.
      if (rows.length > 0) return { ok: true, rows, total, code: '' };
      if (!response.ok) return { ok: false, error: `HTTP ${response.status}: ${message}`, code: String(response.status) };
      return { ok: false, error: message || '결과코드도 행도 없는 응답', code: '' };
    } catch (error: any) {
      last = { ok: false, error: error?.name === 'TimeoutError' ? '시간 초과' : String(error?.message ?? error), code: 'NET' };
    }
  }
  return last;
}
