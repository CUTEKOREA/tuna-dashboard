# Librarian 전수 Audit Batch — 2026-05-22

**도구**: `scripts/librarian_audit.sh` (Vertex AI Pro 2.5 + v3 prompt)
**범위**: 5 commodity 대표 파일 (Mackerel/Salmon/Pollock/Cocoa/Garlic/Pork)

## 누적 비용·시간 (실측)
- **5 audit, 총 $0.0848 (paid 한도 0.085%)**
- 총 시간 3분 34초 (214초)
- $100/월 한도로 약 **5,800 batch audit** 가능

## 파일별 결과

| 파일 | 검출 | 비용 | 시간 | 비고 |
|---|---:|---:|---:|---|
| `data/cocoa_market_data.json` (16KB) | 38 | $0.044 | 87초 | JSON 키도 함께 검출 — false positive 多 |
| `components/PorkWidgets.tsx` (11 위젯) | **21** | $0.026 | 62초 | 대부분 진짜 위반 (FBS·PSD·WOAH·CME·CBOT·HHI 등 약어) |
| `data/salmon_ntb_radar.json` | 2 | $0.004 | 30초 | Regulation·C/O |
| `data/garlic_w1_hegemony.json` | **0** | $0.009 | 17초 | ✅ pass |
| `data/mackerel_sankey.json` | **0** | $0.003 | 18초 | ✅ pass |
| **TOTAL** | **61** | **$0.085** | **214초** | |

## 핵심 발견

### 1. PorkWidgets 약어 위반 패턴 (정정 권장)
- `FBS` (×4), `PSD` (×3), `WOAH` (×2), `TM` (×2) — 한글 풀네임 없는 단독 약어
- `CME Lean Hogs`, `CBOT`, `CBOT Corn/Soy` — 시카고 거래소 약어 + 영문 풀네임
- `HHI`, `Fish Price Index`, `Top 10`, `Emissions`, `Trade Data` — 일반 영문
- **정정 패턴**: `FBS` → `식량수급표(FBS)`, `CBOT` → `시카고상품거래소(CBOT)` 등

### 2. cocoa_market_data.json False positive 패턴
- JSON `name`/`category` 필드 키 (Others, Week, Live) — 차트 카테고리 데이터, 사용자 노출 미미
- Pro도 JSON context 구분 약함 — 사람 검토 필수

### 3. mackerel·garlic JSON은 audit-pass
- 대부분 chart numeric data — 사용자 노출 텍스트 없음
- audit 가치 낮은 파일 분류 가능 → 미래 sweep에서 제외

## 정정 우선순위

| 우선순위 | 파일 | 위반 | 작업 |
|---|---|---|---|
| **1 (높음)** | PorkWidgets.tsx | 13건 진짜 위반 | 즉시 정정 |
| 2 (보류) | cocoa_market_data.json | ~10건 진짜 위반 + 28 false positive | 사람 검토 후 (data/는 .gitignore) |
| 3 (낮음) | salmon_ntb_radar.json | 2건 | data/.gitignore — 별도 처리 |

## Audit Pipeline 개선 아이디어
- JSON 파일은 schema-aware audit prompt 필요 (key vs value 구분)
- Stage 1 (Flash) → Stage 2 (Pro)로 후보 좁히면 비용·정확도 균형
- `data/*.json` 중 numeric-only 파일 자동 skip 룰 추가
