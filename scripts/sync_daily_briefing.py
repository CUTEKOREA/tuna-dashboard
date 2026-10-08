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
from datetime import date, timedelta
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
    # em dash 금지 (2026-08-26 사용자 지시, scripts/fix_emdash.py 와 동일 규칙) —
    # 원문 게시판 HTML 에 든 — 가 대시보드로 유입되는 것을 소스에서 차단.
    return re.sub(r"\s+", " ", value.replace("\xa0", " ").replace("—", "-")).strip()


def normalize_style(value: str) -> str:
    return re.sub(r"\s+", "", value).lower()


def has_styles(block: HtmlBlock, *declarations: str) -> bool:
    style = normalize_style(block.style)
    return all(declaration in style for declaration in declarations)



WIDGET_SOURCE = Path(__file__).resolve().parent.parent / "lib" / "data" / "daily-briefing.ts"


def widget_number_token_pattern() -> "re.Pattern[str]":
    """「오늘의 수치」 위젯이 쓰는 수치 토큰 정규식을 TS 정본에서 읽어 온다.

    복사해 두면 갈라진다 — 배포 게이트가 위젯과 다른 기준으로 통과를 내주면
    화면은 비는데 파이프라인은 OK 를 찍는다. 정본은 daily-briefing.ts 하나다.
    """
    src = WIDGET_SOURCE.read_text(encoding="utf-8")
    m = re.search(r"const NUMBER_TOKEN_PATTERN\s*=\s*/(.+?)/;", src, re.S)
    if not m:
        raise BriefingSyncError(
            f"NUMBER_TOKEN_PATTERN 을 {WIDGET_SOURCE} 에서 찾지 못했습니다 — "
            "위젯 정규식이 옮겨졌는지 확인하십시오."
        )
    # JS 와 Python 에서 뜻이 같은 문법만 쓰고 있다(lookbehind·named group 없음).
    return re.compile(m.group(1))

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
    # 「숫자가 하나라도 있으면 통과」로는 게이트가 거짓말을 한다. 위젯은 단위가 붙은 토큰만
    # 뽑으므로 「SIAL 파리 2026」 같은 연도로 계약은 열리고 「오늘의 수치」는 빈 채 나간다
    # (9/28·9/29 실측). 그래서 위젯이 실제로 쓰는 정규식을 TS 에서 그대로 읽어 같은 기준으로 센다.
    token_pattern = widget_number_token_pattern()
    numeric_digest = [d for d in digest if token_pattern.search(d["title"])]
    if len(digest) < 2 or not numeric_digest:
        raise BriefingSyncError(
            "SIT 를 만들 수 없습니다 — 위젯이 뽑을 수 있는 수치 토큰(단위·통화 포함)이 든 "
            "다이제스트가 최소 1건, 전체 2건 이상 필요합니다."
        )

    # 2026-08-17: 지침 문장 없음은 실패가 아니다. 그날 기사가 전부 관측·보고형일 수 있다
    # (8/17 5건 전부 해당). TAK 은 데일리 브리핑 렌더 경로에 쓰이지 않으므로 차단하지 않고
    # 로그만 남긴다. 여기서 막으면 그날 회차 전체가 대시보드에 못 올라간다.
    if not has_directive:
        print("NOTE 실행 지침 문장 없음 — TAK 없이 진행(관측·보고형 기사만 있는 날)")

    return {
        "date": briefing_date,
        "digest": digest,
        "articles": articles,
    }


def iso_week_monday_friday(briefing_date: str) -> tuple[str, str]:
    parsed = date.fromisoformat(briefing_date)
    monday = parsed - timedelta(days=parsed.weekday())
    friday = monday + timedelta(days=4)
    return monday.isoformat(), friday.isoformat()


def should_include_in_weekly_file(briefing_date: str) -> bool:
    return date.fromisoformat(briefing_date).weekday() < 5


def load_weekly_briefing(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {"weekStart": "", "weekEnd": "", "days": []}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise BriefingSyncError(f"주간 브리핑 JSON을 읽지 못했습니다: {path}") from error
    if not isinstance(payload, dict):
        raise BriefingSyncError(f"주간 브리핑 JSON 루트가 객체가 아닙니다: {path}")
    days = payload.get("days", [])
    if not isinstance(days, list):
        raise BriefingSyncError(f"주간 브리핑 days가 배열이 아닙니다: {path}")
    return {
        "weekStart": payload.get("weekStart", ""),
        "weekEnd": payload.get("weekEnd", ""),
        "days": days,
    }


def upsert_weekly_day(weekly: dict[str, Any], day_briefing: dict[str, Any]) -> dict[str, Any]:
    briefing_date = day_briefing["date"]
    if not should_include_in_weekly_file(briefing_date):
        return weekly

    week_start, week_end = iso_week_monday_friday(briefing_date)
    if weekly.get("weekStart") != week_start:
        weekly = {"weekStart": week_start, "weekEnd": week_end, "days": []}
    else:
        weekly = {
            "weekStart": week_start,
            "weekEnd": week_end,
            "days": list(weekly.get("days", [])),
        }

    days: list[dict[str, Any]] = [
        day for day in weekly["days"] if day.get("date") != briefing_date
    ]
    days.append(day_briefing)
    days.sort(key=lambda day: day["date"])
    weekly["days"] = days
    weekly["weekStart"] = week_start
    weekly["weekEnd"] = week_end
    return weekly


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
    parser.add_argument(
        "--weekly-output",
        type=Path,
        help="주간 브리핑 JSON 경로 (기본값: 일간 출력과 같은 폴더)",
    )
    return parser


def weekly_output_path(args: argparse.Namespace) -> Path:
    return args.weekly_output or args.output.with_name("tuna_weekly_briefing.json")


def main(argv: Sequence[str] | None = None) -> int:
    args = build_argument_parser().parse_args(argv)
    try:
        source = args.input or discover_latest_briefing(args.source_dir)
        briefing = parse_briefing_html(source)
        write_json_atomically(args.output, briefing)
        weekly_path = weekly_output_path(args)
        weekly = load_weekly_briefing(weekly_path)
        weekly = upsert_weekly_day(weekly, briefing)
        if should_include_in_weekly_file(briefing["date"]):
            write_json_atomically(weekly_path, weekly)
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
