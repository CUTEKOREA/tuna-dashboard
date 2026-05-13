---
name: widget-intelligence-pipeline
description: "대시보드 위젯 인텔리전스 파이프라인 오케스트레이터. 위젯 업데이트, 신규 위젯 생성, 대시보드 품목 추가 등 대시보드 관련 모든 작업의 전체 워크플로우를 조율한다. '위젯 업데이트', '대시보드 수정', '새 위젯 추가', '품목 데이터 갱신', '대시보드 개선', '다시 실행', '재실행', '결과 개선', '이전 결과 기반으로' 등의 요청 시 사용."
---

# Widget Intelligence Pipeline — 오케스트레이터

대시보드 위젯의 전체 생명주기(데이터 수집 → JSON 변환 → 구현 → 감사 → 배포)를 조율하는 오케스트레이터 스킬.

## 아키텍처: 파이프라인 + 전문가 풀 + 생성-검증

```
Phase 1 (Researcher) → Phase 2 (Data Engineer) → Phase 3 (Builder) → Phase 4 (Auditor) → Phase 5 (Deployer)
                                                        ↑                    │
                                                        └── 감점 피드백 ──────┘
```

## 실행 모드: 순차적 역할 전환 (Antigravity)

Antigravity 환경에서는 단일 에이전트가 Phase별로 역할을 전환하며 순차 실행한다. 각 Phase의 산출물은 `_workspace/` 폴더에 파일로 저장하여 다음 Phase에 전달한다.

## Phase 0: 컨텍스트 확인

워크플로우 시작 시 기존 산출물 존재 여부를 확인하여 실행 모드를 결정한다:

| 상태 | 실행 모드 |
|------|-----------|
| `_workspace/` 미존재 | **초기 실행** — Phase 1부터 전체 실행 |
| `_workspace/` 존재 + 사용자가 부분 수정 요청 | **부분 재실행** — 해당 Phase만 재실행 |
| `_workspace/` 존재 + 사용자가 새 입력 제공 | **새 실행** — 기존 `_workspace/`를 `_workspace_prev/`로 이동 |

## Phase 1: 리서치 (Researcher 모드)

1. 사용자 요청에서 **품목명, 위젯 주제, 데이터 요구사항** 파악
2. `.harness/agents/researcher.md`의 원칙에 따라 데이터 수집:
   - NotebookLM MCP → 품목별 소스 쿼리
   - 웹 검색 → 실시간 시장 뉴스
   - 기존 `data/` 폴더 → 현재 데이터 상태 확인
3. 산출물: `_workspace/01_researcher_{commodity}_{topic}.md`

## Phase 2: 데이터 엔지니어링 (Data Engineer 모드)

1. Phase 1 산출물 읽기
2. `.harness/agents/data-engineer.md`의 원칙에 따라:
   - **API 우선 검토:** 공공 API(KAMIS, 관세청 등) 연동 가능 여부 확인
   - API 가능 → 라이브 파이프라인 구현
   - API 불가 → Static JSON 생성 + `[Static Fallback]` 태그
3. JSON 스키마 표준에 맞춰 데이터 변환
4. 산출물: `data/{commodity}_w{N}_{topic}.json`

## Phase 3: 위젯 구현 (Builder 모드)

1. Phase 2 JSON 데이터 확인
2. `.harness/agents/builder.md`의 원칙에 따라:
   - 6-Part 보고 아키텍처로 위젯 구현
   - 글라스모피즘 디자인 시스템 준수
   - Recharts 차트 + TakeawayBox(SIT/STRAT)
3. 산출물: `components/{Commodity}{Widget}.tsx`

## Phase 4: 감사 (Auditor 모드 — 적대적 전환!)

**⚠️ 이 Phase에서 모드를 적대적으로 전환한다.**
"Phase 3에서 내가 만든 위젯은 틀렸을 것이다"를 전제로 시작한다.

1. `npm run build` 강제 실행 → 컴파일 에러 0건 확인
2. `.harness/agents/auditor.md`의 4축 100점 평가 실행:
   - SRC: JSON의 `dataSource`와 실제 기관 존재 여부 대조
   - FRS: 데이터 연도 확인
   - VRF: JSON 수치와 InfoTooltip 인용 수치 1:1 대조
   - INT: SIT/STRAT 텍스트가 차트 트렌드와 논리적으로 정합한지 검증
3. 등급 판정 → S/A면 Phase 5 진행, B 이하면 Phase 3로 리턴

```
Phase 4 판정:
├── S/A 등급 → Phase 5 (배포 대기)
├── B 등급 → 개선 권고 + 조건부 Phase 5
└── C/D 등급 → Phase 1 또는 Phase 3로 리턴
```

4. 산출물: `_workspace/04_auditor_{commodity}_report.md`

## Phase 5: 배포 (Deployer 모드 — 사용자 승인 필수)

**이 Phase는 사용자가 명시적으로 "배포"를 요청한 경우에만 실행한다.**

1. 배포 게이트 확인:
   - Gate 1: `npm run build` PASS
   - Gate 2: Auditor 등급 A 이상
   - Gate 3: 사용자 명시적 "배포" 요청
2. Vercel MCP로 프로덕션 배포
3. 산출물: `_workspace/05_deployer_{commodity}_{date}.md`

## 데이터 전달 프로토콜

| Phase | 전략 | 산출물 경로 |
|-------|------|-------------|
| 1→2 | 파일 기반 | `_workspace/01_researcher_*.md` |
| 2→3 | 파일 기반 | `data/*.json` |
| 3→4 | 파일 기반 | `components/*.tsx` |
| 4→5 | 파일 기반 | `_workspace/04_auditor_*.md` |
| 4→1,3 | 피드백 루프 | `_workspace/04_auditor_*.md` (감점 사유) |

## 에러 핸들링

| 에러 유형 | 전략 |
|-----------|------|
| NotebookLM 쿼리 실패 | 웹 검색으로 폴백, 1회 재시도 |
| API 연동 실패 | Static JSON 폴백 생성 |
| 빌드 에러 | 에러 로그 수집 → Phase 3 재실행 |
| 감사 등급 C 이하 | 감점 사유 분석 → 해당 Phase 재실행 |
| 배포 실패 | 에러 로그 → 사용자 보고, 롤백 제안 |

## 테스트 시나리오

### 정상 흐름
```
사용자: "참치 대시보드에 2026년 방콕 SKJ 가격 위젯 추가해줘"
→ Phase 1: NotebookLM '참치' 노트북에서 SKJ 가격 데이터 쿼리
→ Phase 2: tuna_skj_price_2026.json 생성
→ Phase 3: TunaSkjPrice2026.tsx 구현 (6-Part)
→ Phase 4: 빌드 PASS, 등급 A (87점)
→ Phase 5: (사용자 "배포" 요청 대기)
```

### 에러 흐름
```
사용자: "오징어 위젯 신뢰도 개선해줘"
→ Phase 0: 기존 _workspace/ 확인 → 부분 재실행 모드
→ Phase 4: 기존 위젯 재감사 → W3 등급 C (58점) 발견
→ Phase 1: W3 데이터 추가 조사 (Researcher 재실행)
→ Phase 2: JSON 업데이트
→ Phase 3: TSX 수정
→ Phase 4: 재감사 → W3 등급 A (82점) ✅
```
