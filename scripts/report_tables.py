#!/usr/bin/env python3
"""조사보고서 HTML 에서 표를 그대로 뽑아 온다.

`build_company_*.py` 가 공유한다.

**왜 파싱하나.** 이 시리즈의 빌드 스크립트는 값을 손으로 옮기고 문자열로 대조해 왔다.
표 열 몇 개일 때는 그게 맞다 — 무엇을 화면에 낼지 고르는 판단이 사람 몫이기 때문이다.
그런데 일곱 편 180여 개 표를 통째로 옮기면 **옮겨 적기 자체가 최대 실패요인**이 된다.
그래서 「어느 표를 낼지」는 사람이 고르고 **표의 내용은 원문에서 그대로 읽는다.**
옮겨 적지 않으면 틀릴 자리가 없다.

대신 다른 것을 검사해야 한다 — 골라낸 표가 **정말 그 표인지**다. 헤더 서명과 행수를
빌드 스크립트가 못박고, 원문이 개정돼 표가 바뀌면 빌드가 죽는다.
"""
from __future__ import annotations

import html as H
import re
from dataclasses import dataclass, field


@dataclass
class Table:
    """보고서 표 하나. `num` 은 원문이 우측정렬로 표시한 열이다."""

    head: list[str]
    rows: list[list[str]] = field(default_factory=list)
    num: list[bool] = field(default_factory=list)
    section: str = ""
    caption: str = ""
    heading: str = ""
    note: str = ""
    sid: str = ""

    def title(self) -> str:
        """화면에 낼 제목. 표 바로 앞 소제목이 있으면 그것, 없으면 헤더 서명."""
        return self.heading or " · ".join(h for h in self.head[:3] if h)

    def as_json(self) -> dict:
        return {
            "title": self.title(),
            "head": self.head,
            "num": self._num_fit(),
            "rows": self.rows,
            "sid": self.sid,
            "section": self.section,
            **({"caption": self.caption} if self.caption else {}),
            **({"note": self.note} if self.note else {}),
        }



    # 숫자 열은 화면에서 줄바꿈을 막는다(자릿수를 맞추려는 것이다). 그런데 값에
    # 단위·기준·출처가 함께 들어간 긴 칸이 섞이면 그 열이 화면 밖으로 밀려 나간다.
    # 공장 상세표의 「규모」·「인력」이 그렇다. 긴 칸이 있는 열은 숫자 열에서 뺀다.
    _NUM_MAX = 28

    def _num_fit(self) -> list[bool]:
        out = list(self.num)
        for j, is_num in enumerate(out):
            if not is_num:
                continue
            longest = max((len(r[j]) for r in self.rows if j < len(r)), default=0)
            if longest > self._NUM_MAX:
                out[j] = False
        return out

# 등급 칩은 셀 안에서 「A」「B」 한 글자로 남아 숫자와 붙어 읽힌다. 텍스트로 풀지 않고 뗀다.
_CHIP = re.compile(r'<span class="chip[^"]*"[^>]*>.*?</span>', re.S)
_SUP = re.compile(r"<sup[^>]*>.*?</sup>", re.S)
_BR = re.compile(r"<br\s*/?>", re.I)


def _cell(raw: str) -> str:
    s = _CHIP.sub(" ", raw)
    s = _SUP.sub("", s)
    s = _BR.sub(" · ", s)
    s = re.sub(r"<[^>]+>", "", s)
    return " ".join(H.unescape(s).split())


def _span(attrs: str, name: str) -> int:
    m = re.search(rf'{name}=["\']?(\d+)', attrs)
    return int(m.group(1)) if m else 1


def _grid(trs: list[str], ncols: int) -> list[list[str]]:
    """rowspan·colspan 을 펴서 직사각형으로 만든다.

    안 펴면 병합된 칸 아래 행이 한 칸씩 밀려 열이 어긋난다. 보고서 178개 표 중 8개가
    그렇고, 그 8개가 하필 지배구조·선박·거점처럼 값이 중요한 표다.
    """
    out: list[list[str]] = []
    carry: dict[int, tuple[str, int]] = {}
    for tr in trs:
        row: list[str | None] = [None] * ncols
        for col, (txt, left) in list(carry.items()):
            if col < ncols:
                # 원문에서 세로로 병합된 칸이다. 값은 첫 행에만 있고 아래는 비어 보인다.
                # 여기서 값을 복제하면 같은 문장이 행마다 되풀이돼 표가 읽히지 않는다.
                # 다만 첫 열은 좁은 화면 목록에서 그 행의 제목으로 쓰이므로 남긴다.
                row[col] = txt if col == 0 else ""
            if left <= 1:
                del carry[col]
            else:
                carry[col] = (txt, left - 1)
        ci = 0
        for attrs, raw in re.findall(r"<t[dh]([^>]*)>(.*?)</t[dh]>", tr, re.S):
            while ci < ncols and row[ci] is not None:
                ci += 1
            if ci >= ncols:
                break
            txt = _cell(raw)
            cs, rs = _span(attrs, "colspan"), _span(attrs, "rowspan")
            for k in range(cs):
                if ci + k < ncols:
                    row[ci + k] = txt if k == 0 else ""
            if rs > 1:
                carry[ci] = (txt, rs - 1)
            ci += cs
        out.append([c if c is not None else "" for c in row])
    return out


def parse(doc: str) -> list[Table]:
    """문서의 모든 표를 절 단위 표시와 함께 뽑는다."""
    out: list[Table] = []
    for sec in re.finditer(r'<section id="(s[0-9a-z]+)">(.*?)</section>', doc, re.S):
        sid, body = sec.groups()
        h2 = re.search(r"<h2[^>]*>(.*?)</h2>", body, re.S)
        title = _cell(h2.group(1)) if h2 else ""
        for t in re.finditer(r"<table.*?</table>", body, re.S):
            block = t.group(0)
            # 표 바로 앞 소제목과 바로 뒤 설명 문단을 같이 가져온다.
            # 보고서가 이미 「이 표에서 무엇을 보라」를 써 뒀는데 다시 쓸 이유가 없다.
            before = body[:t.start()]
            h3s = re.findall(r"<h3[^>]*>(.*?)</h3>", before, re.S)
            heading = _cell(h3s[-1]) if h3s else ""
            after = body[t.end():t.end() + 1400]
            pm = re.search(r"<p[^>]*>(.*?)</p>", after, re.S)
            note = _cell(pm.group(1)) if pm else ""
            if len(note) > 220:
                cut = note.find(". ", 120)
                note = note[:cut + 1] if cut > 0 else note[:220].rsplit(" ", 1)[0] + "…"
            trs = re.findall(r"<tr[^>]*>(.*?)</tr>", block, re.S)
            if not trs:
                continue
            head_cells = re.findall(r"<th([^>]*)>(.*?)</th>", trs[0], re.S)
            if not head_cells:
                continue
            head, num = [], []
            for attrs, raw in head_cells:
                cs = _span(attrs, "colspan")
                isnum = "num" in re.findall(r'class=["\']([^"\']*)', attrs + " ")[0] if "class=" in attrs else False
                for k in range(cs):
                    head.append(_cell(raw) if k == 0 else "")
                    num.append(isnum)
            rows = [r for r in _grid(trs[1:], len(head)) if any(c for c in r)]
            cap = re.search(r"<caption[^>]*>(.*?)</caption>", block, re.S)
            out.append(Table(head=head, rows=rows, num=num, sid=sid, section=title,
                             heading=heading, note=note,
                             caption=_cell(cap.group(1)) if cap else ""))
    return out


class TableSet:
    """헤더 서명으로 표를 집어 오고, 집힌 것이 맞는 표인지 검사한다."""

    def __init__(self, doc: str):
        self.all = parse(doc)
        self.used: set[int] = set()

    def pick(self, *signature: str, rows: int | None = None) -> Table:
        """헤더가 `signature` 를 순서대로 포함하는 표를 집는다.

        같은 서명이 둘 이상이면 오류다 — 서명을 더 붙여 좁혀야 한다.
        `rows` 를 주면 행수까지 못박는다. 원문 개정으로 표가 바뀌면 여기서 죽는다.
        """
        hits = []
        for i, t in enumerate(self.all):
            joined = " | ".join(t.head)
            if all(s in joined for s in signature):
                hits.append((i, t))
        if not hits:
            raise LookupError(f"표를 못 찾았다: {signature}")
        if len(hits) > 1 and rows is not None:
            hits = [(i, t) for i, t in hits if len(t.rows) == rows] or hits
        if len(hits) > 1:
            found = " / ".join(" | ".join(t.head) for _, t in hits)
            raise LookupError(f"서명 {signature} 이 {len(hits)}개 표에 걸린다 — 좁혀라: {found}")
        i, t = hits[0]
        if rows is not None and len(t.rows) != rows:
            raise LookupError(f"{signature}: 행수가 {rows} 가 아니라 {len(t.rows)} 다")
        self.used.add(i)
        return t

    def coverage(self) -> tuple[int, int]:
        """(쓴 표, 전체 표). 보고서를 얼마나 옮겼는지 빌드 로그에 찍는다."""
        return len(self.used), len(self.all)
