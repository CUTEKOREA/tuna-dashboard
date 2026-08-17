#!/usr/bin/env bash
# 동남아 가공사 조사 보강 — Grok 4.6 fan-out.
#
# 회사 하나당 한 번 호출한다. 여러 회사를 한 콜에 묶으면 답이 뭉개지고,
# 시범 호출에서 잡아낸 «동일 주소 유사 상호» 같은 구분을 놓친다.
#
# 규율: 못 찾으면 '확인불가'. 빈칸을 추정으로 메우는 것이 이 작업의 실패 모드다.
# 원본 값은 건드리지 않는다 — 보강분은 별도 파일로 모았다가 병합 단계에서 합친다.
set -uo pipefail

OUT_DIR="${1:-/tmp/seasia-grok}"
CONC="${CONC:-2}"          # 동시 호출 수. 4 로 올렸더니 서로 느려져 타임아웃에 걸렸다.
mkdir -p "$OUT_DIR"

# shellcheck source=/dev/null
source "$HOME/.claude/harness/lib/vendor.sh"

ask_one() {
  local slug="$1" country="$2" name="$3" hint="$4"
  local dest="$OUT_DIR/${slug}.txt"
  # 잘린 응답을 완료로 치면 안 된다. 마지막 항목의 '조회일'이 있어야 온전한 답이다.
  if [ -s "$dest" ] && grep -q "조회일" "$dest"; then echo "skip $slug (완료됨)"; return 0; fi

  VENDOR_TIMEOUT=900 ask_grok_verified "${country} 수산물 가공회사 ${name} 를 공개 출처로 조사하라. 참고: ${hint}

아래 4개 항목만 답하라. **찾지 못하면 반드시 '확인불가'라고 쓰고 추측하지 마라.** 빈칸을 추정으로 메우는 것이 이 작업의 실패다. 상호가 비슷한 별개 법인의 정보를 섞지 마라 — 등기번호로 구분하라.

1) 지배구조·상장 — 등기번호, 대표자, 납입자본, 지분구조, 상장 여부
2) 규모·캐파 — 일일/연간 처리능력, 공장 수, 직원 수, 냉동창고 용량
3) 인증 — HACCP·BRC·IFS·MSC·ASC·HALAL·EU승인번호·FDA 등록 등
4) 재무 — 최근 매출·순이익·총자산, 회계연도

각 항목마다:
- 값: (찾은 내용 또는 '확인불가')
- 출처: (기관·사이트명과 문서명. 확인불가면 '없음')
- 조회일: 2026-08-17

한국어. 항목당 3줄 이내. 서론·맺음말 없이 바로." > "$dest" 2>&1
  local rc=$?
  local n; n=$(wc -c < "$dest")
  if grep -q "조회일" "$dest"; then echo "done $slug rc=$rc ${n}B"
  else echo "TRUNC $slug rc=$rc ${n}B — 답이 잘렸다"; fi
}

# 대상 목록은 stdin 으로 받는다: slug<TAB>국가<TAB>회사명<TAB>힌트
running=0
while IFS=$'\t' read -r slug country name hint; do
  [ -z "$slug" ] && continue
  ask_one "$slug" "$country" "$name" "$hint" &
  running=$((running + 1))
  if [ "$running" -ge "$CONC" ]; then wait -n 2>/dev/null || wait; running=$((running - 1)); fi
done
wait
echo "전량 완료 — $(ls -1 "$OUT_DIR"/*.txt 2>/dev/null | wc -l) 건"
