# -*- coding: utf-8 -*-
"""보고서 HTML → 대시보드용 표·캡션·콜아웃 JSON.

장(part) 단위로 묶고 표는 헤더·행을 그대로 옮긴다. 재계산하지 않는다.
"""
import re, json, html, io, sys

# 입력은 발행본 HTML. 경로는 인자로 받는다 — 스크래치패드 경로를 박아 두면 재현이 안 된다.
SRC = sys.argv[1] if len(sys.argv) > 1 else 'tuna-farming.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'lib/data/tunafarm-tables.json'
s = io.open(SRC, encoding='utf-8').read()
body = s[s.find('<main'):]

def txt(x):
    x = re.sub(r'<br\s*/?>', ' / ', x)
    x = re.sub(r'<[^>]+>', '', x)
    return ' '.join(html.unescape(x).split())

# 장 경계
parts = [(m.start(), txt(m.group(1))) for m in re.finditer(r'<p class="part">(.*?)</p>', body)]
def part_of(pos):
    cur = '0'
    for p, name in parts:
        if p <= pos: cur = name
        else: break
    return cur

out = {}
# 표
for m in re.finditer(r'<div class="tw"><table>(.*?)</table></div>\s*(?:<p class="cap">(.*?)</p>)?', body, re.S):
    blk, cap = m.group(1), m.group(2) or ''
    head = re.search(r'<thead>(.*?)</thead>', blk, re.S)
    cols = [txt(c) for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', head.group(1), re.S)] if head else []
    rows = []
    tb = re.search(r'<tbody>(.*?)</tbody>', blk, re.S)
    for tr in re.findall(r'<tr([^>]*)>(.*?)</tr>', tb.group(1) if tb else blk, re.S):
        attr, cells = tr
        vals = [txt(c) for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', cells, re.S)]
        if not vals: continue
        rows.append({'cells': vals, 'emph': 'sum' in attr})
    if not rows: continue
    # 표 제목 — 가장 가까운 앞선 h3, 없으면 h2
    pre = body[:m.start()]
    h3 = re.findall(r'<h3>(.*?)</h3>', pre)
    h2 = re.findall(r'<h2>(.*?)</h2>', pre)
    title = txt(h3[-1]) if h3 else (txt(h2[-1]) if h2 else '표')
    key = part_of(m.start())
    out.setdefault(key, {'tables': [], 'callouts': []})
    out[key]['tables'].append({'title': title, 'cols': cols, 'rows': rows, 'caption': txt(cap)})

# 콜아웃
for m in re.finditer(r'<div class="call([^"]*)"><span class="h">(.*?)</span><p>(.*?)</p></div>', body, re.S):
    kind = 'warn' if 'warn' in m.group(1) else ('good' if 'good' in m.group(1) else 'note')
    key = part_of(m.start())
    out.setdefault(key, {'tables': [], 'callouts': []})
    out[key]['callouts'].append({'kind': kind, 'head': txt(m.group(2)), 'body': txt(m.group(3))})

io.open(OUT, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
print('장별 표·콜아웃')
tt = ct = 0
for k, v in out.items():
    tt += len(v['tables']); ct += len(v['callouts'])
    print(f"  {k:12s} 표 {len(v['tables']):2d} · 콜아웃 {len(v['callouts']):2d}")
print(f"합계 표 {tt} · 콜아웃 {ct}")
