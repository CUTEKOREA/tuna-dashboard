import type { Metadata } from 'next';
import MailAdminLogin from '@/components/MailAdminLogin';
import { resolveProtectedReturnPath } from '@/lib/auth/protected-return';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '관리자 로그인 | 참치왕국',
  robots: {
    index: false,
    follow: false,
  },
};

export { resolveProtectedReturnPath as resolveLoginReturnPath } from '@/lib/auth/protected-return';

export default async function MailLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  return <MailAdminLogin returnTo={resolveProtectedReturnPath(params.next)} />;
}
