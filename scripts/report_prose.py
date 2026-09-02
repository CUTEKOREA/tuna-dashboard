#!/usr/bin/env python3
"""조사보고서 HTML 에서 절별 서술(문단·콜아웃)을 그대로 뽑아 온다.

**왜 만드나.** 대시보드의 회사 서술은 지금까지 `lib/company-*-content.ts` 에 손으로 썼다.
일곱 편을 재어 보니 손으로 쓴 분량이 보고서 본문의 **18%**였다(49,365 / 269,034자).
나머지 82%는 보고서에만 있고 화면에 없었으며, 보고서를 고칠 때마다 같은 일을 두 번 했다.

그래서 `report_tables.py` 가 표에 쓰는 원칙을 서술에도 적용한다 — **사람은 절→단계 매핑만
정하고 내용은 원문에서 그대로 읽는다.** 옮겨 적지 않으면 틀릴 자리가 없다.

표는 `report_tables.py` 가 따로 뽑으므로 여기서는 제외한다. 두 경로가 같은 표를 두 번
싣지 않게 하려는 것이다.
"""
from __future__ import annotations

import html as H
import re
from dataclasses import dataclass, field

# 등급 칩은 문장 끝에 「원본」「매체」 같은 낱말로 남아 종결어미와 붙어 읽힌다.
# 텍스트로 풀지 않고 근거 표시로 따로 담는다.
_CHIP = re.compile(r'<span class="chip[^"]*"[^>]*>(.*?)</span>', re.S)
_TAG = re.compile(r"<[^>]+>")


def _text(raw: str) -> tuple[str, list[str]]:
    """태그를 걷고 (본문, 근거칩 목록) 을 돌려준다."""
    chips = [H.unescape(_TAG.sub("", c)).strip() for c in _CHIP.findall(raw)]
    s = _CHIP.sub(" ", raw)
    s = re.sub(r"<br\s*/?>", " ", s, flags=re.I)
    s = _TAG.sub("", s)
    return " ".join(H.unescape(s).split()), [c for c in chips if c]


@dataclass
class Block:
    """서술 한 덩어리. kind 가 화면 렌더를 가른다."""

    kind: str          # lead | para | call | h3
    text: str = ""
    chips: list[str] = field(default_factory=list)
    title: str = ""    # call 의 제목, h3 의 소제목
    tone: str = ""     # call 의 warn | hot

    def as_json(self) -> dict:
        d = {"kind": self.kind, "text": self.text}
        if self.chips:
            d["chips"] = self.chips
        if self.title:
            d["title"] = self.title
        if self.tone:
            d["tone"] = self.tone
        return d


@dataclass
class Section:
    sid: str
    numeral: str
    label: str
    subtitle: str
    blocks: list[Block] = field(default_factory=list)

    def as_json(self) -> dict:
        return {
            "sid": self.sid,
            "numeral": self.numeral,
            "label": self.label,
            "subtitle": self.subtitle,
            "blocks": [b.as_json() for b in self.blocks],
        }


def parse(doc: str) -> list[Section]:
    out: list[Section] = []
    for m in re.finditer(r'<section id="(s[0-9a-z]+)">(.*?)</section>', doc, re.S):
        sid, body = m.groups()
        h2 = re.search(r"<h2[^>]*>(.*?)</h2>", body, re.S)
        numeral = label = subtitle = ""
        if h2:
            inner = h2.group(1)
            n = re.search(r'<span class="h2n">(.*?)</span>', inner, re.S)
            if n:
                head, _ = _text(n.group(1))
                parts = [p.strip() for p in head.split("/", 1)]
                numeral = parts[0]
                label = parts[1] if len(parts) > 1 else ""
                subtitle, _ = _text(inner[n.end():])
            else:
                subtitle, _ = _text(inner)
        sec = Section(sid=sid, numeral=numeral, label=label, subtitle=subtitle)

        # 표는 report_tables 가 담당한다. 여기서 지워 두 경로가 겹치지 않게 한다.
        rest = body[h2.end():] if h2 else body
        rest = re.sub(r'<div class="tw">.*?</div>\s*</div>|<table.*?</table>', "", rest, flags=re.S)

        for el in re.finditer(
            r'<div class="call([^"]*)"[^>]*>(.*?)</div>'
            r'|<h3[^>]*>(.*?)</h3>'
            r'|<p(?![^>]*class="ct")([^>]*)>(.*?)</p>',
            rest, re.S,
        ):
            if el.group(2) is not None:                      # 콜아웃
                tone = ""
                for t in ("warn", "hot"):
                    if t in (el.group(1) or ""):
                        tone = t
                ct = re.search(r'<p class="ct">(.*?)</p>', el.group(2), re.S)
                title, _ = _text(ct.group(1)) if ct else ("", [])
                inner = el.group(2)[ct.end():] if ct else el.group(2)
                # 콜아웃은 문단 여럿을 담는다. 첫 문단만 담으면 나머지가 통째로 사라진다.
                paras = re.findall(r"<p[^>]*>(.*?)</p>", inner, re.S) or [inner]
                for i, raw in enumerate(paras):
                    txt, chips = _text(raw)
                    if txt:
                        sec.blocks.append(
                            Block("call", txt, chips, title if i == 0 else "", tone)
                        )
            elif el.group(3) is not None:                    # 소제목
                txt, _ = _text(el.group(3))
                if txt:
                    sec.blocks.append(Block("h3", title=txt))
            else:                                            # 문단
                attrs, raw = el.group(4) or "", el.group(5)
                txt, chips = _text(raw)
                if not txt:
                    continue
                kind = "lead" if "lead" in attrs else "para"
                sec.blocks.append(Block(kind, txt, chips))
        out.append(sec)
    return out
