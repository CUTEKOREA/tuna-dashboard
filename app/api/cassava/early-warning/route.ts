import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: NOAA 기후·FAO EMPRES-i(CMD 확산) 지표 기반 공급망 조기경보 모델(추정).
// 외부 실시간 API 미연동(향후 fetch 예정) → isLive:false, source에서 'Live' 표기 제거.
export async function GET() {
  try {
    const elNinoProbability = 72; // NOAA 엘니뇨 확률 (추정)
    const cmdOutbreakIndex = 8.5; // FAO EMPRES-i CMD 확산 지수 (10점 만점, 추정)

    let riskLevel = '안전';
    if (elNinoProbability > 60 || cmdOutbreakIndex > 7) riskLevel = '주의';
    if (elNinoProbability > 80 && cmdOutbreakIndex > 8) riskLevel = '경고';

    const payload = {
      id: 'w_early_warning',
      title: '공급망 조기 경보 트래커',
      subtitle: 'FAO EMPRES-i & NOAA 기후 지표 기반 모델 (3-6개월 선행 쇼크 예측)',
      chartType: 'Composed',
      xKey: 'month',
      areas: [
        { key: 'elNino', color: '#f59e0b', name: '엘니뇨 발생 확률 (%)' }
      ],
      lines: [
        { key: 'cmdIndex', color: '#b45309', name: 'CMD 확산 지수 (x10)' }
      ],
      data: [
        { month: '1월', elNino: 40, cmdIndex: 40 },
        { month: '2월', elNino: 45, cmdIndex: 45 },
        { month: '3월', elNino: 55, cmdIndex: 50 },
        { month: '4월', elNino: 65, cmdIndex: 65 },
        { month: '5월', elNino: elNinoProbability, cmdIndex: cmdOutbreakIndex * 10 },
        { month: '6월(예측)', elNino: 85, cmdIndex: 90 },
      ],
      sit: `[조기경보: ${riskLevel}] 현재 엘니뇨 발생 확률 ${elNinoProbability}%·CMD 확산 지수 ${cmdOutbreakIndex}로 공급망 쇼크 '주의' 단계로 추정됩니다.`,
      strat: `태국·베트남 원물 수급이 3개월 내 병목에 직면할 가능성이 있으므로, 아프리카(가나) 팜게이트 물량 선확보와 HQCF 생산 라인 가동률 상향을 권장합니다.`,
      reliability: 78,
      isLive: false,
      source: 'NOAA Climate Prediction Center·FAO EMPRES-i 지표 기반 조기경보 모델 (정적 추정)'
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error in /api/cassava/early-warning:', error);
    return NextResponse.json({ error: 'Failed to fetch early warning data' }, { status: 500 });
  }
}
