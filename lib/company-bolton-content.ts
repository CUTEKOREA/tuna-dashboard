/**
 * 「시장 이해 > 기업 해부 > Bolton」 서술.
 *
 * 조사보고서 9개 절을 6단계로 줄였다 — **개요 → 지배구조 → 사업구조 → Tri Marine
 * → 조달 실적 → 한국**. 이 회사의 축은 「참치를 얼마나 다루는가」가 아니라
 * **「참치가 그룹의 얼마인가」**다. 3분의 2가 참치를 포함한 Food이고 나머지 3분의 1은
 * 접착제·세제·화장품이다.
 *
 * ⚠ 낫표(「」)는 그 단계에 실린 차트 제목을 가리킬 때만 쓴다. 인용은 큰따옴표.
 * ⚠ 참치 단독 매출은 공개되지 않는다. **없는 것을 없다고 쓰고 추정하지 않는다.**
 */
import type {
  BriefingPoint,
  StageNarrative,
} from '@/components/market-understanding/CommodityIndustryDashboard';

const S01: StageNarrative = {
  key: 'c01',
  numeral: '01',
  title: '개요: 참치 옆에 접착제와 세제가 있다',
  question: '캔참치 회사인가, 소비재 그룹인가',
  lede: 'Rio Mare·Isabel·Saupiquet를 가진 유럽 캔참치의 대표 브랜드군인데, 같은 그룹 안에 UHU 접착제와 WC Net 세제와 Borotalco가 있다. 2025년 순매출 3,541 M€ 중 Food가 67.3%이고, 참치는 그 안에 있다.',
  paragraphs: [
    '앞의 다섯 회사는 참치의 위치가 달랐다. 프린사는 사고 알바코라는 잡았다. FCF는 댔고 타이유니온은 브랜드를 사 모았다. 이토추는 참치가 부(部)의 절반이었다. **볼튼은 Food가 그룹의 3분의 2**다 - 참치가 그 몸통이되 같은 칸에 육류캔·소스가 함께 들어 있고, **참치 단독 매출은 공개되지 않는다**.',
    '그 나머지 3분의 1이 이 회사를 읽는 열쇠다. **접착제·홈케어·퍼스널케어·뷰티가 1,159 M€, 32.7%**를 차지한다. 원어값이 튀는 해에도 그룹 손익이 덜 흔들리는 이유이고, 참치 사업을 원가 사이클과 따로 놓고 볼 수 없는 이유이기도 하다.',
    '통합 방향도 반대다. **하류에서 상류로 올라갔다.** 1999년 Saupiquet를 사면서 선단과 공장이 함께 넘어왔고, 2013년과 2019년 두 번에 걸쳐 Tri Marine을 가져왔다. 브랜드가 원료를 사러 올라간 형태다.',
  ],
  facts: [
    { label: '2025년 순매출', value: '3,541 M€', asOf: 'FY2025', source: 'Sustainability Report 2025 (자기신고 · 카테고리 합)', grade: 'B', note: '2024년 3,528 M€ 대비 +0.4% · 연결재무제표는 미공표' },
    { label: 'Food 비중', value: '67.3%', asOf: 'FY2025', source: '회사 Sustainability Report (자기신고)', grade: 'B', note: '캔참치·수산캔·육류캔·소스 합계 - 참치 단독은 미공개' },
    { label: '참치 사이클 밖', value: '32.7%', asOf: 'FY2025', source: '동상 (자기신고에서 산출)', grade: 'B', note: '접착제·홈케어·퍼스널케어·뷰티' },
    { label: '탄소발자국 중 Tri Marine', value: '72.9%', asOf: 'FY2025', source: 'Sustainability Report 2025 p.56', grade: 'A', note: '매출로는 Food 한 칸에 묻히는 사업이 배출로는 그룹을 대표한다' },
    { label: '브랜드 수', value: '63개', asOf: 'FY2025', source: '동상 (카테고리별 합산)', grade: 'B', note: '회사 표기는 「over 60」' },
    { label: '상장', value: '비상장 가족기업', asOf: '2026-08', source: '이탈리아 등기', grade: 'A', note: '연결재무제표를 공표하지 않는다' },
  ],
  terms: [
    { term: '순매출', description: '회사가 카테고리별로 공개하는 유일한 재무 수치. 참치 단독 금액은 이 아래로 내려가지 않는다.' },
  ],
};

const S02: StageNarrative = {
  key: 'c02',
  numeral: '02',
  title: '지배구조: 지주 위에 지주가 있다',
  question: '비상장 가족기업의 공시 경계는 어디인가',
  lede: '산업지주 Bolton Group S.r.l. 위에 가족지주 Factor Holding S.r.l.이 100% 사원으로 서 있다. 두 법인이 같은 밀라노 주소를 쓴다.',
  paragraphs: [
    '층은 셋이다. 최상위에 **Factor Holding S.r.l.**(2010-11-29 설립), 그 아래 산업지주 **Bolton Group S.r.l.**, 다시 그 아래 Bolton Food S.p.A.를 비롯한 사업회사들이다. 산업지주의 1인 사원(socio unico)이 가족지주이므로 지분 구조에 외부가 없다.',
    '회장은 **Marina Nissim** - 창업자 Joseph Nissim의 딸이다. 그룹 CEO는 2024년 1월 취임한 **Roberto Leopardi**다. 2016~17년 재편에서 갈린 것은 **Bolton Group Services**와 구 Bolton Group(→Factor Holding)이다. Bolton Alimentari S.p.A.는 **Bolton Food S.p.A.의 이전 상호**이고, 개칭 시점은 확인되지 않았다.',
    '비상장이라 **연결재무제표가 공표되지 않는다.** 이 페이지의 매출은 회사 발표문에서, 손익은 등기 기탁분을 인용한 언론에서 온다 - 등급이 갈리는 이유이고, 2023년 이후 EBITDA·EBIT가 「미확인」으로 남는 이유다.',
  ],
  facts: [
    { label: '산업지주', value: 'CF 05983890152', asOf: '2026-08', source: '이탈리아 등기 · REA MI 1055773', grade: 'A', note: 'Bolton Group S.r.l.' },
    { label: '최상위 가족지주', value: 'CF 07224860960', asOf: '2010-11-29 설립', source: '동상', grade: 'A', note: 'Factor Holding S.r.l. - 산업지주 지분 100%' },
    { label: '이탈리아 식품', value: 'CF 00197980139', asOf: '1951년', source: '동상', grade: 'A', note: 'Bolton Food S.p.A. · Cermenate (CO)' },
    { label: '자본금', value: '€20,000,000', asOf: '2026-08', source: '등기 파생 상용 DB', grade: 'B', note: '전액납입 · 등기 직원 149명' },
    { label: '회장 · CEO', value: 'Marina Nissim · Roberto Leopardi', asOf: '2024-01-10 취임', source: '회사 발표', grade: 'B', note: '창업자 Joseph Nissim의 딸' },
  ],
  terms: [
    { term: 'socio unico', description: '이탈리아 유한회사의 1인 사원. 지분 100%를 한 주체가 갖는 구조로, 등기부에 그 사실이 표시된다.' },
  ],
};

const S03: StageNarrative = {
  key: 'c03',
  numeral: '03',
  title: '사업구조: 참치 사이클 밖의 3분의 1',
  question: '접착제와 세제가 왜 같은 그룹에 있나',
  lede: '5개 카테고리 63개 브랜드. Food 2,382 M€ 옆에 홈케어 378, 접착제 355, 퍼스널케어 291, 뷰티 135가 나란히 선다.',
  paragraphs: [
    '카테고리 구성은 인수 이력 그대로다. 1983년 Manetti & Roberts로 퍼스널케어(Borotalco·Neutro Roberts), 1989년 UHU로 접착제, 1993년 Collistar로 뷰티에 들어갔다. **2025년 1월 네덜란드 Repair Care 인수로 북미 리전을 새로 세웠다.**',
    '지역 구성이 지난 6년 사이 크게 움직였다. **이탈리아가 39.5%(2019)에서 28.6%(2025)로 내려왔고** 그 자리를 기타 유럽(18.5%)과 남미(13.9%)가 채웠다. 남미는 2019년 집계에 항목조차 없던 곳이다.',
    '이탈리아 캔참치 매대에서는 Rio Mare가 Nauterra(구 Grupo Calvo)의 Nostromo와 직접 맞선다. 다만 **볼튼은 Nauterra 지분 40%를 들고 있다** - 경쟁사이면서 피출자사다. Nauterra의 2024년 매출은 €727백만이다.',
  ],
  facts: [
    { label: 'Food', value: '2,382 M€ · 67.3%', asOf: 'FY2025', source: 'Sustainability Report 2025', grade: 'A', note: '브랜드 16개' },
    { label: 'Home Care', value: '378 M€ · 10.7%', asOf: 'FY2025', source: '동상', grade: 'A', note: 'WC Net · Smac · Winni\'s 외 22개' },
    { label: 'Adhesives', value: '355 M€ · 10.0%', asOf: 'FY2025', source: '동상', grade: 'A', note: 'UHU · Bison · Bostik 외 8개' },
    { label: '이탈리아 비중', value: '39.5% → 28.6%', asOf: '2019 → 2025', source: '동상', grade: 'A', note: '남미가 13.9%까지 올라왔다' },
    { label: 'Nauterra 지분', value: '40%', asOf: '2026-08', source: '조사보고서 10절', grade: 'B', note: '경쟁사이면서 피출자사' },
  ],
  terms: [
    { term: 'Nauterra', description: '구 Grupo Calvo. Nostromo 브랜드로 이탈리아 매대에서 Rio Mare와 맞서면서, 동시에 볼튼이 40% 지분을 가진 회사다.' },
  ],
};

const S04: StageNarrative = {
  key: 'c04',
  numeral: '04',
  title: 'Tri Marine: 30년 전에 시작된 인수',
  question: '브랜드 회사가 왜 트레이더를 샀나',
  lede: '2013년과 2019년 두 단계로 나눠 가져왔다. 1단계는 EU 기업결합 무이의 결정을 받았고, 2단계는 공개된 신고 기록이 없다.',
  paragraphs: [
    '1단계는 2013년 12월이다. Umbrella Agreement와 SPA 3건을 묶어 신고했고 EU가 **Art. 6(1)(b) 무이의**로 승인했다. 대상은 Tri-Marine Holdings Coöperatief U.A.(네덜란드)와 미국 지주들이었고, Renato Curto가 직·간접 다수지분을 유지했다.',
    '2단계는 2019년 7월이다. 트레이딩 사업과 NFD 선단, 콜롬비아·에콰도르·솔로몬제도 가공공장이 넘어왔다. 회사 보도자료는 **참치 공급망 100%**라 적고 **미국 국적 선망선 11척과 소형 부어류 사업은 Curto 측에 남겼다**(carve-out) - 그래서 「잔여 51%로 완전자회사」라는 요약은 정확하지 않다. 이 2단계에는 공개된 EU 기업결합 사건 번호가 없다 - 신고 기준에 걸리지 않았거나 비공시다(1단계 M.7010 과 구분해야 한다).',
    '2013년 결정문이 남긴 숫자가 이 인수의 의미를 말한다. 세계 라운드 참치 트레이딩에서 **Tri Marine과 FCF가 각각 20~30%**, 이토추가 5~10%, 볼튼 자신은 0~5%였다. 브랜드 회사가 자기 원료 조달의 상류를 통째로 사 온 것이다.',
  ],
  facts: [
    { label: '1단계', value: '2013-12-09 무이의', asOf: '2013', source: 'EU 기업결합 결정문', grade: 'A', note: 'Art. 6(1)(b) · 2013-11-04 신고' },
    { label: '2단계', value: '2019-07 · 참치 공급망 100%', asOf: '2019', source: 'Tri Marine 보도자료 2019-07-06', grade: 'B', note: '미국기국 선대·소형 부어류는 carve-out · 2019년분 EU 사건번호는 공개 검색으로 미확인' },
    { label: '2012년 트레이딩 점유', value: 'Tri Marine 20~30%', asOf: '2012', source: 'EU 결정문', grade: 'A', note: 'FCF 20~30% · 이토추 5~10% · 볼튼 0~5%' },
    { label: '연간 참치 거래량', value: '50만 t 초과', asOf: '연도 표기 없음', source: 'bolton.com 상시 문구', grade: 'C', note: '집계 기준이 조달량과 같은지는 공개되지 않는다' },
    { label: '브랜드 원료 직접 조달', value: '90% 초과', asOf: 'SR2022', source: '회사 발표', grade: 'B', note: 'Rio Mare · Isabel · Saupiquet · Cuca · Palmera' },
  ],
  terms: [
    { term: 'Art. 6(1)(b)', description: 'EU 기업결합규칙의 1단계 무조건 승인. 심층 심사(2단계)로 넘기지 않고 종결한다는 뜻이다.' },
  ],
};

const S05: StageNarrative = {
  key: 'c05',
  numeral: '05',
  title: '조달 실적: 74만 톤 안에 장부 정리가 섞여 있다',
  question: '조달량이 늘었다는 것은 무슨 뜻인가',
  lede: '2025년 740,310 t. 2023년 562,270 t에서 두 해 만에 32% 늘었다. 다만 이 숫자는 브랜드가 쓴 양이 아니다.',
  paragraphs: [
    '증가분의 성격을 회사 스스로 밝힌다. 2024년 +26% 가운데 **Tri Marine 트레이딩 증가가 +144,000 t**이다. 조달량은 Bolton Food 원료와 Tri Marine이 사고판 물량의 합이므로, 늘었다고 브랜드가 그만큼 더 팔았다는 뜻이 아니다.',
    '어종 구성이 2025년에 크게 갈렸다. **가다랑어가 79%에서 62%로 내려앉고 황다랑어가 16%에서 29%로 1.8배**가 됐다(물량으로는 112,940 → 215,556 t, 1.9배). 눈다랑어는 +138%, 손낚시 어법은 +133%다. 어법 자체는 여전히 **선망이 압도적**이다 - 회사 조달표로는 679,800 t(91.8%)이고 WWF 공동보고서는 대형선망 93%로 적어 집계 기준이 조금 다르다.',
    '자원 등급은 회사 KPI 기준 **건강한 자원 98.5%**(2024년 99%)다 - ISSF 색상등급과 같은 잣대라고 적힌 출처는 없으니 그대로 옮기면 안 된다. 인증 구간에서는 MSC full assessment가 6,172 t에서 16,452 t으로, CCFIP가 484 t에서 17,565 t으로 늘었고 FIP는 71,011 t에서 1,536 t으로 줄었다 - 개선프로그램에서 정식 인증 쪽으로 옮겨간 모양새다.',
  ],
  facts: [
    { label: '2025년 조달량', value: '740,310 t', asOf: 'FY2025', source: 'Sustainability Report 2025', grade: 'A', note: '2024년 708,328 t 대비 +5%' },
    { label: '가다랑어', value: '462,406 t · 62%', asOf: 'FY2025', source: '동상', grade: 'A', note: '2024년 79%에서 내려왔다 (−17%)' },
    { label: '황다랑어', value: '215,556 t · 29%', asOf: 'FY2025', source: '동상', grade: 'A', note: '전년비 +91%' },
    { label: '선망 비중', value: '91.8% (679,800 t)', asOf: 'FY2025', source: '회사 조달표 (자기신고)', grade: 'B', note: 'WWF 공동보고서는 대형선망 93%로 집계' },
    { label: '건강한 자원 비중', value: '98.5%', asOf: 'FY2025', source: '회사 지속가능 KPI (자기신고)', grade: 'B', note: '2024년 99% · ISSF 색상등급과 동일 잣대인지는 미확인' },
  ],
  terms: [
    { term: 'CCFIP', description: 'Comprehensive FIP. 개선 계획이 전 항목을 덮는 어업개선프로젝트로, 부분 FIP보다 요건이 무겁다.' },
  ],
};

const S06: StageNarrative = {
  key: 'c06',
  numeral: '06',
  title: '한국 관점: 명단에 오른 한국 배 14척',
  question: '신라교역 선망선이 왜 이 회사 명단에 있나',
  lede: '볼튼이 공개하는 조달 선박명단 399척(2024) 가운데 한국 국적선이 14척이다. 총 척수는 4년 사이 580척에서 399척으로 줄었는데 한국 비중은 2.1%에서 3.5%로 올랐다.',
  paragraphs: [
    '2021년 명단에는 **신라교역 선망선 6척이 전원** 올라 있었다. 2023년에 SHILLA 계열이 0척으로 빠졌다가 **2024년에 두 척이 돌아왔다.** 명단은 조달 선단이지 소유 관계가 아니므로, 오르내림은 그 해 원어가 어느 경로로 갔는지를 말한다.',
    '동원산업은 볼튼의 조달 어업 목록에 실명으로 있다. 중서부태평양 MSC 어업 2건과 인도양 CC FIP 1건이다. 다만 **어업 단위까지만 특정되고 배별 중개 트레이더나 Tri Marine 경유 여부는 공개되지 않는다** - 볼튼이 거래처명을 공시하지 않기 때문이다.',
    '무역통계는 층위를 나눠 봐야 한다. 2024년 **한국 → 스페인 냉동 황다랑어가 3,743 t · US$9.02백만**(약 US$2.41/kg)이다. 캔 원료급 원어가 가는 쪽이고, 스페인에는 볼튼의 O Grove·Cabo de Cruz 공장이 있다. 다만 이 물량이 볼튼으로 갔다는 직접 증거는 없다.',
  ],
  facts: [
    { label: '명단 속 한국 국적선', value: '14척 · 3.5%', asOf: '2024년 명단', source: 'Bolton 공개 선박명단', grade: 'A', note: '399척 중 · SHILLA 두 척 복귀' },
    { label: '신라교역 선망선', value: '6척 → 0척 → 2척', asOf: '2021 → 2023 → 2024', source: '동상', grade: 'A', note: '2021년에는 전원 등재였다' },
    { label: '동원산업 어업', value: 'MSC 2건 + CC FIP 1건', asOf: '2026-08', source: 'Bolton 조달 어업 목록', grade: 'A', note: '중서부태평양 · 인도양' },
    { label: '한국 → 스페인 냉동 황다랑어', value: '3,743 t · US$9.02백만', asOf: '2024', source: 'UN Comtrade HS 030342', grade: 'A', note: '약 US$2.41/kg - 캔 원료급' },
    { label: '한국 기업 공시 속 Bolton', value: '0건', asOf: '2026-08', source: 'DART 전수', grade: 'A', note: '볼튼도 거래처명을 공시하지 않는다' },
  ],
  terms: [
    { term: '공개 선박명단', description: '볼튼이 자기 원료가 어느 배에서 왔는지 공개하는 목록. 소유가 아니라 조달 관계이며, 해마다 구성이 바뀐다.' },
  ],
};

export const BOLTON_NARRATIVES: StageNarrative[] = [S01, S02, S03, S04, S05, S06];

export const BOLTON_BRIEFING: BriefingPoint[] = [
  { stage: 'c01', headline: '참치 사이클 밖이 3분의 1이다', text: '접착제·세제·화장품이 1,159 M€, 32.7%다. 원어값이 튀는 해에도 그룹 손익이 덜 흔들린다.' },
  { stage: 'c04', headline: '브랜드가 상류로 올라갔다', text: '2013·2019년 두 단계로 Tri Marine을 가져왔다. 2012년 기준 세계 라운드 트레이딩 20~30%를 쥔 회사였다.' },
  { stage: 'c05', headline: '74만 톤에 트레이딩이 섞여 있다', text: '2024년 +26% 가운데 Tri Marine 트레이딩 증가가 +144,000 t이다. 브랜드가 쓴 양이 아니다.' },
  { stage: 'c05', headline: '가다랑어가 내려앉았다', text: '79%에서 62%로. 그 자리를 황다랑어가 16%→29%로 채웠고 눈다랑어는 +138%다.' },
  { stage: 'c06', headline: '한국 배가 14척 올라 있다', text: '총 척수는 580척에서 399척으로 줄었는데 한국 비중은 2.1%에서 3.5%로 올랐다.' },
  { stage: 'c06', headline: '신라교역 두 척이 돌아왔다', text: '2021년 6척 전원 등재 → 2023년 0척 → 2024년 2척. 명단은 조달 관계이지 소유가 아니다.' },
];

export const BOLTON_SOURCE_NOTES: string[] = [
  '원자료는 Bolton 조사 아카이브(2026-08)다 - Sustainability Report 2025, 공개 선박명단 2021~2024년판, 이탈리아 등기 기탁분, EU 기업결합 결정문, UN Comtrade. 칸별 출처·등급(A=원본, B=기관 2차, C=업계 매체)이 달려 있다.',
  '비상장 가족기업이라 연결재무제표를 공표하지 않는다. 매출은 회사 발표문, 손익은 등기 기탁분의 언론 인용이다 - 2023년 이후 EBITDA·EBIT는 확인되지 않는다.',
  '조달 740,310 t 은 Bolton Food 원료와 Tri Marine 트레이딩의 합이다. 브랜드가 쓴 양으로 읽으면 안 된다.',
  '참치 단독 매출은 공개되지 않는다. 최소 공개 단위가 Food 카테고리 2,382 M€이고 그 안에 수산캔·육류캔·소스가 함께 들어 있다.',
  '선단은 연도와 등록부를 붙여야 한다. 공개 선박명단 399척은 조달 선단이고, **계열 소유는 WCPFC 10척 · IATTC 4척**이며 ICCAT 3척은 비활성이다(Via Alizé는 2025-04 중남미 매각 보도). AURORA B·ROSITA C 의 **등록 선주는 Atunera Dularra SL(빌바오)이고 그 모회사가 Grupo Conservas Garavilla - Bolton 100% 자회사**라 그룹 선박이 맞다. 알바코라 조사가 같은 배를 자기 선단표에 넣은 것이 겹침의 원인이다.',
];
