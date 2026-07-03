import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const data = {
    id: 'w_chicken_arbitrage',
    title: '글로벌 수입 원가 vs 국내 도매가 스프레드',
    subtitle: '국내산 육계 단가 폭등과 태국산 가공 수율 프리미엄 차익',
    chartType: 'Composed',
    xKey: 'month',
    areas: [
      { key: 'domestic', color: '#f87171', name: '국내산 도매가 (KRW/kg)' }
    ],
    lines: [
      { key: 'brazil', color: '#10b981', name: '브라질산 수입 원가 (KRW/kg)' },
      { key: 'thai', color: '#8b5cf6', name: '태국산 수입 원가 (KRW/kg)' }
    ],
    data: [
      { month: '1월', domestic: 1950, brazil: 1750, thai: 2500 },
      { month: '3월', domestic: 2050, brazil: 1800, thai: 2600 },
      { month: '5월(HPAI)', domestic: 2300, brazil: 0, thai: 2750 },
      { month: '7월(복날)', domestic: 2650, brazil: 0, thai: 2850 },
      { month: '9월', domestic: 2200, brazil: 1850, thai: 2700 },
      { month: '11월', domestic: 2403, brazil: 2000, thai: 2650 }
    ],
    sit: '국내 육계 도매가는 KAMIS 기준 2,403원/kg(2025.11)로 사료비 상승과 복날 수요 폭증이 겹친 결과입니다. 브라질산은 HPAI(5~7월) 수입금지 기간 공급 제로(0)를 기록하며, 태국산 가공육이 유일한 안정적 대체 공급원으로 부상했습니다. 순살 기준 태국산 가공육의 실질 조리 수율(잔뼈 제로)을 감안하면 총사용원가는 브라질산 대비 경쟁력이 있습니다.',
    strat: '브라질 HPAI 수입금지 → 정상화 6개월~1년 타임갭이 신라교역의 핵심 차익거래 윈도우입니다. ①태국 GFPT/Betagro와 장기공급계약(LTA) 체결 ②0% 관세할당(TRQ) 물량 선점 ③콜드체인 비축 후 수급 공백 시 B2B 방출로 20~30% 마진 확보. 사료비 하락(시카고선물거래소 기준 약 $4.15/부셸)으로 태국 공급사 원가도 역대 최저 → 고정가 계약 최적 타이밍입니다.',
    reliability: 71,
    methodology: '4축 포렌식 감사 — SRC:23 FRS:19 VRF:12 INT:17. 브라질 0원=수입금지 시각적 오독 가능(-10), TCU 계산식 미공개(-5)',
    source: 'KAMIS 육계 도매가(2025.11 기준) & KCS HS 0207 수입단가 기반 자체추정. ⚠️ 브라질산 0=수입금지(가격 아님). 태국산 원가는 CIF+관세+마진 포함 추정치. [STATIC — 실시간 API 미연동]',
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  };

  return NextResponse.json(data);
}
