#!/usr/bin/env bash
# Librarian audit — Vertex AI Pro 2.5 호출 (ADR 0007 정식 pipeline)
# Usage: ./scripts/librarian_audit.sh <input_file> [output_file] [model]
# Default model: gemini-2.5-pro (precision 80%+ 보장)
# Cheaper option: gemini-2.5-flash (광역 sweep용, $0.003/audit)

set -euo pipefail

INPUT="${1:?Usage: $0 <input_file> [output_file] [model]}"
OUTPUT="${2:-artifacts/librarian_audit_$(date +%Y%m%d_%H%M%S).json}"
MODEL="${3:-gemini-2.5-pro}"
PROMPT_FILE="${LIBRARIAN_PROMPT:-/tmp/librarian_prompt_v3.txt}"
LOC="${LIBRARIAN_LOCATION:-us-central1}"

if [ ! -f "$INPUT" ]; then echo "❌ Input file not found: $INPUT" >&2; exit 1; fi
if [ ! -f "$PROMPT_FILE" ]; then echo "❌ Prompt file not found: $PROMPT_FILE (set LIBRARIAN_PROMPT)" >&2; exit 1; fi

# OAuth + project (Vertex AI paid tier 우회)
TOKEN=$(gcloud auth print-access-token 2>/dev/null) || { echo "❌ gcloud auth 실패. 'gcloud auth login' 먼저 실행" >&2; exit 1; }
PROJECT=$(gcloud config get-value project 2>/dev/null) || { echo "❌ gcloud project 미설정" >&2; exit 1; }
URL="https://${LOC}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOC}/publishers/google/models/${MODEL}:generateContent"

# Payload 생성 (Python json.dumps로 안전한 escaping)
PAYLOAD_FILE=$(mktemp -t librarian_payload.XXXX.json)
trap 'rm -f "$PAYLOAD_FILE"' EXIT

python3 - "$PROMPT_FILE" "$INPUT" "$PAYLOAD_FILE" <<'PYEOF'
import json, pathlib, sys
prompt = pathlib.Path(sys.argv[1]).read_text()
data = pathlib.Path(sys.argv[2]).read_text()
prompt = prompt.replace('{{INPUT_DATA}}', data)
pathlib.Path(sys.argv[3]).write_text(json.dumps({
    "contents": [{"role": "user", "parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
}, ensure_ascii=True))
PYEOF

echo "🤖 Librarian audit: $INPUT → $OUTPUT (model: $MODEL)" >&2
T0=$(date +%s)
RESP=$(curl -sS -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary "@$PAYLOAD_FILE")
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
    output_path.write_text(json.dumps({"error": err, "elapsed_sec": elapsed}, ensure_ascii=False, indent=2))
    print(f"❌ Gemini error code={err.get('code')}: {err.get('message','')[:200]}", file=__import__('sys').stderr)
    sys.exit(2)

cand = resp['candidates'][0]
text = cand['content']['parts'][0]['text']
violations = json.loads(text, strict=False)
u = resp.get('usageMetadata', {})
in_t = u.get('promptTokenCount', 0)
out_t = u.get('candidatesTokenCount', 0) or (u.get('totalTokenCount',0) - in_t - u.get('thoughtsTokenCount',0))
if 'flash' in model:
    cost = (in_t*0.30 + out_t*2.50) / 1e6
else:
    cost = (in_t*1.25 + out_t*10.00) / 1e6

result = {
    "model": model,
    "elapsed_sec": elapsed,
    "tokens": {"input": in_t, "output": out_t, "thoughts": u.get('thoughtsTokenCount', 0)},
    "cost_usd": round(cost, 5),
    "violations_count": len(violations),
    "violations": violations
}
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2))
print(f"✅ {len(violations)}건 검출 | {elapsed}초 | in={in_t} out={out_t} | ${cost:.5f}", file=__import__('sys').stderr)
PYEOF
