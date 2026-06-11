import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_trade_shift',
    title: '글로벌 양계 수출 시장 패권 (Import Market Share)',
    subtitle: '한국 수입 점유율 — KITA·KCS HS 0207 원물(냉동·신선) 물량 기준, 열처리 가공품(HS 1602) 제외',
    chartType: 'Composed',
    xKey: 'year',
    areas: [
      { key: 'brazilShare', color: '#ef4444', name: '브라질 점유율 (%)' },
      { key: 'thaiShare', color: '#3b82f6', name: '태국 점유율 (%)' }
    ],
    lines: [
      { key: 'totalImport', color: '#f59e0b', name: '총 수입량 (톤)' }
    ],
    data: [
      { year: '2020', brazilShare: 85, thaiShare: 9, totalImport: 139000 },
      { year: '2021', brazilShare: 84, thaiShare: 10, totalImport: 149000 },
      { year: '2022', brazilShare: 86, thaiShare: 9, totalImport: 188000 },
      { year: '2023', brazilShare: 85.9, thaiShare: 11.7, totalImport: 234900 },
      { year: '2024', brazilShare: 86.2, thaiShare: 9.0, totalImport: 215000 },
      { year: '2025(HPAI)', brazilShare: 72, thaiShare: 20, totalImport: 220000, isForecast: true },
      { year: '2026(Est)', brazilShare: 68, thaiShare: 25, totalImport: 230000, isForecast: true }
    ],
    sit: '[Market Telemetry] 한국 닭고기 수입량(HS 0207 원물 물량 기준)은 2020년 13.9만톤 → 2023년 23.5만톤(역대 최대)으로 급증했습니다. 브라질산 점유율은 85.9%(2023)로 압도적이며, 2025년 72%·태국 20%대 수치는 HPAI 시나리오 추정입니다. ※ 집계 모수 주의: 열처리 가공품(HS 1602)까지 포함한 전 제품 기준으로는 2024년 브라질 72%·태국 21%(USDA GAIN KS2025-0036·TDM, 원물 환산 시 브라질 84%)로, 모수 차이 때문에 인접 USDA 위젯과 수치가 다릅니다.',
    strat: '[Executive Pivot] 브라질 HPAI → 정상화 6개월~1년 타임갭이 최대 기회입니다. Silla Co.는 ①0% TRQ 물량 선점 ②태국산 가공육 LTA 체결 ③프랜차이즈 B2B 시장 "고마진 스펙-인" 전략으로 브라질 편중(86%) 탈피를 주도해야 합니다.',
    reliability: 78,
    methodology: '4축 포렌식 감사 — SRC:23 FRS:21 VRF:17 INT:17. 2025-2026 예측값 혼재(-5), HPAI 시나리오 가정 기반(-5)',
    source: 'KITA 무역통계(2020-2024 실데이터) & KCS HS 0207 수입실적 — 원물 물량 기준(가공품 HS 1602 제외). ⚠️ 2025(HPAI)/2026(Est)는 시나리오 기반 추정치',
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  };

  return NextResponse.json(data);
}
