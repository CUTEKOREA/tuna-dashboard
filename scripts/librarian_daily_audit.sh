#!/usr/bin/env bash
# Librarian 일간 자동 audit (ADR 0006/0007 일간 cron 권고 구현)
#
# 실행 방식:
#   ./scripts/librarian_daily_audit.sh           # 정상 실행
#   DRY_RUN=1 ./scripts/librarian_daily_audit.sh # audit 대상 list만 출력, 호출 안 함
#   MODEL=gemini-2.5-flash ./scripts/librarian_daily_audit.sh # cheaper sweep
#
# 동작:
#   1. components/*.tsx 중 사용자 노출 텍스트 많은 파일 자동 선별
#   2. data/*.js 와 data/*_insights*.json 파일 추가
#   3. Pro 2.5 (또는 Flash) 각 파일 audit
#   4. 결과 → artifacts/daily_audit/<YYYY-MM-DD>/
#   5. summary.md 생성 (총 위반 수, 비용, 파일별 분포)
#   6. 비용 cap $1/일 (BUDGET_USD env로 override 가능)
#
# 작성: 2026-05-22 (ADR 0007 후속)

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

DATE="$(date +%Y-%m-%d)"
OUT_DIR="artifacts/daily_audit/${DATE}"
# 기본 모델: gemini-3.5-flash (Direct API, 17초/$0.001, recall 우수)
# precision 필요 시: MODEL=gemini-2.5-pro (Vertex AI OAuth, 40초/$0.004)
MODEL="${MODEL:-gemini-3.5-flash}"
BUDGET="${BUDGET_USD:-1.0}"
PROMPT_FILE="${LIBRARIAN_PROMPT:-/tmp/librarian_prompt_v3.txt}"

# v3 prompt가 없으면 repo에서 생성 (cron 환경 대비)
if [ ! -f "$PROMPT_FILE" ]; then
  PROMPT_FILE="${OUT_DIR}/.prompt_v3.txt"
  mkdir -p "$(dirname "$PROMPT_FILE")"
  cat > "$PROMPT_FILE" <<'PROMPT_EOF'
당신은 한국 commodity 대시보드 프로젝트의 L-01 (영문 잔존) audit 어시스턴트입니다.

## 검출 대상 (위반)
사용자 노출 텍스트(title/situation/takeaway/source/methodology/subtitle) 내에서 로마자(A-Z, a-z)로 표기된 영문 단어/구절이 한글 풀네임 병기 없이 노출된 경우.

## 검출 제외 (위반 아님)
1. 한글 외래어 (모두 한글): 업사이클링, 파트너십, 소싱, 포지셔닝, 퓨레, 마진, 리스크, 시뮬레이션, 헷지
2. 화이트리스트 약어: HSK, MOC, FTA, WTO, B2B, B2C, OECD, FAO, USDA, IQF, MA, PLS, HMR, KCS, VKFTA, ESG, FX, SCFI, ROIC, ROE, ROI, JV, CFR, FOB, CIF, EU, US, UK, OEC, WCPO, ICCAT, Scope 1/2/3, USD/KRW/EUR, MT/kg/t/L, 회사명, 인명, 학명, HS Code
3. 영문 + 한글 풀네임 병기 (예: "개별급속냉동(IQF)")

## 출력 (JSON array, 마크다운 금지)
[{"field":"...", "widget_index":0, "violation":"...", "context_excerpt":"...", "suggested_korean":"...", "confidence":"high|medium|low"}]
위반 없음 = []

## 입력 데이터
```
{{INPUT_DATA}}
```
PROMPT_EOF
fi

mkdir -p "$OUT_DIR"

# Stage 1: audit 대상 파일 자동 선별
TARGETS_FILE="${OUT_DIR}/_targets.txt"
{
  # Dashboard components (4KB+, JSX 사용자 노출 텍스트 많은 파일)
  find components -maxdepth 1 -name "*.tsx" -size +4k 2>/dev/null | while read f; do
    # situation/takeaway/title hardcoded 텍스트가 있는지 확인 (간단 grep)
    if grep -qE 'situation:|takeaway:|sit=|strat=|cardDesc=' "$f"; then
      echo "$f"
    fi
  done
  # Insight JSON·JS 파일 (사용자 노출 텍스트 있을 가능성 큼)
  ls data/*_insights*.js data/*_insights*.json data/*insight*.js data/*insight*.json 2>/dev/null || true
} | sort -u > "$TARGETS_FILE"

NUM_TARGETS=$(wc -l < "$TARGETS_FILE" | tr -d ' ')
echo "📋 [${DATE}] audit 대상: ${NUM_TARGETS}개 파일"
echo "  → $TARGETS_FILE"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN=1 → 호출 없이 종료. 대상 파일:"
  cat "$TARGETS_FILE"
  exit 0
fi

# Stage 2: 각 파일 audit
ACCUM_COST=0
TOTAL_VIOL=0
SUMMARY_TMP="${OUT_DIR}/_summary_partial.txt"
: > "$SUMMARY_TMP"

while IFS= read -r SRC; do
  [ -z "$SRC" ] && continue
  OUT_NAME=$(echo "$SRC" | sed 's|/|_|g; s|\.[^.]*$||').json
  OUT="${OUT_DIR}/${OUT_NAME}"

  # 비용 cap 체크 (Python으로 float 비교)
  if python3 -c "import sys; sys.exit(0 if $ACCUM_COST < $BUDGET else 1)"; then
    echo "▶ $SRC"
    LIBRARIAN_PROMPT="$PROMPT_FILE" ./scripts/librarian_audit.sh "$SRC" "$OUT" "$MODEL" 2>&1 | tail -1 || {
      echo "  ❌ audit 실패 — skip"
      continue
    }
    # 결과 집계
    if [ -f "$OUT" ]; then
      python3 - "$OUT" "$SUMMARY_TMP" <<'PY'
import json, sys, pathlib
r = json.load(open(sys.argv[1]))
if 'error' in r:
    with open(sys.argv[2], 'a') as f:
        f.write(f"ERROR\t{sys.argv[1]}\t{r['error'].get('code')}\n")
else:
    n = r.get('violations_count', 0)
    c = r.get('cost_usd', 0)
    t = r.get('elapsed_sec', 0)
    with open(sys.argv[2], 'a') as f:
        f.write(f"{n}\t{c}\t{t}\t{sys.argv[1]}\n")
PY
      # 누적 비용 계산
      NEW_COST=$(python3 -c "import json; r=json.load(open('$OUT')); print(r.get('cost_usd', 0))")
      ACCUM_COST=$(python3 -c "print(round($ACCUM_COST + $NEW_COST, 5))")
      VIOL=$(python3 -c "import json; r=json.load(open('$OUT')); print(r.get('violations_count', 0))")
      TOTAL_VIOL=$((TOTAL_VIOL + VIOL))
    fi
    sleep 3  # rate limit 회피
  else
    echo "💰 비용 cap \$${BUDGET} 도달 — 잔여 ${SRC} 등 skip"
    break
  fi
done < "$TARGETS_FILE"

# Stage 3: summary.md 생성
SUMMARY="${OUT_DIR}/summary.md"
python3 - "$DATE" "$MODEL" "$ACCUM_COST" "$TOTAL_VIOL" "$NUM_TARGETS" "$SUMMARY_TMP" "$SUMMARY" <<'PY'
import sys, pathlib
date, model, cost, total_viol, num_targets, partial_file, out_file = sys.argv[1:]
lines = [
    f"# 일간 Librarian Audit — {date}",
    "",
    f"- **모델**: `{model}`",
    f"- **대상 파일**: {num_targets}개",
    f"- **총 위반 검출**: {total_viol}건",
    f"- **누적 비용**: ${float(cost):.5f}",
    "",
    "## 파일별 결과",
    "",
    "| 파일 | 위반 | 비용 | 시간 |",
    "|---|---:|---:|---:|",
]
for ln in pathlib.Path(partial_file).read_text().splitlines():
    parts = ln.split('\t')
    if parts[0] == 'ERROR':
        lines.append(f"| `{parts[1]}` | ❌ {parts[2]} | — | — |")
    else:
        n, c, t, f = parts
        lines.append(f"| `{f}` | {n} | ${float(c):.5f} | {t}초 |")
lines += [
    "",
    "## 다음 단계 권장",
    "- 위반 수가 많은 파일 (top 3)을 사람 검토 → 정정 PR",
    "- false positive 패턴이 반복되면 prompt 화이트리스트에 추가",
    "- 위반 0건 dashboard는 audit 주기 일 → 주 단위로 완화 가능",
]
pathlib.Path(out_file).write_text("\n".join(lines))
print(f"📊 summary → {out_file}")
PY

# 콘솔 출력
echo
echo "=== 일간 audit 완료 ==="
echo "📅 ${DATE} | 대상 ${NUM_TARGETS}개 | 위반 ${TOTAL_VIOL}건 | 비용 \$${ACCUM_COST}"
echo "📊 ${SUMMARY}"
