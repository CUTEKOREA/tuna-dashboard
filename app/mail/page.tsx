import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Home from '../page';
import { authorizeMailRequest } from '@/lib/mail/request-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '관리자 메일 | 참치왕국',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MailPage() {
  const access = await authorizeMailRequest(false);
  if (!access.ok) notFound();

  return <Home />;
}