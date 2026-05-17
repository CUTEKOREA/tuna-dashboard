const fs = require('fs');
const filePath = 'public/data/jukkumi_real_data_v1.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newWidgets = [
  {
    "id": "w21_leisure_fishing_impact",
    "title": "유어낚시 자원 잠식도",
    "category": "part1",
    "format": "new",
    "chartType": "bar",
    "xKey": "name",
    "bars": [
      { "key": "value", "name": "어획 비중(%)", "color": "#F87171" }
    ],
    "sit": "서해안 주꾸미 유어낚시 어획 비중이 전체 연안 어획량의 40%에 육박하며 춘계 산란 자원을 고갈시키고 있습니다.",
    "strat": "2026년 상업망 TAC 도입 시 국내산 조달 단가 폭등이 확실시됩니다. 선제적으로 베트남/태국산 냉동 원물 비축량을 30% 증대하십시오.",
    "data": [
      { "name": "상업 어획", "value": 60 },
      { "name": "유어낚시", "value": 40 }
    ]
  },
  {
    "id": "w22_vietnam_trawl_fip",
    "title": "베트남 저인망 FIP 진행률",
    "category": "part1",
    "format": "new",
    "chartType": "area",
    "xKey": "name",
    "areas": [
      { "key": "value", "name": "인증 비율(%)", "color": "#3B82F6" }
    ],
    "sit": "주 수입원인 베트남 Vung Tau 지역 저인망 어업의 어획증명제(FIP) 인증 전환이 가속화되고 있습니다.",
    "strat": "인증 원물은 비인증 원물 대비 15%의 프리미엄이 형성됩니다. FIP 초기 단계부터 전략적 벤더 파트너십을 구축하여 원가 우위를 선점하십시오.",
    "data": [
      { "name": "2023", "value": 15 },
      { "name": "2024", "value": 25 },
      { "name": "2025", "value": 45 },
      { "name": "2026", "value": 70 }
    ]
  },
  {
    "id": "w23_hmr_yield_optimization",
    "title": "HMR 가공 수율 및 단가",
    "category": "part2",
    "format": "new",
    "chartType": "composed",
    "xKey": "name",
    "bars": [
      { "key": "수율", "name": "수율(%)", "color": "#10B981" }
    ],
    "lines": [
      { "key": "단가", "name": "가공 단가($)", "color": "#F59E0B" }
    ],
    "sit": "주꾸미의 난소/소화기관을 제거한 HMR 가공용 반제품 수율이 동남아 현지 가공을 통해 8% 개선되었습니다.",
    "strat": "국내 인건비 상승에 대응하여, 태국/베트남 현지 공장에서의 1차 손질(내장 제거) 아웃소싱 비율을 극대화하십시오.",
    "data": [
      { "name": "국내 가공", "수율": 55, "단가": 4.5 },
      { "name": "태국 가공", "수율": 61, "단가": 2.8 },
      { "name": "베트남 가공", "수율": 63, "단가": 2.5 }
    ]
  },
  {
    "id": "w24_china_aquaculture_rd",
    "title": "중국 단완낙지 양식 생장률",
    "category": "part2",
    "format": "new",
    "chartType": "line",
    "xKey": "name",
    "lines": [
      { "key": "value", "name": "생존율(%)", "color": "#8B5CF6" }
    ],
    "sit": "중국 연안의 두족류 종묘 배양 기술 발전으로 인공 부화 및 생존율이 점진적으로 상승하고 있습니다.",
    "strat": "양식 주꾸미 상용화는 아직 5년 이상 소요됩니다. 단기적으로는 자연산 원물 수급 파이프라인 방어에 총력을 기울이십시오.",
    "data": [
      { "name": "2020", "value": 12 },
      { "name": "2022", "value": 18 },
      { "name": "2024", "value": 31 },
      { "name": "2026", "value": 45 }
    ]
  },
  {
    "id": "w25_tariff_schedule_impact",
    "title": "수입 관세 철폐 스케줄",
    "category": "part3",
    "format": "new",
    "chartType": "bar",
    "xKey": "name",
    "bars": [
      { "key": "value", "name": "관세율(%)", "color": "#EC4899" }
    ],
    "sit": "Korea Tariff Schedule에 따라 2026년부터 아세안(ASEAN) 주요국의 주꾸미 수입 관세가 추가로 인하됩니다.",
    "strat": "관세 인하 시점에 맞춰 대규모 선도 계약을 체결하고, 통관-냉동창고 직행 물류망을 최적화하여 5%의 마진을 추가 확보하십시오.",
    "data": [
      { "name": "2024", "value": 10 },
      { "name": "2025", "value": 8 },
      { "name": "2026", "value": 3 }
    ]
  },
  {
    "id": "w26_coldchain_utilization",
    "title": "동남아 콜드체인 인프라",
    "category": "part3",
    "format": "new",
    "chartType": "radar",
    "radarKey": "subject",
    "radars": [
      { "key": "A", "name": "현재 효율", "color": "#3B82F6" },
      { "key": "B", "name": "목표 효율", "color": "#F59E0B" }
    ],
    "sit": "글로벌 물류비 상승으로 인해 콜드체인 컨테이너 적재 효율이 수입 단가를 결정하는 핵심 변수가 되었습니다.",
    "strat": "팔레트 포장 모듈화를 통해 냉동 컨테이너 적재율을 95%까지 끌어올려 물류비를 방어해야 합니다.",
    "data": [
      { "subject": "공간 활용", "A": 75, "B": 95 },
      { "subject": "보냉 지속", "A": 80, "B": 99 },
      { "subject": "적재 속도", "A": 60, "B": 90 },
      { "subject": "리드타임", "A": 70, "B": 95 }
    ]
  },
  {
    "id": "w27_japan_kfood_export",
    "title": "일본 K-주꾸미 수출 성장세",
    "category": "part4",
    "format": "new",
    "chartType": "line",
    "xKey": "name",
    "lines": [
      { "key": "value", "name": "수출액(만$)", "color": "#EF4444" }
    ],
    "sit": "일본 내 K-Food 맵단(매운맛+단맛) 트렌드 확산으로 '주꾸미 볶음 밀키트' 수요가 전년 대비 120% 폭증했습니다.",
    "strat": "내수용으로 한정되었던 주꾸미 가공품을 K-Spicy 프리미엄 브랜드로 포장하여 아시아 역수출 채널을 즉각 가동하십시오.",
    "data": [
      { "name": "2023", "value": 150 },
      { "name": "2024", "value": 330 },
      { "name": "2025", "value": 720 },
      { "name": "2026", "value": 1580 }
    ]
  },
  {
    "id": "w28_domestic_senior_hmr",
    "title": "시니어 친화 간편식 침투율",
    "category": "part4",
    "format": "new",
    "chartType": "bar",
    "xKey": "name",
    "bars": [
      { "key": "value", "name": "시장 침투율(%)", "color": "#14B8A6" }
    ],
    "sit": "고령화 사회 진입으로 연화식(부드러운 식감) 처리된 해산물 소비가 증가하고 있습니다.",
    "strat": "효소 처리를 통해 육질을 부드럽게 한 '시니어 주꾸미 조림' 라인업을 B2B 급식 시장에 선제적으로 런칭하십시오.",
    "data": [
      { "name": "2022", "value": 2 },
      { "name": "2024", "value": 8 },
      { "name": "2026", "value": 18 }
    ]
  },
  {
    "id": "w29_africa_human_rights_risk",
    "title": "아프리카 대체재 인권 리스크",
    "category": "part5",
    "format": "new",
    "chartType": "composed",
    "xKey": "name",
    "bars": [
      { "key": "위험도", "name": "위험도(지수)", "color": "#F87171" }
    ],
    "lines": [
      { "key": "수출감소", "name": "수출 감소율(%)", "color": "#3B82F6" }
    ],
    "sit": "대체재인 아프리카(모리타니아 등) 산 문어 조업 선단에서 강제 노동 리스크가 불거져 EU의 제재 움직임이 있습니다.",
    "strat": "글로벌 바이어들이 아프리카산 대신 투명한 동남아산 주꾸미/오징어로 선회할 가능성이 높습니다. K-선단의 무결성을 마케팅에 활용하십시오.",
    "data": [
      { "name": "모리타니아", "위험도": 85, "수출감소": 15 },
      { "name": "세네갈", "위험도": 78, "수출감소": 12 },
      { "name": "모로코", "위험도": 60, "수출감소": 5 }
    ]
  },
  {
    "id": "w30_tac_regulation_map",
    "title": "2026 자원관리 TAC 압박도",
    "category": "part5",
    "format": "new",
    "chartType": "area",
    "xKey": "name",
    "areas": [
      { "key": "value", "name": "규제 강도", "color": "#F59E0B" }
    ],
    "sit": "'제4차 수산자원관리기본계획'에 따라 주요 산란장 보호구역 지정 및 금어기가 대폭 강화됩니다.",
    "strat": "춘계 산란 주꾸미(알베기)의 국내 공급이 사실상 차단됩니다. 2월 조기 조업 및 사전 수입 물량 확보를 통해 춘계 프로모션을 방어해야 합니다.",
    "data": [
      { "name": "2024", "value": 30 },
      { "name": "2025", "value": 60 },
      { "name": "2026", "value": 100 }
    ]
  }
];

// Remove existing widgets with the same IDs to avoid duplicates
const existingIds = new Set(newWidgets.map(w => w.id));
data.widgets = data.widgets.filter(w => !existingIds.has(w.id));
data.widgets.push(...newWidgets);

// Write back
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Successfully injected Jukkumi v4.2 widgets");
