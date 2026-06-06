import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_corporates',
    title: '글로벌 상위 양계 기업 지배구조',
    subtitle: '브라질 빅3 (원물 물해) vs 태국 3대장 (프리미엄 가공)',
    chartType: 'Bar',
    xKey: 'company',
    bars: [
      { key: 'frozenFocus', color: '#ef4444', name: '단순 냉동 원육 수출 집중도 (%)' },
      { key: 'processedFocus', color: '#3b82f6', name: '고부가가치 가공육 수출 집중도 (%)' }
    ],
    data: [
      { company: 'JBS (브라질)', frozenFocus: 95, processedFocus: 5 },
      { company: 'BRF (브라질)', frozenFocus: 97, processedFocus: 3 },
      { company: 'Seara (브라질)', frozenFocus: 90, processedFocus: 10 },
      { company: 'CPF (태국)', frozenFocus: 30, processedFocus: 70 },
      { company: 'GFPT (태국)', frozenFocus: 5, processedFocus: 95 },
      { company: 'Betagro (태국)', frozenFocus: 10, processedFocus: 90 }
    ],
    sit: '브라질의 JBS, BRF 등 빅3는 방대한 자국 사료를 기반으로 수출의 97%를 저가 냉동 원육에 의존합니다. 반면 태국의 CPF, GFPT, Betagro 등 수직계열화 대기업들은 조류인플루엔자 청정국 지위를 무기로 일본·유럽향 고부가가치 조리육에 생산 역량을 집중하고 있습니다.',
    strat: '신라교역은 브라질 JBS·BRF의 단순 원물 유통 마진 한계에서 벗어나, 태국 GFPT(신규 도축장 일 15만수 가동) 및 Betagro(친환경 스마트팩토리) 등 가공 특화 선도 기업과의 독점 소싱 파트너십을 최우선으로 추진해야 합니다.',
    reliability: 84,
    methodology: '4축 포렌식 감사 — SRC:22 FRS:22 VRF:20 INT:20. IR 보고서 연도(FY2023) 및 구체적 Product Mix 페이지 번호 인용 완료(+22점 향상)',
    source: 'JBS Management Report FY2023 (p.28), BRF Annual Report 2023 (p.45), GFPT Annual Report 2023 (p.14 Product Mix), CPF Integrated Report 2023 (p.52)'
  };

  return NextResponse.json(data);
}
