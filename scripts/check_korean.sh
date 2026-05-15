#!/bin/bash
# L-01: 위젯 영문 잔여분 검사 (V4.1)
#
# 사용자 노출 텍스트(label, name, title, tooltip, legend, cardDesc)에
# 영문 잔여분이 있는지 검사합니다.
#
# 사용법:
#   ./scripts/check_korean.sh                       # components/ 전체 검사
#   ./scripts/check_korean.sh components/X.tsx      # 단일 파일 검사
#   ./scripts/check_korean.sh --pr                  # 변경된 파일만 (git diff)
#
# 종료 코드: 위반 발견 시 1, 통과 시 0
# Whitelist 추가: scripts/korean_whitelist.txt 편집

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WHITELIST_FILE="$ROOT/scripts/korean_whitelist.txt"

# 검사 대상 파일 결정
if [[ "${1:-}" == "--pr" ]]; then
  TARGETS=$(git -C "$ROOT" diff --name-only --diff-filter=AM HEAD~1 -- 'components/*.tsx' 'app/**/*.tsx' 2>/dev/null)
elif [[ -n "${1:-}" ]]; then
  TARGETS="$1"
else
  TARGETS=$(find "$ROOT/components" -name '*.tsx' 2>/dev/null)
fi

if [[ -z "$TARGETS" ]]; then
  echo "✅ No files to check"
  exit 0
fi

# Whitelist 로드 (라인당 1단어, 주석은 #로 시작)
declare -a WHITELIST
if [[ -f "$WHITELIST_FILE" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    WHITELIST+=("$line")
  done < "$WHITELIST_FILE"
fi

# 단어가 화이트리스트에 있는지 (대소문자 정확)
is_whitelisted() {
  local word="$1"
  for w in "${WHITELIST[@]:-}"; do
    [[ "$word" == "$w" ]] && return 0
  done
  return 1
}

# 매칭된 텍스트에서 영단어만 추출 후, 모두 화이트리스트면 통과
all_whitelisted() {
  local text="$1"
  # 영단어 추출 (대문자로 시작)
  local words
  words=$(echo "$text" | grep -oE '[A-Z][A-Za-z]*' || true)
  [[ -z "$words" ]] && return 0
  while IFS= read -r w; do
    [[ -z "$w" ]] && continue
    is_whitelisted "$w" || return 1
  done <<< "$words"
  return 0
}

VIOLATIONS=0
TMP=$(mktemp)

for FILE in $TARGETS; do
  [[ ! -f "$FILE" ]] && continue
  REL="${FILE#$ROOT/}"

  # 패턴 1: 순수 영문 값 (display field들)
  #   예: name="Exports", label='Production', title=`Trade Volume`
  PATTERN1='(label|name|title|tooltip|legend|cardDesc)\s*[:=]\s*\{?\s*[\x27"`]([A-Z][A-Za-z &/.()\\\-]+)[\x27"`]'

  # 패턴 2: 한글+괄호영문 (D-05 위반: 괄호 영문명 제거)
  #   예: name="수출 (Exports)", label="서인도양 (W.Indian)"
  PATTERN2='(label|name|title|tooltip|legend|cardDesc)\s*[:=]\s*\{?\s*[\x27"`][^\x27"`]*[가-힣][^\x27"`]*\(\s*[A-Z][A-Za-z./\-]+\s*\)[^\x27"`]*[\x27"`]'

  > "$TMP"
  rg -nP "$PATTERN1" "$FILE" 2>/dev/null >> "$TMP" || true
  rg -nP "$PATTERN2" "$FILE" 2>/dev/null >> "$TMP" || true

  [[ ! -s "$TMP" ]] && continue

  FILE_HITS=()
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    # 매칭된 따옴표 안 텍스트 추출
    matched_text=$(echo "$line" | grep -oE "['\"\`][^'\"\`]+['\"\`]" | head -1 | sed -E "s/^['\"\`](.*)['\"\`]\$/\1/")

    # 한글이 포함된 라인이고, 영단어가 전부 화이트리스트면 통과
    if [[ "$matched_text" =~ [가-힣] ]] && all_whitelisted "$matched_text"; then
      continue
    fi
    # 한글 없고 순수 영문이면 → 화이트리스트가 전부 커버하면 통과
    if [[ ! "$matched_text" =~ [가-힣] ]] && all_whitelisted "$matched_text"; then
      continue
    fi
    # 괄호 영문 패턴은 한글 있어도 위반 (D-05)
    if [[ "$line" =~ \([A-Z] ]]; then
      FILE_HITS+=("$line")
      continue
    fi
    FILE_HITS+=("$line")
  done < "$TMP"

  if [[ ${#FILE_HITS[@]} -gt 0 ]]; then
    echo ""
    echo "❌ $REL — ${#FILE_HITS[@]} violation(s)"
    for hit in "${FILE_HITS[@]}"; do
      echo "   $hit"
    done
    VIOLATIONS=$((VIOLATIONS + ${#FILE_HITS[@]}))
  fi
done

rm -f "$TMP"

echo ""
echo "─────────────────────────────────"
if [[ $VIOLATIONS -eq 0 ]]; then
  echo "✅ L-01 PASSED — no English residue in display fields"
  exit 0
else
  echo "❌ L-01 FAILED — $VIOLATIONS violation(s) found"
  echo ""
  echo "조치:"
  echo "  • 한글 매핑으로 교체 (예: name=\"Exports\" → name=\"수출\")"
  echo "  • 괄호 영문 제거 (예: \"수출 (Exports)\" → \"수출\")"
  echo "  • 화이트리스트 추가가 정당하면: scripts/korean_whitelist.txt 편집"
  exit 1
fi
