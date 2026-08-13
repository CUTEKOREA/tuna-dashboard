"""Extract the squid quote table from the FAO European Fish Price Report."""

from __future__ import annotations

import re
from pathlib import Path

from ..spec import WidgetSpec


_PRICE_PAIR = re.compile(r"(?P<eur>\d+\.\d{2})\s+(?P<usd>\d+\.\d{2})")
_INCOTERM = re.compile(r"\b(CIF|FOB|CPT|CFR)\b")
_TRADE_NAME = "Squid/Encornet/Calamar"
_FIRST_SCIENTIFIC_NAME = "Loligo spp."


def _source_path(archive_root: Path, spec: WidgetSpec) -> tuple[Path, str]:
    relative = next(
        path
        for path in spec.archive_paths
        if path.endswith("20260700-FAO-European_Fish_Price_Report_July_2026.md")
    )
    return Path(archive_root) / relative, relative


def _split_reference_origin(line: str) -> tuple[str | None, str | None]:
    tail = line[102:].rstrip()
    if not tail.strip():
        return None, None
    first_character = 102 + len(tail) - len(tail.lstrip())
    parts = re.split(r"\s{2,}", tail.strip(), maxsplit=1)
    if len(parts) == 2:
        return parts[0], parts[1]
    if first_character >= 122:
        return None, parts[0]
    return parts[0], None


def _reference_fields(value: str) -> tuple[str | None, str | None]:
    match = _INCOTERM.search(value)
    incoterm = match.group(1) if match else None
    reference_area = _INCOTERM.sub("", value).strip() or None
    return reference_area, incoterm


def parse_eu_squid_quotes(text: str) -> list[dict]:
    """Parse every generic Squid, Loligo and Illex quote before Doryteuthis."""
    lines = text.split("\n")
    header_index = next(
        index
        for index, line in enumerate(lines)
        if "Fish Species" in line and "Price per kg" in line
        and any("EUR" in follow and "USD" in follow for follow in lines[index + 1:index + 3])
    )
    start_index = next(
        index for index in range(header_index, len(lines)) if _TRADE_NAME in lines[index]
    )

    rows: list[dict] = []
    scientific_name: str | None = None
    product_form: str | None = None
    reference_area: str | None = None
    incoterm: str | None = None
    origin: str | None = None

    for index in range(start_index, len(lines)):
        line = lines[index]
        species_cell = line[:32].strip()
        if species_cell.startswith("Doryteuthis"):
            break

        new_species = False
        if species_cell == _TRADE_NAME:
            scientific_name = _FIRST_SCIENTIFIC_NAME
        elif species_cell.startswith(("Loligo ", "Illex ")):
            if not (species_cell.startswith("Loligo spp") and scientific_name == _FIRST_SCIENTIFIC_NAME):
                new_species = True
            scientific_name = species_cell
            if species_cell.startswith("Loligo spp"):
                scientific_name = _FIRST_SCIENTIFIC_NAME

        if new_species:
            reference_area = None
            incoterm = None
            origin = None

        price_match = _PRICE_PAIR.search(line)
        if not price_match:
            continue

        product_cell = line[32:60].strip()
        if product_cell:
            product_form = product_cell
        size_grade = line[60:price_match.start()].strip() or None

        after_prices = line[price_match.end():102]
        trend_match = re.search(r"[+\-=]", after_prices)
        trend = trend_match.group(0) if trend_match else None
        raw_reference, raw_origin = _split_reference_origin(line)

        if raw_reference:
            parsed_reference, parsed_incoterm = _reference_fields(raw_reference)
            if parsed_reference and parsed_reference.startswith("(") and reference_area:
                prior_reference = reference_area
                reference_area = f"{reference_area} {parsed_reference}"
                for prior in reversed(rows):
                    if prior["scientific_name"] != scientific_name:
                        break
                    if prior["reference_area"] == prior_reference:
                        prior["reference_area"] = reference_area
                        if parsed_incoterm:
                            prior["incoterm"] = parsed_incoterm
                        break
            elif parsed_reference:
                reference_area = parsed_reference
            elif parsed_incoterm and reference_area:
                for prior in reversed(rows):
                    if prior["scientific_name"] != scientific_name:
                        break
                    if (
                        prior["reference_area"] == reference_area
                        and prior["incoterm"] is None
                    ):
                        prior["incoterm"] = parsed_incoterm
                        break
            if parsed_incoterm or parsed_reference:
                incoterm = parsed_incoterm

        if raw_origin:
            if raw_origin.startswith("(") and origin:
                prior_origin = origin
                origin = f"{origin} {raw_origin}"
                for prior in reversed(rows):
                    if prior["scientific_name"] != scientific_name:
                        break
                    if prior["origin"] == prior_origin:
                        prior["origin"] = origin
                        break
            else:
                origin = raw_origin

        if scientific_name is None:
            raise ValueError(f"EFPR quote at line {index + 1} has no scientific name")
        rows.append(
            {
                "scientific_name": scientific_name,
                "product_form": product_form,
                "size_grade": size_grade,
                "price_eur_per_kg": float(price_match.group("eur")),
                "price_usd_per_kg": float(price_match.group("usd")),
                "trend": trend,
                "reference_area": reference_area,
                "incoterm": incoterm,
                "origin": origin,
                "source_line": index + 1,
            }
        )

    if len(rows) != 49:
        raise ValueError(f"expected 49 EFPR Squid/Loligo/Illex quotes; got {len(rows)}")
    return rows


def extract_eu_market_prices(archive_root: Path, spec: WidgetSpec) -> dict:
    source_path, _relative = _source_path(archive_root, spec)
    rows = parse_eu_squid_quotes(source_path.read_text(encoding="utf-8", errors="replace"))
    return {
        "chartType": "table",
        "data": rows,
        "series": ["price_eur_per_kg", "price_usd_per_kg"],
        "unit": "EUR/kg·USD/kg",
        "methodology": (
            "FAO 원문 표 머리글의 Price per kg 두 열(EUR/kg·USD/kg)을 그대로 구조화; "
            "통화 환산·행간 가격 보간 없음"
        ),
        "basis": {"metrics": list(spec.metrics)},
    }


def extract_species_price_ladder(archive_root: Path, spec: WidgetSpec) -> dict:
    source_path, _relative = _source_path(archive_root, spec)
    quotes = parse_eu_squid_quotes(source_path.read_text(encoding="utf-8", errors="replace"))
    sized_quotes = [row for row in quotes if row["size_grade"]]
    if len(sized_quotes) != 44:
        raise ValueError(f"expected 44 EFPR species-size quotes; got {len(sized_quotes)}")
    ordered = sorted(
        sized_quotes,
        key=lambda row: (
            -row["price_eur_per_kg"],
            row["scientific_name"],
            row["size_grade"] or "",
            row["source_line"],
        ),
    )
    data = [
        {**row, "rank": rank, "market_stage": "import_unit"}
        for rank, row in enumerate(ordered, start=1)
    ]
    return {
        "chartType": "bar",
        "data": data,
        "series": ["price_eur_per_kg", "price_usd_per_kg"],
        "unit": "EUR/kg·USD/kg",
        "methodology": (
            "FAO 거래가격 중 규격이 명시된 44행을 단일 import_unit 단계 안에서 "
            "EUR/kg 내림차순으로 정렬; 다른 거래단계와 비교·평균하지 않음"
        ),
        "basis": {"metrics": list(spec.metrics), "market_stage": "import_unit"},
    }
