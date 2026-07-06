#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = '/Users/idong-geon/Downloads/BNI Global ';
const AGRI_ROOT = '/Users/idong-geon/agri_pipeline/data';
const OUTPUT_FILE = path.join(ROOT, 'data', 'bni_global_dashboard.json');

const DATASETS = {
  corn: {
    name: '옥수수',
    englishName: 'Corn',
    hsCodes: ['100510', '100590'],
    fredPath: '03_곡물(Grains)/corn/processed_data/fred/corn_fred.csv',
    customsPath: '03_곡물(Grains)/corn/processed_data/customs_kr/corn_customs_kr_monthly.csv',
    comtradePath: '03_곡물(Grains)/corn/processed_data/comtrade/corn_comtrade_annual.csv',
    priceUnit: 'USD/mt',
    bniReview: '예상 대비 옥수수 재고가 줄었고 파종면적은 9,535만 에이커로 상향 조정되었습니다.',
    bniOutlook: '웨더마켓을 우선 확인해야 하며 미국 가뭄 면적 19%와 7월 USDA 수급보고서가 단기 방향을 좌우합니다.',
    customerMessage: '옥수수는 재고 하향과 고온건조 우려가 동시에 존재해 저가 고정 매입보다 USDA 발표 전후 분할 매입이 적합합니다.',
    stance: '분할 매입',
    riskLevel: '경계',
    signalScore: 82,
  },
  wheat: {
    name: '소맥',
    englishName: 'Wheat',
    hsCodes: ['100111', '100119', '100191', '100199'],
    fredPath: '03_곡물(Grains)/wheat/processed_data/fred/wheat_fred.csv',
    customsPath: '03_곡물(Grains)/wheat/processed_data/customs_kr/wheat_customs_kr_monthly.csv',
    comtradePath: '03_곡물(Grains)/wheat/processed_data/comtrade/wheat_comtrade_annual.csv',
    priceUnit: 'USD/mt',
    bniReview: '미국 소맥 파종면적과 분기 재고가 시장 예상치를 하회하며 공급 부족 우려가 유지됩니다.',
    bniOutlook: '미국 밖 산지는 상대적으로 양호하지만 봄밀 파종면적 부진과 러시아·캐나다 변수 모니터링이 필요합니다.',
    customerMessage: '소맥은 미국발 공급 프리미엄과 비미국산 작황 완화 요인이 충돌하므로 원산지 전환 가능성을 함께 열어두어야 합니다.',
    stance: '원산지 비교',
    riskLevel: '경계',
    signalScore: 79,
  },
  soybean: {
    name: '대두',
    englishName: 'Soybean',
    hsCodes: ['120110', '120190'],
    fredPath: '04_두류서류(Pulses_Tubers)/soybean/processed_data/fred/soybean_fred.csv',
    customsPath: '04_두류서류(Pulses_Tubers)/soybean/processed_data/customs_kr/soybean_customs_kr_monthly.csv',
    comtradePath: '04_두류서류(Pulses_Tubers)/soybean/processed_data/comtrade/soybean_comtrade_annual.csv',
    priceUnit: 'USD/mt',
    bniReview: '미국 대두 파종면적은 예상에 부합했지만 기말 재고는 최근 6년 최대 수준입니다.',
    bniOutlook: '미중 관세 인하 논의와 미국 남부 강수량 감소가 수요와 생육 리스크를 동시에 흔듭니다.',
    customerMessage: '대두는 재고 부담이 가격 상단을 막지만 관세 완화 뉴스에는 민감하므로 중국향 수요 신호를 확인하며 접근합니다.',
    stance: '관세 뉴스 확인',
    riskLevel: '주의',
    signalScore: 72,
  },
  sugar: {
    name: '설탕',
    englishName: 'Sugar',
    hsCodes: ['170111', '170112', '170113', '170114', '170191', '170199'],
    fredPath: '09_기호품(Beverages)/sugar/processed_data/fred/sugar_fred.csv',
    customsPath: '09_기호품(Beverages)/sugar/processed_data/customs_kr/sugar_customs_kr_monthly.csv',
    comtradePath: '09_기호품(Beverages)/sugar/processed_data/comtrade/sugar_comtrade_annual.csv',
    priceUnit: 'US cents/lb',
    bniReview: '월물 변경을 앞두고 5년 내 저점에서 상승 전환했고 원당과 WP가 급등했습니다.',
    bniOutlook: '8월물 정백당 가격과 WP를 모니터링하면서 브라질 생산량, 에탄올 전환비율, 인도 몬순을 봐야 합니다.',
    customerMessage: '설탕은 저점 이탈 실패 이후 기상 프리미엄이 붙는 구간이어서 단기 재고는 방어하고 신규 장기계약은 WP를 확인합니다.',
    stance: '방어 재고',
    riskLevel: '높음',
    signalScore: 86,
  },
  palm_oil: {
    name: '팜유',
    englishName: 'Palm Oil',
    hsCodes: ['151110', '151190', '151321', '151329'],
    fredPath: '08_식용유(Oils)/palm_oil/processed_data/fred/palm_oil_fred.csv',
    customsPath: '08_식용유(Oils)/palm_oil/processed_data/customs_kr/palm_oil_customs_kr_monthly.csv',
    comtradePath: '08_식용유(Oils)/palm_oil/processed_data/comtrade/palm_oil_comtrade_annual.csv',
    priceUnit: 'USD/mt',
    bniReview: '원유 약세와 말레이시아 생산량 증가가 맞물리며 단기 매도 심리가 확대되었습니다.',
    bniOutlook: '계절적 증산, 중국 식용유 재고 증가, 러시아 해바라기씨유 수출관세 변화를 함께 봐야 합니다.',
    customerMessage: '팜유는 공급 압박이 강해 급한 물량만 짧게 가져가고, 중국 재고와 인도네시아 수출 기준가격을 확인합니다.',
    stance: '짧은 커버',
    riskLevel: '주의',
    signalScore: 74,
  },
};

const SUPPLEMENTARY_MARKETS = [
  {
    name: '대두유',
    englishName: 'Soybean Oil',
    status: 'BNI 보고서 직접 추출',
    latestSignal: '8월물은 66.93 cents/lb까지 밀렸고 EIA 재생디젤용 대두유 사용량 감소와 UCO 수입 증가가 부담입니다.',
    watch: '미국 바이오연료 정책, D4 RIN, 폐식용유 수입량',
  },
  {
    name: '동물성 유지',
    englishName: 'Animal Fat',
    status: 'BNI 보고서 직접 추출',
    latestSignal: 'CWG와 BFT가 각각 약세를 보였으나 D4 RIN 강세가 하방을 일부 제한했습니다.',
    watch: '도축두수, 렌더링 수급, UCO Gulf 가격',
  },
];

const RISK_RADAR = [
  {
    factor: '미국 가뭄과 웨더마켓',
    level: '높음',
    affected: ['옥수수', '소맥', '대두'],
    evidence: 'BNI 2026.07.06 보고서는 미국 지역별 가뭄으로 인한 생산량 감소 우려를 공통 리스크로 제시했습니다.',
    action: '미국산 노출 계약은 USDA 수급보고서 전후로 분할하고, 남미·흑해·호주 대체 원산지 견적을 병행합니다.',
  },
  {
    factor: '바이오연료와 유지류 정책',
    level: '경계',
    affected: ['대두유', '동물성 유지', '팜유'],
    evidence: '재생디젤용 원료 수요, D4 RIN, UCO 수입 압력이 BNI 유지류 페이지에서 반복 변수로 등장합니다.',
    action: '원료별 가격만 보지 말고 대두유·UCO·동물성 유지 간 대체 스프레드를 함께 추적합니다.',
  },
  {
    factor: '중국 수요와 관세 협의',
    level: '경계',
    affected: ['대두', '팜유'],
    evidence: 'BNI는 미중 농산물 관세 인하 논의와 중국 식용유 재고 증가를 방향성 변수로 제시했습니다.',
    action: '관세 완화 뉴스는 대두 수요를, 높은 중국 식용유 재고는 팜유 주문 속도를 제한하는 신호로 나눠 해석합니다.',
  },
  {
    factor: '원산지 공급 재편',
    level: '주의',
    affected: ['소맥', '설탕'],
    evidence: '러시아·캐나다·아르헨티나 소맥과 브라질·인도 설탕 작황이 최신 보고서의 핵심 관찰 항목입니다.',
    action: '단일 원산지 고정 단가보다 복수 원산지 비교표를 거래처 제안서에 함께 붙입니다.',
  },
];

const API_COVERAGE = [
  {
    source: 'BNI Global PDF',
    status: '정기 보고서',
    usage: '거래처에게 설명할 시장 문맥, 전망 문장, 주간 핵심 변수',
  },
  {
    source: 'FRED',
    status: 'CSV 반영',
    usage: '옥수수·소맥·대두·설탕·팜유의 국제 가격 기준선',
  },
  {
    source: 'KCS',
    status: 'CSV 반영',
    usage: '한국 수입 단가, 수입액, 최신 통관 기간, 주요 공급국 노출',
  },
  {
    source: 'UN Comtrade',
    status: 'CSV 반영',
    usage: '글로벌 교역 커버리지와 HS 코드별 장기 구조 확인',
  },
  {
    source: 'WITS·WTO·Tariffs',
    status: '연결 후보',
    usage: '관세·비관세 장벽과 원산지 전환 리스크 보강',
  },
  {
    source: 'ECOS·KAMIS',
    status: '확장 후보',
    usage: '환율과 국내 가격 전가율을 거래처 가격표에 연결',
  },
];

const API_CONNECTIONS = [
  {
    source: 'BNI Global PDF',
    endpoint: '/api/bni-global',
    status: '연결됨',
    cadence: '보고서 업로드 기준',
    fields: ['시장 문맥', '전망 문장', '거래처 전달 문안'],
    insightUse: '정기 보고서의 정성 판단을 가격·수입·교역 데이터와 묶는 기준 문맥',
    priority: 1,
  },
  {
    source: 'FRED',
    endpoint: 'agri_pipeline processed CSV',
    status: '연결됨',
    cadence: '월간·분기 데이터',
    fields: ['국제 가격', '월간 변화율', '장기 변동률'],
    insightUse: '국제 원가 방향과 한국 통관단가가 같은 방향인지 확인',
    priority: 1,
  },
  {
    source: 'KCS',
    endpoint: 'agri_pipeline processed CSV',
    status: '연결됨',
    cadence: '월간 통관 데이터',
    fields: ['수입액', '수입중량', '수입단가', '상위 원산지'],
    insightUse: '한국 바이어가 실제로 어느 원산지에 얼마나 노출되어 있는지 판정',
    priority: 1,
  },
  {
    source: 'UN Comtrade',
    endpoint: 'agri_pipeline processed CSV',
    status: '연결됨',
    cadence: '연간 교역 데이터',
    fields: ['HS 코드', '세계 파트너 행', '장기 교역 커버리지'],
    insightUse: '대체 원산지와 글로벌 공급망 폭을 검토하는 장기 근거',
    priority: 1,
  },
  {
    source: 'WITS',
    endpoint: '/api/wits',
    status: '내부 API 연결 가능',
    cadence: '요청 시 조회',
    fields: ['MFN', '협정세율', '무역지표'],
    insightUse: '원산지 전환 전 관세 차이를 비교해 실제 landed cost 리스크로 전환',
    priority: 2,
  },
  {
    source: 'Tariffs',
    endpoint: '/api/tariffs',
    status: '내부 API 연결 가능',
    cadence: '요청 시 조회',
    fields: ['관세율', '원산지 조건', 'HS 기반 비용'],
    insightUse: '고객별 견적서에 관세 민감도를 붙이는 가격 방어 근거',
    priority: 2,
  },
  {
    source: 'ECOS·환율',
    endpoint: '/api/exchange',
    status: '내부 API 연결 가능',
    cadence: '시장 데이터 조회',
    fields: ['KRW/USD', '환율 변화', '원화 원가'],
    insightUse: '국제 가격은 내려도 원화 매입가는 올라가는 구간을 분리',
    priority: 2,
  },
  {
    source: 'Trade Macro',
    endpoint: '/api/trade-macro',
    status: '내부 API 연결 가능',
    cadence: '요청 시 조회',
    fields: ['달러', '유가', '거시 리스크'],
    insightUse: '원자재 가격 변동과 운임·환율 변수를 같은 메모에 결합',
    priority: 2,
  },
  {
    source: 'KAMIS',
    endpoint: '품목별 KAMIS route 확장 후보',
    status: '확장 후보',
    cadence: '국내 도소매 가격',
    fields: ['국내 도매가', '소매가', '가격 전가율'],
    insightUse: '수입단가 상승이 국내 판매가로 얼마나 전가됐는지 계산',
    priority: 3,
  },
  {
    source: 'USDA FAS',
    endpoint: '품목별 USDA FAS route 확장 후보',
    status: '확장 후보',
    cadence: '수급 보고서',
    fields: ['생산량', '재고', '수출 전망'],
    insightUse: 'BNI 정성 전망을 공식 수급표로 검산',
    priority: 3,
  },
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header = [], ...body] = rows;
  const keys = header.map((value) => value.replace(/^\uFEFF/, '').trim());

  return body
    .filter((cells) => cells.some((cell) => cell.trim() !== ''))
    .map((cells) => Object.fromEntries(keys.map((key, index) => [key, cells[index] ?? ''])));
}

async function readCsv(relativePath) {
  const text = await readFile(path.join(AGRI_ROOT, relativePath), 'utf8');
  return parseCsv(text);
}

function toNumber(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatMonth(date) {
  return date ? date.slice(0, 7) : '';
}

function latestPrice(rows) {
  const clean = rows
    .map((row) => ({
      seriesId: row.series_id,
      date: row.date,
      value: toNumber(row.value),
    }))
    .filter((row) => row.date && row.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const latest = clean.at(-1);
  const sameSeries = clean.filter((row) => row.seriesId === latest?.seriesId);
  const previous = sameSeries.at(-2);
  const first = sameSeries[0];

  return {
    seriesId: latest?.seriesId ?? '',
    latestDate: latest?.date ?? '',
    latestValue: latest ? round(latest.value, 2) : null,
    previousValue: previous ? round(previous.value, 2) : null,
    monthChangePct: latest && previous ? round(((latest.value - previous.value) / previous.value) * 100, 1) : null,
    sinceFirstPct: latest && first ? round(((latest.value - first.value) / first.value) * 100, 1) : null,
    observations: clean.length,
  };
}

function customsSummary(rows) {
  const latestPeriod = rows.reduce((max, row) => (row.period > max ? row.period : max), '');
  const latestRows = rows.filter((row) => row.period === latestPeriod);
  const byCountry = new Map();

  for (const row of latestRows) {
    const country = row.statCdCntnKor1 || row.statCd || '미확인';
    const current = byCountry.get(country) ?? { country, importUsd: 0, importKg: 0 };
    current.importUsd += toNumber(row.impDlr);
    current.importKg += toNumber(row.impWgt);
    byCountry.set(country, current);
  }

  const countries = Array.from(byCountry.values()).sort((a, b) => b.importUsd - a.importUsd);
  const importUsd = latestRows.reduce((sum, row) => sum + toNumber(row.impDlr), 0);
  const importKg = latestRows.reduce((sum, row) => sum + toNumber(row.impWgt), 0);

  return {
    latestPeriod,
    latestMonth: latestPeriod ? `${latestPeriod.slice(0, 4)}-${latestPeriod.slice(4, 6)}` : '',
    rows: rows.length,
    latestRows: latestRows.length,
    importUsd: Math.round(importUsd),
    importTon: round(importKg / 1000, 1),
    unitUsdPerTon: importKg > 0 ? round(importUsd / (importKg / 1000), 1) : null,
    topCountry: countries[0]?.country ?? '미확인',
    topCountrySharePct: importUsd > 0 && countries[0] ? round((countries[0].importUsd / importUsd) * 100, 1) : null,
  };
}

function comtradeSummary(rows) {
  const latestYear = rows.reduce((max, row) => (row.refYear > max ? row.refYear : max), '');
  const latestRows = rows.filter((row) => row.refYear === latestYear);
  const worldRows = latestRows.filter((row) => row.partnerISO === 'W00');

  return {
    latestYear,
    rows: rows.length,
    latestRows: latestRows.length,
    worldPartnerRows: worldRows.length,
    hsCodes: Array.from(new Set(rows.map((row) => row.cmdCode).filter(Boolean))).sort(),
  };
}

function formatSignedPct(value) {
  if (value === null || value === undefined) return '변화율 확인 필요';
  return `${value > 0 ? '+' : ''}${round(value, 1)}%`;
}

function hasFinalConsonant(value) {
  const last = value.charCodeAt(value.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}

function subjectParticle(value) {
  return hasFinalConsonant(value) ? '은' : '는';
}

function connectionNames(...names) {
  return API_CONNECTIONS
    .filter((connection) => names.includes(connection.source))
    .map((connection) => connection.source);
}

function buildInsightProposals(commodities) {
  const proposals = [];
  const add = (proposal) => proposals.push({
    id: `bni-insight-${String(proposals.length + 1).padStart(2, '0')}`,
    ...proposal,
  });

  for (const commodity of commodities) {
    const concentration = commodity.customs.topCountrySharePct ?? 0;
    const priceChange = commodity.price.monthChangePct;
    const topCountry = commodity.customs.topCountry || '주요 원산지';
    const hsLabel = commodity.hsCodes.join(', ');

    add({
      lane: '원산지',
      priority: concentration >= 70 ? '상' : concentration >= 45 ? '중' : '관찰',
      title: `${commodity.name} ${topCountry} 노출 ${round(concentration, 1)}% 점검`,
      commodity: commodity.name,
      horizon: '이번 주 거래처 메모',
      trigger: `KCS ${commodity.customs.latestMonth} 기준 ${topCountry} 수입 비중 ${round(concentration, 1)}%`,
      thesis: concentration >= 70
        ? `${commodity.name}${subjectParticle(commodity.name)} 단일 원산지 가격·물류 차질이 바로 고객 매입가로 번질 수 있습니다.`
        : `${commodity.name}${subjectParticle(commodity.name)} 원산지 집중도가 중간 수준이라 대체 견적을 붙이면 협상력이 생깁니다.`,
      apiStack: connectionNames('KCS', 'UN Comtrade', 'WITS'),
      action: `HS ${hsLabel} 기준으로 ${topCountry} 외 2개 원산지의 통관단가와 관세율을 함께 비교합니다.`,
      customerQuestion: `“${topCountry} 외 대체 원산지 견적을 지금 받아둘까요?”`,
      confidence: `${commodity.comtrade.worldPartnerRows.toLocaleString('ko-KR')}개 글로벌 파트너 행`,
    });

    add({
      lane: '가격',
      priority: priceChange !== null && Math.abs(priceChange) >= 5 ? '상' : '중',
      title: `${commodity.name} 국제가 ${formatSignedPct(priceChange)} 신호를 국내 단가와 대조`,
      commodity: commodity.name,
      horizon: '다음 발주 전',
      trigger: `FRED ${commodity.price.latestDate} ${commodity.price.latestValue ?? '-'} ${commodity.price.unit}`,
      thesis: priceChange !== null && priceChange > 0
        ? `국제 가격이 상승 전환했습니다. 국내 통관단가가 아직 덜 움직였다면 선제 매입 논리를 만들 수 있습니다.`
        : `국제 가격이 안정권이면 기존 견적의 프리미엄을 조정할 여지가 있습니다.`,
      apiStack: connectionNames('FRED', 'KCS', 'ECOS·환율'),
      action: `FRED 가격, KCS 단가 ${commodity.customs.unitUsdPerTon ?? '-'} USD/t, KRW/USD를 한 줄로 묶어 원화 원가 변화를 계산합니다.`,
      customerQuestion: '“국제가는 움직였는데 국내 견적은 얼마나 늦게 따라오고 있습니까?”',
      confidence: `${commodity.price.observations}개 가격 관측치`,
    });
  }

  const sugar = commodities.find((commodity) => commodity.key === 'sugar');
  const wheat = commodities.find((commodity) => commodity.key === 'wheat');
  const corn = commodities.find((commodity) => commodity.key === 'corn');
  const soybean = commodities.find((commodity) => commodity.key === 'soybean');
  const palmOil = commodities.find((commodity) => commodity.key === 'palm_oil');

  if (sugar) {
    add({
      lane: '마진',
      priority: '상',
      title: '설탕 가격 반등을 고객 가격표 방어 논리로 전환',
      commodity: '설탕',
      horizon: '월간 가격표 개정',
      trigger: `FRED ${formatSignedPct(sugar.price.monthChangePct)}, KCS ${sugar.customs.topCountry} ${round(sugar.customs.topCountrySharePct ?? 0, 1)}%`,
      thesis: '설탕은 BNI 점수와 가격 반등이 모두 강합니다. 단순 “가격 상승”보다 원산지·환율·국내 전가율을 묶어 설명해야 합니다.',
      apiStack: connectionNames('FRED', 'KCS', 'KAMIS', 'ECOS·환율'),
      action: '정백당·원당 HS를 분리하고 국내 도매가 전가율을 붙여 고객별 인상 허용폭을 제안합니다.',
      customerQuestion: '“설탕 단가 인상분 중 원재료 요인은 몇 %이고 환율 요인은 몇 %입니까?”',
      confidence: `${sugar.customs.latestRows}개 최신 통관 행`,
    });
  }

  if (wheat) {
    add({
      lane: '계약',
      priority: '상',
      title: '소맥은 원산지 전환 견적을 먼저 붙이는 상품',
      commodity: '소맥',
      horizon: '신규 계약 검토',
      trigger: `FRED 월간 ${formatSignedPct(wheat.price.monthChangePct)}, 상위 원산지 ${wheat.customs.topCountry}`,
      thesis: '소맥 국제 가격 상승이 뚜렷합니다. 미국 공급 프리미엄과 비미국산 작황 완화를 분리해 견적 시나리오를 만들어야 합니다.',
      apiStack: connectionNames('FRED', 'KCS', 'UN Comtrade', 'WITS'),
      action: '미국·우루과이·호주·캐나다의 통관단가와 MFN/협정세율을 한 화면에서 비교합니다.',
      customerQuestion: '“기존 원산지를 유지할 때와 전환할 때의 총 원가는 얼마나 벌어집니까?”',
      confidence: `${wheat.comtrade.hsCodes.length}개 HS 코드`,
    });
  }

  if (corn && soybean) {
    add({
      lane: '날씨',
      priority: '상',
      title: '미국 가뭄 뉴스는 옥수수·대두 동시 알림으로 묶기',
      commodity: '옥수수·대두',
      horizon: 'USDA 발표 전후',
      trigger: `옥수수 점수 ${corn.signalScore}, 대두 점수 ${soybean.signalScore}`,
      thesis: 'BNI가 반복해서 언급한 미국 가뭄은 단일 품목 뉴스가 아니라 사료·유지류 원가를 동시에 흔드는 공통 변수입니다.',
      apiStack: connectionNames('BNI Global PDF', 'FRED', 'USDA FAS'),
      action: 'USDA 수급표가 갱신되면 옥수수·대두 재고 변화와 FRED 가격 반응을 같은 알림으로 묶습니다.',
      customerQuestion: '“USDA 발표 후 사료·유지 원가를 동시에 잠가야 합니까?”',
      confidence: 'BNI 리스크 레이더 공통 변수',
    });
  }

  if (soybean && palmOil) {
    add({
      lane: '대체재',
      priority: '중',
      title: '대두유·팜유·동물성 유지 대체 스프레드 큐 만들기',
      commodity: '유지류',
      horizon: '주간 브리핑',
      trigger: `팜유 장기 변화 ${formatSignedPct(palmOil.price.sinceFirstPct)}, 대두 상위 원산지 ${soybean.customs.topCountry}`,
      thesis: '바이오연료와 UCO 수입이 유지류 가격을 품목별로 다르게 밀고 있습니다. 단일 유지 가격보다 대체 스프레드가 고객 의사결정에 더 직접적입니다.',
      apiStack: connectionNames('BNI Global PDF', 'FRED', 'KCS', 'USDA FAS'),
      action: '대두유·팜유·동물성 유지·UCO를 “식품용/연료용 경쟁”으로 나눠 매입 우선순위를 제안합니다.',
      customerQuestion: '“이번 달에는 어떤 유지류를 먼저 커버하고 어떤 것은 기다려도 됩니까?”',
      confidence: 'BNI 보조 시장 2개 직접 추출',
    });
  }

  add({
    lane: '자동화',
    priority: '중',
    title: '거래처별 한 장 브리핑 자동 생성',
    commodity: '전체',
    horizon: '정기 발송',
    trigger: 'BNI PDF 9건, 구조화 상품 5개, 보조 시장 2개',
    thesis: '거래처가 원하는 것은 긴 보고서가 아니라 “내 원가와 계약에 무슨 의미인가”입니다.',
    apiStack: connectionNames('BNI Global PDF', 'KCS', 'FRED', 'ECOS·환율'),
    action: '거래처 품목 포트폴리오를 입력하면 가격·수입단가·원산지 노출·권장 문안을 1페이지로 출력합니다.',
    customerQuestion: '“이번 주 우리 회사가 바로 조치할 품목은 무엇입니까?”',
    confidence: '정기 PDF와 처리 CSV 결합 완료',
  });

  return proposals;
}

function dateFromReportName(fileName) {
  const match = fileName.match(/(\d{6})/);
  if (!match) return '';
  const value = match[1];
  return `20${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
}

function pdfPages(filePath) {
  try {
    const output = execFileSync('pdfinfo', [filePath], { encoding: 'utf8' });
    const match = output.match(/^Pages:\s+(\d+)/m);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

async function buildReports() {
  const files = (await readdir(REPORT_DIR))
    .filter((file) => file.toLowerCase().endsWith('.pdf'))
    .sort((a, b) => dateFromReportName(a).localeCompare(dateFromReportName(b)));

  return files.map((file) => ({
    date: dateFromReportName(file),
    file,
    pages: pdfPages(path.join(REPORT_DIR, file)),
    sourcePath: path.join(REPORT_DIR, file),
  }));
}

async function buildCommodity(key, config) {
  const [fredRows, customsRows, comtradeRows] = await Promise.all([
    readCsv(config.fredPath),
    readCsv(config.customsPath),
    readCsv(config.comtradePath),
  ]);

  return {
    key,
    name: config.name,
    englishName: config.englishName,
    hsCodes: config.hsCodes,
    stance: config.stance,
    riskLevel: config.riskLevel,
    signalScore: config.signalScore,
    bniReview: config.bniReview,
    bniOutlook: config.bniOutlook,
    customerMessage: config.customerMessage,
    price: {
      ...latestPrice(fredRows),
      unit: config.priceUnit,
    },
    customs: customsSummary(customsRows),
    comtrade: comtradeSummary(comtradeRows),
  };
}

async function main() {
  const reports = await buildReports();
  const commodities = await Promise.all(
    Object.entries(DATASETS).map(([key, config]) => buildCommodity(key, config)),
  );
  const latestReport = reports.at(-1);
  const earliestReport = reports[0];

  const dashboard = {
    meta: {
      title: 'BNI Global Market Intelligence',
      audience: '거래처 제공용 정기 시장 정보',
      status: 'STATIC',
      syncDate: latestReport?.date ?? '2026-07-06',
      source: 'BNI Global 정기 PDF, FRED, KCS, UN Comtrade processed CSV',
      method: 'BNI 보고서 수동 큐레이션과 agri_pipeline 처리 CSV를 결합한 고객 브리핑 대시보드',
      reportDir: REPORT_DIR,
      agriPipelineRoot: AGRI_ROOT,
      generatedAt: latestReport ? `${latestReport.date}T00:00:00+09:00` : new Date().toISOString(),
      version: 'bni-global-v1',
    },
    latestReport: {
      ...latestReport,
      headline: '미국 가뭄, USDA 재고 조정, 바이오연료 원료 대체가 7월 초 핵심 변수입니다.',
    },
    coverage: {
      reportCount: reports.length,
      dateRange: earliestReport && latestReport ? `${earliestReport.date}~${latestReport.date}` : '',
      commodityCount: commodities.length + SUPPLEMENTARY_MARKETS.length,
      structuredCommodityCount: commodities.length,
    },
    thesis: {
      headline: '하반기 바닥 다지기 전, 원산지·정책·날씨 이벤트를 나눠서 봐야 합니다.',
      body: 'BNI 최신 보고서는 여름철 비수기 과잉 물량이 단기 가격을 누르지만, 미국 가뭄과 관세·바이오연료 정책 변화가 설탕·곡물·유지류의 반등 트리거가 될 수 있다고 봅니다.',
      posture: '방어 재고와 이벤트 확인형 분할 매입',
    },
    summaryKpis: [
      { label: '정기 보고서', value: `${reports.length}건`, note: earliestReport && latestReport ? `${earliestReport.date}부터 ${latestReport.date}까지` : '' },
      { label: '최신 브리핑', value: formatMonth(latestReport?.date ?? ''), note: latestReport?.file ?? '' },
      { label: '구조화 상품', value: `${commodities.length}개`, note: 'FRED·KCS·Comtrade와 연결' },
      { label: 'BNI 보조 시장', value: `${SUPPLEMENTARY_MARKETS.length}개`, note: '대두유·동물성 유지 직접 추출' },
    ],
    commodities,
    supplementaryMarkets: SUPPLEMENTARY_MARKETS,
    riskRadar: RISK_RADAR,
    apiCoverage: API_COVERAGE,
    apiConnections: API_CONNECTIONS,
    insightProposals: buildInsightProposals(commodities),
    reportArchive: reports,
    nextBuild: [
      '대두유와 동물성 유지는 별도 원료 코드/UCO 데이터셋을 추가해 BNI 직접 추출 의존도를 낮춥니다.',
      'WITS·WTO·Tariffs API를 붙여 거래처별 관세·비관세 장벽 코멘트를 자동화합니다.',
      'ECOS 환율과 KAMIS 국내 가격을 결합해 수입 원가에서 국내 판매가까지 전가율을 계산합니다.',
    ],
  };

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(dashboard, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_FILE)} with ${commodities.length} structured commodities.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
