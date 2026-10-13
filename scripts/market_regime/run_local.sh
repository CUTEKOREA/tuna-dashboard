#!/bin/zsh
set -euo pipefail
unsetopt XTRACE VERBOSE
umask 077
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

REPO="$HOME/market-regime-runner"
STATE="$HOME/Library/Application Support/market-regime"
LAST_OK="$STATE/last_ok"
LOG="$HOME/Library/Logs/market-regime.log"
OUTPUT="public/data/market-regime.v1.json"
STEP="초기화"
FORCE=0

mkdir -p "$STATE" "${LOG:h}"
exec >>"$LOG" 2>&1

log() {
  printf '%s 단계=%s 결과=%s\n' \
    "$(/bin/date '+%Y-%m-%d %H:%M:%S %z')" "$STEP" "$1"
}

# 수집 전용 클론이 아닌 다른 git 컨텍스트로 reset 하지 않도록 검사한다.
assert_runner_git_repo() {
  local top git_dir common_dir expected_git="$REPO/.git"

  top="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    log "실패: git 저장소 확인 불가"
    exit 1
  }
  git_dir="$(git rev-parse --absolute-git-dir 2>/dev/null)" || {
    log "실패: git 저장소 확인 불가"
    exit 1
  }
  common_dir="$(git rev-parse --git-common-dir 2>/dev/null)" || {
    log "실패: git 저장소 확인 불가"
    exit 1
  }
  if [[ "$common_dir" != /* ]]; then
    common_dir="$REPO/${common_dir#./}"
  fi
  if [[ "$top" != "$REPO" || "$git_dir" != "$expected_git" || "$common_dir" != "$expected_git" ]]; then
    log "실패: 작업 클론 git 컨텍스트 불일치"
    exit 1
  fi
}

# 오류 메시지나 실행 명령에 키가 포함될 수 있으므로 상세 출력은 버린다.
trap 'log "실패"; exit 1' ZERR
trap 'log "중단"; exit 1' HUP INT TERM

case "$#" in
  0) ;;
  1)
    if [[ "$1" == "--force" ]]; then
      FORCE=1
    else
      log "실패: 허용 인자는 --force"
      exit 1
    fi
    ;;
  *)
    log "실패: 허용 인자는 --force"
    exit 1
    ;;
esac

STEP="14일 간격 확인"
if (( ! FORCE )) && [[ -f "$LAST_OK" ]]; then
  # 달력 날짜 기준으로 계산한다. 잘못된 날짜는 실패 처리한다.
  GUARD="$(python3 - "$LAST_OK" 2>/dev/null <<'PY'
import datetime
import pathlib
import sys

saved = datetime.date.fromisoformat(
    pathlib.Path(sys.argv[1]).read_text().strip()
)
print("skip" if (datetime.date.today() - saved).days < 14 else "run")
PY
)"
  if [[ "$GUARD" == "skip" ]]; then
    log "건너뜀: 마지막 성공 이후 14일 미만"
    exit 0
  fi
fi
log "진행"

STEP="작업 클론 준비"
if [[ ! -e "$REPO" ]]; then
  git clone --depth 1 \
    https://github.com/CUTEKOREA/tuna-dashboard.git \
    "$REPO" >/dev/null 2>&1
fi
cd "$REPO"
assert_runner_git_repo
log "완료"

STEP="main 동기화"
# 이 클론은 수집 전용이다. 로컬 변경과 미전송 커밋을 버려도 된다.
assert_runner_git_repo
git fetch origin main >/dev/null 2>&1
git reset --hard origin/main >/dev/null 2>&1
git config --local user.name "cutekorea" >/dev/null 2>&1
git config --local user.email "cutekorea@gmail.com" >/dev/null 2>&1
log "완료"

STEP="키 읽기"
# .zshrc 전체를 source하지 않는다.
# 선택된 export 줄을 리터럴 값으로 해석하고 다시 인용한 뒤 eval한다.
# 다른 명령, 변수 확장, 명령 치환은 실행하지 않는다.
KEY_EXPORTS="$(python3 - "$HOME/.zshrc" 2>/dev/null <<'PY'
import pathlib
import re
import shlex
import sys

names = (
    "NASS_API_KEY", "KAMIS_API_KEY", "KAMIS_CERT_ID",
    "ECOS_API_KEY", "USDA_FAS_API_KEY",
)
pattern = re.compile(
    r"^\s*export\s+(" + "|".join(names) + r")="
)
path = pathlib.Path(sys.argv[1])
if not path.is_file():
    raise SystemExit(1)

exports = []
for line in path.read_text().splitlines():
    match = pattern.match(line)
    if not match:
        continue
    parts = shlex.split(line, comments=True, posix=True)
    if len(parts) != 2 or parts[0] != "export":
        raise SystemExit(1)
    name, separator, value = parts[1].partition("=")
    if not separator or name != match.group(1):
        raise SystemExit(1)
    exports.append(f"export {name}={shlex.quote(value)}")

print("\n".join(exports))
PY
)"
eval "$KEY_EXPORTS" >/dev/null 2>&1
unset KEY_EXPORTS
for NAME in NASS_API_KEY KAMIS_API_KEY KAMIS_CERT_ID ECOS_API_KEY USDA_FAS_API_KEY; do
  typeset -gx "${NAME}=${(P)NAME:-}"
done
if [[ -z "${NASS_API_KEY}" ]]; then
  log "실패: NASS_API_KEY 미설정"
  exit 1
fi
log "완료"

STEP="수집"
# 개별 지표의 수집 실패 시 이전 성공값 보존은 수집기가 담당한다.
python3 scripts/market_regime/market_regime.py \
  --out "$OUTPUT" >/dev/null 2>&1
log "완료"

STEP="fixtures 테스트"
(
  cd scripts/market_regime
  python3 -m unittest >/dev/null 2>&1
)
log "통과"

STEP="JSON 검증"
python3 - "$OUTPUT" >/dev/null 2>&1 <<'PY'
import json
import pathlib
import sys

def reject_constant(value):
    raise ValueError("Non-standard JSON constant")

doc = json.loads(
    pathlib.Path(sys.argv[1]).read_text(),
    parse_constant=reject_constant,
)
if not isinstance(doc, dict):
    raise SystemExit(1)
commodities = doc.get("commodities")
if not isinstance(commodities, dict):
    raise SystemExit(1)
if not all(isinstance(rows, list) for rows in commodities.values()):
    raise SystemExit(1)
indicators = [
    row for rows in commodities.values() for row in rows
]
if not indicators or not all(
    isinstance(row, dict) and isinstance(row.get("id"), str)
    and row["id"]
    for row in indicators
):
    raise SystemExit(1)
PY
log "통과"

STEP="키 유출 검사"
for NAME in NASS_API_KEY KAMIS_API_KEY KAMIS_CERT_ID \
            ECOS_API_KEY USDA_FAS_API_KEY; do
  SECRET="${(P)NAME}"
  [[ -n "$SECRET" ]] || continue

  # 키를 명령 인자나 로그에 넣지 않고 표준 입력으로 전달한다.
  if LC_ALL=C grep -F -q -f /dev/stdin "$OUTPUT" \
      <<<"$SECRET" >/dev/null 2>&1; then
    unset SECRET
    log "실패: 결과 파일에서 키 문자열 발견"
    exit 1
  else
    GREP_RC=$?
    if (( GREP_RC != 1 )); then
      unset SECRET
      log "실패: 검사 오류"
      exit 1
    fi
  fi
done
unset SECRET NAME
log "통과"

STEP="변경 확인"
git add -- "$OUTPUT" >/dev/null 2>&1
if git diff --cached --quiet -- "$OUTPUT" >/dev/null 2>&1; then
  log "변경 없음"
else
  DIFF_RC=$?
  if (( DIFF_RC != 1 )); then
    log "실패"
    exit 1
  fi

  STEP="커밋"
  TODAY="$(/bin/date '+%Y-%m-%d')"
  git commit -m "data(market-regime): $TODAY 정기 갱신" \
    >/dev/null 2>&1
  log "완료"

  STEP="push"
  git push origin HEAD:main >/dev/null 2>&1
  log "완료"
fi

STEP="성공 날짜 기록"
# 원자적으로 교체한다. 앞 단계 실패 시 last_ok는 갱신하지 않는다.
python3 - "$LAST_OK" >/dev/null 2>&1 <<'PY'
import datetime
import os
import pathlib
import sys
import tempfile

target = pathlib.Path(sys.argv[1])
with tempfile.NamedTemporaryFile(
    mode="w", dir=target.parent, prefix=".last_ok.", delete=False
) as stream:
    stream.write(datetime.date.today().isoformat() + "\n")
    stream.flush()
    os.fsync(stream.fileno())
    temporary = stream.name
os.replace(temporary, target)
PY
log "성공"
