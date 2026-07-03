import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: 부산물(폐수 바이오가스·펄프 사료화) ESG 수익성 모델(추정).
// 공장 IoT 센서 실시간 미연동 → isLive:false, source에서 'Live' 표기 제거.
export async function GET() {
  try {
    const dailyWastewaterTonnes = 1200;
    const codLevel = 25000; // mg/L (추정)
    const biogasYield = 0.5; // m3 per kg COD
    const electricityConversion = 2.1; // kWh per m3 biogas
    const electricityPrice = 0.15; // $/kWh (가나, 추정)

    const dailyElectricityKwh = (dailyWastewaterTonnes * (codLevel / 1000)) * biogasYield * electricityConversion;
    const dailySavings = dailyElectricityKwh * electricityPrice;

    const payload = {
      id: 'w_esg',
      title: '제로 웨이스트(Zero-Waste) ESG 수익성 인덱스',
      subtitle: '폐수 바이오가스 전환 및 펄프 사료화 수익성 모델',
      chartType: 'Radar',
      xKey: 'dimension',
      radars: [
        { key: 'target', name: 'Silla Co. 목표', color: '#64748b' },
        { key: 'current', name: '현재 ESG 달성도', color: '#f59e0b' }
      ],
      data: [
        { dimension: '바이오가스(전력 자립)', target: 100, current: 85 },
        { dimension: '펄프(사료화)', target: 100, current: 90 },
        { dimension: '탄소 배출 저감', target: 100, current: 75 },
        { dimension: '수자원 재활용', target: 100, current: 60 },
        { dimension: '클린라벨 획득률', target: 100, current: 80 }
      ],
      sit: `[Zero-Waste ESG 모델] 일일 폐수 ${dailyWastewaterTonnes}톤에서 바이오가스를 포집할 경우 일 약 ${Math.round(dailyElectricityKwh).toLocaleString()}kWh의 전력 자체 생산과 매일 약 $${Math.round(dailySavings).toLocaleString()}의 에너지 절감이 추정됩니다.`,
      strat: `유럽(EU)·북미 프리미엄 시장 진출 시 '100% Zero-Waste'·탄소발자국 인증의 핵심 근거 데이터로 활용하여, 제품 판가에 약 10%의 프리미엄을 부가해 매출총이익률(GPM)을 방어하는 전략을 검토하십시오.`,
      reliability: 78,
      isLive: false,
      source: '부산물 ESG(바이오가스·사료화) 수익성 모델 (정적 추정)'
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error in /api/cassava/esg:', error);
    return NextResponse.json({ error: 'Failed to fetch ESG data' }, { status: 500 });
  }
}
