export type IntelligenceWidget = {
  title: string;
  value: string;
  unit?: string;
  desc: string;
  source: string;
  trend: 'up' | 'down' | 'neutral' | 'alert';
  reliability?: number;
};

export type IntelligenceTabData = {
  id: string;
  tabName: string;
  iconName: string;
  widgets: IntelligenceWidget[];
};

export const CASHEW_INTELLIGENCE_DATA: IntelligenceTabData[] = [
  {
    id: 'tab1',
    tabName: '거시 경제 & 타리프 패권',
    iconName: 'Globe',
    widgets: [
      { title: '아시아 가공 마진 독점률', value: '35', unit: '%', desc: '서아프리카 RCN(15% 마진)을 독식하여 베트남/인도 가공 허브가 포획하는 비대칭적 가공 부가가치(Value-add) 스프레드', source: 'NotebookLM 밸류체인 분석 [📐 AI Analysis]', reliability: 65, trend: 'down' },
      { title: '미국 對베트남 관세 스프레드', value: '+46', unit: '%', desc: '가나 1D1F 직수출 시 발생하는 상대적 무관세 갭 차익', source: '미국 세관 및 국경보호국(CBP) 규제 요약', reliability: 100, trend: 'up' },
      { title: '가나 1D1F 연간 면세 복리', value: '10', unit: '년', desc: '법인세 완전 면제(Tax Holiday) 및 설비 통관 무관세 혜택', source: '가나 공화국 1D1F 투자 장려 법령', reliability: 100, trend: 'up' },
      { title: '코트디부아르 원물 유출 통제', value: '-20', unit: '% Quota', desc: '육로 반출 전면 차단 및 자국 우선 할당(쿼터) 발동', source: '서아프리카 TCDA 무역 관리청', reliability: 100, trend: 'alert' },
      { title: '아프리카 개발 부담금 제재', value: '44.86', unit: 'GHS/ton', desc: '생캐슈넛(RCN) 원물 단순 반출에 대한 징벌적 관세(Punitive Tariff)', source: '가나 현지 무역 수출세(Levy) 통칙', reliability: 100, trend: 'alert' },
      { title: '중국 캐슈넛 B2B 수입 파워', value: '+42', unit: '% YoY', desc: '글로벌 RCN 블랙홀로 부상한 중국의 해상 수입 물동량 증가 및 전략적 비축(Strategic Reserve) 물량 팽창 펀더멘털', source: 'NotebookLM 해상 무역 인덱스 [📐 AI Analysis]', reliability: 65, trend: 'up' },
      { title: '무기명 외국자본 진입 위반', value: '0', unit: 'Tolerance', desc: '현지 JV가 부재한 무등록 브로커의 불법 소싱 제재율', source: '아프리카 조달청 매뉴얼 가이드', reliability: 70, trend: 'neutral' },
      { title: '가나/코트디부아르 원물 독점률', value: '90', unit: '%', desc: '글로벌 RCN(생캐슈넛) 생산량 중 서아프리카 주요국이 차지하는 뚜렷한 원산지 독점력(Monopolistic Power)', source: 'NotebookLM 원물 생산 분포 [📐 AI Analysis]', reliability: 65, trend: 'neutral' },
      { title: '베트남 영세 가공공장 폐업률', value: '34', unit: '%', desc: '아프리카 원물 수급 대란 및 품질 통제 강황에 따른 구조조정(Consolidation) 가속화', source: '베트남 캐슈넛 협회(Vinacas) 분기 통계', reliability: 100, trend: 'down' },
      { title: 'USD-GHS 환율 방어 파워', value: '+12', unit: '% Edge', desc: '현지 Cedi 통화 약세 매크로를 활용한 USD 베이스 FX 차익(Arbitrage)', source: '가나 현지 파이낸싱 환율 방어 ERP', reliability: 75, trend: 'up' }
    ]
  },
  {
    id: 'tab2',
    tabName: '로컬 파이낸싱 & 딥 소싱',
    iconName: 'Target',
    widgets: [
      { title: 'KOR(수율) 민감도 가치', value: '+$1.50', unit: '/ lb', desc: '수매 시 KOR 48lbs 기준, 1lb 상승할 때마다 즉각 창출되는 마진 스프레드 팽창분', source: '105. 캐슈넛 KOR 단위 파이낸셜', reliability: 100, trend: 'up' },
      { title: 'TCDA MPP 매수 버퍼 갭', value: 'GHS 2.4', unit: 'Gap', desc: '가나 최저수매가(GHS 12/kg) vs 투기적 브로커 프리미엄 대비 가격 방어선(Buffer)', source: '105. 캐슈넛 로컬 조달 가격 추적기', reliability: 100, trend: 'alert' },
      { title: '건기/우기 작황 스트레스', value: '62', unit: 'Index', desc: '엘니뇨 및 강수 부족으로 발생한 당해 수확량 데미지 환산', source: '현지 농생명 기상 데이터 및 위성 측정', reliability: 100, trend: 'down' },
      { title: '중개상(Middlemen) 누수율', value: '18', unit: '%', desc: '현지 LBA 직수매 실패 시 다단계 브로커를 거치며 증발하는 잉여현금(FCF) 누수', source: 'NotebookLM 현지 파이낸싱 모델 [📐 AI Analysis]', reliability: 65, trend: 'down' },
      { title: '재고 묵힘(Hold) 부패손실', value: '-8.5', unit: '%', desc: '가격 반등 기대 홀딩(Holding) 기간 중 발생하는 재고자산 상각(Write-off) 리스크', source: '창고 보관 리스크 오퍼레이션 매뉴얼', reliability: 70, trend: 'alert' },
      { title: '산지 직접 수거율 (LBA 락인)', value: '75', unit: '%', desc: '내륙 Bush 산지부터 항만까지 직통으로 장악하여 중개 수수료를 0%로 소거한 자체 캡티브(Captive) 조달망 확보율', source: 'NotebookLM 산지 조달 네트워크 [📐 AI Analysis]', reliability: 65, trend: 'neutral' },
      { title: 'Nut Count (1kg당 넛 기준)', value: '180~200', unit: '개', desc: '기준치 편차가 심할수록 기계 박피 시 모터에 걸리는 마이너스 압력', source: '공장 초기 QC/스크리닝 통과 지수', reliability: 100, trend: 'neutral' },
      { title: '원물 적정 수분 통제선', value: '8~10', unit: '%', desc: '해상 운송 시 아플라톡신 발생 및 산패를 원천 차단하기 위한 창고 보관 필수 습도 임계점', source: 'NotebookLM 품질 관리 프로토콜 [📐 AI Analysis]', reliability: 65, trend: 'alert' },
      { title: '아프리카 역내 국경 통과비', value: '+3.5', unit: '%', desc: '타국(부르키나파소) 원물 반입 시 검문소 체류 지연 마찰 비례', source: '서아프리카 국경 무역 교통 병목 인덱스', reliability: 70, trend: 'down' },
      { title: '원물 조달 데스밸리 잔여일', value: 'D-30', unit: 'Days', desc: '팩토리 풀가동을 버텨낼 창고 내 원물 잔여량. 리스크 테일(Tail) 이벤트 진입', source: '스마트팩토리 가동률-재고 교차 API', reliability: 100, trend: 'down' }
    ]
  },
  {
    id: 'tab3',
    tabName: '스마트 팩토리 ROI 분석',
    iconName: 'Cpu',
    widgets: [
      { title: '공장 조업 임계점 (BEP)', value: '5,000', unit: 'ton/년', desc: '고정비(감가, 전기, 인건) 상쇄를 위해 고정비(OPEX) 커버리지를 위한 최소 조업 타겟', source: '가나 1D1F 공장 CAPEX 플랜', reliability: 75, trend: 'neutral' },
      { title: '원물 최종 전환율 (Yield)', value: '23~25', unit: '%', desc: '1톤 탈각 시 최종 상등급 커널 획득 비율 파취 로스(Loss) 측정 지표', source: '캐슈넛 수율 및 탈각 프레임워크', reliability: 75, trend: 'up' },
      { title: '무결점 완건(Whole)률', value: '92.4', unit: '%', desc: '구형 기계 파손율을 뒤집은 NanoPix 광학/초음파 W-180 스캐닝 유지율', source: 'AI 광학 선별 품질 엔지니어링 논문', reliability: 70, trend: 'up' },
      { title: '초음파 박피 파손 손실 감어', value: '+40', unit: '%', desc: '기존 압축 롤러의 데미지 단점을 극복해 살려낸 순수익 마진', source: '팩토리 장비 업그레이드 마진 비교', reliability: 75, trend: 'up' },
      { title: '로봇 자동포장 무균 검수점', value: '0', unit: 'Defect', desc: '무결점 위생. 휴먼 에러 개입을 100% 락인(Lock-in)한 HACCP 규격 진공 지수', source: '글로벌 식품 위생 검열 기준서', reliability: 70, trend: 'neutral' },
      { title: 'IoT 모터 예지보전 점수', value: '98', unit: 'Pts', desc: '열풍/초음파 터널 안 트랜스포머 센서가 미리 감지하는 고장 알럿', source: '장비 유지보수 AI 센서 데이터', reliability: 75, trend: 'up' },
      { title: '공장 내 병목타임 로스율', value: '4.5', unit: '%', desc: 'Boiling-Shelling-Peeling 공정 간 동기화 실패로 발생하는 유휴 시간 병목 및 CAPEX 로스율', source: 'NotebookLM 팩토리 시뮬레이터 [📐 AI Analysis]', reliability: 65, trend: 'down' },
      { title: '바이오매스 발전 자립도', value: '60', unit: '%', desc: '껍질 연소 보일러 터빈을 돌려 가나의 정전(Blackout)에 자체 방어', source: 'Net-Zero 에너지 효율 공정 매뉴얼', reliability: 70, trend: 'up' },
      { title: 'CAPEX 센서 페이백 상환', value: '18', unit: '개월', desc: 'AI 비전 선별기(YOLOv8) 도입 시 인건비 절감 및 완건(Whole) 수율 향상으로 CAPEX를 조기 회수하는 기간', source: 'NotebookLM 재무 감가 모델 [📐 AI Analysis]', reliability: 65, trend: 'up' },
      { title: 'B-Grade(스플릿) 강등 페널티', value: '-35', unit: '%', desc: '공정 실수로 W180 커널이 쪼개져 덤핑 가격에 버려지는 마이너스(Write-down) 임팩트', source: '커널 글로벌 등급(Grade) 시세 낙폭', reliability: 75, trend: 'down' }
    ]
  },
  {
    id: 'tab4',
    tabName: '제로웨이스트 & 하이엔드 B2B',
    iconName: 'Droplets',
    widgets: [
      { title: '클린라벨 비건 원료 전환율', value: '+60', unit: '%', desc: 'B2B 유제품 원료 채널 타겟팅을 통해 얻게 되는 덤핑 프리미엄', source: 'B2B 비건 대체육 원료 동향 마켓', reliability: 75, trend: 'up' },
      { title: 'CNSL 껍질 폐기물 오일 착유', value: '+$125', unit: '/ ton', desc: '독성 껍질을 버리지 않고 짜내어 산업용 페인트 원료로 B2B 납품', source: '캐슈 플랜트 부산물 오퍼레이션', reliability: 75, trend: 'up' },
      { title: '직수출 LCL 연동 타임세이브', value: '-28', unit: '%', desc: '아시아 우회 가공을 생략하고 아프리카 산지에서 패키징 후 글로벌 시장 직수출 시 단축되는 물류 리드타임', source: 'NotebookLM 해운 물류 최적화 엔진 [📐 AI Analysis]', reliability: 65, trend: 'up' },
      { title: 'B2C 리테일 초가공 시너지', value: '+180', unit: '%', desc: '단순 생품 납품에서 \'Roasted/Salted\' 로 맛을 입혀 팔 때의 밸류에이션 점프(Value-up)', source: '조미 HMR 리테일 마진 스프레드', reliability: 75, trend: 'up' },
      { title: '중국향 LCL/FCL 소비 팽창', value: '+3.5', unit: '배', desc: '명절 피크 시즌 중국 칭다오 항구 물동 집중 대비 단가 지표', source: '아세안 거시 경제 수입 모니터', reliability: 70, trend: 'up' },
      { title: 'D2C 아마존 FBA 프리미엄', value: '+45', unit: '%', desc: '중간 글로벌 마켓 유통상을 배제하고 FBA 창고로 직격하는 마진', source: 'D2C 글로벌 E-commerce 마진 인덱스', reliability: 75, trend: 'up' },
      { title: 'CNSL ESG 화학 협약수', value: '12', unit: '건/M', desc: '그린 플라스틱 제재용 등으로 수요 급성장하는 CNSL B2B 협약률', source: '제로웨이스트 산업 응용 연구보고서', reliability: 75, trend: 'up' },
      { title: '캐슈 애플 업사이클링 ROI', value: '+5.2', unit: '%', desc: '버려지던 열매(Apple)의 과즙 음료 잼 변환 공정 베타 테스트 투하자본수익률(ROIC)', source: '아프리카 캐슈 애플 부산물화 연구', reliability: 75, trend: 'up' },
      { title: '총 투입 대비 폐기물 방출률', value: '<5', unit: '%', desc: '버려지는 쓰레기가 5% 이하로 통제될 때 얻어지는 네트제로 인센티브', source: '팩토리 부산물 총량 제어 시스템', reliability: 75, trend: 'neutral' },
      { title: '아시아-유럽 해운 지연율', value: '+8', unit: '일', desc: '홍해 사태로 동아프리카 우회 시 발생하는 로스 시간 (직수출 우위 근거)', source: '글로벌 해운 리드타임 딜레이 트래커', reliability: 70, trend: 'down' }
    ]
  },
  {
    id: 'tab5',
    tabName: 'EUDR / ESG 방어 매트릭스',
    iconName: 'ShieldCheck',
    widgets: [
      { title: 'EUDR 농장 매핑 방어율', value: '100', unit: '%', desc: '유럽 삼림벌채방지법(EUDR) 입항 금지를 리스크를 절대 방어하는 Geolocation 추적', source: '유럽의회 EUDR 규제 조항 대응기록', reliability: 100, trend: 'up' },
      { title: '글로벌 제재 타겟 통과 스코어', value: '0', unit: 'Defect', desc: 'OFAC/SDN(글로벌 감시망) 분쟁 연루 블랙리스트 딜러 스크리닝 필터', source: '미 재무부 해외자산통제국 데이터베이스', reliability: 100, trend: 'neutral' },
      { title: '블록체인 이력(Traceability) 동기점', value: '99', unit: '%', desc: '농장 파종부터 글로벌 매대까지 추적되는 위조 불가 안심 이력 스캔', source: 'TCDA 의무 이력추적 기준안 가이드', reliability: 100, trend: 'neutral' },
      { title: '탄소 배출 크레딧 (Offset) 획득', value: '+$8.5k', unit: '/Q', desc: 'CNSL 바이오매스 발전 및 태양광 결합 팩토리 가동으로 VCM(자발적 탄소 시장)에서 창출되는 분기별 탄소 자산 가치', source: 'NotebookLM ESG 가치평가 모델 [📐 AI Analysis]', reliability: 65, trend: 'up' },
      { title: 'FSSC22000 위생 허가 커버리지', value: '100', unit: '%', desc: '월마트 최고 등급 납품 입찰에 참가하기 위해 방어하는 현장 청결 지수', source: '글로벌 BRCGS 위생 평가원 지침', reliability: 100, trend: 'neutral' },
      { title: 'Rainforest Alliance 락인율', value: '88', unit: '%', desc: '친환경/지속가능성 개구리 마크 획득을 통한 프리미엄 매대 고정 비중', source: '우수 프리미엄 소싱 입찰 승인 점수표', reliability: 75, trend: 'up' },
      { title: '노동 인권/IUU 무결점 지표', value: '0', unit: 'Violation', desc: '현대판 노예제도 등 글로벌 NGO의 표적이 되지 않도록 보호된 투명도', source: '국제노동기구(ILO) 가이드라인 준수표', reliability: 100, trend: 'neutral' },
      { title: '잔류 농약/아플라톡신 한계 알럿', value: '<0.01', unit: 'PPM', desc: '선적 컨테이너 통관 시 한 번에 화물을 전량 폐기당하는 독소 검출 방어망', source: '아플라톡신 수출 감찰 기준 허브', reliability: 75, trend: 'neutral' },
      { title: '로컬 CSR 지분 환원 인센티브', value: '+2', unit: '년', desc: '가나 현지 고용 및 우물 건설 등 CSR 기여로 연장받는 법인세 면제 쿠폰', source: '가나 투자진흥청(GIPC) 혜택 연장 권리', reliability: 100, trend: 'up' },
      { title: '비관세 미달로 인한 덤핑 손실률', value: '-45', unit: '%', desc: 'EUDR 및 FSSC22000 미달 시 북미/유럽 프라임 채널에서 퇴출되어 중저가 시장 투매 시 발생하는 마진 폭락률', source: 'NotebookLM 비관세 장벽 회귀 분석 [📐 AI Analysis]', reliability: 65, trend: 'alert' }
    ]
  }
];
