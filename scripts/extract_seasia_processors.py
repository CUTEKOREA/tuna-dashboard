#!/usr/bin/env python3
"""동남아 수산물 가공사 조사보고서 -> public/data/bangkok/seasia_processors.json

원자료: ~/my-project/01. 신라교역/15_수산물_가공공장/
  · 태국_수산물가공_MA후보_비교보고서.html   (심층 20 · 전수 47개사)
  · 베트남_수산물가공_MA후보_비교보고서.html (심층 21 · 전수 294개사)

원본 제목의 「(16개사)」·「(20개사)」는 표 실제 행수와 다르다. 제목이 낡은 것이므로
행수를 정본으로 쓰고 제목은 인용하지 않는다.

두 보고서는 열 스키마가 같다. 표를 **위치가 아니라 헤더 서명**으로 잡는다 —
베트남은 앞에 「보완 반영 요약」 표가 하나 더 있어 인덱스로 잡으면 한 칸씩 밀린다.

셀 안에는 원본이 붙인 신뢰도 태그(확인·추정·불가)가 `<span class="pill p-fact">` 로 박혀 있다.
이 등급 체계를 재발명하지 않고 그대로 뽑아 값과 분리해 싣는다 — 화면에서 어떤 칸이
확인된 사실이고 어떤 칸이 추정인지 읽는 사람이 알아야 한다.
"""
from __future__ import annotations

import html
import json
import re
import sys
from hashlib import sha256
from pathlib import Path

SRC_DIR = Path.home() / "my-project/01. 신라교역/15_수산물_가공공장"
OUT = Path(__file__).resolve().parents[1] / "public/data/bangkok/seasia_processors.json"

REPORTS = {
    "태국": "태국_수산물가공_MA후보_비교보고서.html",
    "베트남": "베트남_수산물가공_MA후보_비교보고서.html",
}

# 헤더 서명 → 표 종류. 첫 두 열만 봐도 갈린다.
SIGNATURES = {
    "topPicks": ("#", "회사"),
    "profiles": ("회사/등기", "소재·설립"),
    "profilesVn": ("회사/세번·DL", "소재·설립"),
    "shortlist": ("순위", "회사"),
    "registry": ("#", "제조업소(통관표기)"),
}

TAGS = ("확인", "실측", "추정", "불가", "미확보")


def txt(fragment: str) -> str:
    """태그를 지운 평문. 셀 안 줄바꿈은 공백 하나로 접는다."""
    s = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


# 원본 마크업 실측(2026-08-17): 신뢰도는 <span class="pill p-fact|p-na|...>, 등급은
# <span class="grade g-high|g-mid|...>, 회사 부제는 class="co-sub", 출처는 class="src".
# 클래스 이름을 추측하지 않고 실제 파일에서 확인한 것만 쓴다.
PILL_RE = re.compile(r'<span[^>]*class="[^"]*\bpill\b[^"]*"[^>]*>(.*?)</span>', re.S)
GRADE_RE = re.compile(r'<span[^>]*class="[^"]*\bgrade\b[^"]*"[^>]*>(.*?)</span>', re.S)
SUB_RE = re.compile(r'<span[^>]*class="[^"]*\b(?:co-sub|src|flagKR)\b[^"]*"[^>]*>(.*?)</span>', re.S)


def cell(fragment: str) -> dict:
    """값·신뢰도 태그·등급·부제를 분리한다. 등급 체계는 원본 것을 그대로 쓴다."""
    marks = [txt(m) for m in PILL_RE.findall(fragment)]
    grades = [txt(m) for m in GRADE_RE.findall(fragment)]
    subs = [txt(m) for m in SUB_RE.findall(fragment)]
    body = PILL_RE.sub(" ", fragment)
    body = GRADE_RE.sub(" ", body)
    body = SUB_RE.sub(" ", body)
    rec = {"v": txt(body)}
    if marks:
        rec["tags"] = marks
    if grades:
        rec["grade"] = grades[0] if len(grades) == 1 else grades
    if subs:
        rec["sub"] = subs
    return rec


def parse_tables(src: str) -> list[dict]:
    out = []
    for t in re.findall(r"<table.*?</table>", src, re.S):
        heads = [txt(x) for x in re.findall(r"<th[^>]*>(.*?)</th>", t, re.S)]
        if not heads:
            continue
        rows = []
        for r in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
            cells = re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)
            if cells:
                rows.append([cell(c) for c in cells])
        out.append({"heads": heads, "rows": rows})
    return out


def classify(heads: list[str]) -> str | None:
    if len(heads) < 2:
        return None
    key = (heads[0], heads[1])
    for name, sig in SIGNATURES.items():
        if key == sig:
            return "profiles" if name == "profilesVn" else name
    return None


def rows_as_dicts(tbl: dict) -> list[dict]:
    """헤더 수와 셀 수가 어긋나는 행이 있다 — colspan 때문이다.
    잘라 맞추지 않고 남는 셀은 '_extra' 로 보존한다. 조용히 버리면 열이 밀린다."""
    out = []
    heads = tbl["heads"]
    for r in tbl["rows"]:
        rec: dict = {}
        for i, c in enumerate(r):
            key = heads[i] if i < len(heads) else f"_extra{i}"
            rec[key] = c
        out.append(rec)
    return out


def main() -> int:
    if not SRC_DIR.exists():
        print(f"원자료 폴더 없음: {SRC_DIR}", file=sys.stderr)
        return 1

    payload: dict = {
        "meta": {
            "source": "신라교역 사내 조사보고서 (15_수산물_가공공장)",
            "note": "심층 프로파일·인수 매력도 Shortlist·한국 거래처 전수표를 원본 그대로 옮긴다. "
                    "셀에 붙은 신뢰도 태그(확인·추정·불가 등)는 원본이 매긴 것이며 값과 분리해 실었다.",
            "countries": [],
        },
        "countries": {},
    }

    for country, fname in REPORTS.items():
        path = SRC_DIR / fname
        if not path.exists():
            print(f"  건너뜀 — 파일 없음: {fname}", file=sys.stderr)
            continue
        src = path.read_text(encoding="utf8", errors="replace")
        title = txt((re.search(r"<title>(.*?)</title>", src, re.S) or ["", ""])[1])
        tables = parse_tables(src)

        found: dict[str, list[dict]] = {}
        for t in tables:
            kind = classify(t["heads"])
            if kind and kind not in found:
                found[kind] = rows_as_dicts(t)

        rec = {
            "title": title,
            "sourceFile": fname,
            "sha256": sha256(path.read_bytes()).hexdigest()[:16],
            "topPicks": found.get("topPicks", []),
            "profiles": found.get("profiles", []),
            "shortlist": found.get("shortlist", []),
            "registry": found.get("registry", []),
        }
        payload["countries"][country] = rec
        payload["meta"]["countries"].append(country)

        print(f"{country}: 심층 {len(rec['profiles'])} · Shortlist {len(rec['shortlist'])} · "
              f"전수 {len(rec['registry'])} · TopPicks {len(rec['topPicks'])}", file=sys.stderr)

        missing = [k for k in ("topPicks", "profiles", "shortlist", "registry") if not rec[k]]
        if missing:
            print(f"  !! 못 찾은 표: {missing} — 헤더 서명 확인 필요", file=sys.stderr)

    # 자기점검 — 태그가 하나도 안 잡히면 파서가 태그 마크업을 놓친 것이다.
    tagged = sum(1 for c in payload["countries"].values()
                 for r in c["profiles"] for v in r.values()
                 if isinstance(v, dict) and v.get("tags"))
    print(f"신뢰도 태그가 붙은 셀 {tagged}개", file=sys.stderr)
    if tagged == 0:
        print("!! 태그를 하나도 못 잡았다 — 원본 마크업이 바뀌었는지 확인", file=sys.stderr)

    total = sum(len(c["registry"]) for c in payload["countries"].values())
    payload["meta"]["registryTotal"] = total
    payload["meta"]["taggedCells"] = tagged

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 전수표 합계 {total}개사", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
