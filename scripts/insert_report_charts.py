#!/usr/bin/env python3
"""생성한 차트를 여덟 편의 발행본 HTML 에 심는다.

⚠ 조각 파일(`/tmp/<회사>/report/bN.html`)은 남아 있지 않다. 발행본이 정본이므로
여기서 직접 고치고, 끝나면 Drive 사본까지 같이 맞춘다(A0 에서 배운 것 — 두 벌이
갈라지면 라이브가 틀린 사실을 내보낸다).

넣는 자리는 **그 절의 첫 표 바로 앞**이다. 무엇을 파는·잡는 회사인지가 숫자보다
먼저 들어와야 한다. 표가 없으면 절 끝에 붙인다.
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from make_report_chart import CSS  # noqa: E402
from report_charts_spec import SPEC, build  # noqa: E402

EV = Path(__file__).resolve().parents[1] / "docs/evidence"
DIRS = {
    "jais": "company-jais-2026-08", "itochu": "company-itochu-2026-08",
    "bolton": "company-bolton-2026-08", "thaiunion": "company-thaiunion-2026-08",
    "frinsa": "company-frinsa-2026-08", "albacora": "company-albacora-2026-08",
    "frabelle": "company-frabelle-2026-09", "fcf": "company-fcf-2026-08",
}
DRIVE = Path.home() / ("Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/"
                       "01_수산물(Seafood)/tuna/00_참치_관련자료/02_참치_가공·유통·기업")

# `figure.chart` 로 스코프한다. bolton·frabelle 은 `figcaption{display:none}` 이라
# 스코프 없이 넣으면 캡션이 통째로 사라진다.
BLOCK = ("\n/* 차트 — 인라인 SVG. 색은 그림마다 style 로 실려 온다 */\n"
         "figure.chart{margin:0 0 1.6rem;border:1px solid var(--rule);background:var(--card);break-inside:avoid}\n"
         "figure.chart .fi{background:var(--paper-2);padding:1.05rem .8rem;display:block}\n"
         "figure.chart svg{width:100%;height:auto;display:block}\n"
         "figure.chart figcaption{display:block;margin:0;max-width:none;font-size:.78rem;line-height:1.62;"
         "color:var(--ink-2);padding:.62rem .85rem;border-top:1px solid var(--rule)}\n"
         "figure.chart figcaption b{color:var(--ink)}\n"
         + CSS.replace("}.rc", "}\n.rc") + "\n")


def find_drive(key: str) -> Path | None:
    """Drive 파일명은 NFD 다 — `-name '*보고서.html'` 로는 안 걸린다."""
    want = DIRS[key]
    company = {"jais": "JAIS", "itochu": "ITOCHU", "bolton": "Bolton", "thaiunion": "Thai Union",
               "frinsa": "Frinsa", "albacora": "Albacora", "frabelle": "Frabelle", "fcf": "FCF"}[key]
    hits = []
    for root, _dirs, files in DRIVE.walk():
        for f in files:
            n = unicodedata.normalize("NFC", f)
            if n.endswith("보고서.html") and company.lower().replace(" ", "") in n.lower().replace(" ", ""):
                hits.append(root / f)
    return hits[0] if len(hits) == 1 else (hits[0] if hits else None)


def insert(html: str, sid: str, fig: str) -> str:
    m = re.search(rf'<section id="{sid}"[^>]*>', html)
    if not m:
        raise SystemExit(f"절 {sid} 없음")
    end = html.find("</section>", m.end())
    body = html[m.end():end]
    if 'class="chart"' in body:
        raise SystemExit(f"{sid} 에 이미 차트가 있다")
    # `.tw` 를 먼저 본다. 두 패턴을 한 정규식으로 묶으면 `<div class="tw">` 다음 줄의
    # `<table` 이 더 앞서 잡혀 **표 래퍼 안쪽에** 그림이 들어간다(Albacora 실측).
    t = re.search(r'\n?[ \t]*<div class="tw"', body) or re.search(r'\n?[ \t]*<table\b', body)
    at = t.start() if t else len(body.rstrip())
    body = body[:at] + "\n\n  " + fig + "\n" + body[at:]
    return html[:m.end()] + body + html[end:]


def main() -> None:
    for key in SPEC:
        p = EV / DIRS[key] / "보고서.html"
        html = p.read_text(encoding="utf-8")
        added = []
        for sid, fig in build(key):
            if f'<section id="{sid}"' in html and 'class="chart"' in html[
                    html.index(f'<section id="{sid}"'):html.index("</section>", html.index(f'<section id="{sid}"'))]:
                continue  # 이미 그 절에 차트가 있다
            html = insert(html, sid, fig)
            added.append(f"{sid}({len(fig)}B)")
        if not added:
            print(f"{key:10} 변경 없음"); continue
        if ".rc-b{" not in html:
            i = html.index("</style>")
            html = html[:i] + BLOCK + html[i:]
        p.write_text(html, encoding="utf-8")
        d = find_drive(key)
        note = "Drive 없음"
        if d:
            d.write_text(html, encoding="utf-8")
            note = f"Drive ✓ {d.name}"
        print(f"{key:10} {' '.join(added):22} {note}")


if __name__ == "__main__":
    main()
