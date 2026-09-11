#!/usr/bin/env python3
"""
차트 색 hex 리터럴 → --w-* 토큰 codemod (L-07 pattern). 2026-09-11 /pork 시범.

치환 표를 손으로 두지 않는다. app/globals.css 의 :root 에서 `--w-<name>: #rrggbb` 를 읽고,
**값이 정확히 같은** hex 리터럴만 `var(--w-<name>)` 로 바꾼다. 값이 다른 hex 는 보고만 한다.

⚠ 라이트 테마([data-v3='light'])가 다시 정의하는 토큰(pink·violet·emerald 등)은 **기본적으로 쓰지 않는다.**
  다크에선 값이 같아도 라이트에선 색이 바뀐다 — 2026-09-11 시범에서 돈가-옥수수 막대가 #ec4899 에서
  #ef8c8c(흰 배경 대비 2.39:1)로 바뀐 것을 픽셀 비교로 잡았다. 그래서 기본 모드는 두 테마 모두에서
  화면이 그대로다. 차트가 테마를 따르게 하려면 --follow-theme 을 명시한다(팔레트 결정이 선행돼야 한다).

바꾸는 곳: 따옴표 안에 hex 하나만 든 문자열 — stroke="#f43f5e", fill='#10b981', color: '#8b5cf6',
          accent = '#ec4899'. 긴 문자열 안의 hex(그라데이션·template literal)는 건드리지 않는다.
건너뛰는 파일: echarts·three 를 import 하는 파일(canvas 는 CSS 변수를 못 읽는다).

Usage:
  python3 scripts/fix_chart_tokens.py --dry-run components/PorkWidgets.tsx ...   # diff 만 출력
  python3 scripts/fix_chart_tokens.py components/PorkWidgets.tsx ...             # 적용
  python3 scripts/fix_chart_tokens.py --check components/Pork*.tsx               # 남은 치환 대상이 있으면 exit 1
  python3 scripts/fix_chart_tokens.py --follow-theme ...                         # 라이트 재정의 토큰까지 사용
  python3 scripts/fix_chart_tokens.py --selftest
파일 인자가 없으면 아무것도 하지 않는다(실수로 전체에 도는 것을 막는다).
"""
import difflib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "app" / "globals.css"
# canvas 로 그리는 라이브러리는 CSS 변수를 못 읽는다. 하위 경로(echarts/core, three/addons…)와 zrender 까지 본다.
CANVAS_IMPORT = re.compile(r"""from\s+['"](echarts(?:/[\w./-]+)?|echarts-for-react|zrender(?:/[\w./-]+)?|three(?:/[\w./-]+)?)['"]|\bCanvasRenderer\b|getContext\(\s*['"]2d""")
# 색 문자열 뒤에 hex 투명도를 이어 붙이는 코드: `${k.color}33`, c + '33'. var() 로 바꾸면 `var(--x)33` 이 되어 깨진다.
HEX_ALPHA_CONCAT = re.compile(r"""\$\{[^}]+\}[0-9a-fA-F]{2}\b|\+\s*['"][0-9a-fA-F]{2}['"]""")
TEST_PATH = re.compile(r"(^|/)__tests__/|\.(test|spec)\.[jt]sx?$")
HEX_STR = re.compile(r"""(?P<q>['"])(?P<hex>#[0-9a-fA-F]{6})(?P=q)""")


def load_tokens(css_text: str) -> dict:
    """:root 블록의 --w-<name>: #rrggbb → {hex(lower): name}. 같은 값이 여럿이면 -500 을 우선, 아니면 모호로 제외."""
    root = re.search(r":root\s*\{(.*?)\n\}", css_text, re.S)
    body = root.group(1) if root else css_text
    by_hex: dict = {}
    for name, hx in re.findall(r"--(w-[a-z]+-\d{2,3})\s*:\s*(#[0-9a-fA-F]{6})\s*;", body):
        by_hex.setdefault(hx.lower(), []).append(name)
    out = {}
    for hx, names in by_hex.items():
        names = sorted(set(names))
        if len(names) == 1:
            out[hx] = names[0]
        else:
            five = [n for n in names if n.endswith("-500")]
            if len(five) == 1:
                out[hx] = five[0]
    return out


def light_overridden(css_text: str) -> set:
    """[data-v3='light'] 블록이 다시 정의하는 --w-* 이름."""
    names = set()
    for body in re.findall(r"""\[data-v3\s*=\s*['"]light['"]\s*\][^{]*\{([^}]*)\}""", css_text):
        names.update(re.findall(r"--(w-[a-z]+-\d{2,3})\s*:", body))
    return names


def skip_reason(src: str):
    """이 파일을 건드리면 안 되는 이유. 없으면 None."""
    if CANVAS_IMPORT.search(src):
        return "canvas 렌더러 — CSS 변수를 못 읽는다"
    if HEX_ALPHA_CONCAT.search(src):
        return "색 문자열에 hex 투명도를 이어 붙인다 — var() 로 바꾸면 깨진다, 손으로 color-mix 전환 필요"
    return None


def convert(src: str, tokens: dict):
    """치환된 텍스트와 (치환 수, 남은 미대응 hex 목록)을 돌려준다."""
    unmatched = []
    count = 0

    def sub(m):
        nonlocal count
        hx = m.group("hex").lower()
        name = tokens.get(hx)
        if not name:
            unmatched.append(hx)
            return m.group(0)
        count += 1
        return f"{m.group('q')}var(--{name}){m.group('q')}"

    return HEX_STR.sub(sub, src), count, unmatched


def selftest():
    css = ":root {\n  --w-rose-500: #f43f5e;\n  --w-blue-500: #3b82f6;\n  --w-slate-500: #71717a;\n}\n"
    tk = load_tokens(css)
    assert tk == {"#f43f5e": "w-rose-500", "#3b82f6": "w-blue-500", "#71717a": "w-slate-500"}, tk
    src = """<Line stroke="#F43F5E" /> accent = '#3b82f6'; c="#64748b"; g=`linear-gradient(#f43f5e, #fff)`"""
    out, n, un = convert(src, tk)
    assert n == 2, n
    assert 'stroke="var(--w-rose-500)"' in out and "accent = 'var(--w-blue-500)'" in out, out
    assert '"#64748b"' in out and un == ["#64748b"], (out, un)          # 값이 다르면 건드리지 않는다
    assert "linear-gradient(#f43f5e, #fff)" in out, out                 # 긴 문자열 안은 그대로
    out2, n2, _ = convert(out, tk)
    assert n2 == 0 and out2 == out, "멱등이어야 한다"
    css2 = css + "[data-v3='light'] {\n  --w-blue-500: #3685ca;\n}\n"
    assert light_overridden(css2) == {"w-blue-500"}, light_overridden(css2)
    strict = {h: n for h, n in load_tokens(css2).items() if n not in light_overridden(css2)}
    _, n3, un3 = convert('a="#3b82f6" b="#f43f5e"', strict)
    assert n3 == 1 and un3 == ["#3b82f6"], (n3, un3)                    # 라이트 재정의 토큰은 기본 제외
    # Codex 리뷰(2026-09-11) 재현 조건 — 전부 건너뛰거나 제외돼야 한다
    assert skip_reason("import * as echarts from 'echarts/core';") , "#5 echarts 하위 경로"
    assert skip_reason("import { CanvasRenderer } from 'echarts/renderers';"), "#5 CanvasRenderer"
    assert skip_reason("const b = `1px solid ${k.color}33`;"), "#4 template hex-alpha"
    assert skip_reason("const b = c + '33';"), "#4 연결 hex-alpha"
    assert not skip_reason('<Line stroke="#f43f5e" />'), "평범한 파일은 건너뛰지 않는다"
    assert TEST_PATH.search("__tests__/x.test.ts") and TEST_PATH.search("components/a.spec.tsx"), "#3 테스트 경로"
    assert not TEST_PATH.search("components/PorkWidgets.tsx")
    for sel in ("[data-v3='light']", '[data-v3="light"]', "[data-v3 = 'light']"):
        assert light_overridden(":root{}\n" + sel + " {\n  --w-blue-500: #3685ca;\n}\n") == {"w-blue-500"}, f"#6 {sel}"
    print("selftest OK")


def main(argv):
    if "--selftest" in argv:
        selftest()
        return 0
    dry = "--dry-run" in argv
    check = "--check" in argv
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 0
    css_text = CSS.read_text(encoding="utf-8")
    tokens = load_tokens(css_text)
    if "--follow-theme" not in argv:
        over = light_overridden(css_text)
        tokens = {h: n for h, n in tokens.items() if n not in over}
    total, remain, report = 0, 0, {}
    for f in files:
        p = Path(f)
        if TEST_PATH.search(str(p)):
            print(f"skip (테스트 파일 — 기대값 hex 는 CSS 가 아니다): {f}")
            continue
        src = p.read_text(encoding="utf-8")
        why = skip_reason(src)
        if why:
            print(f"skip ({why}): {f}")
            continue
        out, n, un = convert(src, tokens)
        for hx in un:
            report[hx] = report.get(hx, 0) + 1
        if n == 0:
            continue
        total += n
        if check:
            remain += n
            print(f"토큰으로 바꿀 수 있는 hex {n}개 남음: {f}")
        elif dry:
            sys.stdout.writelines(difflib.unified_diff(src.splitlines(True), out.splitlines(True), f, f))
        else:
            p.write_text(out, encoding="utf-8")
            print(f"{n:3}개 치환: {f}")
    if report:
        print("\n토큰으로 바꾸지 않은 hex — 맞는 토큰이 없거나 라이트 테마가 재정의하는 토큰(팔레트 결정 필요):")
        for hx, c in sorted(report.items(), key=lambda x: -x[1]):
            print(f"  {hx} ×{c}")
    if check:
        return 1 if remain else 0
    print(f"\n합계 {total}개 {'(dry-run)' if dry else '치환'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
