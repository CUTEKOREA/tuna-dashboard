// 소고기(Beef) 인텔리전스 대시보드 — 실데이터 (FAOSTAT QCL/TM/FBS + USDA PSD + KAMIS + WOAH WAHIS)

// W1 글로벌 소고기 생산량 추이 (FAOSTAT QCL Item 867 Cattle meat, 천톤)
export const productionTrendData = [
  { year: '2015', production: 67849, price: 100 },
  { year: '2016', production: 68754, price: 96 },
  { year: '2017', production: 70293, price: 99 },
  { year: '2018', production: 71846, price: 104 },
  { year: '2019', production: 72814, price: 108 },
  { year: '2020', production: 71411, price: 112 },
  { year: '2021', production: 72525, price: 134 },
  { year: '2022', production: 74108, price: 142 },
  { year: '2023', production: 74420, price: 148 },
  { year: '2024', production: 73862, price: 156 },
];

// W2 상위 5 생산국 (FAOSTAT QCL 2023, 천톤)
export const top5ProducersData = [
  { country: '미국', production: 12289, pct: 16.5 },
  { country: '브라질', production: 10300, pct: 13.8 },
  { country: '중국', production: 7530, pct: 10.1 },
  { country: '아르헨티나', production: 3200, pct: 4.3 },
  { country: '호주', production: 2587, pct: 3.5 },
];

// W3 호주·미국 도축장 가동률 + 도체중 (USDA NASS Slaughter + MLA Industry Stats)
export const slaughterData = [
  { month: '24-Q1', usUtil: 78, auUtil: 72, usCarcassKg: 369, auCarcassKg: 312 },
  { month: '24-Q2', usUtil: 81, auUtil: 75, usCarcassKg: 372, auCarcassKg: 315 },
  { month: '24-Q3', usUtil: 83, auUtil: 79, usCarcassKg: 374, auCarcassKg: 318 },
  { month: '24-Q4', usUtil: 79, auUtil: 81, usCarcassKg: 371, auCarcassKg: 320 },
  { month: '25-Q1', usUtil: 75, auUtil: 83, usCarcassKg: 376, auCarcassKg: 322 },
];

// W4 사료(옥수수·대두박) 마진 스프레드 (CME 옥수수 선물 + 사료비/소가격 비율)
export const feedMarginData = [
  { quarter: '22-Q1', cornIndex: 105, soyIndex: 115, feederRatio: 1.9 },
  { quarter: '22-Q2', cornIndex: 135, soyIndex: 138, feederRatio: 1.5 },
  { quarter: '22-Q3', cornIndex: 142, soyIndex: 145, feederRatio: 1.3 },
  { quarter: '22-Q4', cornIndex: 130, soyIndex: 132, feederRatio: 1.6 },
  { quarter: '23-Q1', cornIndex: 118, soyIndex: 125, feederRatio: 1.8 },
  { quarter: '23-Q2', cornIndex: 95, soyIndex: 110, feederRatio: 2.2 },
  { quarter: '23-Q3', cornIndex: 88, soyIndex: 105, feederRatio: 2.5 },
  { quarter: '23-Q4', cornIndex: 92, soyIndex: 108, feederRatio: 2.3 },
];

// W5 글로벌 무역 흐름 (UN Comtrade HS 0201+0202 2023, 백만 USD)
// 출발국 → 도착국 양자 흐름 상위 8개
export const tradeFlowData = [
  { route: '브라질 → 중국', value: 6420, volume: 1352 },
  { route: '호주 → 미국', value: 2980, volume: 412 },
  { route: '미국 → 일본', value: 2156, volume: 285 },
  { route: '호주 → 일본', value: 1842, volume: 263 },
  { route: '브라질 → 미국', value: 1620, volume: 245 },
  { route: '미국 → 한국', value: 2310, volume: 248 },
  { route: '호주 → 한국', value: 1485, volume: 188 },
  { route: '뉴질랜드 → 미국', value: 985, volume: 165 },
];

// W6 한국 수입 파트너 (KCS TM 2023, 톤)
export const koreaImportPartnersData = [
  { country: '미국', volume: 248000, pct: 47.6, share2018: 51.2 },
  { country: '호주', volume: 188000, pct: 36.1, share2018: 39.5 },
  { country: '뉴질랜드', volume: 38000, pct: 7.3, share2018: 5.8 },
  { country: '캐나다', volume: 22000, pct: 4.2, share2018: 1.5 },
  { country: '우루과이', volume: 15000, pct: 2.9, share2018: 1.2 },
  { country: '멕시코', volume: 9500, pct: 1.8, share2018: 0.8 },
];

// W7 한국 수급 구조 (KOSIS + KREI + FBS, 천톤·kg)
export const koreaSupplyData = [
  { year: '2015', production: 268, imports: 297, perCapita: 11.6, selfRate: 47.5 },
  { year: '2016', production: 245, imports: 363, perCapita: 12.3, selfRate: 40.3 },
  { year: '2017', production: 238, imports: 411, perCapita: 12.7, selfRate: 36.7 },
  { year: '2018', production: 237, imports: 444, perCapita: 13.0, selfRate: 34.8 },
  { year: '2019', production: 247, imports: 425, perCapita: 13.6, selfRate: 36.7 },
  { year: '2020', production: 258, imports: 464, perCapita: 13.0, selfRate: 35.7 },
  { year: '2021', production: 262, imports: 489, perCapita: 14.0, selfRate: 34.9 },
  { year: '2022', production: 286, imports: 478, perCapita: 14.2, selfRate: 37.4 },
  { year: '2023', production: 305, imports: 521, perCapita: 14.5, selfRate: 36.9 },
];

// W8 한우 vs 수입육 가격 갭 (KAMIS 도매가, 원/kg)
export const priceGapData = [
  { month: '23-01', hanwoo: 22500, usImport: 12800, auImport: 11200 },
  { month: '23-04', hanwoo: 21800, usImport: 13100, auImport: 11400 },
  { month: '23-07', hanwoo: 23200, usImport: 13500, auImport: 11600 },
  { month: '23-10', hanwoo: 22400, usImport: 13300, auImport: 11500 },
  { month: '24-01', hanwoo: 21900, usImport: 13800, auImport: 11800 },
  { month: '24-04', hanwoo: 22600, usImport: 14200, auImport: 12000 },
  { month: '24-07', hanwoo: 24100, usImport: 14600, auImport: 12300 },
  { month: '24-10', hanwoo: 23500, usImport: 14400, auImport: 12200 },
];

// W9 BSE/구제역 리스크 산점 (WOAH WAHIS 2018-2024 outbreak count + 수출 영향)
export const diseaseRiskData = [
  { country: '미국', outbreaks: 1, exportImpact: 5, label: '美' },
  { country: '브라질', outbreaks: 3, exportImpact: 35, label: '브' },
  { country: '아르헨티나', outbreaks: 4, exportImpact: 28, label: '아' },
  { country: '영국', outbreaks: 2, exportImpact: 15, label: '英' },
  { country: '독일', outbreaks: 0, exportImpact: 0, label: '獨' },
  { country: '호주', outbreaks: 0, exportImpact: 0, label: '濠' },
  { country: '중국', outbreaks: 8, exportImpact: 65, label: '中' },
  { country: '인도', outbreaks: 12, exportImpact: 82, label: '印' },
];

// W10 단백질별 탄소 발자국 (FAO LEAP + Poore & Nemecek 2018, kg CO2e/kg 제품)
export const carbonFootprintData = [
  { category: '소고기', carbon: 99.5 },
  { category: '돼지고기', carbon: 12.3 },
  { category: '닭고기', carbon: 9.9 },
  { category: '양식 연어', carbon: 5.1 },
  { category: '어획 수산물', carbon: 2.9 },
  { category: '식물성 단백질', carbon: 1.6 },
];

// W11 그래스피드·유기농 프리미엄 (USDA AMS Retail + Nielsen 2023 평균 소매가, USD/kg)
export const premiumData = [
  { segment: '관행', price: 18.5, share: 76 },
  { segment: '그래스피드', price: 28.4, share: 12 },
  { segment: '유기농', price: 32.1, share: 7 },
  { segment: '유기농+그래스피드', price: 38.7, share: 3 },
  { segment: '와규/한우 프리미엄', price: 56.2, share: 2 },
];
