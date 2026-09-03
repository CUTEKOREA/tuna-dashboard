/** COSMO 품질개선 보고 (OTTO FRANCK 클레임 대응) — 2026-08-27, 16쪽 PDF.
 *  월간 업무보고 「클리닝 품질개선 집중」 한 줄의 근거 문서다.
 *  원문에 등장하는 개인 이름은 담지 않는다 — 담당은 직책으로만 적는다. */
export const cosmoQualityReport = {
  source: {
    file: 'OTTO FRANCK 품질개선 보고_COSMO 20260827.pdf',
    title: 'COSMO 품질개선 보고',
    author: 'COSMO 법인장',
    reportDate: '2026-08-27',
    pages: 16,
    sha256: '88a0828eb624d26f273c8028b961b3f0391205ab6e1dc73020457b2e81fe7b46',
  },

  /** 보고를 촉발한 공문 */
  trigger: {
    date: '2026-08-14',
    buyer: 'OTTO FRANCK',
    country: '독일',
    note: '독일 주요 고객사로부터 당사 생산 참치캔 품질문제 공문을 접수',
  },

  /** 공문이 지적한 불량 유형 */
  defects: [
    '클리닝 부적합 (껍질·적육 등 원재료 이물 혼입)',
    '색상이 어두움',
    '짠 맛',
  ],

  /** Y2025~현재 클레임 접수 내역. producedAt 은 제품 제조일자이며 마지막 건만 둘이다. */
  claims: [
    {
      receivedAt: '2025-06-02',
      defects: ['클리닝 부적합', '플레이크 과다', '색상 어두움'],
      producedAt: ['2024-03-12'],
      product: 'Catering Chunk in Sunflower Oil',
      note: null,
    },
    {
      receivedAt: '2025-11-13',
      defects: ['클리닝 부적합'],
      producedAt: ['2025-06-24'],
      product: 'Catering Chunk in Sunflower Oil',
      note: null,
    },
    {
      receivedAt: '2026-06-25',
      defects: ['색상이 어두움', '염도 높음'],
      producedAt: ['2025-11-05'],
      product: 'Catering Chunk in Sunflower Oil',
      note: '클리닝은 양호',
    },
    {
      receivedAt: '2026-08-06',
      defects: ['클리닝 부적합', '색상이 어두움'],
      producedAt: ['2026-04-09', '2026-05-07'],
      product: 'Catering Chunk in Sunflower Oil',
      note: null,
    },
  ],

  /** 원어 입고보관~멸균까지의 공정 흐름. 6.1 로인/플래이크 검사는 클리닝 뒤에 붙는 검사 단계다. */
  processFlow: [
    '입고보관', '사이징', '냉동보관', '자숙', '방냉', '클리닝',
    '로인·플레이크 검사', '충전/밀봉', '멸균', '냉각', '포장',
  ],
  criticalStage: '클리닝',

  /** 공정별 불량 유형·문제점·대책 (원문 4장 표) */
  processStages: [
    {
      stage: '냉동보관',
      defect: '클리닝 부적합 · 살코기 암변',
      problem: 'Freezer Burn 으로 자숙 후 표면이 변색되고 제거가 어렵다. 완만 동결 시 메트미오글로빈 생성이 빨라지고, 장기 보관 시 어체가 마른다. Mesh Type scow 는 표면이 마르고 상처가 나기 쉽다.',
      action: 'FBU #2 냉동창고 냉동기 보수 · 원어 재고 선입선출 관리 · COSMO 원어는 Plate Scow 우선 사용',
    },
    {
      stage: '사이징',
      defect: '클리닝 부적합 · 살코기 암변',
      problem: '장시간 대기하면 어체 표면이 해동되고, 사이징 정확도가 낮으면 미자숙·과자숙이 발생한다.',
      action: '냉동창고 출고 후 1시간 초과 방치 금지 · 사이징 작업자 교육과 모니터링',
    },
    {
      stage: '스팀 자숙',
      defect: '클리닝 부적합 · 살코기 암변',
      problem: '미자숙·과자숙으로 재작업과 로인 갈변이 생기고, Basket Plate 때문에 자숙 후 어체가 변형된다.',
      action: '사이징 공정 관리 · 자숙 Basket Plate 교체',
    },
    {
      stage: '방냉 관리',
      defect: '클리닝 부적합',
      problem: '표면이 마르면 껍질 제거가 어렵다.',
      action: '특히 소형 어체의 표면 수분 관리',
    },
    {
      stage: '1차 클리닝',
      defect: '클리닝 부적합',
      problem: '머리 혈점·비늘·껍질·멍든 부분이 완전히 제거되지 않아, 2차 클리닝에서 미제거되거나 교차오염으로 제품에 혼입된다.',
      action: '1차 클리닝 품질 기준 강화',
    },
    {
      stage: '2차 클리닝',
      defect: '클리닝 부적합',
      problem: '처리량 증대를 위한 생산성 우선 운영, 능숙한 직원의 잦은 퇴사, 1차에서 남은 비늘·껍질 제거 중 교차오염, Bruise 표면만 제거, 갈변이 심한 표층 미제거, 조·반장이나 체커가 맡는 비체계적 교육.',
      action: '품질 우선 작업장 문화 · 인센티브와 등급제(품질＋생산성) · Bruise 완전제거와 Deep Cleaning · 어체 표층 클리닝 기준 강화 · 교육은 현장책임자(HOD)가 책임',
    },
    {
      stage: '로인 검사',
      defect: '클리닝 부적합',
      problem: '이송 컨베이어 위에서 검사해 이물 제거가 미흡하고, 부적합한 로인이 생산에 투입된다.',
      action: '로인 Tray 별 전수 검사 · 검사용 전용 테이블 제작과 검사 조도 개선',
    },
    {
      stage: '플레이크 검사',
      defect: '클리닝 부적합',
      problem: '플레이크 선별 시 적육과 비늘이 제대로 제거되지 않는다.',
      action: '필리핀 Cannery 에서 수행 중인 Flake 검사 스킬 적용',
    },
    {
      stage: '충전/밀봉',
      defect: '살코기 암변',
      problem: '클리닝 후 밀봉을 기다리는 동안 상온에 오래 두면 산화가 일어난다.',
      action: '클리닝 시작~밀봉 대기 시간 1.5시간 Time Line 관리',
    },
    {
      stage: '멸균',
      defect: '살코기 암변',
      problem: '고온에 오래 노출되면 마이야르 반응(비효소적 갈변)이 일어나고, 멸균 오작동으로 재작업하면 과열 처리로 갈변할 수 있다.',
      action: '멸균 조건 재검증과 F0 재측정 추진 · 작업자 교육과 스팀 공급 안정화',
    },
  ],

  /** 세부 실행 계획 9건 (원문 5장) */
  actions: [
    { no: 1, title: 'FBU 냉동창고 CAPA 증대', detail: '#2 냉동고 콘덴서 3기 중 2기만 가동 중 — 보수로 급속 동결 회복' },
    { no: 2, title: 'Plate Type Scow 우선 사용', detail: 'Mesh Type 은 Blast Freezer 에서 표면이 마르고 덤핑 시 상처가 난다' },
    { no: 3, title: 'Basket Tray 교체', detail: '노후 멸균 바스켓 Divider 재활용품을 이전 Type 으로 교체 — 자숙 후 바닥면 평탄화' },
    { no: 4, title: '1차 클리닝 품질 개선', detail: '갈변부·머리 혈점·척추 혈관·꼬리 껍질을 1차에서 완전 제거' },
    { no: 5, title: '처리량 중심 생산 관리 전환', detail: '품질 우선 문화와 인센티브로 개인 생산성과 품질을 함께 개선' },
    { no: 6, title: '능숙 클리너 이탈 방지', detail: '만근 보너스 25GHC/2주, 능숙 직원 인센티브 50GHC/인(1차 300명 예상)' },
    { no: 7, title: 'Bruise 완전 제거', detail: '표면만 제거하던 관행을 바꿔 1차에서 완전 제거 — 수율 저하의 주요 원인' },
    { no: 8, title: '클리너 교육 체계화', detail: '현장책임자(HOD) 주도 교육으로 전환, 품질 기준과 설명 방법을 조·반장과 체커에 전수' },
    { no: 9, title: '로인 전수 검사', detail: '전용 검사 테이블 · 신규 LED 조도 확보 · 원재료 이물을 아는 인원 배치' },
  ],

  /** 7월 평균 클리너 수 — 월간 업무보고의 「전년 대비 110명 감소」가 여기서 나온다 */
  cleaners: {
    basis: '7월 평균',
    rows: [
      { year: 2024, count: 790 },
      { year: 2025, count: 713 },
      { year: 2026, count: 603 },
    ],
  },

  /** 원어 사이즈가 비슷한 매년 6월 생산성 비교 — 클리너 수와 기준 월이 다르다 */
  productivity: {
    basis: '6월 기준',
    rows: [
      { year: 2024, headcount: 717, kgPerFish: 1.78, kgPerManHour: 23.2, yoy: null },
      { year: 2025, headcount: 714, kgPerFish: 1.78, kgPerManHour: 25.5, yoy: 0.099 },
      { year: 2026, headcount: 566, kgPerFish: 1.76, kgPerManHour: 26.4, yoy: 0.035 },
    ],
  },

  /** FBU 냉동창고 — 만창 1,200톤 상태에서 −18℃ 도달까지 45일 걸린 기록 */
  freezer: {
    unit: 'FBU #2 냉동창고',
    issue: '#3 콘덴서가 2018년부터 미가동. 만창 시 완만 냉동이 진행돼 안쪽 원어가 늦게 얼고 Freezer Burn·암변 가능성이 높다.',
    capacityMt: 1200,
    broken: ['#1 냉동창고 #3 콘덴서 (미가동)', '#2 냉동창고 #3 콘덴서 (미가동)', '#3 냉동창고 #3 콘덴서 (에어 누설)'],
    /** 원문 우선순위 표기는 «#2 → #3 → #2» 로 #2가 두 번 나온다. 원문 그대로 옮기고 확인 대상으로 둔다. */
    priorityRaw: '#2 → #3 → #2',
    quote: {
      note: 'SNB 를 통해 수령한 1기 보수 견적',
      totalKrw: 141_000_000,
      items: [
        { name: 'CONDENSER', spec: 'PAW-700 COIL W150 × D2600 × 1100', qty: 4, unitKrw: 30_500_000 },
        { name: 'COATING COIL', spec: '', qty: 4, unitKrw: 3_600_000 },
        { name: 'WOOD BOX PACKING', spec: '', qty: 2, unitKrw: 2_300_000 },
      ],
    },
    recovery: [
      { date: '2026-07-05', tempC: -5, elapsedDays: null },
      { date: '2026-07-27', tempC: -10, elapsedDays: 22 },
      { date: '2026-08-08', tempC: -15, elapsedDays: 12 },
      { date: '2026-08-19', tempC: -18, elapsedDays: 11 },
    ],
  },

  /** 가나 사업장 누적 Scow 구매 — Plate Type 비중이 낮다 */
  scows: { total: 9000, plateType: 2500 },

  /** 참고: SKJ 1마리 총 뼈 277개 중 Skinning 40.1% · Cleaning 59.9% 제거 */
  bones: { totalPerFish: 277, skinningShare: 0.401, cleaningShare: 0.599 },
} as const
