import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1시간 캐시

type PriceEntry = {
  date: string;
  skj_bkk?: number;
  skj_mnt?: number;
  skj_abj?: number;
  skj_sey?: number;
  skj_vig?: number;
  yf_abj?: number;
  yf_sey?: number;
  yf_vig?: number;
};

const HUB_LABELS = {
  bkk: '방콕',
  mnt: '만타',
  abj: '아비장',
  sey: '세이셸',
  vig: '비고',
} as const;

/**
 * Atuna 참치 도매가 — 현재는 public/data/atuna_prices.json 정적 데이터 기반.
 * 향후 Atuna 공개 Price Index 페이지·RSS·계약 데이터 등 외부 fetch로 확장 가능.
 *
 * 출처 노트: Atuna 본 사이트는 paywall이며 공개 API가 없음. 라이브 자동화를
 * 위해서는 다음 옵션 검토 필요:
 *   - Atuna 공개 Skipjack Price Index 페이지 HTML 스크래핑 (주 1회)
 *   - 신라교역 내부 매입가 시스템 연동 (preferred)
 *   - FAO GLOBEFISH 월간 보고서 PDF 파싱
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'atuna_prices.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const history: PriceEntry[] = JSON.parse(raw);

    // 허브별 최신 가격 추출 (날짜 내림차순으로 가장 가까운 값)
    const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
    const latestByHub: Record<string, { price: number; date: string }> = {};
    const fields: (keyof PriceEntry)[] = ['skj_bkk', 'skj_mnt', 'skj_abj', 'skj_sey', 'skj_vig', 'yf_abj', 'yf_sey', 'yf_vig'];

    for (const field of fields) {
      const entry = sorted.find((e) => typeof e[field] === 'number');
      if (entry) {
        latestByHub[field] = { price: entry[field] as number, date: entry.date };
      }
    }

    const latestDate = sorted[0]?.date ?? null;

    return NextResponse.json({
      source: 'public/data/atuna_prices.json (manual sync — Atuna paywall)',
      latestDate,
      hubLabels: HUB_LABELS,
      latestByHub,
      history,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        source: 'error-fallback',
        latestDate: null,
        latestByHub: {},
        history: [],
        error: String(err),
      },
      { status: 500 }
    );
  }
}
