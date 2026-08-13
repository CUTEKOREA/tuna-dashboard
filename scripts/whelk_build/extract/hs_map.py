"""Build the archived whelk HS6/HSK10 classification guide."""

from __future__ import annotations

import csv
from pathlib import Path

from ..spec import HS_MAP_PATH, KCS_XML_030781_PATH, KCS_YTD_PATH, WidgetSpec, load_config
from .kcs import csv_detail_rows, read_csv_rows, read_xml_rows, xml_detail_rows


STAGE_KO = {
    "030781": "활·신선·냉장 기타 연체동물(구 체계)",
    "030791": "활·신선·냉장 바다고둥 광의",
    "030792": "냉동 바다고둥 광의",
    "030799": "기타 처리 연체동물 광의",
    "160559": "기타 조제·보존 연체동물 광의",
}


def _read_matrix(path: Path) -> list[dict[str, str]]:
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def extract_hs_map(archive_root: Path, spec: WidgetSpec) -> dict:
    archive_root = Path(archive_root)
    config = load_config(spec.widget_id)
    matrix_rows = _read_matrix(archive_root / HS_MAP_PATH)
    matrix_codes = {row["hs6"] for row in matrix_rows}
    if matrix_codes != {"030791", "030792", "030799", "160559"}:
        raise ValueError(f"unexpected whelk HS matrix rows: {sorted(matrix_codes)}")

    ytd_rows = read_csv_rows(archive_root / KCS_YTD_PATH)
    hsk_by_hs6 = {
        hs6: sorted(
            {
                row["hsCd"]
                for row in csv_detail_rows(ytd_rows, hs_query=hs6)
                if row.get("hsCd")
            }
        )
        for hs6 in matrix_codes
    }
    legacy_rows = xml_detail_rows(read_xml_rows(archive_root / KCS_XML_030781_PATH))
    hsk_by_hs6["030781"] = sorted({row["hsCd"] for row in legacy_rows})

    missing = set(config["required_hs6"]) - set(hsk_by_hs6)
    if missing:
        raise ValueError(f"required whelk HS6 codes missing: {sorted(missing)}")

    ordered_codes = ["030781", "030791", "030792", "030799", "160559"]
    data = [
        {
            "hs6": hs6,
            "stage": STAGE_KO[hs6],
            "hsk10_observed": hsk_by_hs6[hs6],
            "scope": "광의 대리지표",
            "is_prepared_proxy": hs6 == config["broad_proxy_hs6"],
        }
        for hs6 in ordered_codes
    ]
    if any(not row["hsk10_observed"] for row in data):
        raise ValueError("each HS6 guide row must retain at least one observed HSK10 code")

    return {
        "chartType": spec.chart_type,
        "data": data,
        "xAxis": "hs6",
        "series": ["hsk10_observed"],
        "methodology": (
            "D7의 0307.91·0307.92·0307.99·1605.59 분류와 D4/D5에서 실제 관측된 "
            "HSK 10자리를 결합. 1605.59는 기타 조제·보존 연체동물의 광의 코드이며 "
            "골뱅이 100% 코드로 해석하지 않음"
        ),
        "basis": {
            "coverage_start": "2024",
            "coverage_end": "2026-05",
            "published_at": "2026-07-06",
            "retrieved_at": "2026-08-12",
            "metrics": ["coverage"],
        },
    }


__all__ = ["extract_hs_map"]
