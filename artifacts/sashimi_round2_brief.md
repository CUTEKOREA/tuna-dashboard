# Round 2 정정 Brief — sashimi 신규위젯 (라이브오류 + 헷지→검증값)

- 생성: 2026-06-05 / 대상 21개 위젯
- 규칙: ① 라이브 데이터오류 즉시정정 ② 내부정합(합계·%·모순) 강제 ③ Track C 검증값으로 헷지→확정 ④ 충돌출처는 단일 권위 1차로 일원화 ⑤ 날조금지(없으면 헷지) ⑥ STATIC·디자인 보존

## SasEuBrandMap
**Track C 1차출처 검증값:**
- 주장: 이탈리아·유럽 캔참치 RioMare 점유율, 프랑스·스페인 가공사 매핑
  - 검증값: MSC 2024(Italy): RioMare는 Mareblu·Grupo Consorcio·Insuperabile와 함께 이탈리아 대형 캔참치 브랜드로 명시, 이탈리아 캔참치 1인당 소비 2.55kg(2022, Doxa-Ancit), 생산 77,400톤, 가구침투율 96%, 소매 PB(own-brand) 성장 중. Bolton Food: 식품부문 매출 €2.4B(FY2024, +9.5%), RioMare 40개국 진출 유럽 캔참치 1위. 이탈리아 점유율 38%는 2016년 역사적 수치.
  - 판정: 원수치 정당(정성) / 정정필요(정량) — RioMare가 이탈리아·유럽 캔참치 1위라는 점은 1차/준1차로 확인. 다만 정확한 점유율 %는 1차출처 부재: Bolton 이탈리아 38%는 2016년(역사적), 'mercato leader 25%'는 1980년대 수치. 최신 정량 점유율은 헷지 유지가 타당.
  - 인용: Marine Stewardship Council, 'Tuna Market Analysis 2024: Italy'(MSC 2024 발행), https://www.msc.org/docs/default-source/it-files/italy-tuna-market-analysis-english.pdf / Bolton Group FY2024 실적(ESM Magazine 2025), https://www.esmmagazine.com/a-brands/rio-mare-boosts-bolton-groups-fy-2024-sales-293921

## SasEuCatchGate
**Track C 1차출처 검증값:**
- 주장: IUU 레드카드 국가 구성
  - 검증값: 2024-05 기준 EU IUU 활성 레드카드 5개국: 캄보디아·카메룬·코모로·세인트빈센트그레나딘(SVG)·트리니다드토바고. 카메룬 레드카드 2023-01(IP/22/7890), SVG·코모로 종전 부여 후 유지.
  - 판정: 원수치 정당 (시점 의존 — 배포 전 최신 결정 재확인 권고)
  - 인용: European Commission DG MARE, 'Fight against illegal fishing: Commission identifies Cameroon as a non-cooperating country' IP/22/7890, 2023-01-17 (https://ec.europa.eu/commission/presscorner/detail/en/ip_22_7890); IUU Watch 'Map of EU carding decisions' (https://www.iuuwatch.eu/map-of-eu-carding-decisions/)

## SasEuDistantFleet
**재채점: C(79.5) — 잔존결함:**
- F2023/FMSY=0.2가 1차 출처(IOTC-2024-SC27-ES04 line 30·142)와 불일치 — 실제값은 0.75. 위젯 코드 주석(line 10)과 사용자 노출 takeaway 본문(line 30) 양쪽에 박힌 명백한 정량 사실오류. 재채점은 이를 '경미·독립 확인 불가'로 오분류했으나 1차 PDF에서 'F2023/FMSY = 0.75 (0.58-1.01)'로 직접 확인됨. 0.2와 0.75는 3.75배 차이로 'green 여유' 서사를 좌우 — P1급.
- 'MSY 상한' 라벨 부정확 — ES04 line 182는 421,000t을 MSY 점추정치(range 416-430)로 명시, 진짜 상한은 430K. 421을 '상한'으로 표기+ReferenceLine을 그 위치에 그려 423K(5년평균, 범위 내)가 초과로 보이게 함.
- 차트-서사 시각 모순 — STOCK 데이터(line 16-17)의 '5년 평균'(423K) 막대가 'MSY 상한'(421K) 막대와 y=421 ReferenceLine(line 44)을 시각적으로 넘어, 지속가능 상한 초과처럼 보임. 위젯이 파는 'green' 서사와 충돌.
- 선단구조 수치(EU 선망 50척+·7개 EU기업 ~90%·인도양 어획 약 1/3)는 SeafoodSource·AP·Blue Marine/Pew 옹호성 2차보도 기반. 1차 선박등록부 독립 미검증, 위젯 내 URL·발행일 미명시.

## SasEuMscGate
**재채점: C(78.5) — 잔존결함:**
- a3 검증성 하향(70→64): 2023=30% 추정값이 코드주석(라인 8-13)에만 '미축자확인(추정)'으로 적혀 사용자노출 차트에는 전혀 전달되지 않음. 실제 차트(라인 42)는 fill='#10b981'·radius·불투명도 모두 1차측정 양끝점(18·49)과 동일한 solid 막대로 2023=30 렌더 — 점선·흐림·차트각주 없음. 코드주석은 viewer가 못 보므로 honesty 미확보, 세 막대 모두 측정값처럼 보이는 과대정밀 잔존.
- a1 출처 하향(80→76): 내부 수치 불일치 확인됨. SasEuMscGate(라인 9·28·48) 'MSC 인증 어획 310만t / 자연산 참치 절반' vs 형제 MscEcolabelRegistryScale.tsx(라인 16·20·107) 동일 MSC 참치 지표 '305만 MT' — 약 5만t 격차, 어느 쪽도 reconcile 안 됨. 같은 대시보드 내 정합성 훼손.
- a3 검증성: 헤드라인 '블루라벨 참치 40만t+/+39%'(라인 30)는 2차 무역지(The Grocer·SeafoodSource) 귀속. 1차 형제 MscProductVolumeGrowth.tsx(라인 21-38·118-120)는 전(全)어종 합산만 추적(2024 total 138.5만t·canned 33.5만t)하며 참치 한정 40만t·+39% 수치 자체가 부재 — 1차 독립 입증 실패 확인.
- a3 검증성: 핵심 49% 수치가 단일 출처계열(MSC UK Tuna Shopper Report / MSC 보도자료)에만 의존, 외부 삼각검증(EUMOFA·리테일 감사 등) 부재 확인. 1차 양끝점만 확인되고 추세 기울기는 부분 추정.

## SasEuProcessingHub
**Track C 1차출처 검증값:**
- 주장: 스페인/EU 참치 가공허브 €1.1B 매출·62,000명 고용, INTERATUN 기준연도
  - 검증값: ANFACO-CECOPESCA 2024: 협회 가공클러스터 252개사 매출 €14.289B(2023말 기준), 협회사가 스페인 가공업 매출의 71.1%·고용의 72.4% 차지, 스페인 캔참치가 EU 통조림 생산의 65%+. INTERATUN 책자에는 €1.1B/62,000명 명시 없음(발행시점 부처명 'Medio Ambiente y Medio Rural y Marino'·2010년 EESC 의견 인용으로 2010-11 추정).
  - 판정: 정정필요 — INTERATUN 원문에는 €1.1B·62,000명 수치가 없음(정성적 'miles de empleos'만 서술, 발행 약 2010-11년의 역사적 자료로 T-3y 신선도 미달). 최신 1차출처(ANFACO Balance 2024)는 가공클러스터 전체 €14.289B/252개사를 제시. €1.1B/62,000명은 INTERATUN 출처로 귀속 불가 — 출처·기준연도 재지정 또는 헷지 필요.
  - 인용: ANFACO-CECOPESCA, 'Presentación datos sector 2024 / Balance 2024'(2025-03 발행), https://www.anfaco.es/wp-content/uploads/2025/03/Presentacion-datos-sector-2024-1.pdf / INTERATUN(원문 정성 서술), 'La industria atunera española: una referencia mundial'(약 2010-11), https://anfaco.es/fotos/biblioteca/eurothon/folleto%20interatun.pdf

## SasGlConsumptionMatrix
**Track C 1차출처 검증값:**
- 주장: 참다랑어 세계소비 약 72%(WWF 2012 갱신값)
  - 검증값: WWF Japan(2012 데이터): 일본이 세계 마구로 생산의 약 1/4~1/5 소비(2012년 39만톤), '刺身マグロ(사시미 참치) 세계시장의 약 80%'를 일본이 차지하는 세계 1위 소비국. 그린피스 재팬·JFTA(日本鰹鮪): 태평양 참다랑어(클로마구로) 세계 총어획의 약 80%를 일본이 소비. FAO Globefish(2017): 신선·냉동 블루핀 글로벌 교역의 약 90%가 일본 경유. → 위젯 '72%' 대신 'WWF 약 80%'로 정정 권고
  - 판정: 정정필요 — WWF/그린피스/JFTA 원출처는 일관되게 약 80%(刺身マグロ 세계시장의 약 80%, 태평양 클로마구로 세계어획의 약 80%를 일본이 소비). 72%는 WWF 2012 원출처에서 확인 불가
  - 인용: WWFジャパン 'マグロの漁獲量と消費量', https://www.wwf.or.jp/activities/basicinfo/83.html / グリーンピース・ジャパン '太平洋クロマグロ 世界80%', https://www.greenpeace.org/japan/news/story_4287/ / 日本鰹鮪漁業協同組合連合会(JFTA), https://www.jfta-or.jp/import.html / WWF(영문) Science/AAAS 재인용 'Japan eats ~80% of bluefin'
- 주장: 중국 일식당 약 4만개(2017 기준)
  - 검증값: MAFF 令和5년(2023) '海外における日本食レストラン数の調査結果'(2023-10-13 발표, 2023-11-21 訂正): 전세계 약 18.7만개(2021 대비 약 20%↑), 중국 약 78,760개(최다)·미국 약 26,040개·한국 약 18,210개·아시아 전체 약 12.2만개·유럽 약 16,200개. MAFF 令和7년(2025, 2025-11-28 발표): 전세계 약 18.1만개(약 6,000개↓), 중국 경제침체로 약 1할(약 9,600개) 감소 → 약 69,000개 수준 추정
  - 판정: 정정필요 — MAFF(일본 농림수산성) 2023년 조사 기준 중국 약 78,760개로, 위젯의 '약 4만개(2017)'는 구식·약 절반 과소. 2025년 조사에선 경제침체로 약 1할(9,600개) 감소
  - 인용: 農林水産省 '海外における日本食レストラン数の調査結果（令和5年）', https://www.maff.go.jp/j/press/yusyutu_kokusai/kikaku/231013_12.html / 同（令和7年, 2025-11-28）, https://www.maff.go.jp/j/press/yusyutu_kokusai/kaitaku/251128.html / 事業構想オンライン(2023-10) '全世界で18万7000店'
- 주장: EU 일식당 약 1.2만개(업계 추정·미확인)
  - 검증값: MAFF 令和5년(2023): 유럽 약 16,200개(2021 대비 약 20%↑). EU 회원국만 분리한 공식 수치는 MAFF 별지 PDF의 국별 표에 존재하나 본 검증에선 EU 단독 합산 미확정. Statista가 MAFF 원자료 기반 '2023 유럽 국별 일식당 수' 재가공 제공. → 위젯 '추정·미확인 1.2만개'를 'MAFF 2023 유럽 약 1.6만개'로 1차출처 격상 권고
  - 판정: 정정필요(보강) — MAFF 2023 기준 '유럽 전체' 약 16,200개. EU≠유럽전체이나 위젯의 1.2만개는 과소. MAFF는 EU 단독 수치 미제공이므로 '유럽 약 1.6만개(MAFF 2023)'로 출처 격상·정정 권고
  - 인용: 農林水産省 '海外における日本食レストラン数の調査結果（令和5年）'(유럽 약16,200店), https://www.maff.go.jp/j/press/yusyutu_kokusai/kikaku/231013_12.html / Statista 'Number of Japanese restaurants in Europe by country 2023'(MAFF 원자료 기반)

## SasGlTradeFlows
**Track C 1차출처 검증값:**
- 주장: FAO Globefish 참치 무역 데이터의 원천(GTT vs UN Comtrade) — 위젯은 'FAO Globefish·UN Comtrade(HS160414)' 병기
  - 검증값: FAO Globefish Highlights/Trade Statistics 방법론: 무역흐름은 'Global Trade Tracker(GTT, www.globaltradetracker.com)'와 보고국 무역통계청 자료를 6-digit HS 수준으로 집계. FAO 자체는 UN Comtrade를 주된 Globefish 무역분석 원천으로 명시하지 않음(SOFIA·FishStat은 별도 FAO 통계). 위젯의 세계 교역 $118.6억·3.07Mt·통조림 $65.0억(2024 1~9월)은 Globefish(GTT 기반) 재게재값, 캔 수출국 순위(태국 $2.5B 등)는 UN Comtrade HS160414 — 출처 이원 구조가 맞음. 단 위젯 cardDesc가 두 수치 모두를 'FAO Globefish·UN Comtrade'로 묶은 점은 'Globefish=GTT기반 / 수출국순위=UN Comtrade'로 분리 표기 권고
  - 판정: 원수치 정당(부분 정정) — FAO Globefish 본체 무역통계의 1차 원천은 UN Comtrade가 아니라 Global Trade Tracker(GTT) + 각 보고국 무역통계청 6자리 HS. 위젯의 캔 수출국 순위(HS160414)는 UN Comtrade 기반으로 별개 — 두 출처를 분리 명기하면 정확
  - 인용: FAO GLOBEFISH 'Species Analysis: Tuna', https://www.fao.org/in-action/globefish/species-analysis/tuna/en / FAO GLOBEFISH Highlights(GTT를 trade source로 명시), https://www.fao.org/in-action/globefish/en / UN Comtrade(HS160414 캔 참치 수출국)

## SasGlWcpoSupply
**재채점: C(67.25) — 잔존결함:**
- 산술 모순(P1, 미해소): 막대 어종 톤수 합 2046+741+150+163=3,100천t인데 헤더(35행)·description(24행)·takeaway situation(29행)·source(31행)이 모두 총 3,059천t로 단언 — 41천t 갭이 설명 없이 화면 4곳에 동시 노출. 코드 실측으로 확정.
- 퍼센트 라벨 합 101%(P1, 미해소): LabelList(45행)가 pct 67+24+5+5=101%를 막대 위에 그대로 표시. 추가로 눈다랑어(150·실제4.90%)와 날개기타(163·실제5.33%)가 둘 다 '5%'로 동률 표기돼 서로 다른 막대 높이와 시각적으로 모순 — 재채점의 '단순 반올림 아티팩트' 진단보다 결함이 더 깊음.
- 소프트 데이터 잔존(P2, 미해소): 주석 11행이 '눈다랑어·날개기타·어종 합계 라벨은 SPC 2024 Tuna Status로 재대조 권장'이라 자인 — 4개 막대 중 2개가 미검증 placeholder급. 정직한 공시이나 결함 자체는 미수정.
- 신선도 경계(P2): 'WCPO 글로벌 비중 52%(2023)'가 2026-06 기준 T-3y 필터 경계에 위치. STATIC syncDate='2024년 어획 기준'으로 정확한 발행일 미특정.
- 단일 출처 의존(P2): SPC/WCPFC 한 계열만 의존, 코드 내 교차출처 대조·라이브 fetch 분기 전무(정당한 STATIC이나 a3 검증성 상한).
- Y축 도메인 하드코딩(P3 잠재): domain=[0,2200](41행)이 현재 max 2046엔 안전하나 수치 갱신 시 막대 잘림 위험 — 현재 결함은 아님.
**Track C 1차출처 검증값:**
- 주장: WCPO 어종별 어획량 — 날개·기타 163천t / 합계 3,059천t (SPC2024)
  - 검증값: WCPFC-CA 2024 총어획 3,059,005t(사상 최대). 어종별: SKJ 2,107,666(70%)·YFT 677,594(22%)·BET 119,023(4%)·ALB 119,867(4%) [ST-GN-01]; 어업개황 기준 SKJ 2,045,720·YFT 741,473·BET 151,611·ALB 120,201. albacore=약 120천t이며 '163천t'에 해당하는 어종/그룹 매칭 없음. 'Other'는 SPC에서 어구 분류(488,870t)로만 존재.
  - 판정: 부분정정필요 — 합계 3,059천t 정당, 날개·기타 163천t는 출처상 미확인(albacore 단독 약 120천t)
  - 인용: SPC-OFP·FFA (Vidal & Ruaia), 'Overview of Tuna Fisheries in the WCPO Including Economic Conditions – 2024', WCPFC SC21-2025 / ST-GN-01, 2025-08 (https://meetings.wcpfc.int/file/18324/download); 'The western and central Pacific tuna fishery: 2024 overview and status of stocks', WCPFC SC21, 2025 (https://meetings.wcpfc.int/file/19559/download)

## SasJpAquaculture
**Track C 1차출처 검증값:**
- 주장: 일본 참다랑어 완전양식 비중 시계열 (수산청/닛케이)
  - 검증값: 2024 완전양식(인공종묘) 출하 405t = 양식 전체의 2%; 전년(2023) 4%에서 반감, 최다였던 2020년 16% 대비 급감. 2024 양식 클로마구로 총 18,687t(+11%), 천연종묘 18,282t(+14%)·인공종묘 405t(-46%). 水産庁 속보 기준.
  - 판정: 원수치 정당
  - 인용: 日本経済新聞 '完全養殖クロマグロ、出荷量大幅減 養殖全体の2%に' 2025-03-25 (https://www.nikkei.com/article/DGXZQOUB251G10V20C25A3000000/); みなと新聞 '養殖マグロ24年出荷量11%増/人工種苗由来は減少傾向' 2025-03-24 (https://www.minato-yamaguchi.co.jp/minato/e-minato/articles/150831) — 둘 다 水産庁 양식 실적 속보 기반

## SasJpDistribution
**Track C 1차출처 검증값:**
- 주장: 일본 참치 유통의 도요레이조(東洋冷蔵/Toyo Reizo) 위상
  - 검증값: 東洋冷蔵(TOREI): 1971년 설립, 三菱商事 그룹 수산총합상사로 일본 국내 최대 수산회사. 사시미용 마구로 국내공급량 업계 톱클래스, 운반선·가공동결선·냉동창고·가공장·수송을 초저온으로 연결하는 밸류체인 보유. 클로마구로(흑참치) 취급고 업계 최대, 한때 점유율 약 50% 시기 존재(업계 통설).
  - 판정: 원수치 정당 — 東洋冷蔵(Toyo Reizo, TOREI)는 三菱商事 그룹 일본 최대 수산회사로 확인. 흑참치(클로마구로) 취급고 업계 최대, '한때 점유율 50%'라는 업계 통설 존재. 단 현행 정확한 점유율 %는 기업 공시 미공개(점유율 수치는 헷지 권장).
  - 인용: 三菱商事 공식 '東洋冷蔵 プロジェクト事例', https://www.mitsubishicorp.com/jp/ja/about/project/toyo-reizo/ / 東洋冷蔵株式会社 회사정보, https://www.toyoreizo.com/about/index.html

## SasJpImportYen
**Track C 1차출처 검증값:**
- 주장: 지중해 BFT 총량 / 蓄養
  - 검증값: 동대서양·지중해 BFT TAC(2024)=40,570t, 2024 실어획(yield)=39,426t; 2023–2025 TAC 40,570t, 2026–2028 48,403t. EU 蓄養 능력 2024년 27,900t(양식장 20개소)→2025년 51,143t(25개소). 일본向 ~80–90%(2차 보강).
  - 판정: 원수치 정당 (총량·蓄養은 ICCAT 1차 확인; 엔화 환산 단가는 본 아카이브 범위 외)
  - 인용: ICCAT SCRS, '13.6 BFT Executive Summary' ICCAT Report 2024-2025(I), as of 2025-09-26 (https://www.iccat.int/Documents/SCRS/ExecSum/BFT_E_ENG.pdf); ICCAT 'Report of the 2024 BFT Species Group Meeting' Sliema Malta 2024 (https://www.iccat.int/Documents/Meetings/Docs/2024/Reports/2024_BFT_ENG.pdf)

## SasKrByproduct
**재채점: C(71.5) — 잔존결함:**
- [P0 신규·재채점 누락] 파일 내부 자기모순: 라인9 주석 '살코기 ~40%' vs SIT(라인31)·차트푸터(라인37)·BAL데이터(라인14) '살코기 55%' — 동일 파일에서 살코기 비중이 ~40%와 55%로 15%p 충돌. 정직 재라벨이 사실 모순을 잔존시킴 → a4-통합·a3-검증 동시 훼손
- 혈액·자숙액 11%(라인18) 무출처 잔존 — 귀속만 제거됐을 뿐 11% 수치 자체는 1차출처 0
- byproduct=45%·product=55% edge-pick(라인14-18) — 주석 범위(50~55%·40~45%)와 차트 하드코딩 사이 긴장, 합100 강제 위해 상단값 의도 선택. SIT는 '1차 정량출처 미특정' 자인하면서 5막대 하드 split 렌더
- FAO·NIFS·KMI·동원 200톤(라인33) '실재·검증' 라벨이 특정 문서·연도·URL 없는 range/주장 수준 — in-file 1차출처 미뒷받침, 과대 라벨
- L-01 경미 잔존: value-recovery %·P&L·KPI·ESG·펩타이드 등 user-facing 약어 TermTooltip 미부착
**Track C 1차출처 검증값:**
- 주장: 세계 수산부산물 밸류업 시장규모(단일 글로벌 금액) 및 스트림별 구성비(머리/뼈/내장/적육/자숙액)
  - 검증값: [스트림 구성비 1차] 손숙경 외(2026) 한국수산과학회지 59(1):1-11, '참치(Katsuwonus pelamis) 통조림 가공공정 중 발생하는 생·자숙 부산물' — 가다랑어 3.5kg 기준 생내장 7.9% / 자숙머리 18.5% / 자숙꼬리 2.4% / 자숙중골 1.2% / 자숙혈합육(적육) 9.7%, 부산물 총 50-70%. [시장규모 1차] FAO SOFIA 2024: 2022년 전세계 수산동물 1.854억톤 중 11%(2,080만톤) 비식용, 그중 83%(1,700만톤) 어분·어유 환원, 어분 34%·어유 53%가 부산물 유래 — 그러나 '밸류업 시장규모(금액)' 단일 글로벌 1차 통계는 부재. [2차 교차값] MarketsandMarkets 'Fishery by-Products Market $37.46B by 2030', Fish Collagen $1.4B(2024), FPH $319-498M(2024) — 정의별 한 자릿수십억~370억 편차
  - 판정: 원수치 정당(헷지 유지 타당) — 시장규모는 1차 부재로 헤드라인 제거가 정당, 스트림 구성비는 KFAS 2026 논문이 직접 1차출처이나 위젯 도식과는 어종·집계기준 상이
  - 인용: 손숙경·이효림 외(2026), '참치(Katsuwonus pelamis) 통조림 가공공정 중 발생하는 생 및 자숙 부산물의 위생안전성 및 영양학적 품질 특성 평가', 한국수산과학회지 59(1), 1-11, DOI 10.5657/KFAS.2026.0001 (로컬 확보: agri_data/tuna/intelligence_reports) / FAO The State of World Fisheries and Aquaculture(SOFIA) 2024, Utilization & Processing, https://openknowledge.fao.org/.../sofia/2024/utilization-processing-fisheries-production.html / MarketsandMarkets Fishery By-Products Market, https://www.marketsandmarkets.com/PressReleases/fishery-by-products.asp

## SasKrDualRoute
**Track C 1차출처 검증값:**
- 주장: 영국의 태국산 캔참치(HS160414)에 적용되는 MFN(제3국) 세율 및 '20%p 핸디캡'
  - 검증값: UK Integrated Online Tariff(공식)상 1604 14(prepared/preserved tuna, 가다랑어·황다랑어·날개다랑어 loins 포함 전 소호)의 제3국(erga omnes) MFN 세율 = 20.00%. 태국은 UK Developing Countries Trading Scheme(DCTS, 2023-06-19 발효, 65개국 수혜) 수혜국이 아니며(상위중소득국으로 졸업) UK-태국 FTA도 없음 → 태국산 캔참치는 특혜 없이 20.00% 전액 부담. FTA·DCTS 수혜국(ACP·LDC 등 0%)과의 격차가 약 20%p로, '20%p 핸디캡' 서술과 정합. (역사적 EU MFN은 24%였고 UK가 20%로 반올림했다는 맥락 일치)
  - 판정: 원수치 정당 — 20%p 핸디캡 타당(공식 제3국 세율 20.00%, 태국 특혜 없음)
  - 인용: HM Revenue & Customs, UK Integrated Online Tariff, Heading 1604(subheading 1604 14), third-country duty 20.00%, https://www.trade-tariff.service.gov.uk/headings/1604 ; GOV.UK Developing Countries Trading Scheme(DCTS, 65 beneficiary countries, in force 19 June 2023), https://www.gov.uk/government/collections/trading-with-developing-nations ; The Trade Preference Scheme (DCTS) Regulations 2023, SI 2023/561, https://www.legislation.gov.uk/uksi/2023/561/contents/made (태국 미수록)

## SasKrFleetEconomics
**Track C 1차출처 검증값:**
- 주장: 한국 원양어선 해기사 중 50세 이상 비율 81%, 외국인 선원 원양 비율
  - 검증값: 2023년말 기준 원양어선 해기사 중 50세 이상 82.3%, 30세 미만 11.1%. 원양해기사 총 980명 중 약 100명(10%)이 해외 선사 취업. 외국인 해기사: 2024년 인도네시아 국적 1등 기관사 3명이 참치 연승선 3척에 첫 승선(2015 노사합의로 선박당 기관사 1명 제한).
  - 판정: 정정필요 — 50세+ 비율의 1차출처 수치는 82.3%(2023년말, 한국선원복지고용센터)로 81%보다 높음. 위젯의 81%는 약간 보수적이므로 82.3%로 상향 정정 권장. 외국인 '선원' 원양비율은 별도 1차통계 미확인(외국인 '해기사'는 2024년 첫 도입 단계).
  - 인용: 한국선원복지고용센터(한국경제 2024-09-11 인용), '베테랑 선장 해외로, 선원은 만성부족…해양식량 안보 흔들린다', https://www.hankyung.com/article/2024091130941 / 외국인 해기사 첫 승선: 한국해양수산신문 2024, https://www.koreancenter.or.kr/news/articleView.html?idxno=1316412

## SasPrAuctionDirect
**Track C 1차출처 검증값:**
- 주장: PNA 입어료 2016 정확치 (~$350M vs $450M)
  - 검증값: 2016년 PNA 회원국 총 입어료 USD 450M 초과 (Table 3: PNG 128.8M, FSM 63.2M USD; 6개국 정부세입의 28~98% 차지). 별개 보도는 '거의 500M'도 있으나 450M이 검증 가능한 하한치
  - 판정: 원수치 정당 ($450M 정당, $350M은 부정확)
  - 인용: Clark, Bell, Adams et al. (2021), 'The PNA Vessel Day Scheme', FAO Fisheries & Aquaculture Technical Paper 667, Ch.12 (원천 FFA 2018a,b) — https://www.pnatuna.com/sites/default/files/2022-01/Chapter%2012_0.pdf ; 교차확인: Asia & the Pacific Policy Studies (Wiley, 2025), 10.1002/app5.70042

## SasPrGradeBySpecies
**Track C 1차출처 검증값:**
- 주장: 오토로 지방비율 단일값
  - 검증값: 양식 남방참다랑어(T. maccoyii) 부위별 지방%: akami 5±2%, o-toro 20±5% — 평균±표준편차 범위이며 단일 고정값 아님. 종·양식여부·개체에 따라 변동. 발행 2008년이라 신선도 필터(2023+) 밖
  - 판정: 정정 필요 (단일값 부적절) + 신선도 헷지 유지 타당 (2008년 자료)
  - 인용: Balshaw et al. (2008), 'Mercury distribution in the muscular tissue of farmed southern bluefin tuna (Thunnus maccoyii) is inversely related to the lipid content of tissues', Food Chemistry 111:616-621 — https://www.sciencedirect.com/science/article/abs/pii/S0308814608004603

## SasPrGradeSystem
**Track C 1차출처 검증값:**
- 주장: 등급체계 1차문헌
  - 검증값: 다축 등급체계가 학술 1차로 뒷받침: (1) 신선도축 = K값(사시미<20% / 가열용<50%, 원전 Saito 1959·Guizani 2005, Kang 2020 Foods 9(10):1356); (2) 지방축 = akami/chu-toro/o-toro 분류(Balshaw 2008); (3) 지방→경매가 유의성(Ishihara 2018 Fisheries Research, PBF 150마리 log-normal GLM). 단 단일 정부고시 등급표는 없고 시장관행+동료심사 학술 결합 체계
  - 판정: 원수치 정당 (등급체계 1차문헌 충분)
  - 인용: Kang et al. (2020), Foods 9(10):1356 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7601904/ ; 'Influence of the fat content on the auction price of Pacific bluefin tuna', Fisheries Research (2018) — https://www.sciencedirect.com/science/article/abs/pii/S0165783618300754 ; Balshaw et al. (2008), Food Chemistry 111:616-621

## SasUsDemandSeasonality
**Track C 1차출처 검증값:**
- 주장: 미국 캔참치 1인당 소비 NFI 2.0lb 기준연도
  - 검증값: NFI Top 10(2023년 데이터, 2024년 발표): 캔참치 1인당 2.0 lbs(전년比 -0.20lb), 미국 소비 수산물 3위. 1위 새우 5.10lb, 2위 연어 3.51lb. 2023년 미국 전체 1인당 수산물 소비 19.1lb, Top10이 14.69lb(77%). 이전 연도(2019/2020)는 2.2lb였음 — 2.0lb는 2023년 기준.
  - 판정: 원수치 정당 — NFI Top 10 1차집계로 캔참치 2.0 lbs/인 확인. 기준연도는 2023년(2024년 발표). 전년 대비 0.20lb 감소, 미국 소비 3위(연어 3.51lb 2위, 새우 5.10lb 1위). 위젯의 2.0lb는 정당하며 기준연도를 2023년으로 명시 권장.
  - 인용: National Fisheries Institute(NFI) Top 10 list, SeafoodSource 보도 'Shrimp tops the U.S. National Fisheries Institute's top 10 list'(2024), https://www.seafoodsource.com/news/supply-trade/shrimp-tops-the-u-s-national-fisheries-institute-s-top-ten-list-of-most-consumed-species / NFI 공식 About Seafood Top 10, https://aboutseafood.com/education-resources/top-10-lists-for-seafood-consumption/

## SasUsImportBarriers
**Track C 1차출처 검증값:**
- 주장: FDA 수입거부(import refusal) post-2013 최신연도 데이터
  - 검증값: FDA Import Refusals Data Dashboard(OASIS 기반)가 수입거부를 product/country/division/fiscal year별로 주간 갱신하며 다운로드 데이터셋을 제공 — 이것이 post-2013 연도별 수치의 유일한 공식 1차. 단 api-datadashboard.fda.gov는 인증토큰 필요(RefusalDate 컬럼 호출 시 HTTP 401 Not Authorized), HTML 페이지는 403/리다이렉트로 정량값 직접 추출 불가. 정성적 사실은 확인됨: 수산물이 FDA 식품 수입거부 1위 카테고리(전체의 20%+), 주 사유는 부패·살모넬라·금지항생제(니트로푸란·클로람페니콜)·참치 등 등푸른생선 히스타민·HACCP 위반. SSA가 OASIS를 분석한 2024년 새우 항생제 거부 81건(2016년 이래 최고)은 post-2013 거부데이터가 실재·접근가능함을 방증. 정부 기간자료 USDA ERS EIB-151은 데이터 2005-2013·2016-03 발행이라 post-2013 요건과 T-3y 신선도 필터 모두 불충족(역사적 맥락으로만 분류). GAO-21-231(2021)은 warning letter 중심으로 연도별 refusal 카운트 미수록.
  - 판정: 여전히부분불명 — 공식 1차(FDA OASIS 대시보드)는 post-2013 연도별 데이터를 공개 운영하나 프로그램적·정량 추출은 인증 차단으로 막힘; 정확한 연도별 절대수치는 미확정
  - 인용: FDA Operations & Information Officer, Import Refusals Data Dashboard (OASIS), updated weekly by fiscal year/product/country, https://datadashboard.fda.gov/oii/cd/imprefusals.htm (API api-datadashboard.fda.gov는 인증 필요, 401). 역사적 비교용: USDA ERS, J.C. Buzby et al., 'FDA Refusals of Imported Food Products by Country and Category, 2005-2013,' EIB-151, March 2016, https://ers.usda.gov/sites/default/files/_laserfiche/publications/44066/57014_eib151.pdf (데이터 2005-13, post-2013 미포함)

## SasUsMarginWaterfall
**재채점: C(64.75) — 잔존결함:**
- [신규 발견·재채점 누락] '1.7~2.2배' 내부 산술 모순: situation은 '외식 메뉴가는 도매가의 1.7~2.2배'라 하나 위젯 자체 사다리값으로 외식 $28 / 도매 사쿠블록 $12 = 2.33배로 상한 2.2 초과. actionPlan은 같은 '1.7~2.2배'를 디스트리뷰터→외식 맥락으로 쓰나 $28/$17 = 1.65배로 하한 1.7도 미달. 즉 위젯이 스스로 제시한 다섯 숫자 어느 쌍으로도 '1.7~2.2배'를 재구성 불가 — 단순 출처부재보다 무거운 자기일관성 결함(P3급, a3·a4 하향 근거).
- [VALID, 재채점 정확] 수율 자기모순: situation은 '수율 45~60%'(L31), 같은 위젯 source 라인은 '키친코스트 스시 수율(46~55%)'(L33) — 위젯이 직접 인용한 출처 범위와 본문 클레임 범위 불일치(P3 잔존, grep 재현 확인).
- [VALID] a1 출처 권위: 5개 사다리값(2.5/8/12/17/28 $/kg) 전부 자체 추정. Tridge·Selina Wamucii·KitchenCost 문자열은 위젯 코드(L33)에만 존재하고 data/·public/data/ 어디에도 1차 무역통계로 부재 — 저신뢰 집계/스크랩형 포털 인용이며 Comtrade/Census/NMFS 1차통계 아님.
- [VALID] a3 검증불가·재현불가: LADDER(L13-19)는 STATIC 하드코딩 배열, fetch/API/URL/발행일 전무. 독자가 다섯 숫자 중 어느 것도 1차출처로 재구성 불가.
- [VALID] a2 신선도 표면적: syncDate '2026-06-05'는 신선한 sync 스탬프지만 기저 추정치(Tridge·Selina Wamucii 가격)에 발행일 부재로 3년 신선도 필터(T-3y) 적용·확인 불가.
- [경미] 디스트리뷰터 $17은 '소매 게시가 기준 근사'로 명시(L12·L31) — 도매 단계 단가를 소매 게시가 단일 추정으로 대체한 구조적 한계가 정정 후에도 잔존.

## SasUsTariffLadder
**Track C 1차출처 검증값:**
- 주장: 미국 상호관세 농산물예외(FR 2025-21203 / EO 14360)가 비통조림 참치(HS0302/0303/0304)에 적용되는지
  - 검증값: EO 14360(2025-11-14, FR 90 FR 54091, 발행 2025-11-25, 발효 2025-11-13)의 글로벌 면제 부속서(Sec.2 Annex I, PDF p4~44)에는 HTSUS 03류·16류 어류가 전혀 없음 → 비통조림 참치(0302/0303/0304)는 모든 국가 대상 글로벌 상호관세 면제에서 제외. 단 동 EO에 첨부된 별개 부속서 'Potential Tariff Adjustments for Aligned Partners'(EO 14346 부속서, PDF p45+)에는 0302.31.00·0302.32.00·0304.87.00('Frozen tuna fillets')·1604.14.40이 포함되나, 이는 글로벌 면제가 아니라 '상호무역협정을 체결한 trading partner에 한해 USTR·상무부 재량으로 면제 가능'한 조건부 목록(부속서 본문 명시: 'potentially eligible to be exempted ... as determined by the Secretary of Commerce and USTR for each trading partner that has concluded an agreement on reciprocal trade'). 따라서 HS0302/0303/0304가 자동·일률적으로 농산물예외 적용된다는 서술은 부정확.
  - 판정: 정정필요 — 글로벌 면제 아님, '협정체결국(Aligned Partners)' 조건부 목록에만 포함
  - 인용: Executive Office of the President, Executive Order 14360, 'Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products,' 90 FR 54091, Federal Register doc. 2025-21203, published 2025-11-25, effective 2025-11-13. Annex I(글로벌, 03/16류 부재) 및 EO 14346 'Aligned Partners' 부속서(0302.31.00/0302.32.00/0304.87.00/1604.14.40 조건부). URL: https://www.federalregister.gov/documents/2025/11/25/2025-21203/ ; GovInfo: https://www.govinfo.gov/app/details/FR-2025-11-25/2025-21203 (public-inspection PDF 직접 파싱으로 부속서별 HS코드 확인)
