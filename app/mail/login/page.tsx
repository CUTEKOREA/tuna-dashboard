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

export default function MailLoginPage() {
  return <MailAdminLogin />;
}
