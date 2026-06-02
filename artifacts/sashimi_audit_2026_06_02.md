# 사시미/스테이크 대시보드 위젯 신뢰도 감사 (4-Axis Forensic Audit)

- **대상**: https://leedonggun.co.kr/sashimi-steak — `SashimiSteakDashboard.tsx`, 9개 섹션 · 32개 위젯
- **일자**: 2026-06-02
- **방법**: O-04 4-Axis 결정론적 스코어링(Python) + 클레임 수준 멀티 에이전트 포렌식 교차검증(9섹션 병렬 → 의심건 적대적 재검증, 20 에이전트)
- **에이전트**: Claude Opus(오케스트레이터) + 워크플로우 서브에이전트 20 (review 9 + verify 11)

---

## 1. 종합 결과

| 지표 | 값 |
|---|---|
| 위젯 수 | 32 |
| **4-Axis 정련 평균** | **77.2점** |
| 등급 분포 | A=1 · B=24 · C=7 · D=0 |
| 포렌식 credibility 평균 | 72.8 |
| 출처 tier | primary=24 · secondary=3 · internal=5 · none=0 |
| Confirmed 이슈 | **2종 (위젯 4개)** |
| False alarm 차단 | 7건 |

**D등급(즉시정정) 위젯은 없음.** 전부 정직한 `STATIC` 라벨(허위 LIVE 없음 → L-09 위반 0건).

---

## 2. 4-Axis 점수 산식

| 축 | 의미 | 채점 | 이번 분포 |
|---|---|---|---|
| a1 출처신뢰도 | cardDesc/source의 1차 출처 (포렌식 tier로 정련) | primary 90 / secondary 75 / internal 60 / none 40 | 90(24)·75(3)·60(5) |
| a2 신선도 | syncDate 연도 | 2026→95 / 2025계열→75 / 2024계열→70 | 95(1)·75(21)·70(10) |
| a3 검증가능성 | TelemetryBadge 상태 | LIVE 95 / SYNCED 80 / **STATIC 55** / 동적 70 | **전부 55** |
| a4 통합완성도 | pillar+cardDesc≥30자+telemetry | 모두 100 / cardDesc<30 90 | 100(20)·90(12) |

> **avg = (a1+a2+a3+a4)/4**, ≥85 A · ≥75 B · ≥65 C · <65 D

**핵심**: a3가 32개 전부 55(STATIC)로 고정 → 단일 축이 전체 평균을 ~10점 누름. 이게 A등급(85+)을 구조적으로 막는 천장. 정직한 라벨이라 정정 대상은 아니나, **실시간 API 연동(KCS/Comtrade/KAMIS) 또는 SYNCED 승격이 점수 상승의 유일한 레버**.

---

## 3. 섹션별 스코어보드

| 섹션 | n | 4ax평균 | 등급 |
|---|---|---|---|
| 🎯 수출전략 | 2 | 80.0 | B B |
| 🇯🇵 일본 | 4 | 79.7 | **A** B B B |
| 🇬🇧🇹🇭 영국/태국 | 2 | 78.8 | B B |
| 🇪🇺 유럽 | 5 | 78.0 | B×5 |
| 🇰🇷 한국 | 6 | 77.3 | B×4 C×2 |
| 🔮 전망2030 | 1 | 76.2 | B |
| 🇺🇸 미국 | 5 | 75.7 | B×4 C×1 |
| 💰 가격/어종 | 3 | 75.4 | B×2 C×1 |
| 🌍 글로벌 | 4 | 74.4 | B×1 C×3 ⚠️ |

**최고**: 🇯🇵 SasToyosuAuction **A(85.0)** — 도요스 경매 + 유일한 2026 syncDate.
**최저 섹션**: 🌍 글로벌 — C 3개 + Confirmed 이슈 집중 ($908M 모순).

---

## 4. ⚠️ Confirmed 이슈 (적대적 재검증 통과 — 실제 정정 필요)

### 이슈 A — `$908M` vs `$841M` 동일지표 상충 (위젯 3개)
"2024 미국 비통조림 참치 수입액"이 대시보드 내에서 두 값으로 표기:
- **SasMarketKPIs** = **$841M** (US Census HS0302/0303/0304 시계열이 코드에 실재, 검증가능)
- **SasTriadDynamics · SasGlobalHotspots · SasFourCountryComparison** = **$908M** (출처 주석·scope 설명 없음)

→ 적대적 재검증 결과: $908M도 **실제 값**(`us_tuna_imports_by_partner_2024.csv` 전체 비통조림 HS 합계 $908.3M, agri_data 아카이브에 실존하나 L-08로 미커밋). 즉 **조작이 아니라 scope가 다른 두 값을 동일 라벨로 표기한 비일관성**.
**조치(EDIT)**: $841M(Census 협의 HS) vs $908M(전체 비통조림 HS)의 scope를 라벨에 명시하거나 한 값으로 정합화. 유령처럼 보이는 출처명을 실제 출처(UN Comtrade/CSV 경로)로 교체.

### 이슈 B — `SasHawaiiDomesticNiche` 단가 과대표기
- 호놀룰루 경매 **$12~14/lb**를 '기준 평균 단가'로 제시 + 5년 매끈한 추세선(12.5→14.2).
- 실제: NOAA·경매 데이터상 옐로핀/빅아이 **평균 ~$4/lb** (성수기 $4.5~8.5). $12~14는 **최상급 사시미 프리미엄 등급 상한**(빅아이 프리미엄 ~$12.5, 최고가 $22.4)에 해당.
- 출처("US NOAA / Honolulu Fish Auction")는 정당하나 그 출처가 뒷받침하는 건 ~$4/lb이지 $12~14 평균이 아님 → **등급 혼동에 의한 과대투영**.
**조치(EDIT)**: '평균'을 '프리미엄 등급 상한'으로 재라벨하거나 평균치(~$4/lb)로 정정. 정성 전략(오마카세·고급 레스토랑 타겟)은 타당 → 위젯 폐기는 불필요.

---

## 5. ✅ False Alarm 차단 7건 (멀티 에이전트 가치 입증)

1차 감사가 의심했으나 적대적 재검증에서 **근거 확인되어 무혐의** 처리 — Antigravity 단일 의존 시 발생할 오정정을 차단:
- **SasCoTreatmentImpact** $2.50/$4.50/lb → SeafoodSource("vitamin tuna") 보도 원문과 일치. FDA Import Alert 45-02 실존.
- **SasUsSupplierOrigin** "internal-contradiction" → CSV 직접 재계산 시 막대값·HS라인 KPI 모두 정확(집계 레벨 차이일 뿐).
- **SasUsSushiPokeMarket** → GMInsights·IBISWorld verbatim 확인($10.1B·$16.2B·42.1%·포케 3,108개점).
- **SasUkMarket** → Seafish £4.3B·MSC 54%·Grand View Outlook 모두 실측 일치.
- **SasJapanDemandDecline** 726K→359K→112K(2050) → Kawamoto 2026 Springer 논문(DOI 검증)이 직접 산출한 값.
- **SasGlobalOutlook2030** → Fortune Business Insights·GM Insights·WCPFC Yearbook으로 추적(라운딩 minor만).

---

## 6. 품질 개선 권고 (점수 ↑ 레버)

| 우선 | 대상 | 조치 | 기대효과 |
|---|---|---|---|
| **P0** | 이슈 A·B 위젯 4개 | scope 라벨 명시 / 단가 재라벨 | 클레임 신뢰도 정정, C레벨 오독 차단 |
| **P1** | cardDesc 제너릭 7개 (TriadDynamics·CoTreatment·Hedonic·Hawaii·Bluefin·DomesticRetail·SupplyChainSplit 등 "시장 동향"류) | cardDesc에 takeaway.source의 실제 출처 1줄 이식 (W-01) | a4 100 확정 + a1 토큰 인식 |
| **P1** | internal tier 5개 (FoodserviceD2C·TradeDecade·FourCountry·Hedonic·UsSupplierOrigin) | CSV→실제 출처기관(KCS/Comtrade) 명시 | a1 60→90, 등급 C→B |
| **P2** | 전 위젯 a3=55 천장 | 핵심 무역지표 위젯에 KCS/Comtrade 라이브 라우트 연동 또는 SYNCED 승격 | 평균 77→85+ (A 도달 경로) |

---

## 7. P0 정정 적용 결과 (2026-06-02 적용 완료)

Confirmed 이슈 2종 / 위젯 4개에 EDIT 적용 → L-03 빌드 게이트 통과(exit 0, 140/140 정적 페이지).

| 위젯 | 정정 내용 | 4ax 전 | 4ax 후 |
|---|---|---|---|
| SasTriadDynamics | `$908M`→`$841M`, 유령출처 `Sashimi Market Report 2025`→`US Census·UN Comtrade(HS0302-0304)/GLOBEFISH/MAFF` | C 70.0 | **B 77.5** |
| SasFourCountryComparison | `$908M`→`$841M`, 유령출처 `US_EU_KR_Japan_comparison.md`→`US Census/UN Comtrade, KCS, KMI, GLOBEFISH` | C 72.5 | **B 80.0** |
| SasGlobalHotspots | `$908M`→`$841M` (출처 GLOBEFISH·CSV 유지) | B 78.8 | B 78.8 |
| SasHawaiiDomesticNiche | `$12~14/lb`를 '경매 평균'→'사시미 최상급(#1)' 재라벨 + 전체평균 ~$4/lb(NOAA) 병기, 차트 시리즈명 '최상급(#1) 단가' | B 77.5 | B 77.5 |

- **대시보드 전체 평균 77.2 → 77.5**, 등급분포 A1·B24·C7 → **A1·B26·C5** (2개 C→B 상승).
- `$908M` 대시보드 내 잔존 0건, 유령 출처 0건 → 동일지표 상충·등급 과대표기 해소.
- 미적용: P1(cardDesc 제너릭 7개 출처 이식), P2(a3 STATIC 천장 — 라이브 연동/SYNCED 승격).

## 8. P1 cardDesc 정련 결과 (2026-06-02 적용 완료)

제너릭 플레이스홀더 cardDesc(`"사시미/스테이크 시장 동향"`) **11개 위젯**을 멀티 에이전트(11 병렬)로 각 위젯의 실제 출처+데이터에 grounding한 cardDesc로 교체(W-01). 영문 어종명은 L-01 한글화(Yellowfin→황다랑어 등).

| 위젯 | 새 cardDesc(요약) |
|---|---|
| SasTriadDynamics | US Census·UN Comtrade(HS0302-0304)·GLOBEFISH·MAFF — 미국 $841M·EU 축양·일본 -51% |
| SasCoTreatmentImpact | FDA Import Alert 45-02 — CO처리 베트남산 $2.50 vs 정상 황다랑어 $4.50/lb |
| SasBluefinRanchingEconomics | Eurostat·EUMOFA — 활어 €6.7/kg→축양→일본 €13.3/kg 마진 2배 |
| SasEuQuotaProduction | ICCAT 2024 — EU 참다랑어 21,503톤, 스페인·프랑스·이탈리아 93% 독점 |
| SasQuotaVolatility | ICCAT 2024 — 서대서양 1,341톤 vs EU 21,503톤 16배 양극화 |
| SasSashimiPriceLadder | US Census 2024 — 사쿠 $11·황다랑어 $13·참다랑어 $26+/kg 3단 |
| SasSupplyChainSplit | US Census 2024 — 냉동 사쿠 67% vs 생물 33% 이원 공급망 |
| SasTraceabilityRatings | Seafood Watch·NOAA SIMP — 참다랑어 'Red' 등급, EU CATCH 2026 |
| SasHawaiiDomesticNiche | NOAA 호놀룰루 경매 — 최상급 $12~14/lb·~3,500톤 |
| SasDomesticRetailTrend | EUMOFA 2024 — 가구 침투율 프랑스 9.0%·독일 1.2% |
| SasHedonicPriceFactors | 호놀룰루 hedonic 모델 — 눈다랑어 +$0.79·딥셋 +$0.62 |

- **a4(통합완성도) 90→100** (11개 위젯 cardDesc≥30자 충족) + 추출기 false-negative 교정(FDA·Thai Union 인식).
- **대시보드 평균 77.5 → 78.8**, 등급 A1·B26·C5 → **A1·B28·C3**.
- **잔존 C 3개**(SasKoreaFoodserviceD2C·SasKoreaTradeDecade·SasHedonicPriceFactors) — 1차 기관 출처가 실제로 없는 정직한 C. 추론·날조 없이 유지. 상향엔 P2(라이브 연동/SYNCED) 또는 실제 출처 확보 필요.

## 9. P2 라이브 연동 (a3 천장) 결과 (2026-06-02 적용 완료)

**원칙**: 무리한 STATIC→SYNCED 일괄 승격은 L-09/P0-2 함정(허위 라이브) → 거부. **실제 Census 출처로 뒷받침되는 위젯만 정직 연동**.

### 9.1 SasMarketKPIs → /api/us-census 정직 SYNCED 연동
- `scripts/fetch_us_census_data.js` HS 코드 확장(030232/34/35·030342/43/44/45·030487) + TIME_RANGE 2021-2025 → 라이브 Census 재페치 → `public/data/us_census_timeseries.json`(2.7MB) 갱신.
- `scripts/compute_sashimi_census.py`로 **지역그룹 제외 국가합산** 집계 → 2024 비통조림 참치 **$829M**(신선 $319M+냉동·필렛 $509M), 어종별 필렛 $474M·황다랑어 $173M·참다랑어 $140M·눈다랑어 $41M.
- SasMarketKPIs를 2021-2025 Census 실측으로 갱신 + `useEffect`로 `/api/us-census` 런타임 동기화 검증(Harness: 실패 시 내장 스냅샷 유지) + telemetry **STATIC→SYNCED**.
- **점수: 80.0(B) → 86.2(A)** (a3 55→80).

### 9.2 데이터 정합성 자기검증 (중요)
- 라이브 페치 초기 집계에서 "$1.29B(위젯 54% 과소)"로 오판 → **지역집계 그룹(PACIFIC RIM·USMCA·NATO 등) 중복합산 오류**였음. `TOTAL FOR ALL COUNTRIES` 라인 대조로 030487 = $474.1M(국가합산 $474.2M, 0.0%차) 검증 → **위젯 $841M은 정확**(국가합산 $829M≈). 권위값 $829M로 통일.
- 일관성: 서술형 3위젯(Triad·Hotspots·FourCountry) `$841M→$829M` 통일.

### 9.3 comtrade 가짜 라이브 수정 (L-09 신규 적발)
- `app/api/comtrade/route.ts`가 응답 미파싱하고 `isLive:true`/"실시간" 표기(`// for demo we just mark it live`) → **실제 파싱 구현 + 파싱 성공 시에만 isLive=true**, fallback은 정직 라벨. 소비처 0개라 UI 무위험.

### 9.4 잔존 C 3개 (정직 유지)
SasKoreaFoodserviceD2C·SasKoreaTradeDecade·SasHedonicPriceFactors — 1차 기관 출처 부재(자체 모델·franchise CSV). 라이브 소스 없어 STATIC 정직. 추론·날조 없이 유지.

### 단계별 점수 추이
| 단계 | 평균 | A | B | C | D |
|---|---|---|---|---|---|
| 초기 측정 | 77.0 | 1 | 24 | 7 | 0 |
| P0 정정 후 | 77.5 | 1 | 26 | 5 | 0 |
| P1 정련 후 | 78.8 | 1 | 28 | 3 | 0 |
| **P2 연동 후** | **79.0** | **2** | **27** | **3** | **0** |

## 산출물
- `artifacts/sashimi_4axis_scores.csv` — 최종 블렌디드 32행 (구조 4-Axis + 포렌식 tier/credibility/flags/issue/action)
- `artifacts/sashimi_widget_inventory.json` — 위젯 메타 인벤토리
- `artifacts/sashimi_forensic_raw.json` — 포렌식 워크플로우 원본 결과
- `scripts/extract_sashimi_widgets.py` · `scripts/merge_sashimi_audit.py` — 재현 스크립트
