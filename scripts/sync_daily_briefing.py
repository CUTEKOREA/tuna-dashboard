#!/usr/bin/env python3
"""Extract the newest desktop tuna briefing into a small dashboard JSON file."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass, field
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Sequence


FILENAME_PATTERN = re.compile(
    r"^참치뉴스_게시판용_(?P<date>\d{4}-\d{2}-\d{2})\.html$"
)
BLOCK_TAGS = {"div", "td"}
MIN_DIGEST_ITEMS = 3
MIN_ARTICLES = 3


class BriefingSyncError(RuntimeError):
    """Raised when the source cannot satisfy the briefing data contract."""


@dataclass(frozen=True)
class HtmlBlock:
    tag: str
    style: str
    text: str


@dataclass
class OpenBlock:
    tag: str
    style: str
    text_parts: list[str] = field(default_factory=list)


class LegacyBriefingParser(HTMLParser):
    """Collect styled block text from the table/div markup used by groupware."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[HtmlBlock] = []
        self._open_blocks: list[OpenBlock] = []

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        if tag not in BLOCK_TAGS:
            return
        attributes = dict(attrs)
        self._open_blocks.append(
            OpenBlock(tag=tag, style=attributes.get("style") or "")
        )

    def handle_data(self, data: str) -> None:
        for block in self._open_blocks:
            block.text_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag not in BLOCK_TAGS:
            return
        for index in range(len(self._open_blocks) - 1, -1, -1):
            if self._open_blocks[index].tag != tag:
                continue
            block = self._open_blocks.pop(index)
            text = normalize_text("".join(block.text_parts))
            if text:
                self.blocks.append(HtmlBlock(tag=tag, style=block.style, text=text))
            return


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def normalize_style(value: str) -> str:
    return re.sub(r"\s+", "", value).lower()


def has_styles(block: HtmlBlock, *declarations: str) -> bool:
    style = normalize_style(block.style)
    return all(declaration in style for declaration in declarations)


def is_digest_title(block: HtmlBlock) -> bool:
    return block.tag == "td" and has_styles(
        block,
        "font-size:14px",
        "font-weight:bold",
        "line-height:1.5",
    )


def is_article_title(block: HtmlBlock) -> bool:
    return block.tag == "div" and has_styles(
        block,
        "font-size:24px",
        "font-weight:bold",
    )


def is_english_title(block: HtmlBlock) -> bool:
    return block.tag == "div" and has_styles(
        block,
        "font-family:georgia",
        "font-style:italic",
        "font-size:14px",
    )


def is_article_paragraph(block: HtmlBlock) -> bool:
    if block.tag != "div":
        return False
    return has_styles(block, "font-size:15.5px") or has_styles(
        block,
        "font-size:16px",
        "font-weight:bold",
    )


def filename_date(path: Path) -> str:
    match = FILENAME_PATTERN.fullmatch(path.name)
    if not match:
        raise BriefingSyncError(
            f"입력 파일명이 참치뉴스_게시판용_YYYY-MM-DD.html 형식이 아닙니다: {path.name}"
        )
    raw_date = match.group("date")
    try:
        date.fromisoformat(raw_date)
    except ValueError as error:
        raise BriefingSyncError(f"입력 파일 날짜가 유효하지 않습니다: {raw_date}") from error
    return raw_date


def discover_latest_briefing(source_directory: Path) -> Path:
    if not source_directory.is_dir():
        raise BriefingSyncError(f"입력 폴더를 찾을 수 없습니다: {source_directory}")

    candidates: list[tuple[str, Path]] = []
    for path in source_directory.glob("참치뉴스_게시판용_*.html"):
        try:
            candidates.append((filename_date(path), path))
        except BriefingSyncError:
            continue

    if not candidates:
        raise BriefingSyncError(
            f"참치뉴스_게시판용_YYYY-MM-DD.html 파일이 없습니다: {source_directory}"
        )
    return max(candidates, key=lambda candidate: candidate[0])[1]


def parse_briefing_html(source: Path) -> dict[str, Any]:
    if not source.is_file():
        raise BriefingSyncError(f"입력 파일을 찾을 수 없습니다: {source}")

    briefing_date = filename_date(source)
    parser = LegacyBriefingParser()
    try:
        parser.feed(source.read_text(encoding="utf-8"))
        parser.close()
    except (OSError, UnicodeError) as error:
        raise BriefingSyncError(f"HTML을 UTF-8로 읽지 못했습니다: {source}") from error

    digest = [
        {"title": block.text}
        for block in parser.blocks
        if is_digest_title(block)
    ]

    articles: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for block in parser.blocks:
        if is_article_title(block):
            if current is not None:
                articles.append(current)
            current = {"titleKo": block.text, "paragraphs": []}
            continue
        if current is None:
            continue
        if is_english_title(block) and "titleEn" not in current:
            current["titleEn"] = block.text
            continue
        if is_article_paragraph(block):
            current["paragraphs"].append(block.text)

    if current is not None:
        articles.append(current)

    if len(digest) < MIN_DIGEST_ITEMS:
        raise BriefingSyncError(
            f"오늘의 헤드라인을 {MIN_DIGEST_ITEMS}건 이상 찾지 못했습니다: {len(digest)}건"
        )
    if len(articles) < MIN_ARTICLES:
        raise BriefingSyncError(
            f"상세 기사를 {MIN_ARTICLES}건 이상 찾지 못했습니다: {len(articles)}건"
        )

    for index, article in enumerate(articles, start=1):
        if not article["titleKo"]:
            raise BriefingSyncError(f"상세 기사 {index}의 한글 제목이 비어 있습니다.")
        if not article["paragraphs"]:
            raise BriefingSyncError(f"상세 기사 {index}의 본문 문단이 비어 있습니다.")

    # TAK 사전 검증 — lib/data/daily-briefing.ts 의 DIRECTIVE_PATTERN 과 동일 기준.
    # 렌더 시점 throw(첫화면 파손)를 막기 위해 나쁜 JSON 은 여기서 생성 자체를 거부한다.
    directive_pattern = re.compile(r"(촉구했다|권고했다|요구했다|제안했다|주문했다|요청했다|경고했다|해야 한다|필요가 있다)[.!?]?\s*$")
    has_directive = any(
        directive_pattern.search(sentence.strip())
        for article in articles
        for paragraph in article["paragraphs"]
        for sentence in re.split(r"(?<=[.!?])\s+", paragraph)
    )
    numeric_digest = [d for d in digest if re.search(r"\d", d["title"])]
    if len(digest) < 2 or not numeric_digest:
        raise BriefingSyncError(
            "SIT 를 만들 수 없습니다 — 숫자가 포함된 다이제스트가 최소 1건, 전체 2건 이상 필요합니다."
        )

    if not has_directive:
        raise BriefingSyncError(
            "기사 본문에서 실행 지침 문장(촉구했다/권고했다/요구했다)을 찾지 못했습니다. "
            "TakeawayBox TAK 을 만들 수 없어 JSON 생성을 중단합니다."
        )

    return {
        "date": briefing_date,
        "digest": digest,
        "articles": articles,
    }


def write_json_atomically(output: Path, payload: dict[str, Any]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=output.parent,
            prefix=f".{output.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary_file:
            temporary_path = Path(temporary_file.name)
            temporary_file.write(serialized)
            temporary_file.flush()
            os.fsync(temporary_file.fileno())
        os.replace(temporary_path, output)
    except OSError:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
        raise


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="최신 사내 게시판용 참치 뉴스 HTML을 대시보드 JSON으로 동기화합니다."
    )
    source_group = parser.add_mutually_exclusive_group()
    source_group.add_argument("--input", type=Path, help="단일 HTML 입력 파일")
    source_group.add_argument(
        "--source-dir",
        type=Path,
        default=Path.home() / "Desktop",
        help="최신 파일을 찾을 폴더 (기본값: ~/Desktop)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1]
        / "public/data/tuna_daily_briefing.json",
        help="출력 JSON 경로",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_argument_parser().parse_args(argv)
    try:
        source = args.input or discover_latest_briefing(args.source_dir)
        briefing = parse_briefing_html(source)
        write_json_atomically(args.output, briefing)
    except (BriefingSyncError, OSError) as error:
        print(f"브리핑 동기화 실패: {error}", file=sys.stderr)
        return 1

    print(
        "브리핑 동기화 완료: "
        f"{source} -> {args.output} "
        f"(헤드라인 {len(briefing['digest'])}건, 기사 {len(briefing['articles'])}건)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
