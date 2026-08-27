#!/usr/bin/env python3
"""Build gate for public/data/squid_v5.json.

Two layers:
  1. structural — JSON Schema (scripts/squid_v5.schema.json)
  2. measurement gates G-001..G-011 from the squid archive, plus local G-012/G-013
     (00_오징어_관련자료/00_운영/measurement_gate.csv)

Exit 0 = publishable. Non-zero = build must stop.

    python3 scripts/validate_squid_v5.py public/data/squid_v5.json
    python3 scripts/validate_squid_v5.py --self-test
"""

from __future__ import annotations

import json
import re
import sys
from datetime import date, datetime
from pathlib import Path

SCHEMA_PATH = Path(__file__).with_name("squid_v5.schema.json")

# G-001: the four species this dashboard is allowed to speak about, plus the
# explicit not-squid markers that force a taxon_scope downgrade.
TARGET_SPECIES = {
    "Todarodes pacificus",
    "Illex argentinus",
    "Dosidicus gigas",
    "Doryteuthis gahi",
    "Doryteuthis pealeii",
    "Loligo spp",
}
NON_SQUID_TAXA = {"Cephalopoda NEI", "Sepia spp"}

# G-013: HS-derived widgets must expose their actual HS6 scope. Only the
# squid/cuttlefish families are approved; octopus, shellfish, and other
# molluscs must never enter a squid denominator.
HS_BASED_SOURCE_IDS = {"SQ-TRD-KCS", "SQ-CLS-FAO-HS"}
APPROVED_SQUID_HS6 = {"030741", "030742", "030743", "030749", "160554"}

# G-002: phrases that assert a squid-only universe. Banned unless taxon_scope
# is squid_only.
SQUID_ONLY_PHRASES = ("오징어 시장", "오징어 총", "오징어 전체", "오징어 산업 규모", "squid market")

# G-005: metrics UN Comtrade legacy (7 reporters, 2021-2023, gaps) cannot carry.
COMTRADE_BANNED_METRICS = {"global_total", "share", "cagr"}

# G-007: a legal limit is not an outcome.
QUOTA_LIMIT_SEMANTICS = {"legal_limit", "allocation", "effort_limit"}
OUTCOME_METRICS = {"production", "inventory"}

# G-006/G-007: titles that turn a limit into available supply.
SUPPLY_CLAIM_PHRASES = ("조달가능", "조달 가능", "확보량", "공급량", "생산량", "가용물량")

# G-010: a C-grade source cannot settle law or market size on its own.
HARD_CLAIM_TYPES = {"legal", "market_size"}

GRADE_ORDER = {"A": 0, "B": 1, "C": 2}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MONTH_RE = re.compile(r"^\d{4}-\d{2}$")
YEAR_RE = re.compile(r"^\d{4}$")


class GateError(Exception):
    pass


# ── date helpers ────────────────────────────────────────────────────────────
def parse_edge(value: str, *, upper: bool) -> date:
    """Accept YYYY, YYYY-MM or YYYY-MM-DD. `upper` picks the end of the period."""
    if DATE_RE.match(value):
        y, m, d = (int(x) for x in value.split("-"))
        return date(y, m, d)
    if MONTH_RE.match(value):
        y, m = (int(x) for x in value.split("-"))
        return _month_end(y, m) if upper else date(y, m, 1)
    if YEAR_RE.match(value):
        y = int(value)
        return date(y, 12, 31) if upper else date(y, 1, 1)
    raise GateError(f"날짜 형식 불가: {value!r} (YYYY | YYYY-MM | YYYY-MM-DD)")


def _month_end(y: int, m: int) -> date:
    return date(y + 1, 1, 1) - _one_day() if m == 12 else date(y, m + 1, 1) - _one_day()


def _one_day():
    from datetime import timedelta

    return timedelta(days=1)


# ── structural layer ────────────────────────────────────────────────────────
def check_schema(doc: dict) -> list[str]:
    import jsonschema

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = jsonschema.Draft202012Validator(schema)
    out = []
    for err in sorted(validator.iter_errors(doc), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in err.path) or "(root)"
        out.append(f"[SCHEMA] {loc}: {err.message}")
    return out


# ── gate layer ──────────────────────────────────────────────────────────────
def check_gates(doc: dict) -> list[str]:
    errors: list[str] = []
    known_sources = {s["source_id"]: s for s in doc["sources"]}
    gate_ids = {g["gate_id"] for g in doc["gates"]}

    built_at_value = doc["meta"]["built_at"]
    try:
        built_at = datetime.fromisoformat(built_at_value.replace("Z", "+00:00"))
        if built_at.tzinfo is None or built_at.utcoffset() is None:
            raise ValueError("시간대 누락")
        built_on = built_at.date()
    except (AttributeError, TypeError, ValueError) as exc:
        errors.append(f"[G-012] meta.built_at 날짜 형식 불가: {built_at_value!r} ({exc})")
        built_on = None

    for gid in (f"G-{n:03d}" for n in range(1, 12)):
        if gid not in gate_ids:
            errors.append(f"[GATE] gates[] 에 {gid} 누락 — measurement_gate.csv 전량 적재 필요")

    if doc["meta"]["telemetry"] not in ("SYNCED", "STATIC"):
        errors.append("[L-09] meta.telemetry 는 SYNCED|STATIC 만 허용 (LIVE 금지)")

    # 형태 일치 — 원문 발췌 텍스트만 가진 위젯이 차트형을 선언하면 없는 차트를 있는 척하게 된다.
    TEXT_OK_CHARTS = {"card", "table", "checklist"}
    for wid, w in doc["widgets"].items():
        data = w.get("data")
        if (isinstance(data, list) and data
                and all(isinstance(r, dict) and r.get("kind") == "source_excerpt" for r in data)
                and w.get("chartType") not in TEXT_OK_CHARTS):
            errors.append(
                f"[{wid}] 형태 불일치: 원문 발췌 텍스트뿐인데 chartType={w.get('chartType')} — "
                f"{sorted(TEXT_OK_CHARTS)} 중 하나여야 한다"
            )

    for wid, w in doc["widgets"].items():
        b = w.get("basis")
        if not isinstance(b, dict):
            errors.append(f"[{wid}] basis 누락 — 근거 없는 숫자는 게시 불가")
            continue
        e = lambda msg: errors.append(f"[{wid}] {msg}")  # noqa: E731

        title = w.get("title", "")
        species = b.get("species", [])
        scope = b.get("taxon_scope")
        metrics = set(b.get("metrics", []))
        src_ids = b.get("source_ids", [])
        restrictions = set(b.get("restrictions", []))

        # G-001 어종
        unknown = [s for s in species if s not in TARGET_SPECIES | NON_SQUID_TAXA | {"n/a"}]
        if unknown:
            e(f"G-001 위반: 미승인 어종 {unknown}")
        if len(species) > 1 and "n/a" in species:
            e("G-001 위반: species 에 n/a 와 실제 어종 혼재")

        # G-002 두족류 혼재
        if scope != "squid_only":
            hit = [p for p in SQUID_ONLY_PHRASES if p in title]
            if hit:
                e(f"G-002 위반: taxon_scope={scope} 인데 squid-only 표현 {hit} 사용")
            if not b.get("taxon_note"):
                e(f"G-002 위반: taxon_scope={scope} 는 taxon_note 로 포함 범위 명시 필수")
        elif any(s in NON_SQUID_TAXA for s in species):
            e("G-002 위반: squid_only 인데 갑오징어/Cephalopods NEI 포함")

        # G-013 HS 품목 범위 — 직접 HS/KCS 근거를 쓰는 모든 위젯은 실제 사용한
        # HS6 목록을 남긴다. 목록을 넓히는 것만으로는 승인 범위를 우회할 수 없다.
        hs_codes = b.get("hs_codes", [])
        if set(src_ids) & HS_BASED_SOURCE_IDS and not hs_codes:
            e("G-013 위반: HS 기반 위젯은 basis.hs_codes 에 사용 HS6 목록 필수")
        if hs_codes:
            unapproved = sorted(set(hs_codes) - APPROVED_SQUID_HS6)
            if unapproved:
                e(f"G-013 위반: 승인 목록 밖 HS 코드 {unapproved}")
            if scope == "incl_cuttlefish":
                note = b.get("taxon_note", "")
                missing_from_note = [code for code in hs_codes if code not in note]
                if missing_from_note:
                    e(
                        "G-013 위반: taxon_note 에 포함 HS 코드 누락 "
                        f"{missing_from_note}"
                    )

        # G-003 중량 기준 — 위젯 1개당 기준 1개. 두 기준이 필요하면 위젯을 쪼갠다.
        if b.get("weight_basis") == "n/a" and metrics & {"level", "production"}:
            e("G-003 위반: 물량 지표인데 weight_basis=n/a "
              "(선박수·GT 등 어체 중량이 아닌 지표는 metrics=effort 로 선언할 것)")

        # G-004 KCS 관측 범위
        if "SQ-TRD-KCS" in src_ids:
            try:
                if parse_edge(b["coverage_end"], upper=True) >= date(2026, 1, 1) \
                        and "G-004" not in restrictions:
                    e("G-004 위반: KCS 2026 구간은 restrictions 에 'G-004' 표기 필수 "
                      "(실관측 2026-01~05)")
            except GateError as exc:
                e(str(exc))

        # G-005 Comtrade legacy
        if "SQ-TRD-COMTRADE" in src_ids:
            bad = metrics & COMTRADE_BANNED_METRICS
            if bad:
                e(f"G-005 위반: Comtrade legacy 로 {sorted(bad)} 산출 불가 "
                  "(7 reporter · 2021-2023 결측)")
            if "G-005" not in restrictions:
                e("G-005 위반: restrictions 에 'G-005' 표기 필수")

        # G-006 / G-007 쿼터 의미론
        qs = b.get("quota_semantics", "n/a")
        if "SQ-MGT-PRODUCE" in src_ids and qs == "n/a":
            e("G-006 위반: Peru pota 위젯은 quota_semantics 필수 "
              "(legal_limit|consumption|closure_notice)")
        if qs in QUOTA_LIMIT_SEMANTICS:
            bad = metrics & OUTCOME_METRICS
            if bad:
                e(f"G-007 위반: quota_semantics={qs} 인데 결과 지표 {sorted(bad)} 표기")
            hit = [p for p in SUPPLY_CLAIM_PHRASES if p in title]
            if hit:
                e(f"G-007 위반: 법정한도를 실적/조달가능량으로 표현 {hit}")

        # G-008 가격 거래단계
        if b.get("market_stage") != "n/a":
            if b.get("aggregation") in (None, "none"):
                pass
            elif b.get("aggregation") not in ("sum_within_stage", "mean_within_stage"):
                e("G-008 위반: 거래단계 교차 집계 금지 — aggregation 은 *_within_stage 만")
        if "spread" in metrics and b.get("market_stage") == "n/a":
            e("G-008 위반: spread 지표는 기준 거래단계 명시 필요")

        # G-009 통화·명목/실질
        cur = b.get("currency", "n/a")
        monetary = metrics & {"level", "spread", "index", "global_total"}
        if monetary and b.get("market_stage") != "n/a" and cur == "n/a":
            e("G-009 위반: 금액 지표인데 currency=n/a")
        if b.get("currency_converted") and not b.get("fx_date"):
            e("G-009 위반: 환산 지표는 fx_date 필수")

        # G-010 출처 등급
        missing = [s for s in src_ids if s not in known_sources]
        if missing:
            e(f"G-010 위반: sources[] 에 없는 source_id {missing}")
        else:
            worst = sorted((known_sources[s]["grade"] for s in src_ids),
                           key=lambda g: GRADE_ORDER[g])[-1]
            if b.get("source_grade") != worst:
                e(f"G-010 위반: source_grade={b.get('source_grade')} 이나 "
                  f"실제 최저 등급은 {worst}")
            if worst == "C" and b.get("claim_type") in HARD_CLAIM_TYPES:
                e(f"G-010 위반: C등급 단독으로 claim_type={b.get('claim_type')} 확정 불가 "
                  "(보조검증 출처 추가 또는 risk_screening 으로 강등)")

        # G-011 최신성
        try:
            cov_s = parse_edge(b["coverage_start"], upper=False)
            cov_e = parse_edge(b["coverage_end"], upper=True)
            pub = parse_edge(b["published_at"], upper=True)
            got = parse_edge(b["retrieved_at"], upper=True)
        except (GateError, KeyError) as exc:
            e(f"G-011 위반: {exc}")
        else:
            if cov_s > cov_e:
                e("G-011 위반: coverage_start > coverage_end")
            if cov_e > pub:
                e(f"G-011 위반: coverage_end({b['coverage_end']}) 가 "
                  f"published_at({b['published_at']}) 보다 미래")
            if pub > got:
                e(f"G-011 위반: published_at 이 retrieved_at 보다 미래")

            # G-012 빌드시각 상한. YYYY와 YYYY-MM은 parse_edge(..., upper=True)가
            # 각각 연말·월말로 펼치므로 아직 끝나지 않은 기간을 관측 완료로 못 낸다.
            if built_on is not None and cov_e > built_on:
                e(f"G-012 위반: coverage_end({b['coverage_end']}; 기간종료 {cov_e}) 가 "
                  f"meta.built_at({built_at_value}) 보다 미래")

        if not b.get("archive_path"):
            e("archive_path 누락 — 원문 추적 불가")

    return errors


def validate(doc: dict) -> list[str]:
    errors = check_schema(doc)
    if errors:
        return errors  # 구조가 깨지면 게이트 검사는 의미 없음
    return check_gates(doc)


# ── self-test ───────────────────────────────────────────────────────────────
def _minimal_doc() -> dict:
    return {
        "meta": {
            "built_at": "2026-08-13T09:00:00+09:00",
            "builder_version": "squid_build/1.0.0",
            "archive_snapshot": "00_오징어_관련자료 @ 2026-08-12",
            "gate_version": "measurement_gate 2026-08-12 + local G-012/G-013",
            "telemetry": "SYNCED",
        },
        "sources": [
            {"source_id": "SQ-PRC-KMI", "publisher": "KMI FishData", "priority": "P0",
             "grade": "B", "frequency": "weekly", "landing_url": "https://fishdata.kmi.re.kr/"},
            {"source_id": "SQ-TRD-COMTRADE", "publisher": "UNSD", "priority": "P1",
             "grade": "A", "frequency": "monthly_annual", "landing_url": "https://comtradeplus.un.org/"},
            {"source_id": "SQ-MGT-PRODUCE", "publisher": "PRODUCE Peru", "priority": "P0",
             "grade": "A", "frequency": "event_weekly", "landing_url": "https://www.gob.pe/produce"},
            {"source_id": "SQ-ESG-EJF", "publisher": "EJF", "priority": "P1",
             "grade": "C", "frequency": "event", "landing_url": "https://ejfoundation.org/"},
        ],
        "gates": [{"gate_id": f"G-{n:03d}", "subject": "s", "allowed_use": "a",
                   "blocked_use": "b"} for n in range(1, 12)],
        "monitoring": [],
        "widgets": {
            "B_kmi_consumer_price": {
                "section": "B",
                "title": "오징어 소비자가 — 원양 냉동 中 1마리",
                "chartType": "bar",
                "data": [{"label": "2026-08-11", "krw": 4926}],
                "basis": {
                    "species": ["Todarodes pacificus", "Dosidicus gigas"],
                    "taxon_scope": "squid_only",
                    "weight_basis": "product_weight",
                    "product_form": "frozen_whole",
                    "market_stage": "consumer",
                    "aggregation": "none",
                    "metrics": ["level"],
                    "claim_type": "operational",
                    "currency": "KRW",
                    "currency_converted": False,
                    "fx_date": None,
                    "nominal_real": "nominal",
                    "coverage_start": "2026-08-07",
                    "coverage_end": "2026-08-11",
                    "published_at": "2026-08-11",
                    "retrieved_at": "2026-08-12",
                    "source_ids": ["SQ-PRC-KMI"],
                    "source_grade": "B",
                    "archive_path": "04_가격·도매/20260812-KMI-FishData_Price_Trends.html",
                    "restrictions": [],
                    "blocked_use": ["다른 거래단계 가격과 평균"],
                },
            }
        },
    }


def _mutate(doc: dict, path: list, value) -> dict:
    import copy

    d = copy.deepcopy(doc)
    node = d
    for key in path[:-1]:
        node = node[key]
    node[path[-1]] = value
    return d


def self_test() -> None:
    base = _minimal_doc()
    assert validate(base) == [], validate(base)

    W = ["widgets", "B_kmi_consumer_price"]
    B = W + ["basis"]

    def fails(doc, marker):
        errs = validate(doc)
        assert any(marker in x for x in errs), f"{marker} 미검출 — 실제: {errs}"

    # G-001 미승인 어종
    fails(_mutate(base, B + ["species"], ["Octopus vulgaris"]), "SCHEMA")

    # G-002 squid_only 아닌데 총계 표현
    d = _mutate(base, B + ["taxon_scope"], "incl_cuttlefish")
    d = _mutate(d, W + ["title"], "오징어 시장 규모")
    fails(d, "G-002")

    # G-002 taxon_note 누락
    fails(_mutate(base, B + ["taxon_scope"], "cephalopods_nei"), "G-002")

    # G-004 KCS 2026 구간인데 제한 미표기
    d = _mutate(base, B + ["source_ids"], ["SQ-TRD-KCS"])
    d["sources"].append({"source_id": "SQ-TRD-KCS", "publisher": "KCS", "priority": "P0",
                         "grade": "A", "frequency": "monthly", "landing_url": "https://unipass.customs.go.kr/"})
    d = _mutate(d, B + ["source_grade"], "A")
    d = _mutate(d, B + ["coverage_end"], "2026-05")
    fails(d, "G-004")

    # G-005 Comtrade 로 점유율 산출
    d = _mutate(base, B + ["source_ids"], ["SQ-TRD-COMTRADE"])
    d = _mutate(d, B + ["source_grade"], "A")
    d = _mutate(d, B + ["metrics"], ["share"])
    fails(d, "G-005")

    # G-006 Peru 인데 quota_semantics 없음
    d = _mutate(base, B + ["source_ids"], ["SQ-MGT-PRODUCE"])
    d = _mutate(d, B + ["source_grade"], "A")
    fails(d, "G-006")

    # G-007 법정한도를 조달가능량으로
    d = _mutate(base, B + ["quota_semantics"], "legal_limit")
    d = _mutate(d, W + ["title"], "페루 pota 조달가능 물량")
    fails(d, "G-007")

    # G-009 환산인데 fx_date 없음
    fails(_mutate(base, B + ["currency_converted"], True), "G-009")

    # G-010 등급 불일치
    fails(_mutate(base, B + ["source_grade"], "A"), "G-010")

    # G-010 C등급 단독 법규 확정
    d = _mutate(base, B + ["source_ids"], ["SQ-ESG-EJF"])
    d = _mutate(d, B + ["source_grade"], "C")
    d = _mutate(d, B + ["claim_type"], "legal")
    fails(d, "G-010")

    # G-011 관측종료가 발간일보다 미래
    fails(_mutate(base, B + ["coverage_end"], "2026-09-30"), "G-011")

    # G-012 월 단위 관측종료를 월말로 펼치면 빌드일보다 미래
    d = _mutate(base, B + ["coverage_end"], "2026-08")
    d = _mutate(d, B + ["published_at"], "2026-08")
    d = _mutate(d, B + ["retrieved_at"], "2026-08")
    fails(d, "G-012")

    # G-012 정확한 일자가 빌드일과 같으면 정상
    d = _mutate(base, B + ["coverage_end"], "2026-08-13")
    d = _mutate(d, B + ["published_at"], "2026-08-13")
    d = _mutate(d, B + ["retrieved_at"], "2026-08-13")
    assert validate(d) == [], validate(d)

    # G-013 HS 기반 위젯에 승인 밖의 문어 코드가 섞이면 차단
    d = _mutate(base, B + ["source_ids"], ["SQ-TRD-KCS"])
    d["sources"].append({"source_id": "SQ-TRD-KCS", "publisher": "KCS", "priority": "P0",
                         "grade": "A", "frequency": "monthly", "landing_url": "https://unipass.customs.go.kr/"})
    d = _mutate(d, B + ["source_grade"], "A")
    d = _mutate(d, B + ["taxon_scope"], "incl_cuttlefish")
    d = _mutate(d, B + ["taxon_note"], "포함 HS: 030742·030743·030749·160554")
    d = _mutate(d, B + ["coverage_start"], "2024")
    d = _mutate(d, B + ["coverage_end"], "2024")
    d = _mutate(d, B + ["published_at"], "2024")
    d = _mutate(d, B + ["hs_codes"], ["030742", "030743", "030749", "160554", "160555"])
    fails(d, "G-013")

    # G-013 HS 근거를 쓰면서 목록 자체를 누락해도 차단
    d_missing = _mutate(d, B + ["hs_codes"], ["030742", "030743", "030749", "160554"])
    del d_missing["widgets"]["B_kmi_consumer_price"]["basis"]["hs_codes"]
    fails(d_missing, "G-013")

    # G-013 승인 HS만 명시한 같은 위젯은 정상
    d = _mutate(d, B + ["hs_codes"], ["030742", "030743", "030749", "160554"])
    assert validate(d) == [], validate(d)

    # L-09 LIVE 라벨
    fails(_mutate(base, ["meta", "telemetry"], "LIVE"), "SCHEMA")

    # basis 자체 누락
    d = _mutate(base, W, {"section": "B", "title": "x", "chartType": "bar", "data": []})
    fails(d, "SCHEMA")

    # 형태 불일치 — 원문 발췌뿐인데 차트형 선언
    excerpt = [{"kind": "source_excerpt", "source_path": "x.md", "text": "..."}]
    d = _mutate(base, W + ["data"], excerpt)
    fails(_mutate(d, W + ["chartType"], "line"), "형태 불일치")
    # 같은 데이터라도 card/table/checklist 는 정직한 표현이므로 통과해야 한다
    assert validate(_mutate(d, W + ["chartType"], "card")) == []

    print("self-test OK — 20 케이스 통과")


def main(argv: list[str]) -> int:
    if "--self-test" in argv:
        self_test()
        return 0
    if len(argv) < 2:
        print(__doc__)
        return 2
    path = Path(argv[1])
    doc = json.loads(path.read_text(encoding="utf-8"))
    errors = validate(doc)
    if errors:
        print(f"✗ {path} — {len(errors)}건 위반\n")
        for line in errors:
            print("  " + line)
        return 1
    print(f"✓ {path} — 위젯 {len(doc['widgets'])}개, 게이트 위반 0")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
