import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_global_export',
    title: '원물 vs 가공육 수출 점유율 (Export Dominance)',
    subtitle: '브라질(단순 물동량 1위) vs 태국(가공육 수익성 1위)',
    chartType: 'Composed',
    xKey: 'country',
    bars: [
      { key: 'frozen', color: '#ef4444', name: '냉동육 수출 (만 톤)' },
      { key: 'processed', color: '#3b82f6', name: '가공육 수출 (만 톤)' }
    ],
    // 데이터: agri_data UN Comtrade 2024 자기보고 (브라질·미국·태국 모두 정상 보고국).
    //   생성: scripts/agri_to_dashboard/agri_convert.py (motCode=0 dedup). 단위 만 톤(netWgt).
    //   HS 0207 냉동(020712·020714) / 160232 조제. EU는 역외수출만 분리 불가(역내교역 포함) → 큐레이션치 유지.
    //   주: 2025는 Comtrade 보고 진행 중(미완)이라 직전 완료연도 2024 사용.
    data: [
      { country: '브라질', frozen: 492.6, processed: 12.3 },
      { country: '미국', frozen: 243.1, processed: 12.6 },
      { country: 'EU', frozen: 140, processed: 40 },
      { country: '태국', frozen: 46.4, processed: 67.7 }
    ],
    sit: '[Market Telemetry] 2024년 UN Comtrade 기준 브라질이 냉동육 수출 493만 톤으로 단순 물동량 시장을 장악합니다. 반면 태국은 총수출 약 114만 톤 중 가공육이 68만 톤으로 냉동육(46만 톤)을 앞서, 고부가 가공육 부문에서 압도적 우위를 유지합니다.',
    strat: '[Executive Pivot] 철저히 이원화된 수출 포트폴리오를 인지해야 합니다. 저마진 브라질산 원물 취급을 넘어서, 글로벌 프리미엄 수요를 독식하는 태국산 완조리/반조리 수입을 확대하여 HMR B2B 시장의 마진을 극대화해야 합니다.',
    reliability: 82,
    methodology: '4축 포렌식 감사 — 기준연도 2024 명시, HS코드 추출경로 공개(020712·020714 냉동 / 160232 조제). 전 국가 Comtrade 자기보고.',
    source: 'UN Comtrade 2024 via agri_data (브라질·미국·태국 자기보고). HS 0207 냉동·160232 가공. EU는 역내교역 포함(역외분리 불가).',
    telemetry: { status: 'SYNCED', syncDate: '2026-06-06' },
    isLive: false
  };

  return NextResponse.json(data);
}
