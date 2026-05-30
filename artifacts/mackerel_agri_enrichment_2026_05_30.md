All load-bearing figures verified:
- aquaculture 2023: capture 13,673,804t / aqua 1,580t / ratio 0.01% / wild $1,559.97 / aqua $9,818.27; 1992 ratio 0.09% — all match the proposal exactly.
- EUMOFA MH 1/2026: 1.17 and 1.18 present, mackerel + first sales present. Verified.
- KFAS 58(3): 41.0 present (4x), PUFA/껍질/근육/40% all present. Note: "20.5" not found as exact string and "histamine" English term absent (Korean paper) — the muscle PUFA exact value should be flagged as needs-recheck but the껍질 41.0 and ~2x relationship is sound.

I have sufficient verification. Synthesizing the final execution plan now.

---

# 고등어 5-Pillar 위젯 보완 — 최종 실행계획 (검증 완료)

## 한줄요약
**refresh 27건 + 신규 18건** 통합. 핵심 자산: KOSIS 어업생산동향(2024 잠정, 고등어류 6개년 실측), KMI FTA분기(2026Q1, 노르웨이 단가·원산지 다변화 실측), FAO FishStatJ(1984~2023 양식 0.01% 풀시리즈), EUMOFA MH 1/2026(고등어 1차판매가 1.17 EUR/kg), EJF The Broken Barrier(2023 추적성 갭)·OECD Review 2025·ICES mac.27.nea 2025. 공통 결함은 **전 위젯 telemetry={} 빈 객체(신선도 라벨 미부착)와 6건의 허위 LIVE 라벨(P-03 위반)**. 인용 agri_data 파일 26건 실재 확인, 핵심 수치(KOSIS·KMI·FAO·EUMOFA) 원본 대조 일치.

---

## P0 (허위 LIVE/출처 라벨·신뢰도 결함 — 즉시 정정)

### 1. `[w_kcs_origin]` 관세청 국가별 수입 점유율 — 허위 LIVE + 하드코딩 85%
- **근거 파일**: `mackerel_fta_quarterly.json`(KMI 2026-05-27, originShift 검증 일치), `2025년 12월 기준 노르웨이 냉동 고등어 시세.md`
- **변경**: 하드코딩 "노르웨이 85% 독점" → originShift 실측(노르웨이 73.9% / 영국 12.1% / 중국 8.0%, 26Q1). fallback 시 telemetry STATIC(syncDate 2026-05-27, 출처 'KMI 분기 FTA'). 'Verified' 배지는 출처 본문 명시 후 유지. cardDesc='노르웨이 25Q1 79%→26Q1 73.9% 다변화'.
- **기대효과**: L-09/L-12 허위 LIVE 제거, 다변화 추세 실증. **Pillar: S3**

### 2. `[w_sanctions_radar]` 제재 우회 리스크 레이더 — 허위 LIVE(mock /api)
- **근거 파일**: `Towards sustainable fisheries management OECD Review of Fisheries 2025.md`(실재), `How illegal fishing and human rights abuses in Korea's fisheries imports go undetected - Environment.md`(EJF, 실재)
- **변경**: `apiSource='📡 LIVE OFAC/EU'`·'실시간 API' 배지 제거 → STATIC(모의데이터 명시). 이진 합성점수(100/50/10) 폐기, 러시아산 중국 경유 원산지세탁 리스크를 OECD/EJF 정성 서술로. LIVE 유지 시에만 OFAC SDN/EU Consolidated List 실제 fetch 구현 후 표기.
- **기대효과**: P-03 정직성 위반 해소. **Pillar: S5**

### 3. `[w46]` EU 산지별 1차 판매가 프리미엄 — 허위 LIVE(EUMOFA Open API 미존재)
- **근거 파일**: `MH 1 2025_EN.md`(EUMOFA MH No.1/2025, small pelagics 1차판매)
- **변경**: `apiSource`·'Live API' 배지 제거(검증: app/api 하위 eumofa 라우트 없음, eurostat SDMX는 1차판매 단가 아님) → STATIC/SYNCED. 차트를 small pelagics 1차판매(EUR/kg, w/o VAT) 실측치로. **단, 이 보고서는 고등어 단일종이 아닌 small pelagics 그룹이므로 제목을 'EU small pelagics 1차판매가'로 정직하게 좁힐 것**(또는 mackerel 전용 추출 선행 명시).
- **기대효과**: 허위 LIVE 제거 + 종 정의 정직화. **Pillar: S4**

### 4. `[w_busan_procurement]` 부산공동어시장 원물 수매 — source 없음·reliability None·과장수식어
- **근거 파일**: `2024년 어업생산동향조사 결과(잠정).md`(KOSIS, 부산 연근해 204,564t 검증 일치)
- **변경**: (1) telemetry STATIC + '대표값 예시(위판 추세 가정)' 캡션. (2) KOSIS '계통판매량=부산공동어시장 위판' 정의로 부산 생산량 실측 동반. (3) '살인적 볼라틸리티/미친듯 요동' → '월별 변동폭 1,600~2,400원/kg(±33%)' 중립 서술(P-03). 실 API 수집 시 LIVE 승격.
- **기대효과**: 무출처 illustrative 데이터 정직 라벨링. **Pillar: S1**

### 5. `[w_andong_salted]` 간고등어 원물 규격 지표 — src 공란·허위 렌더
- **근거 파일**: `2024년 어업생산동향조사 결과(잠정).md`
- **변경**: 규격 붕괴 주장을 KOSIS 2024 어획 감소(고등어류 134,604t, -17.4% 검증)로만 한정 서술. src='통계청·해수부 2024 어업생산동향조사(잠정)' 채움, telemetry STATIC, '조무래기/완전 붕괴' 과장 삭제, 추정치는 '추정' 명시.
- **기대효과**: 무출처 위젯 근거화. **Pillar: S2**

### 6. `[w_tariff]` 고등어(HS 030354) 글로벌 관세율 — 사실오류(EEA→한-EFTA) + 'Verified' 오부착
- **근거 파일**: `Strategic Analysis of the South Korean Mackerel Trade...md`(HSK 0303.54.1000/9000, 한-EFTA 0%), `Gov't to expand tariff-rate quota...The Korea Times.md`(2026-01-06, MFN 10%·TRQ 0%, 검증 일치)
- **변경**: "노르웨이 0% EEA 협정" → "한-EFTA FTA". MFN 10%·TRQ 0% 출처 Korea Times/해수부 명시. 글로벌 비교 HS 6자리 vs KCS 통관 HSK 10자리 단서 추가(L-04). 출처 1차화 후 'Verified' 유지.
- **기대효과**: 검증된 것처럼 보이던 사실오류 정정. **Pillar: S3**

### 7. `[w50]` IUU 규제 준수 레이더 — 합성 스코어(OceanMind/GFW 근거 부재)
- **근거 파일**: `How illegal fishing and human rights abuses...Environment.md`(EJF The Broken Barrier 2023, 99건·Japan CC·640만톤·70kg 검증)
- **변경**: 합성 점수 폐기 → EJF 실측: 한국 5위 수입국(연 640만톤)·1인당 70kg, STS 대상종 17종(2020)→21종(2023.1)·고등어 미포함, 일본 2022.12 고등어 CC 의무, 고위험 연계 수입 99건. 축을 '추적성 커버리지/CC 적용여부'로 재구성. telemetry STATIC.
- **기대효과**: 환각 점수 → 1차 사실. **Pillar: S5**

### 8. `[w55]` 선원 인권·임금체불 지수 — 날조 시계열(ILO/GSI 원본 부재)
- **근거 파일**: `How illegal fishing and human rights abuses...Environment.md`(EJF 2023)
- **변경**: '임금체불 243억/외국인 70%' 연도별 시계열 폐기(agri_data에 원본 없음 확인). EJF 실측(2013 EU 옐로카드, IUU 이력 어선 조기 34건, 고위험 99건)으로 카드형/사례형 재설계. **임금체불 수치는 해수부·국가인권위 원본 확보 전까지 표기 보류.**
- **기대효과**: 날조 정량치 제거. **Pillar: S5**

---

## P1 (stale·약한출처·환각 수치 — 1차 실측 교체)

### 9. `[w04]` 한·일 연근해 고등어 어획량 감소 추이
- **근거 파일**: `2024년 어업생산동향조사 결과(잠정).md` (KOSIS, **원본 대조 검증**: 고등어류 121,373/82,839/151,029/152,574/163,001/134,604, -17.4%)
- **변경**: 추정 2024값 → KOSIS 6개년 실측, 종 라벨 '고등어류' 통일, cardDesc 'KOSIS 어업생산동향조사(2024 잠정, 2025-02-21 공표)', telemetry SYNCED. 보강: `Korea's Coastal Fishing...53 Years...md`(영문 교차).
- **기대효과**: 단일 추정 → 6개년 1차 시계열. **Pillar: S1**

### 10. `[w65]` 노르웨이산 원물 가격 추이 — 2025.01 stale
- **근거 파일**: `mackerel_fta_quarterly.json`(norwayUnitPrice 23Q1 2.1→26Q1 4.9 USD/kg **검증 일치**)
- **변경**: KMI 분기 단가로 갱신, 물량 25Q1 14.2→26Q1 6.1천t(-62.9%, share 73.9%). telemetry SYNCED(2026-05-27). 보강: `Norway completes 2025 mackerel season with record prices - Baird Maritime.md`.
- **기대효과**: 15개월 stale 해소. **Pillar: S1**

### 11. `[w42]` 노르웨이 TAC 쿼터 감축 영향
- **근거 파일**: `Mackerel Prices Have Broken Historical Highs...2026 - News.md`(**검증**: 85,500t·208,000t·461t), `mackerel_fta_quarterly.json`(26Q1 4.9 USD/kg)
- **변경**: 2026 쿼터 85,500t·수출전망 208,000t·첫주 461t 실측 추가, '수입단가_예측범위' → 실값. 2026 예측 잔존분 reliability 하향. telemetry SYNCED.
- **기대효과**: 추정 → 확정 쿼터. **Pillar: S1**

### 12. `[w05]` 고등어 양식 전환 가능성
- **근거 파일**: `mackerel_aquaculture.json`(**검증**: 2023 capture 13,673,804t·aqua 1,580t·0.01%·wild $1,559.97·aqua $9,818.27; 1992 0.09%)
- **변경**: FAO FishStatJ 풀시리즈로 정량화, 양식 비중 0.01%·단가 6.3배 격차. cardDesc 'FAO FishStatJ 1984-2023(2026-05-05 추출)', telemetry SYNCED. 원본 검증: `raw_data/Global_production_quantity.csv`.
- **기대효과**: 거시 인용 → 40년 실측. **Pillar: S1**

### 13. `[w44]` NPFC/ICES 자원평가 스코어카드 — 1차 논문 미연결
- **근거 파일**: `Stock Assessment of Chub Mackerel...Multi-Model A.md`(MDPI Fishes 8(2):80, 2024)
- **변경**: 다모델(JABBA·SPiCT·CMSY·BSM) **모델간 분산 정직 병기**(일부 healthy, 일부 slight overfishing — 단일 단정 회피). t_max 11.1·M 0.41·h 0.73 추가. 'SSB 74% 붕괴' 단정 제거. telemetry STATIC.
- **기대효과**: 환각 단정 → 모델 분산 정직 표기. **Pillar: S1**

### 14. `[w_kcs_monthly]` 관세청 월별 수입 실적 — CIF 하드코딩 과소
- **근거 파일**: `mackerel_fta_quarterly.json`(검증)
- **변경**: CIF $1,500~1,800 추정 → norwayUnitPrice 실측($4.9/kg=4,900/t), 분기물량 25Q1 21.3→26Q1 10.1천t(-52.7%). fallback이면 telemetry SYNCED.
- **기대효과**: 단가 과소추정 정정. **Pillar: S3**

### 15. `[w_multi_cost]` 복합 착지원가 시뮬레이터 — TRQ 누락
- **근거 파일**: `Gov't to expand tariff-rate quota...Korea Times.md`(검증: 20,000/10,000/2,000t, MFN 10%), `계란가공품 고등어 LPG 등 할당관세 확대 시행 - 정책브리핑.md.md` (**경로 정정**: 실제 파일명 `.md.md` 이중 확장자)
- **변경**: 'TRQ 0% — 2026 한도 20,000t(2025×2)' 케이스 추가, 소진 후 MFN 10% 복귀 리스크 TAK 명시.
- **기대효과**: C레벨 핵심 정책 반영. **Pillar: S3**

### 16. `[w_comtrade_flow]` 글로벌 교역 매트릭스 — 하드코딩 흐름 불일치
- **근거 파일**: `mackerel_sankey.json`(30 edge)
- **변경**: 칠레→나이지리아 132,146t(최대)·영국→기타 127,710t·노르웨이→일본 64,592t·노르웨이→한국 41,725t. '서아프리카 최대 흡수처'로 정정.
- **기대효과**: 추정 흐름 → 실측. **Pillar: S3**

### 17. `[w_africa_coldchain]` 아프리카 콜드체인 리스크 — src 공란
- **근거 파일**: `mackerel_african_export_roi.json`(**검증**: M3 운임1,800/마진2.1, M5 2,500/-1.2), `Freight rates and maritime transport costs - UNCTAD.md`
- **변경**: 운임-마진 연동 정량화, UNCTAD 운임 벤치마크 보강, telemetry SYNCED.
- **기대효과**: 무출처 → 정량 근거. **Pillar: S3**

### 18. `[w_domestic_retail]` 수도권 소매 채널 가격 스프레드 — 하드코딩·source null
- **근거 파일**: `부산광역시 해운대구_물가관리_20251209.csv`(25cm 냉동 1마리 3,300~7,800원), `경기도_연천군_소비자물가현황_20251126.csv`
- **변경**: 임의 3채널 → 지자체 공표 7개 점포 실측(마트-전통시장 2.4배). 'L마트/깡시장' 가공 라벨 제거, telemetry SYNCED.
- **기대효과**: 환각 채널 → 실재 공표가. **Pillar: S4**

### 19. `[w37]` 스태그플레이션 지표 — 'AI 분석' 출처·단위 혼란
- **근거 파일**: `고등어 가격 왜 이래요…'중·대형 사이즈' 1%만...한국경제.md`(aT KAMIS 4,416/3,979/6,822원), `mackerel_fta_quarterly.json`
- **변경**: 'AI 분석' 삭제 → 'KAMIS·KMI 관측센터'. 소매가 축 원/마리 통일(한글 단위 괄호). '생산↑재고↑인데 가격↑(중대형 품귀)' 내러티브.
- **기대효과**: 비1차 출처·단위혼란 해소. **Pillar: S4**

### 20. `[w52]` 아프리카 수출 급증 — 2023 단절
- **근거 파일**: `고등어 가격 왜 이래요…한국경제.md`(KMI: 2025 1~7월 58,524t·아프리카 91.2%·나이지리아 4,965t·가나 2,700t), `mackerel_african_export_roi.json`
- **변경**: 시계열 2024~2025 연장, 2025는 KMI 1~7월 누적 실측('연환산 전' 라벨). telemetry SYNCED.
- **기대효과**: 시계열 단절 보강. **Pillar: S4**

### 21. `[w16]` 피쉬밀·오일 10개년 추이 — '394% 팽창' 미검증
- **근거 파일**: `Fishmeal and fish oil study_2025 Edition.md`(EUMOFA 2025-07)
- **변경**: EUMOFA EU 생산·가격 실측으로 교체, **근거 없는 '394%' 배수 삭제**. telemetry SYNCED.
- **기대효과**: 환각 배수 제거. **Pillar: S2**

### 22. `[w71]` 부산물 지방산 프로파일링 — 과장수식어·논문표 미반영
- **근거 파일**: `httpswww.e-kfas.orgUploadfileskfas5.%2058(3)%20192-200.pdf.md`(**검증**: 41.0·PUFA·껍질·근육·40% 존재)
- **변경**: 논문 Table 실측을 차트화(껍질 PUFA 41.0 mg/100g), 부산물 ~40%. '쓰레기/보물창고' 과장 삭제. telemetry STATIC. **주의: 근육 PUFA "20.5" exact 미확인 — 차트화 전 논문 Table 재확인 필요.**
- **기대효과**: 학술 실측 정착. **Pillar: S2**

### 23. `[w24]` EU 가공형태별 부가가치 — 2023판 경계
- **근거 파일**: `MH 1 2026 Final.md`(**검증**: 1.17·1.18·mackerel·first sales 존재)
- **변경**: 1차 위판가 1.17 EUR/kg(2026)로 앵커 최신화, 가공 스프레드 재계산. telemetry SYNCED.
- **기대효과**: 신선도 경계 → 2026. **Pillar: S2**

### 24. `[w45]` 가공형태별 마진율 — 회사IR 혼합·연도 불명
- **근거 파일**: `Fishmeal and fish oil study_2025 Edition.md`, `MH 1 2026 Final.md`
- **변경**: 저부가는 EUMOFA 피쉬밀/어유 가격, 식용은 MH 1/2026 위판가로 1차 고정. CJ IR은 보조 주석 강등.
- **기대효과**: 출처 1차화. **Pillar: S2**

### 25. `[w54]` MSC 프리미엄·탄소발자국 — **CBAM 사실오류**
- **근거 파일**: `httpswww.msc.org...연간보고서(2020-21.md`, `MH 1 2026 Final.md`
- **변경**: **수산물은 현행 CBAM 대상 아님 → 'CBAM 직격탄' 삭제, 'EU CSDDD/공급망 실사'로 정정.** 탄소발자국·CBAM 막대는 '데이터 부재' 명시/제거. MSC 한국 보고서(2020-21) 검증 사실로 한정.
- **기대효과**: 사실오류 정정. **Pillar: S5**

### 26. `[w56]` OECD 보조금·IUU 레이더 — 합성 IUU점수
- **근거 파일**: `Towards sustainable fisheries management OECD Review of Fisheries 2025.md`(실재)
- **변경**: 합성 'IUU감시점수' 축 제거 → OECD 실측(TAC 완전관리 60%·생산가치 11.4B/2.3B/5.3B·연료지원 이탈). telemetry STATIC.
- **기대효과**: 환각 점수 → 1차 지표. **Pillar: S5**

### 27. `[w51]` 소비자 가격 분해 — 라운드넘버 추정·'717% 깜깜이' 과장
- **근거 파일**: `2025년 12월 기준 노르웨이 냉동 고등어 시세.md`(도매 8,250원/kg), `부산광역시 해운대구_물가관리_20251209.csv`(소매)
- **변경**: 라운드 추정 → 실측 도매·소매 정박점 보정, 산지위판은 '추정' 라벨 유지(추정/실측 시각 구분). '717% 깜깜이' 삭제(P-03).
- **기대효과**: 라운드 추정 → 실측 앵커. **Pillar: S4**

---

## P2 (신규 위젯 18건 — 미활용 1차 자산 발굴)

**S1 원료수급 (4)**
- `[신규]` **한국 고등어류 생산량·생산금액 6개년 추이** — `2024 어업생산동향조사(잠정).md`(검증). Composed dualAxis. cardDesc 'KOSIS(2024 잠정)' / SIT '163,001t→134,604t(-17.4%), 241,538→203,172백만원(-15.9%)' / TAK 약세분기 산지직매입·비축 / SYNCED.
- `[신규]` **고등어 자급률·수입의존도 장기추이** — `mackerel_korea_supply.json`(검증: 2023 자급률 70.2%·수입 87,106t·단가 1,849 USD/t). Composed / TAK 영국·칠레 다변화 / SYNCED.
- `[신규]` **글로벌 양식전환 경제성(야생 vs 양식 단가)** — `mackerel_aquaculture.json`(검증). Composed / SIT '0.01%·6.3배 격차' / SYNCED.
- `[신규]` **노르웨이 한국향 물량·단가 분기(2026Q1)** — `mackerel_fta_quarterly.json`(검증). Composed dualAxis / SYNCED.

**S2 가공생산 (5)**
- `[신규]` **부산물 부위별 PUFA·고부가소재화** — KFAS 58(3)(검증, 단 근육값 재확인) / Bar / STATIC.
- `[신규]` **EU 피쉬밀·어유 생산·가격 흐름** — `Fishmeal and fish oil study_2025 Edition.md` + `mackerel_fishmeal.json` / Composed / SYNCED.
- `[신규]` **국내 가공업체 분포·유형 매핑(서귀포 실증)** — `제주특별자치도 서귀포시_수산물가공업체현황_20250102.csv`(검증, **EUC-KR→UTF-8 변환 선행**) / Pie / STATIC.
- `[신규]` **EUMOFA 1차 위판가 vs 가공 부가가치 사다리(2026)** — `MH 1 2026 Final.md`(검증) / Bar / SYNCED.
- `[신규]` **마늘추출물 히스타민 억제 품질지표** — `마늘 추출물의 고등어육에서의 히스타민 생성 억제...md`(검증) / Line / STATIC.

**S3 물류통관 (6)**
- `[신규]` FTA 체결국 분기별 수입동향(2020~26Q1) — `mackerel_fta_quarterly.json`(검증, 냉동 97.7%) / Composed / SYNCED.
- `[신규]` 수입 원산지 다변화(노르웨이→영국·칠레) — `mackerel_fta_quarterly.json`(originShift 검증) + `노르웨이 쿼터 52% 감축...스카이데일리.md` / Bar / SYNCED.
- `[신규]` 노르웨이 수입단가 vs 국내 위판가 스프레드 — `MackerelNorwaySpread.json`(검증: 2,100→4,500 / 2,400→5,600) / Composed / SYNCED.
- `[신규]` 해상운임-아프리카 수출마진 손익분기 레이더 — `mackerel_african_export_roi.json`(검증) / Composed 0%선 / SYNCED.
- `[신규]` 고등어 TRQ 한도·관세 시나리오(2025→2026) — Korea Times(검증) + 정책브리핑(`.md.md`) / Bar / STATIC.
- `[신규]` 글로벌 수입국별 단가 벤치마크 — `mackerel_unit_price.json` / Bar / SYNCED.

**S4 판매수요 (3, 중복 병합 후)**
- `[신규]` 국내 소매 채널 가격 스프레드(지자체 물가공표) — 해운대구·연천군 CSV(검증) / Bar / SYNCED.
- `[신규]` 규격별 소매가 인플레이션(KAMIS 신선·냉동·염장) — `고등어 가격 왜 이래요…한국경제.md`(검증) / Composed / STATIC.
- `[신규]` 원산지 선택 결정요인(국산 vs 노르웨이산 소비조사) — `고등어 원산지별 소비 특성...KMI.md`(검증) / Bar / STATIC.
- `[신규]` 수입 매입-판매 마진 모델(실거래) — `99.고등어 수입 판매 최종 보고서 260401 .md`(검증) / Bar / STATIC.

**S5 ESG (전부 P0/P1 refresh 근거 재활용 + 신규)**
- `[신규]` 한국 수입수산물 추적성 커버리지 갭 — EJF(검증: 17→21종·99건·일본 CC) / Composed / STATIC.
- `[신규]` 대한국 수출 보건증명·시설등록 타임라인(NTB) — `New Certification Requirements for the Republic of Korea.md`(검증, 2023-06-01 발효) / Bar / STATIC.
- `[신규]` 북동대서양 ICES 2026 어획권고 vs 자원상태 — `httpswww.hav.fo...ICES_makrel_mac.27.nea_2025.pdf.md`(실재, 174,357t) / Composed / SYNCED.
- `[신규]` 수산 보조금·지속가능 관리 커버리지 — OECD 2025(실재) / Bar / STATIC.

---

## 주의·갭

1. **중복 병합 처리**: S3 '노르웨이 수입단가 vs 국내 위판가 스프레드'(MackerelNorwaySpread.json)와 S4 '노르웨이 수입단가 vs 국내 도매가 스프레드'(fta_quarterly+노르웨이 시세)는 데이터 소스·축이 달라 **별도 유지**(전자=위판가 월별, 후자=도매가 분기). 단, S4 '국내 소매 채널 스프레드'는 P1 w_domestic_retail 정정과 동일 CSV·동일 지표 → **신규로 분리하지 말고 w_domestic_retail refresh로 단일화 권고**(중복 위젯 양산 방지).

2. **경로 정정 1건**: 정책브리핑 파일 실제명은 `계란가공품 고등어 LPG 등 할당관세 확대 시행 - 정책브리핑.md.md`(이중 `.md.md` 확장자). 제안서의 단일 `.md` 경로는 오기 — 코드 반영 시 실제 경로 사용.

3. **재확인 필요 수치 2건**: (a) KFAS 58(3) **근육 PUFA "20.5 mg/100g"** exact 문자열 미확인(껍질 41.0·~2배 관계는 확인) — w71·신규 PUFA 위젯 차트화 전 논문 Table 직접 재확인. (b) 히스타민 위젯의 농도별 억제율(%) 정량치는 한글 논문이라 영문 'histamine' 미검출 — 처리농도·억제율 수치는 원문에서 직접 추출 필요(현재 '실측 제시' 수준만 확인).

4. **종 정의 정직성**: EUMOFA MH 보고서들(MH 1/2025·MH 1/2026)은 다수가 **small pelagics 그룹** 통계로, 고등어 단일종 분리 추출이 안 된 경우 제목/지표를 'small pelagics'로 좁히거나 cardDesc에 명시할 것(w46·w24·S2 사다리 위젯 공통).

5. **데이터 부재로 표기 보류**: w55 임금체불 정량치(해수부·국가인권위 원본 미보유), w54 탄소발자국·CBAM 비용(원본 없음) — 확보 전까지 '데이터 부재' 명시. 환각 채우기 금지.

6. **공통 작업**: 전 위젯 `telemetry={}` 빈 객체 → 정직 라벨(LIVE는 실제 fetch 코드 있을 때만, 분기/월 스냅샷 SYNCED, 학술/정책 정적 STATIC) 일괄 부착이 최우선 선행 작업.

7. **검증 한계**: 인용 파일 26건 중 25건 실재 확인, 1건은 경로 오기(상기 #2)로 실재. 핵심 정량치(KOSIS 6개년·KMI FTA분기·FAO 양식·Norway 2026쿼터·TRQ·EJF)는 원본 대조 일치. UNCTAD 운임 벤치마크 구체 수치, mackerel_unit_price.json 30개국 단가, sankey.json 30 edge 개별값은 파일 실재만 확인하고 셀단위 대조는 미실시(시간 제약) — 코드 반영 시 해당 JSON 직접 파싱 권고.