#!/usr/bin/env python3
"""파노피 월간보고 pptx -> public/data/panofi/panofi_liquidity.json

원자료: PANOFI 월간보고 (1·2·4·5·7월).pptx  ※ 3·6월은 부재(원본 공백)

추정실적 xlsx 에 없는 두 가지를 여기서만 얻는다:
  1) 자금유동성 — 현금·매출채권·매입채무 월말 잔액
  2) 익월 추정손익 — 전년 동월 대비

각 pptx 는 «전월 자금 + 당월 추정손익» 구조라 보고월과 데이터 기준월이 한 달 어긋난다.
표에 찍힌 날짜(’26. 6/30 등)를 정본으로 쓰고 파일명은 참고만 한다.
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from hashlib import sha256
from pathlib import Path

SRC_DIR = Path.home() / "my-project/11_Panofi_Cosmo_GGL /11. PANOFI/Panofi"
OUT = Path(__file__).resolve().parents[1] / "public/data/panofi/panofi_liquidity.json"


def pptx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as z:
        slides = sorted(
            (n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
            key=lambda x: int(re.search(r"(\d+)", x.split("/")[-1]).group()),
        )
        raw = " ".join(re.sub(r"<[^>]+>", " ", z.read(s).decode("utf8")) for s in slides)
    return re.sub(r"\s+", " ", raw)


def money(s: str) -> float | None:
    """'$7,680' / '($1,876)' -> 7680.0 / -1876.0. 괄호는 음수 표기다."""
    s = s.strip()
    neg = s.startswith("(") and s.endswith(")")
    s = s.strip("()").replace("$", "").replace(",", "").strip()
    if not re.fullmatch(r"-?\d+(\.\d+)?", s):
        return None
    v = float(s)
    return -v if neg else v


def parse_liquidity(text: str) -> list[dict]:
    """'구 분 ’26. 1/1 ’26. 5/31 ’26. 6/30 전월대비 증감 현금 $... $... $... ($...)' 구조.

    날짜 헤더가 3개, 그 뒤 계정마다 값 4개(3개 날짜 + 증감)가 붙는다.
    """
    i = text.rfind("자금유동성")
    if i < 0:
        return []
    seg = text[i:i + 1200]
    # 원문이 첫 항목만 왼쪽 따옴표(‘26. 1/1), 나머지는 오른쪽(’26. 5/31)을 쓴다.
    # 따옴표 종류에 기대면 첫 열을 놓치므로 «두자리 연도. 월/일» 패턴만 본다.
    dates = re.findall(r"(\d{2})\.\s*(\d{1,2})\s*/\s*(\d{1,2})", seg)
    if len(dates) < 3:
        return []
    labels = [f"20{y}-{int(m):02d}-{int(d):02d}" for y, m, d in dates[:3]]

    rows: dict[str, list[float | None]] = {}
    for account in ("현금", "매출채권", "매입채무"):
        m = re.search(re.escape(account) + r"((?:\s*\(?\$[\d,]+\)?){2,4})", seg)
        if not m:
            continue
        vals = [money(v) for v in re.findall(r"\(?\$[\d,]+\)?", m.group(1))]
        rows[account] = vals

    out = []
    for idx, label in enumerate(labels):
        rec: dict = {"asOf": label}
        for account, vals in rows.items():
            rec[account] = vals[idx] if idx < len(vals) else None
        out.append(rec)
    return out


def parse_estimate(text: str) -> dict | None:
    """'구 분 2025년 N월 2026년 N월(추정) 증감' 블록 — 익월 추정손익."""
    m = re.search(r"(\d{4})\s*년\s*(\d{1,2})\s*월\s*\(\s*추정\s*\)", text)
    if not m:
        return None
    seg_start = text.find("매출액", m.end() - 200)
    if seg_start < 0:
        return None
    seg = text[seg_start:seg_start + 420]
    out: dict = {"forYear": int(m.group(1)), "forMonth": int(m.group(2))}
    for account, key in (("매출액", "revenue"), ("매출총이익", "grossProfit"),
                         ("영업이익", "operating"), ("당기순이익", "net")):
        mm = re.search(re.escape(account) + r"((?:\s*\(?\$[\d,]+\)?){2,3})", seg)
        if mm:
            vals = [money(v) for v in re.findall(r"\(?\$[\d,]+\)?", mm.group(1))]
            # [전년 동월, 당년 추정, (증감)]
            out[f"{key}PrevYear"] = vals[0] if vals else None
            out[key] = vals[1] if len(vals) > 1 else None
    return out


def main() -> int:
    files = sorted(SRC_DIR.glob("PANOFI 월간보고 (*월).pptx"))
    files = [f for f in files if not f.name.startswith("~$")]
    if not files:
        print(f"원자료 없음: {SRC_DIR}", file=sys.stderr)
        return 1

    liquidity: dict[str, dict] = {}
    estimates = []
    sources = []
    for f in files:
        text = pptx_text(f)
        sources.append({
            "file": f.name,
            "sha256": sha256(f.read_bytes()).hexdigest()[:16],
        })
        for rec in parse_liquidity(text):
            # 같은 기준일이 여러 보고에 반복 등장한다. 뒤에 나온 보고가 최신 정정본이다.
            liquidity[rec["asOf"]] = rec
        est = parse_estimate(text)
        if est:
            estimates.append(est)

    series = sorted(liquidity.values(), key=lambda r: r["asOf"])
    for r in series:
        cash, ar, ap = r.get("현금"), r.get("매출채권"), r.get("매입채무")
        r["과부족"] = (
            round(cash + ar - ap, 1) if None not in (cash, ar, ap) else None
        )

    print(f"자금 기준일 {len(series)}개 · 추정손익 {len(estimates)}건", file=sys.stderr)
    for r in series:
        print(f"  {r['asOf']}  현금 {r.get('현금')}  매출채권 {r.get('매출채권')}"
              f"  매입채무 {r.get('매입채무')}  과부족 {r.get('과부족')}", file=sys.stderr)

    payload = {
        "meta": {
            "unit": "천 달러",
            "sources": sources,
            "missingMonths": ["3월", "6월"],
            "caveat": "월간보고 3·6월분은 원본이 없다(보고 공백). 각 pptx 는 «전월 자금 + 당월 "
                      "추정손익» 구조라 파일명 월과 데이터 기준월이 한 달 어긋난다 — 표에 찍힌 "
                      "기준일을 정본으로 썼다. 같은 기준일이 여러 보고에 반복되면 나중 보고를 "
                      "정정본으로 채택했다.",
            "knownDiscrepancy": "2025-12-31 매입채무가 1월 보고에서는 44,158, 2월 보고의 "
                                "'26.1/1 기초에서는 41,158 로 3,000 천불 어긋난다. 전략보고도 "
                                "같은 건을 데이터 품질 이슈로 등재했다 — 경리 확인 필요 사항이며 "
                                "여기서는 원본 값을 그대로 보존한다.",
        },
        "series": series,
        "estimates": estimates,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"-> {OUT} ({OUT.stat().st_size // 1024}KB)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
