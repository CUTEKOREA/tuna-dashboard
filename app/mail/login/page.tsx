import type { Metadata } from 'next';
import MailAdminLogin from '@/components/MailAdminLogin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '관리자 로그인 | 참치왕국',
  robots: {
    index: false,
    follow: false,
  },
};

type LoginReturnPath = '/mail' | '/fleet';

export function resolveLoginReturnPath(value: string | string[] | undefined): LoginReturnPath {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === '/fleet' || candidate === '/mail' ? candidate : '/mail';
}

export default async function MailLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  return <MailAdminLogin returnTo={resolveLoginReturnPath(params.next)} />;
}
