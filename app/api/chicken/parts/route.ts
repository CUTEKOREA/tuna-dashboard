import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    title: "가금류 부위별 차익거래 및 수급 분석",
    subtitle: "KCS HS코드 기반 수입단가(USD/MT) 비교 및 수율 분석",
    reliability: 78,
    methodology: "KITA/KCS 무역통계 기반 정적 데이터. 수입단가 수치는 업계추정치이며 실시간 연동 없음.",
    source: "KITA/KCS 무역통계 (HS 0207.14 냉동육, HS 1602.32 조제육)",
    chartData: {
      chartType: 'Line',
      xKey: 'year',
      lines: [
        { key: 'price_020714', color: '#ef4444', name: '브라질 주력 (냉동육 HS0207.14)' },
        { key: 'price_160232', color: '#3b82f6', name: '태국 주력 (조제육 HS1602.32)' }
      ],
      data: [
        { year: '2020', price_020714: 1650, price_160232: 3200 },
        { year: '2021', price_020714: 1820, price_160232: 3450 },
        { year: '2022', price_020714: 2150, price_160232: 3900 },
        { year: '2023', price_020714: 1980, price_160232: 4100 },
        { year: '2024', price_020714: 1850, price_160232: 4250 }
      ]
    },
    parts: [
      {
        id: "thigh",
        name: "넓적다리 정육",
        market: "B2B 프랜차이즈 (순살 치킨)",
        icon: "Scissors",
        brazil: "기계 발골 중심 (연골/잔뼈 혼입 리스크), 저가 압도적",
        thailand: "숙련공 수작업 발골 (수율 +20%, 클레임 제로)",
        insight: "단순 매입가가 35% 비싸더라도, 버려지는 로스율을 고려한 '총 사용 원가' 접근 시 태국산의 실질 마진이 방어됨. (업계추정)"
      },
      {
        id: "processed",
        name: "고부가가치 가공육",
        market: "HMR, 편의점, 급식 B2B",
        icon: "PackageSearch",
        brazil: "단순 생육/냉동 수출 위주",
        thailand: "가금류 수출의 64.5% 차지 (가라아게, 꼬치 세계 1위)",
        insight: "70도 이상 가열 조리 공정으로 브라질 HPAI 수입금지(SPS) 조치에서 면제. 원물 공급 단절 리스크를 회피하는 장기계약(LTA) 우선 검토 대상."
      },
      {
        id: "breast",
        name: "닭가슴살",
        market: "미국/EU 프리미엄 헬스케어 시장",
        icon: "Activity",
        brazil: "생육 위주 EU 수출 (쿼터 할당)",
        thailand: "가열 및 가염 조리육으로 방역 장벽 우회 수출",
        insight: "브라질 수출가($1,750/MT)와 EU 현지가($2,950/MT) 간 스프레드를 활용해 조리육 프리미엄 마진 확보 가능. (KITA 자체추정)"
      },
      {
        id: "wings",
        name: "날개 및 닭발",
        market: "중국 및 아시아 중화권",
        icon: "TrendingUp",
        brazil: "해상 운송 56일 소요 (신선도 하락 및 재고비용)",
        thailand: "람차방 항구 출항 시 14일 이내 아시아 전역 도달",
        insight: "중국-브라질 간 반덤핑/HPAI 무역 분쟁 시 수급 공백 발생 가능. 단기 스팟 물량을 선점해 차익 확보 여지가 있음. (업계추정)"
      }
    ],
    sit: "브라질산 단순 냉동육 의존도는 HPAI 발병 시 국내 프랜차이즈 메뉴 단종 리스크로 직결됨.",
    strat: "태국의 '수작업 고수율 정육'과 '규제 면제 조리육' 비중을 확대해 신라교역 포트폴리오를 전환하고 총 마진을 방어.",
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  });
}
