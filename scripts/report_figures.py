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
    html: str = ''          # 원문 마크업 조각 (html) — 지표 타일·막대·도판 격자. 이미지는 URL 로 바꿔 둔다
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


def parse(html: str, key: str, out_dir: Path, url_base: str, rich: bool = False) -> FigureSet:
    """본문 figure 와 표지 팩샷을 뽑는다. 이미지는 out_dir 에 쓰고 URL 을 담는다.

    `rich` 는 품목 해부보고서용이다 — 아래 `_parse_rich` 를 본다. 회사 편은 이 경로를 타지 않는다.
    """
    if rich:
        return _parse_rich(html, out_dir, url_base)
    fs = FigureSet()
    seen: dict[str, str] = {}

    def emit(sid: str, kind: str, caption: str, alt: str, blob: bytes | None, svg: str,
             ord_: int = 0) -> None:
        f = Figure(sid=sid, kind=kind, caption=caption, alt=alt, svg=svg, ord=ord_,
                   css=_chart_css(html, svg) if svg else '')
        if blob is not None:
            digest = hashlib.sha1(blob).hexdigest()[:12]
            if digest not in seen:                      # 같은 그림이 두 번 실려도 파일은 하나다
                out_dir.mkdir(parents=True, exist_ok=True)
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


# ── 품목 해부보고서(rich) ──────────────────────────────────────────────
# 품목 보고서의 그림은 회사 편과 틀이 다르다. 지표 타일(div.metrics)·막대(div.bars)는
# figure 밖에 있고, figure 하나에 SVG 다섯 장(어법 모식도)이나 사진 일곱 장과 학명·저작권
# 표기(종 도판)가 함께 들어 있다. 회사 편 규칙(figure 당 첫 SVG 하나, img 는 팩샷 격자)으로
# 읽으면 SVG 넷과 학명·저작권이 사라진다. 그래서 원문 마크업 조각을 통째로 싣고(kind=html),
# 그 조각이 쓰는 클래스 규칙만 함께 뽑는다. 회사 편 JSON 을 바꾸지 않도록 이 경로는 따로 둔다.

_RICH_SECTION = re.compile(r'<section id="(s[0-9a-z]+)"[^>]*>(.*?)</section>', re.S)
_DIV_OPEN = re.compile(r'<div\b[^>]*\bclass="(metrics|bars)"[^>]*>')
_DIV_TOKEN = re.compile(r'<div\b|</div>')
_IMG_DATA = re.compile(r'src="data:image/[a-z+]+;base64,([^"]+)"')


def _balanced_div(s: str, start: int) -> int:
    """start 의 <div 와 짝인 </div> 의 끝 위치."""
    depth = 0
    for m in _DIV_TOKEN.finditer(s, start):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0:
            return m.end()
    raise ValueError('닫히지 않은 div')


def _strip_media(css: str) -> str:
    """@media 블록을 지운다. 인쇄·가로 화면 전용 규칙이 화면에 새지 않게."""
    out, i = [], 0
    while True:
        j = css.find('@media', i)
        if j < 0:
            return ''.join(out) + css[i:]
        out.append(css[i:j])
        k = css.index('{', j)
        depth = 0
        for pos in range(k, len(css)):
            if css[pos] == '{':
                depth += 1
            elif css[pos] == '}':
                depth -= 1
                if depth == 0:
                    i = pos + 1
                    break


def _html_css(doc: str, frag: str) -> str:
    """조각이 쓰는 클래스 규칙과 색·글꼴 변수.

    `_chart_css` 와 달리 **선택자의 클래스가 전부 조각에 있을 때만** 싣는다. 품목 보고서는
    `.k`·`.v`·`.n` 같은 짧은 클래스를 표지(.cf .k)와 목차(.toc .n)에도 쓰므로 부분 일치로
    고르면 표지 규칙이 섞인다. 쉼표 선택자는 하나씩 나눠 RepChart 의 범위 지정이 전부에 걸리게 한다.
    """
    classes = {c for g in re.findall(r'class="([^"]+)"', frag) for c in g.split()}
    sheet = _strip_media(re.sub(r'/\*.*?\*/', '', "\n".join(_STYLE.findall(doc)), flags=re.S))
    rules, used = [], set(_VAR.findall(frag))
    for sel, body in _RULE.findall(sheet):
        for part in sel.split(','):
            part = re.sub(r'^figure\s+', '', part.strip())
            if not part.startswith('.'):
                continue
            if set(re.findall(r'\.([A-Za-z0-9_-]+)', part)) <= classes:
                b = re.sub(r'\s+', ' ', body.strip())
                rules.append(f"{part}{{{b}}}")
                used |= set(_VAR.findall(body))
    decls = {}
    for sel, body in _RULE.findall(sheet):
        if ':root' in sel:
            for name, val in re.findall(r'(--[a-z0-9-]+)\s*:\s*([^;]+)', body):
                decls.setdefault(name, val.strip())
    used.add('--ink')                                   # 판의 글자색. 다크 모드 본문색이 흰 판에 얹히지 않게
    scope = [f"{v}:{decls[v]}" for v in sorted(used) if v in decls]
    if '--ink' in decls:
        scope.append('color:var(--ink)')
    return ":scope{" + ";".join(scope) + "}" + "".join(rules)


def _parse_rich(doc: str, out_dir: Path, url_base: str) -> FigureSet:
    fs = FigureSet()
    seen: dict[str, str] = {}

    def externalize(frag: str) -> str:
        def sub(m: re.Match) -> str:
            blob = base64.b64decode(m.group(1))
            digest = hashlib.sha1(blob).hexdigest()[:12]
            if digest not in seen:
                out_dir.mkdir(parents=True, exist_ok=True)
                (out_dir / f"{digest}.jpg").write_bytes(_shrink(blob))
                seen[digest] = f"{url_base}/{digest}.jpg"
            return f'src="{seen[digest]}" loading="lazy"'
        return _IMG_DATA.sub(sub, frag)

    for sm in _RICH_SECTION.finditer(doc):
        sid, sec = sm.group(1), sm.group(2)
        found: list[tuple[int, Figure]] = []
        spans: list[tuple[int, int]] = []
        for fm in _FIGURE.finditer(sec):
            inner = fm.group(2)
            cap = _CAP.search(inner)
            capt = _text(cap.group(1)) if cap else ''
            frag = re.sub(r'<!--.*?-->', '', _CAP.sub('', inner), flags=re.S).strip()
            frag = externalize(frag)
            found.append((fm.start(), Figure(sid=sid, kind='html', caption=capt, alt=capt,
                                             html=frag, css=_html_css(doc, frag), ord=fm.start())))
            spans.append((fm.start(), fm.end()))
        for dm in _DIV_OPEN.finditer(sec):
            if any(a <= dm.start() < b for a, b in spans):
                continue
            end = _balanced_div(sec, dm.start())
            frag = externalize(sec[dm.start():end])
            # 타일은 항목 이름(.k), 막대는 막대 이름(.nm)을 설명으로 쓴다. 원문에 캡션이 없다.
            label = 'k' if dm.group(1) == 'metrics' else 'nm'
            names = [_text(x) for x in re.findall(rf'class="{label}"[^>]*>(.*?)</', frag, re.S)]
            found.append((dm.start(), Figure(sid=sid, kind='html', caption='', alt=' · '.join(names),
                                             html=frag, css=_html_css(doc, frag), ord=dm.start())))
        fs.figures.extend(f for _, f in sorted(found, key=lambda x: x[0]))
    return fs
