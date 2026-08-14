#!/usr/bin/env node
/**
 * Snapshot /whelk into a self-contained HTML report.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: node render_whelk_archive.mjs <output-dir>");
  process.exit(1);
}

const archiveDate = "2026-08-14";
const data = JSON.parse(fs.readFileSync(path.join(root, "public/data/whelk_real_data_v1.json"), "utf8"));
const fta = JSON.parse(fs.readFileSync(path.join(root, "data/whelk_fta_quarterly.json"), "utf8"));

const KPIS = [
  { title: "영국산 수입 의존도", value: "52.1%", context: "HS160559 2024년 연간 수입액 $30.46M / $58.5M", chip: "KCS 2024 연간", status: "STATIC" },
  { title: "영국산 평균 입고단가", value: "$12.8/kg", context: "부산항 도착 · 최신 물류비 반영으로 표시", chip: "2024.2H", status: "STATIC" },
  { title: "캐나다 어획 감소율", value: "−74%", context: "10년 추세 · 생태계 변화로 표시", chip: "2023.12", status: "STATIC" },
  { title: "영국산 원물 수율", value: "20–25%", context: "수율 1위 · 튀르키예 대비 2배로 표시", chip: "STATIC", status: "STATIC" },
  { title: "KFAS 학술 검증", value: `${(data.widgets || []).length}건`, context: "국립수산과학원 검증으로 표시된 학술 위젯", chip: "KFAS 2024", status: "STATIC" },
];

const PILLARS = [
  {
    id: "S1",
    title: "원료 수급",
    desc: "글로벌 어획 헤게모니, 북해 어획량 변동, B. undatum 자원 동향",
    widgets: [
      { title: "글로벌 어획 생산량 상위 5개국", cardDesc: "전 세계 골뱅이 원물 주요 생산국 비중·생산량 — 글로벌 수급 헤게모니", dataKey: "globalCaptureData", status: "STATIC", syncDate: "2022년 기준", situation: "[FAOSTAT] 전 세계 골뱅이 생산량이 북대서양(영국·아일랜드) 등 특정 해역에 편중되어 있어, 한 국가의 어획량이 줄어들면 전체 수급이 크게 흔들릴 수 있는 상황입니다.", action: "상위 5개국 중 영국과 아일랜드가 글로벌 고품질 골뱅이 물량의 핵심 공급망을 장악하고 있습니다. 한국 프리미엄 B2C 통조림 시장은 육질이 뛰어난 B. undatum에 절대적으로 의존합니다.", source: "FAOSTAT (2022)" },
      { title: "캐나다 vs 영국 어획량 장기 시계열", cardDesc: "해수온 상승의 캐나다 어획 영향 + 영국산 수요 이동 예측", dataKey: "canadaCaptureData", status: "STATIC", syncDate: "2024년 1H 기준", situation: "[DFO Canada] 바닷물 온도가 높아지면서 캐나다 해역의 골뱅이가 사라지고 있으며, 이로 인해 전 세계 바이어들이 유일한 대안인 영국으로 몰려 경쟁이 치열해지고 있습니다.", action: "캐나다 해역 어획량이 수온 상승 등 해양 생태계 변화로 인해 과거 10년간 74%나 급감하며 사실상 산업 붕괴 수준에 도달했습니다.", source: "DFO Canada / UK MMO (2024 1H)" },
      { title: "한국 연안 골뱅이 어획 생산량", cardDesc: "국내 어획량 장기 추이 — 신선 활어 전량 일본 직수출, 국내 가공용은 100% 수입", dataKey: "koreaCaptureData", status: "STATIC", syncDate: "2024년 기준", situation: "[FAO FishStat] 한국 바다에서도 골뱅이가 많이 잡히지만, 값비싼 신선(활어) 상태로 전량 일본에 직수출되고 있어 정작 국내 가공용은 수입에 100% 의존하고 있습니다.", action: "한국은 연안에서 연간 9,000톤 수준을 어획하는 글로벌 상위 생산국이나, 국내 B2C 통조림 제조를 위한 대량의 가공 원물은 100% 수입산에 의존하는 이중 가공무역 구조에 갇혀 있습니다.", source: "FAO FishStat Capture (한국 골뱅이 어획 실측, ~2022)" },
      { title: "영국 MCRS 상향 시나리오별 공급쇼크 시뮬레이션", cardDesc: "영국 IFCA 최소보존규격 50/55/60mm 시나리오별 어획량 영향", dataKey: "mcrsScenarioData", status: "STATIC", syncDate: "2026 시뮬레이션", situation: "[IFCA 시뮬레이션] 영국이 골뱅이 최소 크기 기준을 현행 45mm에서 55mm로 올리면, 어획 가능 물량이 최대 30% 이상 급감하여 글로벌 수급에 충격파를 일으킬 수 있습니다.", action: "MCRS 55mm 시나리오(가장 유력)에서 영국산 어획량이 2027년까지 현행 대비 26% 감소(14,091톤→9,800톤)할 것으로 예측됩니다.", source: "IFCA MCRS 시뮬레이션 (2026)" },
      { title: "포스트 영국(Post-UK) 시대 대비 신규 어장 스코어카드", cardDesc: "대체 어장 4축 평가 — 어획 추세·FTA 혜택·물류 효율", dataKey: "postUkScorecardData", status: "STATIC", syncDate: "2026 분석", situation: "[FAOSTAT/ICES] 영국 다음으로 유력한 골뱅이 공급처는 아일랜드(종합 82점)와 아이슬란드(78점)이며, 캐나다(38점)는 사실상 탈락입니다.", action: "포스트 영국 전략의 핵심은 아일랜드(종합 82점)입니다. 동일 B. undatum 종이며 EU FTA 관세 0% 혜택, 영국과 인접한 물류 인프라를 보유합니다.", source: "FAOSTAT + ICES (2026 분석)" },
      { title: "한국 골뱅이 어획 글로벌 순위 (FAO 2022)", cardDesc: "FAO FishStat Capture 2022 — 한국 세계 5위(종코드 7종 합산)", dataKey: "koreaGlobalShareData", status: "STATIC", syncDate: "FAO FishStat Capture 2022", situation: "[FAO] 2022년 한국 골뱅이 어획은 9,062톤으로 세계 5위입니다(멕시코 17,782·영국 14,091·프랑스 10,117·러시아 9,229·한국 9,062 順).", action: "한국이 세계 5위 생산국이면서도 어획 물량 대부분이 신선 활어로 일본에 직수출돼 국내 가공용 원물은 수입에 의존하는 모순 구조입니다. 종코드는 단일 GAS가 아닌 7종 합산 기준입니다.", source: "FAO FishStat Capture 2022" },
      { title: "패류 자원별 양식 가능성 및 공급 탄력성", cardDesc: "골뱅이 vs 바지락·동죽·연어 — 해적생물 분류로 양식 영구 불가", dataKey: "aquacultureData", status: "STATIC", syncDate: "2024년 기준", situation: "[국립수산과학원] 충격적 사실: 골뱅이는 '해적생물(Pest)'로 분류되어 양식이 영구히 불가능한 유일한 국민 안주", action: "골뱅이는 바지락·동죽 등 패류를 잡아먹는 해적생물로서 양식 시도 자체가 기존 패류 산업을 파괴합니다. 수요 폭증 시에도 공급을 인위적으로 늘릴 방법이 전무한 공급 탄력성 제로 품목입니다.", source: "국립수산과학원" },
      { title: "해수온 상승에 따른 조업지 이탈 기후 리스크", cardDesc: "북대서양 해수면 온도(SST) + 영국·캐나다 어획량 — 포스트 영국(Post-UK) 대비", dataKey: "climateRiskData", status: "STATIC", syncDate: "2026 기후 시뮬레이션", situation: "[IPCC/FAOSTAT] 바닷물 온도가 높아지면 찬물에 사는 골뱅이가 서식지를 떠나버립니다. 캐나다에서는 이미 수온 상승으로 어획량이 크게 줄어들었습니다.", action: "냉수성 저서생물인 B. undatum은 SST 15°C를 넘으면 서식지를 이탈하며, 이미 캐나다에서 이 시나리오가 현실화되어 어획량이 −74% 붕괴했습니다.", source: "IPCC / FAOSTAT" },
    ],
  },
  {
    id: "S2",
    title: "가공·생산",
    desc: "살수율(20-25%), 한·영 가공 마진 구조, 가공 효율성",
    widgets: [
      { title: "SG 2026 밸류업 × 골뱅이 HMR 신제품 로드맵", cardDesc: "HMR 6종 개발 진행률 — 혼술 에디션·에어프라이어 키트 26Q3 출시", dataKey: "sgValueUpData", status: "STATIC", syncDate: "SG 내부기획 2026 Q2", situation: "[SG 밸류업] 2026 운영방안에 따라 골뱅이 HMR 라인 6종을 개발 중이며, 혼술 에디션과 에어프라이어 키트가 26Q3 출시 목표로 가장 빠르게 진행 중입니다.", action: "핵심은 '혼술 에디션 150g'(85% 완성)과 '에어프라이어 키트 200g'(70% 완성)의 26Q3 성수기 적시 출시입니다. 두 제품 합산 연간 매출 목표 37억 원으로 표시돼 있습니다.", source: "SG 2026 밸류업 운영방안" },
      { title: "골뱅이 가공원물 투입량 YoY (HS160559)", cardDesc: "KCS HS160559 통관 — 가공원물 물량·금액·시사단가 YoY", dataKey: "feedstockYoyData", status: "STATIC", syncDate: "KCS 2024 연간", situation: "[KCS] 가공원물(HS160559) 투입량이 2024년 6,215톤/$58.50M으로 전년(8,251톤/$68.98M) 대비 물량 −24.7%·금액 −15.2% 감소했고, 시사단가는 $8.36→$9.41/kg로 +12.6% 올랐습니다.", action: "원물 투입 감소가 공장 가동률 하락으로 직결되므로, 조달팀은 비수기 선매입으로 연간 6,000톤 이상 피드스톡을 락인해야 한다고 적혀 있습니다.", source: "KCS 관세청 HS160559 통관 (2023·2024)" },
      { title: "원물 부산물(패각/내장) 업사이클링 순환 가치", cardDesc: "가공 후 78% 폐기물 → 해양 콜라겐·바이오 세라믹 재자원화", dataKey: "byproductData", status: "STATIC", syncDate: "2024년 기준", situation: "[MDPI] 원물을 가공할 때 버려지는 78%의 껍데기와 내장에서 고부가가치의 '해양 콜라겐'을 추출할 수 있어 새로운 수익 창출이 가능합니다.", action: "골뱅이 원물의 78%는 껍질·내장·체액으로 폐기되지만, 이 부산물에서 해양 콜라겐 펩타이드를 추출할 수 있다고 적혀 있습니다.", source: "MDPI / ResearchGate" },
    ],
  },
  {
    id: "S3",
    title: "물류·통관",
    desc: "FTA 무관세 우위, 콜드체인, IUU/MCRS 규제 리스크",
    widgets: [
      { title: "국내 수입산 골뱅이 국가별 점유율", cardDesc: "KCS HS160559 2024년 연간 수입금액($M) 기준 국가별 점유율(총 $58.5M, 기타 포함) — 영국·아일랜드 합산 65% 단일 해역 리스크", dataKey: "importMarketShare", status: "STATIC", syncDate: "KCS 2026-05-15", situation: "[KCS] 2024년 연간 수입금액 기준 영국(52.1%)·아일랜드(12.9%) 두 나라에 65%를 의존하고 있어, 해당 지역에 문제가 생기면 공급망 전체가 마비될 위험이 큽니다.", action: "영국산 원물 수입액이 $30.4M(2024년 연간 수입액 $58.5M의 52.1%)으로 1위를 수성 중이며, 아일랜드 물량($7.6M)까지 합산 시 북해 해역 의존도가 65%에 육박한다고 적혀 있습니다.", source: "KCS 관세청 (2026-05-15)" },
      { title: "영국산 원물 월별 수입 계절성", cardDesc: "월별 수입액·물량 추이 — 5~8월 성수기 집중, Reefer 운임 급등", dataKey: "seasonalityData", status: "STATIC", syncDate: "KCS 2026-05-15", situation: "[KCS] 국내 골뱅이 소비는 여름철 비빔면과 야식 수요로 인해 5월~8월에 집중되며, 이때 수입 물량이 연간 물량의 절반을 넘습니다.", action: "여름철 성수기 집중 현상으로 인해 단월 최고치($5.7M)를 기록하는 8월 전후로는 글로벌 Reefer 해상운임 급등과 국내 항만 적체 현상이 빈번히 발생한다고 적혀 있습니다.", source: "KCS 관세청 월별 통관 시계열" },
      { title: "국가별 원물 수율 기반 총사용원가 비교", cardDesc: "단가 vs 살수율 — 저수율 함정 회피 총사용원가(TCU) 분석", dataKey: "yieldArbitrageData", status: "STATIC", syncDate: "2024년 기준", situation: "[KCS+Seafish] 튀르키예나 중국산 원물이 표면상 영국산보다 싸 보이지만, 버려지는 내장이나 껍질 등을 빼고 순수 살코기 양만 보면 오히려 영국산이 더 저렴합니다.", action: "단순 통관 단가 기준으로는 중국/튀르키예산(R. venosa)이 영국산(B. undatum)의 절반 수준으로 저렴해 보입니다. 그러나 TCU를 산출하면 튀르키예산은 $91.0/kg까지 치솟아 영국산($54.2/kg)보다 68%나 비싸다고 적혀 있습니다.", source: "KCS + Seafish UK" },
      { title: "영국산 수입 통관 원가 폭포수 구조", cardDesc: "FOB → CIF → 관세 → 내륙 통관 단계별 — 한-영 FTA 무관세 방어", dataKey: "waterfallData", status: "STATIC", syncDate: "KCS 2026-05-15", situation: "[KCS] 영국 수입산 원물은 관세가 0%로 면제되는 한-영 FTA 혜택 덕분에, 다른 부가 비용이 붙더라도 매우 뛰어난 가격 방어력을 보입니다.", action: "영국산 원물의 평균 수입단가 $12.75/kg 이면에 있는 가장 강력한 방어기제는 한-영 FTA(수입 관세 0%)입니다. 해운 운임($0.42)과 내륙 통관/보관료($0.15)를 합산해도 총 입고단가를 $13.32/kg 선에서 억제한다고 적혀 있습니다.", source: "KCS 관세청 수입 통관 통계" },
      { title: "FTA 골뱅이 분기별 수입 동향 (KMI 21개 분기)", cardDesc: "KMI FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 골뱅이 시계열.", dataKey: null, status: "STATIC", syncDate: "2026-05", situation: fta.note, action: "2020~2024 4년 누적 對FTA 골뱅이 수입은 5.92→3.30천 톤(−44.3%), 가치 $67.6→$34.2M(−49.4%). 2025 H1은 1.5천 톤·$20.1M(전년 동기 +17.6%/+36.2%). 영국 점유는 2024 76.0%에서 2025 H1 84.7%로 표시됩니다.", source: fta.source },
      { title: "흑해산 R. venosa 공급 안정성 트렌드", cardDesc: "튀르키예·불가리아·루마니아 흑해산 R. venosa 어획 추이", dataKey: "blackSeaSupplyData", status: "STATIC", syncDate: "FAO FishStat 2022", situation: "[FAOSTAT] 흑해산 R. venosa(뿔고둥)는 튀르키예가 연간 4,000~4,500톤을 안정적으로 생산하며, 영국산 B. undatum의 유일한 대규모 대체 공급원입니다.", action: "흑해산 R. venosa는 총사용원가(TCU) 기준으로 영국산 대비 15~20% 저렴하며, 맛과 식감이 유사하여 통조림 가공 적합성이 높다고 적혀 있습니다.", source: "FAO FishStat Capture 2022 (흑해 R. venosa 어획)" },
      { title: "환율 1,500원 비상 경보 시스템", cardDesc: "USD/KRW 구간별 자동 경보 + 단계별 대응 매뉴얼", dataKey: "fxAlertThresholds", status: "STATIC", syncDate: "2026-05-30 (환율 임계값 정의)", situation: "[한국은행] USD/KRW 환율이 2026년 5월 기준 1,480원대에 진입하며 '위험 구간(1,450~1,550)' 임계점에 접근했습니다. 골뱅이 원물의 100% 달러 결제 구조상 수입 원가에 직격탄입니다.", action: "환율 100원 상승 시 톤당 원화 매입가가 약 130만 원(+10%) 증가한다고 적혀 있습니다. 1,500원 돌파 시 긴급 선물환 계약을 체결해야 한다고 화면이 안내합니다.", source: "한국은행 실시간 환율" },
      { title: "환율 및 수입 단가 복합 변동성", cardDesc: "분기별 USD 단가 vs USD/KRW 환율 — 이중 타격(Double Whammy) 분석", dataKey: "fxCorrelationData", status: "STATIC", syncDate: "KCS/한국은행 2026-05-15", situation: "[KCS+BOK] 수입 단가(달러) 자체는 안정적이어도 환율이 오르면 실제 기업이 지불해야 하는 원화 결제액이 크게 늘어나 수익성이 악화됩니다.", action: "2023년 1분기부터 2024년 4분기 시계열에서 영국산 원물 USD 단가가 $11.82에서 $12.75(+7.9%)로 인상되고, 같은 기간 USD/KRW는 1,264원에서 1,400원(+10.8%)으로 올랐다고 적혀 있습니다.", source: "KCS / 한국은행" },
      { title: "영국 현지 어획 규제 리스크 진단", cardDesc: "MCRS·쿼터제·IFCA 규제 — 영국 자원 보호주의 정책 위협 측정", dataKey: "ukRegulatoryRadar", status: "STATIC", syncDate: "2024년 기준", situation: "[IFCA/MMO] 영국 정부가 골뱅이 크기 규제(MCRS)를 강화하고 어획량을 통제하면서, 영국산 물량 조달에 차질이 빚어질 위험이 커지고 있습니다.", action: "MCRS를 45mm에서 55mm로 상향하려는 움직임은 단기 어획량을 20~30% 소멸시킬 수 있는 치명적 규제(리스크 점수 85)로 표시됩니다.", source: "UK IFCA / MMO" },
      { title: "카드뮴 생체축적 및 식품안전 규제 진단", cardDesc: "부위별 카드뮴 농도 — 내장 제거율 불량 시 통관 반려 리스크", dataKey: "cadmiumData", status: "STATIC", syncDate: "2024년 기준", situation: "[식약처/EFSA] 골뱅이 내장에는 카드뮴이 식약처 기준치를 초과하여 쌓이므로, 가공 시 내장을 완벽하게 제거하지 않으면 통관에 실패할 수 있습니다.", action: "골뱅이의 간췌장(내장) 부위에는 카드뮴이 근육 대비 20~100배 농축(5.5mg/kg)되어 식약처 기준(2.0mg/kg)을 크게 초과한다고 적혀 있습니다.", source: "식약처 / EFSA" },
      { title: "PFAS(과불화화합물) 차세대 식품안전 리스크", cardDesc: "EU/미국 PFAS 규제가 수산물 수입에 미치는 영향 — 어종별 비교", dataKey: "pfasRiskData", status: "STATIC", syncDate: "KFAS 2024", situation: "[KFAS 군산연안 연구] 골뱅이(복족류)의 PFOS 수치(0.42 ng/g)는 EU 기준(1.0 ng/g) 이하로 '주의' 수준이나, 담치·굴 등 이매패류는 이미 기준을 초과하여 규제 강화 시 연쇄 영향이 우려됩니다.", action: "EU가 2025년부터 수산물 PFOS/PFOA 모니터링을 의무화했다고 화면이 적고 있습니다. 골뱅이는 현재 안전 범위이나 기준 하향 시 격상 위험이 있다고 안내합니다.", source: "KFAS 군산연안 연구" },
    ],
  },
  {
    id: "S4",
    title: "판매·수요",
    desc: "한국 통조림 시장, 가격 갭, FX/이중 타격 헤지, 채널 다변화",
    widgets: [
      { title: "원산지별 CIF 단가 격차 — 대체재 탄력성", cardDesc: "KCS HS160559 원산지별 CIF($/kg) — 북해 vs 저단가 대체재", dataKey: "originCifGapData", status: "STATIC", syncDate: "KCS 2024 연간", situation: "[KCS] 2024년 원산지별 CIF 단가는 영국 $12.75/kg·아일랜드 $12.27 vs 중국 $6.37·세네갈 $4.73로 북해산이 저단가 대체재의 약 2배입니다.", action: "조달팀은 B2B 원가 방어 라인에 한해 세네갈·중국산을 20~30% 블렌딩해 CIF를 낮추되, 수율을 반영한 총사용원가(TCU) 검증을 통과한 물량만 채택해야 한다고 적혀 있습니다.", source: "KCS 관세청 HS160559 통관 (2024)" },
      { title: "B2C 통조림 브랜드 경쟁력 & 가성비 매핑", cardDesc: "고형량 vs 100g당 단가 vs 점유율 — 브랜드 가성비 매트릭스", dataKey: "brandPositioningData", status: "STATIC", syncDate: "2024년 기준", situation: "[aT FIS] 유동 골뱅이가 1위를 지키고 있으나, 타 브랜드들이 고형량(살코기 비율)을 늘리거나 가격을 낮추는 방식으로 가성비 경쟁을 치열하게 전개 중입니다.", action: "경쟁사 '동표골뱅이'는 고형량 147g과 100g당 단가 ₩3,600을 무기로 잠식 중이며, 유동은 130g·₩4,200으로 프리미엄 B2C를 수성 중이라고 적혀 있습니다.", source: "aT FIS 식품산업통계 (2024)" },
      { title: "B2C 및 B2B 채널별 매출 분포", cardDesc: "대형마트·e커머스·편의점·B2B 식자재 채널별 점유율 변화", dataKey: "channelDemandData", status: "STATIC", syncDate: "2024년 기준", situation: "[aT FIS] 대형마트 판매는 둔화되는 반면, 쿠팡 등 이커머스와 B2B 식자재 유통 채널의 성장이 폭발적입니다.", action: "대형마트 및 SSM 점유율 62.3%, e커머스 11.8%, 편의점 6.4%, B2B 식자재 19.5%로 표시됩니다.", source: "aT FIS 식품산업통계" },
      { title: "미국 캔 르네상스 — 골뱅이 수출 신시장 기회", cardDesc: "Z세대 '틴 캔 르네상스' 트렌드 + K-Food 골뱅이 침투 잠재력", dataKey: "usCannedMarketData", status: "STATIC", syncDate: "KMI 2026.05", situation: "[KMI 카드뉴스] 미국에서 통조림이 다시 '힙'해지고 있습니다. Z세대의 '틴 캔 르네상스'가 SNS에서 바이럴되며, 고급 수산 통조림 시장이 연 10% 이상 성장 중입니다.", action: "미국 프리미엄 캔 시장이 $15.5B(2026E)에 달하며, 초기 목표 매출 $1.2M(2026E)로 표시돼 있습니다. 이 위젯의 whelkPotential 계열은 대시보드 추정입니다.", source: "KMI 카드뉴스 (2026.05)" },
      { title: "헬시플레저 시대 — 골뱅이 영양 경쟁력 벤치마크", cardDesc: "단백질·지방·철분 벤치마크 — 닭가슴살·참치캔·새우 대비", dataKey: "nutritionBenchmarkData", status: "STATIC", syncDate: "KFDA 2024 기준", situation: "[KMI 헬시플레저] 골뱅이는 100g당 82kcal, 단백질 18.2g, 지방 0.8g으로 닭가슴살보다 낮은 칼로리에 3배 이상의 철분을 보유한 '숨은 슈퍼푸드'입니다.", action: "골뱅이(자숙)는 칼로리 82kcal, 지방 0.8g, 철분 3.2mg으로 표시됩니다.", source: "KFDA 2024 식품성분표" },
      { title: "1인 가구 혼술 트렌드 및 채널 수입량 변동", cardDesc: "냉동 자숙 골뱅이육 수입 +105% — 혼술 이코노미 구조적 전환", dataKey: "importSurgeData", status: "STATIC", syncDate: "KCS 월별 통관 2026-05-15", situation: "[KCS/FishFocus] 1인 가구의 '혼술' 트렌드가 유행을 넘어 구조적 소비로 굳어지며, 냉동 조미 골뱅이의 수입량이 2배 넘게 급증했습니다.", action: "2025년 2월 기준 냉동 자숙 골뱅이육 수입이 170톤(전년 동기 대비 +105%), 1~2월 누적 수입액 USD 4.95M(+84%)을 기록했다고 적혀 있습니다.", source: "KCS / FishFocus UK" },
      { title: "B2C 통조림 규격별 고형량(살코기) 투명성 비율", cardDesc: "300g 캔의 실제 살코기 40~50% — 투명성 마케팅 차별화", dataKey: "solidContentData", status: "STATIC", syncDate: "2024년 기준", situation: "[aT FIS] 일반적인 300g 캔 제품의 절반 이상이 국물(조미액)이며, 실제 골뱅이 살코기는 40~50% 수준에 불과합니다.", action: "300g 골뱅이 통조림에서 실제 고형량은 120~150g(40~50%)에 불과하며, 나머지는 간장 기반 조미액이라고 적혀 있습니다.", source: "aT FIS 식품산업통계" },
      { title: "할랄 인증 해양콜라겐 — 글로벌 시장 기회", cardDesc: "골뱅이 부산물 해양 콜라겐의 할랄/코셔 인증 기반 수출 시장 규모·지역별 성장 잠재력", dataKey: "halalCollagenData", status: "STATIC", syncDate: "KMI 2026.04", situation: "[KMI 할랄인증] 동남아시아의 할랄 인증 의무화(BPJPH)로 수산물 부산물 기반 해양 콜라겐의 수출 기회가 급부상하고 있습니다. 중동/북아프리카의 할랄 비중은 95%입니다.", action: "중동·북아프리카($420M, 할랄 95%), 동남아($310M, 할랄 72%) 시장은 연 10~12% 성장 중이라고 적혀 있습니다.", source: "KMI 할랄인증" },
    ],
  },
  {
    id: "S5",
    title: "ESG·지속가능성",
    desc: "양식 불가 자원 + 영국 IFCA/MCRS 규제 + EU PPWR 포장 컴플라이언스",
    widgets: [
      { title: "EU PPWR 포장규제 컴플라이언스 리스크", cardDesc: "EU 포장폐기물규정(PPWR)이 골뱅이 캔 패키징 비용·수출 경쟁력에 미치는 리스크 6축 평가", dataKey: "euPackagingRiskData", status: "STATIC", syncDate: "KMI 2026.03", situation: "[KMI 카드뉴스] EU가 2025년부터 시행하는 PPWR은 재활용 비율 의무화(80점)와 EPR 비용 부담 증가(70점)가 골뱅이 캔 수출에 직접적 비용 상승 요인입니다.", action: "2030년까지 식품 포장재 재활용 비율 70% 의무화, EPR 비용이 캔당 €0.02~0.05 증가 예상으로 표시됩니다.", source: "KMI / EU PPWR" },
    ],
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtCell(v) {
  if (v == null || v === "") return "—";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString("ko-KR") : v.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  return escapeHtml(v);
}

function dataTable(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return '<p class="muted">수록 시계열 없음</p>';
  const keys = [];
  for (const row of rows) {
    if (row && typeof row === "object") {
      for (const k of Object.keys(row)) {
        if (k === "fill" || k === "color") continue;
        if (!keys.includes(k)) keys.push(k);
      }
    }
  }
  const shown = keys.slice(0, 8);
  const head = shown.map((k) => `<th>${escapeHtml(k)}</th>`).join("");
  const body = rows.map((row) => `<tr>${shown.map((k) => `<td>${fmtCell(row[k])}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function widgetCard(w) {
  const rows = w.dataKey === null
    ? null
    : data[w.dataKey];
  const extra = w.dataKey === null
    ? `<h4>연도별 수입</h4>${dataTable(fta.yearly)}<h4>원산지 점유율(%)</h4>${dataTable(fta.originShareVolume)}<h4>단가 분기</h4>${dataTable(fta.unitPriceQuarterly)}<h4>2025 H1 YoY</h4>${dataTable(fta.yoy2025H1)}`
    : dataTable(rows);
  return `<article class="widget">
    <h3>${escapeHtml(w.title)}</h3>
    <p class="muted">${escapeHtml(w.cardDesc)}</p>
    <p><span class="chip">${escapeHtml(w.status)}</span><span class="chip">${escapeHtml(w.syncDate)}</span></p>
    <p class="info-box"><b>현황</b> ${escapeHtml(w.situation)}</p>
    <p class="ok-box"><b>시사점</b> ${escapeHtml(w.action)}</p>
    ${extra}
    <p class="source-line">출처: ${escapeHtml(w.source)}</p>
  </article>`;
}

function kfasCard(w) {
  return `<article class="widget">
    <h3>${escapeHtml((w.title || "").replace(/^🔬\s*/, ""))}</h3>
    <p class="muted">${escapeHtml(w.subtitle || "국립수산과학원 검증 학술 연구")}</p>
    <p><span class="chip">STATIC</span><span class="chip">KFAS 2024</span><span class="chip">신뢰도 ${escapeHtml(w.reliability ?? "—")}</span></p>
    <p class="info-box"><b>현황</b> ${escapeHtml(w.sit || "")}</p>
    <p class="ok-box"><b>시사점</b> ${escapeHtml(w.strat || "")}</p>
    ${dataTable(w.data || [])}
    <p class="source-line">출처: ${escapeHtml(w.source || "KFAS 한국수산과학회지")}</p>
  </article>`;
}

const inlineCount = PILLARS.reduce((n, p) => n + p.widgets.length, 0);
const kfas = data.widgets || [];
const totalWidgets = inlineCount + kfas.length;

const pillarHtml = PILLARS.map((p) => `<section class="report-section" id="${p.id}">
    <h2>${p.id} ${escapeHtml(p.title)}</h2>
    <p>${escapeHtml(p.desc)}</p>
    <h3>정적 위젯 ${p.widgets.length}개</h3>
    ${p.widgets.map(widgetCard).join("\n")}
  </section>`).join("\n");

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>골뱅이 전략 인텔리전스 아카이브 — ${archiveDate}</title>
  <style>
:root{color-scheme:light dark;--paper:#f6f0e6;--surface:#fffdf8;--ink:#2a2114;--muted:#6b5d45;--line:#e4d6be;--navy:#7a4a12;--accent:#b45309;--accent-soft:#fde7c7;--shadow:0 16px 40px rgba(122,74,18,.08);--sans:"Pretendard","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;--serif:"Iowan Old Style","Noto Serif KR","Batang",serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.7}
.hero{background:linear-gradient(145deg,#4a2c0d,#b45309 58%,#f59e0b);color:#fff;padding:64px max(24px,calc((100vw - 1120px)/2)) 52px}
.hero-kicker{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:#fde68a;font-weight:750;margin:0 0 16px}
.hero h1{font-family:var(--serif);font-size:clamp(2.1rem,4.6vw,3.5rem);line-height:1.15;margin:0}
.hero-subtitle{max-width:840px;margin:20px 0 0;color:#fff7ed;font-size:1.05rem}
.hero-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:24px}
.hero-meta span{font-size:.78rem;border:1px solid rgba(255,255,255,.28);padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.08)}
.layout{display:grid;grid-template-columns:220px minmax(0,900px);gap:48px;max-width:1220px;margin:0 auto;padding:44px 28px 80px}
.toc{position:sticky;top:24px;align-self:start;max-height:calc(100vh - 48px);overflow:auto;border-left:1px solid var(--line);padding-left:16px}
.toc-label{font-size:.68rem;letter-spacing:.16em;font-weight:800;color:var(--accent);margin:0 0 10px}
.toc ol{list-style:none;padding:0;margin:0}
.toc a{display:block;color:var(--muted);text-decoration:none;font-size:.76rem;line-height:1.4;padding:5px 8px}
.report-section{background:var(--surface);padding:clamp(24px,4vw,44px);margin:0 0 20px;border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow)}
.report-section h2{font-family:var(--serif);font-size:clamp(1.4rem,2.6vw,2.05rem);color:var(--navy);margin:0 0 18px}
.report-section h3,.widget h4{font-size:1.08rem;margin:24px 0 10px}
.callout{border-left:4px solid var(--accent);padding:10px 14px;background:var(--accent-soft);border-radius:0 10px 10px 0;margin:0 0 18px}
.kpi-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:8px 0 16px}
.kpi,.widget{border:1px solid var(--line);border-radius:14px;padding:16px;background:#fffaf3;margin:0 0 14px}
.kpi-label,.muted{font-size:.74rem;color:var(--muted);font-weight:750}
.kpi-value{font-family:var(--serif);font-size:1.4rem;color:var(--navy);margin:6px 0!important}
.kpi-context{font-size:.78rem;color:var(--muted);margin:0!important}
.chip{display:inline-block;font-size:.68rem;border:1px solid var(--line);border-radius:999px;padding:1px 7px;margin-right:4px}
.widget h3{margin:0 0 8px;font-size:1.02rem}
.info-box,.ok-box{font-size:.88rem;padding:8px 10px;border-radius:8px;border-left:3px solid}
.info-box{background:#eff6ff;border-color:#2563eb}
.ok-box{background:#ecfdf5;border-color:#0f766e}
.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;margin:10px 0}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:.78rem}
th,td{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left}
th{background:#f8efe0;color:var(--navy)}
.source-line{font-size:.75rem;color:var(--muted)!important}
.report-footer{max-width:900px;margin:0 auto 50px;padding:0 28px;color:var(--muted);font-size:.73rem}
@media(max-width:900px){.layout{display:block;padding:22px 14px 50px}.toc{position:relative;top:auto;max-height:none;margin-bottom:18px}.kpi-strip{grid-template-columns:1fr}}
@media print{body{background:#fff}.toc{display:none}.widget,.kpi{break-inside:avoid}}
  </style>
</head>
<body>
<header class="hero">
  <p class="hero-kicker">Whelk · Dashboard Archive</p>
  <h1>골뱅이<br>전략 인텔리전스</h1>
  <p class="hero-subtitle">https://leedonggun.co.kr/whelk 페이지의 KPI 5개, 5필라 정적 위젯 ${inlineCount}개, KFAS 학술 위젯 ${kfas.length}개를 ${archiveDate} 기준으로 옮긴 아카이브다. /api/whelk/kcs·/api/whelk/dart 라이브 응답은 접속 시점마다 달라져 넣지 않았다.</p>
  <div class="hero-meta">
    <span>아카이브일 ${archiveDate}</span>
    <span>원본 /whelk</span>
    <span>정적 위젯 ${totalWidgets}개</span>
    <span>KPI 5개</span>
    <span>KCS · IFCA · MMO · EFSA · aT FIS</span>
  </div>
</header>
<div class="layout">
<nav class="toc" aria-label="목차">
  <p class="toc-label">REPORT MAP</p>
  <ol>
    <li><a href="#summary">요약과 읽는 법</a></li>
    <li><a href="#kpi">상단 KPI</a></li>
    ${PILLARS.map((p) => `<li><a href="#${p.id}">${p.id} ${escapeHtml(p.title)}</a></li>`).join("")}
    <li><a href="#kfas">KFAS 학술 위젯</a></li>
    <li><a href="#sources">출처와 한계</a></li>
  </ol>
</nav>
<main>
<section class="report-section" id="summary">
  <h2>요약과 읽는 법</h2>
  <p class="callout">이 문서는 신규 리서치가 아니다. 라이브 페이지가 이미 보여 주던 정적 콘텐츠를 메뉴 제거 전에 보존한 기록이다. 라이브에서는 필라를 하나씩 열어야 하지만, 여기에서는 5단계를 모두 펼쳤다.</p>
  <p>페이지의 중심 논지는 한국 가공용 골뱅이가 영국산 B. undatum에 기대고, 국내 연안 어획은 활어로 일본에 나가며, 캐나다 붕괴와 영국 MCRS·환율이 원가 리스크라는 것이다. 통조림 고형량·혼술 채널·부산물 콜라겐이 판매 측 이야기다.</p>
  <p>숫자는 대시보드 JSON과 화면 문구를 그대로 옮긴 것이다. <code>/api/whelk/live</code>는 정적 파일을 읽는 경로이고, 2026-08-14 응답도 <code>isLive: false</code>·<code>status: STATIC</code>이다. 화면의 HS160559 집계와 <code>/api/whelk/kcs</code>의 HS 0307600000(달팽이)·1605550000(문어)은 같은 품목이 아니다.</p>
</section>
<section class="report-section" id="kpi">
  <h2>상단 KPI 5개</h2>
  <div class="kpi-strip">${KPIS.map((kpi) => `<article class="kpi">
      <p class="kpi-label">${escapeHtml(kpi.title)}</p>
      <p class="kpi-value">${escapeHtml(kpi.value)}</p>
      <p class="kpi-context"><span class="chip">${escapeHtml(kpi.chip)}</span> ${escapeHtml(kpi.context)}</p>
    </article>`).join("\n")}</div>
</section>
${pillarHtml}
<section class="report-section" id="kfas">
  <h2>KFAS 학술 연구 인텔리전스</h2>
  <p>라이브 화면은 모든 필라 하단에 국립수산과학원 검증으로 표시된 학술 위젯 ${kfas.length}개를 붙였다. 아래는 JSON의 sit·strat 전문이다.</p>
  ${kfas.map(kfasCard).join("\n")}
</section>
<section class="report-section" id="sources">
  <h2>출처와 한계</h2>
  <ul>
    <li>원본 페이지: <a href="https://leedonggun.co.kr/whelk">https://leedonggun.co.kr/whelk</a></li>
    <li>정적 위젯·KPI: tuna-dashboard <code>public/data/whelk_real_data_v1.json</code> · <code>components/WhelkDashboard.tsx</code></li>
    <li>FTA 분기: <code>data/whelk_fta_quarterly.json</code> (${escapeHtml(fta.source)})</li>
    <li>제외: <code>/api/whelk/kcs</code>, <code>/api/whelk/dart</code> 라이브 응답. KCS 라우트는 골뱅이 HS가 아닌 달팽이·문어 코드를 조회한다.</li>
    <li>MCRS 시나리오, 포스트 영국 점수, 미국 캔 침투, SG 밸류업 진행률, 환율 경보 구간은 화면이 시뮬레이션·내부기획·추정으로 표시한 값이다.</li>
    <li>이 HTML은 네트워크 요청이 없는 읽기 전용 스냅샷이며, 원 페이지의 실시간 갱신 기능을 재현하지 않는다.</li>
  </ul>
</section>
</main>
</div>
<footer class="report-footer">참치왕국 대시보드 /whelk 아카이브 · ${archiveDate} · 메뉴 제거 전 보존본. 외부 네트워크 요청 없음.</footer>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
const htmlPath = path.join(outDir, "Whelk_Dashboard_Archive_2026-08-14.html");
const jsonPath = path.join(outDir, "whelk_real_data_v1_snapshot_20260814.json");
const ftaPath = path.join(outDir, "whelk_fta_quarterly_snapshot_20260814.json");
fs.writeFileSync(htmlPath, html);
fs.copyFileSync(path.join(root, "public/data/whelk_real_data_v1.json"), jsonPath);
fs.copyFileSync(path.join(root, "data/whelk_fta_quarterly.json"), ftaPath);
console.log(htmlPath);
console.log("inline", inlineCount, "kfas", kfas.length, "total", totalWidgets, "bytes", Buffer.byteLength(html));
