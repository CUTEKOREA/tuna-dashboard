#!/usr/bin/env python3
"""위젯 리니지 산출 (P3-8, V3 스펙 §4-8) — Closure 자동화.

대시보드 진입점(app/page.tsx)에서 import 그래프를 BFS로 걷어
  대시보드/위젯(.tsx) → lib/data 모듈 → 데이터 파일(public/data·lib 내 JSON)
의존 사슬을 산출한다. 산출물:
  docs/lineage/widget-lineage.json  (기계용 — 정/역방향 인덱스)
  docs/lineage/widget-lineage.md    (사람용 — 데이터 파일별 영향 위젯)

파손 진단(«이 JSON 필드를 바꾸면 어느 위젯이 깨지나»의 1단계 = 어느 위젯이 보나):
  python3 scripts/widget_lineage.py --impact public/data/tuna_daily_briefing.json
"""
from __future__ import annotations

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRY = 'app/page.tsx'
OUT_DIR = os.path.join(ROOT, 'docs', 'lineage')

IMPORT_RE = re.compile(r"""(?:from\s+|import\s*\(\s*|require\(\s*)['"]([^'"]+)['"]""")
# lib/data 모듈이 파일시스템으로 읽는 JSON (fs.readFile/readFileSync + path 조합은 리터럴만 추적)
FS_JSON_RE = re.compile(r"""['"]([^'"]*?\.json)['"]""")


def resolve(spec: str, cur_dir: str) -> str | None:
    if spec.startswith('@/'):
        base = os.path.join(ROOT, spec[2:])
    elif spec.startswith('.'):
        base = os.path.normpath(os.path.join(cur_dir, spec))
    else:
        return None
    for ext in ('', '.tsx', '.ts', '.json', '/index.tsx', '/index.ts'):
        p = base + ext
        if os.path.isfile(p):
            return p
    return None


def rel(p: str) -> str:
    return os.path.relpath(p, ROOT)


def build_graph() -> dict[str, list[str]]:
    """파일 → 직접 의존 목록 (ts/tsx/json)."""
    graph: dict[str, list[str]] = {}
    queue = [os.path.join(ROOT, ENTRY)]
    while queue:
        f = queue.pop()
        rf = rel(f)
        if rf in graph:
            continue
        deps: list[str] = []
        if f.endswith(('.ts', '.tsx')):
            try:
                src = open(f, encoding='utf-8').read()
            except OSError:
                graph[rf] = []
                continue
            for spec in IMPORT_RE.findall(src):
                r = resolve(spec, os.path.dirname(f))
                if r:
                    deps.append(rel(r))
            # fs 경유 JSON — lib/data 모듈의 public/data 리터럴 참조
            for j in FS_JSON_RE.findall(src):
                cand = None
                if j.startswith('public/') or j.startswith('data/'):
                    cand = os.path.join(ROOT, j)
                elif '/' not in j and 'data' in rf:
                    cand = os.path.join(os.path.dirname(f), j)
                if cand and os.path.isfile(cand):
                    deps.append(rel(cand))
        graph[rf] = sorted(set(deps))
        for d in graph[rf]:
            if d not in graph and d.endswith(('.ts', '.tsx')):
                queue.append(os.path.join(ROOT, d))
    return graph


def is_widget(path: str) -> bool:
    return path.startswith('components/') and path.endswith('.tsx')


def is_data_module(path: str) -> bool:
    return path.startswith('lib/data/')


def is_data_file(path: str) -> bool:
    return path.endswith('.json')


def transitive_data(graph: dict[str, list[str]], start: str, memo: dict[str, set[str]]) -> set[str]:
    if start in memo:
        return memo[start]
    memo[start] = set()  # 순환 방어
    acc: set[str] = set()
    for dep in graph.get(start, []):
        if is_data_file(dep):
            acc.add(dep)
        else:
            acc |= transitive_data(graph, dep, memo)
    memo[start] = acc
    return acc


def main() -> int:
    graph = build_graph()
    memo: dict[str, set[str]] = {}

    widgets = sorted(p for p in graph if is_widget(p))
    forward = {
        w: {
            'dataModules': sorted(d for d in graph.get(w, []) if is_data_module(d)),
            'dataFiles': sorted(transitive_data(graph, w, memo)),
        }
        for w in widgets
    }
    reverse: dict[str, list[str]] = {}
    for w, info in forward.items():
        for f in info['dataFiles']:
            reverse.setdefault(f, []).append(w)
    reverse = {k: sorted(v) for k, v in sorted(reverse.items())}

    if '--impact' in sys.argv:
        target = sys.argv[sys.argv.index('--impact') + 1]
        hits = reverse.get(target, [])
        print(f"{target} → 영향 위젯 {len(hits)}개")
        for h in hits:
            print(f"  {h}")
        return 0

    os.makedirs(OUT_DIR, exist_ok=True)
    payload = {
        '_meta': {
            'entry': ENTRY,
            'files': len(graph),
            'widgets': len(widgets),
            'dataFiles': len(reverse),
            'generator': 'scripts/widget_lineage.py',
        },
        'widgetToData': forward,
        'dataToWidgets': reverse,
    }
    with open(os.path.join(OUT_DIR, 'widget-lineage.json'), 'w', encoding='utf-8') as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=1)

    lines = [
        '# 위젯 리니지 — 데이터 파일별 영향 범위',
        '',
        '> `python3 scripts/widget_lineage.py`로 재생성. 손으로 고치지 말 것.',
        f'> 진입점 {ENTRY} · closure {len(graph)}파일 · 위젯 {len(widgets)}개 · 데이터 파일 {len(reverse)}개.',
        '> 데이터 파일 필드를 바꾸기 전에 여기서 영향 위젯을 확인한다 (파손 진단 1단계).',
        '',
    ]
    for f, ws in reverse.items():
        lines.append(f'## {f}')
        lines.extend(f'- {w}' for w in ws)
        lines.append('')
    with open(os.path.join(OUT_DIR, 'widget-lineage.md'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines))

    print(f"closure {len(graph)} files · widgets {len(widgets)} · data files {len(reverse)}")
    print(f"→ {rel(os.path.join(OUT_DIR, 'widget-lineage.json'))}, widget-lineage.md")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
