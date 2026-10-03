import 'server-only';

import { parseDashboardOwnerEmails } from '@/lib/auth/owner-policy';

/** 회사 발신 계정은 대시보드 열람 허용 목록과 별도로 소유자에게만 허용한다. */
export function canSendCompanySmtp(email: string): boolean {
  const owners = parseDashboardOwnerEmails(process.env.DASHBOARD_OWNER_EMAIL);
  return owners?.includes(email.trim().toLowerCase()) ?? false;
}
