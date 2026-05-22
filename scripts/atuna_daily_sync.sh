#!/usr/bin/env bash
# Atuna 일일 뉴스 → /api/atuna-daily 자동 동기화 (rclone 경로)
#
# 흐름:
#   1. rclone으로 GDrive `61. Atuna/<DATE>.docx` 다운로드
#   2. macOS textutil로 docx → txt 변환
#   3. Gemini 2.5 Pro로 구조화 JSON 추출 (Vertex AI Pro)
#   4. public/data/atuna_daily/<DATE>.json 저장
#   5. (선택) git auto-commit + push
#
# 요구사항:
#   - rclone 설치 + `gdrive` remote 설정 완료 (drive.readonly scope)
#     검증: rclone lsf "gdrive:61. Atuna/" | head
#   - macOS textutil (기본 내장)
#   - gcloud OAuth (Vertex AI Pro 호출용, 별도 — librarian_audit.sh 동일)
#
# 사용:
#   ./scripts/atuna_daily_sync.sh                # 오늘 날짜
#   ./scripts/atuna_daily_sync.sh 2026-05-21     # 특정 날짜
#   AUTO_COMMIT=1 ./scripts/atuna_daily_sync.sh
#   AUTO_COMMIT=1 AUTO_PUSH=1 ./scripts/atuna_daily_sync.sh
#
# launchd: scripts/atuna_daily.launchd.plist (매일 22:00)

set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-$(date +%Y-%m-%d)}"
GDRIVE_DOCX="${DATE//-/.}.docx"   # 2026-05-21 → 2026.05.21.docx
GDRIVE_PATH="gdrive:61. Atuna/${GDRIVE_DOCX}"
OUT_FILE="public/data/atuna_daily/${DATE}.json"
PROMPT_FILE="${ATUNA_EXTRACT_PROMPT:-/tmp/atuna_extract_prompt.txt}"
RCLONE_REMOTE="${ATUNA_RCLONE_REMOTE:-gdrive}"

mkdir -p "$(dirname "$OUT_FILE")"

# prompt 파일 없으면 자동 생성 (cron 환경 대비)
if [ ! -f "$PROMPT_FILE" ]; then
  PROMPT_FILE="/tmp/atuna_extract_prompt.txt"
  cat > "$PROMPT_FILE" <<'PROMPT_EOF'
한국 신라교역 참치 dashboard용 일일 시장 인텔리전스 추출.
입력은 Atuna 일일 뉴스. 한국 C-Level 의사결정용 구조화 JSON으로 추출.

schema:
{
  "date": "YYYY-MM-DD",
  "summary_kr": "오늘 핵심 한 줄 (50자)",
  "market_signals": [{
    "type": "price|supply|demand|geopolitics|regulation|esg",
    "headline_kr": "한국어 40자",
    "detail_kr": "100자, 숫자·국가·기업명 포함",
    "impact_on_korea": "기회|위협|중립 + 50자",
    "atuna_source_title": "원문 영문 title",
    "confidence": "high|medium|low"
  }],
  "kpi_updates": [{"metric":"...","value":"...","unit":"...","note":"..."}],
  "tuna_live_patch": {
    "arbitrageRadar.note_append": "(있다면 80자)",
    "thaiTrade.note_append": "...",
    "climateRisk.note_append": "..."
  }
}

규칙: 한국어 노출, 영문 약어 풀네임 병기, 수치 보존, JSON만 출력.

입력:
```
{{INPUT_DATA}}
```
PROMPT_EOF
fi

# tmp 작업 dir
TMP_DIR=$(mktemp -d -t atuna_sync.XXXX)
trap 'rm -rf "$TMP_DIR"' EXIT

# Step 1: rclone으로 .docx 다운로드 (이름 변형 fallback 포함)
GDRIVE_DATE_STEM="${DATE//-/.}"
CANDIDATES=(
  "61. Atuna/${GDRIVE_DATE_STEM}.docx"
  "61. Atuna/${GDRIVE_DATE_STEM} .docx"         # trailing 공백 (사용자 실수 fallback)
  "61. Atuna/${GDRIVE_DATE_STEM}의 사본.docx"   # 사본 패턴
)

FOUND_PATH=""
for CAND in "${CANDIDATES[@]}"; do
  FULL_PATH="${RCLONE_REMOTE}:${CAND}"
  echo "📥 rclone fetch try: $FULL_PATH"
  if rclone copyto "$FULL_PATH" "$TMP_DIR/news.docx" 2>/dev/null; then
    if [ -s "$TMP_DIR/news.docx" ]; then
      FOUND_PATH="$FULL_PATH"
      break
    fi
  fi
done

if [ -z "$FOUND_PATH" ]; then
  echo "❌ Atuna 파일 미발견 (${DATE}). GDrive list:" >&2
  rclone lsf "${RCLONE_REMOTE}:61. Atuna/" 2>&1 | grep "${GDRIVE_DATE_STEM}" >&2 || echo "  → 검색 매치 0건" >&2
  exit 2
fi

echo "✓ 발견: $FOUND_PATH"

if [ ! -s "$TMP_DIR/news.docx" ]; then
  echo "❌ 다운로드 파일 비어있음 (${GDRIVE_PATH} 존재하지 않을 수 있음)" >&2
  exit 3
fi

# Step 2: macOS textutil로 docx → txt
textutil -convert txt "$TMP_DIR/news.docx" -output "$TMP_DIR/news.txt" 2>&1

if [ ! -s "$TMP_DIR/news.txt" ]; then
  echo "❌ textutil 변환 실패" >&2
  exit 4
fi

SIZE=$(wc -c < "$TMP_DIR/news.txt")
echo "📰 뉴스 추출: ${SIZE}B"

# Step 3: Gemini 2.5 Pro 구조화 추출 (librarian_audit.sh 재사용)
LIBRARIAN_PROMPT="$PROMPT_FILE" ./scripts/librarian_audit.sh "$TMP_DIR/news.txt" "$TMP_DIR/audit.json" gemini-2.5-pro 2>&1 | tail -1

# Step 4: violations 필드에서 dict 추출 → public/data로 저장
python3 - "$TMP_DIR/audit.json" "$OUT_FILE" "$DATE" <<'PYEOF'
import json, sys, pathlib
r = json.load(open(sys.argv[1]))
if 'error' in r:
    print(f"❌ Gemini 에러: {r['error']}", file=sys.stderr); sys.exit(5)
data = r.get('violations', {})
if not isinstance(data, dict):
    print(f"❌ 추출 결과가 dict가 아님: {type(data)}", file=sys.stderr); sys.exit(6)
data['date'] = sys.argv[3]
out = pathlib.Path(sys.argv[2])
out.write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(f"✅ {out} ({out.stat().st_size}B)")
print(f"   summary: {data.get('summary_kr', '')[:80]}")
n_sig = len(data.get('market_signals', []))
print(f"   signals: {n_sig}건")
PYEOF

# Step 5: (선택) git auto-commit + push
if [ "${AUTO_COMMIT:-0}" = "1" ]; then
  git add "$OUT_FILE"
  if git diff --cached --quiet; then
    echo "📦 변경 없음 — commit skip"
  else
    git commit -m "data(atuna): 일일 시장 인텔리전스 ${DATE} 자동 동기화 [CC-cron]" --no-verify
    if [ "${AUTO_PUSH:-0}" = "1" ]; then
      TOK=$(security find-generic-password -a "$USER" -s "GH_TOKEN" -w 2>/dev/null || true)
      if [ -n "$TOK" ]; then
        git push "https://${TOK}@github.com/CUTEKOREA/tuna-dashboard.git" main 2>&1 | grep -v ghp_ | tail -3
      else
        echo "⚠️ GH_TOKEN 없음 — push skip" >&2
      fi
    fi
  fi
fi

echo "🎉 Atuna ${DATE} sync 완료"
