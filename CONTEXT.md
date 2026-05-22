# 글로벌 무역 인텔리전스 대시보드 컨텍스트

신라교역(Silla Co., "참치왕국")을 위한 농·축·수산 commodity 공급망 인텔리전스 대시보드 프로젝트의 도메인 용어집입니다. 운영 규칙·디자인 사양은 `COMPREHENSIVE_RULEBOOK.md`, `UI_RULES.md`를 참조하고, 본 문서는 **용어 그 자체**만 정의합니다.

## Language

### 위젯·대시보드 구조

**위젯**:
한 commodity의 단일 인사이트(차트 + SIT + TAK)를 카드 형태로 캡슐화한 React 컴포넌트.
_Avoid_: 컴포넌트, 차트, 카드, 패널

**대시보드**:
한 commodity의 위젯들을 5-Pillar 구조로 합성해 한 화면을 구성하는 진입점 컴포넌트.
_Avoid_: 페이지, 뷰, 스크린

**TakeawayBox**:
위젯 하단에서 SIT + TAK 2-Step 내러티브를 렌더링하는 의무 컴포넌트.
_Avoid_: 요약박스, 결론영역

**SIT**:
TakeawayBox 안의 객관 현황 진단 (2~3문장, 숫자 포함).
_Avoid_: Situation 풀네임, 현황, 분석

**TAK**:
TakeawayBox 안의 C레벨 실행 지침 (1~2문장, 수익성·리스크 기반).
_Avoid_: Takeaway 풀네임, 액션, 결론

**cardDesc**:
위젯 카드 헤더 아래의 산출 방법론·출처 1줄 캡션.
_Avoid_: 부제, subtitle, caption

**TelemetryBadge**:
위젯 데이터 신선도 표시 (`LIVE`/`SYNCED`/`STATIC` + syncDate).
_Avoid_: 상태배지, 라벨, 인디케이터

**TermTooltip**:
전문 약어·해역명·어종명을 한글 풀네임으로 해설하는 hover 툴팁.
_Avoid_: 툴팁, popover

### 아키텍처·표준

**Universal 5-Pillar**:
모든 commodity 대시보드의 위젯을 배치하는 5단 구조 — 원료 수급 / 가공·생산 / 물류·통관 / 판매·수요 / ESG·지속가능성.
_Avoid_: 카테고리, 섹션, 5축

**S-Grade**:
C레벨 임원진에게 노출 가능한 품질 수준을 정의한 룰북 V4.1 표준.
_Avoid_: Premium, top-tier, A-grade

**Forensic Audit**:
신규 위젯의 4-Axis(출처·신선도·검증·통합) 평가로 평균 A등급(85+) 미달 시 배포 차단하는 사전 게이트.
_Avoid_: 코드리뷰, QA, 검증

**Harness Engineering**:
Loading/Error/Empty 예외 상태를 코드 작성 *전에* 정의하고 가시성을 확보하는 작업 방식. 통칭 "하네스 출동".
_Avoid_: 에러처리, defensive coding

**Troika Workflow**:
GStack(100% 완성 지향) + Superpowers(TDD/SDD) 두 축을 함께 굴리는 개발 방식.
_Avoid_: TDD, Agile, Workflow

### 데이터·표현

**Live API First**:
휴리스틱·추정 데이터를 금하고 실시간 API(KCS, UN Comtrade, KAMIS, FAOSTAT 등) 연동을 의무화하는 원칙.
_Avoid_: real-time, API-driven

**HSK 10자리**:
KCS(관세청) 호출에 의무로 쓰는 10자리 한국 HS 코드. 4·6자리 HS는 글로벌 집계 보조용으로만 허용.
_Avoid_: HS Code, 통관코드

**시그니처 그라디언트**:
commodity별로 고정된 카드 헤더 색상 매핑 (참치=cyan→blue, 새우=emerald→teal, 오징어=purple→pink, 망고스틴=purple→fuchsia→pink, 닭고기=amber→orange→red).
_Avoid_: 테마컬러, 팔레트, 색상

**Glassmorphism**:
War Room/DEFCON 컨셉의 다크 베이스에 반투명·blur로 깊이감을 주는 시각 표준 (`bg-gray-900/95` + `bg-white/5 backdrop-blur-md`).
_Avoid_: 다크모드, 투명효과

**Smart Rotation**:
X축 한글 라벨이 7자를 초과하는 항목이 4개 이상일 때 자동 적용되는 `angle={-45}` 회전 + 하단 마진 확보 패턴.
_Avoid_: 라벨회전, tilt

**Closure** (검증 맥락):
한 대시보드가 transitively import하는 모든 컴포넌트의 집합. S-Grade 검증의 자연스러운 단위.
_Avoid_: dependency graph, 의존성

### AI 자원 분배 (멀티-에이전트 토폴로지)

**3-요금제 분배**:
Claude Max20 + Google AI Ultra + OpenAI 3개 구독을 OMO 역할별로 분리해 결제선 독립·자기검증 편향 차단·ToS 깨끗하게 운영하는 토폴로지. ADR 0006+0007 결정.
_Avoid_: multi-model, 모델 라우팅, 분산

**Sisyphus**:
OMO 오케스트레이터 역할. Plan 수립·병렬 위임 담당. 모델: Antigravity Claude Opus 4.6 thinking (1순위) → Antigravity Gemini 3.1 Pro (락 시).
_Avoid_: planner, 조정자

**Hephaestus**:
OMO 딥 워커 역할. 자율 탐색·코드 작성·실행 담당. 모델: Antigravity Gemini 3 Pro (1순위).
_Avoid_: worker, executor

**Oracle**:
OMO 리뷰어 역할. 위젯 머지 전 의무 채점. 작성 모델과 분리해 자기검증 편향 차단. 모델: OpenAI GPT-4o.
_Avoid_: reviewer, checker, QA

**Librarian**:
OMO non-agentic batch 워커 역할. `max_tools=0`으로 도구 차단, 텍스트 in/out만. Long-context audit·codemod plan generator·cardDesc fan-out·PDF→MD 변환·번역 담당. Antigravity 락 무관. 모델: Gemini Direct API ($100/월 무료 — gemini-3.5-flash 단순 / gemini-3.1-pro-preview heavy). ADR 0007.
_Avoid_: 사서, 보조, helper

**Antigravity 락**:
Google AI Ultra의 OAuth 쿼터에서 Claude Opus 4.6 thinking이 일 6-10 호출 후 도달하는 일시 정지 상태. 17:06 reset 실측. 이 상태에서 Sisyphus는 Antigravity Gemini 3.1 Pro로, Hephaestus는 Antigravity Gemini 3.1 Pro로 fallback. Librarian은 Direct API라 락 무관.
_Avoid_: 쿼터 초과, throttle

**Gemini Direct API**:
Antigravity OAuth가 아닌 `GOOGLE_GENERATIVE_AI_API_KEY` 직접 호출 경로. 매월 $100 무료 크레딧(AI Ultra 포함). Librarian 전용. *agentic tool-use 약함* 함정(55분 hang 관찰)으로 1순위 코딩 task 금지.
_Avoid_: Vertex AI, Gemini CLI

### 비즈니스 도메인

**Silla Co.**:
프로젝트 발주처 신라교역. 참치 원물·가공·유통의 국내 최대 사업자.
_Avoid_: 발주사, 신라, 회사

**자숙액**:
참치 통조림 가공 후 폐기되던 부산물(by-product). 참치액(tuna extract)의 원료이자 "제로 코스트 마진"의 원천.
_Avoid_: 부산물, 추출액

**카니발리제이션**:
참치액 시장이 전통 간장 시장을 직접 침식하는 현상. 두 시장의 X자 교차 시각화의 대상.
_Avoid_: 잠식, 대체, replacement

## Relationships

- 한 **대시보드**는 여러 **위젯**을 import하며, 그 합집합을 **Closure**라 한다
- 한 **위젯**은 정확히 하나의 **TakeawayBox**를 포함하고, 하나의 **TelemetryBadge**를 부착한다
- 한 **TakeawayBox**는 정확히 하나의 **SIT**와 하나의 **TAK**로 구성된다
- 모든 **위젯**은 **Universal 5-Pillar** 중 정확히 하나의 pillar에 귀속된다
- **Forensic Audit**는 **위젯** 단위로 수행되며 **TelemetryBadge**의 상태를 입력으로 받는다
- **시그니처 그라디언트**는 commodity 1개당 1개로 매핑된다 (1:1)

## Example dialogue

> **개발자:** "TunaInsightsDashboard에 새 위젯을 만들면 어떤 pillar에 넣어야 하나요?"
> **도메인 담당:** "그 위젯이 보여주는 게 어획·작황이면 1번 원료 수급, 가공 수율이면 2번 가공·생산입니다. 한 위젯이 두 pillar에 걸치면 위젯이 너무 큰 거니까 쪼개세요."
>
> **개발자:** "그럼 위젯 안에 SIT/TAK는 무조건 둘 다 필요한가요?"
> **도메인 담당:** "TakeawayBox가 있으면 SIT 2~3문장 + TAK 1~2문장이 항상 짝입니다. 한쪽만 있으면 W-03 위반입니다."

## Flagged ambiguities

- "Takeaway"가 **TakeawayBox**(컴포넌트)와 **TAK**(그 내부 텍스트) 두 의미로 혼용됨 → 컴포넌트는 `TakeawayBox`, 텍스트만 가리킬 땐 `TAK`로 분리.
- "테마"가 **시그니처 그라디언트**(commodity 색상)와 **Glassmorphism**(전역 시각 표준) 양쪽에 쓰였음 → 색상은 "그라디언트", 시각 표준은 "Glassmorphism"로 분리.
- "표준"이 **S-Grade**(품질 등급)와 **Universal 5-Pillar**(구조 표준) 양쪽에 모호하게 쓰였음 → 품질은 S-Grade, 구조는 5-Pillar로 분리.
