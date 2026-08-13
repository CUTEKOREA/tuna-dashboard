"""Whelk source registry, measurement gates, and monitoring contract."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path

from .spec import WidgetSpec


@dataclass(frozen=True)
class GovernanceBundle:
    sources: list[dict]
    gates: list[dict]
    monitoring: list[dict]

    @property
    def sources_by_id(self) -> dict[str, dict]:
        return {row["source_id"]: row for row in self.sources}

    @property
    def gates_by_id(self) -> dict[str, dict]:
        return {row["gate_id"]: row for row in self.gates}


SOURCES = [
    {
        "source_id": "WH-PROD-FAO-FISHSTAT",
        "publisher": "FAO",
        "series": "FishStat capture/aquaculture/global production 2026.1.0",
        "priority": "P0",
        "grade": "A",
        "frequency": "annual",
        "landing_url": "https://www.fao.org/fishery/en/statistics/software/fishstatj",
        "archive_subdir": "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06",
        "latest_verified": "2024",
        "note": "어획·양식·글로벌 생산 및 28종 코드표를 분리 보존",
    },
    {
        "source_id": "WH-TRADE-KCS",
        "publisher": "관세청",
        "series": "nitemtrade HS 무역통계",
        "priority": "P0",
        "grade": "A",
        "frequency": "monthly",
        "landing_url": "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList",
        "archive_subdir": "10_원본데이터셋/KCS_trade;11_분석·가공데이터/KCS_trade",
        "latest_verified": "2026-05",
        "note": "2026년은 1~5월 상세행만 사용하며 총계행을 제외",
    },
    {
        "source_id": "WH-TRADE-KMI-FTA",
        "publisher": "KMI",
        "series": "FTA 체결국 수산물 수입동향",
        "priority": "P1",
        "grade": "A",
        "frequency": "quarterly",
        "landing_url": "https://www.kmi.re.kr/",
        "archive_subdir": "11_분석·가공데이터/KMI_FTA_imports",
        "latest_verified": "2026Q1",
        "note": "보관 JSON의 2021Q4~2026Q1 분기 추출 결과",
    },
    {
        "source_id": "WH-REG-DEFRA-FMP",
        "publisher": "Defra",
        "series": "Whelk Fisheries Management Plan",
        "priority": "P1",
        "grade": "B",
        "frequency": "event",
        "landing_url": (
            "https://www.gov.uk/government/publications/"
            "whelk-fisheries-management-plan-fmp-for-english-waters"
        ),
        "archive_subdir": "repo:docs/2026_whelk_industry_sources.md#1",
        "latest_verified": "2025",
        "note": "영국 허가제와 장기 지속가능 관리의 규제 맥락",
    },
    {
        "source_id": "WH-REG-DSIFCA",
        "publisher": "D&S IFCA",
        "series": "MCRS 규정",
        "priority": "P1",
        "grade": "B",
        "frequency": "event",
        "landing_url": (
            "https://www.devonandsevernifca.gov.uk/environment-research/research/"
            "molluscan-research-in-ds-ifcas-district/whelks/"
        ),
        "archive_subdir": "repo:docs/2026_whelk_industry_sources.md#2",
        "latest_verified": "2025",
        "note": "지역 최소보존크기 규정과 이해관계자 평가",
    },
    {
        "source_id": "WH-REG-DFO-CA",
        "publisher": "DFO Canada",
        "series": "Whelk IFMP / Quota Report",
        "priority": "P1",
        "grade": "B",
        "frequency": "annual_event",
        "landing_url": (
            "https://www.dfo-mpo.gc.ca/fisheries-peches/ifmp-gmp/"
            "whelk-buccin/2025/index-eng.html"
        ),
        "archive_subdir": "repo:docs/2026_whelk_industry_sources.md#7-8",
        "latest_verified": "2025",
        "note": "캐나다 통합어업관리계획과 쿼터 보고서",
    },
]


GATES = [
    {
        "gate_id": "G-001",
        "subject": "어종",
        "allowed_use": "Buccinum / Rapana 구분 표기",
        "blocked_use": "둘을 단일 '골뱅이'로 합산해 양식 가능 여부 단정",
        "evidence_path": (
            "11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/"
            "FishStat_2026.1.0_species_codes_whelk.csv"
        ),
    },
    {
        "gate_id": "G-002",
        "subject": "기간",
        "allowed_use": "2026년은 1~5월 월별 원계열로만 표시",
        "blocked_use": "2026 YTD 연환산·전년 대비 증감률 산출",
        "evidence_path": (
            "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
            "KCS_2026YTD_HS_whelk.csv"
        ),
    },
    {
        "gate_id": "G-005",
        "subject": "기간 정합",
        "allowed_use": (
            "부분연도 자료는 같은 월 구간끼리만 점유율·단가를 비교 "
            "(2026년 1~5월 ↔ 2024년 1~5월)"
        ),
        "blocked_use": (
            "연간 집계와 부분연도 누적을 직접 맞대어 점유율 변화·구조 전환을 주장. "
            "2024년 1~5월은 연간 수입액의 35.8%뿐이라 영국 점유율이 "
            "연간 52.1% vs 동월 34.6%로 갈려 결론이 뒤집힌다"
        ),
        "evidence_path": (
            "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2024.xml;"
            "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
            "KCS_2026YTD_HS_whelk.csv"
        ),
    },
    {
        "gate_id": "G-003",
        "subject": "HS 범위",
        "allowed_use": "1605.59를 조제 골뱅이 대리지표로 사용하되 '광의' 명시",
        "blocked_use": "1605.59 = 골뱅이 100%라고 서술",
        "evidence_path": (
            "11_분석·가공데이터/trade_classification/updates/2026-07-06/"
            "HS_matrix_whelk.csv"
        ),
    },
    {
        "gate_id": "G-006",
        "subject": "분류 정합",
        "allowed_use": (
            "원산지 점유율·단가·구조변화는 HSK8 바구니(16055910·16055920·16055990) "
            "안에서만 비교하고, HS6(1605.59)은 바구니 합계 규모를 보일 때만 사용"
        ),
        "blocked_use": (
            "HS6 1605.59 잔여호를 합산한 분모로 원산지 점유율·구조 전환을 서술. "
            "2026년 1~5월 기준 16055910은 -8.8%인데 16055990은 -69.5%로 붕괴해, "
            "합산 분모에서는 영국 점유율이 34.6%→47.2%로 '상승'하지만 같은 바구니 "
            "안에서는 영국+아일랜드가 97.30%→75.78%로 오히려 분산된다. "
            "바구니를 섞은 원산지 단가 비교(중국 16055910 $4.58 vs 16055990 $7.68)도 동일 금지"
        ),
        "evidence_path": (
            "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2024.xml;"
            "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
            "KCS_2026YTD_HS_whelk.csv"
        ),
    },
    {
        "gate_id": "G-004",
        "subject": "단가 표본",
        "allowed_use": "기간 물량이 하한 이상인 원산지만 단가 순위·비교에 사용",
        "blocked_use": "표본 미달 원산지를 단가 사다리 순위나 최고·최저 단가 서술에 포함",
        "evidence_path": (
            "10_원본데이터셋/KCS_trade/2023_2024/kcs_HS160559_2024.xml;"
            "11_분석·가공데이터/KCS_trade/updates/2026-07-06/"
            "KCS_2026YTD_HS_whelk.csv"
        ),
    },
]


def _monitoring_rows() -> list[dict]:
    schedules = {
        "WH-PROD-FAO-FISHSTAT": "공식 연간 릴리스 발표 시",
        "WH-TRADE-KCS": "매월 둘째 주",
        "WH-TRADE-KMI-FTA": "분기 종료 후 4~8주",
        "WH-REG-DEFRA-FMP": "공식 계획 개정 시",
        "WH-REG-DSIFCA": "지역 규정·평가 갱신 시",
        "WH-REG-DFO-CA": "연간 계획·쿼터 갱신 시",
    }
    return [
        {
            "source_id": source["source_id"],
            "series": source["series"],
            "frequency": source["frequency"],
            "latest_verified": source["latest_verified"],
            "next_check": schedules[source["source_id"]],
            "status": "scheduled",
        }
        for source in SOURCES
    ]


def load_governance(
    archive_root: Path,
    specs: list[WidgetSpec],
    built_on: date,
) -> GovernanceBundle:
    del built_on  # The registry carries source dates; build time must not rewrite them.
    archive_root = Path(archive_root)
    if not archive_root.is_dir():
        raise FileNotFoundError(f"whelk archive root not found: {archive_root}")

    source_ids = {source["source_id"] for source in SOURCES}
    cited = {source_id for spec in specs for source_id in spec.source_ids}
    missing = cited - source_ids
    if missing:
        raise ValueError(f"source registry is missing widget citations: {sorted(missing)}")

    gate_ids = {gate["gate_id"] for gate in GATES}
    if gate_ids != {"G-001", "G-002", "G-003", "G-004", "G-005", "G-006"}:
        raise ValueError(f"whelk governance must register G-001..G-006: {gate_ids}")

    return GovernanceBundle(
        sources=[dict(row) for row in SOURCES],
        gates=[dict(row) for row in GATES],
        monitoring=_monitoring_rows(),
    )


__all__ = ["GovernanceBundle", "load_governance"]
