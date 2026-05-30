The surimi trade Totals - Value row: 2021 = 1,953,648 ✓ and 2023 = 1,537,490 ✓ (proposal exact). The 2010 proposal value (1,028,085) differs from the Totals row (1,156,509) — the Totals here aggregates all flows. The proposal's 2010 ~1.028M is close enough to be the Exports-only flow; minor, the 2021/2023 anchors (the load-bearing -21% claim) verify exactly.

I now have enough verification across all five pillars. Verification summary:
- All 24 cited agri_data files exist (raw_data CSVs, intelligence_reports MD, route.ts, processed_data JSON).
- Capture/production figures (Russia/USA/Korea/Japan 2024), surimi 2023 totals & China/USA, file-9 product-level fillet/whole/roe declines, Korea 2019→2023 shift, NIFS climate, Russia & US 2026 TAC, EBS -30%, Aug-2025 import figures, surimi trade value 2021/2023 — all verify against source.
- Discrepancies to flag: surimi w9 2010 total (proposal 1.802M vs actual 1.367M), Spain 2023 (proposal 17,800 vs 23,855), Korea surimi 2023 (6,273 frozen-only vs 10,274 incl. preparations).
- ESG caveat (KMI 수입제도/EPING/MMPA/FTA체결국 absent) confirmed honest; freshness all ≥2023-05.

Now producing the final merged execution plan.

---

# 명태(Pollock) 5-Pillar 위젯 보완 — 최종 실행계획

**한줄요약:** agri_data 24개 인용 파일 전수 실재 확인(환각 0건). **Refresh 28건 + 신규 20건** 제안 중 검증 통과분을 P0/P1/P2로 병합 — 핵심 자산은 ① FAO FishStatJ 생산·어획·가공 풀세트(1950-2024, CC-BY-4.0, 접근 2026-03/2025-07), ② NIFS 기후 브리핑북 2025(동해 +2.04℃), ③ 2026 TAC 1차 고시(미 1.394 mmt·러 극동 ~200만 톤), ④ honest LIVE 라우트 `/api/pollock-kcs`(isLive 필드·fallback 키 보유). **최우선 과제는 허위 LIVE 라벨 12건 정정(L-09)** 과 영문 키 잔존(w17, L-01) 차단.

---

## P0 — 허위 LIVE 라벨·영문 잔존·플레이스홀더 (즉시 정정, 신뢰성 직격)

### `w1_global_catch` — 글로벌 명태 생산 규모
- 근거: `raw_data/1. 명태 생산량(전체) 1950-2024.csv` (FAO FishStatJ, 접근 2026-03-28, CC-BY-4.0) **[검증 OK]**
- 변경: telemetry LIVE→**SYNCED**(syncDate 2026-03). NOAA/FAOSTAT 실시간 fetch 코드 없음 확인 → 허위 LIVE 제거. data를 2024년까지 연장하고 국가값 실측 교체: 러시아 1,927,938 · 미국 1,425,044 · 일본 123,600 · 한국 28,999톤(전체 합계 3,573,446톤 — CSV Totals 검증 일치). cardDesc='FAO FishStatJ 글로벌 생산 1950-2024(접근 2026-03-28, CC-BY-4.0)'. 과장수식어 제거(P-03)
- 기대효과: 1980→2022 stale 시계열 2년 연장 + 소련/러시아 혼재 정정으로 Pillar I 신뢰도 회복
- Pillar: 원료 수급

### `w3_diverging` · `w31_catch_gap` · `w32_sst_fleet_matrix` — 어획 갭·조업 매트릭스
- 근거: `raw_data/2. 명태 생산량(어획량) 1950-2024.csv` **[OK]**; `intelligence_reports/러시아, 2026년 극동해역 명태 TAC 2% 늘려....md`(발행 2025-10-31) **[OK]**; `intelligence_reports/해양수산분야 기후변화 영향 브리핑 북 2025 - 국립수산과학원.md` **[OK]**
- 변경: 세 위젯 모두 isLiveApi=true이나 SST/GFW/NOAA fetch 코드 전무 → **w3·w31=SYNCED**, **w32=STATIC**. w3: 미국 어획 2020 1,465,338→2022 1,226,524→2024 1,425,044톤, 러시아 2020 1,827,317→2024 1,927,938톤 실측 교체(CSV 일치). w31: 러 2026 극동 TAC ~200만 톤(+2%)·실어획률 87~88%(갭 ~12%, ~24만 톤), 미 BS/AI/Bogoslof 1.394 mmt 병기. w32: '실시간' 표제 삭제→'기후 리스크' 재정의, NIFS 표층수온 +0.0278℃/yr(1968-2024, +1.58℃, 전지구 2배)·동해 +2.04℃ 반영
- 기대효과: 허위 LIVE 3건 일괄 정정 + 플레이스홀더(M-5…) 제거
- Pillar: 원료 수급

### `w13` · `w15` · `w16` · `w26` · `n5_rcep_detour` — 수입망·재수출·EU·콜드체인·RCEP
- 근거: `intelligence_reports/2025년 8월까지 냉동 명태 수입 동향.md` **[OK]**; `intelligence_reports/MH 6 2025_final.md`(EUMOFA No.6/2025) **[OK]**; `Comprehensive Analysis of Global Alaska Pollock Market Dynamics...(2024-2026).md` **[OK]**; `Comprehensive Strategic Analysis...Pollock Roe(Myeongran) Market...(2024-2026).md` **[OK, 곡선 아포스트로피 파일명 실재 확인]**
- 변경: 5건 모두 isLiveApi=true이나 전용 fetch 분기 부재(정적 5행) → **전부 STATIC**. w13: 러시아 75,540톤(97%)·미국 2,269톤·중국 141톤 실측(SIT '85%'→'97%' 정정, 본문 94.8%와 통일). w16/w26: 합성 '재고 지수/Reefer 지수' 삭제 → EUMOFA 1차 실측(EU 첫판매 2025 1~3월 477,771톤 -15%, 독일 -84%; 선박연료 2025-05 0.51~0.64 EUR/L). n5: 추정 라운드값 삭제 → 한중 FTA 삼각무역 서술
- 기대효과: 물류·통관 pillar 허위 LIVE 5건 일괄 정정(P0 핵심 밀집 구간)
- Pillar: 물류·통관

### `w27_substitute_spread` · `w33_arbitrage_tracker` · `w7_usa_russia_unitprice` — 대체재·차익·원산지 단가
- 근거: `Comprehensive Analysis of Korea Pollock and Roe Supply-Demand Dynamics...(2024-2026).md` **[OK]**; `Russian Alaska Pollock Prices Begin Seasonal Decline - Ocean Treasure.md` **[OK]**; `2025년 8월까지 냉동 명태 수입 동향.md` **[OK]**; `processed_data/pollock_premium_spread.json` **[OK]**
- 변경: KAMIS·KOSIS fetch 라우트 부재 확인(실재 명태 라우트는 `/api/pollock-kcs`뿐) → 허위 methodology 삭제, **w27·w7=SYNCED/STATIC**, **w33=통관단가 축만 `/api/pollock-kcs` 실연동 시 isLive 동적 LIVE 허용**. w7: 러 1.04·미 1.63·중 1.73 USD/kg(8월누계) 실측. w27: 러 도매 143 RUB/kg(+3.6%) vs 태평양대구 405 vs 대서양대구 490 RUB/kg 스프레드
- 기대효과: 판매·수요 허위 LIVE 2건 정정 + 합성 placeholder 주차(W1/W2…) 제거
- Pillar: 판매·수요

### `w17` — 한국 명태 가공 포트폴리오 (영문 키 잔존, L-01)
- 근거: `raw_data/9. 명태 가공 생산량 1976-2023.csv` (한국 행) **[OK, 영문 키 실재 확인: "Alaska pollock, dried, unsalted", "Alaska pollock, oil, nei"]**
- 변경: 영문 키 전면 한글화(건조 무염·어유는 한국 2019·2023 모두 0톤이므로 삭제). 2014 단년 스냅샷 → 2019 vs 2023 실측 비교: 냉동원물 17,617→18,121 · 필렛 11,749→12,285 · 다짐육 12→1,435 · 냉동알 4,500→5,557 · 절임알 4,667→3,981톤(**전 항목 CSV 검증 일치**). source·telemetry(STATIC/2026-05) 부착
- 기대효과: L-01 Zero-Tolerance 위반 해소 + 시계열 다각화 입증
- Pillar: 가공·생산

### `w30_traceability_risk` · `w23_upcycling_esg` · `n6_waste_to_wealth` — ESG 허위 LIVE·플레이스홀더
- 근거: `Eurofish Magazine 2 2026.md` **[OK]**; `Fishmeal and fish oil study_2025 Edition.md` (EUMOFA, IFFO) **[OK]**
- 변경: w30 isLiveApi 제거→**STATIC**(2026.02), 임의 '규제리스크지수' → FAO 식품사기 실측(글로벌 수산물 최대 20% 종 바꿔치기·라벨오기). w23: 단일행 placeholder(D-02 위반) → IFFO 부산물 유래 어분 비중 2010년 25%→2023년 39%(어유 54%), 가공 부산물 어체의 30~70%. n6: 임의 마진율 라인에 '추정' 라벨 명시 + EUMOFA 지역별 실측(2024 부산물 어분 ~190만 톤) 정박
- 기대효과: ESG 허위 LIVE 1건 + 플레이스홀더 2건 정정
- Pillar: ESG·지속가능성

---

## P1 — 신선 1차 실측 신규 위젯 (고가치, 검증 완료)

### [신규] 명태 월간 통관 실측 트래커 (러시아 의존도·CIF단가)
- 근거: `app/api/pollock-kcs/route.ts` **[OK — month 파라미터·isLive 필드·하드코딩 fallback 키(L-10)·inline regex parsing(L-11) 코드 확인]**
- 추가: 기존 honest 라우트를 month 모드로 재호출해 통관단가·러시아 비중 12개월 시계열 노출
- 기대효과: 분기 KMI 대비 1개월 선행 조달 신호. **telemetry = LIVE 정당**(동적 status:isLive?'LIVE':'STATIC' 바인딩 필수, L-09 준수)
- Pillar: 물류·통관

### [신규] 명태 2026 TAC 매트릭스 — 미국(베링해) vs 러시아(극동)
- 근거: `2026 Pollock TAC Steady...Seafoodnews.md`(미 1.394/1.375 mmt **[검증 OK]**) + 유니언포씨(러 ~200만 톤 +2% **[OK]**)
- 추가: composed 차트, 미·러 TAC 합계 ~3.4 mmt가 글로벌 공급 상한 고정. telemetry SYNCED(2026-05, 분기 수동 동기화)
- Pillar: 원료 수급

### [신규] 한국 냉동명태 평균 수입단가 월별 추이 + 원산지별 단가 비교
- 근거: `2025년 8월까지 냉동 명태 수입 동향.md` **[OK]**, `2025년 6월 냉동 명태 수입량 100% 급증.md` **[OK]**
- 추가: composed 2축(단가 USD/kg + 물량 톤). 8월누계 1.06/kg(+9%)·77,997톤(-11%); 러 97%(57,036톤 6월)·미 1.62·중 1.73. telemetry SYNCED(2025-09)
- Pillar: 판매·수요

### [신규] 글로벌 명태 가공형태 구성 변화 + 연육 패권 + 명란 매트릭스
- 근거: `raw_data/9. 명태 가공 생산량 1976-2023.csv` · `10. 수리미 가공 생산량 1976-2023.csv` **[OK]**
- 추가: ① 가공형태(냉동원물 833,140·필렛 204,552·다짐육 21,467·냉동알 24,558·절임알 13,783톤, 2013比 필렛 -41%·원물 -20% **[전부 CSV 검증 일치]**) ② 연육 중국 1,580,128톤(글로벌 2,060,311톤 대비 76.7% **[OK]**)·미 297,652 ③ 명란: 미 냉동알 19,001 · 일 절임알 9,802(-47%) · 러 냉동알 32,380→0톤 **[OK]**. telemetry STATIC(2026-05)
- 주의: **연육 한국값은 frozen-only 6,273톤이 아니라 frozen+preparations 합산 10,274톤** — 어느 하위품목 기준인지 cardDesc에 명기할 것(아래 갭 참조)
- Pillar: 가공·생산

### [신규] 한국 연근해 표층수온 상승 & 명태 급감 (탄소·기후)
- 근거: `해양수산분야 기후변화 영향 브리핑 북 2025 - 국립수산과학원.md` **[OK — 1.58℃·동해 2.04℃·서해 1.44℃·남해 1.27℃·연근해 151만→91만 톤·기초생산력 -21.6%·"명태 거의 어획 없음" 전수 검증]**
- 추가: composed, 한국 명태 자원 소멸의 1차 기후 원인을 정부기관 실측으로 입증. telemetry STATIC(정부 1차)
- Pillar: ESG·지속가능성 (w32 SST·w28 ESG프리미엄·k5 부화수온 13℃와 교차 각주)

### [신규] EU 관세·ATQ 매트릭스 + HSK 10자리 통관·SPS 게이트맵
- 근거: `Comparative Seafood Tariff Rates Analysis.md`(ASMI/McKinley, 2025-06) **[OK]**, `Comprehensive Analysis of Global Alaska Pollock Market Dynamics...md` **[OK]**
- 추가: EU 명태 필렛 관세 미 0~13.7%·러 13.7%, 러시아 ATQ 배제; HSK 8개 10자리 코드 + MFDS 방사능 100 Bq/kg. telemetry STATIC. **L-04(HSK 10자리) 직접 지원**
- Pillar: 물류·통관

---

## P2 — 시계열 보강·서사 강화 (낮은 긴급도)

### `w2_hegemony` · `w9_surimi_megatrend` · `w10_surimi_top3` · `w12_proc_vs_surimi` · `w_fta_pollock_form_mix`
- 근거: `raw_data/2,9,10` CSV **[OK]**
- 변경: source·telemetry 부착(STATIC/2026-05). w2: 2024 점유율 러 54.0%·미 39.9% 고정. w10: '미·러·일 삼극화'→'중국 단일 76.7% + 미·EU 추격'으로 프레임 정정(P-03). w12: 추정 2024(E) 행 삭제, 명태가공 1,113,747톤 vs 수리미 2,060,311톤(2023 마감) **[OK]**. w_fta: KMI 분기% × FAO 절대량 교차→SYNCED
- 주의: **w9의 2010 글로벌 수리미값(제안 1,802,242톤)은 오류** — CSV Totals 2010 = **1,367,367톤**. 궤적은 2000년 629,530 → 2010년 1,367,367 → 2020년 1,931,906 → 2023년 2,060,311톤으로 정정할 것
- Pillar: 가공·생산

### `w14` · `w28_esg_premium` · [신규] 강제노동·혼획·부산물 전환 위젯 3종
- 근거: `Unified Export Strategy...ASMI.md` **[OK]**, `Bering Sea Pollock catch for 2026_27...Alaska Fish News.md` **[OK]**, `Fishmeal and fish oil study_2025 Edition.md` **[OK]**, NIFS 브리핑북 **[OK]**
- 변경/추가: w14 MSC 시계열 2021→2023 연장(명란 $5,628/톤). w28 임의 SST지수→NIFS 실측(°C). 신규: 중국 강제노동(Outlaw Ocean 2023 인용) / 베링해 혼획 하드캡 부결+EBS -30% / 어분·어유 부산물 전환율(25%→39%). 전부 STATIC
- 주의: w14·w28의 MSC 프리미엄 절대값(미 3425→2895 등)은 검증 가능 출처 없음 — 단일축(SST 또는 ASMI 수출단가)으로 축소 권장
- Pillar: ESG·지속가능성

### [신규] 한국 명태 자급 붕괴 / 온난화 임계수온 / 종묘 생존율 / 명란 A시즌 / 러시아 단가 사이클 / 글로벌 수리미 교역 / CPI 전가
- 근거: `raw_data/2 CSV`(한국 28,999톤=글로벌 0.8% **[OK]**) · `KFAS_명태_연구_통합_로그.md`(부화율 92%@7~11℃, 13℃ 기형률 42%, EPA 자어 생존 32→74% **[파일 실재 OK, 수치는 통합로그 인용]**) · `2025년 12월...소비자물가동향.md`(CPI 117.57, 농축수산물 +4.1% **[OK]**) · `Russian Alaska Pollock Prices...Ocean Treasure.md`(러 2026 TAC 242만 톤 전체·도매 143 RUB/kg **[OK]**) · `raw_data/9. 수리미 수출입 1976-2023 .csv`(교역액 2021 1,953,648→2023 1,537,490 천USD **[검증 OK]**)
- Pillar: 원료 수급 / 판매·수요 (각 위젯별 단일 귀속)

---

## 주의·갭

1. **수치 오류 정정 필요(P2 반영)**: ① w9 글로벌 수리미 **2010년값** — 제안 1,802,242톤 vs CSV 실측 **1,367,367톤**(약 -24%). ② w10 **스페인 2023** — 제안 17,800톤 vs CSV **23,855톤**. ③ **프랑스 2023** — 제안 58,077 vs CSV **59,091톤**(경미). 적용 전 CSV Totals 행으로 재확정.

2. **한국 연육값 정의 모호**: 제안의 한국 수리미 2023 = 6,273톤은 `Fish minced(=surimi), frozen` 단독값. `Preparations of surimi` 포함 시 **10,274톤**. 신규 '연육 패권' 위젯 cardDesc에 "냉동연육 기준" 명시하고 점유율(0.3%) 산식 일관성 확보.

3. **검증 불가 출처(강등/축소)**: w14·w28의 MSC 프리미엄 절대단가, w28 MSC 프리미엄 시계열은 agri_data에 1차 근거 없음 → 단일축 축소 또는 '추정' 라벨 필수. **ESG 카탈로그 출처(KMI 수입제도·EPING·MMPA·FTA체결국 수입동향)는 agri_data/pollock 실재 0건 확인** → w37/w40/w_fta는 agri_data로 검증 불가, 본 계획은 실재 파일만 인용했고 해당 위젯은 별도 출처 보강 전까지 라벨 강등 유지.

4. **신선도 경계**: ASMI Unified Export Strategy·일부 가공통계 데이터 끝=2023(접근 2025-07)으로 ≥2023-05 충족하나 2024 확정연도 미반영 — FAO 차기 갱신 시 동기화. 항생제 잔류(자연산 어획)·동물복지(양식 미존재)는 명태 비해당 — ESG 범위에서 정당하게 제외.

5. **L-09 false-positive 주의**: 정정 시 `/api/pollock-kcs` 연동 위젯(월간 트래커·w33 통관축)은 동적 `status: isLive ? 'LIVE' : 'STATIC'` 바인딩이면 정직 LIVE로 유지 가능 — grep 단순 패턴으로 일괄 STATIC화하지 말 것(룰북 L-09 예외 조항).

6. **중복 병합**: NIFS 기후 실측(+2.04℃ 등)이 w32·w28·신규 '연근해 기후' 3곳에 중복 인용됨 → w32=조업 리스크, w28=ESG 프리미엄 맥락, 신규=자원 소멸 입증으로 **각도 분리**(같은 데이터·다른 takeaway). KFAS 통합로그도 k5·신규 '임계수온'·'종묘 생존율' 3곳 분산 — 부화수온/생존율/임계 리스크로 축 분리.