#!/usr/bin/env python3
"""조종석 모드(cockpit density) 전면 제거 — 2026-08-20 사용자 지시.

2026-08-17 스펙 `cockpit-mode-design` 으로 들어왔던 전역 밀도 토글을 걷어낸다.
제거 대상은 네 갈래다.
  ① 사이드바 토글과 인테이크(`lib/cockpit-density.ts`)
  ② `ChartSlot.cockpitExtra` 와 대시보드 5곳의 슬롯 인자
  ③ 전용 위젯 `CockpitExtra.tsx` (`CockpitOnly` · `SeriesStats`)
  ④ `globals.css` 의 `[data-density='cockpit']` 토큰·`.cockpit-only`·`.cockpit-stats`

⚠ **보조 지표는 남기지 않고 지운다.** 「조종석 전용 보조 지표」로 만든 것이라,
  모드를 없애면서 항상 보이게 하면 모든 페이지의 밀도가 반대로 올라간다.
  사용자가 요청한 것은 제거다.

⚠ **파노피·코스모 복원 규칙도 함께 지운다.** 그 규칙은 조종석 모드에서만
  자기 반경을 되돌리려던 것이라, 모드가 없으면 지울 대상이다.

실행: python3 scripts/remove_cockpit_mode.py [--check]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DASHBOARDS = sorted((ROOT / 'components/market-understanding').glob('*Dashboard.tsx'))


def strip_cockpit_extra(text: str) -> tuple[str, int]:
    """`cockpitExtra: () => (...)`,  블록을 통째로 지운다.

    괄호 깊이를 세어 끝을 찾는다 — 정규식으로 `),` 를 찾으면 안쪽 JSX 의
    닫는 괄호에서 먼저 멈춘다.
    """
    out, removed, i = [], 0, 0
    while True:
        m = re.search(r'\n[ \t]*cockpitExtra:\s*\(\)\s*=>\s*', text[i:])
        if not m:
            out.append(text[i:])
            break
        start = i + m.start()
        out.append(text[i:start])
        j = i + m.end()
        # 값이 `(` 로 시작하는 JSX 이거나 `<...` 한 줄이다. 깊이를 센다.
        depth, in_str, quote = 0, False, ''
        while j < len(text):
            c = text[j]
            if in_str:
                if c == quote and text[j - 1] != '\\':
                    in_str = False
            elif c in '\'"`':
                in_str, quote = True, c
            elif c in '([{':
                depth += 1
            elif c in ')]}':
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            elif c == ',' and depth == 0:
                break
            j += 1
        # 뒤따르는 쉼표와 줄바꿈까지 삼킨다
        while j < len(text) and text[j] in ' \t':
            j += 1
        if j < len(text) and text[j] == ',':
            j += 1
        i = j
        removed += 1
    return ''.join(out), removed


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='쓰지 않고 남은 흔적만 센다')
    args = ap.parse_args()

    changes: list[str] = []

    # ── ② 대시보드의 슬롯 인자 + import ─────────────────────────────
    for f in DASHBOARDS:
        s = orig = f.read_text(encoding='utf-8')
        s, n = strip_cockpit_extra(s)
        s = re.sub(r"\nimport \{[^}]*\} from '\./CockpitExtra';", '', s)
        s = re.sub(r'\n[ \t]*//[^\n]*조종석[^\n]*', '', s)
        if s != orig:
            changes.append(f'{f.relative_to(ROOT)}: cockpitExtra {n}개 제거')
            if not args.check:
                f.write_text(s, encoding='utf-8')

    # ── ② 골격의 필드 선언과 호출 ────────────────────────────────────
    skel = ROOT / 'components/market-understanding/CommodityIndustryDashboard.tsx'
    s = orig = skel.read_text(encoding='utf-8')
    s = re.sub(r'\n[ \t]*/\*\*\n(?:[ \t]*\*[^\n]*\n)*?[ \t]*\*/\n[ \t]*cockpitExtra\?: \(\) => React\.ReactNode;', '', s)
    s = re.sub(r'\n[ \t]*\{slot\.cockpitExtra\?\.\(\)\}', '', s)
    if s != orig:
        changes.append(f'{skel.relative_to(ROOT)}: ChartSlot.cockpitExtra 제거')
        if not args.check:
            skel.write_text(s, encoding='utf-8')

    # ── ④ globals.css 블록 ──────────────────────────────────────────
    css = ROOT / 'app/globals.css'
    s = orig = css.read_text(encoding='utf-8')
    start = s.find("/* ══")
    while start != -1:
        end = s.find('*/', start)
        header = s[start:end]
        if '조종석 모드' in header:
            # 헤더부터 다음 최상위 주석 블록 직전까지가 조종석 구역이다.
            nxt = s.find('/* ─── PDF 내보내기', end)
            if nxt == -1:
                print('globals.css: 조종석 구역의 끝을 찾지 못했다', file=sys.stderr)
                return 1
            s = s[:start] + s[nxt:]
            changes.append('app/globals.css: 조종석 토큰·.cockpit-only·.cockpit-stats 제거')
            break
        start = s.find("/* ══", end)
    if s != orig and not args.check:
        css.write_text(s, encoding='utf-8')

    # ── ① 페이지 토글 ───────────────────────────────────────────────
    page = ROOT / 'app/page.tsx'
    s = orig = page.read_text(encoding='utf-8')
    s = s.replace("import { applyDensity, readStoredDensity } from '@/lib/cockpit-density';\n", '')
    s = re.sub(
        r'\n[ \t]*// 조종석 모드[^\n]*\n(?:[ \t]*//[^\n]*\n)*'
        r'[ \t]*const \[cockpitMode, setCockpitMode\][^\n]*\n'
        r'[ \t]*useEffect\(\(\) => \{\n[ \t]*applyDensity\(cockpitMode\);\n[ \t]*\}, \[cockpitMode\]\);\n',
        '\n', s)
    if s != orig:
        changes.append('app/page.tsx: 조종석 상태·인테이크 제거')
        if not args.check:
            page.write_text(s, encoding='utf-8')

    for line in changes:
        print(' -', line)
    if not changes:
        print('바꿀 것이 없다')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
