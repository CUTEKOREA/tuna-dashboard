# L-01 영문 잔존 정정 큐 (2026-05-23 audit 기반)

> Librarian (gemini-3.5-flash) 122 파일 audit 결과 → 위반 ≥10 우선순위 정정 큐.
> Top 5 완료 (commit 4427579 / d8eb9a8 / e7ae5f7).

## ✅ Top 5 완료 (Claude Code 수작업, 2026-05-23)

| 파일 | audit 위반 | 정정 | commit | 비고 |
|---|---:|---:|---|---|
| CocoaDashboard | 21 | 10 + JS 버그 1 | `4427579` | 11 false-positive (이미 풀네임 병기) |
| SquidTab1Widgets | 20 | 9 | `d8eb9a8` | source 11건 외부 자료 원문 보존 |
| WhelkDashboard | 18 | 11 | `d8eb9a8` | TermTooltip 추가 패턴 |
| PollockSupplyMacroWidgets | 14 | 14 (100%) | `e7ae5f7` | term/cardDesc 풀네임 병기 |
| CarrotDashboard | 14 | 10 | `e7ae5f7` | actionPlan 영문 분류 태그 4 false-positive |

**누적 정정: 54건 + JS 버그 1건**

## ⏸️ Tuna closure 동결 (~2026-06-04)

| 파일 | audit 위반 | 상태 |
|---|---:|---|
| TunaKfasResearch | 18 | Antigravity 동결 영향 보수적 skip — closure 풀린 후 재개 |
| TunaIntelInsightsB4 | 11 | 동일 |
| TunaForecastWidgets | 10 | 동일 |
| TunaUpcyclingWidgets | 9 | 동일 |

ADR 0005 마이그레이션 완료 후 (~2026-06-04) 일괄 처리.

## 🔄 비-Tuna 잔여 우선순위 (위반 ≥10)

| 파일 | 위반 | 권장 처리 |
|---|---:|---|
| PollockSalesValueWidgets | 12 | hephaestus 자율 정정 (S2 가공 위젯) |
| data_gtc_insights_part3 | 11 | JSON 데이터 직접 patch (sed 스크립트) |
| UnloadingStatus | 11 | 수작업 (Sankey 차트 라벨 우선) |
| SquidTab5Widgets | 11 | hephaestus |
| PollockDraftInsights | 11 | hephaestus |
| data_gtc_insights_part2 | 10 | JSON patch |
| SquidTab2Widgets | 10 | hephaestus |
| PetFoodDashboard | 10 | hephaestus |
| ChickenThaiInsightsB | 10 | hephaestus |
| ChickenThaiInsightsA | 10 | hephaestus |

**합계: 8 commodity 파일 + 2 JSON 데이터 (≈ 96건 잔여)**

## 패턴 분석 (Top 5 정정에서 추출)

### 진짜 위반 패턴 (정정 필수)
1. **title 영문 단독/병기**: W-01 위반 → 한글 단독 우선, 약어 풀네임 병기
2. **chart axis/legend name 영문 단독**: L-01 → 한글 단독 또는 한글(약어)
3. **TAK 영문 분류 태그** (`(Strategic Buy)`, `(Bullish Target)`): 한글 번역
4. **cardDesc 약어 단독** (CAPEX/EBITDA/M&A/DIO/EUDR): 첫 노출 풀네임 병기

### False-positive 패턴 (정정 불필요, audit 보강 대상)
1. **이미 풀네임 병기됨**: `재고회전일수(DIO)` 같이 한글+약어 조합인데 약어만 잡힌 케이스
2. **외부 자료 원문 source**: FAOSTAT 카테고리명, NOAA dataset 이름 등 학술 reference
3. **TermTooltip 내부 description**: 이미 약어 해설용 컴포넌트라 영문 키워드 포함이 자연스러움

## hephaestus 위임 sprint 명령 (OpenCode TUI)

```bash
cd /Users/idong-geon/연구자동화애이전트들/tuna-dashboard

ultrawork --agent hephaestus \
  --max-files 8 \
  "L-01 영문 잔존 정정 (Top 5 외 위반 ≥10 파일)

  대상 파일 (8건):
  - components/PollockSalesValueWidgets.tsx (12)
  - components/UnloadingStatus.tsx (11)
  - components/SquidTab5Widgets.tsx (11)
  - components/PollockDraftInsights.tsx (11)
  - components/SquidTab2Widgets.tsx (10)
  - components/PetFoodDashboard.tsx (10)
  - components/ChickenThaiInsightsB.tsx (10)
  - components/ChickenThaiInsightsA.tsx (10)

  audit 결과: artifacts/daily_audit/2026-05-23/components_<파일명>.json

  적용 패턴 (Top 5에서 검증):
  1. title 영문 단독/병기 → 한글 우선, 약어 풀네임 병기
  2. chart axis name → 한글 우선
  3. TAK 영문 분류 태그 (Strategic Buy 등) → 한글 번역
  4. cardDesc 약어 단독 첫 노출 → 풀네임 병기

  False-positive 무시:
  - 이미 풀네임 병기된 케이스 (재고회전일수(DIO))
  - source 필드의 외부 자료 원문 명칭
  - TermTooltip description 내 영문

  파일별 commit 분리 + L-03 빌드 게이트 통과 후 push."
```

## launchd 일간 자동 가동 (다음 작업)

```bash
# ~/Library/LaunchAgents/com.tuna-dashboard.librarian.daily.plist
launchctl load -w ~/Library/LaunchAgents/com.tuna-dashboard.librarian.daily.plist
# 매일 09:00 자동 가동 → artifacts/daily_audit/YYYY-MM-DD/summary.md 생성
```
