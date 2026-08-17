import 'server-only';
import type { NextRequest } from 'next/server';
import { createDashboardUserClient } from './server-supabase';
import { isLocalDashboardE2ERequest } from './local-e2e-access';
import {
  evaluateDashboardOwnerClaims,
  type OwnerAccessResult,
} from './owner-policy';

export async function authorizeDashboardRequest(
  request?: NextRequest,
): Promise<OwnerAccessResult> {
  // 로컬 브라우저 회귀 테스트 경계 — proxy.ts와 같은 판정을 라우트 2차 방어에도 적용.
  // 판정 함수는 Vercel에서 무조건 거부하며, 그 외 환경에서도 DASHBOARD_E2E_MODE=local
  // 명시 옵트인 + 32자 이상 시크릿 일치 + 루프백 호스트가 모두 전제다. 리버스 프록시
  // 뒤 self-host는 루프백 판정이 흐려질 수 있으므로 프로덕션에 E2E env를 두지 말 것.
  if (request && isLocalDashboardE2ERequest(request)) {
    return { ok: true, email: 'local-e2e@invalid', subject: 'local-e2e' };
  }
  try {
    const client = await createDashboardUserClient();
    const { data, error } = await client.auth.getClaims();
    if (error || !data?.claims) {
      return { ok: false, status: 401, code: 'authentication_required' };
    }
    return evaluateDashboardOwnerClaims(
      data.claims,
      process.env.DASHBOARD_OWNER_EMAIL,
    );
  } catch {
    return { ok: false, status: 503, code: 'configuration_required' };
  }
}
