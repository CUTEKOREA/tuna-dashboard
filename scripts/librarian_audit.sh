#!/usr/bin/env bash
# Librarian audit — ADR 0007 정식 pipeline
#
# 모델별 자동 endpoint 분기:
#   - gemini-3.5-flash · gemini-3-flash-preview · gemini-3.x-* → Direct API key (Vertex AI 미배포)
#   - gemini-2.5-pro · gemini-2.5-flash → Vertex AI OAuth (paid ON_DEMAND)
#
# Usage: ./scripts/librarian_audit.sh <input_file> [output_file] [model]
# 기본 모델: gemini-2.5-pro (precision 100% 검증됨)
# 광역 sweep: gemini-3.5-flash (Direct API, paid tier 활성 시 ~$0.002/audit)
#
# 환경변수:
#   LIBRARIAN_PROMPT — prompt 파일 경로 (기본 /tmp/librarian_prompt_v3.txt)
#   LIBRARIAN_LOCATION — Vertex AI region (기본 us-central1)
#   GEMINI_API_KEY — Direct API 호출용 (Direct 경로 사용 시 필수)

set -euo pipefail

INPUT="${1:?Usage: $0 <input_file> [output_file] [model]}"
OUTPUT="${2:-artifacts/librarian_audit_$(date +%Y%m%d_%H%M%S).json}"
MODEL="${3:-gemini-2.5-pro}"
PROMPT_FILE="${LIBRARIAN_PROMPT:-/tmp/librarian_prompt_v3.txt}"
LOC="${LIBRARIAN_LOCATION:-us-central1}"

if [ ! -f "$INPUT" ]; then echo "❌ Input file not found: $INPUT" >&2; exit 1; fi
if [ ! -f "$PROMPT_FILE" ]; then echo "❌ Prompt file not found: $PROMPT_FILE (set LIBRARIAN_PROMPT)" >&2; exit 1; fi

# 모델별 endpoint 분기
# Direct API 대상: 3.x 시리즈 (Vertex 미배포)
if [[ "$MODEL" =~ ^gemini-3 ]]; then
  ENDPOINT_TYPE="direct"
  GEMINI_API_KEY="${GEMINI_API_KEY:-$(zsh -ic 'echo $GEMINI_API_KEY' 2>/dev/null | tail -1)}"
  if [ -z "${GEMINI_API_KEY:-}" ]; then
    echo "❌ Direct API 호출에 GEMINI_API_KEY 필요. ~/.zshrc에 export 또는 환경변수 설정." >&2
    exit 1
  fi
  URL="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}"
  AUTH_FLAG=()
else
  ENDPOINT_TYPE="vertex"
  TOKEN=$(gcloud auth print-access-token 2>/dev/null) || { echo "❌ gcloud auth 실패. 'gcloud auth login'" >&2; exit 1; }
  PROJECT=$(gcloud config get-value project 2>/dev/null) || { echo "❌ gcloud project 미설정" >&2; exit 1; }
  URL="https://${LOC}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOC}/publishers/google/models/${MODEL}:generateContent"
  AUTH_FLAG=(-H "Authorization: Bearer $TOKEN")
fi

# Payload 생성
PAYLOAD_FILE=$(mktemp -t librarian_payload.XXXX.json)
trap 'rm -f "$PAYLOAD_FILE"' EXIT

python3 - "$PROMPT_FILE" "$INPUT" "$PAYLOAD_FILE" "$ENDPOINT_TYPE" <<'PYEOF'
import json, pathlib, sys
prompt = pathlib.Path(sys.argv[1]).read_text()
data = pathlib.Path(sys.argv[2]).read_text()
endpoint_type = sys.argv[4]
prompt = prompt.replace('{{INPUT_DATA}}', data)

# Vertex AI는 role 필드 필수, Direct API는 선택
content = {"parts": [{"text": prompt}]}
if endpoint_type == 'vertex':
    content["role"] = "user"

pathlib.Path(sys.argv[3]).write_text(json.dumps({
    "contents": [content],
    "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
}, ensure_ascii=True))
PYEOF

echo "🤖 Librarian audit: $INPUT → $OUTPUT (model: $MODEL, endpoint: $ENDPOINT_TYPE)" >&2
T0=$(date +%s)
if [ "$ENDPOINT_TYPE" = "vertex" ]; then
  RESP=$(curl -sS -X POST "$URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data-binary "@$PAYLOAD_FILE")
else
  RESP=$(curl -sS -X POST "$URL" \
    -H "Content-Type: application/json" \
    --data-binary "@$PAYLOAD_FILE")
fi
T1=$(date +%s)
ELAPSED=$((T1 - T0))

# 결과 파싱 + 저장
python3 - "$RESP" "$OUTPUT" "$ELAPSED" "$MODEL" <<'PYEOF'
import json, pathlib, sys
resp = json.loads(sys.argv[1], strict=False)
output_path = pathlib.Path(sys.argv[2])
elapsed = int(sys.argv[3])
model = sys.argv[4]

if 'error' in resp:
    err = resp['error']
    output_path.write_text(json.dumps({"error": err, "elapsed_sec": elapsed, "model": model}, ensure_ascii=False, indent=2))
    print(f"❌ Gemini error code={err.get('code')}: {err.get('message','')[:200]}", file=__import__('sys').stderr)
    sys.exit(2)

cand = resp['candidates'][0]
if 'content' not in cand or 'parts' not in cand.get('content', {}):
    output_path.write_text(json.dumps({"error": "no_content", "candidate": cand, "elapsed_sec": elapsed}, ensure_ascii=False, indent=2))
    print(f"❌ no content: {json.dumps(cand, ensure_ascii=False)[:200]}", file=__import__('sys').stderr)
    sys.exit(3)

text = cand['content']['parts'][0]['text']
violations = json.loads(text, strict=False)
u = resp.get('usageMetadata', {})
in_t = u.get('promptTokenCount', 0)
out_t = u.get('candidatesTokenCount', 0) or (u.get('totalTokenCount',0) - in_t - u.get('thoughtsTokenCount',0))

# 모델별 가격 (paid tier 기준)
PRICE = {
    'gemini-3.5-flash':         (0.30, 2.50),
    'gemini-3-flash-preview':   (0.30, 2.50),
    'gemini-3.1-pro-preview':   (2.00, 12.00),
    'gemini-3-pro-preview':     (2.00, 12.00),
    'gemini-2.5-pro':           (1.25, 10.00),
    'gemini-2.5-flash':         (0.30, 2.50),
    'gemini-2.0-flash':         (0.10, 0.40),
}
in_price, out_price = next(((p, q) for k, (p, q) in PRICE.items() if k in model), (1.0, 5.0))
cost = (in_t * in_price + out_t * out_price) / 1e6

result = {
    "model": model,
    "elapsed_sec": elapsed,
    "tokens": {"input": in_t, "output": out_t, "thoughts": u.get('thoughtsTokenCount', 0)},
    "cost_usd": round(cost, 5),
    "violations_count": len(violations) if isinstance(violations, list) else 1,
    "violations": violations
}
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2))
count = len(violations) if isinstance(violations, list) else 1
print(f"✅ {count}건 검출 | {elapsed}초 | in={in_t} out={out_t} | ${cost:.5f}", file=__import__('sys').stderr)
PYEOF
