const SPECIES_KO: Record<string, string> = {
  'Todarodes pacificus': '살오징어',
  'Illex argentinus': '아르헨티나 일렉스',
  'Illex coindetii': '남방일렉스',
  'Dosidicus gigas': '대왕오징어',
  'Doryteuthis gahi': '포클랜드 로리고',
  'Doryteuthis pealeii': '롱핀오징어',
  'Loligo gahi': '포클랜드 로리고',
  'Loligo vulgaris': '유럽 로리고',
  'Loligo spp.': '로리고류',
  'Loligo spp': '로리고류',
  'Cephalopoda NEI': '기타 두족류',
  'Sepia spp': '갑오징어류',
};

const WIDGET_TITLE_KO: Record<string, string> = {
  '페루 pota — LMCTP·누적하역·중단공지 타임라인': '페루 대왕오징어 — 총허용어획한도·누적하역·중단공지',
  '칠레 jibia — 쿼터 소진율': '칠레 대왕오징어 — 쿼터 소진율',
  '포클랜드 Loligo — 어기 캘린더·어기전 자원량': '포클랜드 로리고 — 어기 일정·어기 전 자원량',
  '아르헨티나 Illex — 어기 타임라인 및 2026 데이터 공백': '아르헨티나 일렉스 — 어기 일정 및 2026년 자료 공백',
  '한국 TAC 적용 업종 확대 — 살오징어 포함': '한국 총허용어획량 적용 업종 확대 — 살오징어 포함',
  '일본 스루메이카 TAC·자원평가': '일본 살오징어 총허용어획량·자원평가',
  'SPRFMO CMM18 — 선박수 상한 (effort 기반)': '남태평양지역수산관리기구 — 선박 수 상한·조업노력량 기준',
  'GLOBEFISH 두족류 시황 요약': '유엔식량농업기구 두족류 시황 요약',
  'HS 분류 맵 (030741~49 × 제품형태)': '품목분류표 030741~49 — 제품 형태별',
  'UN Comtrade 커버리지 매트릭스 (7 reporter × 2021-2023)': '유엔 무역통계 자료 범위 — 7개 보고국·2021~2023년',
  '인도 MPEDA 수출 실적 2025-26': '인도 수산물수출개발원 수출 실적 2025~2026년',
  'FTA 수산물 수입 트렌드': '자유무역협정 수산물 수입 동향',
  '스페인·EU 가공허브 물동량': '스페인·유럽연합 가공 거점 물동량',
  'USDA GAIN 한국 수산시장 업데이트': '미국 농무부 한국 수산시장 업데이트',
  'SPRFMO IUU 선박 리스트 2026': '남태평양지역수산관리기구 불법어업 선박 목록 2026년',
  'SPRFMO 준수보고서 2024-2025 요약': '남태평양지역수산관리기구 준수보고서 2024~2025년 요약',
  'NOAA SIMP 대상 품목·요구서류 체크리스트': '미국 해양대기청 수입 모니터링 대상·요구서류',
  'EJF 글로벌 스퀴드 리포트 2026 — 리스크 지도': '환경정의재단 세계 오징어 보고서 2026년 — 위험 지도',
  '원양어업 강제노동 리스크 (US DOL)': '원양어업 강제노동 위험 — 미국 노동부',
  'MSC 인증 오징어 어장 현황': '해양관리협의회 인증 오징어 어장 현황',
};

const PUBLISHER_KO: Record<string, string> = {
  'NOAA GARFO': '미국 해양대기청 대서양광역수산국',
  'IMARPE Peru': '페루 해양연구소',
  'NPFC / NIFS / JFA': '북태평양수산위원회·국립수산과학원·일본 수산청',
  'Korea FIRA / MOF': '한국수산자원공단·해양수산부',
  'aT KAMIS': '농수산식품유통공사 농수산물유통정보',
  'China Customs / GACC': '중국 해관총서',
  'European Commission RASFF': '유럽연합 집행위원회 식품사료신속경보',
  FAO: '유엔식량농업기구',
  'Statistics Korea KOSIS': '통계청 국가통계포털',
  'National Institute of Fisheries Science': '국립수산과학원',
  INIDEP: '아르헨티나 국립수산연구개발원',
  'Japan Fisheries Agency': '일본 수산청',
  'Falkland Islands Fisheries Department': '포클랜드 수산국',
  SPRFMO: '남태평양지역수산관리기구',
  'NOAA Fisheries': '미국 해양대기청 수산국',
  'Korea Ministry of Oceans and Fisheries': '대한민국 해양수산부',
  'PRODUCE Peru': '페루 생산부',
  'SUBPESCA Chile': '칠레 수산차관실',
  'SERNAPESCA Chile': '칠레 수산양식청',
  'Argentina government and CTMFM': '아르헨티나 정부·공동해양전선기술위원회',
  'Korea Customs Service': '대한민국 관세청',
  'UN Statistics Division': '유엔 통계처',
  'Korea Maritime Institute': '한국해양수산개발원',
  'Marine Products Export Development Authority India': '인도 수산물수출개발원',
  'KMI FishData': '한국해양수산개발원 수산물 가격자료',
  'FAO GLOBEFISH': '유엔식량농업기구 세계수산시장정보',
  'European Commission EUMOFA': '유럽연합 집행위원회 수산시장관측소',
  MPEDA: '인도 수산물수출개발원',
  'National Fishery Products Quality Management Service': '국립수산물품질관리원',
  'US Department of Labor ILAB': '미국 노동부 국제노동국',
  'Environmental Justice Foundation': '환경정의재단',
  'Marine Stewardship Council': '해양관리협의회',
  'USDA Foreign Agricultural Service': '미국 농무부 해외농업국',
  'India Department of Commerce': '인도 상무부',
  '수기 운영 입력': '수기 운영 입력',
  '대시보드 내부 감사': '대시보드 내부 감사',
};

const FREQUENCY_KO: Record<string, string> = {
  'event_seasonal': '어기 중 수시',
  'monthly_in_season': '어기 중 매월',
  'daily_weekly': '일·주간',
  annual: '연간',
  monthly: '월간',
  weekly: '주간',
  quarterly: '분기',
  seasonal: '어기별',
  event: '수시',
  weekly_in_season: '어기 중 주간',
  annual_event: '연간·수시',
  event_weekly: '수시·주간',
  weekly_monthly: '주간·월간',
  weekly_annual: '주간·연간',
  monthly_annual: '월간·연간',
  on_revision: '개정 시',
  event_monthly: '수시·월간',
  manual: '수동',
};

const SERIES_KO: Record<string, string> = {
  'Pota certification working group': '대왕오징어 인증 실무협의체',
  'Illex quota monitor': '일렉스 쿼터 소진 감시',
  'Dosidicus cruise and situation reports': '대왕오징어 조사항해·상황보고',
  'Todarodes pacificus (Japanese flying squid / 살오징어)': '살오징어',
  'HS 0307/1605 squid trade': '품목분류 0307·1605 오징어 교역',
  'cephalopod import alerts': '두족류 수입 경보',
  'FishStat capture production': '수산통계 어획생산량',
  'DT_1EW0005 fishery production': '국가통계표 어업생산량',
  'Fisheries climate change briefing': '수산업 기후변화 브리핑',
  'Cephalopod fisheries programme and weekly bulletins': '두족류 어업계획 및 주간공보',
  'Surumeika stock assessment': '살오징어 자원평가',
  'Falkland calamari stock surveys': '포클랜드 로리고 자원조사',
  'Scientific Committee squid work': '과학위원회 오징어 업무',
  'Longfin squid science': '롱핀오징어 과학자료',
  'TAC implementation plan': '총허용어획량 시행계획',
  'Pota LMCTP progress and closures': '대왕오징어 총허용어획한도 진행 및 중단',
  'Jibia quota decree': '대왕오징어 쿼터 법령',
  'Quota consumption': '쿼터 소진량',
  'Surumeika TAC management': '살오징어 총허용어획량 관리',
  'Licensing advice': '어업면허 권고',
  'CMM 18 Squid': '오징어 보존관리조치 18호',
  'Illex fishery regulations': '아르헨티나 일렉스 어업규정',
  'Longfin squid management and quota monitor': '롱핀오징어 관리 및 쿼터 점검',
  'Monthly trade by HS': '품목분류별 월간 무역',
  'UN Comtrade Plus': '유엔 무역통계',
  'FTA seafood import trends': '자유무역협정 수산물 수입 동향',
  'Marine products export figures': '수산물 수출 실적',
  'HS Codes for Cephalopods': '두족류 품목분류 코드',
  'Seafood price trends': '수산물 가격 동향',
  'European Fish Price Report': '유럽 수산물 가격 보고서',
  'Cephalopods analysis and Highlights': '두족류 분석 및 주요 동향',
  'Squid profile and EU Fish Market': '오징어 개요 및 유럽연합 수산시장',
  'Exporter and processing plant directory': '수출업체 및 가공공장 명부',
  'Import inspection and quarantine notices': '수입검사 및 검역 공지',
  'IUU list and compliance report': '불법어업 선박 목록 및 준수보고서',
  'Distant-water fishing labor risk': '원양어업 노동 위험',
  'Global Squid Report': '세계 오징어 보고서',
  'Seafood Import Monitoring Program': '수산물 수입 모니터링 제도',
  'Squid certified fishery overview': '오징어 인증어업 개요',
  'Korea Seafood Market Update': '한국 수산시장 업데이트',
  'TradeStat commodity-country trade': '품목·국가별 무역통계',
  '14th Scientific Committee': '제14차 과학위원회',
  '한국 수입 관세율': '한국 수입 관세율',
  'squid 위젯 감사·정정 이력': '오징어 위젯 감사·정정 이력',
};

const FIELD_KO: Record<string, string> = {
  // E 섹션(근거·거버넌스) 표 머리글
  source_id: '출처 코드',
  publisher: '발행처',
  series: '자료 계열',
  priority: '우선순위',
  grade: '출처 등급',
  frequency: '갱신 주기',
  landing_url: '원문 링크',
  archive_subdir: '보관 폴더',
  latest_verified: '최종 확인',
  note: '비고',
  gate_id: '게이트 번호',
  indicator: '지표',
  source_widget: '근거 위젯',
  coverage_end: '관측 종료',
  available: '가용 여부',
  label: '이름',
  value: '값',
  unit: '단위',
  currency: '통화',
  market_stage: '거래 단계',
  weight_basis: '중량 기준',
  status: '상태',
  age_days: '경과 일수',
  subject: '대상',
  allowed_use: '허용 용법',
  blocked_use: '금지 용법',
  evidence_path: '근거 경로',
  explicit_widget_count: '명시 위젯 수',
  next_check: '다음 확인일',
  band: '구간',
  year: '연도',
  month: '월',
  date: '날짜',
  country: '국가',
  country_code: '국가 코드',
  reporter: '보고국',
  reporter_code: '보고국 코드',
  row_count: '원본 행 수',
  density_pct: '자료 밀도 비율',
  scientific_name: '어종',
  product_form: '제품 형태',
  size_grade: '규격',
  price_eur_per_kg: '킬로그램당 유로 가격',
  price_usd_per_kg: '킬로그램당 달러 가격',
  price_krw: '원화 가격',
  reference_area: '참조 시장',
  incoterm: '인도 조건',
  origin: '원산지',
  trend: '추세',
  import_usd: '수입액',
  import_kg: '수입 중량',
  unit_price_usd_mt: '톤당 수입단가',
  stage: '단계',
  description: '설명',
  hs6: '품목분류 코드',
  source_line: '원문 행',
  kind: '자료 유형',
  source_path: '원문 경로',
  text: '원문',
  text_ko: '한글 번역',
};

const EXACT_VALUE_KO: Record<string, string> = {
  ...SPECIES_KO,
  ...SERIES_KO,
  Whole: '원물',
  'Fresh - whole': '생물 원물',
  'Grade A': '1등급 원물',
  'IQF, glazed': '개별급속냉동·글레이즈',
  'cut, no wings, tentacles': '절단·날개와 다리 제거',
  'Tubes, skin-on': '몸통·껍질 포함',
  'Tubes, skinless': '몸통·껍질 제거',
  Croatia: '크로아티아',
  Italy: '이탈리아',
  France: '프랑스',
  Morocco: '모로코',
  Spain: '스페인',
  Mauritania: '모리타니아',
  'South Africa': '남아프리카공화국',
  'Falkland Islands (Malvinas)': '포클랜드 제도',
  Argentina: '아르헨티나',
  Yemen: '예멘',
  'Portugal/Italy': '포르투갈·이탈리아',
  'United States': '미국',
  India: '인도',
  wholesale: '도매',
  'Spain wholesale': '스페인 도매',
  'for Chinese': '중국행',
  CIF: '운임·보험료 포함 인도',
  CPT: '운송비 지급 인도',
  FOB: '본선 인도',
  ARTESANAL: '소형어업',
  INDUSTRIAL: '산업어업',
  'ARTESANAL-INDUSTRIAL': '소형·산업 공동어업',
  Total: '합계',
  China: '중국',
  Korea: '한국',
  'Chinese Taipei': '대만',
};

const PHRASE_REPLACEMENTS: readonly [RegExp, string][] = [
  [/Nota\s+NO-[^\s]+/gi, '공문 번호'],
  [/MANUAL-TARIFF/gi, '수동 관세율 입력'],
  [/squid\s+archive\s+@/gi, '오징어 자료 보관본'],
  [/F\s*T\s*A/gi, '자유무역협정'],
  [/\bFK[A-Z0-9]+\b/g, ''],
  [/\bSL\b/g, '시에라리온'],
  [/Argentina\.gob\.ar/gi, '아르헨티나 정부 누리집'],
  [/UN Comtrade(?: Plus)?/gi, '유엔 무역통계'],
  [/USDA GAIN/gi, '미국 농무부 해외농업정보망'],
  [/NOAA Fisheries/gi, '미국 해양대기청 수산국'],
  [/NOAA SIMP/gi, '미국 해양대기청 수산물 수입 모니터링 제도'],
  [/FAO GLOBEFISH/gi, '유엔식량농업기구 세계수산시장정보'],
  [/GLOBEFISH/gi, '세계수산시장정보'],
  [/SPRFMO/gi, '남태평양지역수산관리기구'],
  [/SUBPESCA/gi, '칠레 수산차관실'],
  [/SERNAPESCA/gi, '칠레 수산양식청'],
  [/PRODUCE/gi, '페루 생산부'],
  [/INIDEP/gi, '아르헨티나 국립수산연구개발원'],
  [/EUMOFA/gi, '유럽 수산시장관측소'],
  [/MPEDA/gi, '인도 수산물수출개발원'],
  [/KOSIS/gi, '국가통계포털'],
  [/FishData/gi, '수산물 가격자료'],
  [/KMI/gi, '한국해양수산개발원'],
  [/KCS/gi, '관세청'],
  [/FIFD/gi, '포클랜드 수산국'],
  [/JFA/gi, '일본 수산청'],
  [/NIFS/gi, '국립수산과학원'],
  [/NFQS/gi, '국립수산물품질관리원'],
  [/US DOL/gi, '미국 노동부'],
  [/EJF/gi, '환경정의재단'],
  [/MSC/gi, '해양관리협의회'],
  [/SIMP/gi, '수산물 수입 모니터링 제도'],
  [/IUU/gi, '불법·비보고·비규제'],
  [/DWF/gi, '원양어업'],
  [/RFMO/gi, '지역수산관리기구'],
  [/CMMs?/gi, '보존관리조치'],
  [/CNCPs?/gi, '협력 비회원국'],
  [/VMS/gi, '선박감시시스템'],
  [/CMS/gi, '준수감시체계'],
  [/LMCTP/gi, '총허용어획한도'],
  [/TAC/gi, '총허용어획량'],
  [/FTA/gi, '자유무역협정'],
  [/CAGR/gi, '연평균성장률'],
  [/HHI/gi, '시장집중도지수'],
  [/\bHS\b/gi, '품목분류'],
  [/\bEU\b/gi, '유럽연합'],
  [/\bUN\b/gi, '유엔'],
  [/\bFAO\b/gi, '유엔식량농업기구'],
  [/\bUSDA\b/gi, '미국 농무부'],
  [/\bPDF\b/gi, '문서'],
  [/\bCSV\b/gi, '표 파일'],
  [/\bXLSX\b/gi, '엑셀 파일'],
  [/Markdown/gi, '마크다운'],
  [/HTML/gi, '웹문서'],
  [/\bSYNCED\b/gi, '동기화'],
  [/\bSTATIC\b/gi, '정적 자료'],
  [/\bLIVE\b/gi, '실시간'],
  [/\bEUR\b/gi, '유로'],
  [/\bUSD\b/gi, '달러'],
  [/\bKRW\b/gi, '원'],
  [/\bINR\b/gi, '루피'],
  [/\bGT\b/g, '총톤'],
  [/\bkg\b/gi, '킬로그램'],
  [/\bcm\b/gi, '센티미터'],
  // 숫자 뒤에 올 때만 단위로 본다. `\bg\b` 로 두면 게이트 번호 G-006 의 G 까지 잡는다.
  [/(?<=\d\s?)g\b/g, '그램'],
  [/\bpc\b/gi, '마리'],
  [/\bMT\b/g, '톤'],
  [/\bIQF\b/g, '개별급속냉동'],
  [/\beffort\b/gi, '조업노력량'],
  [/\breporter\b/gi, '보고국'],
  [/\brow_count\b/gi, '원본 행 수'],
  [/\bdensity_pct\b/gi, '자료 밀도 비율'],
  [/\bsquid-only\b/gi, '오징어 단독'],
  [/\bsquid\b/gi, '오징어'],
  [/\bLoligo\b/g, '로리고'],
  [/\bIllex\b/g, '일렉스'],
  [/\bjibia\b/gi, '대왕오징어'],
  [/\bpota\b/gi, '대왕오징어'],
  [/\blongfin\b/gi, '롱핀오징어'],
  [/G-(\d{3})/g, '측정 기준 $1번'],
  [/D\+(\d+)/g, '기준일+$1일'],
  [/([\d,.]+)\s*t\b/g, '$1톤'],
];

export function squidWidgetTitle(title: string): string {
  return WIDGET_TITLE_KO[title] ?? koreanUiText(title);
}

export function squidPublisherLabel(publisher: string): string {
  return PUBLISHER_KO[publisher] ?? koreanUiText(publisher);
}

export function squidFrequencyLabel(frequency: string): string {
  return FREQUENCY_KO[frequency] ?? koreanUiText(frequency);
}

export function squidFieldLabel(field: string): string {
  return FIELD_KO[field] ?? koreanUiText(field.replaceAll('_', ' '));
}

/**
 * 원문 대조용 식별자. 게이트 번호와 출처 코드는 사용자가 출처 원장과 맞춰 보는 코드라
 * 번역하면 대조가 끊긴다. `SQ-PROD-FAO-FISHSTAT` 가 `SQ-PROD-유엔식량농업기구-FISHSTAT`
 * 가 되면 원장에서 찾을 수 없다.
 */
const IDENTIFIER = /^(G-\d{3}|SQ-[A-Z0-9]+(?:-[A-Z0-9]+)*|LEG-[A-Z0-9-]+|\d{6})$/;

export function squidValueLabel(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '예' : '아니요';
  if (typeof value === 'number') return value.toLocaleString('ko-KR');
  if (typeof value === 'object') {
    return Array.isArray(value)
      ? value.map((item) => squidValueLabel(item)).join(' · ')
      : Object.entries(value as Record<string, unknown>)
          .map(([key, item]) => `${squidFieldLabel(key)} ${squidValueLabel(item)}`)
          .join(' · ');
  }

  const text = String(value);
  if (IDENTIFIER.test(text)) return text;
  if (EXACT_VALUE_KO[text]) return EXACT_VALUE_KO[text];

  return koreanUiText(text)
    .replace(/\bXL\b/g, '특대형')
    .replace(/\bL\b/g, '대형')
    .replace(/\bM\b/g, '중형')
    .replace(/\bS\b/g, '소형')
    .replace(/\bvery big\b/gi, '매우 큼')
    .replace(/\bbig\b/gi, '큼')
    .replace(/\bmedium\b/gi, '중간')
    .replace(/\bsmall\b/gi, '작음');
}

export function koreanUiText(value: string): string {
  let text = value;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s{2,}/g, ' ').trim();
}

export function koreanExcerptText(value: string): string {
  let text = value;
  // 한글 번역 뒤에 병기된 학명·기관명·문서명 원문은 펼침 영역에서만 보여준다.
  for (let i = 0; i < 3; i += 1) {
    text = text.replace(/\([^()]*[A-Za-z][^()]*\)/g, '');
  }
  return koreanUiText(text)
    .replace(/\ba\)/g, '가)')
    .replace(/\bb\)/g, '나)')
    .replace(/\bc\)/g, '다)')
    .replace(/\bd\)/g, '라)')
    .replace(/\be\)/g, '마)')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function squidUnitLabel(unit: string | null | undefined): string {
  if (!unit) return '';
  return koreanUiText(unit)
    .replaceAll('/', '당 ')
    .replaceAll('·', '·');
}

export function squidCurrencyLabel(currency: string): string {
  return koreanUiText(currency);
}

export function squidSpeciesLabel(scientificName: string): string {
  return SPECIES_KO[scientificName] ?? koreanUiText(scientificName);
}
