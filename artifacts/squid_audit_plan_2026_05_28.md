# 오징어 페이지 위젯 신뢰도·유효성 감사 — 기획서

> **작성:** 2026-05-28 Claude Code
> **타겟:** [https://leedonggun.co.kr/squid](https://leedonggun.co.kr/squid) ← `SquidDashboard.tsx`
> **사용 skill:** [/widget-audit](file:///Users/idong-geon/.claude/skills/widget-audit/SKILL.md)
> **선행 사례:** 참치 120→117 (17건 정정) / 고등어 103건 유지 (11건 정정)

---

## 1. 사전 파악

### 1.1 페이지 규모 (역대 최대)
- 메인 컴포넌트: [SquidDashboard.tsx](../components/SquidDashboard.tsx) (**64.8 KB** ← 참치 989줄·고등어 55KB보다 큼)
- 시그니처 그라디언트: **purple → pink** (#8b5cf6 → #ec4899) — 두족류
- 5-Pillar 타이틀이 참치·고등어와 다른 도메인 어휘:
  - S1 🌊 **원물 및 조달** (포클랜드 자원평가, 어획 헤게모니)
  - S2 🏭 **가공 및 밸류체인** (스페인 Vigo 가공 허브 스프레드)
  - S3 ⚓ **물류 및 운영 원가** (라이선스·ITQ 입어료, MGO 시뮬레이션)
  - S4 📊 **판매 및 수요** (KOSIS CPI 괴리율, 수요 파괴)
  - S5 🛡️ **ESG 및 미래 어업** (남서대서양 IUU, M&A PEF Valuation, Earn-out)

### 1.2 위젯 인벤토리 (추정)
| Pillar | ID 기반 | TSX 전용 | 추정 합계 |
|---|---:|---:|---:|
| S1 원물 | 23 | (포함) | ~25 |
| S2 가공 | 14 | ~3 | ~17 |
| S3 물류 | 13 | ~3 | ~16 |
| S4 판매 | **26** ← 최대 | ~4 | ~30 |
| S5 ESG | 19 | ~3 | ~22 |
| **합계** | **95** | **~30** | **~125** ← **역대 최대** |

- `components/Squid*.tsx` 총 **30개 파일**
- `public/data/squid_real_data_v4.json` **305 KB** (참치 가공 후 추정 200KB, 고등어 195KB보다 큼)

### 1.3 API 라우트 (8개 — 참치 3, 고등어 3 대비 많음)
모두 `app/api/squid/*` 하위:
- **hsping** — HS 자동분류
- **importyeti** — Import Yeti 수입 데이터
- **kosis** — KOSIS 통계청
- **mfds** — 식품의약품안전처
- **ofac** — OFAC 제재 (남서대서양 IUU·러시아·중국 DWF)
- **squid-forecast** — 가격 예측
- **squid-sourcing** — 소싱 시뮬레이터
- **wto** — WTO SPS 통보

### 1.4 기존 audit (daily_audit 활성)
- daily_audit `2026-05-22~27` 15+ 위젯 (mackerel과 동일 패턴)
- **`FalklandSquidDashboard.tsx` 별도 존재** ← 스코프 점검 대상 (포클랜드는 squid 페이지 일부 vs 별도 dashboard?)
- 출처 아카이브 `docs/2026_squid_industry_sources.md` **부재** (참치는 있고 고등어는 신규 작성함)

### 1.5 도메인 특이성 (다른 commodity와 다름)
1. **다종 혼재**: Loligo gahi(포클랜드) + Illex argentinus(아르헨티나) + Dosidicus gigas(jumbo flying, 페루·칠레) + Todarodes pacificus(살오징어, 한국 동해)
2. **DWF 정치**: SPRFMO CMM-18 쿼터, Mile 201 (FCZ 외 200해리 경계), 중국 원양 함대
3. **포클랜드 (FIG)**: 라이선스 시스템, ITQ 전환 일정, FESBA 가공 허브
4. **PEF M&A 위젯 다수**: Earn-out 시뮬, 가치평가 — 이건 다른 commodity audit엔 없던 영역
5. **Vigo (스페인) 가공 허브**: 글로벌 squid 가공의 중심, 칠레/페루산 수입→유럽 재수출

---

## 2. 참치·고등어 audit과의 핵심 차이

| 차원 | 참치 | 고등어 | 오징어 (이번) |
|---|---|---|---|
| 위젯 수 | 120 | 103 | **~125 (최대)** |
| API 라우트 | 14 | 3 | **8** |
| JSON 크기 | n/a | 195 KB | **305 KB (최대)** |
| 도메인 다종 어종 | 단순 (4 어종) | 단순 (Scomber 4종) | **복잡 (Loligo·Illex·Dosidicus·Todarodes)** |
| 출처 아카이브 | 있음 (14건) | 신규 작성 (15건) | **신규 작성** |
| 별도 sub-dashboard | 없음 | 없음 | **FalklandSquidDashboard 존재** (스코프 점검) |
| 특수 위젯 | 일반 시각화 | 일반 | **PEF M&A·Earn-out·DWF 정치** |

### 2.1 새로운 함정 (예상)
- **종(species) 혼동**: jumbo flying·Loligo·Illex·Todarodes를 단일 "squid"로 묶으면 가격 격차 왜곡 (Loligo > Illex >> Dosidicus)
- **포클랜드/말비나스 명칭 정치**: 영국령 vs 아르헨티나 주장. UK·AR·EU 자료마다 다름
- **Mile 201 IUU**: 중국 DWF 200해리 외 조업 — 정확한 수치보다 추세
- **SPRFMO CMM-18**: 쿼터 vs 실제 어획 격차
- **Vigo 가공 마진**: 칠레→스페인→EU 재수출 mark-up 정확성
- **PEF M&A 위젯 (S5)**: Earn-out·valuation 추정치 — 출처 검증 어려움, 가정 명시 필수

---

## 3. 제안 Audit 플랜 (widget-audit skill 8-phase + Squid 보정)

### Phase 0: 베이스라인 정리
- `artifacts/daily_audit/2026-05-27/components_Squid*.json` 15건 + `FalklandSquidDashboard.json` 1건 정리
- 기존 위반 카운트 집계

### Phase 1: 인벤토리 (3-way 병렬)
- (a) TSX 30개 메타 추출 (Python, [scripts/extract_value_chain_widgets.py](../scripts/extract_value_chain_widgets.py) 패턴 재사용)
- (b) JSON 95 위젯 메타 추출 (Python 직접 — 고등어 패턴 검증됨)
- (c) `Agent(subagent_type=Explore)` 병렬: FalklandSquidDashboard 위치·스코프, SquidValueChain* 컴포넌트 분리

### Phase 2: 4-Axis 점수
- **Squid src_terms 확장**: SPRFMO·CMM-18·FIG·FESBA·ITQ·MFDS·OFAC·MGO·OPRT·INIDEP(아르헨티나)·IFOP(칠레)·IMARPE(페루)·ICCAT·NOAA·NPFC·KCS·KMI·KAMIS·KOSIS·해수부·관세청·수협
- 종별 보정: Loligo / Illex / Dosidicus / Todarodes 매핑 정확성

### Phase 3: API 라우트 mock audit (8 라우트, ~50KB)
- 단일 Antigravity Pro 호출로 처리 가능 (1M 컨텍스트 안)
- 핵심 패턴: 허위 라이브 라벨 (참치 SANCTIONS·고등어 mackerel-comtrade 같은 함정 검색)

### Phase 4: 클레임 교차 검증
- **Phase 4.1 출처 아카이브 신규 작성 (~16건)**:
  - SPRFMO Annual Report 2026, CMM-18-2024 (jumbo flying squid)
  - FIG Falkland Islands Government Fisheries Statistics 2026 / Licence System
  - INIDEP Argentina Illex argentinus 2026
  - IMARPE Peru Dosidicus gigas 2026
  - FAO GLOBEFISH Cephalopods 2026
  - NOAA / NMFS Korean Pacific Squid
  - **EUMOFA Cephalopods 2026** (Vigo 가공 허브 분석)
  - Spain ANFACO-CECOPESCA Squid 2026
  - China DWF Annual Report
  - OFAC IUU 제재 리스트
  - WTO SPS 통보 (squid)
  - Mile 201 DWF 모니터링 (Greenpeace·Oceana)
  - KMI 두족류 시장 보고서
  - Korea KCS 오징어 수입 통계
  - **+ Grok CLI**: 실시간 X/뉴스 (`grok -p "2026 latest squid Falkland Illex jumbo flying"`)
  - Atuna squid news
- **Phase 4.2 클레임 vs 출처 교차**: Antigravity Pro 1회, ~100KB 입력

### Phase 5: 독립 검증 (vendor 3원 교차)
- Critical 의심 5건 → Codex GPT-5.5
- **새로운 옵션**: Codex와 Antigravity 의견 충돌 시 → **`grok -p "..." --best-of-n 3`** tie-breaker (xAI 시각)

### Phase 6: 위젯 삭제·이동 결정
오징어 특수 후보:
- **FalklandSquidDashboard** 별도 존재 시 squid 메인과 중복 위젯 → 통합 또는 삭제
- **PEF M&A 위젯 (S5 w65~w70)**: 추정 valuation·Earn-out — 출처 검증 어려우면 익명화
- **Mile 201 IUU 시각화**: 중국·아르헨티나·EU 갈등 — 법적 리스크 점검 (참치 다크트레이딩 함정)
- 미래 시나리오 mock (있다면) — 의사결정 가치 평가

### Phase 7: 정정 적용 + 보고서
- TSX 단일 파일 ≤3건 → Edit 직접
- 5+ 파일 동일 패턴 → Python 일괄 스크립트 (L-07)
- JSON 위젯 정정 → Python 직접
- 산출물 6종 + 신규 출처 아카이브 1종

### Phase 8: 자동 push 배포 (사용자 디폴트)

---

## 4. Multi-Agent 토폴로지 (비용 $0)

| 단계 | 모델 | 용도 |
|---|---|---|
| Phase 0~2 | Claude + Python | 베이스라인·인벤토리·점수 |
| Phase 3 + 4.2 | **Antigravity Gemini 3.1 Pro** (2회, 또는 결합 1회 100KB) | API audit + 클레임 교차 |
| Phase 4.1 | **WebSearch** × 6~8 + **`grok -p`** × 2~3 | 출처 16건 신규 수집 |
| Phase 5 | **Codex GPT-5.5** + (필요 시) **Grok `--best-of-n 3`** | 독립 검증 + tie-breaker |
| Phase 6~7 | Claude | 결정·정정·보고서 |

**예상 비용: $0** (AI Ultra + Claude Max + ChatGPT Plus + SuperGrok 모두 구독 내)
**예상 시간: 2.5~3시간** (오징어 규모 + Vigo·DWF·M&A 특수 영역)

---

## 5. 결정 사항 (참치·고등어와 동일 디폴트 — 별도 지시 없을 시)

| # | 항목 | 디폴트 |
|---|---|---|
| A | 출처 아카이브 처리 | **신규 작성** (Phase 4.1, ~16건 목표) |
| B | JSON 위젯 포함 범위 | **전체** (95개 + TSX 30개) |
| C | 위젯 삭제·이동 기준 | **옵션 C** (참치와 동일) |
| D | 배포 사전 동의 | **자동 push** (사용자 디폴트 D) |
| E | JSON 추출 도구 | **Python 직접** (고등어에서 검증됨) |
| F | Codex tie-breaker 시 Grok 동원 | **충돌 발생 시만** |

---

## 6. 산출물

1. `artifacts/squid_audit_2026_05_28.md` — 종합 보고서
2. `artifacts/squid_widget_inventory.json` — TSX 메타
3. `artifacts/squid_json_widgets.json` — JSON 메타
4. `artifacts/squid_4axis_scores.csv` — 위젯별 등급
5. `artifacts/squid_combined_audit_antigravity.md` — API + 클레임 결합 audit
6. `docs/2026_squid_industry_sources.md` — 신규 출처 아카이브 (~16건)
7. `scripts/extract_squid_widgets.py` (재사용 wrapper)

---

## 7. 위험 요소

| 위험 | 확률 | 영향 | 완화책 |
|---|:-:|:-:|---|
| 종 혼동(Loligo/Illex/Dosidicus/Todarodes)으로 가격 비교 왜곡 | 고 | 고 | 4-Axis 점수에 종(species) 명시 여부 추가 가점 |
| 포클랜드/말비나스 명칭 정치 갈등 | 중 | 중 | 영문 통일 (Falkland Islands), 한글은 "포클랜드" 일관 |
| PEF M&A·Earn-out 위젯 출처 검증 불가 | 고 | 중 | 추정 가정 명시 + STATIC 라벨 정직 표기 |
| 305KB JSON Antigravity 입력 컨텍스트 압박 | 중 | 저 | 결합 1회 → 분리 2회로 폴백 가능 |
| Mile 201 IUU 시각화 법적 리스크 | 중 | 고 | 익명화 또는 추상 지수로 변환 (참치 Insight 6 패턴) |
| FalklandSquidDashboard 중복 위젯 식별 누락 | 중 | 중 | Phase 1c Explore 위임으로 매핑 정밀화 |
| Vercel 빌드 깨짐 (TSX 다수 수정 시) | 저 | 고 | L-03 pre-push hook + 매 Edit 후 build |

---

## 8. 진행 동의 확인

**참치·고등어와 동일 디폴트(A 신규작성 / B 전체 / C 옵션C / D 자동push / E Python직접 / F 충돌시 Grok)** 로 진행하시려면 **"진행"** 한 마디면 됩니다.

다른 옵션 원하시면 항목 번호와 함께 지시해주세요.
