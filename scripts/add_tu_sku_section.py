#!/usr/bin/env python3
"""Thai Union 보고서 04절에 SKU 전수 카탈로그를 붙인다.

04절은 브랜드마다 성격을 서술하고 개수만 적어 뒀다. Frinsa 보고서가 제품 하나하나를
규격·가격까지 실은 것과 대비되는데, 원자료는 같은 조사에서 이미 다 받아 뒀다.
여기서는 그 인테이크(`public/data/companies/thaiunion_skus_v1.json`)를 표로 조판해
절 끝에 붙인다 — 값은 인테이크에서 그대로 읽고 손으로 옮기지 않는다.

기존 서술은 건드리지 않는다. 앞은 「어떤 브랜드인가」이고 뒤는 근거다. 뒤집으면
절이 자료집이 되고 읽는 순서가 사라진다.
"""
from __future__ import annotations

import html as H
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INTAKE = ROOT / "public/data/companies/thaiunion_skus_v1.json"
MARK = 'id="sku-catalog"'

BRAND_NOTE = {
    "John West": "영국 국민 브랜드. 87개 가운데 참치가 48개다.",
    "Chicken of the Sea": "미국. 참치 22개에 게·연어·정어리가 붙는다.",
    "Petit Navire": "프랑스 1위. 참치 38개로 그룹에서 참치 비중이 가장 높다.",
    "Rügen Fisch": "독일. 참치가 없고 청어·고등어다. 학명까지 표기한다.",
    "Hawesta": "독일에서 참치를 맡은 쪽. 12개가 참치다.",
    "King Oscar": "노르웨이. 브리슬링 정어리가 중심이고 상품마다 GTIN 이 붙는다.",
    "Mareblu": "이탈리아. 전용 사이트가 403 이라 Open Food Facts 로 받았다.",
    "Parmentier": "Petit Navire 의 모태 공장. 정어리 전용 라인이다.",
    "Sealect": "태국 내수. 사이트가 구 사명에 멈춰 있어 같은 경로로 받았다.",
}


def esc(s) -> str:
    return H.escape(str(s or "—"))


def table(head, rows, num=()) -> str:
    th = "".join(
        f'<th{" class=\"num\"" if i in num else ""}>{esc(h)}</th>' for i, h in enumerate(head)
    )
    body = []
    for r in rows:
        tds = "".join(
            f'<td{" class=\"num\"" if i in num else ""}>{esc(c)}</td>' for i, c in enumerate(r)
        )
        body.append(f"<tr>{tds}</tr>")
    return (f'<div class="tw"><table><thead><tr>{th}</tr></thead>'
            f'<tbody>{"".join(body)}</tbody></table></div>')


def build(d) -> str:
    skus, brands, prices = d["skus"], d["brands"], d["prices"]
    total = len(skus)
    a = sum(1 for s in skus if s["등급"] == "A")
    filled = {k: sum(1 for s in skus if s[k] != "—") for k in ("어종", "규격", "인증")}

    # 어종 구성 — 학명 괄호를 떼고 한글명으로 묶는다
    mix: dict[str, int] = {}
    for s in skus:
        if s["어종"] == "—":
            continue
        for k in {re.sub(r"\s*\([^)]*\)", "", x).strip() for x in s["어종"].split("·")}:
            if k:
                mix[k] = mix.get(k, 0) + 1
    mix_rows = sorted(mix.items(), key=lambda kv: -kv[1])

    out = [f'<h3 {MARK}>SKU 전수: 아홉 브랜드 {total}개</h3>']
    out.append(
        f'<p>앞 절이 브랜드마다 어떤 성격인지 적었다면 여기는 그 근거다. 아홉 브랜드의 공개 제품 '
        f'{total}개를 규격·어종·인증까지 그대로 옮긴다. 여섯 곳은 회사가 내놓은 카탈로그이고'
        f'({a}개), 셋은 전용 사이트가 없거나 막혀 소비자 데이터베이스에서 받았다({total - a}개). '
        f'두 갈래를 섞지 않고 등급으로 가른다.</p>')
    out.append(
        f'<p>빈 칸은 채우지 않았다. 어종이 적힌 것이 {filled["어종"]}개, 규격 {filled["규격"]}개, '
        f'인증 {filled["인증"]}개이고 나머지는 출처에 없다. 「—」가 곧 그 뜻이다.</p>')

    out.append("<h4>브랜드별 SKU 수와 자료 등급</h4>")
    out.append(table(["브랜드", "국가", "SKU", "등급", "자료"],
                     [[b["브랜드"], b["국가"], b["수"], b["등급"], b["출처"]] for b in brands],
                     num=(2,)))

    out.append("<h4>어종 구성</h4>")
    out.append(table(["어종", "SKU"], mix_rows, num=(1,)))
    out.append('<p style="font-size:.86rem;color:var(--ink-3)">어종이 적힌 SKU 기준. '
               '한 제품이 어종을 둘 달면 양쪽에 센다.</p>')

    for b in brands:
        name = b["브랜드"]
        rows = [[s["제품명"], s["어종"], s["규격"], s["인증"]]
                for s in skus if s["브랜드"] == name]
        out.append(f'<h4>{esc(name)} — {b["수"]}개 <span class="chip">등급 {b["등급"]}</span></h4>')
        out.append(f'<p style="font-size:.86rem;color:var(--ink-3)">{esc(BRAND_NOTE[name])} '
                   f'출처: {esc(b["출처"])}</p>')
        out.append(table(["제품명", "어종", "규격", "인증"], rows))

    out.append(f"<h4>소매 실판매가 {len(prices)}건</h4>")
    out.append('<p style="font-size:.86rem;color:var(--ink-3)">전부 소매처와 기준일이 붙어 있다. '
               '영국은 Morrisons 만 서버사이드로 가격을 내보내 그쪽에서만 뚫렸다.</p>')
    out.append(table(["브랜드", "제품 · 규격", "가격", "소매처", "국가", "기준일"],
                     [[p["브랜드"], f'{p["제품명"]} · {p["규격"]}', p["가격"],
                       p["소매처"], p["국가"], p["기준일"]] for p in prices],
                     num=(2,)))
    return "\n".join(out)


def main() -> int:
    if len(sys.argv) != 2:
        print("사용: add_tu_sku_section.py <20_ThaiUnion_보고서.html>", file=sys.stderr)
        return 1
    path = Path(sys.argv[1])
    raw = path.read_text(encoding="utf8")
    d = json.loads(INTAKE.read_text(encoding="utf8"))
    block = build(d)

    m = re.search(r'<section id="s4">.*?(</section>)', raw, re.S)
    if not m:
        print("04절을 못 찾았다", file=sys.stderr)
        return 1
    if MARK in raw:
        # 이미 붙어 있으면 그 자리부터 절 끝까지를 새 블록으로 갈아 끼운다
        start = raw.index(f"<h3 {MARK}>")
        raw = raw[:start] + block + raw[m.start(1):]
        note = "교체"
    else:
        raw = raw[:m.start(1)] + block + raw[m.start(1):]
        note = "삽입"
    path.write_text(raw, encoding="utf8")
    print(f"{path.name}: SKU 절 {note} · {len(d['skus'])} SKU + 소매가 {len(d['prices'])}건 "
          f"· {len(block) // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
