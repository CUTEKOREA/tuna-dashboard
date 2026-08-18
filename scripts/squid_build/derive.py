"""Derive four widgets strictly from already extracted widget outputs."""

from __future__ import annotations

import re
from datetime import date
from typing import Iterable

from .spec import WidgetSpec, specs_by_id


_EXACT_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _has_data(widget: dict) -> bool:
    data = widget.get("data")
    return bool(data)


def _peru_reason(closure, research) -> str:
    """페루 사유 문자열.

    조사·탐사 인가를 상업 재개로 읽히게 쓰면 조달 판단이 뒤집힌다. 인가 사실은
    알리되 상업 재개가 아니라는 것을 같은 문장에 박는다.
    """
    if not closure:
        return "중단·재개 공지 미확정"
    if not research:
        return "PRODUCE 중단공지 확인"
    windows = " · ".join(
        f"{w['kind']} {w['start'][5:]}~{w['end'][5:]}" for w in research["windows"]
    )
    return (
        f"PRODUCE 중단공지 유효. {research['date'][5:]} 조사·탐사 인가({windows}, "
        f"최대 {research['vessel_limit']}척 ≤{research['hold_capacity_m3_max']}㎥)가 있으나 "
        "상업 재개 공문은 아님"
    )


def _state_evidence(archive_path: str, derivation: str, evidence_type: str) -> dict:
    return {
        "archive_path": archive_path,
        "derivation": derivation,
        "evidence_type": evidence_type,
    }


def _sourcing_signal(document: dict, spec: WidgetSpec, built_on: date) -> dict:
    widgets = document["widgets"]
    peru = widgets["A_peru_pota_timeline"]
    chile = widgets["A_chile_jibia_quota"]
    falkland = widgets["A_falkland_loligo_season"]
    korea = widgets["A_korea_tac"]

    peru_closure = next(
        (
            event
            for event in peru.get("data", [])
            if event.get("quota_semantics") == "closure_notice"
        ),
        None,
    )
    # RM00269(2026-08-17) 조사·탐사 인가. 중단 상태를 바꾸지는 않지만 기준일은 앞당긴다 —
    # 3주 묵은 기준일을 그대로 두면 그 사이 아무 일도 없었던 것처럼 보인다.
    peru_research = next(
        (
            event
            for event in peru.get("data", [])
            if event.get("quota_semantics") == "effort_limit" and event.get("windows")
        ),
        None,
    )

    chile_data = chile.get("data", {}) if _has_data(chile) else {}
    chile_active = bool(chile_data.get("recorded_capture_tonnes", 0) > 0)
    chile_remaining = chile_data.get("quota_minus_recorded_capture_tonnes")

    falkland_schedule = next(
        (
            row
            for row in falkland.get("data", [])
            if "2nd season (X licence), 64 days from late July" in row.get("text", "")
        ),
        None,
    )
    falkland_full_season = next(
        (
            row
            for row in falkland.get("data", [])
            if "premise of full seasons in 2026" in row.get("text", "")
        ),
        None,
    )
    # "Late July" is not an exact opening date. August is inside the common
    # overlap of a 64-day season under every late-July interpretation, so the
    # builder can classify 2026-08-13 without manufacturing a start date.
    falkland_in_unambiguous_window = built_on.year == 2026 and built_on.month == 8
    falkland_scheduled = bool(
        falkland_schedule and falkland_full_season and falkland_in_unambiguous_window
    )

    peru_path = peru_closure.get("source_path") if peru_closure else peru["basis"]["archive_path"]
    chile_path = chile_data.get("numerator_source", chile["basis"]["archive_path"])
    falkland_path = (
        falkland_schedule.get("source_path")
        if falkland_schedule
        else next(
            (
                path
                for path in falkland["basis"]["archive_path"].split(";")
                if path.endswith("20251212-FIFD-Licensing_Advice_2026.md")
            ),
            falkland["basis"]["archive_path"],
        )
    )
    argentina_evidence_names = (
        "20260812-ARG-CTMFM_Resolution_2_2026.html",
        "20260812-ARG-Resolution_6_2026.html",
    )
    argentina_evidence_paths = [
        path
        for expected_name in argentina_evidence_names
        for path in spec.archive_paths
        if path.endswith(expected_name)
    ]
    if len(argentina_evidence_paths) != len(argentina_evidence_names):
        raise ValueError(
            "A_sourcing_signal_board must cite both Argentina 2026 legal texts"
        )
    data = [
        {
            "origin": "페루 pota",
            "status": "중단·제한" if peru_closure else "데이터공백",
            "as_of": (
                peru_research["date"] if peru_research
                else peru_closure["date"] if peru_closure
                else None
            ),
            "evidence_widget": "A_peru_pota_timeline",
            "reason": _peru_reason(peru_closure, peru_research),
            "state_evidence": _state_evidence(
                peru_path,
                "observed_closure_notice" if peru_closure else "unsupported_notice_gap",
                "observed_notice" if peru_closure else "data_gap",
            ),
        },
        {
            "origin": "칠레 jibia",
            "status": "조업중" if chile_active else "데이터공백",
            "as_of": chile_data.get("as_of"),
            "evidence_widget": "A_chile_jibia_quota",
            # as_of 는 카드가 이미 따로 찍는다. 여기서 되풀이하면 날짜가 두 번 나온다.
            # 잔여 톤수는 조달 판단용이므로 소수점을 버린다 — 0.2449톤은 의미가 없다.
            "reason": (
                f"누적 포획이 증가 중이며 잔여 {round(chile_remaining):,}톤"
                if chile_active and chile_remaining is not None
                else "SERNAPESCA 누적 포획 자료 미확인"
            ),
            "state_evidence": _state_evidence(
                chile_path,
                "observed_capture_accrual" if chile_active else "unsupported_capture_gap",
                "observed_report" if chile_active else "data_gap",
            ),
        },
        {
            "origin": "포클랜드 Loligo",
            "status": "어기중" if falkland_scheduled else "데이터공백",
            "as_of": built_on.isoformat() if falkland_scheduled else None,
            "evidence_widget": "A_falkland_loligo_season",
            # as_of 는 카드가 따로 찍으므로 문장에서 뺀다. 대신 이 상태가 관측이 아니라
            # 공개 일정에서 유추한 것이라는 사실은 반드시 남긴다 — 같은 문서가 2024년엔
            # 2차 어기가 열리지 않았다고 기록한다.
            "reason": (
                "공개 어기 일정(2기: 7월 말부터 64일) 기준이며 2026 개장 공지 확인은 아님"
                if falkland_scheduled
                else "공개 일정 또는 full-season 전제를 현재 빌드일에 적용할 수 없음"
            ),
            "state_evidence": _state_evidence(
                falkland_path,
                "published_schedule_window" if falkland_scheduled else "unsupported_schedule_gap",
                "schedule_derived" if falkland_scheduled else "data_gap",
            ),
        },
        {
            "origin": "아르헨티나 Illex",
            "status": "어기외",
            "as_of": "2026-05-28",
            "evidence_widget": "A_argentina_illex_gap",
            "reason": (
                "후속 법령의 과거형 언급으로 어기 종료를 확인했으나 "
                "2026 주간공보 부재로 어획 실적은 미확인"
            ),
            "state_evidence": _state_evidence(
                ";".join(argentina_evidence_paths),
                "subsequent_law_past_tense",
                "legal_text_derived",
            ),
        },
        {
            "origin": "한국 살오징어",
            "status": "데이터공백",
            "as_of": korea["basis"]["coverage_end"] if _has_data(korea) else None,
            "evidence_widget": "A_korea_tac",
            "reason": "TAC 적용 업종·단계 표는 현재 조업 상태를 확인하지 않음",
            "state_evidence": _state_evidence(
                korea["basis"]["archive_path"],
                "coverage_table_not_operating_status",
                "data_gap",
            ),
        },
    ]
    return {
        "chartType": spec.chart_type,
        "data": data,
        "methodology": (
            "공식 중단공지는 관측 상태, SERNAPESCA 누적 포획은 관측보고 기반 활동, "
            "FIFD 어기중은 공개 일정 기반 파생, 아르헨티나 어기외는 후속 법령의 "
            "과거형 언급 기반 파생으로 분리하고 근거 유형을 행마다 표시"
        ),
        "basis": {
            "weight_basis": "n/a",
            "metrics": ["coverage"],
            "quota_semantics": "closure_notice",
            "coverage_start": "2026-05-28",
            "coverage_end": "2026-08-12",
            "published_at": "2026-08-12",
            "retrieved_at": "2026-08-12",
        },
    }


def _stage_board(document: dict, spec: WidgetSpec) -> dict:
    widgets = document["widgets"]
    kmi = widgets["B_kmi_consumer_price"]
    efpr = widgets["B_eu_market_prices"]
    kcs = widgets["B_kcs_import_unit_price"]

    kmi_observations = kmi.get("data", {}).get("observations", []) if _has_data(kmi) else []
    kcs_rows = kcs.get("data", []) if _has_data(kcs) else []
    data = [
        {
            "market_stage": "consumer",
            "label": "한국 소비자가",
            "available": bool(kmi_observations),
            "value": kmi_observations[-1]["price_krw"] if kmi_observations else None,
            "unit": "원/마리",
            "currency": "KRW",
            "weight_basis": "product_weight",
            "coverage_end": kmi["basis"]["coverage_end"],
            "source_widget": "B_kmi_consumer_price",
        },
        {
            "market_stage": "import_unit",
            "label": "EU 거래가격",
            "available": _has_data(efpr),
            "value": None,
            "unit": "EUR/kg·USD/kg",
            "currency": "EUR·USD",
            "weight_basis": "product_weight",
            "coverage_end": efpr["basis"]["coverage_end"],
            "source_widget": "B_eu_market_prices",
        },
        {
            "market_stage": "import_unit",
            "label": "한국 수입단가",
            "available": bool(kcs_rows),
            "value": kcs_rows[-1]["unit_price_usd_mt"] if kcs_rows else None,
            "unit": "USD/톤",
            "currency": "USD",
            "weight_basis": "net_weight",
            "coverage_end": kcs["basis"]["coverage_end"],
            "source_widget": "B_kcs_import_unit_price",
        },
    ]
    return {
        "chartType": spec.chart_type,
        "data": data,
        "methodology": "서로 다른 거래단계·통화·중량기준을 행 단위로 분리하며 평균·환산·스프레드를 계산하지 않음",
        "basis": {
            "weight_basis": "n/a",
            "market_stage": "n/a",
            "metrics": ["coverage"],
            "currency": "n/a",
            "nominal_real": "n/a",
            "coverage_start": "2026-01",
            "coverage_end": "2026-08-11",
            "published_at": "2026-08-12",
            "retrieved_at": "2026-08-12",
            "hs_codes": list(kcs["basis"]["hs_codes"]),
        },
    }


def _landed_cost(document: dict, spec: WidgetSpec) -> dict:
    # "2026-08 기준"은 월 전체 관측이 아니라 수기 정책 상수의 효력월이다.
    # 월말(08-31)까지 관측했다고 확장하지 않도록 효력월 첫날로 점 표기한다.
    hs_map_basis = document["widgets"]["C_hs_classification_map"]["basis"]
    return {
        "chartType": "card",
        "data": [],
        "methodology": (
            "KCS 수입단가와 HS 분류는 확보했으나 MAN-TARIFF-KR에 수치 관세율이 없고 "
            "환율은 사용자 입력이므로 랜딩코스트 계산값을 생성하지 않음"
        ),
        "basis": {
            "metrics": ["coverage"],
            "claim_type": "operational",
            "coverage_start": "2026-01",
            "coverage_end": "2026-08-01",
            "published_at": "2026-08-12",
            "retrieved_at": "2026-08-12",
            "hs_codes": list(hs_map_basis["hs_codes"]),
            "taxon_note": hs_map_basis["taxon_note"],
        },
    }


def _freshness_board(document: dict, spec: WidgetSpec, built_on: date) -> dict:
    source_widgets = (
        ("KMI 소비자가", "B_kmi_consumer_price"),
        ("FAO 유럽 거래가격", "B_eu_market_prices"),
        ("KCS 수입단가", "B_kcs_import_unit_price"),
    )
    data = []
    for label, widget_id in source_widgets:
        widget = document["widgets"][widget_id]
        coverage_end = widget["basis"]["coverage_end"]
        age_days = None
        if _EXACT_DATE.match(coverage_end):
            age_days = (built_on - date.fromisoformat(coverage_end)).days
        if not _has_data(widget):
            status = "데이터없음"
        elif age_days is None:
            status = "기준일정밀도부족"
        elif age_days > 365:
            status = "경고"
        elif age_days > 90:
            status = "주의"
        else:
            status = "정상"
        data.append(
            {
                "indicator": label,
                "source_widget": widget_id,
                "coverage_end": coverage_end,
                "age_days": age_days,
                "available": _has_data(widget),
                "status": status,
            }
        )
    return {
        "chartType": spec.chart_type,
        "data": data,
        "methodology": "정확한 일자(YYYY-MM-DD)만 경과일을 계산하고 월·연도 기준은 정밀도 부족으로 유지",
        "basis": {
            "weight_basis": "n/a",
            "market_stage": "n/a",
            "metrics": ["coverage"],
            "currency": "n/a",
            "nominal_real": "n/a",
            "coverage_start": "2026-05",
            "coverage_end": "2026-08-11",
            "published_at": "2026-08-12",
            "retrieved_at": "2026-08-12",
            "hs_codes": list(
                document["widgets"]["B_kcs_import_unit_price"]["basis"]["hs_codes"]
            ),
        },
    }


def derive_widgets(
    document: dict,
    specs: Iterable[WidgetSpec],
    built_on: date | None = None,
) -> dict[str, dict]:
    by_id = specs_by_id(specs)
    if built_on is None:
        built_on = date.fromisoformat(document["meta"]["built_at"][:10])
    return {
        "A_sourcing_signal_board": _sourcing_signal(
            document, by_id["A_sourcing_signal_board"], built_on
        ),
        "B_stage_separated_prices": _stage_board(
            document, by_id["B_stage_separated_prices"]
        ),
        "B_landed_cost_calc": _landed_cost(
            document, by_id["B_landed_cost_calc"]
        ),
        "B_price_freshness_board": _freshness_board(
            document, by_id["B_price_freshness_board"], built_on
        ),
    }
