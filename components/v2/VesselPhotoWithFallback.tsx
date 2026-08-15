/**
 * VesselPhotoWithFallback — Deep Sea Command V2 히어로 선박 배경 (스펙 §6)
 *
 * Grok Imagine 생성 실사풍 야간 위성뷰를 기본으로, 이미지 로드 실패 시
 * VesselTopSVG(데이터 발광 폴백)로 자동 전환한다. 호출부는 src·fallback만 넘긴다.
 */
'use client';

import React, { useState } from 'react';

export interface VesselPhotoWithFallbackProps {
  src: string;
  fallback: React.ReactNode;
  /** 접근성상 장식 이미지 — 기본 빈 alt */
  alt?: string;
}

export default function VesselPhotoWithFallback({ src, fallback, alt = '' }: VesselPhotoWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 히어로 배경은 wrapper가 크기를 제어하는 장식 이미지. next/image의 레이아웃 계약이 절대배치 슬롯과 충돌한다.
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }}
      loading="eager"
      decoding="async"
    />
  );
}
