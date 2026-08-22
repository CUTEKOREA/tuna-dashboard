#!/usr/bin/env python3
"""통합보고서(8_한국_오징어_산업_해부)의 수치를 squid_v5.json 에 F 섹션으로 얹는다.

빌더(`scripts.squid_build`)는 39개 위젯 계약을 고정하므로 건드리지 않는다.
빌드가 끝난 JSON 을 읽어 위젯 9개와 출처 5건을 덧붙이고, 같은 검증기(validate_squid_v5)를 통과해야만 쓴다.
원자료는 Drive 아카이브의 02_출처원본 에서만 읽는다 — /tmp 에 의존하면 재현이 안 된다.

    python3 scripts/squid_overlay_report.py --inout public/data/squid_v5.json
"""
from __future__ import annotations

import argparse, json, sys
from pathlib import Path

from scripts.validate_squid_v5 import validate

ARCHIVE = (Path.home() / "Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data"
           / "01_수산물(Seafood)/squid/8_한국_오징어_산업_해부/02_출처원본")
REL = "8_한국_오징어_산업_해부/02_출처원본"
RETRIEVED = "2026-08-22"

SOURCES = [
    {"source_id": "SQ-PROC-MFDS-C002", "publisher": "식품의약품안전처", "series": "품목제조보고·생산실적",
     "priority": "P0", "grade": "A", "frequency": "annual",
     "landing_url": "https://www.foodsafetykorea.go.kr/api/openApiInfo.do",
     "archive_subdir": REL, "latest_verified": "2025",
     "note": "원재료명에 오징어가 든 품목 12,394건 → 1순위 원재료(주원료) 5,435건·1,453곳. 생산량은 완제품 무게이지 오징어 투입량이 아니다"},
    {"source_id": "SQ-PRC-KAMIS", "publisher": "한국농수산식품유통공사", "series": "농수산물유통정보 월간 도매·소매",
     "priority": "P1", "grade": "A", "frequency": "monthly",
     "landing_url": "https://www.kamis.or.kr/customer/price/wholesale/period.do",
     "archive_subdir": REL, "latest_verified": "2026-08",
     "note": "도매 원/kg·소매 원/마리 — 단위가 달라 두 계열을 나누면 안 된다. 연평균은 KAMIS 공표 행을 쓴다(결측월 산술평균 금지)"},
    {"source_id": "SQ-PRC-MOF-AUCTION", "publisher": "해양수산부", "series": "수산물유통종합정보 오징어 위판 원장",
     "priority": "P0", "grade": "A", "frequency": "annual",
     "landing_url": "https://www.data.go.kr/data/15129432/fileData.do",
     "archive_subdir": REL, "latest_verified": "2025",
     "note": "687,625행·2021~2025. 위판중량 단위는 kg 으로 읽었으나 공식 정의 미확인. 매수자는 번호만 있고 실명 없음"},
    {"source_id": "SQ-REG-MFDS-IMPFOOD", "publisher": "식품의약품안전처", "series": "수입식품정보마루 수입신고 원장",
     "priority": "P0", "grade": "A", "frequency": "monthly",
     "landing_url": "https://impfood.mfds.go.kr/CFCCC01F01",
     "archive_subdir": REL, "latest_verified": "2026-07",
     "note": "2025-08~2026-07 신고명의 608(정규화 603). 건수만 있고 물량·금액은 없다 — 물량은 관세청 과세정보로 봉인(관세법 제116조)"},
    {"source_id": "SQ-TAR-KCS-RATE", "publisher": "관세청", "series": "관세법령정보포털 품목별 세율표·조정관세 규정",
     "priority": "P1", "grade": "A", "frequency": "annual",
     "landing_url": "https://unipass.customs.go.kr/clip/index.do",
     "archive_subdir": REL, "latest_verified": "2026",
     "note": "냉동오징어 22% 는 관세법 §69 조정관세. 기본세율 20%(2090)·10%(2010). 협정세율은 선택 적용 — 페루·칠레 0%"},
    {"source_id": "SQ-REG-MOF-TRACE", "publisher": "해양수산부", "series": "수입수산물 유통이력 관리에 관한 고시 제2026-60호",
     "priority": "P1", "grade": "A", "frequency": "irregular",
     "landing_url": "https://www.law.go.kr/행정규칙/수입수산물유통이력관리에관한고시",
     "archive_subdir": REL, "latest_verified": "2026-06-29",
     "note": "별표 26·27 냉동·냉장오징어 4개 코드 지정(~2029-04-30). 제2조 7호: 제조공장은 소매업자 → 신고의무 없음. 공표 규정 없음"},
    {"source_id": "SQ-FIN-DART", "publisher": "금융감독원", "series": "전자공시 사업보고서·감사보고서",
     "priority": "P1", "grade": "A", "frequency": "annual",
     "landing_url": "https://opendart.fss.or.kr/",
     "archive_subdir": REL, "latest_verified": "FY2025",
     "note": "가공 상위 100 중 18곳만 재무 공시. 동명 별개 법인 8건은 소재지·업종으로 걸렀다"},
]

SQUID4 = ["Todarodes pacificus", "Illex argentinus", "Dosidicus gigas", "Doryteuthis gahi"]

def basis(**kw):
    b = dict(species=SQUID4, taxon_scope="squid_only", weight_basis="product_weight",
             market_stage="n/a", aggregation="none", quota_semantics="n/a", metrics=["level"],
             claim_type="descriptive", currency="n/a", currency_converted=False, fx_date=None,
             nominal_real="nominal", published_at=RETRIEVED, retrieved_at=RETRIEVED,
             archive_path=f"{REL}/spine.json;{REL}/top100_final.json;{REL}/kamis_squid.json;{REL}/processing_summary.json;{REL}/auction_summary.json;{REL}/overlap_by_type.json",
             source_grade="A", restrictions=[], blocked_use=[])
    b.update(kw)
    return b

def load(name):
    p = ARCHIVE / name
    if not p.exists():
        sys.exit(f"아카이브에 없다: {p}")
    return json.loads(p.read_text(encoding="utf-8"))

def widgets():
    sp, km, top = load("spine.json"), load("kamis_squid.json"), load("top100_final.json")
    ps, au, ov = load("processing_summary.json"), load("auction_summary.json"), load("overlap_by_type.json")
    W = {}

    # F1 수입단가 연간 — 10자리 squid-only. 기존 B 위젯(HS6·갑오징어 포함)과 다른 축이라 따로 둔다.
    ytd = sp["monthly_2026"]; kg = sum(m["kg"] for m in ytd); usd = sum(m["usd"] for m in ytd)
    rows = [{"year": r["year"], "import_kg": r["squid_kg"], "import_usd": r["squid_usd"],
             "unit_price_usd_kg": round(r["unit_usd_per_kg"], 3)} for r in sp["annual"]]
    rows.append({"year": "2026 (1~5월)", "import_kg": kg, "import_usd": usd, "unit_price_usd_kg": round(usd / kg, 3)})
    W["F_import_unit_annual"] = dict(
        section="F", title="수입단가 연간 — 10자리 오징어만 (2020~2026 YTD)", chartType="line", data=rows,
        xAxis="year", series=["unit_price_usd_kg"], methodology="관세청 10자리 HSK 중 7번째 자리 2(오징어)만 합산. 0307.49는 분리불가라 제외",
        basis=basis(market_stage="import_unit", aggregation="sum_within_stage", currency="USD",
                    coverage_start="2020-01", coverage_end="2026-05", source_ids=["SQ-TRD-KCS"],
                    # G-013: 10자리에서 7번째 자리 2 만 합산했으므로 HS6 범위는 이 셋. 0307.49 는 분리불가라 제외
                    hs_codes=["030742", "030743", "160554"],
                    restrictions=["G-004"], blocked_use=["2026년 완결치로 표현", "HS6 위젯과 합산"]))

    # F2·F3 KAMIS — 도매(원/kg)와 소매(원/마리)를 분리. 연평균은 공표 행만.
    def annual(label):
        return [{"year": int(y), "krw": v} for y, v in sorted(km[label]["월별"].items()) if len(y) == 4]
    W["F_kamis_wholesale"] = dict(
        section="F", title="도매 물오징어 연평균 — 원/kg", chartType="line",
        data=[{**r, "series": "생선 中"} for r in annual("도매 물오징어 생선")]
             + [{**r, "series": "연근해 냉동"} for r in annual("도매 물오징어 연근해냉동")],
        xAxis="year", series=["krw"], methodology="KAMIS 월간 조회표의 「연평균」 행. 2026년은 조사 시점까지 부분연도. 연근해 냉동 계열은 2025-09 이 마지막 관측으로 이후 결측",
        basis=basis(species=["Todarodes pacificus"], market_stage="wholesale", aggregation="mean_within_stage",
                    currency="KRW", coverage_start="2023-01", coverage_end="2026-07", source_ids=["SQ-PRC-KAMIS"],
                    blocked_use=["소매(원/마리)와 나누어 마진 산출"]))
    W["F_kamis_retail"] = dict(
        section="F", title="소매 물오징어 연평균 — 원/마리", chartType="line",
        data=[{**r, "series": "연근해 신선냉장 大"} for r in annual("소매 물오징어 연근해신선냉장")]
             + [{**r, "series": "연근해 냉동"} for r in annual("소매 물오징어 연근해냉동")]
             + [{**r, "series": "원양 냉동"} for r in annual("소매 물오징어 원양냉동")],
        xAxis="year", series=["krw"], methodology="KAMIS 수산물 소매 월간 조회표의 「연평균」 행",
        basis=basis(species=["Todarodes pacificus", "Dosidicus gigas"], market_stage="consumer",
                    aggregation="mean_within_stage", currency="KRW", coverage_start="2023-01", coverage_end="2026-07",
                    source_ids=["SQ-PRC-KAMIS"], blocked_use=["도매(원/kg)와 나누어 마진 산출", "마리당 무게 가정"]))

    # F4 산지 위판
    W["F_auction_annual"] = dict(
        section="F", title="산지 위판 연간 — 중량·금액·단가 (2021~2025)", chartType="bar", data=au["annual"],
        xAxis="year", series=["weight_t", "unit_krw_per_kg"],
        methodology="위판 원장 전건 합산. 단가 = 금액÷중량(전 등급·전 상태 물량가중). 2025년 상태별: "
                    + " · ".join(f"{x['condition']} {x['unit_krw_per_kg']:,}원" for x in au["by_condition_2025"] if x["condition"] != "없음"),
        basis=basis(taxon_scope="incl_cuttlefish", market_stage="first_sale", aggregation="sum_within_stage",
                    currency="KRW", weight_basis="live_weight", coverage_start="2021-01", coverage_end="2025-12",
                    source_ids=["SQ-PRC-MOF-AUCTION"], taxon_note="원장 상품명 기준이라 갑오징어 포함 가능",
                    blocked_use=["위판중량 단위를 확정 사실로 표현", "매수번호를 실명과 연결"]))

    # F5·F6 가공 규모·지역
    W["F_processing_scale"] = dict(
        section="F", title="오징어 주원료 가공 — 업소·품목·생산량·가동률 (2020~2025)", chartType="bar", data=ps["scale"],
        xAxis="year", series=["production_t", "utilization_pct"],
        methodology="식약처 생산실적에서 오징어가 1순위 원재료인 품목만 합산. 생산능력은 품목별 신고 합이라 라인 공유 시 중복",
        basis=basis(taxon_scope="incl_cuttlefish", coverage_start="2020-01", coverage_end="2025-12",
                    source_ids=["SQ-PROC-MFDS-C002"], taxon_note="원재료명 「오징어」 문자열 기준이라 갑오징어 원료 포함 가능",
                    blocked_use=["생산량을 오징어 투입량·소비량으로 표현", "생산능력을 물리적 설비로 표현"]))
    W["F_processing_region"] = dict(
        section="F", title="2025년 시도별 가공 생산량·업소당 물량", chartType="bar", data=ps["region_2025"],
        xAxis="sido", series=["production_t", "per_site_t"], methodology="생산실적 SITE_ADDR 앞 두 글자로 시도 구분",
        basis=basis(taxon_scope="incl_cuttlefish", coverage_start="2025-01", coverage_end="2025-12",
                    source_ids=["SQ-PROC-MFDS-C002"], taxon_note="원재료명 「오징어」 문자열 기준"))

    # F7 상위 100 · F8 직수입 33
    keep = ["순위", "업체", "시도", "생산량_t", "점유율_%", "가동률_%", "수입겸업", "수입신고건", "HACCP품목수", "수출등록", "DART확인"]
    W["F_processing_top100"] = dict(
        section="F", title="2025년 오징어 가공 생산량 상위 100개사", chartType="table",
        data=[{k: t.get(k) for k in keep} for t in top], xAxis="순위", series=["생산량_t"],
        methodology="업소(인허가번호) 단위. 같은 회사의 공장이 둘이면 두 줄. 상위 100이 전국의 80.1%",
        basis=basis(taxon_scope="incl_cuttlefish", coverage_start="2025-01", coverage_end="2025-12",
                    source_ids=["SQ-PROC-MFDS-C002", "SQ-REG-MFDS-IMPFOOD", "SQ-FIN-DART"],
                    taxon_note="원재료명 「오징어」 문자열 기준", blocked_use=["점유율을 매출 점유율로 표현", "가동률 100%를 실적으로 표현(능력=생산 신고 11곳)"]))
    imp = [t for t in top if t.get("수입겸업") == "예"]
    ic = {r["순위"]: r for r in load("importers_country.json")["rows"]}
    for t in imp:
        r = ic.get(t["순위"], {}); t["주제조국"] = r.get("주제조국"); t["주제조국_비중_%"] = r.get("주제조국_비중_%")
    W["F_direct_importers"] = dict(
        section="F", title="직접 수입하는 가공사 33곳 — 신고건·유형·소재지", chartType="table",
        data=[{k: t.get(k) for k in ["순위", "업체", "시도", "생산량_t", "수입신고건", "수입유형", "주제조국", "주제조국_비중_%", "HACCP품목수", "수출등록_국가수"]} for t in imp],
        xAxis="순위", series=["수입신고건"],
        methodology="생산 상위 100 × 수입식품정보마루 신고명의(정규화) 교집합. 신고건은 2025-08~2026-07 창. 14곳이 강릉. 제조국은 33곳 합산 페루 83% — 원장 전체 35% 와 대비",
        basis=basis(taxon_scope="incl_cuttlefish", coverage_start="2025-08", coverage_end="2026-07",
                    source_ids=["SQ-PROC-MFDS-C002", "SQ-REG-MFDS-IMPFOOD"], taxon_note="원재료명 「오징어」 문자열 기준",
                    blocked_use=["신고건수를 수입 물량으로 표현"]))

    # F10 관세 실행세율 — 유통비용표의 22% 가 어디서 왔는지
    tr = load("tariff_rates.json")
    W["F_tariff_rates"] = dict(
        section="F", title="냉동오징어 관세 — 기본·조정·협정세율 (2025~2026)", chartType="table", data=tr["rows"],
        xAxis="hsk", series=["adjustment_pct", "fta_peru_pct"], methodology=tr["note"] + " 관세청 세율표 조회값 그대로.",
        basis=basis(market_stage="n/a", claim_type="legal", coverage_start="2025-01", coverage_end="2026-07",
                    source_ids=["SQ-TAR-KCS-RATE"], hs_codes=["030743"], currency="n/a",
                    blocked_use=["22% 를 평균 실행세율로 표현", "협정세율 적용률(원산지증명 제출 비율) 추정"]))

    # F11 품목유형별 생산액·국내판매액 — 오징어만의 값이 아니다
    ps2 = load("processing_sales.json")
    W["F_processing_sales"] = dict(
        section="F", title="가공식품 품목유형별 생산액·국내판매액 (천원, 2022~2025)", chartType="table", data=ps2["rows"],
        xAxis="year", series=["domestic_sales_krw_thousand"], methodology=ps2["note"],
        basis=basis(taxon_scope="incl_cuttlefish", market_stage="n/a", coverage_start="2022-01", coverage_end="2025-12",
                    source_ids=["SQ-PROC-MFDS-C002"], currency="KRW",
                    taxon_note="품목유형 단위(기타 수산물가공품·조미건어포·양념젓갈·건어포·조림류). 오징어 외 어종 포함",
                    blocked_use=["오징어 가공품 시장 규모로 표현", "업체별 매출로 분해"]))

    # F12 유통이력 고시가 덮는 범위
    cv = load("traceability_coverage.json")
    W["F_traceability_coverage"] = dict(
        section="F", title="유통이력 고시(2026-06-29)가 덮는 오징어 수입 — 금액 65.1% · 물량 77.3%", chartType="card",
        data=[{k: cv[k] for k in ("year", "covered_usd", "total_usd", "coverage_usd_pct", "covered_kg", "total_kg", "coverage_kg_pct")}],
        xAxis="year", series=["coverage_usd_pct"], methodology=cv["note"],
        basis=basis(market_stage="import_unit", aggregation="sum_within_stage", claim_type="legal", currency="USD",
                    coverage_start="2025-01", coverage_end="2025-12", source_ids=["SQ-REG-MOF-TRACE", "SQ-TRD-KCS"],
                    hs_codes=["030742", "030743", "160554"], blocked_use=["신고 의무를 공표·공개로 표현"]))

    # F13 산지 — 2025 어업별 위판·어선 집중도
    vg = load("vessel_gear_2025.json")
    sh = vg["share_top_n_pct"]
    W["F_vessel_gear_2025"] = dict(
        section="F", title="2025년 어업별 오징어 위판 — 저인망 27척이 채낚기 213척보다 많이 판다", chartType="table",
        data=vg["gear"], xAxis="어업", series=["중량_t", "금액_억"],
        methodology=f"{vg['source']}. 위판 어선 {vg['vessels']:,}척, 금액 점유 상위 10척 {sh['10']}% · 100척 {sh['100']}% · 500척 {sh['500']}%. {vg['note']}",
        basis=basis(market_stage="first_sale", aggregation="sum_within_stage", currency="KRW",
                    coverage_start="2025-01", coverage_end="2025-12", source_ids=["SQ-PRC-MOF-AUCTION"],
                    blocked_use=["어선 소유자·매수자 식별", "원장 단위(kg) 공식 정의로 표현"]))

    # F14 산지 — 2025 금액 상위 20척
    vt = load("vessel_top20_2025.json")
    W["F_vessel_top20_2025"] = dict(
        section="F", title="2025년 오징어 위판 금액 상위 20척 — 전부 쌍끌이 저인망", chartType="table",
        data=vt["top20"], xAxis="어선명", series=["금액_억"],
        methodology="어선번호 기준 합산. 어선명은 원장 공개 열이며 소유자·선원 정보는 수집하지 않는다. 1위 제11동일호 304t·28.7억.",
        basis=basis(market_stage="first_sale", aggregation="sum_within_stage", currency="KRW",
                    coverage_start="2025-01", coverage_end="2025-12", source_ids=["SQ-PRC-MOF-AUCTION"],
                    blocked_use=["어선 소유자 식별", "선단·선사 귀속 추정"]))

    # F15 산지 — 3개년 금액 합계 상위 50척
    v50 = load("vessel_top50_3yr.json")
    sh50 = v50["top50_share_of_year_value_pct"]
    W["F_vessel_top50_3yr"] = dict(
        section="F", title="오징어 위판 상위 50척 3개년 실적 (2023~2025, 금액 합계순)", chartType="table",
        data=v50["rows"], xAxis="어선명", series=["2023_억", "2024_억", "2025_억"],
        methodology=f"{v50['rank_basis']}. 상위 50척의 연도별 금액 점유 2023 {sh50['2023']}% · 2024 {sh50['2024']}% · 2025 {sh50['2025']}%. 어업 구성 저인망 25·채낚기 22·기타 3. {v50['note']}",
        basis=basis(market_stage="first_sale", aggregation="sum_within_stage", currency="KRW",
                    coverage_start="2023-01", coverage_end="2025-12", source_ids=["SQ-PRC-MOF-AUCTION"],
                    blocked_use=["어선 소유자 식별", "선단·선사 귀속 추정", "2024 급감을 개별 어선 사정으로 해석"]))

    # F9 수입명의 × 가공업 겹침
    W["F_overlap_by_type"] = dict(
        section="F", title="수입 유형별 가공업 보유 — 603 명의 중 117", chartType="bar", data=ov["by_type"],
        xAxis="import_type", series=["share_pct"],
        methodology=f"수입명의 {ov['total_importers']} 중 {ov['with_processing']}({ov['share_pct']}%)이 품목제조보고 보유. 상호 정규화 완전일치",
        basis=basis(taxon_scope="incl_cuttlefish", coverage_start="2025-08", coverage_end="2026-07",
                    source_ids=["SQ-REG-MFDS-IMPFOOD", "SQ-PROC-MFDS-C002"], taxon_note="원재료명·품목명 「오징어」 문자열 기준",
                    blocked_use=["80.6%를 상사 경유 비율로 단정"]))
    return W

def main() -> int:
    ap = argparse.ArgumentParser(); ap.add_argument("--inout", type=Path, required=True); a = ap.parse_args()
    doc = json.loads(a.inout.read_text(encoding="utf-8"))
    known = {s["source_id"] for s in doc["sources"]}
    doc["sources"] += [s for s in SOURCES if s["source_id"] not in known]
    W = widgets()
    doc["widgets"].update(W)
    errs = validate(doc)
    if errs:
        print("\n".join(errs), file=sys.stderr); return 1
    a.inout.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"F 섹션 {len(W)}개 위젯 · 출처 {len(doc['sources'])}건 · 검증 통과 → {a.inout}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
