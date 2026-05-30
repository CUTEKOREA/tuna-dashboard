# 수산물 P1/P2 신규 위젯 마스터 백로그 (2026-05-30)

> **출처**: 9개 commodity별 `artifacts/<commodity>_agri_enrichment_2026_05_30.md`(참치는 `value_chain_*_2026_05_29.md`)의 **신규 위젯 제안**을 단일 백로그로 통합·중복 병합.
> **선행 작업**: P0(허위 LIVE·환각 출처·사실오류) + API-route + P1 과장수식어 패스는 **배포 완료**. 본 문서는 **그 다음 단계 = 미적용 신규 위젯**만 다룸.
> **공통 원칙**: 전 위젯 1차 출처 실측 검증 통과분만 채택(환각 0건 재확인). telemetry는 실측 스냅샷 = `SYNCED`, 비연동 정적 = `STATIC`. **LIVE는 동적 fetch 라우트가 코드에 존재할 때만**(L-09).

---

## 0) 총괄 — 신규 위젯 채택 후보 (중복 병합 후)

| Commodity | 시그니처 | P1 신규(고가치·검증완료) | P2 신규(낮은 긴급도) | 합계 | 주요 1차 자산 |
|---|---|---:|---:|---:|---|
| 참치(tuna) | cyan→blue | 6 (P0 2 + P1 4) | ~11 | ~17 | FAO 어획2024·IOTC SC27·Atuna 30년·KCS·WCPFC Yearbook |
| 새우(shrimp) | emerald→teal | 4 | 4 | 8 | FAO dashboard·EUMOFA EFM2025·GSSI·SHAPHARI·ADB |
| 고등어(mackerel) | cyan→sky | — | ~18 | ~18 | KOSIS 어업동향·FAO·KMI 분기·EUMOFA MH·지자체 물가CSV |
| 명태(pollock) | cyan→sky | 6 | ~10 | ~16 | FAO FishStatJ·NIFS 기후북·2026 TAC·honest KCS 라우트 |
| 연어(salmon) | pink→rose | — | 16 | 16 | FAO 양식2024·KMI 2026Q1·EUMOFA MH·PTAT 밸류체인 |
| 오징어(squid) | purple→pink | — | 8 | 8 | KMI _152·FAO 가공·squid_climate·포클랜드 VU |
| 갈치(galchi) | emerald→teal | — | ~14 | ~14 | FAO LHT·USDA GAIN 2024·FAOSTAT FBS·CECAF·일본수입 |
| 주꾸미(jukkumi) | purple→pink | — | 11 | 11 | KCS HS·KMI 분기·SeaBOS·MarinTrust·제4차 자원관리(PDF) |
| 골뱅이(whelk) | amber→brown | — | 11 | 11 | KCS HS160559 XML·KMI 21분기·FAO Capture·GAIN(PDF) |
| **합계** | | **~22** | **~103** | **~125** | |

> 숫자는 "검증 통과·중복 병합 후" 권고 채택분. 일부는 S1·S5 양 Pillar 중복 제안을 1건으로 합친 결과라 보고서 원안 합계보다 적다.

**구현 순서 권고**: ① 참치·새우·명태 P1(검증완료·고가치) → ② 고등어·연어·갈치 대량 신규(데이터 풍부) → ③ 오징어·주꾸미·골뱅이(PDF→MD 선행 필요분 포함). 동일 패턴 5건↑은 L-07 Python 배치 적용.

---

## 1) 참치(tuna) — `value_chain` 보고서

> TunaDashboard value-chain 위젯 89개 vs agri_data/tuna 334파일. refresh 23 + 신규 18.

### P0/P1 신규 (검증완료)
| 신규 위젯 | Pillar | 근거 파일 | 핵심 수치 | tele |
|---|---|---|---|---|
| 5대 RFMO 자원상태 신호등 레이더 (F/FMSY·SB/SBMSY) | 원료수급 | `IOTC-2024-SC27-ES04_YFTE.md`(+IATTC/WCPFC/CCSBT) | YFT F/FMSY 0.75·SB/SBMSY 1.32 (Kobe green) | SYNCED |
| 방콕 SKJ 현물가 추적 (line) | 원료수급 | `Atuna price/skjbkk.csv` | 캔 원가 70~80% = 원어단가, 2026-05 $1,850 | SYNCED |
| 방콕항 reefer 주간 입항 (2026 18주) | 물류통관 | `REEFER SHIP MOVEMENT/2026/`(18 xlsx) | 캐너리 가동률 선행지표 (하역톤 '추정' 단서) | SYNCED |
| 한국 냉동(0303) vs 통조림(160414) 단가 갭 | 물류통관 | `extras/kcs/KCS_tuna_5y.csv` | 가공 내재화 입증 | SYNCED |
| EU 16개국 소매 3.8배 격차 (bar) | 판매수요 | `2026_Daily-online retail prices.csv` | 그리스 8.01·헝가리 6.53 vs 스웨덴 2.09 | SYNCED |
| 가공 패권 재편: 스페인↑ vs 한국 -57% (line) | 가공생산 | `9. 참치 가공 생산량 1976-2023.csv` | 스페인 516,777t(톤수 1위) vs 한국 163,288t | STATIC |

### P2 백로그 (파일 실재 확인, 저긴급)
부산물 R&D 100억 bar · 가공업 134개소(`tuna_processing_master_list_v2.csv`) · IUU 블랙리스트 · 혼획 폐기율(`IATTC_No-23-2025`) · 탄소 프록시(간접만) · 고등어 교차탄력성 · 소비 계절성(`Monthly_Consumption.csv`) · 트랜십먼트 옵저버 · SBT TAC · 세이셸 YFT-SKJ 스프레드 · reefer 하역 매트릭스

**갭**: 축양 데이터 2022 천장("2024" 라벨 금지). 미·일 수입은 UN Comtrade 추가수집 필요. 직접 탄소배출은 간접 프록시뿐(LIVE 주장 금지).

---

## 2) 새우(shrimp)

### P1 신규
| 신규 위젯 | Pillar | 근거 | 핵심 | tele |
|---|---|---|---|---|
| 역행하는 가공 고도화 (2010-2023) | S2 | `9. 새우 가공 CSV` | 가공 T-2 한계 | STATIC |
| 글로벌 가공 패권: 에콰도르 점유 (2023) | S2 | dashboard.json processed.top10 + 9.CSV | 에콰도르 1,280,852t | STATIC |
| EU 새우 수입단가·인플레 수요위축 | S4 | `EFM2025_EN.md` | 6.06 EUR/kg·per-capita 1.59 LWE | SYNCED |
| GSSI 인정 인증 스킴 거버넌스 | S5 | `GSSI 2025 MD` | 7스킴·64파트너 | STATIC |

### P2 신규
| 신규 위젯 | Pillar | 근거 | 비고 | tele |
|---|---|---|---|---|
| 부산물 가공 실측 (2023) | S2 | 9.CSV | | STATIC |
| ADB 무역원활화 지수 (2023) | S3 | `ADB Trade Facilitation 2024 MD` | | STATIC |
| EU 수입구조·다변화 / 미국 CVD 타임라인(인니) | S3 | EFM2025 / `ap5i_filtered.csv` | 관세율 미포함='조사단계 타임라인'으로 한정 | STATIC |
| 야생어획 정체 vs 양식 전환 | S5 | capture_vs_aqua.json | w01과 중복 → ESG 각도 차별화 시만 | STATIC |

**갭/제외**: `shrimp_global_megatrend.json`은 USD 아닌 **톤수** → '가치' 위젯 환각 위험(단위 '톤'으로만). `PinkSheet_Shrimp.csv`는 2024M08~ "1079" 플레이스홀더 손상 → 현재가 인용금지. Fishmeal 2025 MD 4중 인용 → 사료원가 위젯 1개로 통합.

---

## 3) 고등어(mackerel) — 신규 18건 (미활용 1차 자산 발굴)

> P1은 27건 refresh(별도). 아래는 P2 신규만. **중복 1건 주의**: S4 '소매 채널 스프레드'는 P1 `w_domestic_retail` refresh와 동일 CSV → 신규 분리 말고 refresh로 단일화.

**S1 원료수급 (4)**: 한국 고등어류 생산량·금액 6개년(KOSIS, 163,001→134,604t) · 자급률·수입의존도 장기(2023 70.2%) · 양식전환 경제성(0.01%·6.3배) · 노르웨이 한국향 물량·단가 분기(2026Q1)
**S2 가공생산 (5)**: 부산물 부위별 PUFA(KFAS) · EU 피쉬밀·어유 흐름(EUMOFA) · 국내 가공업체 매핑(서귀포 CSV, **EUC-KR→UTF-8 선행**) · EUMOFA 위판가 vs 가공 사다리(MH 1/2026) · 마늘추출물 히스타민 억제
**S3 물류통관 (6)**: FTA 분기 수입동향(냉동 97.7%) · 원산지 다변화(노르웨이→영국·칠레) · 노르웨이 단가 vs 국내 위판가 스프레드 · 해상운임-아프리카 수출마진 손익분기 레이더 · TRQ 한도·관세 시나리오(20,000t·MFN 10%) · 글로벌 수입국별 단가 벤치마크
**S4 판매수요 (3, 병합후)**: 국내 소매 채널 스프레드(지자체 물가, 마트-시장 2.4배) · 규격별 소매가 인플레(KAMIS) · 원산지 선택 결정요인(소비조사) · 수입 매입-판매 마진 모델
**S5 ESG (4)**: 한국 수입수산물 추적성 커버리지 갭(EJF 17→21종) · 대한국 수출 보건증명·시설등록 NTB 타임라인 · 북동대서양 ICES 2026 어획권고(174,357t) · 수산 보조금·지속가능 관리(OECD 2025)

**경로 정정**: 정책브리핑 실제 파일명 `…할당관세 확대 시행 - 정책브리핑.md.md`(이중 확장자).

---

## 4) 명태(pollock)

### P1 신규 (고가치·검증완료)
| 신규 위젯 | Pillar | 근거 | 핵심 | tele |
|---|---|---|---|---|
| 명태 월간 통관 실측 트래커(러 의존·CIF) | 물류통관 | `/api/pollock-kcs/route.ts`(month 모드) | honest 라우트 재호출, **LIVE 정당**(동적 status 바인딩) | LIVE |
| 명태 2026 TAC 매트릭스 — 미(베링) vs 러(극동) | 원료수급 | Seafoodnews + 유니언포씨 | 미 1.394mmt·러 ~200만t = 합 ~3.4mmt 상한 | SYNCED |
| 한국 냉동명태 수입단가 월별 + 원산지별 | 판매수요 | 2025 냉동명태 수입동향 MD×2 | 8월누계 1.06/kg(+9%)·러 97% | SYNCED |
| 글로벌 가공형태 변화 + 연육패권 + 명란 매트릭스 | 가공생산 | `9.명태가공`·`10.수리미` CSV | 연육 중국 76.7%(한국 frozen+prep 10,274t 기준 명기) | STATIC |
| 한국 표층수온 상승 & 명태 급감 (기후) | ESG | NIFS 기후 브리핑북 2025 | 동해 +2.04℃·연근해 151만→91만t | STATIC |
| EU 관세·ATQ 매트릭스 + HSK 10자리·SPS 게이트맵 | 물류통관 | ASMI/McKinley 관세분석 | 미 0~13.7%·러 ATQ 배제, **L-04 지원** | STATIC |

### P2 신규/보강
강제노동(Outlaw Ocean) · 베링해 혼획 하드캡 부결 · 어분·어유 부산물 전환율(25→39%) / 한국 명태 자급붕괴(0.8%) · 온난화 임계수온(부화 92%@7~11℃·13℃ 기형 42%) · 종묘 생존율 · 명란 A시즌 · 러시아 단가 사이클 · 글로벌 수리미 교역 · CPI 전가(117.57)

**수치 정정(적용 전 CSV Totals 재확정)**: w9 수리미 2010 = 1,367,367t(제안 1,802,242 오류) / 스페인 2023 = 23,855t / 한국 연육 정의 명기. MSC 프리미엄 절대값은 검증출처 없음 → 단일축 축소.

---

## 5) 연어(salmon) — 신규 16건 (P1 refresh 별도)

**S1 원료수급 (3)**: 노르웨이·페로 EU 수입단가(€8.41→€7.11) · 칠레 감산 vs 노르웨이 안정(복점 균열) · RAS 핵심변수(수온·광주기·백내장)
**S2 가공 (4)**: FAO 가공유형 전환 냉동 vs 조제(1990-2023) · EU 훈제 밸류체인 가격구조(FR, waterfall) · 가공 표준수율 사다리(어체→필렛 60%, funnel) · 부산물 가치화(어유·어분)
**S3 물류통관 (5)**: 한국 수입 HHI 다변화(2023=3336, w43과 역할분리) · 한-FTA 착지원가 시나리오('추정' 라벨) · 칠레 콜드체인 HS형태별 · 아시아 수입단가 벤치마크(한국 8.35 vs 일본 7.47) · 호르무즈·홍해 물류쇼크 타임라인
**S4 판매수요 (2)**: 노르웨이 vs 칠레 교차 수요탄력성 · EU 연어 대체재 가격 바스켓(대구·해덕·새이드)
**S5 ESG (3)**: 자연산 상업적 멸종 — 양식 의존도 99.97%(**w18과 통합 권고**) · 지속가능 사료 전환(FIFO 1.05→0.77) · 원산지별 ESG 리스크 스코어(radar)

**갭**: FAO 2024 컬럼 정상 populated이나 소국(아이슬란드·UK) 2024 셀 빈행 → 셀별 재확인. HHI는 S3 신규·S4 w43 공유 → 역할분리/단일화.

---

## 6) 오징어(squid) — 신규 8건 (16건 중 dedup 후)

| 신규 위젯 | Pillar | 근거 | 핵심 | tele |
|---|---|---|---|---|
| 한국 살오징어 자원 회복 시그널(2025반등·2026전망) | S1 | KMI `_152 보고서` | 883t(+158%)·2026어기 2.6~3.6배 | SYNCED |
| 수입 산지 다변화 — 페루 +47% vs 중국 -0.7% | S3 | `_152` L185 | | SYNCED |
| 수입 통관단가 23년 추이 $2,187→$3,223 | S3·S4 | `squid_korea_supply.json` | 자급률 95.7→35.6%(이미 일부 적용) | SYNCED |
| 포클랜드 Loligo(D. gahi) 자원평가 — 1만t 임계 | S1 | `Vessel Units…Falkland_106.md` | 바이오매스 2020~2024 연도정렬 보정필요 | STATIC |
| EU 두족류 첫 경매가 — 오징어 +7% (2025) | S4 | `MH 6 2025_final.md` | | SYNCED |
| 글로벌 가공유형 지도·어획→가공 수율·일본 디플레 | S2 | `9.가공 CSV`+Capture | | STATIC |
| 수입 루트 리드타임·IUU/ITQ 컴플라이언스 | S3 | origin_diversification·compliance_risk.json | **내부모델 → STATIC+"실측 미연동" 명기** | STATIC |
| 강제노동·DWF 지배·한국 면세유 탄소 | S5 | EJF_33·CCP_34·면세유현황 | | STATIC |

**병합 필수**: 양식불가 위젯 S1·S5 중복 → S5 1건으로(w11_no_aquaculture refresh로 통합). 내부모델 4종 LIVE/SYNCED 금지. 양식 17t = area 37 지중해·흑해 갑오징어(동중국해 오표기 수정).

---

## 7) 갈치(galchi) — 신규 ~14건 (LHT-only 스코프 통일 전제)

**S1**: 갈치 어획 50년 쇠퇴곡선(1990 103,997→2022 53,999t, -48%·양식 0) · 세계 LHT 중국 집중도(84.5%, **all-species 65% 아님**) · 양식 부재 100% 야생(S1·S5 병합)
**S2**: 한국 수산가공품 생산량·금액 7년(2023 1,208,452t/7.58조원) · 국내 가공 카테고리 구조(순위만, 절대값 추정금지) · 수산물 공급·이용 계정(표층어류, '캐리포워드 추정' 명시)
**S3**: 일본시장 한국산 3.9배 프리미엄($11.17 vs 中 $2.85) · 한국 수입 공급국 순위(중국 $1,296M·러 $1,090M) · 후쿠시마 SPS 통제(8개현) · 2026 물류 전망(KMI) · KORUS FTA TRQ
**S4**: 자급률 추이(2023 64.8%) · 피쉬플레이션 수요압박 · 대체단백 교차압력(육류 2.6% vs 수산 1.4%)
**S5**: 대체소싱처 자원건전성 서아프리카(CECAF, 데머설 9종 과잉어획)

**최우선 함정**: `FishStat_*_hairtail.csv` = 5종 혼재(LHT+SFS+CUT+BSF+TCW). **갈치=LHT-only 통일**. S3 제안 "India 16.2% 2위"는 비-갈치종 artifact → **갈치 위젯에 넣으면 환각** → 삭제. TAC 연도라벨 2021-2024(2020으로 1년 밀림 정정).

---

## 8) 주꾸미(jukkumi) — 신규 11건

| 신규 위젯 | Pillar | 근거 | 핵심·주의 | tele |
|---|---|---|---|---|
| 한국 두족류 어획 장기추세 1990~2022 | S1 | GlobalProduction_octopus(area61)+해수부 CSV | **EUC-KR 디코딩 후 확정** | composed |
| 한국 두족류 수입 단가·물량(KCS HS별) | S2/S3 | KCS CSV | 030752 2024=111,981t/$748M(제안 55,991은 ½오류) | SYNCED |
| FTA 체결국발 두족류 수입 분기추이 | S1/S3 | jukkumi_fta_quarterly.json | 베트남 71.0%·26Q1 6.57kt | SYNCED |
| 산지별 CIF 단가(베트남·태국·중국) | S3/S4 | fta_quarterly unitPrice | 베트남 5.8→6.5, 태국 6.9→7.8 | SYNCED |
| 통관 형태 구성 — 냉동 대 활·신선 | S3 | formMix2026Q1(냉동 86.5%) | 가공·물류 중복 → 1건 병합 | SYNCED |
| 수입 의존도 심화 | S3 | domesticProduction(2.2→1.6kt -24.7%) | | SYNCED |
| 일본 수출용 주꾸미 볶음 경쟁 포지션 | S2 | 일본 볶음 보고서 PDF | **PDF→MD 후 인용** | STATIC |
| 산란기 자원관리·금어기 압박도 | S1/S5 | 제4차 자원관리 + 시행계획 PDF | **PDF→MD 후 금어기 날짜 확정** | STATIC |
| 서아프리카 문어 자원·IUU 매트릭스 | S5 | SeaBOS_Brief3 PDF | (w29 적용분과 연계) | STATIC |
| 베트남 저인망 혼획률·인증 마크업 | S5 | MarinTrust Vung Tau FIP PDF | | STATIC |
| 황해 갯벌·산란장 리스크 | S5 | IUCN 황해생태계 2023 PDF | radar(정성) | STATIC |
| 수입 단가 환율 전가 지수 | S4 | KCS + ECOS_KRW_USD(연도별) | '가용 평균치' 명시 | SYNCED |

**함정**: 한국 OCT 어획은 **GlobalProduction(area61)** 사용(Capture는 거의 0). "양식 0톤" 거짓 → "상업양식 미상용화 + 문어 시범 ~5톤"으로 재기술.

---

## 9) 골뱅이(whelk) — 신규 11건

| 신규 위젯 | Pillar | 근거 | 핵심 | tele |
|---|---|---|---|---|
| 골뱅이 가공원물 투입량 YoY(HS160559) | S2 | kcs_HS160559 XML | 2024 6,215t/$58.5M, 단가 $9.41(+12.6%) | SYNCED |
| 가공형태별 무역 분해(160559 vs 160558) | S2 | KCS XML 2종 | 통조림(북해) vs 조제(중국 79%) | SYNCED |
| 원산지별 CIF 격차 — 대체재 탄력성 | S4 | KCS XML | 영국 $12.75 vs 세네갈 $4.73·중국 $6.37 | SYNCED |
| 조제골뱅이 국가별 수출 실측 | S4 | KCS XML | 미국 $3.87M(50.1%)·대미 -5.2% | SYNCED |
| 북해 단일해역 집중도(HHI) | S3 | KCS XML | 영+아일랜드 65.0%, 흑해 18→7.1% | SYNCED |
| HS코드 6종 통관 매트릭스 — 무역수지 | S3 | kcs_trade 6종×2년 | **'수출$76.6M·흑자$11.2M' 미검증 → 6종 재집계 후 게시** | SYNCED |
| 원물 수입단가 추이(영·아 분기) | S1 | whelk_fta_quarterly.json | 영국 $9.9→$11.8, 아일랜드 24% 프리미엄 | SYNCED |
| 수입 물량·금액 장기·회복(KMI 고둥) | S1/S4 | fta_quarterly | 2020 5.92→2024 3.30천t(-44%), 25H1 +17.6% | SYNCED |
| 북해 단일해역 의존 리스크(ESG) | S5 | fta_quarterly | 영국 76.0→84.7%(25H1) | SYNCED |
| 한국 골뱅이 어획 vs 글로벌(FAO) | S1 | FishStat_Capture_whelk | **한국 5위(러 9,229t>한 9,062t), 4위 아님** | STATIC |
| 한국 자원관리 TAC / NTB | S5 | GAIN KS2025-0046 PDF | 뿔고둥 TAC·조정관세 22~50%, **PDF 본문 인용 후** | STATIC |

**함정**: "한국 세계 4위" 사실오류(5위로 정정). FAO 종코드 7종(GAS/RPW/WHE/WHX/WJT/WKO/WKQ). 2025 수치는 KMI만(KCS XML은 2023·2024뿐).

---

## 10) 횡단 가이드 (구현 전 공통 체크)

1. **PDF→MD(R-04) 선행 필요분**: jukkumi 4건(일본볶음·제4차 자원관리·MarinTrust·IUCN) + whelk GAIN Table2 TAC. 변환 후 본문 직접 인용 → 게시.
2. **인코딩 변환 선행**: mackerel 서귀포 가공업체 CSV(EUC-KR), jukkumi 해수부 어업생산 CSV(EUC-KR) → UTF-8.
3. **수치 재확정 후 적용**: pollock w9/스페인2023, squid 포클랜드 연도정렬, whelk HS 6종 무역수지, salmon 소국 2024셀.
4. **스코프·정의 명기**: galchi LHT-only, pollock 연육 frozen vs frozen+prep, squid 내부모델 "실측 미연동", tuna 축양 2022 천장.
5. **중복 병합 원칙**: 동일 evidence가 2개 Pillar 신규로 중복 시 1건만(salmon w18, squid 양식불가, shrimp SHAPHARI/Fishmeal, jukkumi 통관형태).
6. **L-07 배치**: 신규 위젯도 동일 렌더 패턴 5건↑(예: KMI 분기 composed, KCS 단가 bar)은 Python 생성 스크립트로 일괄 주입.
7. **W-04 체크리스트**: 각 신규 위젯 머지 전 cardDesc·TelemetryBadge·SIT/TAK·한글 100%·단위 괄호·Pillar 귀속·로컬 빌드 7항목 통과.

> **다음 액션 후보**: 본 백로그를 commodity별 edit-spec(`widgetJson`)으로 전개 → `scripts/apply_seafood_p0.py` 동형 적용 스크립트로 주입 → 빌드 게이트 → 선별 배포. 멀티벤더 분업(Gemini=PDF→사실/카탈로그, Codex+Grok=교차검증, Claude=스펙·적용)은 P0 캠페인과 동일 토폴로지 재사용.
