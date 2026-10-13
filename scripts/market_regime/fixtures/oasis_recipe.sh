#!/bin/bash
# KREI OASIS 농산물 소매가격 일간 CSV.
# 사용: oasis_recipe.sh ITEM_CODE > out.csv
# 키 없음. 세션 쿠키만 사용한다.
# 순서: GET agriPrice.do(쿠키) → 부류·품종·등급 조회
#       → POST agriPrice.do(화면) → POST agriPriceCsv.do → POST excelDownload.do
# 일간은 화면 기본값이라 tabId 를 비운다. 기간은 화면과 같이 오늘과 한 달 전.
# 품종은 ALL 이 아닌 첫 값, 등급은 04(상품)가 있으면 그 값.
# 응답 본문은 EUC-KR 이다. 변환하지 않고 그대로 표준출력에 쓴다.
set -euo pipefail

ITEM=${1:-}
case "$ITEM" in
  ''|*[!0-9]*)
    echo "usage: $0 ITEM_CODE > out.csv" >&2
    exit 2
    ;;
esac

BASE=https://oasis.krei.re.kr
UA='Mozilla/5.0'
REF="$BASE/basicInfo/retailale/agriPrice.do"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

read -r START END <<EOF
$(python3 - <<'PY'
import calendar
import datetime
today = datetime.date.today()
year, month = today.year, today.month - 1
if month == 0:
    year, month = year - 1, 12
last = calendar.monthrange(year, month)[1]
if today.day <= last:
    start = datetime.date(year, month, today.day)
else:
    start = datetime.date(year, month, last) + datetime.timedelta(days=today.day - last)
print(start.isoformat(), today.isoformat())
PY
)
EOF

curl -fsS -c "$TMP/cookies.txt" -A "$UA" -o "$TMP/page.html" \
  "$REF"

common=(
  --data-urlencode 'pageIndex=1'
  --data-urlencode 'userSelectMenuId=010103'
  --data-urlencode 'gradNm='
  --data-urlencode "sCalendar=$START"
  --data-urlencode "eCalendar=$END"
  --data-urlencode 'pageUnit=10'
)

CODE1=
for c1 in 100 200 300 400; do
  curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
    -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
    -H 'X-Requested-With: XMLHttpRequest' \
    --data-urlencode 'tabId=' \
    --data-urlencode 'fileName=' \
    --data-urlencode 'cmd=init' \
    --data-urlencode 'noData=0' \
    --data-urlencode 'excelMode=' \
    --data-urlencode 'codeType=code2' \
    --data-urlencode "code1=$c1" \
    "${common[@]}" \
    -o "$TMP/code2.html" \
    "$BASE/selectAgriPriceCode.do"
  if ITEM="$ITEM" HTML="$TMP/code2.html" python3 - <<'PY'
import os, re, sys
text = open(os.environ["HTML"], encoding="utf-8", errors="replace").read()
item = os.environ["ITEM"]
sys.exit(0 if re.search(r'name="code2" value="%s"' % re.escape(item), text) else 1)
PY
  then
    CODE1=$c1
    break
  fi
done
if [ -z "$CODE1" ]; then
  echo "item $ITEM not in code1 100/200/300/400 for $START..$END" >&2
  exit 1
fi

curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'X-Requested-With: XMLHttpRequest' \
  --data-urlencode 'tabId=' \
  --data-urlencode 'fileName=' \
  --data-urlencode 'cmd=init' \
  --data-urlencode 'noData=0' \
  --data-urlencode 'excelMode=' \
  --data-urlencode 'codeType=code3' \
  --data-urlencode "code1=$CODE1" \
  --data-urlencode "code2=$ITEM" \
  "${common[@]}" \
  -o "$TMP/code3.html" \
  "$BASE/selectAgriPriceCodeToYear.do?checkAll=CODE3"

CODE3=$(HTML="$TMP/code3.html" python3 - <<'PY'
import os, re, sys
text = open(os.environ["HTML"], encoding="utf-8", errors="replace").read()
vals = [v for v in re.findall(r'name="code3" value="([^"]+)"', text) if v != "ALL"]
if not vals:
    sys.exit(1)
print(vals[0])
PY
) || { echo "no code3 for item $ITEM" >&2; exit 1; }

curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'X-Requested-With: XMLHttpRequest' \
  --data-urlencode 'tabId=' \
  --data-urlencode 'fileName=' \
  --data-urlencode 'cmd=init' \
  --data-urlencode 'noData=0' \
  --data-urlencode 'excelMode=' \
  --data-urlencode 'codeType=code4' \
  --data-urlencode "code1=$CODE1" \
  --data-urlencode "code2=$ITEM" \
  --data-urlencode "code3=$CODE3" \
  "${common[@]}" \
  -o "$TMP/code4.html" \
  "$BASE/selectAgriPriceCode.do?checkAll=CODE4"

CODE4=$(HTML="$TMP/code4.html" python3 - <<'PY'
import os, re, sys
text = open(os.environ["HTML"], encoding="utf-8", errors="replace").read()
vals = [v for v in re.findall(r'name="code4" value="([^"]+)"', text) if v != "ALL"]
if not vals:
    sys.exit(1)
print("04" if "04" in vals else vals[0])
PY
) || { echo "no code4 for item $ITEM variety $CODE3" >&2; exit 1; }

curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'tabId=' \
  --data-urlencode 'fileName=' \
  --data-urlencode 'cmd=service' \
  --data-urlencode 'noData=0' \
  --data-urlencode 'excelMode=' \
  --data-urlencode 'codeType=code4' \
  --data-urlencode "code1=$CODE1" \
  --data-urlencode "code2=$ITEM" \
  --data-urlencode "code3=$CODE3" \
  --data-urlencode "code4=$CODE4" \
  "${common[@]}" \
  -o "$TMP/search.html" \
  "$REF"

NODATA=$(HTML="$TMP/search.html" python3 - <<'PY'
import os, re
text = open(os.environ["HTML"], encoding="utf-8", errors="replace").read()
m = re.search(r'id="noData"[^>]*value="([^"]*)"', text)
print(m.group(1) if m else "0")
PY
)
case "$NODATA" in
  ''|0) echo "search returned no rows (code1=$CODE1 code3=$CODE3 code4=$CODE4)" >&2; exit 1 ;;
esac

curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'X-Requested-With: XMLHttpRequest' \
  --data-urlencode 'tabId=' \
  --data-urlencode 'fileName=' \
  --data-urlencode 'cmd=service' \
  --data-urlencode "noData=$NODATA" \
  --data-urlencode 'excelMode=excel' \
  --data-urlencode 'codeType=code4' \
  --data-urlencode "code1=$CODE1" \
  --data-urlencode "code2=$ITEM" \
  --data-urlencode "code3=$CODE3" \
  --data-urlencode "code4=$CODE4" \
  "${common[@]}" \
  -o "$TMP/csvname.txt" \
  "$BASE/basicInfo/retailale/agriPriceCsv.do"

FNAME=$(python3 -c 'print(open("'"$TMP/csvname.txt"'", encoding="utf-8", errors="replace").read().strip().strip("\""))')
case "$FNAME" in
  *.csv) ;;
  *) echo "agriPriceCsv.do did not return a csv name" >&2; exit 1 ;;
esac

curl -fsS -b "$TMP/cookies.txt" -c "$TMP/cookies.txt" -A "$UA" -e "$REF" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -D "$TMP/dl.hdr" \
  --data-urlencode 'tabId=' \
  --data-urlencode "fileName=$FNAME" \
  --data-urlencode 'cmd=service' \
  --data-urlencode "noData=$NODATA" \
  --data-urlencode 'excelMode=excel' \
  --data-urlencode 'codeType=code4' \
  --data-urlencode "code1=$CODE1" \
  --data-urlencode "code2=$ITEM" \
  --data-urlencode "code3=$CODE3" \
  --data-urlencode "code4=$CODE4" \
  "${common[@]}" \
  -o "$TMP/out.csv" \
  "$BASE/excelDownload.do"

if ! grep -q 'Content-Disposition: attachment' "$TMP/dl.hdr"; then
  echo "excelDownload.do did not attach a file" >&2
  exit 1
fi
if [ ! -s "$TMP/out.csv" ] || [ "$(head -c 1 "$TMP/out.csv")" = "<" ]; then
  echo "excelDownload.do body is not a csv" >&2
  exit 1
fi

cat "$TMP/out.csv"
