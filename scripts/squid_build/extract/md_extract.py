"""Config-driven Markdown/HTML extraction with per-widget failure isolation."""

from __future__ import annotations

import json
import logging
import re
import subprocess
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable

from ..spec import WidgetSpec


DEFAULT_CONFIG_DIR = Path(__file__).resolve().parents[1] / "configs"


class ExtractionUnavailable(ValueError):
    """The archive cannot support the configured widget without guessing."""


class _VisibleHTML(HTMLParser):
    BLOCK_TAGS = {
        "article", "br", "dd", "div", "dl", "dt", "h1", "h2", "h3", "h4",
        "h5", "h6", "li", "main", "p", "section", "td", "th", "tr",
    }
    HIDDEN_TAGS = {"script", "style", "svg", "template", "noscript"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.hidden_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in self.HIDDEN_TAGS:
            self.hidden_depth += 1
        elif not self.hidden_depth and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.HIDDEN_TAGS and self.hidden_depth:
            self.hidden_depth -= 1
        elif not self.hidden_depth and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if not self.hidden_depth:
            self.parts.append(data)

    def text(self) -> str:
        return "".join(self.parts)


def _dedupe_key(value: str) -> str:
    """근사중복 판정용 지문. 대소문자·구두점·공백 차이를 지운다."""
    return re.sub(r"[^0-9a-z가-힣]+", "", value.lower())


def _normalize(value: str) -> str:
    return " ".join(value.replace("\x0c", " ").split())


def _text_blocks(text: str) -> list[str]:
    lines = [_normalize(line) for line in text.splitlines()]
    paragraphs = [_normalize(block) for block in re.split(r"\n\s*\n", text)]
    seen = set()
    blocks = []
    for block in lines + paragraphs:
        if block and block not in seen:
            seen.add(block)
            blocks.append(block)
    return blocks


def _visible_blocks(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    if path.suffix.lower() == ".html":
        parser = _VisibleHTML()
        parser.feed(text)
        text = parser.text()
    return _text_blocks(text)


@lru_cache(maxsize=16)
def _pdf_layout_text(path_value: str, modified_ns: int, size: int) -> str:
    del modified_ns, size  # cache-key components invalidate changed PDFs
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", path_value, "-"],
            check=True,
            capture_output=True,
        )
    except FileNotFoundError as exc:
        raise ExtractionUnavailable("pdftotext is unavailable for layout re-extraction") from exc
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.decode("utf-8", errors="replace").strip()
        raise ExtractionUnavailable(f"pdftotext -layout failed: {detail}") from exc
    return result.stdout.decode("utf-8", errors="replace")


def _source_variants(
    archive_root: Path,
    relative: str,
) -> list[tuple[list[str], str, str]]:
    path = archive_root / relative
    if path.is_dir():
        raise ExtractionUnavailable(f"directory is not a specific source document: {relative}")
    if not path.exists():
        raise ExtractionUnavailable(f"archive source missing: {relative}")
    if path.suffix.lower() == ".pdf":
        variants: list[tuple[list[str], str, str]] = []
        twin = path.with_suffix(".md")
        if twin.exists():
            variants.append(
                (
                    _visible_blocks(twin),
                    str(twin.relative_to(archive_root)),
                    "markdown_twin",
                )
            )
        stat = path.stat()
        variants.append(
            (
                _text_blocks(_pdf_layout_text(str(path), stat.st_mtime_ns, stat.st_size)),
                relative,
                "pdftotext -layout",
            )
        )
        return variants
    if path.suffix.lower() not in {".md", ".html"}:
        raise ExtractionUnavailable(f"unsupported document type: {relative}")
    return [
        (
            _visible_blocks(path),
            relative,
            "html" if path.suffix.lower() == ".html" else "markdown",
        )
    ]


def _load_config(path: Path, expected_widget_id: str) -> dict:
    config = json.loads(path.read_text(encoding="utf-8"))
    if config.get("widget_id") != expected_widget_id:
        raise ValueError(
            f"config {path.name} declares {config.get('widget_id')!r}, expected {expected_widget_id!r}"
        )
    if not config.get("patterns") and not config.get("structured_parser"):
        raise ValueError(f"config {path.name} requires patterns or structured_parser")
    return config


def extract_configured_widget(
    archive_root: Path,
    spec: WidgetSpec,
    config_path: Path,
) -> dict:
    config = _load_config(config_path, spec.widget_id)
    if config.get("structured_parser") == "eu_market_prices":
        from .eu_prices import extract_eu_market_prices

        return extract_eu_market_prices(Path(archive_root), spec)
    if config.get("structured_parser") == "species_price_ladder":
        from .eu_prices import extract_species_price_ladder

        return extract_species_price_ladder(Path(archive_root), spec)
    if config.get("structured_parser") == "korea_tac_coverage":
        from .official_tables import extract_korea_tac_coverage

        return extract_korea_tac_coverage(Path(archive_root), spec)
    if config.get("structured_parser") == "sprfmo_effort":
        from .official_tables import extract_sprfmo_effort

        return extract_sprfmo_effort(Path(archive_root), spec)

    patterns = [re.compile(pattern, re.IGNORECASE) for pattern in config["patterns"]]
    excludes = [re.compile(pattern, re.IGNORECASE) for pattern in config.get("exclude_patterns", [])]
    require_numeric = bool(config.get("require_numeric", False))
    max_chars = int(config.get("max_chars", 1200))
    max_items = int(config.get("max_items", 12))
    max_items_per_source = int(config.get("max_items_per_source", max_items))
    min_items = int(config.get("min_items", 1))
    min_sources = int(config.get("min_sources", 1))
    # 웹 스냅샷은 제목·네비게이션이 본문과 함께 잡힌다. 너무 짧은 조각은
    # 근거가 아니라 라벨이라 버린다.
    min_chars = int(config.get("min_chars", 40))

    data = []
    matched_sources = set()
    seen = set()
    kept_norms: list[str] = []  # 근사중복 판정용 정규화 본문
    used_layout_reextraction = False
    for relative in spec.archive_paths:
        for blocks, resolved_relative, extraction_method in _source_variants(
            Path(archive_root), relative
        ):
            source_items = 0
            for block in blocks:
                if len(block) > max_chars:
                    continue
                if require_numeric and not re.search(r"\d", block):
                    continue
                if not any(pattern.search(block) for pattern in patterns):
                    continue
                if any(pattern.search(block) for pattern in excludes):
                    continue
                if len(block) < min_chars:
                    continue
                key = (resolved_relative, block)
                if key in seen:
                    continue
                # "Resolución 6/2026" 과 "TEXTO ORIGINAL - Resolución 6 / 2026 - ..." 처럼
                # 같은 사실의 변형이 여러 번 잡힌다. 완전일치 비교로는 못 거른다.
                norm = _dedupe_key(block)
                if any(norm in kept or kept in norm for kept in kept_norms):
                    continue
                seen.add(key)
                kept_norms.append(norm)
                matched_sources.add(resolved_relative)
                row = {
                    "kind": "source_excerpt",
                    "source_path": resolved_relative,
                    "text": block,
                }
                if extraction_method == "pdftotext -layout":
                    row["extraction_method"] = extraction_method
                    used_layout_reextraction = True
                data.append(row)
                source_items += 1
                if len(data) >= max_items or source_items >= max_items_per_source:
                    break
            # Prefer the Markdown twin when it contains the configured evidence;
            # use PDF layout only when the twin is absent or lacks that evidence.
            if source_items:
                break
        if len(data) >= max_items:
            break

    if len(data) < min_items:
        raise ExtractionUnavailable(
            f"configured evidence below min_items={min_items}; extracted={len(data)}"
        )
    if len(matched_sources) < min_sources:
        raise ExtractionUnavailable(
            f"configured evidence below min_sources={min_sources}; matched={len(matched_sources)}"
        )

    basis_patch = {"metrics": config.get("metrics", list(spec.metrics))}
    basis_patch.update(config.get("basis", {}))
    methodology = (
        "위젯별 config 정규식으로 보관 Markdown/HTML의 원문 블록만 선택; "
        "수치 보간·번역·요약 없음"
    )
    if used_layout_reextraction:
        methodology = (
            "Markdown 쌍에서 표 근거를 얻지 못해 PDF를 pdftotext -layout으로 layout 재추출; "
            "archive_path는 원본 PDF를 유지하고 수치 보간·번역·요약 없음"
        )
    return {
        "chartType": config.get("chart_type", spec.chart_type),
        "data": data,
        "methodology": methodology,
        "basis": basis_patch,
    }


def extract_all_configured(
    archive_root: Path,
    specs: Iterable[WidgetSpec],
    config_dir: Path = DEFAULT_CONFIG_DIR,
    logger: logging.Logger | None = None,
) -> tuple[dict[str, dict], dict[str, str]]:
    logger = logger or logging.getLogger(__name__)
    patches: dict[str, dict] = {}
    failures: dict[str, str] = {}
    for spec in specs:
        if spec.extractor != "md_extract.py":
            continue
        config_path = Path(config_dir) / f"{spec.widget_id}.json"
        try:
            patches[spec.widget_id] = extract_configured_widget(
                Path(archive_root), spec, config_path
            )
        except Exception as exc:  # failure belongs to this widget only
            try:
                failure_config = json.loads(config_path.read_text(encoding="utf-8"))
            except Exception:
                failure_config = {}
            failures[spec.widget_id] = failure_config.get("empty_reason", str(exc))
            logger.info("%s downgraded to link card: %s", spec.widget_id, exc)
    return patches, failures
