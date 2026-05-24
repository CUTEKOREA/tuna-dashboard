# 🌐 글로벌 무역 인텔리전스 대시보드 — 종합 개발 규칙서 (V4.1 Global Commodity Standard)

> **Version:** 4.1 | **분석 기반:** V4.0 운영 중 발견된 30개 커밋·23개 deploy 로그·16개 일괄 리팩토링 스크립트의 패턴을 학습하여 강화
> **최종 수정:** 2026-05-16
> **변경 요약 (V4.0 → V4.1):** D-05 한글 라벨 6자 → 7자로 갱신, W-04(위젯 신설 체크리스트) 추가, 9장 「Lessons Learned」 신설(L-01~L-08)
> **적용 범위:** 수산물(Tuna, Squid, Mackerel, Shrimp 등), 농산물(Mangosteen, Apple 등), 축산물(Chicken, Beef 등) 및 전사 운영 대시보드 전체

---

## 1. 페르소나 및 분석 스탠다드 (C-Level Executive Insight)

모든 대시보드의 텍스트(Takeaway)와 기획은 단순 개발자 시각이 아닌 **"농·축·수산(Agri-Food & Seafood) 글로벌 공급망을 통찰하는 사모펀드(PEF)의 C레벨 임원"**의 시각으로 작성되어야 합니다.

- P-01: **수익성 중심 사고:** 항상 마진 구조(예: 중간 유통 마진 회피 전략, 차익 거래)와 밸류업(Value-up) 기회를 포착하여 제안할 것.
- P-02: **유통 및 물류 혁신 제안:** 기존 관행을 깨고 원가를 절감할 수 있는 전략(예: 항공에서 해상 MAP 물류 전환, 직수입 루트 개척 등)을 과감히 Takeaway에 반영할 것.
- P-03: **무관용 원칙 (Zero Tolerance):** "대충 일하지 마세요." 모든 위젯은 예외 없이 규칙을 100% 지켜야 하며, 화면 우측이나 하단의 눈에 띄지 않는 위젯이라도 타협은 없습니다.

---

## 2. 지식 통합 및 리서치 프로토콜 (NotebookLM & Data)

대시보드 기획 및 위젯 고도화를 위해서는 완벽한 데이터 리서치가 선행되어야 합니다.

### 2.1 다중 소스 교차 검증 (Cross-Notebook Analysis)
- R-01: 인사이트 도출 시 단일 노트북에 의존하지 않고, 해당 품목과 관련된 여러 밸류체인 노트북을 **적극적으로 교차 활용**합니다.
- R-02: 데이터 유효성 검증: 발행된 지 **5년이 넘은 자료**나 인사이트로서의 가치가 부족한 소스는 식별하여 제외 및 보고합니다.

### 2.2 이중 언어 리서치 원칙 (Bilingual Search Protocol)
- R-03: 한국어로 질문이 들어오더라도, 글로벌 고가치 자료 획득을 위해 **반드시 영문 키워드(예: Tuna, Mangosteen, Poultry) 리서치를 병행**해야 합니다.

### 2.3 데이터 보관 및 관리 원칙
- R-04: PDF 원본 보관 지양: AI가 즉각적으로 데이터를 파악할 수 있도록 **PDF 파일은 Markdown(.md) 형태로 변환하여 보관**합니다.
- R-05: Obsidian 동기화 시 **Hybrid 방식**(MD 원본 데이터 + AI 핵심 요약)을 동시에 저장하여 지식 유실을 방지합니다.
- R-06: **Google Drive 연동 원칙:** 저장된 외부 공시자료, 연구보고서 등은 단순 보관에 그치지 않고 대시보드에 새로운 인사이트(위젯)를 창출하는 데 적극 활용합니다.

---

## 3. 디자인 & 정보 아키텍처 (UI/UX & IA)

### 3.1 직관성 극대화 (Information Architecture)
- D-01: **"한눈에 파악되는 기획":** 운영 페이지는 정보가 파편화되지 않도록 전면 개편하여 직관성을 극대화해야 합니다.
- D-02: 플레이스홀더 사용 금지: UI 초안 작성 시에도 의미 없는 텍스트/이미지를 쓰지 말고 실제 데이터나 `generate_image`를 활용합니다.

### 3.2 S-Grade 디자인 시스템 (Global Commodity Theme)
- D-03: **Dark Mode Glassmorphism** 필수 (`bg-gray-900/95` + `bg-white/5 backdrop-blur-md`).
- D-04: **품목별(작물/축종/어종) 시그니처 그라디언트 테마 준수:**
  - 참치(해양): `cyan → blue`
  - 고등어(등푸른 원양·연근해): `cyan-700 → sky-500` (#0e7490 → #0ea5e9)
  - 갈치/새우(연안): `emerald → teal`
  - 오징어: `purple → pink`
  - 망고스틴(열대과일): `purple → fuchsia → pink`
  - 닭고기(가금류): `amber → orange → red`
  - 소고기(축산-한우 마블링): `red → rose → amber` (#dc2626 → #e11d48 → #f59e0b)
- D-05: 차트 렌더링 시 X축 라벨은 **한글 기준 최대 7자**(영문 잔존 시도 동일 7자) 초과 시 truncate 하고 괄호 영문명은 모두 제거합니다. 7자 초과 라벨이 다수일 경우 **Korean smart rotation**(`angle={-45}` 또는 `-30` + `textAnchor="end"` + 충분한 하단 `margin.bottom` 확보)을 적용합니다. (V4.1: 운영 중 104개 라벨 실측 결과 6자 → 7자가 한글 단어 단위 보존에 더 안전함이 확인됨.)

---

## 4. 위젯 구조 & 2-Step 인사이트 (SIT/TAK)

### 4.1 카드 템플릿 (MANDATORY)
```
┌──────────────────────────────────┐
│ [아이콘] 위젯 제목    [Telemetry] │
│ cardDesc: 산출 방법론/출처 1줄     │
├──────────────────────────────────┤
│      차트/시각화 (Responsive)     │
├──────────────────────────────────┤
│ 📋 Situation (현황: 숫자/데이터)  │
│ 💡 Takeaway (C레벨 실행 제안)     │
└──────────────────────────────────┘
```

### 4.2 명명 및 텍스트 정규화
- W-01: 위젯 제목은 **순수 한글**을 우선하며 영문 병기를 금지합니다.
- W-02: 데이터 단위는 반드시 괄호로 명기합니다 `(원/kg)`, `($/MT)`, `(톤/ha)`.
- W-03: `TakeawayBox`의 **SIT**는 객관적 숫자를 포함한 현황 진단(2~3문장), **TAK**는 수익성/리스크 기반의 C레벨 실행 지침(1~2문장)으로 작성합니다.
- W-04 (V4.1 신설): **신규 위젯 추가 시 체크리스트** — PR/커밋 머지 전 다음을 모두 통과해야 합니다.
  1. cardDesc 1줄(산출 방법론·출처) 존재
  2. TelemetryBadge 부착 (`LIVE`/`SYNCED`/`STATIC` + syncDate)
  3. SIT(2~3문장) + TAK(1~2문장)
  4. X·Y축·범례·툴팁 한글 매핑 100% (영문 잔존 grep 통과)
  5. 단위 괄호 표기 `(원/kg)`, `(MT)`, `($/MT)` 등
  6. 5-Pillar 중 어느 기둥에 속하는지 명시
  7. 로컬 `npm run build` 통과 (L-03 게이트)

---

## 5. 데이터 & API 통합 (Live API First)

- A-01: **Live API First:** 휴리스틱(추정) 데이터를 버리고 아래와 같은 실시간 연동 데이터를 최우선 반영합니다.
  - **무역/통관:** KCS(관세청), UN Comtrade, OEC
  - **농축수산 인프라:** KAMIS(농산물유통정보), KOSIS, USDA(미국농무부), FAOSTAT
  - **기후/환경:** 기상청(라니냐/엘니뇨), NOAA
- A-02: 모든 위젯에 `TelemetryBadge`를 달고, 데이터 상태(`LIVE`, `SYNCED`, `STATIC`)와 `syncDate`를 명확히 노출합니다.
- A-03: 글로벌 무역 데이터 호출 시 **HS Code 자동 변환**을 반드시 선행합니다. KCS(관세청) 호출은 반드시 **HSK 10자리**를 사용하며, 4자리/6자리 HS는 글로벌 집계 보조 용도로만 허용합니다. (V4.1: dried garlic 등 6자리 매핑 오류로 KCS 거래량 누락 사례 발생 후 강화.)

---

## 6. 대시보드 아키텍처 (Universal 5-Pillar Framework)

모든 원자재(수산/농산/축산) 인텔리전스 대시보드는 경영진의 의사결정 흐름에 맞춘 **Universal 5-Pillar 구조**로 위젯을 재배치해야 합니다.
1. 🌾/🐟 **원료 수급 (Raw Material):** 글로벌 생산량/어획량, 기후 리스크(라니냐/가뭄 등), 작황 지수, 산지 단가 추이
2. 🏭 **가공 & 생산 (Processing):** 공장 가동률, 수율(수산가공율, 도축율, 과일 예냉 방어율), 인건비 및 원가 구조
3. 🚢 **물류 & 통관 (Logistics):** 해상/항공 운송비, 콜드체인 리스크, 통관 및 검역 장벽(SPS, 해충, 동물질병)
4. 📈 **판매 & 수요 (Sales):** 시장 점유율, 소매가 전가(그리드플레이션), 대체재(사과, 돼지고기 등) 교차 탄력성 분석
5. 🌱 **ESG & 지속가능성 (Sustainability):** 탄소/메탄 발자국, 혼획 저감, 동물 복지(Animal Welfare), 부산물 바이오 업사이클링

---

## 7. 품질보증 및 실행 프로토콜 (QA & Workflows)

### 7.1 Harness Engineering ("하네스 출동")
- O-01: 시스템의 예외 상태(Loading, Error, Empty)를 사전에 정의하고, 실행 환경의 안정성과 가시성(Observability)을 확보한 뒤 코드를 작성합니다.

### 7.2 Troika Workflow
- O-02: **GStack (100% 완성):** 기능 개발 시 90%가 아닌 예외처리까지 포함한 100% 완성을 지향합니다.
- O-03: **Superpowers (TDD/SDD):** 코드를 짜기 전 스키마를 정의하고, 테스트 주도/서브 에이전트 주도의 계획적 개발을 진행합니다.

### 7.3 위젯 신뢰도 감사 (Forensic Audit)
- O-04: 신규 위젯 추가 시 **4-Axis 평가**(출처 신뢰도, 데이터 신선도, 검증 가능성, 통합 완성도)를 진행하여 평균 A등급(85점 이상)을 달성해야만 배포합니다.

---

## 8. 빌드 에러 방지 체크리스트

개발 완료 후 Vercel 등 배포 환경에서의 빌드 에러를 방지하기 위해 다음을 검증합니다:
- [ ] 정규식 리터럴 닫힘(`/`) 상태 점검
- [ ] JSX `className` 속성 중복 여부 확인
- [ ] 중첩 JSX 태그의 열고 닫힘 정합성 검증 (예: `extra </div>` 사고)
- [ ] 복잡한 차트(Sankey 등)의 빈 데이터 시 Fallback UI 존재 여부
- [ ] 대규모 위젯 파일의 부분 수정 후 **로컬 `npm run build` 테스트 통과** 여부 (L-03 게이트)
- [ ] CSS Module import 경로 실재 여부 — `./XYZ.module.css` 파일 존재 확인 (L-06)
- [ ] 미사용 import / dead reference 제거

---

## 9. Lessons Learned (V4.1 신설)

V4.0 운영 중 누적된 30개 커밋·23개 deploy 로그·16개 일괄 리팩토링 스크립트(`_archive/scripts/fix_*.py`)에서 도출된 운영 원칙입니다. 이전 장의 추상 원칙(P, R, D, W, A, O)을 **실전 게이트**로 구체화합니다.

### 9.1 코드 품질 게이트

- **L-01 (영문 잔여분 Zero-Tolerance):** 위젯 추가/수정 시점에 영문 사용자 노출 텍스트를 모두 한글화합니다. 사후 정리(1차/2차/3차 패턴)는 금지. PR 머지 전 다음 grep을 수행하여 화이트리스트(아래) 외 영문 문자열이 검출되면 차단합니다.
  ```bash
  # 한글 위젯 영문 잔여분 검사 (예시)
  rg -nP "(label|name|title|tooltip|legend|cardDesc)\s*[:=]\s*['\"][A-Z][A-Za-z &/.\-]+['\"]" components/<Dashboard>.tsx
  ```
  - 화이트리스트: HS 코드(`HS 030342`), 통화코드(`USD`, `JPY`), 단위(`MT`, `kg`, `t`), 약어(`OEC`, `WCPO`)는 허용. 단 첫 노출 시 한글 풀네임을 괄호 또는 TermTooltip으로 병기.

- **L-03 (로컬 빌드 게이트):** Vercel push 전 `npm run build`가 **로컬에서 성공해야만** 배포합니다. 권장 셋업:
  ```bash
  # .git/hooks/pre-push (실행 권한 부여)
  #!/bin/bash
  npm run build || { echo "❌ Build failed — push blocked"; exit 1; }
  ```
  - V4.0 운영 중 빌드 에러 6건(extra `</div>`, Recharts collapse, Bar 차트 타입 미지원, `InsightsPanel.module.css` 누락 등)이 모두 로컬 빌드로 사전 차단 가능했음.

- **L-06 (Dead Import 검증):** `tsc --noEmit` 또는 `next build`로 누락 CSS Module, 미존재 컴포넌트 import를 검출합니다. 신규 컴포넌트 작성 시 import 경로의 파일 실재를 즉시 확인.

### 9.2 디자인 및 표현 표준

- **L-02 (X축 라벨 한글 ≤7자 + Smart Rotation):** D-05의 7자 기준을 운영 표준으로 못 박습니다. 7자 초과 라벨이 4개 이상이면 자동 회전(`angle={-45}`) 적용. 회전 시 차트 컨테이너 하단 마진을 `40~60px` 확보하여 잘림 방지. 영문 병기(`서인도양 (W.Indian)`)는 X축에서 금지하고 TermTooltip으로 이전.

- **L-05 (Recharts ResponsiveContainer + Fixed-Width Fallback):** 기본은 `<ResponsiveContainer width="100%" height="100%">`이나, 부모 컨테이너 너비가 `0`으로 측정되는 collapse 버그(특히 탭 전환·`display:none` 부모) 발생 시 `width={760}` 등 fixed-width fallback 허용. 이 경우 카드 단위에서 가로 스크롤이 발생하지 않도록 `min-width: 0`을 부모에 부여.

### 9.3 데이터·API 정밀도

- **L-04 (HSK 10자리 의무):** A-03 정밀화. KCS 호출은 10자리 HSK 필수. 4자리 HS는 OEC/UN Comtrade 글로벌 집계 보조용. HS Code 매핑 테이블은 `app/api/_shared/hs-codes.ts` 등에 단일 출처로 관리하여 위젯별 하드코딩을 금지.

### 9.4 작업 방식

- **L-07 (스크립트 기반 일괄 리팩토링):** 동일 패턴이 **5개 위젯 이상**에 적용되는 변경(예: 영문→한글, 단위 표기 추가, 색상 토큰 일괄 교체)은 수작업 금지. `scripts/fix_<주제>.py`로 일괄 변환기 작성 → diff 검토 → 단일 커밋. 운영 사례: `_archive/scripts/fix_charts.py`, `fix_takeaway.py`, `fix_colors.py` 등 16개 누적.

- **L-08 (데이터 파일 git 금지):** 다음은 `.gitignore`에 반드시 포함하며 절대 커밋하지 않습니다:
  - `data/`, `public/data/` 내 `*.csv`, `*.json` 중 **10MB 초과** 파일
  - `*.pdf`, `*.xlsx` 원본
  - FAOSTAT/USDA/UN Comtrade 등 외부 데이터셋 원본
  - 보관 위치: `Google Drive/내 드라이브/data/공통(General)/FAOSTAT/` (단일 출처). 위젯에서는 Drive 또는 API로 접근, 또는 정제된 경량 JSON(`<10MB`)만 `public/data/`에 둠.
  - 위반 시 V4.0 운영 중 발생한 "massive data size issue"로 `git history`를 재작성해야 함(2026-05-13 사례).
