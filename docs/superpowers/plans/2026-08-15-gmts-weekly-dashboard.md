# GMTS 주간보고 대시보드 구현 기획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Google Drive의 GMTS 주간보고 PDF를 근거로, 참치왕국 사이드바 **실시간 운영**의 `방콕사무소` 바로 아래·`메일` 바로 위에 `GMTS 주간보고` 메뉴를 추가하고 제너럴산토스 항만·가공·가격·반입량 의사결정 대시보드를 만든다.

**Architecture:** 원본 PDF는 Google Drive에 그대로 보존하고, 결정적 수치만 재현 가능한 변환 스크립트로 경량 JSON으로 정규화한다. UI는 `lib/data/gmts.ts`만 통해 데이터를 읽고, 정적 PDF 스냅샷이므로 모든 위젯을 `STATIC`으로 표시한다. `/gmts`는 기존 `app/[category]` 클라이언트 쉘을 재사용하며, 기존 세션 비밀번호 잠금을 적용한다.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9 strict, Recharts 3.8, CSS Modules, Vitest 4.1, Python 3 + pdfplumber 0.11.9, Puppeteer 24.

## Global Constraints

- 원본 PDF를 수정·삭제·이동하지 않고 SHA-256·파일명·페이지 수를 출처로 보존한다.
- `reportDate`와 실제 운영 기준일 `operationalAsOf`를 분리한다. 원문에 운영 기준일이 없으므로 `operationalAsOf: null`을 유지한다.
- 공란·TBA·No offer·No price를 `0`으로 바꾸거나 전주 값으로 보간하지 않는다.
- 가격 분모 단위와 Gensan 반입량 단위가 원문에 없으므로 `$/MT`나 `MT`를 임의 부여하지 않는다.
- `GMTS`의 풀네임을 추정하지 않는다. 첫 노출에서 `TermTooltip`으로 "원문의 작성 주체 약어"라고만 설명한다.
- 사용자 노출 라벨·차트 축·범례·툴팁은 한글로 표시하고, 선명·트레이더 식별자는 한글 표시명과 원문 식별자를 출처 정보에 분리 보존한다.
- 각 `WidgetCard`는 `cardDesc`, `TelemetryBadge`, SIT 2~3문장, TAK 1~2문장, 단위, Universal 5-Pillar 귀속을 갖춘다.
- 정적 JSON을 직접 읽는 코드는 `lib/data/`에만 둔다. `app/`·`components/`의 JSON 직접 import를 금지한다.
- 원문 `Other`의 개인 휴가·출장 기록은 기본 화면에 노출하지 않는다.
- 명시적 배포 요청이 없으므로 로컬 구현·검증만 하고 프로덕션에 push하지 않는다.

---

## 1. 원문 분석 결과

### 1.1 자료 범위

| 항목 | 확인 결과 |
| --- | --- |
| 원문 폴더 | `/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/신라그룹/GMTS/GMTS Weekly Report` |
| 보고서 수 | 30건 |
| 기간 | 2026-01-21~2026-08-12 |
| 주기 | 매주 수요일, 범위 내 누락 0건 |
| 중복 | 보고일 중복 0건, SHA-256 중복 0건 |
| 페이지 | 총 38쪽: 1쪽 22건, 2쪽 8건 |
| 작성 주체 | 원문 표기 `GMTS` |
| 최신본 | `GMTS Weekly Report 20260812.pdf` |
| 최신본 SHA-256 | `e84ad3bb26ebe05e863467bff3f4507775a8cf4b04adefa8026eb3414e1e5243` |

### 1.2 공통 스키마

30건 모두 다음 순서를 유지한다.

1. 제너럴산토스 항만 복합단지 현황
2. 하역 중·하역 완료·입항 예정 선박
3. 7개 참치 통조림 공장의 생산·냉동창고 현황
4. Non-GSP·GSP 가격(둘 다 Non-MSC)
5. 기타 자유서술
6. 2019~2026년 Gensan 반입량(생참치 제외)

### 1.3 최신 보고서 핵심 수치

| 의사결정 영역 | 2026-08-12 원문 값 | UI 표기 원칙 |
| --- | --- | --- |
| 하역 중 | 건수 공란, 선박 행 0건 | `0척`이 아닌 `자료 미확정` |
| 하역 완료 | 2척 | 화물 2,387.141, 양하 2,184.110, SHORT 203.031 MT |
| 입항 예정 | 3척 | 표시 총화물 9,919.494 MT; 전량 Gensan 반입으로 해석 금지 |
| Gensan 명시 배정 | SEIN QUEEN 2,092.414 MT | 입항 예정 총화물과 분리 |
| 공장 생산 | 895/1,095 | 82%, 원문상 일생산 MT |
| 냉동 재고 | 17,550/40,600 MT | 43%, 보고 처리일수 20일 |
| Non-GSP 가격 | $1,900 | `$·1,900 · 분모 단위 미기재` |
| GSP 가격 | $2,025 | 차이 $125, Non-GSP 대비 6.58% |
| 2026년 1~7월 반입량 | 63,736 | 원문 단위 미기재 |
| 2025년 동기 대비 | -3,627, -5.38% | 2025년 1~7월 67,363과 비교 |
| 7월 전년 동월 대비 | -21.30% | 2026년 12,687 vs 2025년 16,120 |

### 1.4 데이터 품질 이슈

| 심각도 | 이슈 | 처리 규칙 |
| --- | --- | --- |
| 높음 | 가격에 `$`만 있고 분모 단위가 없음 | `basisUnit: null`, 화면에 미기재 고지 |
| 높음 | 반입량 표에 단위가 없음 | `unit: null`, MT로 추정 금지 |
| 높음 | Celebes 재고 1,950이 표시 용량 1,600을 초과 | 122%를 원문 값으로 보존하고 검증 필요 경고 |
| 중간 | 3/25·4/8·8/12 하역 중 건수 공란, 4/8·4/15 하역 완료 건수 공란 | `declaredCount: null`, 행 수는 `recordCount`로 별도 보존 |
| 중간 | 2026년 2월 반입량이 3/4 보고 6,220에서 3/11 보고 11,968로 수정 | 최신값과 revision 이력을 동시 보존 |
| 중간 | `No price`, `No offer`, `No transaction`, `Around`, `Level`, `under`, `old contract` 혼재 | `amount + qualifier + rawText`로 분리 |
| 낮음 | 날짜 뒤 `MT`, `3,347.857 NT`, `6.295.630 MT` 등 원문 오타 | 정규화값과 `rawValue`를 동시 보존 |
| 낮음 | `Other` 30건 중 24건 공란, 나머지에 개인 휴가·출장 포함 | v1 대시보드에서 제외 |

---

## 2. 메뉴·접근 기획

### 2.1 사이드바 위치

```text
📡 실시간 운영
  시장 동향
  선단 운영
  하역 현황
  물류·가공
  파노피
  코스모
  방콕사무소
  GMTS 주간보고
  메일
```

- 라우트: `/gmts`
- 메뉴 제목: `GMTS 주간보고`
- 메뉴 위치: 기존 `operation` 섹션에서 `bangkok-office` 다음, `mail` 이전
- 명령 팔레트 분류: `실시간 운영`
- 아이콘: 기존 `Factory`
- 색상: 참치·해양 운영 시그니처 `cyan → blue`
- 접근: 기존 `silla-operation-access` 세션 잠금 재사용
- 숫자 단축키: 미배정. 기존 1~0 단축키 순서 보존
- 사이트맵: 보호 메뉴이므로 제외

### 2.2 보안 경계

기존 잠금은 클라이언트 `sessionStorage` 기반 UI 접근 제어이다. JSON을 서버 비밀로 만드는 인증은 아니다.

- v1: 기존 운영 메뉴와 같은 세션 잠금을 적용한다. 잠금 전에는 최신 핵심 KPI Hero만 티저로 표시하고 탭·차트·표·상세 수치는 마운트하지 않는다.
- v1 내부 노출 최소화: JSON을 `public/data` 대신 `data/` 아래 추적하고 `lib/data` 경유로만 번들한다.
- 서버 인증이 필요하다면 v1 범위에 섞지 않고 별도 기획으로 분리한다.

---

## 3. 화면 정보구조

### 3.1 기본 화면

```text
┌─ GMTS 제너럴산토스 주간보고 ────────────────┐
│ 보고일 2026.08.12 · 운영 기준일 미기재 · 30건 정적 스냅샷 │
└───────────────────────────────────────────────┘

[하역 중: 미확정] [하역 완료: 2척] [입항 예정: 3척]
[생산 가동률: 82%] [창고 이용률: 43%] [1~7월 반입: 63,736*]
                                      * 원문 단위 미기재

[운영 요약] [항만·선박] [공장·재고] [가격·반입] [데이터 품질]
```

### 3.2 탭 구성

#### 탭 1. 운영 요약

- Hero KPI 6개
- "오늘의 운영 판단" 배너
- 최신 선박 파이프라인 요약
- 생산·재고 예외 공장 요약
- 가격 qualifier·단위 미기재 경고

#### 탭 2. 항만·선박

1. `주간 선박 흐름` 위젯 — Pillar S3 물류·통관
   - 하역 중·완료·입항 예정 선에 대한 30주 추세
   - 원문 건수 공란은 차트 gap으로 표시
   - `declaredCount`와 `recordCount`를 혼합하지 않음
2. `최신 선박 파이프라인` 위젯 — Pillar S3
   - 선명, 트레이더, 총화물, Gensan 배정, 입항·하역 일자, 수하인
   - 일자 뒤 `MT` 오타는 정규화 일자를 표시하고 원문은 상세에 보존
   - 입항 예정 총화물과 Gensan 배정량을 분리

#### 탭 3. 공장·재고

1. `생산·창고 이용률` 위젯 — Pillar S2 가공·생산
   - 30주 생산 가동률과 냉동창고 이용률 비교
   - 일생산량과 재고량은 투에시스와 분리해 중첩 오독 방지
2. `공장별 원어 압력` 위젯 — Pillar S2
   - 7개 공장의 생산, 가동률, 재고, 이용률, 처리일수
   - Celebes 122%는 오류 자동 정정 대신 `원문 확인 필요` 경고

#### 탭 4. 가격·반입

1. `GSP·Non-GSP 가격 추세` 위젯 — Pillar S1 원료 수급
   - 30주 가격과 프리미엄 차이
   - `No price`·`No offer`는 공란, `Around`·`Level`·`under`·`old contract`는 qualifier chip
   - Y축은 `$·원문 분모 미기재`로 표시
2. `Gensan 월별 반입량` 위젯 — Pillar S1
   - 2026 vs 2025 월별 비교
   - 2026년 2월 6,220→11,968 수정 이력 마커
   - Y축은 `원문 단위 미기재`로 표시

#### 탭 5. 데이터 품질

- 30건 아카이브 목록: 보고일, 파일명, 페이지 수, SHA-256 앞 12자리
- 공란 건수, 가격 qualifier, 반입량 수정, 용량 초과 등 quality flag
- `원문에서 확인되지 않은 값은 화면에서도 확정하지 않음`을 상시 고지
- 데이터 품질 패널은 Universal 5-Pillar 위젯이 아니므로 pillar를 임의 부여하지 않음

### 3.3 최신본 SIT/TAK 문안

**항만·선박 SIT**

> 2026-08-12 보고에서 하역 완료 2척은 화물 2,387.141 MT 중 2,184.110 MT를 양하했고 SHORT는 203.031 MT입니다. 입항 예정 3척의 표시 총화물은 9,919.494 MT이지만, Gensan 명시 배정량은 SEIN QUEEN 2,092.414 MT로 분리됩니다. 하역 중 건수는 원문 공란이므로 확정하지 않습니다.

**항만·선박 TAK**

> 예정일이 보고일보다 빠른 SEA BLAZER·QUEEN ELLICE의 실제 입항·접안 상태를 운영 기록으로 재확인하고, 표시 총화물을 Gensan 반입 예측치로 직접 사용하지 않습니다.

**공장·재고 SIT**

> 7개 공장의 일생산은 895/1,095 MT로 가동률 82%이고, 냉동 재고는 17,550/40,600 MT로 이용률 43%입니다. Celebes는 표시 용량 1,600 MT 대비 재고 1,950 MT와 이용률 122%를 보고해 원문 확인이 필요합니다.

**공장·재고 TAK**

> Celebes의 용량·재고 기준을 GMTS에 재확인하고, 정정 전까지 122%를 추가 배정 가능 여력으로 해석하지 않습니다.

**가격·반입 SIT**

> 2026-08-12 보고 가격은 Non-GSP $1,900, GSP $2,025로 차이는 $125이며, 원문은 분모 단위를 명시하지 않았습니다. 2026년 1~7월 Gensan 반입량 63,736은 2025년 동기보다 5.38% 낮고, 7월은 전년 동월보다 21.30% 낮습니다.

**가격·반입 TAK**

> GSP 프리미엄 $125의 분모 단위와 거래 기준을 GMTS에 확인한 뒤 구매 비교에 사용하고, 7월 반입 감소가 8월 공장 재고와 연결되는지 다음 보고에서 점검합니다.

---

## 4. 데이터 계약

### 4.1 TypeScript 인터페이스

```typescript
export type GmtsPriceQualifier =
  | 'quoted'
  | 'no-price'
  | 'no-offer'
  | 'no-transaction'
  | 'around'
  | 'level'
  | 'under'
  | 'old-contract';

export interface GmtsPriceObservation {
  amount: number | null;
  currencySymbol: '$';
  basisUnit: null;
  qualifier: GmtsPriceQualifier;
  rawText: string;
}

export interface GmtsPortLaneSummary {
  declaredCount: number | null;
  recordCount: number;
}

export interface GmtsCanneryTotal {
  maxDailyProductionMt: number;
  currentDailyProductionMt: number;
  productionUtilizationPct: number;
  storageCapacityMt: number;
  currentStockMt: number;
  storageUtilizationPct: number;
  reportedProcessingDays: number;
}

export interface GmtsWeeklySnapshot {
  reportDate: string;
  operationalAsOf: null;
  port: {
    active: GmtsPortLaneSummary;
    completed: GmtsPortLaneSummary;
    incoming: GmtsPortLaneSummary;
  };
  canneryTotal: GmtsCanneryTotal;
  prices: {
    nonGspNonMsc: GmtsPriceObservation;
    gspNonMsc: GmtsPriceObservation;
  };
  volume2026: {
    year: 2026;
    months: Array<number | null>;
    total: number | null;
  } | null;
}
```

### 4.2 JSON 최상위 구조

```json
{
  "schemaVersion": 1,
  "metadata": {
    "status": "STATIC",
    "reportCount": 30,
    "coverageStart": "2026-01-21",
    "coverageEnd": "2026-08-12",
    "latestReportDate": "2026-08-12"
  },
  "weekly": [],
  "latest": {
    "reportDate": "2026-08-12",
    "operationalAsOf": null,
    "port": {},
    "canneries": [],
    "canneryTotal": {},
    "prices": {}
  },
  "volumeHistory": {
    "excludesFreshTuna": true,
    "unit": null,
    "annual": [],
    "revisions": []
  },
  "sources": [],
  "qualityFlags": []
}
```

### 4.3 변환 규칙

```python
def parse_declared_count(heading: str | None) -> int | None:
    """Colon 뒤 숫자가 없으면 None을 반환한다."""

def parse_price(raw: str | None) -> dict[str, object]:
    """amount, qualifier, rawText, basisUnit=None을 반환한다."""

def parse_report(path: Path) -> dict[str, object]:
    """PDF 텍스트·테이블·SHA-256을 하나의 보고 스냅샷으로 변환한다."""

def build_dashboard(source_dir: Path) -> dict[str, object]:
    """보고일 정렬, 주간 집계, 최신 상세, revision, quality flag를 생성한다."""
```

### 4.4 자동 게이트

- 원문 파일명에서 일자를 해석하고 본문 보고일과 일치하는지 검사한다.
- 최소 시작일 2026-01-21 이후로 처음과 끝 보고일 사이의 매주 수요일이 모두 있는지 검사한다.
- 보고일·SHA-256 중복을 금지한다.
- 보고서마다 공장 7개 + 합계 행 존재를 검사한다.
- 공장 합계와 개별 수치 합계를 0.001 MT 오차로 대조한다.
- 생산·창고 이용률은 원문 표시값과 재계산 반올림값을 대조하되, 원문을 자동 덮어쓰지 않는다.
- 반입량 연간 합계와 12개월 합계를 대조한다.
- 동일 연·월 값이 후속 보고서에서 바뀌면 revision으로 기록한다.
- 새 보고서가 추가되면 기존 30건을 하드코딩해 차단하지 않고, 주차 연속성을 동적으로 검증한다.

---

## 5. 파일 구조

### 생성

| 파일 | 책임 |
| --- | --- |
| `scripts/build_gmts_dashboard.py` | PDF 30건+의 보고 스키마·수치·출처·quality flag 정규화 |
| `scripts/test_build_gmts_dashboard.py` | 공란, 가격 qualifier, 숫자·일자 오타, revision 단위 테스트 |
| `scripts/requirements-gmts.txt` | `pdfplumber==0.11.9` 고정 |
| `data/gmts_dashboard.json` | 추적 대상 경량 정제 JSON; `git add -f` 필요 |
| `lib/data/gmts.ts` | JSON 단일 진입점과 TypeScript 인터페이스 |
| `lib/gmts-presentation.ts` | Hero KPI·차트 시리즈·경고 문구 순수 함수 |
| `components/gmts/GmtsDashboard.tsx` | `HeroZone`·`PillTabs`·WidgetCard·표·차트 합성 및 `heroOnly` 티저 |
| `components/gmts/GmtsDashboard.module.css` | V3 라이트 토큰 기반 반응형·표 스크롤 |
| `__tests__/gmts-dashboard-data.test.ts` | 출처·날짜·누락·최신 수치·revision 계약 |
| `__tests__/gmts-presentation.test.ts` | null 표기, qualifier, KPI, 동기 비교 계산 |
| `__tests__/gmts-dashboard-render.test.tsx` | 실제 컴포넌트 정적 렌더 결과와 한글 핵심 라벨 |

### 수정

| 파일 | 수정 내용 |
| --- | --- |
| `package.json` | `sync:gmts` 명령 추가 |
| `lib/dashboard-registry.ts` | 기존 `operation` 섹션에서 `bangkok-office → gmts → mail` 순서와 잠금·패널 순서 추가 |
| `app/page.tsx` | `GmtsDashboard` dynamic import, panel·hero teaser mapping, 메뉴 미리보기 문구 추가 |
| `__tests__/dashboard-registry.test.ts` | 기존 섹션 수 유지, GMTS 인접 순서·잠금·사이트맵 제외·패널 계약 |
| `HANDOFF.md` | 원문 범위, 수치 계약, 검증 결과, 미배포 상태 기록 |

### 수정하지 않음

- `app/[category]/page.tsx`: 기존 client-only 동적 쉘 재사용
- `app/sitemap.ts`: 보호 메뉴 제외가 레지스트리에서 자동 파생
- `next.config.mjs`: `/gmts`를 rewrite에 넣지 않음
- 기존 `GensanVesselStatus.tsx`: 2026-05-06 고정 미사용 코드이며 재사용하지 않음

---

## 6. 구현 계획

### Task 1: PDF 정규화기와 출처 manifest

**Files:**
- Create: `scripts/build_gmts_dashboard.py`
- Create: `scripts/test_build_gmts_dashboard.py`
- Create: `scripts/requirements-gmts.txt`
- Create: `data/gmts_dashboard.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Path`로 주어진 GMTS PDF 폴더
- Produces: `build_dashboard(source_dir: Path) -> dict[str, object]`, `data/gmts_dashboard.json`
- CLI: `--source-dir`가 있으면 이를 사용하고, 없으면 새 Google Drive 경로를 기본값으로 사용한다. `GMTS_SOURCE_DIR` 환경변수로 다른 환경의 경로를 덮어쓸 수 있다.

- [ ] **Step 1: 정규화 함수의 실패 테스트 작성**

```python
def test_blank_declared_count_stays_unknown(self) -> None:
    self.assertIsNone(parse_declared_count("A. Unloading Vessels :"))
    self.assertEqual(parse_declared_count("B. Incoming Vessel: 3"), 3)

def test_price_qualifiers_are_preserved(self) -> None:
    self.assertEqual(parse_price("No offer")["qualifier"], "no-offer")
    self.assertIsNone(parse_price("No offer")["amount"])
    self.assertEqual(parse_price("$1,750 Level (No Deal)")["qualifier"], "no-transaction")

def test_source_typos_are_normalized(self) -> None:
    self.assertEqual(parse_iso_date("2026/08/06 MT"), "2026-08-06")
    self.assertEqual(parse_measure("6.295.630 MT"), 6295.630)
    self.assertIsNone(parse_measure("TBA"))
```

- [ ] **Step 2: RED 확인**

Run: `python3 scripts/test_build_gmts_dashboard.py`

Expected: FAIL because `build_gmts_dashboard.py` and the normalization functions do not exist.

- [ ] **Step 3: 최소 정규화 함수 구현**

```python
def parse_price(raw: str | None) -> dict[str, object]:
    text = (raw or "").strip()
    lowered = text.lower()
    if "no price" in lowered:
        qualifier = "no-price"
    elif "no offer" in lowered:
        qualifier = "no-offer"
    elif "no transaction" in lowered or "no deal" in lowered:
        qualifier = "no-transaction"
    elif "around" in lowered:
        qualifier = "around"
    elif "under" in lowered:
        qualifier = "under"
    elif "old contract" in lowered:
        qualifier = "old-contract"
    elif "level" in lowered:
        qualifier = "level"
    else:
        qualifier = "quoted"
    amount = None if qualifier in {"no-price", "no-offer"} else parse_integer(text)
    return {
        "amount": amount,
        "currencySymbol": "$",
        "basisUnit": None,
        "qualifier": qualifier,
        "rawText": text,
    }
```

- [ ] **Step 4: 전체 PDF 파서·품질 게이트 구현**

```python
def build_dashboard(source_dir: Path) -> dict[str, object]:
    reports = sorted(
        (parse_report(path) for path in source_dir.glob("*.pdf")),
        key=lambda report: report["reportDate"],
    )
    validate_weekly_sequence(reports)
    revisions = detect_volume_revisions(reports)
    return {
        "schemaVersion": 1,
        "metadata": build_metadata(reports),
        "weekly": [compact_weekly(report) for report in reports],
        "latest": build_latest(reports[-1]),
        "volumeHistory": build_volume_history(reports, revisions),
        "sources": [report["source"] for report in reports],
        "qualityFlags": build_quality_flags(reports, revisions),
    }
```

`package.json`에는 기본 경로를 사용하는 수동 동기화 명령을 추가한다.

```json
{
  "scripts": {
    "sync:gmts": "python3 scripts/build_gmts_dashboard.py"
  }
}
```

- [ ] **Step 5: GREEN 및 실원문 생성 확인**

Run:

```bash
python3 scripts/test_build_gmts_dashboard.py
npm run sync:gmts
```

Expected:

```text
Ran 3 tests
OK
GMTS dashboard generated: data/gmts_dashboard.json (30 reports, latest 2026-08-12)
```

- [ ] **Step 6: 정제 JSON을 명시적으로 추적**

```bash
git add -f data/gmts_dashboard.json
git add scripts/build_gmts_dashboard.py scripts/test_build_gmts_dashboard.py scripts/requirements-gmts.txt package.json
git commit -m "feat(gmts): normalize weekly report archive [Codex]"
```

### Task 2: `lib/data` SSOT와 데이터 계약

**Files:**
- Create: `lib/data/gmts.ts`
- Create: `__tests__/gmts-dashboard-data.test.ts`

**Interfaces:**
- Consumes: `data/gmts_dashboard.json`
- Produces: `getGmtsDashboard(): GmtsDashboardData`

- [ ] **Step 1: 현재 30건 아카이브와 최신 수치의 실패 테스트 작성**

```typescript
it('preserves the current GMTS archive and latest source anchors', () => {
  const data = getGmtsDashboard();
  expect(data.metadata).toMatchObject({
    reportCount: 30,
    coverageStart: '2026-01-21',
    coverageEnd: '2026-08-12',
    latestReportDate: '2026-08-12',
  });
  expect(data.latest.port.active).toMatchObject({ declaredCount: null, recordCount: 0 });
  expect(data.latest.port.completed).toMatchObject({ declaredCount: 2, recordCount: 2 });
  expect(data.latest.port.incoming).toMatchObject({ declaredCount: 3, recordCount: 3 });
  expect(data.sources.at(-1)?.sha256).toBe(
    'e84ad3bb26ebe05e863467bff3f4507775a8cf4b04adefa8026eb3414e1e5243',
  );
});
```

- [ ] **Step 2: RED 확인**

Run: `npx vitest run __tests__/gmts-dashboard-data.test.ts`

Expected: FAIL because `lib/data/gmts.ts` does not exist.

- [ ] **Step 3: 타입과 getter 구현**

```typescript
import rawDashboard from '../../data/gmts_dashboard.json';

export interface GmtsDashboardData {
  schemaVersion: 1;
  metadata: GmtsMetadata;
  weekly: GmtsWeeklySnapshot[];
  latest: GmtsLatestSnapshot;
  volumeHistory: GmtsVolumeHistory;
  sources: GmtsSource[];
  qualityFlags: GmtsQualityFlag[];
}

export function getGmtsDashboard(): GmtsDashboardData {
  return rawDashboard as GmtsDashboardData;
}
```

- [ ] **Step 4: GREEN·아키텍처 게이트 확인**

Run:

```bash
npx vitest run __tests__/gmts-dashboard-data.test.ts __tests__/architecture-guards.test.ts
python3 scripts/check_data_imports.py
```

Expected: PASS; `components/`의 JSON 직접 import 0건, GMTS JSON git 추적 확인.

- [ ] **Step 5: 커밋**

```bash
git add lib/data/gmts.ts __tests__/gmts-dashboard-data.test.ts
git commit -m "feat(gmts): add typed weekly data contract [Codex]"
```

### Task 3: 실시간 운영 메뉴·잠금·라우팅

**Files:**
- Modify: `lib/dashboard-registry.ts`
- Modify: `app/page.tsx`
- Modify: `__tests__/dashboard-registry.test.ts`

**Interfaces:**
- Consumes: `DashboardSection`, `ActiveMenu`, `SIDEBAR_SECTIONS`
- Produces: 기존 `operation` 섹션의 `ActiveMenu` member `'gmts'`, protected `/gmts`, `heroOnly` 잠금 티저

- [ ] **Step 1: 메뉴 위치·잠금·사이트맵 제외의 실패 테스트 작성**

```typescript
expect(SIDEBAR_SECTIONS.map((section) => section.title)).toEqual([
  '📡 실시간 운영',
]);
expect(SIDEBAR_SECTIONS[0].items.map((item) => item.key)).toEqual([
  'market',
  'fleet',
  'unloading',
  'logistics',
  'panofi',
  'cosmo',
  'bangkok-office',
  'gmts',
  'mail',
]);
expect(PROTECTED_OPERATION_MENU_KEYS).toEqual([
  'fleet',
  'unloading',
  'logistics',
  'bangkok-office',
  'gmts',
]);
expect(PUBLIC_DASHBOARD_ROUTES).not.toContain('gmts');
expect(DASHBOARD_PANEL_ORDER).toContain('gmts');
```

- [ ] **Step 2: RED 확인**

Run: `npx vitest run __tests__/dashboard-registry.test.ts`

Expected: FAIL because the GMTS menu is absent between `bangkok-office` and `mail`.

- [ ] **Step 3: 레지스트리 구현**

```typescript
{
  key: 'gmts',
  title: 'GMTS 주간보고',
  section: 'operation',
  accent: 'cyan',
  requiresOperationAccess: true,
  sidebar: { icon: 'Factory', label: 'GMTS 주간보고' },
}
```

`shortcutOrder`가 없는 보호 메뉴가 맨 앞으로 이동하지 않도록 최신 `origin/main`에 이미 있는 보호 메뉴 전용 fallback을 그대로 재사용한다.

```typescript
function protectedMenuOrderOf(menu: DashboardMenuConfigShape): number {
  return menu.shortcutOrder ?? Number.MAX_SAFE_INTEGER;
}
```

- [ ] **Step 4: 명령 팔레트·패널 연결**

```typescript
const GmtsDashboard = dynamic(() => import('../components/gmts/GmtsDashboard'));
```

기존 `dashboardPanels` 객체에는 다음 속성을 추가한다.

```typescript
gmts: <GmtsDashboard />,
```

잠금 화면에서도 최신 KPI 히어로만 보이도록 `heroTeaserPanels.gmts = <GmtsDashboard heroOnly />`를 함께 추가한다.

- [ ] **Step 5: GREEN·타입 확인**

Run:

```bash
npx vitest run __tests__/dashboard-registry.test.ts
npm run typecheck
```

Expected: PASS; `gmts`는 `방콕사무소` 다음·`메일` 이전에 1번만 표시되고 공개 사이트맵에 없음.

- [ ] **Step 6: 커밋**

```bash
git add lib/dashboard-registry.ts app/page.tsx __tests__/dashboard-registry.test.ts
git commit -m "feat(gmts): place menu below Bangkok office [Codex]"
```

### Task 4: 순수 표현 모델

**Files:**
- Create: `lib/gmts-presentation.ts`
- Create: `__tests__/gmts-presentation.test.ts`

**Interfaces:**
- Consumes: `GmtsDashboardData`
- Produces: `buildGmtsPresentation(data: GmtsDashboardData): GmtsPresentation`

- [ ] **Step 1: null·qualifier·동기 비교 실패 테스트 작성**

```typescript
it('labels blank active-vessel counts as unconfirmed rather than zero', () => {
  const view = buildGmtsPresentation(getGmtsDashboard());
  expect(view.hero.activeVessels).toEqual({ value: '미확정', tone: 'warning' });
});

it('keeps missing source units visible', () => {
  const view = buildGmtsPresentation(getGmtsDashboard());
  expect(view.hero.gspPrice.unit).toBe('원문 분모 미기재');
  expect(view.hero.ytdVolume.unit).toBe('원문 단위 미기재');
});

it('derives the current comparable-volume movements', () => {
  const view = buildGmtsPresentation(getGmtsDashboard());
  expect(view.hero.ytdVolume.deltaPct).toBeCloseTo(-5.38, 2);
  expect(view.monthlyVolume.find((row) => row.month === '7월')?.yearOverYearPct).toBeCloseTo(-21.30, 2);
});
```

- [ ] **Step 2: RED 확인**

Run: `npx vitest run __tests__/gmts-presentation.test.ts`

Expected: FAIL because `buildGmtsPresentation` does not exist.

- [ ] **Step 3: 최소 표현 모델 구현**

```typescript
export function buildGmtsPresentation(data: GmtsDashboardData): GmtsPresentation {
  const latest = data.latest;
  const current2026 = data.volumeHistory.annual.find((row) => row.year === 2026);
  const prior2025 = data.volumeHistory.annual.find((row) => row.year === 2025);
  const comparableMonths = current2026?.months.filter((value) => value !== null).length ?? 0;
  const currentYtd = sumKnown(current2026?.months.slice(0, comparableMonths) ?? []);
  const priorYtd = sumKnown(prior2025?.months.slice(0, comparableMonths) ?? []);

  return {
    hero: {
      activeVessels: latest.port.active.declaredCount === null
        ? { value: '미확정', tone: 'warning' }
        : { value: `${latest.port.active.declaredCount}척`, tone: 'neutral' },
      ytdVolume: {
        value: currentYtd.toLocaleString('ko-KR'),
        unit: '원문 단위 미기재',
        deltaPct: percentChange(currentYtd, priorYtd),
      },
    },
    portTrend: buildPortTrend(data.weekly),
    priceTrend: buildPriceTrend(data.weekly),
    canneryTrend: buildCanneryTrend(data.weekly),
    monthlyVolume: buildMonthlyVolume(data.volumeHistory),
  };
}
```

- [ ] **Step 4: GREEN 확인**

Run: `npx vitest run __tests__/gmts-presentation.test.ts`

Expected: PASS with `미확정`, `-5.38`, `-21.30`, and both missing-unit labels preserved.

- [ ] **Step 5: 커밋**

```bash
git add lib/gmts-presentation.ts __tests__/gmts-presentation.test.ts
git commit -m "feat(gmts): derive decision presentation model [Codex]"
```

### Task 5: GMTS 대시보드 UI

**Files:**
- Create: `components/gmts/GmtsDashboard.tsx`
- Create: `components/gmts/GmtsDashboard.module.css`
- Create: `__tests__/gmts-dashboard-render.test.tsx`

**Interfaces:**
- Consumes: `getGmtsDashboard()`, `buildGmtsPresentation()`
- Produces: default export `GmtsDashboard`

- [ ] **Step 1: 실제 컴포넌트 렌더 실패 테스트 작성**

```typescript
import { renderToStaticMarkup } from 'react-dom/server';
import GmtsDashboard from '../components/gmts/GmtsDashboard';

it('renders the GMTS decision surface with uncertainty visible', () => {
  const html = renderToStaticMarkup(<GmtsDashboard />);
  expect(html).toContain('GMTS 제너럴산토스 주간보고');
  expect(html).toContain('운영 기준일 미기재');
  expect(html).toContain('자료 미확정');
  expect(html).toContain('항만·선박');
  expect(html).toContain('공장·재고');
  expect(html).toContain('가격·반입');
  expect(html).toContain('데이터 품질');
  expect(html).not.toContain('$/MT');
});
```

- [ ] **Step 2: RED 확인**

Run: `npx vitest run __tests__/gmts-dashboard-render.test.tsx`

Expected: FAIL because `GmtsDashboard` does not exist.

- [ ] **Step 3: 헤더·Hero·탭 프레임 구현**

```tsx
'use client';

export default function GmtsDashboard({ heroOnly = false }: { heroOnly?: boolean } = {}) {
  const data = getGmtsDashboard();
  const view = buildGmtsPresentation(data);
  const [activeTab, setActiveTab] = useState<GmtsTab>('summary');

  if (data.weekly.length === 0) {
    return <GmtsEmptyState />;
  }

  return (
    <main className={styles.dashboard}>
      <HeroZone
        variant="kpi"
        title="GMTS 제너럴산토스 주간보고"
        subtitle={`보고일 ${data.metadata.latestReportDate} · 운영 기준일 미기재`}
        primaryKpi={{ label: '생산 가동률', value: data.latest.canneryTotal.productionUtilizationPct, unit: '(%)' }}
        secondaryKpis={[
          { label: '하역 완료', value: data.latest.port.completed.recordCount, unit: '(척)' },
          { label: '입항 예정', value: data.latest.port.incoming.recordCount, unit: '(척)' },
          { label: '창고 이용률', value: data.latest.canneryTotal.storageUtilizationPct, unit: '(%)' },
        ]}
        warning={{
          title: '자료 해석 주의',
          lines: ['하역 중 건수 자료 미확정', '가격 분모·반입량 단위 원문 미기재'],
        }}
        minHeight={320}
      />
      {heroOnly ? null : (
        <>
          <PillTabs tabs={GMTS_TABS} activeKey={activeTab} onChange={(key) => setActiveTab(key as GmtsTab)} />
          <GmtsTabPanel activeTab={activeTab} data={data} view={view} />
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 4: WidgetCard 6개와 품질 패널 구현**

```tsx
<WidgetCard
  title="GSP·Non-GSP 가격 추세"
  icon={TrendingUp}
  iconColor="#38bdf8"
  pillar="S1"
  unit="($·원문 분모 미기재)"
  cardDesc="GMTS 주간보고의 GSP·Non-GSP Non-MSC 가격과 원문 qualifier 추세"
  telemetry={{ status: 'STATIC', syncDate: data.metadata.latestReportDate, label: '정적' }}
  chart={<GmtsPriceChart data={view.priceTrend} />}
  takeaway={{
    situation: PRICE_SITUATION,
    actionPlan: PRICE_ACTION,
    source: 'GMTS Weekly Report 2026-01-21~2026-08-12',
  }}
/>
```

- [ ] **Step 5: 접근성·반응형 스타일 구현**

```css
.widgetGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.tableScroll {
  max-width: 100%;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .widgetGrid {
    grid-template-columns: minmax(0, 1fr);
  }

  .heroGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .heroGrid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 6: GREEN·S-Grade 확인**

Run:

```bash
npx vitest run __tests__/gmts-dashboard-render.test.tsx __tests__/gmts-presentation.test.ts
python3 scripts/check_s_grade.py --strict gmts/GmtsDashboard.tsx
npm run typecheck
npm run lint
```

Expected: PASS; S-Grade closure 0 violations, ESLint 0 errors.

- [ ] **Step 7: 커밋**

```bash
git add components/gmts/GmtsDashboard.tsx components/gmts/GmtsDashboard.module.css __tests__/gmts-dashboard-render.test.tsx
git commit -m "feat(gmts): build weekly decision dashboard [Codex]"
```

### Task 6: 로컬 브라우저 QA·전체 게이트·핸드오프

**Files:**
- Modify: `HANDOFF.md`
- Optional report output: `/private/tmp/gmts-browser-qa.json`

**Interfaces:**
- Consumes: 완성된 `/gmts`
- Produces: 로컬 검증 근거와 미배포 핸드오프

- [ ] **Step 1: 전체 게이트 실행**

```bash
python3 scripts/test_build_gmts_dashboard.py
npm run verify
```

Expected: Python tests PASS; lint → typecheck → Vitest → API cache → build → bundle 모두 exit 0.

- [ ] **Step 2: 로컬 production 서버 실행**

```bash
npm run start -- --hostname 127.0.0.1 --port 3026
```

- [ ] **Step 3: 잠금 세션 QA**

Puppeteer로 `http://127.0.0.1:3026/gmts`를 열고 다음을 확인한다.

```javascript
await page.goto('http://127.0.0.1:3026/gmts', { waitUntil: 'networkidle0' });
const lockedText = await page.evaluate(() => document.body.innerText);
assert(lockedText.includes('전체 메뉴 접근 확인'));
assert(lockedText.includes('GMTS 제너럴산토스 주간보고'));
assert(!lockedText.includes('2026년 1~7월'));
```

- [ ] **Step 4: 허용 세션 데스크톱 QA**

```javascript
await page.evaluate(() => sessionStorage.setItem('silla-operation-access', 'granted'));
await page.reload({ waitUntil: 'networkidle0' });
const unlockedText = await page.evaluate(() => document.body.innerText);
assert(unlockedText.includes('GMTS 제너럴산토스 주간보고'));
assert(unlockedText.includes('자료 미확정'));
assert(unlockedText.includes('원문 단위 미기재'));
assert((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) === 0);
```

- [ ] **Step 5: 390px QA**

```javascript
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.reload({ waitUntil: 'networkidle0' });
assert((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) === 0);
const tabCount = await page.$$eval('[role="tablist"] button', (buttons) => buttons.length);
assert(tabCount === 5);
```

데스크톱·390px 모두에서 console error 0, page error 0, 가로 overflow 0을 요구한다.

- [ ] **Step 6: 항만·공장·가격·반입량 눈으로 대조**

2026-08-12 PDF 렌더링과 `/gmts` 화면을 나란히 두고 다음 값을 대조한다.

```text
하역 완료 2
입항 예정 3
생산 895 / 1,095 / 82%
재고 17,550 / 40,600 / 43%
Non-GSP 1,900
GSP 2,025
2026 1~7월 63,736
```

- [ ] **Step 7: HANDOFF 갱신·최종 커밋**

```bash
git add HANDOFF.md
git commit -m "docs: record GMTS dashboard verification [Codex]"
```

HANDOFF에 원문 범위, 단위 미기재, 반입량 revision, 브라우저 QA, 미배포 상태를 모두 기록한다.

---

## 7. 완료 기준

- [ ] 사이드바 `실시간 운영`에서 `방콕사무소 → GMTS 주간보고 → 메일` 순서로 표시된다.
- [ ] `/gmts`는 잠금 전 Hero KPI 티저만 렌더하고, 탭·차트·표·상세 수치는 세션 허용 후에만 렌더한다.
- [ ] 30건·38쪽·30개 SHA-256이 출처 manifest와 일치한다.
- [ ] 8/12 하역 중 건수는 `0`이 아닌 `미확정`으로 보인다.
- [ ] GSP·Non-GSP 가격에 `$/MT`를 붙이지 않고 원문 분모 미기재를 고지한다.
- [ ] Gensan 반입량에 `MT`를 붙이지 않고 원문 단위 미기재를 고지한다.
- [ ] 2월 반입량 6,220→11,968 수정 이력이 보존된다.
- [ ] Celebes 122%는 자동 정정되지 않고 원문 확인 필요로 표시된다.
- [ ] WidgetCard 6개의 `cardDesc`·`STATIC`·SIT/TAK·pillar·단위 표기가 S-Grade strict를 통과한다.
- [ ] 데스크톱·390px에서 가로 overflow 0, console error 0, page error 0이다.
- [ ] `npm run verify`가 통과한다.
- [ ] 프로덕션 배포는 수행하지 않는다.

---

## 8. 승인 확정 사항

사용자가 구현을 승인했으므로 다음 4개를 v1 확정안으로 적용한다.

1. **접근:** 기존 운영 메뉴와 같은 세션 비밀번호 잠금 적용
2. **단위:** 가격 분모·반입량 단위는 원문 미기재로 명시하고 추정 금지
3. **기타 서술:** 개인 휴가·출장 정보가 있는 `Other` 섹션은 v1 화면에서 제외
4. **갱신:** 신규 PDF 수신 시 `npm run sync:gmts` 수동 갱신; 자동 스케줄러는 별도 검토

실행 순서는 타입 의존성을 고려해 `Task 1 → Task 2 → Task 4 → Task 5 → Task 3 → Task 6`으로 한다. 메뉴 연결 Task 3은 `GmtsDashboard`가 생성된 뒤 수행한다.
