// 돈육(Pork) 인텔리전스 대시보드 — 실데이터 (FAOSTAT QCL/TCL/TM/FBS/PP + USDA PSD)

// L1-① 중국 생산량 & ASF 사이클 (QCL 실데이터, 천톤 — 중국 단독, productionTrendData.중국과 동일)
export const asfCycleData = [
  { year: '2015', production: 57416, price: 99 },
  { year: '2016', production: 55207, price: 105 },
  { year: '2017', production: 55455, price: 111 },
  { year: '2018', production: 54992, price: 115 },
  { year: '2019', production: 43498, price: 111 },
  { year: '2020', production: 42102, price: 106 },
  { year: '2021', production: 53893, price: 109 },
  { year: '2022', production: 56346, price: 113 },
  { year: '2023', production: 58840, price: 114 },
  { year: '2024', production: 57948, price: 115 },
];

// L1-② 사료가-마진 압박 (참고 데이터)
export const feedCostData = [
  { quarter: '22-Q1', feedIndex: 120, porkMargin: 15 },
  { quarter: '22-Q2', feedIndex: 140, porkMargin: 8 },
  { quarter: '22-Q3', feedIndex: 160, porkMargin: -2 },
  { quarter: '22-Q4', feedIndex: 150, porkMargin: 4 },
  { quarter: '23-Q1', feedIndex: 130, porkMargin: 12 },
  { quarter: '23-Q2', feedIndex: 110, porkMargin: 18 },
];

// L1-③ 대륙간 무역 단가 스프레드 (OEC 참고)
export const tradeSpreadData = [
  { month: '23-01', euPrice: 2000, usPrice: 1800, asiaPrice: 2800 },
  { month: '23-03', euPrice: 2200, usPrice: 1900, asiaPrice: 2900 },
  { month: '23-05', euPrice: 2500, usPrice: 1950, asiaPrice: 3200 },
  { month: '23-07', euPrice: 2600, usPrice: 2100, asiaPrice: 3100 },
  { month: '23-09', euPrice: 2300, usPrice: 2000, asiaPrice: 2800 },
  { month: '23-11', euPrice: 2100, usPrice: 1900, asiaPrice: 2700 },
];

// L1-⑤ 탄소 배출 (FAOSTAT 참고)
export const esgData = [
  { category: '소고기', carbon: 99.0 },
  { category: '돼지고기', carbon: 12.3 },
  { category: '닭고기', carbon: 9.8 },
  { category: '양식 연어', carbon: 5.1 },
  { category: '어획 수산물', carbon: 2.0 },
];

// L2-⑥ Top 10 생산국 (QCL 2022 실데이터, 천톤)
export const top10ProducersData = [
  { country: '중국', production: 56346, pct: 44.0 },
  { country: '미국', production: 12252, pct: 9.6 },
  { country: '브라질', production: 5189, pct: 4.0 },
  { country: '스페인', production: 5066, pct: 4.0 },
  { country: '러시아', production: 4532, pct: 3.5 },
  { country: '독일', production: 4492, pct: 3.5 },
  { country: '베트남', production: 3313, pct: 2.6 },
  { country: '캐나다', production: 2257, pct: 1.8 },
  { country: '프랑스', production: 2152, pct: 1.7 },
  { country: '한국', production: 1419, pct: 1.1 },
];

// L2-⑦ 8개국 10년 추이 (QCL 실데이터, 천톤)
export const productionTrendData = [
  { year: '2015', 중국: 57416, 미국: 11121, 브라질: 3431, 스페인: 3855, 독일: 5570, 한국: 1217, 베트남: 2852, 러시아: 3099 },
  { year: '2016', 중국: 55207, 미국: 11320, 브라질: 3711, 스페인: 4181, 독일: 5590, 한국: 1266, 베트남: 3248, 러시아: 3355 },
  { year: '2017', 중국: 55455, 미국: 11611, 브라질: 3825, 스페인: 4299, 독일: 5506, 한국: 1280, 베트남: 3332, 러시아: 3516 },
  { year: '2018', 중국: 54992, 미국: 11943, 브라질: 3951, 스페인: 4530, 독일: 5350, 한국: 1329, 베트남: 3429, 러시아: 3744 },
  { year: '2019', 중국: 43498, 미국: 12543, 브라질: 4126, 스페인: 4641, 독일: 5232, 한국: 1364, 베트남: 2992, 러시아: 3937 },
  { year: '2020', 중국: 42102, 미국: 12845, 브라질: 4482, 스페인: 5003, 독일: 5118, 한국: 1403, 베트남: 2930, 러시아: 4282 },
  { year: '2021', 중국: 53893, 미국: 12560, 브라질: 4899, 스페인: 5180, 독일: 4971, 한국: 1407, 베트남: 3112, 러시아: 4304 },
  { year: '2022', 중국: 56346, 미국: 12252, 브라질: 5189, 스페인: 5066, 독일: 4492, 한국: 1419, 베트남: 3313, 러시아: 4532 },
  { year: '2023', 중국: 58840, 미국: 12391, 브라질: 5297, 스페인: 4871, 독일: 4210, 한국: 1435, 베트남: 3549, 러시아: 4720 },
  { year: '2024', 중국: 57948, 미국: 12611, 브라질: 5359, 스페인: 4956, 독일: 4289, 한국: 1455, 베트남: 3785, 러시아: 4943 },
];

// L2-⑧ 한국 수급 구조 (QCL+TCL+FBS 실데이터)
export const koreaSupplyData = [
  { year: '2015', production: 1217, imports: 550, perCapita: 35.9 },
  { year: '2016', production: 1266, imports: 570, perCapita: 37.0 },
  { year: '2017', production: 1280, imports: 590, perCapita: 37.8 },
  { year: '2018', production: 1329, imports: 620, perCapita: 40.7 },
  { year: '2019', production: 1364, imports: 640, perCapita: 40.1 },
  { year: '2020', production: 1403, imports: 610, perCapita: 38.0 },
  { year: '2021', production: 1407, imports: 635, perCapita: 38.3 },
  { year: '2022', production: 1419, imports: 663, perCapita: 41.4 },
  { year: '2023', production: 1435, imports: 690, perCapita: 39.7 },
];

// L2-⑨ 한국 수입 파트너 — 관세청 nitemtrade 2026.03-04(2개월 누적, HS6 필터) via agri_data.
//   2022(FAOSTAT TM) 대비 미국이 스페인을 추월해 1위(28.7% vs 25.6%). volume=2개월 톤, pct=점유율.
export const koreaImportPartnersData = [
  { country: '미국', volume: 38458, pct: 28.7 },
  { country: '스페인', volume: 33109, pct: 25.6 },
  { country: '캐나다', volume: 13049, pct: 11.4 },
  { country: '독일', volume: 8050, pct: 6.6 },
  { country: '네덜란드', volume: 7842, pct: 7.6 },
  { country: '칠레', volume: 5835, pct: 6.3 },
  { country: '오스트리아', volume: 3835, pct: 3.4 },
  { country: '덴마크', volume: 3700, pct: 2.2 },
  { country: '브라질', volume: 2546, pct: 1.5 },
  { country: '프랑스', volume: 1634, pct: 1.6 },
];

// L3-⑩ ASF → 수산물 반사수혜 (QCL 중국 + 수산물 도매가 참고)
export const asfSeafoodData = [
  { year: '2017', chinaProduction: 55455, seafoodIndex: 100 },
  { year: '2018', chinaProduction: 54992, seafoodIndex: 103 },
  { year: '2019', chinaProduction: 43498, seafoodIndex: 128 },
  { year: '2020', chinaProduction: 42102, seafoodIndex: 135 },
  { year: '2021', chinaProduction: 53893, seafoodIndex: 118 },
  { year: '2022', chinaProduction: 56346, seafoodIndex: 112 },
  { year: '2023', chinaProduction: 58840, seafoodIndex: 108 },
];

// L3-⑪ 단백질 포트폴리오 비교 (FAO/USDA 종합 참고)
export const proteinPortfolioData = [
  { metric: '평균 단가 (원/kg)', pork: 6500, seafood: 12000, poultry: 4500 },
  { metric: 'ASF/AI 리스크', pork: 85, seafood: 20, poultry: 70 },
  { metric: '탄소 배출 (CO2e)', pork: 62, seafood: 25, poultry: 49 },
  { metric: 'ESG 프리미엄', pork: 15, seafood: 85, poultry: 30 },
  { metric: '마진율 (%)', pork: 35, seafood: 70, poultry: 40 },
];

// L3-⑫ 한국 단백질 자급률 (FBS/PSD 종합)
export const selfSufficiencyData = [
  { protein: '소고기', selfRate: 40, importRate: 60 },
  { protein: '돼지고기', selfRate: 66, importRate: 34 },
  { protein: '수산물', selfRate: 65, importRate: 35 },
  { protein: '닭고기', selfRate: 78, importRate: 22 },
  { protein: '계란', selfRate: 99, importRate: 1 },
];
