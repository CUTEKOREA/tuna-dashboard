"""Structured extractors for official Markdown tables used by squid v5."""

from __future__ import annotations

import re
from pathlib import Path

from ..spec import WidgetSpec


def _single_markdown(archive_root: Path, spec: WidgetSpec) -> tuple[Path, str]:
    relative = next(path for path in spec.archive_paths if path.lower().endswith(".md"))
    return Path(archive_root) / relative, relative


def extract_korea_tac_coverage(archive_root: Path, spec: WidgetSpec) -> dict:
    source_path, _relative = _single_markdown(archive_root, spec)
    text = source_path.read_text(encoding="utf-8", errors="replace")
    normalized_lines = [" ".join(line.split()) for line in text.splitlines()]
    expected = (
        ("민어", "대형트롤", 2),
        ("살오징어", "서남해구외끌이중형저인망", 2),
        ("전 어종", "정치망", 1),
    )
    data = []
    for species, fishery, stage in expected:
        species_pattern = re.escape(species).replace(r"\ ", r"\s*")
        pattern = re.compile(
            rf"{species_pattern}\s+{re.escape(fishery)}\s+{stage}단계"
        )
        if not any(pattern.search(line) for line in normalized_lines):
            raise ValueError(
                f"MOF TAC coverage table row missing: {species}/{fishery}/{stage}단계"
            )
        data.append(
            {
                "species": species,
                "applicable_fishery": fishery,
                "application_stage": stage,
            }
        )

    return {
        "chartType": "table",
        "data": data,
        "methodology": (
            "해양수산부 보도자료의 어종·적용업종·적용단계 표 3행을 구조화; "
            "문서에 없는 살오징어 배분 톤수는 생성하지 않음"
        ),
        "basis": {
            "metrics": ["coverage"],
            "weight_basis": "n/a",
            "quota_semantics": "n/a",
            "coverage_start": "2026-06-30",
            "coverage_end": "2026-06-30",
            "published_at": "2026-06-30",
            "retrieved_at": "2026-08-12",
        },
    }


def extract_sprfmo_effort(archive_root: Path, spec: WidgetSpec) -> dict:
    source_path, _relative = _single_markdown(archive_root, spec)
    lines = source_path.read_text(encoding="utf-8", errors="replace").splitlines()
    header_index = next(
        index
        for index, line in enumerate(lines)
        if "Member" in line
        and "Vessel Limit Number" in line
        and "Vessel Total Gross Tonnage (GT)" in line
    )
    table_lines = lines[header_index:header_index + 6]
    rows = []
    member_pattern = re.compile(
        r"^\s*(China|Korea|Chinese Taipei)\s+([0-9,]+)\s+([0-9,]+)\s*$"
    )
    total_pattern = re.compile(
        r"^\s*Total number of vessels and gross\s+([0-9,]+)\s+([0-9,]+)\s*$"
    )
    for line in table_lines:
        match = member_pattern.match(line)
        if match:
            member = match.group(1)
            vessel_limit, gross_tonnage = match.group(2), match.group(3)
        else:
            match = total_pattern.match(line)
            if not match:
                continue
            member = "Total"
            vessel_limit, gross_tonnage = match.group(1), match.group(2)
        if member is None:
            continue
        rows.append(
            {
                "member": member,
                "vessel_limit": int(vessel_limit.replace(",", "")),
                "gross_tonnage_gt": int(gross_tonnage.replace(",", "")),
            }
        )
    if [row["member"] for row in rows] != ["China", "Korea", "Chinese Taipei", "Total"]:
        raise ValueError(f"SPRFMO effort table is incomplete: {rows}")
    return {
        "chartType": "bar",
        "data": rows,
        "source_excerpt": "\n".join(line.rstrip() for line in table_lines).strip(),
        "series": ["vessel_limit", "gross_tonnage_gt"],
        "unit": "척·GT",
        "methodology": (
            "SPRFMO CMM 18-2026 표 1의 회원별 선박수 상한과 총톤수(GT)를 정수로 구조화; "
            "TAC 또는 실제 조업척수로 해석하지 않음"
        ),
        "basis": {"metrics": list(spec.metrics)},
    }
