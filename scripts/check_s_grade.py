"""S-Grade UI 표준화 검증 스크립트.

COMPREHENSIVE_RULEBOOK V4.1 의 D/W 규칙을 5개 grep 검증으로 환산해서
지정한 dashboard들의 import closure 전체에 대해 위반 베이스라인을 측정한다.

사용법:
    python scripts/check_s_grade.py TunaDashboard.tsx TunaExtractDashboard.tsx TunaInsightsDashboard.tsx
    python scripts/check_s_grade.py --report report.md TunaDashboard.tsx ...
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COMPONENTS = ROOT / "components"

LOCAL_IMPORT = re.compile(
    r"""^\s*import\s+(?:[^'"\n]+from\s+)?['"](\./[^'"]+)['"]""",
    re.MULTILINE,
)

# 한글 문자 1개라도 포함되면 "한글 라벨"로 간주, 영문 검증에서 제외
HAS_HANGUL = re.compile(r"[가-힣]")

# JSX text node 의 영문 문자열
JSX_TEXT_EN = re.compile(r">\s*([A-Za-z][A-Za-z0-9 .,\-&/()'%]{2,}?)\s*<")

USER_PROPS = "title|name|label|header|tooltip|placeholder|cardDesc|cardTitle|subtitle|description"
JSX_PROP_EN = re.compile(
    rf'\b(?:{USER_PROPS})\s*=\s*["\']([A-Za-z][A-Za-z0-9 .,\-&/()\'%]{{2,}}?)["\']'
)

WHITELIST_TOKEN = re.compile(r"^[A-Z]{2,6}[0-9]?$|^v?\d[\d.]*$")
WHITELIST_PHRASE = {
    "OK", "N/A", "TBD", "AI", "ESG", "SDG", "FTA", "WTO", "OECD", "WCPO",
    "EU", "US", "UK", "PNG", "KFAS", "INFOFISH", "TAC", "MOF", "OEM",
    "SIT", "TAK", "ID", "CN8", "HS",
}


def resolve_component_path(spec: str) -> Path | None:
    base = (COMPONENTS / spec.lstrip("./")).resolve()
    for ext in ("", ".tsx", ".ts", ".jsx", ".js"):
        p = base if ext == "" else base.with_suffix(ext)
        if p.exists() and p.is_file():
            return p
    return None


def build_closure(entries: list[str]) -> list[Path]:
    seen: dict[str, Path] = {}
    queue = list(entries)
    while queue:
        spec = queue.pop(0)
        spec_norm = spec.lstrip("./").rstrip(".tsx").rstrip(".ts")
        if spec_norm in seen:
            continue
        path = resolve_component_path(spec_norm)
        if path is None:
            continue
        if path.suffix in {".css", ".scss", ".module.css"} or ".module.css" in path.name:
            continue
        seen[spec_norm] = path
        try:
            content = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for m in LOCAL_IMPORT.finditer(content):
            imported = m.group(1)
            if imported.endswith(".css") or ".module.css" in imported:
                continue
            queue.append(imported)
    return sorted(seen.values(), key=lambda p: p.name)


def is_whitelisted(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return True
    if WHITELIST_TOKEN.match(stripped):
        return True
    if stripped in WHITELIST_PHRASE:
        return True
    tokens = re.findall(r"[A-Za-z0-9]+", stripped)
    if tokens and all(t in WHITELIST_PHRASE or WHITELIST_TOKEN.match(t) for t in tokens):
        return True
    return False


def english_leftover(content: str) -> list[tuple[int, str, str]]:
    hits: list[tuple[int, str, str]] = []
    for m in JSX_TEXT_EN.finditer(content):
        snippet = m.group(1)
        if HAS_HANGUL.search(snippet) or is_whitelisted(snippet):
            continue
        line = content.count("\n", 0, m.start()) + 1
        hits.append((line, "text", snippet))
    for m in JSX_PROP_EN.finditer(content):
        snippet = m.group(1)
        if HAS_HANGUL.search(snippet) or is_whitelisted(snippet):
            continue
        line = content.count("\n", 0, m.start()) + 1
        hits.append((line, "prop", snippet))
    return hits


def count_pattern(content: str, pattern: re.Pattern) -> int:
    return len(pattern.findall(content))


JSX_CARDDESC = re.compile(r"\bcardDesc\b")
JSX_TELEMETRY = re.compile(r"<TelemetryBadge\b")
JSX_TAKEAWAY = re.compile(r"<TakeawayBox\b")
UNIT_PARENS = re.compile(r"\([\$\w\s가-힣%]*?[/\\][\w가-힣]+\)")


def measure_file(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    return {
        "lines": content.count("\n") + 1,
        "cardDesc": count_pattern(content, JSX_CARDDESC),
        "TelemetryBadge": count_pattern(content, JSX_TELEMETRY),
        "TakeawayBox": count_pattern(content, JSX_TAKEAWAY),
        "unit_parens": count_pattern(content, UNIT_PARENS),
        "english_hits": english_leftover(content),
    }


def looks_like_widget(path: Path, m: dict) -> bool:
    """heuristic: 차트/SIT-TAK이 들어가는 위젯성 파일인지."""
    if m["TakeawayBox"] > 0 or m["TelemetryBadge"] > 0:
        return True
    content = path.read_text(encoding="utf-8")
    return "Recharts" in content or "recharts" in content or "<Bar" in content or "<Line" in content


def render_report(closures: dict[str, list[Path]]) -> str:
    out: list[str] = []
    out.append("# S-Grade UI 표준화 베이스라인 측정\n")

    union: dict[str, Path] = {}
    for files in closures.values():
        for f in files:
            union[f.name] = f

    out.append(f"## 요약\n")
    out.append(f"- 진입점 dashboard: {len(closures)}\n")
    out.append(f"- 유니크 검증 파일: {len(union)}\n")
    out.append("")

    for entry, files in closures.items():
        out.append(f"## Dashboard: `{entry}`\n")
        out.append(f"- closure 크기: {len(files)}개 파일\n")
        out.append("")
        out.append("| 파일 | 줄 | cardDesc | TelemetryBadge | TakeawayBox | unit-parens | EN-잔존 | 위젯? |")
        out.append("|---|---:|---:|---:|---:|---:|---:|:---:|")
        for f in files:
            m = measure_file(f)
            widget = "🧩" if looks_like_widget(f, m) else ""
            en = len(m["english_hits"])
            out.append(
                f"| `{f.name}` | {m['lines']} | {m['cardDesc']} | {m['TelemetryBadge']} | "
                f"{m['TakeawayBox']} | {m['unit_parens']} | {en} | {widget} |"
            )
        out.append("")

    out.append("## 영문 잔존 상세 (위반 후보)\n")
    for f in sorted(union.values(), key=lambda p: p.name):
        m = measure_file(f)
        if not m["english_hits"]:
            continue
        out.append(f"### `{f.name}` — {len(m['english_hits'])}건")
        for line, kind, txt in m["english_hits"][:50]:
            out.append(f"- L{line} [{kind}] `{txt}`")
        if len(m["english_hits"]) > 50:
            out.append(f"- … 외 {len(m['english_hits']) - 50}건")
        out.append("")

    out.append("## 규칙별 누락 후보 (위젯 파일인데 패턴이 0인 경우)\n")
    rule_widget_missing: dict[str, list[str]] = defaultdict(list)
    for f in union.values():
        m = measure_file(f)
        if not looks_like_widget(f, m):
            continue
        if m["cardDesc"] == 0:
            rule_widget_missing["cardDesc"].append(f.name)
        if m["TelemetryBadge"] == 0:
            rule_widget_missing["TelemetryBadge"].append(f.name)
        if m["TakeawayBox"] == 0:
            rule_widget_missing["TakeawayBox"].append(f.name)
    for rule, names in rule_widget_missing.items():
        out.append(f"### {rule} 누락 ({len(names)}개)")
        for n in names:
            out.append(f"- `{n}`")
        out.append("")

    return "\n".join(out)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entries", nargs="+", help="진입점 dashboard 파일들 (예: TunaDashboard.tsx)")
    parser.add_argument("--report", help="마크다운 보고서 출력 경로")
    args = parser.parse_args(argv)

    closures: dict[str, list[Path]] = {}
    for entry in args.entries:
        files = build_closure([entry])
        closures[entry] = files

    report = render_report(closures)

    if args.report:
        Path(args.report).write_text(report, encoding="utf-8")
        print(f"보고서 저장: {args.report}", file=sys.stderr)
    print(report)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
