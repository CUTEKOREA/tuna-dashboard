import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';
import { optionalEnv } from '../../_shared/env';

export const dynamic = 'force-dynamic';

type SourceStatus = 'live' | 'unavailable';

const STATIC_REGULATORY_RADAR = [
  {
    id: 'us_antidumping',
    name: '미국 DOC 반덤핑 관세',
    status: 'yellow',
    riskLevel: 'Moderate',
    currentRate_Percent: 2.34,
    lastReview: '2025-03 (DOC POR-19)',
    impact: '에콰도르산 새우 대미 수출 시 2.34% 반덤핑 관세 부과 중. POR-20 갱신 예정.',
    affectedOrigins: ['Ecuador', 'India', 'Vietnam'],
    policyRef: '(수시 2025-15) 미 상호주의 대응 수산분야 비관세장벽 영향 연구',
    origin: 'static',
    asOf: '2025-03',
  },
  {
    id: 'eu_csddd',
    name: 'EU 공급망 실사 지침 (CSDDD)',
    status: 'red',
    riskLevel: 'High',
    effectiveDate: '2027-07 (Phase 1)',
    impact: '새우 양식/가공 공정의 강제노동·환경 파괴 실사 의무화. 미이행 시 글로벌 매출 5% 과징금.',
    affectedOrigins: ['Thailand', 'Vietnam', 'India', 'Indonesia'],
    policyRef: '(일반 2024-06) 신통상규범 확대에 따른 수산분야 영향 및 대응방안',
    origin: 'static',
    asOf: '2024-06',
  },
  {
    id: 'us_simp',
    name: '미국 SIMP 이력추적 의무화',
    status: 'yellow',
    riskLevel: 'Moderate',
    targetSpecies: 'Shrimp (HS 0306.17)',
    impact: '미국 수입 시 catch-to-plate 전 과정 이력추적 데이터 제출 의무. NOAA Fisheries 관할.',
    affectedOrigins: ['All'],
    policyRef: '(일반 2025-13) 미국 이력 추적 의무화에 따른 수산물 수출기업 대응실태',
    origin: 'static',
    asOf: '2025',
  },
  {
    id: 'asean_sps',
    name: 'ASEAN SPS/TBT 비관세장벽',
    status: 'green',
    riskLevel: 'Low',
    impact: '한-ASEAN FTA 하 관세 철폐 진행 중이나, SPS 기술규정 상이성으로 인한 비관세 비용 잔존.',
    affectedOrigins: ['Vietnam', 'Thailand', 'Indonesia'],
    policyRef: '(연구보고서 23-01) 아세안 경제통합의 진행상황 평가: TBT와 SPS를 중심으로',
    origin: 'static',
    asOf: '2023',
  },
] as const;

async function fetchWtoAlerts(key: string): Promise<unknown[]> {
  try {
    const url = new URL('https://api.wto.org/timeseries/v1/data');
    url.searchParams.set('i', 'SPS_NTF');
    url.searchParams.set('r', 'all');
    url.searchParams.set('ps', '2024');
    url.searchParams.set('pc', '0306');
    url.searchParams.set('mode', 'codes');
    url.searchParams.set('lang', '1');
    url.searchParams.set('subscription-key', key);

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const json = await response.json() as { Dataset?: unknown };
    return Array.isArray(json.Dataset) ? json.Dataset.slice(0, 5) : [];
  } catch (error) {
    console.error('WTO API Error:', error instanceof Error ? error.name : 'unknown');
    return [];
  }
}

async function fetchMfdsAlerts(key: string): Promise<unknown[]> {
  try {
    const query = encodeURIComponent('새우');
    const url = `https://openapi.foodsafetykorea.go.kr/api/${key}/I0490/json/1/10/PRDLST_NM=${query}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const json = await response.json() as { I0490?: { row?: unknown } };
    return Array.isArray(json.I0490?.row) ? json.I0490.row.slice(0, 5) : [];
  } catch (error) {
    console.error('MFDS API Error:', error instanceof Error ? error.name : 'unknown');
    return [];
  }
}

export async function GET() {
  try {
    const data = await getCachedData('shrimp_compliance_radar', async () => {
      const wtoKey = optionalEnv('WTO_API_KEY');
      const mfdsKey = optionalEnv('MFDS_API_KEY');
      const [wtoAlerts, mfdsAlerts] = await Promise.all([
        wtoKey ? fetchWtoAlerts(wtoKey) : Promise.resolve([]),
        mfdsKey ? fetchMfdsAlerts(mfdsKey) : Promise.resolve([]),
      ]);
      const wtoStatus: SourceStatus = wtoAlerts.length > 0 ? 'live' : 'unavailable';
      const mfdsStatus: SourceStatus = mfdsAlerts.length > 0 ? 'live' : 'unavailable';
      const liveSources = [
        ...(wtoStatus === 'live' ? ['WTO SPS'] : []),
        ...(mfdsStatus === 'live' ? ['MFDS'] : []),
      ];
      const isLive = liveSources.length > 0;

      return {
        timestamp: new Date().toISOString(),
        isLive,
        source: isLive ? liveSources.join(' + ') : '정적 스냅샷',
        sources: { wto: wtoStatus, mfds: mfdsStatus },
        methodology: 'KMI 비관세장벽 영향 분석 + SIMP 이력추적 의무화 대응 프레임',
        regulatoryRadar: STATIC_REGULATORY_RADAR,
        antibioticDetection: {
          origin: mfdsStatus,
          source: mfdsStatus === 'live' ? 'MFDS' : '사용 가능한 데이터 없음',
          recentViolations: mfdsStatus === 'live' ? mfdsAlerts : null,
        },
        wtoSpsNotifications: wtoStatus === 'live' ? wtoAlerts : null,
      };
    }, 7200);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { isLive: false, error: 'Failed to fetch compliance data' },
      { status: 500 },
    );
  }
}
