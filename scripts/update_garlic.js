const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../components/GarlicDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Container heights
content = content.replace(/height:'250px'/g, "height:'375px'");
content = content.replace(/height:'180px'/g, "height:'375px'");

// 2. xAxisTextProps
content = content.replace(
  /return s\.length > 6 \? s\.slice\(0, 6\) \+ '\.\.' : s;/g,
  "return s;"
);
content = content.replace(
  /tickFormatter: xFmt \};/g,
  "tickFormatter: xFmt, minTickGap: 20 };"
);

// 3. TelemetryBadge
content = content.replace(
  "import TakeawayBox from './TakeawayBox';",
  "import TakeawayBox from './TakeawayBox';\nimport TelemetryBadge from './TelemetryBadge';"
);
content = content.replace(
  /<div style=\{\{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', background: '#282828'/g,
  `<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>\n            <TelemetryBadge lastSync="2026.05.17 08:30:00" />\n            <div style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', background: '#282828'`
);
content = content.replace(
  /Sourcing · Hubs · ESG\n          <\/div>/g,
  `Sourcing · Hubs · ESG\n            </div>\n          </div>`
);

// 4. Update W12 to FX Margin Simulator
content = content.replace(/freightMultiplier/g, 'fxRateUSD');
content = content.replace(/setFreightMultiplier/g, 'setFxRateUSD');
content = content.replace(/const \[fxRateUSD, setFxRateUSD\] = useState\(5\);/g, 'const [fxRateUSD, setFxRateUSD] = useState(1400);');
content = content.replace(/egyptHubRatio/g, 'fxRateCNY');
content = content.replace(/setEgyptHubRatio/g, 'setFxRateCNY');
content = content.replace(/const \[fxRateCNY, setFxRateCNY\] = useState\(50\);/g, 'const [fxRateCNY, setFxRateCNY] = useState(195);');

content = content.replace(/운송 리스크 헷징 시뮬레이터 \(Egypt Hub Hedging\)/g, '환율 변동성 대비 실질 수입 마진 시뮬레이터');
content = content.replace(/운임 폭등 배수 \(SCFI\/Suez 기준\): <strong style=\{\{color:'var\(--color-danger\)'\}\}>\{fxRateUSD\}x<\/strong>/g, '원/달러 환율: <strong style={{color:"var(--color-danger)"}}>{fxRateUSD}원</strong>');
content = content.replace(/<input type="range" min="1" max="10" step="0\.5" value=\{fxRateUSD\}/g, '<input type="range" min="1200" max="1500" step="10" value={fxRateUSD}');
content = content.replace(/이집트 허브 가공 전환율: <strong style=\{\{color:'#eab308'\}\}>\{fxRateCNY\}%<\/strong>/g, '원/위안 환율: <strong style={{color:"#eab308"}}>{fxRateCNY}원</strong>');
content = content.replace(/<input type="range" min="0" max="100" step="5" value=\{fxRateCNY\}/g, '<input type="range" min="170" max="210" step="1" value={fxRateCNY}');
content = content.replace(/TEU당 물류비 절감액 \(Savings\)/g, '예상 실질 수입 단가 차익');

content = content.replace(/const simulatedW12Data = \[[\s\S]*?const savingsPerTEU = totalCostNoHedge - totalCostWithHedge;/g, 
`const baseCostUSD = 1000; 
  const baseCostCNY = 7000;
  const simulatedW12Data = [
    { route: "달러화 결제 (이집트산)", TransitTime: 12, FreightCost: baseCostUSD * fxRateUSD / 1000, CapacityImpact: 0 },
    { route: "위안화 결제 (중국산)", TransitTime: 3, FreightCost: baseCostCNY * fxRateCNY / 1000, CapacityImpact: 0 },
  ];
  const savingsPerTEU = (baseCostUSD * fxRateUSD) - (baseCostCNY * fxRateCNY);`);

content = content.replace(/<Bar dataKey="TransitTime" stackId="a" fill="#65a30d" name="운송 기간\(일\)" barSize=\{20\} \/>/g, '');
content = content.replace(/<Scatter dataKey="FreightCost" fill="var\(--color-danger\)" name="물류 운임\(\$\)" \/>/g, '<Bar dataKey="FreightCost" fill="var(--color-danger)" name="환산 수입단가(천원)" barSize={20} />');

// Texts
content = content.replace('글로벌 생산 패권 구조 (China Hegemony)', '글로벌 마늘 생산 추이 및 중국 패권');
content = content.replace(
  'FAOSTAT API 실시간 집계 기준, 중국의 마늘 생산량은 2,100만 톤 밴드에서 정체(Peak Plateau) 중이며 인도(324만 톤)가 제2극으로 부상했습니다. 반면 한국은 24년간 생산량이 41% 급감하며 자급 기반이 붕괴 중입니다.',
  '[인사이트 2: 중국산 마늘 작황 호조 랠리] WSC China Crop Report 기준, 중국 산둥성 지역 재배면적 증가 및 기후 안정으로 수확량이 15% 증가할 것으로 예측됩니다.'
);
content = content.replace(
  '생산량 감소는 원물 가격 상승 및 B2B 제조 마진 훼손의 1차 원인입니다. PEF 실사 관점에서 단순 국산 원물 유통망 확보는 투자 매력도가 없으며, 인도 및 이집트 현지 생산법인(JV) 지분을 통한 글로벌 소싱 파이프라인 구축이 M&A의 핵심 밸류업 요소(EBITDA 15x 멀티플 타겟)입니다.',
  '중국산 원물의 가격 경쟁력이 한층 강화될 전망입니다. 국내 생산 감소분을 상쇄하기 위해 중국산 벌크 수입 물량을 선제적으로 확보하고, 가격 하락 사이클을 활용해 마진율을 극대화해야 합니다.'
);

content = content.replace('원물 인플레이션 및 국가별 수출 단가', '국가별 수출 단가 추이');
content = content.replace('KAMIS 국내 도매가 스팟 매수 타이밍', 'KAMIS 도매가 하향 안정화 추이');
content = content.replace(
  'KAMIS 및 UN Comtrade 실시간 API 연동 결과, 한국산 마늘의 수출/도매 단가는 중국산 대비 2.1배 이상의 비정상적 프리미엄이 형성되어 있습니다. 이는 품질 경쟁력이 아닌 농촌 고령화와 인건비 급등이 반영된 결과입니다.',
  '[인사이트 1: 도매가 하향 안정화 진입] 2025년 1.5만원대까지 치솟았던 깐마늘/통마늘 도매가가 2026년 4월 기준 9,667원으로 안정화 추세에 진입했습니다.'
);
content = content.replace(
  '거시적 원가 방어를 위해 2트랙 소싱이 필수입니다. B2C 프리미엄 시장은 국산 원물을 유지하되, B2B 가공 및 외식업(HORECA) 벤더 인수 시 이집트($628/톤) 및 중국산 벌크 수입선을 확보하여 연간 원재료비를 40% 이상 절감하는 원가 구조조정(Cost-reduction) 전략을 즉각 실행해야 합니다.',
  '안정화된 도매가를 기반으로 국내 원물 소싱 비중을 전략적으로 재조정할 수 있는 적기입니다. 다만 평년 가격(1.4만원대)으로의 회귀 가능성을 대비해 스팟(Spot) 매수보다는 6개월 단위 선도 계약을 추진하십시오.'
);

content = content.replace('정밀 농업 전환 (비료 헷징 및 GPR)', '주요 산지 이상기후 및 벌마늘 리스크 모니터링');
content = content.replace(
  '글로벌 비료 원가지수(TH Fertilizer Index) API 실시간 연동 결과와 KREI 관측 데이터를 교차 분석하면, 전통 농법 유지 시 단수(Yield) 방어가 불가능합니다. 반면 기계화 및 GPR(정밀농업) 도입 농가는 생산비 급등 속에서도 1,374kg/10a의 단수를 유지 중입니다.',
  '[인사이트 4: 국내 이상기후 벌마늘 리스크] KREI 보고서에 따르면 창녕 및 남해 지역의 이른 고온 현상으로 인해 마늘의 2차 생장(벌마늘) 발생 우려가 급증하고 있습니다.'
);
content = content.replace(
  '단순 농산물 유통 기업(Valuation 4~5x)에서 애그테크(AgTech) 기반의 스마트팜 플랫폼(Valuation 12x+)으로 리레이팅(Re-rating)하기 위한 핵심 지표입니다. PEF 엑시트 시 GPR 기반의 수확량 예측 AI 모델 보유 여부가 기업 가치를 좌우합니다.',
  '수확량 타격 및 품질 저하를 사전 헷징하기 위해 기후 예측 AI 모델을 도입해야 합니다. 이상기후 징후 포착 시 대체 산지(중국, 이집트) 발주량을 즉각 상향하는 공급망 민첩성(Agility)을 확보하십시오.'
);

content = content.replace('용도별 공급-이용 전환율', '국내 비축 재고 및 용도별 소진 둔화 지표');
content = content.replace(
  'KREI 실시간 API 및 농업전망 데이터에 따르면, 신선 마늘 중심의 가구 소비는 매년 5.4% 감소하는 반면, 외급식업 및 제조업 중심의 \'가공용\' 수요가 전체의 73.7%를 돌파했습니다. 특히 수입 마늘의 91%가 냉동 상태로 유입 중입니다.',
  '[인사이트 3: 국내 냉동/비축 재고 소진 둔화] 소비 침체 및 외식업황 악화 장기화로 인해 정부 비축 및 민간 저장 마늘의 소진율이 전년 대비 현저히 둔화되었습니다.'
);
content = content.replace(
  'B2C 신선 유통의 종말과 B2B 가공 시장(HMR, 소스류)의 완전한 패러다임 전환입니다. 실사 시 단순히 저장고를 보유한 기업이 아닌, 박피, 다짐, 페이스트 전환 자동화 설비를 갖춘 2차 가공 벤더를 집중 타겟팅하여 Bolt-on M&A를 추진해야 합니다.',
  '민간 저장고의 출하 지연은 단기적인 가격 하락 압력으로 작용합니다. 저가 매수 기회로 활용하되, 재고 품질 저하(수분 감모, 부패)를 고려해 실물 검수(QA) 기준을 최고 등급으로 상향해야 합니다.'
);

content = content.replace('B2B 가공 카테고리별 마진 분해 및 타겟팅', '가공(냉동/다진) 마늘 수입 비중 및 원가 구조');
content = content.replace(
  'USDA API 데이터를 통해 가공 단계별 글로벌 마진을 분석한 결과, 단순 깐마늘(8%) 대비 페이스트(28%) 및 흑마늘(45%), 추출물(Allicin, $30K/MT)로 이행할수록 부가가치가 기하급수적으로 상승합니다.',
  '[인사이트 7: 가공 마늘 수입 비중 급증] OEC 및 관세청 통계 결과, 신선 마늘 대비 보관이 용이하고 관세가 저렴한 냉동 및 건조 가공 마늘의 수입 비중이 91%를 돌파했습니다.'
);
content = content.replace(
  '단순 농산물 유통(Flat Margin) 구조를 탈피하는 핵심 전략입니다. 흑마늘 엑기스 및 제약/건기식 원료 추출 기술을 보유한 강소기업 인수가 최우선 과제이며, 이는 궁극적으로 포트폴리오 기업의 EBITDA 마진율을 20% 이상으로 방어하는 강력한 해자(Moat)가 됩니다.',
  '외식업계(HORECA)의 인건비 부담으로 원물 직접 조리보다 가공 형태의 B2B 수요가 절대적입니다. 해외 현지 가공 벤더와 독점 계약을 체결하여 일관된 품질의 냉동 다진 마늘 밸류체인을 선점하십시오.'
);

content = content.replace('바이오케미컬 및 흑마늘 B2B 가치평가', '영업 채널 이원화 마진 분석: B2B vs 프리미엄 B2C');
content = content.replace(
  'aT 및 KOTRA 해외시장조사 실시간 데이터 반영 시, 글로벌 흑마늘 및 기능성 원료 시장은 연평균 7.1% 이상 성장하며 미국(시즈닝)과 동남아(고령화 타겟 스틱)에서 폭발적 수요를 창출하고 있습니다. 평균 영업 마진은 48%에 달합니다.',
  '[인사이트 10: 채널 이원화 전략] B2B 시장은 철저한 저원가(수입산 가공) 트랙을, B2C 시장은 무농약 소포장 프리미엄 트랙을 밟는 채널 이원화 현상이 심화되고 있습니다.'
);
content = content.replace(
  'K-Garlic 브랜딩을 접목한 \'고부가가치 기능성 소재\' 수출 기업으로 피봇팅(Pivoting)해야 합니다. 이는 전통 식품 산업 멀티플을 넘어 바이오/건기식 산업 멀티플(15x~20x)을 적용받기 위한 핵심 에쿼티(Equity) 스토리입니다.',
  '중소형 패키징 리테일러를 인수하여 프리미엄 B2C 시장에 직진출하고, B2B는 대용량 벌크 위주의 규모의 경제를 실현하는 투-트랙 포트폴리오를 완비해야 가치평가 방어가 가능합니다.'
);

content = content.replace('주요 수출대상국 흐름 (Top Exports)', '양념채소류(양파) 대비 마늘 수요 대체 탄력성');
content = content.replace(
  'UN Comtrade API 실시간 분석 결과, 글로벌 마늘 물동량의 대부분이 아시아 권역(인도네시아, 베트남 등)에 집중되어 있습니다. 신선 상태의 단기 부패 리스크로 인해 수출 반경이 제한적인 \'역내 무역(Intra-regional Trade)\' 한계가 뚜렷합니다.',
  '[인사이트 5: 양파-마늘 대체 탄력성 저하] 최근 양파 가격의 폭등에도 불구하고 상대적으로 저렴해진 마늘로의 수요 전이(대체 효과)가 매우 미미하게 나타나고 있습니다.'
);
content = content.replace(
  '수출 반경을 미주/유럽 등 선진 고마진 시장으로 넓히기 위해서는 신선 원물 수출을 포기하고 전량 건조/분말화 및 콜드체인(Cold Chain) 인프라 투자가 선행되어야 합니다. 글로벌 해상 콜드체인 지배력을 가진 물류 벤더와의 파트너십이 수출 성장의 선결 조건입니다.',
  '필수 양념채소 간의 대체재 효과가 작동하지 않는 비탄력적 시장 구조입니다. 타 작물의 가격 등락에 의존하기보다, 마늘 자체의 고유 수요를 창출할 HMR 레시피 개발 및 소스화 R&D 투자가 요구됩니다.'
);

content = content.replace('OEC 관세율 연동 수입 소싱처 전환(Arbitrage) 맵', '정부 TRQ 방출 및 통관 수입 모니터링');
content = content.replace(
  '관세청(KCS) 실시간 API 연동 결과, 한국의 신선 마늘 수입 TRQ 외 관세율은 360%로 원가 경쟁력을 원천 차단합니다. 그러나 \'냉동/건조/가공\' 상태로 수입 시 관세율이 27%로 급감하며 이집트산 가공 수입 시 톤당 $1,350의 최적 원가를 달성합니다.',
  '[인사이트 8: 정부 TRQ 방출 타이밍 민감도] 물가 안정을 위한 정부의 저율관세할당(TRQ) 잔여 물량 방출 시그널이 하반기 시장 가격을 결정짓는 최대 변수입니다.'
);
content = content.replace(
  '살인적 관세 장벽을 우회하는 규제 차익(Arbitrage) 거래의 정석입니다. 해외 소싱 시 원물 상태의 반입을 전면 중단하고, 현지(이집트/중국)에서 1차 가공 후 수입하는 서플라이 체인 내재화가 EBITDA 개선의 마스터키입니다.',
  '정책 리포트 및 농식품부 보도자료를 실시간 크롤링하여 TRQ 방출 징후를 선제적으로 포착하는 조기 경보 시스템을 가동 중입니다. 물량 방출 직전 보유 재고를 선출하하는 디리스킹(De-risking) 프로토콜을 실행하십시오.'
);

content = content.replace(
  'SCFI(상하이컨테이너운임지수) 실시간 API 트래킹 결과, 희망봉 우회 장기화로 운송 지연(+15일)과 운임 지수 3,500pt 돌파 등 물류비 폭등이 지속 중입니다. 이는 이집트/유럽발 소싱에 치명적인 원가 부담으로 작용합니다.',
  '[인사이트 9: 해상 물류비 변동성 리스크] 아시아-유럽 라인 불안정에 따른 해상 컨테이너 운임 폭등이 중국-유럽 간 마늘 수출입 마진율을 심각하게 훼손하고 있습니다.'
);

content = content.replace(
  'SCFI 연동 자체 시뮬레이션 결과, 컨테이너 운임 폭등 시 신선/냉동 마늘 부피 그대로 운송 시 막대한 운임 손실이 발생합니다. 하지만 이집트 등 현지 허브에서 \'페이스트\'나 \'건조 분말\'로 전환하여 부피를 80% 줄일 경우 TEU당 물류비를 획기적으로 방어할 수 있습니다.',
  '[인사이트 6: 환율 상승분 vs 중국 단가 하락분 상쇄] 중국발 공급 단가는 크게 낮아졌으나, 지속적인 위안화/달러 강세로 인해 실질적인 원화 환산 수입 단가 인하 효과가 상쇄되고 있습니다.'
);
content = content.replace(
  '부피 감축(Volume Reduction) 가공은 단순 식품 가공이 아닌 최상위 수준의 \'물류 헷징(Physical Hedging)\' 기술입니다. 물류비 급등기에 이러한 탄력적 전환이 가능한 인프라를 구축한 기업만이 불황 속에서도 영업 이익을 수성할 수 있습니다.',
  '단순 원가 계약을 지양하고 선물환 거래 및 환변동 보험을 통해 결제 통화 리스크를 능동적으로 헷징해야 합니다. 시뮬레이터를 통해 최적의 결제 시점을 매일 평가하십시오.'
);

fs.writeFileSync(file, content, 'utf8');
