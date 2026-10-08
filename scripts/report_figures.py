#!/usr/bin/env python3
"""조사보고서 HTML → 그림(팩샷·차트) 추출.

`report_tables.py`·`report_prose.py` 의 셋째 짝이다. 표는 저쪽이, 문단은 저쪽이,
**그림은 여기가** 맡는다.

**이미지는 JSON 에 담지 않는다.** 아홉 편의 팩샷이 합쳐 6 MB 인데 base64 로 넣으면
4/3 로 부풀어 클라이언트 번들에 8 MB 가 붙는다. `public/` 아래 정적 파일로 빼고
URL 만 넘긴다 — 그 바이트는 번들을 타지 않고 브라우저가 필요할 때 따로 받는다.

인라인 SVG(차트)는 예외다. 합쳐 10 KB 도 안 되고 색을 CSS 토큰에서 받아야 하므로
문자열 그대로 JSON 에 담는다. 래스터로 바꾸면 인쇄에서 뭉개지고 다크 모드에서
흰 사각형이 남는다.
"""
from __future__ import annotations

import base64
import hashlib
import io
import re
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image

MAX_EDGE = 900
MAX_BYTES = 120_000

_FIGURE = re.compile(r'<figure([^>]*)>(.*?)</figure>', re.S)
_COVER_SHOTS = re.compile(r'<div[^>]*class="[^"]*cover-shots[^"]*"[^>]*>(.*?)</div>', re.S)
# JAIS 는 팩샷이 없고 표지에 명부 캡처 한 장이 있다. 그 보고서에서 가장 무거운 증거라 살린다.
_COVER_DOC = re.compile(r'<div[^>]*class="[^"]*cover-doc[^"]*"[^>]*>(.*?)</div>', re.S)
_IMG = re.compile(r'<img[^>]*>')
_SRC = re.compile(r'src="data:image/([a-z+]+);base64,([^"]+)"')
_ALT = re.compile(r'alt="([^"]*)"')
_CAP = re.compile(r'<figcaption[^>]*>(.*?)</figcaption>', re.S)
_SVG = re.compile(r'<svg[\s\S]*?</svg>')
_SECTION = re.compile(r'<section id="(s\d+[a-z]?)">(.*?)</section>', re.S)
_STYLE = re.compile(r'<style[^>]*>(.*?)</style>', re.S)
_RULE = re.compile(r'([^{}@]+)\{([^{}]*)\}')
_VAR = re.compile(r'var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)')
_TAG = re.compile(r'<[^>]+>')


# 인라인 강조는 **공백 없이** 지운다. 태그마다 공백을 넣으면
# 「<b>€3.2 Billion 이상</b>」 이 「 €3.2 Billion 이상 」 으로 벌어진다.
_INLINE = re.compile(r'</?(?:b|strong|em|i|u|span|code|sub|sup|a|small)\b[^>]*>', re.I)


def _text(html: str) -> str:
    t = _TAG.sub(' ', _INLINE.sub('', html))
    for a, b in (('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'), ('&nbsp;', ' '), ('&quot;', '"')):
        t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip()


@dataclass
class Figure:
    sid: str
    kind: str               # 'shot' | 'chart' | 'doc'
    caption: str
    alt: str = ''
    src: str = ''           # 정적 파일 URL (shot·doc)
    svg: str = ''           # 인라인 SVG (chart)
    css: str = ''           # 그 SVG 가 쓰는 클래스 규칙 (스코프 적용 전)
    stage: str = ''
    bytes: int = 0
    ord: int = 0            # 절 본문 안의 문자 오프셋. 원문 순서로 되돌릴 때 쓴다.


@dataclass
class FigureSet:
    figures: list[Figure] = field(default_factory=list)


def _shrink(raw: bytes) -> bytes:
    im = Image.open(io.BytesIO(raw))
    # 팩샷은 투명 배경 PNG 가 많다. 흰 바탕에 얹지 않으면 다크 모드에서 검게 뭉친다.
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert('RGB')
    if max(im.size) > MAX_EDGE:
        r = MAX_EDGE / max(im.size)
        im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    for q in (86, 78, 70, 62, 54, 46):
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        if buf.tell() <= MAX_BYTES:
            return buf.getvalue()
    return buf.getvalue()


def _chart_css(html: str, svg: str) -> str:
    """그 SVG 가 쓰는 클래스 규칙과 색 변수를 보고서 스타일에서 뽑는다.

    차트 클래스는 **보고서 자체 style 에만** 있다. 그대로 옮기면 대시보드에서
    선이 안 보이고 글자가 기본 크기로 나온다 — FCF 차트가 실제로 그랬다.
    """
    classes = set(re.findall(r'class="([^"]+)"', svg))
    classes = {c for group in classes for c in group.split()}
    if not classes:
        return ''
    sheet = "\n".join(_STYLE.findall(html))
    rules, used_vars = [], set(_VAR.findall(svg))
    for sel, body in _RULE.findall(sheet):
        sel = sel.strip()
        if not sel.startswith('.'):
            continue
        if any(f'.{c}' in sel for c in classes):
            rules.append(f"{sel}{{{body.strip()}}}")
            used_vars |= set(_VAR.findall(body))
    # 규칙이 참조하는 변수를 보고서 :root 에서 찾아 함께 싣는다.
    decls = {}
    for sel, body in _RULE.findall(sheet):
        if ':root' not in sel:
            continue
        for name, val in re.findall(r'(--[a-z0-9-]+)\s*:\s*([^;]+)', body):
            decls.setdefault(name, val.strip())
    resolved = [f"{v}:{decls[v]}" for v in sorted(used_vars) if v in decls]
    if resolved:
        rules.insert(0, ":scope{" + ";".join(resolved) + "}")
    return "".join(rules)


def parse(html: str, key: str, out_dir: Path, url_base: str) -> FigureSet:
    """본문 figure 와 표지 팩샷을 뽑는다. 이미지는 out_dir 에 쓰고 URL 을 담는다."""
    fs = FigureSet()
    out_dir.mkdir(parents=True, exist_ok=True)
    seen: dict[str, str] = {}

    def emit(sid: str, kind: str, caption: str, alt: str, blob: bytes | None, svg: str,
             ord_: int = 0) -> None:
        f = Figure(sid=sid, kind=kind, caption=caption, alt=alt, svg=svg, ord=ord_,
                   css=_chart_css(html, svg) if svg else '')
        if blob is not None:
            digest = hashlib.sha1(blob).hexdigest()[:12]
            if digest not in seen:                      # 같은 그림이 두 번 실려도 파일은 하나다
                small = _shrink(blob)
                (out_dir / f"{digest}.jpg").write_bytes(small)
                seen[digest] = f"{url_base}/{digest}.jpg"
                f.bytes = len(small)
            f.src = seen[digest]
        fs.figures.append(f)

    body_at = html.index('<main>') if '<main>' in html else 0
    cover, body = html[:body_at], html[body_at:]

    # ── 표지 팩샷. Bolton·ITOCHU·JAIS 는 그림이 여기에만 있다 ──
    m = _COVER_SHOTS.search(cover)
    if m:
        cap = re.search(r'class="cover-shots-cap"[^>]*>(.*?)</p>', cover, re.S)
        capt = _text(cap.group(1)) if cap else ''
        for tag in _IMG.findall(m.group(1)):
            s = _SRC.search(tag)
            if not s:
                continue
            alt = (_ALT.search(tag).group(1) if _ALT.search(tag) else '')
            emit('cover', 'shot', capt, alt, base64.b64decode(s.group(2)), '')

    # ── 표지 문서 캡처. 팩샷이 아니라 증거 이미지다 ──
    md = _COVER_DOC.search(cover)
    if md:
        cp = re.search(r'<p[^>]*>(.*?)</p>', md.group(1), re.S)
        capt = _text(cp.group(1)) if cp else ''
        for tag in _IMG.findall(md.group(1)):
            s2 = _SRC.search(tag)
            if not s2:
                continue
            alt = (_ALT.search(tag).group(1) if _ALT.search(tag) else '')
            emit('cover', 'doc', capt, alt, base64.b64decode(s2.group(2)), '')

    # ── 본문 figure ──
    for sm in _SECTION.finditer(body):
        sid, sec = sm.group(1), sm.group(2)
        for fm in _FIGURE.finditer(sec):
            inner = fm.group(2)
            at = fm.start()                 # 절 본문 안에서 이 그림이 있던 자리
            cap = _CAP.search(inner)
            capt = _text(cap.group(1)) if cap else ''
            svg = _SVG.search(inner)
            if svg:
                emit(sid, 'chart', capt, '', None, svg.group(0), at)
                continue
            for tag in _IMG.findall(inner):
                s = _SRC.search(tag)
                if not s:
                    continue
                alt = (_ALT.search(tag).group(1) if _ALT.search(tag) else '')
                emit(sid, 'shot', capt, alt, base64.b64decode(s.group(2)), '', at)
    return fs
