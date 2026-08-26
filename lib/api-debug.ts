/**
 * API endpoint debug logger
 *
 * fetch 실패·schema 불일치를 명시적으로 console.error로 노출.
 * Vercel runtime logs(--follow -x)에서 디버깅 가능.
 *
 * 사용:
 *   import { logApiAttempt, logApiSuccess, logApiFail } from '@/lib/api-debug';
 *
 *   logApiAttempt('beef/korea-supply', { source: 'KOSIS', url });
 *   try {
 *     const res = await fetch(url, ...);
 *     if (!res.ok) {
 *       logApiFail('beef/korea-supply', `HTTP ${res.status}`, await res.text().catch(() => ''));
 *       return null;
 *     }
 *     const json = await res.json();
 *     if (!json?.data?.length) {
 *       logApiFail('beef/korea-supply', 'schema empty', JSON.stringify(json).slice(0, 200));
 *       return null;
 *     }
 *     logApiSuccess('beef/korea-supply', `${json.data.length} records`);
 *     return json.data;
 *   } catch (e) {
 *     logApiFail('beef/korea-supply', 'exception', String(e));
 *     return null;
 *   }
 */

const tag = '[api-debug]';

export function logApiAttempt(endpoint: string, meta: Record<string, any> = {}) {
  // attempt는 info level — debug 시에만 활성화 위해 console.log 사용
  if (process.env.API_DEBUG === '1') {
    console.log(`${tag} ATTEMPT ${endpoint}`, JSON.stringify(meta));
  }
}

export function logApiSuccess(endpoint: string, summary: string) {
  if (process.env.API_DEBUG === '1') {
    console.log(`${tag} ✓ SUCCESS ${endpoint} - ${summary}`);
  }
}

export function logApiFail(endpoint: string, reason: string, evidence?: string) {
  // 실패는 항상 error (Vercel logs에서 항시 가시화)
  const evShort = evidence ? evidence.replace(/\s+/g, ' ').slice(0, 300) : '';
  console.error(`${tag} ✗ FAIL ${endpoint} - ${reason}${evShort ? ` | evidence: ${evShort}` : ''}`);
}

export function logSchemaIssue(endpoint: string, expected: string, actual: any) {
  const actualStr = typeof actual === 'string' ? actual : JSON.stringify(actual);
  console.error(`${tag} ⚠ SCHEMA ${endpoint} - expected: ${expected} | actual: ${actualStr.slice(0, 200)}`);
}
