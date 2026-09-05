#!/usr/bin/env python3
"""한국 참치 산업 해부 집계 — 축은 **잡아서 남에게 파는 생선**이다.

명태는 「잡지 않고 먹는 생선」이었다. 참치는 반대다. 연근해에는 없고(FAO 7종 기준) 원양 선단
132척이 남의 바다에서 잡아 바다 위에서 판다. 그래서 축은
  1. **원양 선단** — 선망 27척·연승 105척, 다섯 회사와 열네 회사
  2. **환적·수출 척추** — 항내 환적 269,800톤, 냉동 참치 수출 199,711톤(태국 53.7%·대만 0)
  3. **판매 상대** — FCF(신라교역 매출의 4할)·타이유니온·볼튼·이토추·스타키스트·COSMO
  4. **국내 캔과 수입** — 캔 80,374톤(브랜드≠공장), 수입은 참다랑어·자숙 로인·PB 캔
이고, 값(방콕 가다랑어)과 재무(DART 10사)가 그 뒤를 받는다.

⚠ 이 품목의 함정 넷
  1. **「참치」 문자열은 세 사슬을 섞는다.** 0303.4x 통마리 / 0304.87 필레 / 1604.14 조제품. 합치지 않는다.
  2. **회사별 표와 업종별 표는 연도가 다를 수 있다.** 2025년 실적(211,513)을 2024년으로 읽는 사고가 있었다.
  3. **WCPFC 협약수역 어획(276,640)과 전 해역(288,742)은 다른 수다.** 환적 분모는 협약수역.
  4. **식약처 수입신고는 건수다.** 물량이 아니다. 관세청 톤과 섞지 않는다.

입력은 보고서 「한국 참치 산업 해부」 02_출처원본(Drive). 없으면 작업 폴더(/tmp/kr_tuna/src)로 폴백.
사용법:
    python3 scripts/build_tuna_anatomy_data.py
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

DRIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/01_보고서/8_한국_참치_산업_해부/02_출처원본"
)
LOCAL = Path("/tmp/kr_tuna/src")
OUT = Path(__file__).resolve().parent.parent / "public/data/tuna_anatomy_v1.json"
MIN_EXPECTED_YEAR = 2024


def src(name: str) -> Path:
    for p in (DRIVE / name, LOCAL / name):
        if p.exists():
            return p
    raise FileNotFoundError(name)


def load(name: str):
    return json.load(open(src(name), encoding="utf-8"))


def world_catch():
    d = load("fao_tuna_capture.json")
    rows = [{"연도": y, "세계": d["world"][str(y)], "한국": d["korea"][str(y)], "점유": round(100 * d["korea"][str(y)] / d["world"][str(y)], 2)} for y in range(1970, 2025)]
    names = {"Indonesia": "인도네시아", "Ecuador": "에콰도르", "Japan": "일본", "Taiwan Province of China": "대만", "Republic of Korea": "한국",
             "Papua New Guinea": "파푸아뉴기니", "Kiribati": "키리바시", "Spain": "스페인", "Philippines": "필리핀", "Micronesia (Federated States of)": "미크로네시아연방", "Mexico": "멕시코", "Panama": "파나마"}
    total = d["world"]["2024"]
    countries = [{"국가": names.get(c, c), "어획량": v, "비중": round(100 * v / total, 1)} for c, v in d["rank_latest"][:12]]
    sp = {k[5:]: v for k, v in d["korea_species"].items() if k.startswith("2024")}
    return {
        "_meta": {"출처": "FAO FishStat Capture_Quantity 2026.1.0, 7종(가다랑어·황다랑어·눈다랑어·날개다랑어·대서양·태평양·남방참다랑어) 생물중량", "기준연도": 2024,
                  "세계합계": total, "한국": d["korea"]["2024"], "한국비중": round(100 * d["korea"]["2024"] / total, 2), "한국순위": 5, "한국정점": {"연도": 2019, "어획": d["korea"]["2019"]},
                  "주의": "한국 태평양참다랑어는 FAO 표에 2010년 이후 0, 2023년부터 미보고. 연근해 분은 이 수치에 없다"},
        "시계열": rows,
        "국가": countries,
        "한국어종2024": {"가다랑어": sp.get("SKJ"), "황다랑어": sp.get("YFT"), "눈다랑어": sp.get("BET"), "날개다랑어": sp.get("ALB"), "남방참다랑어": sp.get("SBF"), "대서양참다랑어": sp.get("BFT")},
        "한국해역2024": {k: v for k, v in d["korea_area_latest"].items()},
    }


def korea_production():
    d = load("ofis_tuna_species_year.json")
    gear = {}
    for r in d["gear_totals"]:
        g = gear.setdefault(r["year"], {"연도": r["year"]})
        g["선망" if r["gear"] == "참치선망" else "연승"] = r["production_t"]
        g[("선망" if r["gear"] == "참치선망" else "연승") + "금액"] = r["production_value_million_krw"]
    for r in d["species_totals"]:
        if r["year"] >= 2019 and r["species"] in ("가다랑어", "황다랑어", "눈다랑어"):
            gear.setdefault(r["year"], {"연도": r["year"]})[r["species"]] = r["production_t"]
    m = load("ofis_tuna_monthly_2025_2026.json")
    b24 = m["_meta"]["2024_cumulative_from_2025_12_bulletin"]
    gear[2025] = {"연도": 2025, "선망": 211367, "연승": 39696, "비고": "원양어업 생산동향 12월호 누계(참치류)"}
    rows = [gear[y] for y in sorted(gear)]
    monthly = [{"월": h["period"], "참치류": h["tuna_month_t"], "누계": h["tuna_ytd_t"]} for h in m["headline"]]
    return {
        "_meta": {"출처": "원양어업통계조사 2025년판 표 2-13·2-15·2-23, 원양어업 생산동향 월보 2025-01~2026-06", "단위": "톤, 백만원", "기준연도": 2024,
                  "2025_vs_2024": {"선망": "-26.8%", "연승": "-13.5%", "참치류": "-25.0%", "기준": f"월보 2024 누계 선망 {b24['참치선망']:,}·연승 {b24['참치연승']:,}"},
                  "2026상반기": {"참치류": 118014, "선망": 97487, "연승": 20527, "전년동기": 129143},
                  "주의": "2025년은 월보 누계(예비치). 업종 생산량에는 참치 외 어종이 조금 섞여 있다"},
        "연도별": rows,
        "월별": monthly,
    }


def companies():
    c24 = load("kosfa_2024_by_company.json")["rows"]
    c25 = load("kosfa_2025_by_company.json")["rows"]
    d24 = {r["회사"]: r for r in c24}
    d25 = {r["회사"]: r for r in c25}
    names = sorted(set(d24) | set(d25), key=lambda c: -((d24.get(c, {}).get("참치선망") or 0) + (d24.get(c, {}).get("참치연승") or 0) + (d25.get(c, {}).get("참치선망") or 0) + (d25.get(c, {}).get("참치연승") or 0)))
    rows = []
    for c in names:
        a, b = d24.get(c, {}), d25.get(c, {})
        if not (a.get("참치선망") or a.get("참치연승") or b.get("참치선망") or b.get("참치연승")):
            continue
        rows.append({"회사": c, "선망2024": a.get("참치선망") or 0, "연승2024": a.get("참치연승") or 0, "선망2025": b.get("참치선망") or 0, "연승2025": b.get("참치연승") or 0})
    ps24 = sum(r["선망2024"] for r in rows); ps25 = sum(r["선망2025"] for r in rows)
    return {
        "_meta": {"출처": "한국원양산업협회 『원양산업통계연보』 「4. 회사별 업종별 생산실적」 — 2024년(2025년판 p.112~114)·2025년(2026년판 선행표)", "단위": "톤",
                  "선망합계": {"2024": ps24, "2025": ps25}, "연승합계": {"2024": sum(r["연승2024"] for r in rows), "2025": sum(r["연승2025"] for r in rows)},
                  "선망점유2024": {r["회사"]: round(100 * r["선망2024"] / ps24, 1) for r in rows if r["선망2024"]},
                  "주의": "2025년 표는 당초 2024년으로 오인됐던 자료. 회사별 점유는 같은 해 회사별 표 안에서만 읽는다"},
        "rows": rows,
    }


def fleet():
    f = load("fleet_tuna_by_company.json")["rows"]
    v = load("fleet_tuna_vessels.json")["rows"]
    rows = [{"회사": r["company"], "척수": r["vessel_count"], "선망": r["vessel_count_by_gear"].get("참치선망", 0), "연승": r["vessel_count_by_gear"].get("참치연승", 0), "총톤수": round(r["total_gt"]), "평균선령": r["average_age_years_kosfa_yearbook_all"], "20년초과": r["vessels_over_20_years_kosfa_yearbook_all"]} for r in f]
    bins = {"선망": {}, "연승": {}}
    for x in v:
        g = "선망" if x["gear"] == "참치선망" else "연승"
        a = x.get("age_years_kosfa_yearbook_as_of_2026")
        if a is None:
            continue
        k = "~10년" if a <= 10 else "11~20년" if a <= 20 else "21~30년" if a <= 30 else "31~40년" if a <= 40 else "41년~"
        bins[g][k] = bins[g].get(k, 0) + 1
    order = ["~10년", "11~20년", "21~30년", "31~40년", "41년~"]
    dist = [{"구간": k, "선망": bins["선망"].get(k, 0), "연승": bins["연승"].get(k, 0)} for k in order]
    return {
        "_meta": {"출처": "한국원양산업협회 2025년 연보 명부(2024년 말) + RFMO 등록부(WCPFC·IOTC·ICCAT·IATTC·CCSBT, 2026-08-17) 대조 122척", "기준": "2024년 말 132척(선망 27·연승 105), 선령은 2026년 기준",
                  "선망": {"척수": 27, "총톤수": 38964, "평균선령": 20.0, "20년초과": 8}, "연승": {"척수": 105, "총톤수": 42682, "평균선령": 36.5, "20년초과": 104, "30년초과": 99},
                  "주의": "명부의 업종은 허가·등록 구분이지 조업 실적이 아니다. 소유자·선원 이름은 담지 않는다"},
        "rows": rows,
        "선령분포": dist,
    }


def trade():
    s = load("spine_tons.json")["years"]
    rows = []
    for y in sorted(s):
        d = s[y]
        rows.append({"연도": "2026(1~7월)" if y == "2026" else int(y),
                     "원어수출": d["원어"]["exp_t"], "원어수출액": d["원어"]["exp_musd"], "필레수출": d["필레"]["exp_t"], "필레수출액": d["필레"]["exp_musd"], "캔수출": d["캔"]["exp_t"], "캔수출액": d["캔"]["exp_musd"],
                     "원어수입": d["원어"]["imp_t"], "원어수입액": d["원어"]["imp_musd"], "필레수입": d["필레"]["imp_t"], "필레수입액": d["필레"]["imp_musd"], "캔수입": d["캔"]["imp_t"], "캔수입액": d["캔"]["imp_musd"]})
    partners = []
    for y in ("2024", "2025"):
        pe = s[y]["원어"]["partners_exp_t"]; sh = s[y]["원어"]["partners_exp_share"]; uv = s[y]["원어"]["partners_exp_usd_per_kg"]
        top = sorted(pe.items(), key=lambda kv: -kv[1])[:8]
        partners.append({"연도": int(y), "rows": [{"국가": k.replace("아메리칸 사모아", "아메리칸사모아"), "톤": v, "비중": sh.get(k), "단가": uv.get(k)} for k, v in top], "대만": pe.get("대만", 0)})
    can = load("kcs_160414_hs10_split.json")["years"]
    can_rows = [{"연도": int(y), "캔": c["import_can_t"], "기타조제품": c["import_other_9000_t"], "베트남캔": c["import_by_country"].get("베트남", {}).get("밀폐용기(-10xx)", 0), "베트남기타": c["import_by_country"].get("베트남", {}).get("기타(-9000)", 0), "태국캔": c["import_by_country"].get("태국", {}).get("밀폐용기(-10xx)", 0)} for y, c in sorted(can.items())]
    fil = s["2025"]["필레"]
    fil_rows = [{"국가": k, "톤": v, "단가": fil["partners_imp_usd_per_kg"].get(k)} for k, v in sorted(fil["partners_imp_t"].items(), key=lambda kv: -kv[1])[:8]]
    return {
        "_meta": {"출처": "관세청 수출입무역통계 2019~2026년 7월 (원어 0303.41~49·필레 0304.87·캔 1604.14), 10자리 분해는 2022~2025 스냅샷", "단위": "톤, 백만 달러, 달러/kg", "기준연도": 2025,
                  "원어수출2024": s["2024"]["원어"]["exp_t"], "원어수출2025": s["2025"]["원어"]["exp_t"], "태국비중2024": s["2024"]["원어"]["partners_exp_share"].get("태국"), "대만수출2024": s["2024"]["원어"]["partners_exp_t"].get("대만", 0),
                  "주의": "2026년은 1~7월 누계. 냉동 참치 수출에는 연승이 일본에 파는 사시미용이 섞여 있다. 1604.14-9000은 밀폐용기에 들지 않은 조제품(자숙 로인)"},
        "연도별": rows,
        "원어수출상대": partners,
        "캔세번분해": can_rows,
        "필레수입2025": fil_rows,
    }


def cans():
    s = load("mfds_I0300_tuna_summary.json")
    brand = s["brand_can_t"]
    rows = [{"연도": int(y), **{b: brand[b][y] for b in ("동원", "사조", "오뚜기", "그 밖")}, "횟감·로인": s["kind_t"]["횟감·로인"][y], "캔·조리합계": s["kind_t"]["캔·조리"][y]} for y in ("2022", "2023", "2024", "2025")]
    fac = [{"브랜드": r["brand"], "공장": r["factory"].replace("(주)", "").replace("주식회사", ""), "2024": r["t"]["2024"], "2025": r["t"]["2025"]} for r in s["brand_factory_can_t"] if r["t"]["2024"] >= 1000]
    return {
        "_meta": {"출처": "식품안전나라 식품 생산실적(I0300) 2022~2025, 품목유형 수산물가공품·품목명 참치/다랑어", "단위": "톤", "기준연도": 2024,
                  "캔2024": s["kind_t"]["캔·조리"]["2024"], "업체수": s["company_count"], "주의": "브랜드는 품목명 표기로 귀속. 동원 캔의 45%는 삼진물산·신진물산 위탁. 오뚜기에스에프 2024년 급증은 원문 그대로(사유 미공개)"},
        "연도별": rows,
        "공장별": fac,
    }


def prices():
    p = load("price_chain.json")
    bkk = [{"월": k, "방콕": v} for k, v in p["bangkok_skj_usd_t"].items()]
    up = p["ofis_unit_price_krw_kg"]
    months = sorted(set(m for s in up.values() for m in s))
    krw = [{"월": m, "가다랑어": up["가다랑어"].get(m), "황다랑어": up["황다랑어"].get(m), "눈다랑어": up["눈다랑어"].get(m)} for m in months]
    return {
        "_meta": {"출처": "방콕 가다랑어: Thai Union IR 월별 원료가(Bangkok landings, WPO, Wayback 2025-12-15); 원화 단가: 원양어업 생산동향 월보 어종별 생산단가", "단위": "달러/톤, 원/kg",
                  "방콕저점": {"월": "2024-08", "값": 1250}, "방콕2026_03": 2000, "주의": "2025년 12월 이후 방콕 월별 단일값은 공시되지 않음(GLOBEFISH 분기 범위만). 원화 단가는 선사 보고 생산금액÷생산량"},
        "방콕": bkk,
        "원화단가": krw,
    }


def finance():
    d = load("dart_tuna_derived.json")["rows"]
    order = ["동원산업", "동원F&B", "오뚜기", "사조대림", "사조산업", "신라교역", "사조오양", "한성기업", "사조씨푸드", "동원수산"]
    rows = []
    for c in order:
        r = d[c]
        rows.append({"회사": c, "매출2024": r["FY2024"]["매출_억"], "영업이익2024": r["FY2024"]["영업이익_억"], "영업이익률2024": r["FY2024"]["영업이익률"], "매출2023": r["FY2023"]["매출_억"], "영업이익2023": r["FY2023"]["영업이익_억"], "매출2025H1": r["2025H1"]["매출_억"], "영업이익2025H1": r["2025H1"]["영업이익_억"], "기준": r["FY2024"]["기준"]})
    cd = load("counterparty_disclosures.json")
    fcf = [{"연도": int(y), "FCF": round(v["fcf"] / 1e5), "연결매출": round(v["total"] / 1e5), "비중": v["share"]} for y, v in cd["silla_customer_A_FCF"]["rows"].items()]
    return {
        "_meta": {"출처": "전자공시(OpenDART) 사업보고서·반기보고서, 단위 억원. 신라교역 「주요 고객」 주석(고객 A = FCF)", "기준연도": 2024,
                  "공시선사": 7, "참치선사": 14, "주의": "동원산업 연결에는 동원F&B·물류·포장이 들어 있다(수산 부문은 2025년 상반기 매출의 3.6%)"},
        "rows": rows,
        "FCF": fcf,
    }


def transship():
    t = load("transshipment_2024.json")
    pna = [{"월": k, "환적": v} for k, v in sorted(t["pna_monthly_transshipped_t"].items())]
    k = t["korea_ps_transshipment_2024"]
    return {
        "_meta": {"출처": "WCPFC 한국 연례보고(2024년 어업, SC21-AR/CCM-12 Rev.01) 표 6; PNA 선망 월보 2024-01~2025-12; 마셜제도 연례보고 표 9", "단위": "톤, 건",
                  "선망항내환적": {"건수": k["offload_events_in_port"], "톤": k["offload_in_port_t"]}, "운반선": {"항내": k["carrier_received_in_port_t"], "공해": k["carrier_received_beyond_national_jurisdiction_t"]},
                  "마주로2024": {"건수": t["majuro_2024"]["ps_transshipments_and_landings"], "톤": t["majuro_2024"]["tonnes"], "한국행": "없음"},
                  "주의": "PNA 월보는 전 기국 합계이고 한국 기국만의 칸은 없다. 월보가 톤수를 적은 달만"},
        "PNA월별": pna,
    }


def main() -> int:
    data = {
        "_meta": {"생성일": date.today().isoformat(), "보고서": "한국 참치 산업 해부 (2026-08, 초판)", "축": "원양 선단 · 환적·수출 척추 · 판매 상대 · 국내 캔과 수입 · 값 · 재무"},
        "세계어획": world_catch(),
        "한국생산": korea_production(),
        "선사": companies(),
        "선단": fleet(),
        "교역": trade(),
        "캔": cans(),
        "가격": prices(),
        "재무": finance(),
        "환적": transship(),
    }
    assert data["세계어획"]["_meta"]["기준연도"] >= MIN_EXPECTED_YEAR
    assert data["선사"]["_meta"]["선망합계"]["2024"] == 288742, data["선사"]["_meta"]["선망합계"]
    assert data["교역"]["_meta"]["대만수출2024"] == 0
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes) · 세계 {data['세계어획']['_meta']['세계합계']:,} · 한국 {data['세계어획']['_meta']['한국']:,} · 선망 2024 {data['선사']['_meta']['선망합계']['2024']:,} · 수출 2024 {data['교역']['_meta']['원어수출2024']:,}t · 캔 {data['캔']['_meta']['캔2024']:,}t")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
