#!/usr/bin/env python3
"""발행본 표의 세로합을 기계로 검산한다.

`ask_codex` 에 시켰더니 파일을 되읽기만 하고 끝났다. 결정적 산술은 스크립트가 한다
(orchestrate: 「결정적 산술을 LLM 에이전트로 감싸지 마라」).

「합계」·「계」·「합」 이 들어간 행을 찾아 같은 열의 위쪽 숫자들과 맞춰 본다.
숫자를 못 읽는 칸이 하나라도 있으면 그 열은 건너뛴다 — 억지 지적을 만들지 않기 위해서다.
"""
from __future__ import annotations

import html as H
import re
import sys
from pathlib import Path

EV = Path(__file__).resolve().parents[1] / "docs/evidence"
NUM = re.compile(r'^-?[\d,]+(?:\.\d+)?$')
TOTAL = re.compile(r'합계|합 계|총계|^계$')
RATE = re.compile(r'률|율|비중|증감|전년비|%|단가|평균')


def cells(row: str) -> list[str]:
    return [H.unescape(re.sub(r'<[^>]+>', ' ', c)).strip()
            for c in re.findall(r'<t[hd][^>]*>.*?</t[hd]>', row, re.S)]


def val(t: str):
    """칸의 **첫 숫자**만 읽는다.

    「2,409  68.3%」나 「559,209 (79%)」처럼 값과 비율이 한 칸에 같이 있는 표가 많다.
    비숫자를 지우고 이어 붙이면 285,940 같은 유령 값이 나와 전부 거짓 지적이 된다.
    """
    t = t.replace(",", "").strip()
    m = re.match(r'^[−-]?\d+(?:\.\d+)?', t)
    return float(m.group(0).replace("−", "-")) if m else None


def main() -> int:
    bad = 0
    for d in sorted(EV.glob("company-*")):
        f = d / "보고서.html"
        if not f.exists():
            continue
        s = f.read_text(encoding="utf-8")
        for ti, tbl in enumerate(re.findall(r'<table.*?</table>', s, re.S)):
            rows = [cells(r) for r in re.findall(r'<tr.*?</tr>', tbl, re.S)]
            rows = [r for r in rows if r]
            tot = next((i for i, r in enumerate(rows) if r and TOTAL.search(r[0])), None)
            if tot is None or tot < 2:
                continue
            body, trow = rows[1:tot], rows[tot]
            # 셀 수가 어긋나는 표는 건너뛴다. rowspan·colspan 이 있으면 열이 밀려
            # 엉뚱한 값끼리 더하게 되고, 그게 전부 거짓 지적이 된다.
            widths = {len(r) for r in body} | {len(trow)}
            if len(widths) != 1:
                continue
            head = rows[0]
            for c in range(1, len(trow)):
                # 비율 열은 더하는 값이 아니다. 합계칸의 18.9%는 가중평균이지 세로합이 아니다.
                if c < len(head) and RATE.search(head[c]):
                    continue
                if all("%" in r[c] for r in body):
                    continue
                want = val(trow[c])
                got = [val(r[c]) for r in body]
                if want is None or any(g is None for g in got) or len(got) < 2:
                    continue
                if abs(sum(got) - want) > max(1.0, abs(want) * 0.005):
                    bad += 1
                    print(f"  ★ {d.name} 표{ti+1} 열{c} | 세로합 {sum(got):,.1f} | 표기 {want:,.1f} "
                          f"| 합계행 「{trow[0][:26]}」")
    print(f"세로합 불일치 {bad}건")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
