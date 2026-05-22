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
        spec_norm = spec
        if spec_norm.startswith("./"):
            spec_norm = spec_norm[2:]
        if spec_norm.endswith(".tsx"):
            spec_norm = spec_norm[:-4]
        elif spec_norm.endswith(".ts"):
            spec_norm = spec_norm[:-3]
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

# Phase D+ 확장: AI 티 / GS 톤 위반 패턴
CONVICTION_TAG = re.compile(r"\(Conviction Buy\)|\(Strong Buy\)|\*\*\[Actionable Insight\]\*\*")
EXAGG_ADJ = re.compile(r"압도적|완벽한 음의 상관|완벽한 헷지|완벽한 패러다임|혁명적|독보적|역사적 기회|최초이자 최고")
EXCESS_PHRASE = re.compile(r"잉여현금흐름을 극대화|즉시 폐기하십시오|전격 가동하십시오|해야 해야")
BRACKET_LABEL = re.compile(r'(?:situation|actionPlan|takeaway)\s*=\s*["\']\[[^\]\[]{2,80}\]\s+')

# 룰북 강제 정의 파일은 forbidden 패턴 자체를 코드 안에 보유하므로 검사 대상에서 제외 (false positive 방지)
# ADR 0008: Dashboard-Level Pattern 파일은 ADR-0005 WidgetCard 마이그레이션 대상이 아님 — 검사 제외
EXCLUDED_FILES = {
    "WidgetCard.tsx",
    # ADR 0008 dashboard-level pattern (master-detail / interactive tool dashboards)
    "FleetStrategyMatrix.tsx",
    "SEAsiaOEMDashboard.tsx",
    "RetailPOS.tsx",
    "StrategyIntel.tsx",
}

# Phase E+ 확장: API endpoint hardcoded mock 의심 (역참조)
FAKE_LIVE = re.compile(r"🟢 LIVE API|status:\s*['\"]🟢")


def measure_file(path: Path) -> dict:
    content = path.read_text(encoding="utf-8")
    is_excluded = path.name in EXCLUDED_FILES
    return {
        "lines": content.count("\n") + 1,
        "cardDesc": count_pattern(content, JSX_CARDDESC),
        "TelemetryBadge": count_pattern(content, JSX_TELEMETRY),
        "TakeawayBox": count_pattern(content, JSX_TAKEAWAY),
        "unit_parens": count_pattern(content, UNIT_PARENS),
        "english_hits": [] if is_excluded else english_leftover(content),
        # GS 톤 위반 (Phase D) — excluded 파일은 룰북 강제 정의 자체라 제외
        "conviction_tags": 0 if is_excluded else count_pattern(content, CONVICTION_TAG),
        "exagg_adjectives": 0 if is_excluded else count_pattern(content, EXAGG_ADJ),
        "excess_phrases": 0 if is_excluded else count_pattern(content, EXCESS_PHRASE),
        "bracket_labels": 0 if is_excluded else count_pattern(content, BRACKET_LABEL),
        # API mock 의심 (Phase E~F)
        "fake_live_tags": 0 if is_excluded else count_pattern(content, FAKE_LIVE),
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
        out.append("| 파일 | 줄 | cardDesc | TelemBadge | Takeaway | EN | GS위반 | 위젯 |")
        out.append("|---|---:|---:|---:|---:|---:|---:|:---:|")
        for f in files:
            m = measure_file(f)
            widget = "🧩" if looks_like_widget(f, m) else ""
            en = len(m["english_hits"])
            gs_total = m["conviction_tags"] + m["exagg_adjectives"] + m["excess_phrases"] + m["bracket_labels"]
            out.append(
                f"| `{f.name}` | {m['lines']} | {m['cardDesc']} | {m['TelemetryBadge']} | "
                f"{m['TakeawayBox']} | {en} | {gs_total} | {widget} |"
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

    # Phase D+ GS 톤 위반 상세
    out.append("## GS 톤 위반 (Conviction Buy / 과장 수식어 / 후렴구 / 브래킷 라벨)\n")
    gs_violations: list[tuple[str, dict]] = []
    for f in union.values():
        m = measure_file(f)
        total = m["conviction_tags"] + m["exagg_adjectives"] + m["excess_phrases"] + m["bracket_labels"]
        if total > 0:
            gs_violations.append((f.name, m))
    if not gs_violations:
        out.append("✅ 위반 0건 (전 closure 청결)")
    else:
        out.append("| 파일 | Conviction태그 | 과장수식어 | 후렴구 | 브래킷라벨 |")
        out.append("|---|---:|---:|---:|---:|")
        for name, m in gs_violations:
            out.append(
                f"| `{name}` | {m['conviction_tags']} | {m['exagg_adjectives']} | "
                f"{m['excess_phrases']} | {m['bracket_labels']} |"
            )
    out.append("")

    # Phase E+ 가짜 LIVE 태그 (위젯·API 양쪽)
    out.append("## 가짜 LIVE API 표시 (Phase E+ A-02 위반)\n")
    fake_live = [(f.name, m) for f, m in [(f, measure_file(f)) for f in union.values()] if m["fake_live_tags"] > 0]
    if not fake_live:
        out.append("✅ 위반 0건")
    else:
        for name, m in fake_live:
            out.append(f"- `{name}` — {m['fake_live_tags']}건")
    out.append("")

    return "\n".join(out)


def compute_exit_code(closures: dict[str, list[Path]]) -> int:
    """위반 1건 이상이면 1 반환 (CI 통합용)."""
    union: dict[str, Path] = {}
    for files in closures.values():
        for f in files:
            union[f.name] = f
    total_violations = 0
    for f in union.values():
        m = measure_file(f)
        total_violations += (
            len(m["english_hits"])
            + m["conviction_tags"]
            + m["exagg_adjectives"]
            + m["excess_phrases"]
            + m["bracket_labels"]
            + m["fake_live_tags"]
        )
    return 1 if total_violations > 0 else 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("entries", nargs="+", help="진입점 dashboard 파일들 (예: TunaDashboard.tsx)")
    parser.add_argument("--report", help="마크다운 보고서 출력 경로")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="위반 1건이라도 있으면 exit 1 (CI 회귀 게이트용, ADR-0004 Phase 1)",
    )
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

    if args.strict:
        return compute_exit_code(closures)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
