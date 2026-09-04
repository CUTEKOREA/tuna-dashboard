#!/usr/bin/env python3
"""이미 들어와 있는 데일리 브리핑에서 원어 시세를 뽑아 추가 후보를 제안한다.

Atuna 사이트는 페이월이라 긁을 수 없다. 그런데 **그날 기사는 이미 로컬에 있다** —
`sync:briefing` 이 읽는 것과 같은 `참치뉴스_게시판용_YYYY-MM-DD.html` 이고, 그 본문에
「만타 가공 허브의 최근 현물가는 톤당 USD 2,220」 같은 문장이 들어 있다.
그래서 페이월을 건드리지 않고도 시세를 얻을 수 있다. 이 스크립트가 하는 일이 그것이다.

**제안만 한다. 파일을 직접 고치지 않는다.** 한국어 산문에서 숫자를 뽑는 일이라
오독 여지가 있고, 값이 차트에 바로 들어가기 때문이다. 사람이 보고 넣는다.

거르는 것:
  · 이미 있는 날짜             — 덮어쓰지 않는다
  · 최근 21일 안의 같은 값     — 「8월 말 방콕 $2,000」처럼 지난 시세를 되짚는 문장이 흔하다
  · 통화가 USD 가 아닌 값      — 계열이 통화를 구분하지 않아 섞으면 차트가 틀어진다. 따로 보고한다

  python3 scripts/propose_atuna_prices.py            # 최근 30일치 훑어 제안
  python3 scripts/propose_atuna_prices.py --days 90
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PRICES = ROOT / "data/atuna_prices.json"
BRIEFING_DIR = Path.home() / (
    "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/"
    "신라그룹/01. 신라교역/09. 데일리 기사"
)
FILENAME = re.compile(r"^참치뉴스_게시판용_(\d{4}-\d{2}-\d{2})\.html$")

# 계열 키는 <어종>_<시장>. 시장 이름은 기사에서 한글·영문이 섞여 나온다.
MARKETS = {
    "skj_bkk": ("방콕", "BKK", "Bangkok"),
    "skj_mnt": ("만타", "Manta"),
    "skj_sey": ("세이셸", "Seychelle"),
    "skj_abj": ("아비장", "Abidjan"),
    "skj_vig": ("비고", "Vigo"),
}
# 어종은 단어 경계로 잡는다. 「YF」를 부분일치로 두면 «옐로카드» 가 황다랑어로 잡힌다
# (2026-09-04 실측 오독). 약어는 앞뒤가 글자가 아닐 때만 인정한다.
YELLOWFIN = re.compile(r"황다랑어|옐로우?핀|Yellowfin|(?<![A-Za-z])YF(?![A-Za-z])", re.I)
SKIPJACK = re.compile(r"가다랑어|스킵잭|Skipjack|(?<![A-Za-z])SKJ(?![A-Za-z])", re.I)

# 값이 실제 시세가 아님을 알리는 표지. 하나라도 걸리면 그 문장은 통째로 버린다.
# 전부 2026-09-04 에 실제로 오독을 만든 문형이다.
DISQUALIFY = re.compile(
    r"반영하면|환산|가정|추정|전망|예상|"          # 파생·가정값  (「관세 반영하면 약 2,220달러」)
    r"월초|지난주|지난달|전월|\d+\s*주\s*전|"          # 과거 되짚기 (「월초 1,900 → 8월 말 2,000」)
    r"평균\s*USD|평균\s*[\d,]+\s*달러"              # 복수 산지 평균 (세이셸 단독이 아님)
)
# 「6월 대비 6.7% 올랐다」처럼 «대비» 는 현재 시세의 변화율을 말하는 정상 문형이라
# 되짚기 표지에 넣지 않는다. 넣었더니 참값까지 죽였다(2026-09-04).
# 한 문장에 시장이 둘 이상이면 어느 값이 어느 시장인지 못 가른다 — 통째로 버린다.
# 「1,790 / 2,150 방콕 / 만타」 같은 표 조각이 이 문형이다.
MAX_MARKETS_PER_SENTENCE = 1
# 시장 이름과 숫자가 이만큼 떨어져 있으면 같은 사실을 말한다고 보지 않는다.
MAX_DISTANCE = 70

# 「톤당 USD 2,220」 / 「USD 2,220/톤」 양쪽을 받는다. 숫자는 3~5자리(백~만 단위 $/톤).
PRICE = re.compile(
    r"(?:톤당\s*)?(USD|EUR|\$)\s?([\d,]{3,6})\s*(?:/\s*톤|\s*/톤)?|"
    r"([\d,]{3,6})\s*달러\s*(?:/\s*톤|톤당)?",
    re.I,
)
DEDUP_WINDOW_DAYS = 21


class ProposeError(RuntimeError):
    pass


def strip_html(raw: str) -> str:
    text = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", raw, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(re.sub(r"\s+", " ", text))


def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.。])\s+|\n", text) if s.strip()]


def species_of(sentence: str) -> str | None:
    yf, skj = YELLOWFIN.search(sentence), SKIPJACK.search(sentence)
    if yf and skj:
        return None          # 둘 다 나오면 어느 값인지 못 가른다
    if yf:
        return "yf"
    if skj:
        return "skj"
    return None


def market_hits(sentence: str) -> list[tuple[str, int]]:
    """문장에 나온 (시장키, 위치). 같은 시장이 여러 번이면 첫 위치만."""
    out: dict[str, int] = {}
    for key, names in MARKETS.items():
        for name in names:
            i = sentence.lower().find(name.lower())
            if i >= 0:
                out[key] = min(out.get(key, i), i)
                break
    return sorted(out.items(), key=lambda kv: kv[1])


def extract(text: str) -> list[dict[str, Any]]:
    """시장 이름 바로 옆의 톤당 가격만 후보로 본다.

    한 문장에 시장이 둘 이상이거나, 파생·과거·평균을 가리키는 표지가 있으면 버린다.
    적게 건지더라도 틀린 값을 올리지 않는 쪽이 낫다 — 이 값은 차트에 바로 들어간다."""
    found: list[dict[str, Any]] = []
    for sentence in sentences(text):
        if "톤당" not in sentence and "/톤" not in sentence and "per tonne" not in sentence.lower():
            continue
        if DISQUALIFY.search(sentence):
            continue
        hits = market_hits(sentence)
        if len(hits) != MAX_MARKETS_PER_SENTENCE:
            continue
        key, pos = hits[0]
        species = species_of(sentence)
        if species is None:
            continue                      # 어종이 모호하면 계열을 못 정한다
        for match in PRICE.finditer(sentence):
            ccy = (match.group(1) or "USD").upper().replace("$", "USD")
            raw = match.group(2) or match.group(3)
            if not raw:
                continue
            value = float(raw.replace(",", ""))
            if not 500 <= value <= 9999:
                continue
            if abs(match.start() - pos) > MAX_DISTANCE:
                continue                  # 시장 이름에서 멀면 다른 사실의 숫자다
            found.append({
                "series": f"{species}_{key.split('_')[1]}",
                "value": value,
                "currency": ccy,
                "distance": abs(match.start() - pos),
                "sentence": sentence[:200],
            })
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=30, help="훑을 기간(일)")
    parser.add_argument("--dir", type=Path, default=BRIEFING_DIR)
    parser.add_argument("--prices", type=Path, default=PRICES)
    args = parser.parse_args()

    if not args.dir.exists():
        raise ProposeError(f"브리핑 폴더가 없습니다: {args.dir}")
    rows = json.loads(args.prices.read_text(encoding="utf-8"))
    have_dates = {r["date"] for r in rows}
    cutoff = date.today() - timedelta(days=args.days)

    def seen_recently(series: str, value: float, when: date) -> str | None:
        for r in rows:
            if r.get(series) != value:
                continue
            d = datetime.strptime(r["date"], "%Y-%m-%d").date()
            if abs((when - d).days) <= DEDUP_WINDOW_DAYS:
                return r["date"]
        return None

    proposals: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    scanned = 0
    for folder in sorted(args.dir.iterdir()):
        if not folder.is_dir():
            continue
        # glob 대신 정규식으로 고른다 — 파일명이 NFD(자모 분리)로 저장돼 있으면
        # glob 의 리터럴 비교가 조용히 빗나간다. Drive/Finder 경유 파일에서 흔한 함정이다.
        for path in sorted(folder.iterdir()):
            if not path.is_file():
                continue
            m = FILENAME.match(unicodedata.normalize("NFC", path.name))
            if not m:
                continue
            when = datetime.strptime(m.group(1), "%Y-%m-%d").date()
            if when < cutoff:
                continue
            scanned += 1
            for hit in extract(strip_html(path.read_text(encoding="utf-8", errors="ignore"))):
                entry = {"date": when.isoformat(), **hit}
                if hit["currency"] != "USD":
                    entry["skip"] = f"통화가 {hit['currency']} — 계열은 통화를 구분하지 않는다"
                    skipped.append(entry); continue
                prior = seen_recently(hit["series"], hit["value"], when)
                if prior:
                    entry["skip"] = f"{prior} 에 같은 값이 이미 있음 (지난 시세 되짚기로 보임)"
                    skipped.append(entry); continue
                if when.isoformat() in have_dates:
                    existing = next(r for r in rows if r["date"] == when.isoformat())
                    if hit["series"] in existing:
                        entry["skip"] = "그 날짜의 같은 계열이 이미 있음"
                        skipped.append(entry); continue
                proposals.append(entry)

    # 같은 날 같은 계열이 여러 문장에 나오면 한 번만
    unique: dict[tuple[str, str], dict[str, Any]] = {}
    for p in proposals:
        unique.setdefault((p["date"], p["series"]), p)

    print(json.dumps({
        "scannedFiles": scanned,
        "windowDays": args.days,
        "proposals": sorted(unique.values(), key=lambda p: (p["date"], p["series"])),
        "skipped": skipped,
    }, ensure_ascii=False, indent=2))
    if unique:
        print(f"\n제안 {len(unique)}건 — 문장을 확인한 뒤 {args.prices} 에 넣으세요.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ProposeError as error:
        print(f"❌ {error}", file=sys.stderr)
        raise SystemExit(1) from error
