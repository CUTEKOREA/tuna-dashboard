#!/usr/bin/env bash
# Atuna 일일 뉴스 → /api/atuna-daily 자동 동기화
#
# 흐름:
#   1. GDrive `내 드라이브/61. Atuna/<DATE>` Google Docs 검색
#   2. gcloud OAuth + Drive API REST로 plain text export
#   3. Gemini Pro로 구조화 JSON 추출 (KPI/시그널)
#   4. public/data/atuna_daily/<DATE>.json 저장
#   5. (선택) git auto-commit + push
#
# 사용:
#   ./scripts/atuna_daily_sync.sh                # 오늘 날짜
#   ./scripts/atuna_daily_sync.sh 2026-05-21     # 특정 날짜
#   AUTO_COMMIT=1 ./scripts/atuna_daily_sync.sh  # commit + push까지 자동
#
# launchd 매일 22:00 등록은 scripts/atuna_daily_sync.launchd.plist 참조.

set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-$(date +%Y-%m-%d)}"
# GDrive는 파일명이 "YYYY.MM.DD" 형식
GDRIVE_TITLE="${DATE//-/.}"
OUT_FILE="public/data/atuna_daily/${DATE}.json"
PROMPT_FILE="${ATUNA_EXTRACT_PROMPT:-/tmp/atuna_extract_prompt.txt}"

mkdir -p "$(dirname "$OUT_FILE")"

# prompt 파일 없으면 자동 생성 (cron 환경 대비)
if [ ! -f "$PROMPT_FILE" ]; then
  PROMPT_FILE=".prompt_atuna_extract.txt"
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
  "kpi_updates": [{"metric":"...", "value":"...", "unit":"...", "note":"..."}],
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

# Step 1: GDrive에서 Atuna 일일 뉴스 file ID 검색 (gcloud OAuth + Drive API)
TOKEN=$(gcloud auth print-access-token 2>/dev/null) || {
  echo "❌ gcloud 인증 실패. 'gcloud auth login' 후 'gcloud auth scopes add https://www.googleapis.com/auth/drive.readonly'" >&2
  exit 1
}

echo "🔍 GDrive 검색: 제목 = '${GDRIVE_TITLE}'"

# Drive API v3 files.list — name 기반 검색
SEARCH_QUERY="name='${GDRIVE_TITLE}' and mimeType='application/vnd.google-apps.document' and trashed=false"
SEARCH_URL="https://www.googleapis.com/drive/v3/files?q=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$SEARCH_QUERY")&fields=files(id,name,parents)"

SEARCH_RESP=$(curl -sS "$SEARCH_URL" -H "Authorization: Bearer $TOKEN")
FILE_ID=$(python3 -c "
import json, sys
r = json.loads('''$SEARCH_RESP''')
# 61. Atuna 폴더 parent 우선 (있다면)
files = r.get('files', [])
if not files:
    sys.exit('NOT_FOUND')
# 첫 매치 (필요 시 parent 필터링 추가 가능)
print(files[0]['id'])
" 2>&1)

if [ "$FILE_ID" = "NOT_FOUND" ] || [ -z "$FILE_ID" ]; then
  echo "❌ GDrive에 '${GDRIVE_TITLE}' Google Doc이 없습니다." >&2
  exit 2
fi

echo "📄 file ID: $FILE_ID"

# Step 2: Drive API export — Google Docs → plain text
TMP_NEWS=$(mktemp -t atuna_news.XXXX.txt)
trap 'rm -f "$TMP_NEWS"' EXIT

curl -sS -L "https://www.googleapis.com/drive/v3/files/${FILE_ID}/export?mimeType=text/plain" \
  -H "Authorization: Bearer $TOKEN" > "$TMP_NEWS"

if [ ! -s "$TMP_NEWS" ]; then
  echo "❌ Drive export 실패 (빈 파일)" >&2
  exit 3
fi

echo "📰 뉴스 fetch 완료 ($(wc -c < "$TMP_NEWS")B)"

# Step 3: Gemini Pro로 구조화 추출 (librarian_audit.sh 재사용)
TMP_AUDIT=$(mktemp -t atuna_audit.XXXX.json)
LIBRARIAN_PROMPT="$PROMPT_FILE" ./scripts/librarian_audit.sh "$TMP_NEWS" "$TMP_AUDIT" gemini-2.5-pro 2>&1 | tail -1

# Step 4: violations 필드에서 dict 추출 → public/data로 저장
python3 - "$TMP_AUDIT" "$OUT_FILE" "$DATE" <<'PYEOF'
import json, sys, pathlib
r = json.load(open(sys.argv[1]))
if 'error' in r:
    print(f"❌ Gemini 에러: {r['error']}", file=sys.stderr); sys.exit(4)
data = r.get('violations', {})
if not isinstance(data, dict):
    print(f"❌ 추출 결과가 dict가 아님: {type(data)}", file=sys.stderr); sys.exit(5)
# date 필드 강제 매칭
data['date'] = sys.argv[3]
out = pathlib.Path(sys.argv[2])
out.write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(f"✅ {out} ({out.stat().st_size}B)")
print(f"   summary: {data.get('summary_kr', '')[:80]}")
PYEOF

rm -f "$TMP_NEWS" "$TMP_AUDIT"

# Step 5: (선택) git auto-commit
if [ "${AUTO_COMMIT:-0}" = "1" ]; then
  git add "$OUT_FILE"
  if git diff --cached --quiet; then
    echo "📦 변경 없음 — commit skip"
  else
    git commit -m "data(atuna): 일일 시장 인텔리전스 ${DATE} 자동 동기화 [CC-cron]" --no-verify
    if [ "${AUTO_PUSH:-0}" = "1" ]; then
      TOK=$(security find-generic-password -a "$USER" -s "GH_TOKEN" -w 2>/dev/null) || true
      if [ -n "$TOK" ]; then
        git push "https://${TOK}@github.com/CUTEKOREA/tuna-dashboard.git" main 2>&1 | grep -v ghp_ | tail -3
      else
        echo "⚠️ GH_TOKEN 없음 — push skip"
      fi
    fi
  fi
fi

echo "🎉 Atuna ${DATE} sync 완료"
