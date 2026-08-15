#!/usr/bin/env python3
"""방콕 주간보고 표시본과 네이티브 KPI 계약을 원본에서 동기화한다."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Sequence


DEFAULT_INPUT = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/"
    "내 드라이브/11. 태국/002. (매주)주간보고/"
    "방콕사무소_주간보고_종합분석_2020-2026.html"
)
DEFAULT_HTML_OUTPUT = Path("public/reports/bangkok_weekly_2020_2026.html")
DEFAULT_JSON_OUTPUT = Path("public/data/bangkok_weekly_kpi.json")
DEFAULT_PAYLOAD_OUTPUT = Path("public/data/bangkok_weekly_payload.json")

# 네이티브 탭 대시보드가 소비하는 payload 필수 키 — 하나라도 빠지면 fail-closed
PAYLOAD_REQUIRED_KEYS = (
    "series", "panel", "traderMonthly", "yearly", "traderAnnual",
    "corr", "seasonality", "snapshot", "stockShare", "canneryTrend",
    "salt", "claimsYear", "meta", "mismatch", "corrections", "dupes", "priceFlags",
)
PAYLOAD_MIN_SERIES_ROWS = 200

OVERRIDE_BEGIN = "<!-- BEGIN:V25D_BANGKOK_DARK -->"
OVERRIDE_END = "<!-- END:V25D_BANGKOK_DARK -->"
OVERRIDE_PATTERN = re.compile(
    rf"\n?{re.escape(OVERRIDE_BEGIN)}.*?{re.escape(OVERRIDE_END)}\n?",
    re.DOTALL,
)

DARK_OVERRIDE = f"""{OVERRIDE_BEGIN}
<style id="v25d-bangkok-dark">
:root {{
  color-scheme: dark;
  --bg: #0a0a0b;
  --panel: rgba(24, 24, 27, 0.72);
  --ink: #fafafa;
  --muted: #a1a1aa;
  --line: rgba(250, 250, 250, 0.12);
  --accent: #22d3ee;
}}
html,
body {{
  background: #0a0a0b !important;
  color: #fafafa !important;
}}
header.hero {{
  background: rgba(24, 24, 27, 0.72) !important;
  border-left: 3px solid var(--accent);
}}
header.hero,
#summary > .kpis {{
  display: none !important;
}}
nav.toc {{
  background: rgba(10, 10, 11, 0.96) !important;
  border-bottom: 1px solid var(--line) !important;
}}
nav.toc a {{ color: var(--muted) !important; }}
nav.toc a:hover {{
  background: #27272a !important;
  color: var(--ink) !important;
}}
.card,
.kpi {{
  background: rgba(24, 24, 27, 0.72) !important;
  border: 1px solid var(--line) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}}
.card .cnote,
tfoot td {{ background: #18181b !important; }}
h2 {{ border-bottom-color: var(--accent) !important; }}
.lead,
.note,
footer,
.kpi .lab,
.kpi .dlt,
.legend {{ color: var(--muted) !important; }}
table {{ color: var(--ink) !important; }}
th {{
  background: #27272a !important;
  color: #e4e4e7 !important;
}}
th,
td {{ border-bottom-color: var(--line) !important; }}
tbody tr:hover {{ background: #27272a !important; }}
.tblbox {{ border-color: var(--line) !important; }}
select,
input[type="search"],
.btn {{
  background: #18181b !important;
  border-color: var(--line) !important;
  color: var(--ink) !important;
}}
.btn.on {{
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  color: #0a0a0b !important;
}}
.callout {{
  background: rgba(34, 211, 238, 0.08) !important;
  color: #d4d4d8 !important;
}}
.callout.warn {{ background: rgba(245, 158, 11, 0.10) !important; }}
.callout.bad {{ background: rgba(239, 68, 68, 0.10) !important; }}
.badge {{
  background: #27272a !important;
  color: var(--muted) !important;
}}
.badge.w {{
  background: rgba(245, 158, 11, 0.12) !important;
  color: #fbbf24 !important;
}}
code {{ color: #e4e4e7 !important; }}
.chart text {{ fill: #a1a1aa !important; }}
.chart line[stroke="#e8ecf0"],
.chart line[stroke="#cdd6de"] {{ stroke: #3f3f46 !important; }}
</style>
{OVERRIDE_END}"""


class BangkokSyncError(RuntimeError):
    """원본이 방콕 KPI 계약을 충족하지 못할 때 발생한다."""


class BangkokHeaderParser(HTMLParser):
    """헤더 기간과 요약 KPI 라벨·값을 원본 DOM 순서대로 수집한다."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._stack: list[tuple[str, set[str]]] = []
        self._current_kpi: dict[str, list[str]] | None = None
        self._kpi_depth: int | None = None
        self._capture_field: str | None = None
        self._capture_depth: int | None = None
        self._sub_parts: list[str] = []
        self._sub_depth: int | None = None
        self.kpis: dict[str, str] = {}
        self.header_subtitle = ""

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        self._stack.append((tag, classes))
        depth = len(self._stack)

        if tag == "div" and "kpi" in classes and self._current_kpi is None:
            self._current_kpi = {"label": [], "value": []}
            self._kpi_depth = depth
        elif self._current_kpi is not None and tag == "div":
            if "lab" in classes:
                self._capture_field = "label"
                self._capture_depth = depth
            elif "val" in classes:
                self._capture_field = "value"
                self._capture_depth = depth

        inside_hero = any("hero" in open_classes for _, open_classes in self._stack)
        if tag == "div" and "sub" in classes and inside_hero:
            self._sub_parts = []
            self._sub_depth = depth

    def handle_data(self, data: str) -> None:
        if self._current_kpi is not None and self._capture_field is not None:
            self._current_kpi[self._capture_field].append(data)
        if self._sub_depth is not None:
            self._sub_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        depth = len(self._stack)

        if self._capture_depth == depth:
            self._capture_field = None
            self._capture_depth = None

        if self._sub_depth == depth:
            self.header_subtitle = normalize_text("".join(self._sub_parts))
            self._sub_depth = None
            self._sub_parts = []

        if self._kpi_depth == depth and self._current_kpi is not None:
            label = normalize_text("".join(self._current_kpi["label"]))
            value = normalize_text("".join(self._current_kpi["value"]))
            if label and value:
                self.kpis[label] = value
            self._current_kpi = None
            self._kpi_depth = None

        if self._stack:
            self._stack.pop()


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def integer_from(value: str, label: str) -> int:
    match = re.search(r"\d[\d,]*", value)
    if not match:
        raise BangkokSyncError(f"{label} 값을 숫자로 읽지 못했습니다: {value}")
    return int(match.group(0).replace(",", ""))


def ten_thousand_usd_from(value: str) -> int:
    match = re.search(r"(\d+(?:\.\d+)?)\s*만", value)
    if not match:
        raise BangkokSyncError(
            f"하이솔트 확정액을 만 USD 단위로 읽지 못했습니다: {value}"
        )
    return round(float(match.group(1)) * 10_000)


def parse_kpi_contract(source: str) -> dict[str, Any]:
    parser = BangkokHeaderParser()
    try:
        parser.feed(source)
        parser.close()
    except (UnicodeError, ValueError) as error:
        raise BangkokSyncError("HTML 구조를 읽지 못했습니다.") from error

    period_match = re.search(
        r"(\d{4})년\s*(\d{1,2})월.*?~\s*(\d{4})년\s*(\d{1,2})월",
        parser.header_subtitle,
    )
    if not period_match:
        raise BangkokSyncError(
            f"헤더에서 분석 기간을 찾지 못했습니다: {parser.header_subtitle or '헤더 없음'}"
        )

    required_labels = [
        "분석 대상",
        "최신 시세",
        "방콕 재고",
        "가공가능일수",
        "2026 누적 하역",
        "하이솔트 확정액",
    ]
    missing = [label for label in required_labels if label not in parser.kpis]
    if missing:
        raise BangkokSyncError(f"필수 KPI를 찾지 못했습니다: {', '.join(missing)}")

    start_year, start_month, end_year, end_month = map(int, period_match.groups())
    return {
        "period": f"{start_year:04d}.{start_month:02d}~{end_year:04d}.{end_month:02d}",
        "weeks": integer_from(parser.kpis["분석 대상"], "분석 대상"),
        "latestPrice": integer_from(parser.kpis["최신 시세"], "최신 시세"),
        "stockMt": integer_from(parser.kpis["방콕 재고"], "방콕 재고"),
        "processDays": integer_from(parser.kpis["가공가능일수"], "가공가능일수"),
        "cumUnloadMt": integer_from(parser.kpis["2026 누적 하역"], "2026 누적 하역"),
        "highSaltUsd": ten_thousand_usd_from(parser.kpis["하이솔트 확정액"]),
    }


def inject_dark_override(source: str) -> str:
    cleaned = OVERRIDE_PATTERN.sub("", source)
    closing_head = re.search(r"</head\s*>", cleaned, re.IGNORECASE)
    if not closing_head:
        raise BangkokSyncError("HTML head 종료 태그를 찾지 못했습니다.")
    prefix = cleaned[: closing_head.start()].rstrip()
    suffix = cleaned[closing_head.start() :]
    return f"{prefix}\n{DARK_OVERRIDE}\n{suffix}"


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        dir=path.parent,
        text=True,
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="") as handle:
            handle.write(content)
        os.replace(temporary_name, path)
    except Exception:
        Path(temporary_name).unlink(missing_ok=True)
        raise


def parse_payload_contract(source: str) -> dict[str, Any]:
    """원본에 내장된 <script id="payload"> JSON을 검증해 그대로 반환한다."""
    match = re.search(
        r'<script id="payload" type="application/json">(.*?)</script>', source, re.DOTALL
    )
    if match is None:
        raise BangkokSyncError('payload 스크립트(<script id="payload">)를 찾지 못했습니다.')
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError as error:
        raise BangkokSyncError(f"payload JSON 파싱 실패: {error}") from error
    if not isinstance(payload, dict):
        raise BangkokSyncError("payload는 객체여야 합니다.")
    missing = [key for key in PAYLOAD_REQUIRED_KEYS if key not in payload]
    if missing:
        raise BangkokSyncError(f"payload 필수 키 누락: {', '.join(missing)}")
    series = payload["series"]
    if not isinstance(series, list) or len(series) < PAYLOAD_MIN_SERIES_ROWS:
        raise BangkokSyncError(
            f"series 행이 {PAYLOAD_MIN_SERIES_ROWS}개 미만입니다: {len(series) if isinstance(series, list) else '리스트 아님'}"
        )
    return payload


def sync_report(
    input_path: Path, html_output: Path, json_output: Path, payload_output: Path
) -> None:
    if not input_path.is_file():
        raise BangkokSyncError(f"원본 HTML을 찾을 수 없습니다: {input_path}")
    try:
        source = input_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        raise BangkokSyncError(f"원본 HTML을 UTF-8로 읽지 못했습니다: {input_path}") from error

    kpi_contract = parse_kpi_contract(source)
    payload_contract = parse_payload_contract(source)
    transformed = inject_dark_override(source)
    json_payload = json.dumps(kpi_contract, ensure_ascii=False, indent=2) + "\n"
    payload_json = json.dumps(payload_contract, ensure_ascii=False, separators=(",", ":")) + "\n"

    try:
        atomic_write(html_output, transformed)
        atomic_write(json_output, json_payload)
        atomic_write(payload_output, payload_json)
    except OSError as error:
        raise BangkokSyncError(f"동기화 출력을 쓰지 못했습니다: {error}") from error


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="방콕 주간보고를 다크 표시본과 KPI·payload JSON으로 동기화합니다."
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--html-output", type=Path, default=DEFAULT_HTML_OUTPUT)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON_OUTPUT)
    parser.add_argument("--payload-output", type=Path, default=DEFAULT_PAYLOAD_OUTPUT)
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv if argv is not None else sys.argv[1:])
    try:
        sync_report(args.input, args.html_output, args.json_output, args.payload_output)
    except BangkokSyncError as error:
        print(f"방콕 주간보고 동기화 실패: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
