#!/usr/bin/env python3
"""지표 SSOT 일괄 교체 검출기 (L-07, 2026-08-17 정책 확정: 진행률 초과 그대로 표시).

치환 자체는 패턴 변형이 많아 정규식 자동화가 오변환 위험 — 이 스크립트는
검출·분류 목록을 산출하고(작업 분할·검수 증빙), 교체는 목록 기반으로 수행한다.

  python3 scripts/fix_metric_ssot.py            # 잔존 검출 목록
  python3 scripts/fix_metric_ssot.py --count    # 요약 카운트 (가드용)
"""
from __future__ import annotations

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DIRS = ('app', 'components', 'lib', 'hooks')
SKIP = (
    'lib/metrics.ts',            # SSOT 자신
    '_archive/', 'data/', 'artifacts/', 'node_modules/',
    # 타 세션 진행 중 작업 (2026-08-17 kofa 탭) — 이번 라운드 불가침
    'components/PurseSeinerDashboard.tsx',
    'data/purseSeinerData.ts',
)

PCT_CHANGE = re.compile(r'\(\s*([A-Za-z_.\[\]\w]+)\s*-\s*([A-Za-z_.\[\]\w]+)\s*\)\s*/\s*\2\s*\)?\s*\*\s*100')
PCT_CHANGE2 = re.compile(r'\(\s*[A-Za-z_.\[\]\w]+\s*/\s*[A-Za-z_.\[\]\w]+\s*-\s*1\s*\)\s*\*\s*100')
PROGRESS = re.compile(r'actualTotal\s*/\s*[A-Za-z_.]*reportedTotal|reportedTotal\s*\)?\s*\*\s*100|/\s*reported\w*\s*\*\s*100')


def scan():
    hits = {'pctChange': [], 'progress': []}
    for base in TARGET_DIRS:
        for dirpath, _dirnames, filenames in os.walk(os.path.join(ROOT, base)):
            for fn in filenames:
                if not fn.endswith(('.ts', '.tsx')):
                    continue
                p = os.path.join(dirpath, fn)
                rp = os.path.relpath(p, ROOT)
                if any(sk in rp for sk in SKIP):
                    continue
                try:
                    lines = open(p, encoding='utf-8').read().splitlines()
                except OSError:
                    continue
                for i, line in enumerate(lines, 1):
                    if 'pctChange(' in line or 'progressPct(' in line:
                        continue  # 이미 SSOT 사용
                    if PCT_CHANGE.search(line) or PCT_CHANGE2.search(line):
                        hits['pctChange'].append((rp, i, line.strip()[:120]))
                    elif PROGRESS.search(line) and '* 100' in line:
                        hits['progress'].append((rp, i, line.strip()[:120]))
    return hits


def main() -> int:
    hits = scan()
    if '--count' in sys.argv:
        print(f"pctChange 잔존 {len(hits['pctChange'])} · progress 잔존 {len(hits['progress'])}")
        return 0
    for kind, rows in hits.items():
        print(f"== {kind} 잔존 {len(rows)}건")
        for rp, i, line in rows:
            print(f"  {rp}:{i}: {line}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
