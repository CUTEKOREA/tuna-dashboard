// 1. 글로벌 콜드체인 허브 재편 (한국의 초저온 창고 반사이익)
export const tunaColdChainData = {
  id: 'tuna_fta_coldchain',
  title: '동북아 초저온 물류 턴어라운드 (한-일 허브 시프트)',
  desc: '일본 초저온 창고 한계에 따른 한국 보세/우회 물동량 폭증',
  chartType: 'composed',
  xKey: 'quarter',
  bars: [
    { key: 'kr_bonded', name: '한국 보세창고 입고량 (톤)', color: '#38bdf8', yAxisId: 'left' },
    { key: 're_export', name: '일본향 재수출 물동량 (톤)', color: '#818cf8', yAxisId: 'left' }
  ],
  lines: [
    { key: 'jp_deficit', name: '일본 초저온 창고 부족률 (%)', color: '#f87171', yAxisId: 'right', strokeWidth: 3 }
  ],
  data: [
    { quarter: '24.1Q', kr_bonded: 420, re_export: 150, jp_deficit: 12 },
    { quarter: '24.2Q', kr_bonded: 480, re_export: 190, jp_deficit: 18 },
    { quarter: '24.3Q', kr_bonded: 450, re_export: 180, jp_deficit: 15 },
    { quarter: '24.4Q', kr_bonded: 600, re_export: 290, jp_deficit: 25 },
    { quarter: '25.1Q', kr_bonded: 1638, re_export: 850, jp_deficit: 45 },
    { quarter: '25.2Q', kr_bonded: 3993, re_export: 2100, jp_deficit: 68 }
  ],
  situation: '2025년 들어 일본 내 초저온 창고(Super Freezer)의 인프라 노후화 및 공간 부족 심화로, 대서양 축양 참다랑어의 한국 내 보세 반입 및 우회 수출 물동량이 전년비 폭증함.',
  takeaway: '[물류 수익 모델] 단순 수입을 넘어, 한국 부산항/감천항의 초저온 인프라를 활용해 일본향 중계무역 및 보관 수수료 수익 모델을 적극 전개해야 함.',
  source: 'KMI FTA 수산물 수입동향 (2025.Q2) 기반 분석'
};

// 2. 프리미엄 어종의 세대교체 (자연산 눈다랑어 → 대서양 축양 참다랑어)
export const tunaQuotaData = {
  id: 'tuna_fta_quota',
  title: '어종별 쿼터 및 대체재 시뮬레이터',
  desc: '자연산 고급 횟감(눈다랑어) 조업 규제와 축양 참다랑어 풍선효과',
  chartType: 'composed',
  xKey: 'year',
  areas: [
    { key: 'bluefin_farmed', name: '대서양 참다랑어 피레트 수입 (톤)', color: '#3b82f6', yAxisId: 'left' }
  ],
  lines: [
    { key: 'bigeye_quota', name: 'WCPFC 눈다랑어 조업 할당량 (지수)', color: '#fb923c', yAxisId: 'right', strokeDasharray: '5 5' }
  ],
  data: [
    { year: '2021', bluefin_farmed: 3507, bigeye_quota: 100 },
    { year: '2022', bluefin_farmed: 6122, bigeye_quota: 85 },
    { year: '2023', bluefin_farmed: 7879, bigeye_quota: 70 },
    { year: '2024', bluefin_farmed: 4560, bigeye_quota: 65 },
    { year: '2025(E)', bluefin_farmed: 8900, bigeye_quota: 50 },
  ],
  situation: '눈다랑어 등 전통적 고급 횟감에 대한 국제 조업 규제(TAC)가 강화되며 어획량이 감소, 이에 대한 반사 이익으로 축양 생산되어 안정적 공급이 가능한 대서양 참다랑어(피레트)로 횟감 수요가 대거 이동.',
  takeaway: '[소싱 전략] 자연산 쿼터 축소 시그널 발생 시, 즉각적으로 스페인/몰타산 대서양 참다랑어 장기 공급 계약(선도거래) 비중을 늘려 안정적 횟감 물량을 선점.',
  source: 'KMI FTA 수산물 수입동향 (21~23년 반복 지표)'
};

// 3. 원산지 판정의 복잡성과 FTA 관세 리스크
export const tunaOriginData = {
  id: 'tuna_fta_origin',
  title: '지중해 참치 원산지 트래킹 및 관세 레이더',
  desc: '어선 국적(Flag State) vs 축양 국가 매핑에 따른 FTA 혜택율',
  chartType: 'radar',
  radarKey: 'factor',
  radars: [
    { key: 'eu_flag', name: 'EU 어선(프랑스) + 스페인 축양', color: '#10b981' },
    { key: 'non_eu_flag', name: '비EU 어선(튀르키예) + 스페인 축양', color: '#ef4444' }
  ],
  data: [
    { factor: '무관세 혜택', eu_flag: 100, non_eu_flag: 0 },
    { factor: '원산지 리스크(낮음)', eu_flag: 90, non_eu_flag: 20 },
    { factor: '통관 소요시간(빠름)', eu_flag: 85, non_eu_flag: 40 },
    { factor: '매입단가 경쟁력', eu_flag: 60, non_eu_flag: 90 },
    { factor: '물량 확보 용이성', eu_flag: 70, non_eu_flag: 80 }
  ],
  situation: '지중해에서 축양된 참다랑어의 원산지는 축양장 위치가 아니라 최초 어획한 어선의 국적(Flag State)을 따르므로, 스페인 축양장에서 출하되었더라도 어선이 튀르키예 국적일 경우 한-EU FTA 특혜세율을 받지 못함.',
  takeaway: '[Compliance 리스크] 매입 전 반드시 Catch Document(어획증명서) 상의 어선 국적을 스크리닝하여, 단순 매입가보다 관세 스프레드를 고려한 최종 Landed Cost를 계산해야 함.',
  source: 'KMI FTA 수산물 수입동향 원산지 규정 분석'
};

// 4. 거시경제(Macro) 타격과 수요 파괴
export const tunaMacroData = {
  id: 'tuna_fta_macro',
  title: '거시경제 vs 프리미엄 참치 수요 파괴 지수',
  desc: '소비자물가(외식) 지수 상승 시 참다랑어 소비 급감 현상',
  chartType: 'composed',
  xKey: 'period',
  bars: [
    { key: 'import_vol', name: '참다랑어 수입량 (톤)', color: '#0ea5e9', yAxisId: 'left' }
  ],
  lines: [
    { key: 'cpi_out', name: '외식물가 상승률 (%)', color: '#eab308', yAxisId: 'right' }
  ],
  data: [
    { period: '23.1Q', import_vol: 3081, cpi_out: 7.4 },
    { period: '23.2Q', import_vol: 5465, cpi_out: 7.0 },
    { period: '23.3Q', import_vol: 5950, cpi_out: 5.4 },
    { period: '23.4Q', import_vol: 6294, cpi_out: 4.8 },
    { period: '24.1Q', import_vol: 569, cpi_out: 3.8 }, // Demand destruction
    { period: '24.2Q', import_vol: 1239, cpi_out: 3.0 },
    { period: '24.3Q', import_vol: 1650, cpi_out: 2.8 },
    { period: '24.4Q', import_vol: 3796, cpi_out: 2.5 },
    { period: '25.1Q', import_vol: 1638, cpi_out: 2.1 } // Recovery begins
  ],
  situation: '2024년 상반기 극심한 내수 침체와 고물가로 인해 럭셔리 식자재인 참다랑어 수입이 전년 대비 최대 80% 이상 급감하는 수요 파괴(Demand Destruction) 직격탄을 맞음.',
  takeaway: '[매크로 헷징] 거시 경제 둔화 시그널(소비자심리지수 하락) 시, 고가 참다랑어 매입을 보류하고 불황형 가성비 어종(가다랑어, 황다랑어)으로 포트폴리오를 신속히 전환할 것.',
  source: 'KMI FTA 분기별 보고서 누적 패턴'
};

// 5. 유로/달러가 아닌 '엔화(JPY) 결제' 관행
export const tunaYenData = {
  id: 'tuna_fta_yen',
  title: '엔화 변동성 기반 참치 매입 타이밍 시뮬레이터',
  desc: '대서양 참다랑어의 엔화 결제 관행을 이용한 환차익 전략',
  chartType: 'composed',
  xKey: 'month',
  areas: [
    { key: 'import_price', name: '대서양 참다랑어 수입단가 ($/kg 환산)', color: '#a855f7', yAxisId: 'left' }
  ],
  lines: [
    { key: 'jpy_krw', name: '엔/원 환율 (100엔당 원)', color: '#22c55e', yAxisId: 'right' }
  ],
  data: [
    { month: '22.1Q', import_price: 29.4, jpy_krw: 1040 },
    { month: '22.3Q', import_price: 28.9, jpy_krw: 970 },
    { month: '23.1Q', import_price: 29.7, jpy_krw: 950 },
    { month: '23.4Q', import_price: 32.5, jpy_krw: 900 },
    { month: '24.2Q', import_price: 35.1, jpy_krw: 880 }, // 엔저 절정 시 수익성 개선
    { month: '25.1Q', import_price: 31.0, jpy_krw: 920 },
  ],
  situation: '일본이 전 세계 참다랑어 소비를 블랙홀처럼 빨아들여 가격 결정권을 갖고 있기 때문에, 국내 업체가 EU 등에서 참치를 매입할 때도 로컬 통화(유로화) 대신 엔화(JPY)로 결제하는 관행 존재.',
  takeaway: '[환율 헷징] 슈퍼 엔저 현상 발생 시 실질 매입 원가가 하락하는 효과가 발생하므로, JPY/KRW 환율 하락 시그널에 맞춰 대량 장기 매입 계약을 체결해 이윤을 극대화.',
  source: 'KMI FTA 수산물 수입동향 (22.3Q/22.4Q 결제 통화 분석)'
};
