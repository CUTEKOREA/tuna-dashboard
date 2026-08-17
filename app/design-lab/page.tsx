/**
 * /design-lab — 배포 전 시안 랭킹 하네스. 사이드바에 없고 URL 직접 접근 전용.
 * 로직은 전부 클라이언트(localStorage). 이 파일은 noindex 메타만 붙이는 서버 셸이다
 * — Next.js는 'use client' 파일에서 metadata export를 허용하지 않는다.
 */
import type { Metadata } from 'next';
import DesignLabGallery from '@/components/design-lab/DesignLabGallery';

export const metadata: Metadata = {
  title: '디자인 랩 | 참치왕국',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignLabPage() {
  return <DesignLabGallery />;
}
