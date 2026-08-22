#!/usr/bin/env python3
"""Batch 1 빌더 — CSV 1차출처 기반 grade A 11건.

build.py 가 import 하면 @builder 데코레이터로 레지스트리에 등록된다.
직접 실행하지 않는다.
"""
import csv
from collections import defaultdict
from functools import lru_cache

from build import (C, CAPTURE_CSV, FLOW_EXPORT, FLOW_IMPORT, KOREA, NORWAY, PARTNERS_CSV,
                   Q, V, builder, capture, flow_by_partner, partners, r1, trade_years)
from scope import (AFRICA, COMTRADE_CSV, COUNTRY, FAO_FILTERED, HS6_SCOPE, MFDS_CSV,
                   USDA_CSV, is_scomber_commodity)

TRADE_CSV = FAO_FILTERED / "mackerel_trade.csv"
TRADE_PP_CSV = FAO_FILTERED / "mackerel_trade_pp.csv"
GLOBAL_PROD_CSV = FAO_FILTERED / "mackerel_global_production.csv"

NETHERLANDS, VIETNAM, JAPAN = 528, 704, 392
EU = {528, 724, 250, 616, 208, 276, 372, 826}

# 가공 단계 사다리 — 원물에서 멀어질수록 부가가치가 붙는다는 가설의 검증축
FORM_LADDER = [
    ("냉장 원물", ["fresh or chilled"]),
    ("냉동 원물", ["frozen"]),
    ("냉동 필렛", ["fillets, frozen"]),
    ("염장·건조", ["salted or in brine", "dried"]),
    ("훈제", ["smoked"]),
    ("조제·통조림", ["prepared or preserved"]),
]


def _form_of(name: str) -> str | None:
    """품목명을 가공 단계로 분류. 구체적인 것부터 본다(필렛이 냉동보다 우선)."""
    low = name.lower()
    for label, keys in reversed(FORM_LADDER):
        if any(k in low for k in keys):
            return label
    return None


# ─────────────────────────── 로더 ───────────────────────────

@lru_cache(maxsize=1)
def trade():
    """(flow, reporter, commodity, measure, period) -> value"""
    agg = defaultdict(float)
    with TRADE_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_commodity(r["_commodity_name_en"]):
                continue
            agg[(r["TRADE_FLOW.ALPHA_CODE"], int(r["COUNTRY_REPORTER.UN_CODE"]),
                 r["_commodity_name_en"], r["MEASURE"], int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return dict(agg)


@lru_cache(maxsize=1)
def trade_pp():
    """(country, commodity, period) -> 톤 (가공품 생산)"""
    agg = defaultdict(float)
    with TRADE_PP_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_commodity(r["_commodity_name_en"]):
                continue
            agg[(int(r["COUNTRY.UN_CODE"]), r["_commodity_name_en"],
                 int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return dict(agg)


@lru_cache(maxsize=1)
def global_production():
    """(source, period) -> 톤. source: CAPTURE | MARINE(양식)"""
    agg = defaultdict(float)
    with GLOBAL_PROD_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if r["_species_name_en"] not in {
                    "Atlantic mackerel", "Pacific chub mackerel", "Blue mackerel",
                    "Scomber mackerels NEI"}:
                continue
            agg[(r["PRODUCTION_SOURCE_DET.CODE"], int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return dict(agg)


@lru_cache(maxsize=1)
def comtrade():
    """(reporter, partner, period) -> (netWgt kg, primaryValue USD). 직접 HS6만."""
    agg = defaultdict(lambda: [0.0, 0.0])
    with COMTRADE_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if r["cmdCode"] not in HS6_SCOPE or r["flowCode"] != "X":
                continue
            if r["partnerCode"] in ("0", "", None):     # 0 = World 집계행
                continue
            k = (r["reporterDesc"], r["partnerDesc"], int(r["refYear"]))
            agg[k][0] += float(r["netWgt"] or 0)
            agg[k][1] += float(r["primaryValue"] or 0)
    return {k: tuple(v) for k, v in agg.items()}


@lru_cache(maxsize=1)
def usda():
    """(yyyymm, hs10) -> (kg, USD). 미국 수입."""
    agg = defaultdict(lambda: [0.0, 0.0])
    with USDA_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            k = (r["date"], r["hS10Code"])
            agg[k][0] += float(r["consumptionQuantity1"] or 0)
            agg[k][1] += float(r["consumptionCIFValue"] or 0)
    return {k: tuple(v) for k, v in agg.items()}


@lru_cache(maxsize=1)
def mfds():
    with MFDS_CSV.open(encoding="utf-8-sig") as fh:
        return list(csv.DictReader(fh))


def _years(keys, idx):
    return sorted({k[idx] for k in keys})


# ─────────────────────────── S2 ───────────────────────────

@builder("s2_form_price_ladder")
def s2_form_price_ladder():
    t = trade()
    latest = max(k[4] for k in t)
    rows = []
    for label, _ in FORM_LADDER:
        q = sum(v for k, v in t.items()
                if k[0] == FLOW_EXPORT and k[3] == Q and k[4] == latest and _form_of(k[2]) == label)
        val = sum(v for k, v in t.items()
                  if k[0] == FLOW_EXPORT and k[3] == V and k[4] == latest and _form_of(k[2]) == label)
        if q > 0:
            rows.append({"가공단계": label, "수출단가": round(val / q, 2), "물량": round(q)})
    base = rows[1]["수출단가"] if len(rows) > 1 else rows[0]["수출단가"]
    top = max(rows, key=lambda r: r["수출단가"])
    return {
        "title": "가공단계별 단가 사다리",
        "subtitle": f"FAO FishStat Trade {latest}년 세계 수출 기준 단가(USD/kg). 냉동 원물 ${base}/kg → "
                    f"최상단 {top['가공단계']} ${top['수출단가']}/kg, {r1(top['수출단가'] / base)}배.",
        "chartType": "Bar", "xKey": "가공단계",
        "bars": [{"key": "수출단가", "color": C["emerald"]}],
        "data": rows, "unit": "USD/kg",
        "sit": f"원물에서 멀어질수록 단가가 오른다. {top['가공단계']}는 냉동 원물의 {r1(top['수출단가'] / base)}배다. "
               f"실제로는 물량이 냉동 원물에 쏠려 있어 부가가치 전환이 거의 일어나지 않고 있다.",
        "strat": "가공 투자는 배수에 실현 가능 물량을 곱해 보고 정한다. 단가 배수만 보고 들어간 투자는 틀어진다. 국내 설비로 접근 가능한 "
                 "구간은 필렛·염장까지다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE", period=str(latest),
                      inputs=[TRADE_CSV], grade="A",
                      note="단가는 세계 수출 신고 금액÷물량. 국가별 규격 차이가 섞여 있다."),
    }


@builder("s2_hmr_valueadd")
def s2_hmr_valueadd():
    t = trade()
    years = sorted({k[4] for k in t})[-12:]
    data = []
    for y in years:
        row = {"year": str(y)}
        for label in ("냉동 원물", "냉동 필렛", "조제·통조림"):
            q = sum(v for k, v in t.items()
                    if k[0] == FLOW_EXPORT and k[3] == Q and k[4] == y and _form_of(k[2]) == label)
            val = sum(v for k, v in t.items()
                      if k[0] == FLOW_EXPORT and k[3] == V and k[4] == y and _form_of(k[2]) == label)
            if q > 0:
                row[label] = round(val / q, 2)
        data.append(row)
    last = data[-1]
    return {
        "title": "가공형태 전환 부가가치 추이",
        "subtitle": f"FAO FishStat Trade의 원물·필렛·조제품 수출단가 추이. {years[-1]}년 조제·통조림 $"
                    f"{last.get('조제·통조림', 0)}/kg vs 냉동 원물 ${last.get('냉동 원물', 0)}/kg.",
        "chartType": "Line", "xKey": "year",
        "lines": [{"key": "냉동 원물", "color": C["slate"]},
                  {"key": "냉동 필렛", "color": C["sky"]},
                  {"key": "조제·통조림", "color": C["emerald"]}],
        "data": data, "unit": "USD/kg",
        "sit": "원물 가격이 오를 때 가공품 가격이 더 크게 오르며, 세 단계의 단가 격차는 시간이 지나도 좁혀지지 않는다.",
        "strat": "원물 가격 상승기에는 가공품 계약을 먼저 잠가야 마진이 지켜진다. 원물만 사서 되파는 구조는 상승기에 가장 불리하다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE", period=f"{years[0]}-{years[-1]}",
                      inputs=[TRADE_CSV], grade="A"),
    }


@builder("s2_processing_hubs")
def s2_processing_hubs():
    pp = trade_pp()
    years = sorted({k[2] for k in pp})[-15:]
    totals = defaultdict(float)
    for (c, _, y), v in pp.items():
        if y == years[-1]:
            totals[c] += v
    top = [c for c, _ in sorted(totals.items(), key=lambda kv: -kv[1])[:6]]
    data = []
    for y in years:
        row = {"year": str(y)}
        for c in top:
            row[COUNTRY.get(c, str(c))] = round(sum(v for k, v in pp.items() if k[0] == c and k[2] == y))
        data.append(row)
    lead = COUNTRY.get(top[0], str(top[0]))
    return {
        "title": "글로벌 가공 허브 이동",
        "subtitle": f"FAO FishStat Processed Products의 고등어 가공품 생산 상위 6개국. {years[-1]}년 1위 "
                    f"{lead}.",
        "chartType": "Line", "xKey": "year",
        "lines": [{"key": COUNTRY.get(c, str(c)), "color": col} for c, col in
                  zip(top, [C["sky"], C["amber"], C["emerald"], C["violet"], C["rose"], C["slate"]])],
        "data": data, "unit": "톤",
        "sit": f"{years[-1]}년 가공 생산 1위는 {lead}로, 어획국과 가공국이 갈라지면서 원물은 어획국에서, 부가가치는 가공국에서 "
               f"발생한다.",
        "strat": "조달 경로는 가공 허브를 따라 움직이니 허브국의 대한(對韓) 수출 단가를 함께 봐야 실제 조달 비용이 보인다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PP", period=f"{years[0]}-{years[-1]}",
                      inputs=[TRADE_PP_CSV], grade="A"),
    }


@builder("s2_fishmeal")
def s2_fishmeal():
    pp = trade_pp()
    years = sorted({k[2] for k in pp})[-15:]
    data = []
    for y in years:
        meal = sum(v for k, v in pp.items() if "meal" in k[1].lower() and k[2] == y)
        food = sum(v for k, v in pp.items() if "meal" not in k[1].lower() and k[2] == y)
        tot = meal + food
        data.append({"year": str(y), "식용 가공": round(food), "어분": round(meal),
                     "사료전환율": r1(100 * meal / tot) if tot else 0})
    last = data[-1]
    return {
        "title": "어분 전환 물량과 사료 전환율",
        "subtitle": f"FAO FishStat Processed Products의 고등어 가공품 중 어분(meal) 비중. "
                    f"{last['year']}년 {last['사료전환율']}%.",
        "chartType": "Composed", "stacked": True, "xKey": "year",
        "bars": [{"key": "식용 가공", "color": C["sky"]}, {"key": "어분", "color": C["amber"]}],
        "lines": [{"key": "사료전환율", "color": C["rose"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / %",
        "sit": f"{last['year']}년 고등어 가공품의 {last['사료전환율']}%가 어분으로 간다. 식용으로 갈 물량이 사료로 빠지면 식용 "
               f"원물 수급이 그만큼 조인다.",
        "strat": "어분 가격 상승은 식용 원물 확보 경쟁으로 이어진다. 어분 전환율 상승은 식용 원물 단가 상승의 선행 신호로 읽는다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PP", period=f"{years[0]}-{years[-1]}",
                      inputs=[TRADE_PP_CSV], grade="A",
                      note="전갱이 어분(Jack mackerel meal)은 scope.py 에서 제외했다."),
    }


@builder("s2_aquaculture")
def s2_aquaculture():
    gp = global_production()
    years = sorted({k[1] for k in gp})[-20:]
    data = []
    for y in years:
        cap = gp.get(("CAPTURE", y), 0)
        aqua = gp.get(("MARINE", y), 0)
        data.append({"year": str(y), "자연산": round(cap), "양식": round(aqua),
                     "양식비중": round(100 * aqua / (cap + aqua), 3) if cap + aqua else 0})
    last = data[-1]
    return {
        "title": "양식 전환 가능성",
        "subtitle": f"FAO FishStat Global Production 기준 Scomber 속 자연산 대 해면양식. "
                    f"{last['year']}년 양식 비중 {last['양식비중']}%.",
        "chartType": "Composed", "stacked": True, "xKey": "year",
        "bars": [{"key": "자연산", "color": C["sky"]}, {"key": "양식", "color": C["emerald"]}],
        "lines": [{"key": "양식비중", "color": C["rose"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / %",
        "sit": f"{last['year']}년 양식 비중은 {last['양식비중']}%다. 고등어는 사실상 100% 자연산 어종이다. 양식 전환은 "
               f"아직 통계에 잡힐 규모에 못 미친다.",
        "strat": "「양식 블루오션」 서사는 데이터에 근거가 없다. 공급 리스크는 양식으로 헤지할 수 없다. 원산지 다변화와 재고 정책으로만 "
                 "관리된다.",
        "_prov": dict(source_id="FAO_FISHSTAT_GLOBAL_PRODUCTION", period=f"{years[0]}-{years[-1]}",
                      inputs=[GLOBAL_PROD_CSV], grade="A",
                      note="MARINE = 해면양식. 담수·기수 양식은 Scomber 속에 해당 없음."),
    }


@builder("s2_triangle_reexport")
def s2_triangle_reexport():
    years = trade_years()
    data = []
    for y in years:
        nor_to_vn = flow_by_partner(FLOW_EXPORT, NORWAY, Q, y).get(VIETNAM, 0)
        vn_to_jp = flow_by_partner(FLOW_EXPORT, VIETNAM, Q, y).get(JAPAN, 0)
        nor_to_jp = flow_by_partner(FLOW_EXPORT, NORWAY, Q, y).get(JAPAN, 0)
        data.append({"year": str(y), "노르웨이→베트남": round(nor_to_vn),
                     "베트남→일본": round(vn_to_jp), "노르웨이→일본 직수출": round(nor_to_jp)})
    last = data[-1]
    return {
        "title": "삼각 가공 재수출 밸류체인",
        "subtitle": f"FAO 양자교역으로 노르웨이 원물이 베트남 가공을 거쳐 일본으로 가는 루트와 직수출 루트를 비교했다. "
                    f"{last['year']}년 베트남→일본 {last['베트남→일본']:,}톤.",
        "chartType": "Line", "xKey": "year",
        "lines": [{"key": "노르웨이→베트남", "color": C["sky"]},
                  {"key": "베트남→일본", "color": C["emerald"]},
                  {"key": "노르웨이→일본 직수출", "color": C["slate"]}],
        "data": data, "unit": "톤",
        "sit": "노르웨이 원물이 저임금 가공지를 경유해 최종 시장으로 들어가는 구조가 실측으로 확인된다. 직수출 대비 경유 물량의 비율로 가공 "
               "경유의 경제성을 읽는다.",
        "strat": "동일 구조를 한국 원물에 적용할 수 있다. 다만 경유 가공은 원산지 표기와 FTA 특혜 원산지 판정에 걸리므로 관세 조건을 먼저 "
                 "확인해야 한다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PARTNERS", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A"),
    }


@builder("s2_us_market")
def s2_us_market():
    u = usda()
    months = sorted({k[0] for k in u})
    hs_label = {"0302440000": "신선·냉장", "0303540000": "냉동", "0304": "필렛", "1604150000": "조제품"}

    def label(hs):
        for pre, lb in hs_label.items():
            if hs.startswith(pre[:6]):
                return lb
        return "기타"

    data = []
    for m in months:
        row = {"month": f"{m[:4]}-{m[4:]}"}
        for lb in ("신선·냉장", "냉동", "필렛", "조제품"):
            kg = sum(v[0] for k, v in u.items() if k[0] == m and label(k[1]) == lb)
            if kg:
                row[lb] = round(kg / 1000)      # 톤
        data.append(row)
    tot_kg = sum(v[0] for v in u.values())
    tot_usd = sum(v[1] for v in u.values())
    return {
        "title": "미국 시장 수입 동향",
        "subtitle": f"USDA FAS GATS 월별 실측, {months[0][:4]}-{months[0][4:]}~{months[-1][:4]}"
                    f"-{months[-1][4:]} 누적 {tot_kg / 1000:,.0f}톤, 평균 CIF $"
                    f"{tot_usd / tot_kg:.2f}/kg.",
        "chartType": "Bar", "stacked": True, "xKey": "month",
        "bars": [{"key": "냉동", "color": C["sky"]}, {"key": "조제품", "color": C["emerald"]},
                 {"key": "필렛", "color": C["amber"]}, {"key": "신선·냉장", "color": C["slate"]}],
        "data": data, "unit": "톤",
        "sit": f"미국 수입은 조제품(통조림) 비중이 크고 평균 CIF는 ${tot_usd / tot_kg:.2f}/kg로, 아프리카 벌크 "
               f"수출단가와는 다른 가격대의 시장이다.",
        "strat": "미국에 진입할 때는 조제품 규격부터 맞춰야 한다. 미국은 원물 시장이 아니라 가공품 시장이다. 냉동 원물로 들고 가 봐야 경쟁 "
                 "상대 이전에 시장 자체가 없다.",
        "_prov": dict(source_id="USDA_GATS_US_IMPORTS", period=f"{months[0]}-{months[-1]}",
                      inputs=[USDA_CSV], grade="A",
                      note="GATS Census 수입 실적. 직접 HS6 5종 범위."),
    }


# ─────────────────────────── S3 ───────────────────────────

@builder("s3_export_destinations")
def s3_export_destinations():
    years = trade_years()
    latest = years[-1]
    rows = flow_by_partner(FLOW_EXPORT, KOREA, Q, latest)
    top = [c for c, _ in sorted(rows.items(), key=lambda kv: -kv[1])[:6]]
    data = []
    for y in years:
        rq = flow_by_partner(FLOW_EXPORT, KOREA, Q, y)
        tq = sum(rq.values())
        row = {"year": str(y)}
        for c in top:
            row[COUNTRY.get(c, str(c))] = r1(100 * rq.get(c, 0) / tq) if tq else 0
        data.append(row)
    lead = COUNTRY.get(top[0], str(top[0]))
    return {
        "title": "한국 수출 목적지 구조 변화",
        "subtitle": f"FAO 양자교역으로 본 한국 수출 상위 6개국 비중 추이. {latest}년 1위 {lead} "
                    f"{r1(100 * rows[top[0]] / sum(rows.values()))}%.",
        "chartType": "Area", "stacked": True, "xKey": "year",
        "areas": [{"key": COUNTRY.get(c, str(c)), "color": col} for c, col in
                  zip(top, [C["emerald"], C["sky"], C["amber"], C["violet"], C["rose"], C["slate"]])],
        "data": data, "unit": "%",
        "sit": f"수출 목적지가 소수 국가에 몰려 있다. {latest}년 1위 {lead} 단독으로 큰 비중을 차지한다.",
        "strat": "상위 2개국에 문제가 생기면 대체 판로를 찾는 데 최소 한 시즌이 걸린다. 목적지 집중은 수입 원산지 집중과 같은 종류의 "
                 "리스크다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PARTNERS", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A"),
    }


@builder("s3_netherlands_hub")
def s3_netherlands_hub():
    years = trade_years()
    data = []
    for y in years:
        iq = sum(flow_by_partner(FLOW_IMPORT, NETHERLANDS, Q, y).values())
        iv = sum(flow_by_partner(FLOW_IMPORT, NETHERLANDS, V, y).values())
        eq = sum(flow_by_partner(FLOW_EXPORT, NETHERLANDS, Q, y).values())
        ev = sum(flow_by_partner(FLOW_EXPORT, NETHERLANDS, V, y).values())
        ip = iv / iq if iq else 0
        ep = ev / eq if eq else 0
        data.append({"year": str(y), "수입량": round(iq), "수출량": round(eq),
                     "수입단가": round(ip, 2), "수출단가": round(ep, 2),
                     "마크업": r1(100 * (ep / ip - 1)) if ip else 0})
    last = data[-1]
    return {
        "title": "네덜란드 가공·중계 허브",
        "subtitle": f"FAO 양자교역에서 뽑은 네덜란드 수입·수출 단가 차. {last['year']}년 마크업 {last['마크업']}%. "
                    f"훈제 가공과 중계무역이 함께 일어나는 허브다.",
        "chartType": "Composed", "xKey": "year",
        "bars": [{"key": "수입량", "color": C["slate"]}, {"key": "수출량", "color": C["sky"]}],
        "lines": [{"key": "수입단가", "color": C["amber"], "yAxisId": "right"},
                  {"key": "수출단가", "color": C["emerald"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / USD/kg",
        "sit": f"네덜란드는 들여온 물량을 다시 내보내며 {last['마크업']}%의 단가 차를 만든다. 이 차이에는 순수 중계 마진에 더해 "
               f"훈제·필렛 가공 부가가치가 섞여 있다.",
        "strat": "가공 설비 없이 재수출만 하는 구조에서는 단가 차의 상당 부분이 사라진다. 중계 마진만 노리고 같은 구조를 흉내 내면 안 된다.",
        "_prov": dict(source_id="EUMOFA_MARKET", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="B",
                      note="물량·단가는 FAO 실측. '가공+중계 양립' 해석은 EUMOFA 시장분석 근거."),
    }


@builder("s3_comtrade_matrix")
def s3_comtrade_matrix():
    ct = comtrade()
    latest = max(k[2] for k in ct)
    flows = [(k[0], k[1], v[0] / 1000) for k, v in ct.items() if k[2] == latest and v[0] > 0]
    flows.sort(key=lambda x: -x[2])
    data = [{"경로": f"{s} → {t}", "물량": round(q)} for s, t, q in flows[:12]]
    total = sum(f[2] for f in flows)
    return {
        "title": "글로벌 교역 매트릭스 (HS6 5종)",
        "subtitle": f"UN Comtrade {latest}년 수출 신고 실측 상위 12개 경로. 전체 {total:,.0f}톤. HS "
                    f"030244·030245·030354·030355·160415.",
        "chartType": "Bar", "xKey": "경로",
        "bars": [{"key": "물량", "color": C["sky"]}],
        "data": data, "unit": "톤",
        "sit": f"{latest}년 신고 기준 교역 경로 상위 12개가 전체 물량의 큰 몫을 차지한다. 신고국 기준이라 재수출이 중복 계상될 수 있다.",
        "strat": "경쟁사가 어디서 사서 어디로 파는지가 이 표에 그대로 나온다. 우리가 노리는 목적지에 이미 누가 얼마나 넣고 있는지 확인하고 "
                 "들어간다.",
        "_prov": dict(source_id="UN_COMTRADE_HS", period=str(latest),
                      inputs=[COMTRADE_CSV], grade="A",
                      note="World 집계행(partnerCode=0) 제외. 수출(X) 신고 기준."),
    }


@builder("s3_mfds_safety")
def s3_mfds_safety():
    rows = mfds()
    by_country = defaultdict(int)
    by_form = defaultdict(int)
    for r in rows:
        by_country[r.get("NTNNM", "").strip() or "미상"] += 1
        by_form[r.get("RPSNT_ITM_NM", "").strip() or "미상"] += 1
    data = [{"국가": c, "신고건수": n} for c, n in
            sorted(by_country.items(), key=lambda kv: -kv[1])[:8]]
    year = rows[0].get("YYYY", "")
    return {
        "title": "수입식품 신고 이력 (국가별)",
        "subtitle": f"식약처 수입식품정보 {year}년 고등어 품목 신고 {len(rows)}건. 신규 거래처 스크리닝용. 실제 통관 실적이 "
                    f"있는 해외제조업소가 어디인지 확인한다.",
        "chartType": "Bar", "xKey": "국가",
        "bars": [{"key": "신고건수", "color": C["violet"]}],
        "data": data, "unit": "건",
        "sit": f"{year}년 고등어 수입식품 신고 {len(rows)}건 중 {data[0]['국가']}({data[0]['신고건수']}건)이 "
               f"가장 많은데, 신고 건수 기준이라 교역 규모를 뜻하지는 않는다.",
        "strat": "신규 공급사를 검토할 때 이 목록에 해외제조업소가 있는지부터 본다. 이력이 없는 업소는 등록 절차부터 시작해야 해 리드타임이 "
                 "길어진다.",
        "_prov": dict(source_id="MFDS_IMPORTED_FOOD", period=year,
                      inputs=[MFDS_CSV], grade="A",
                      note="신고 건수 집계. 부적합 판정 건수가 아니다."),
    }


# ─────────────────────────── S4 ───────────────────────────

@builder("s4_market_polarization")
def s4_market_polarization():
    years = trade_years()
    data = []
    for y in years:
        rows = []
        for group, label in ((EU, "EU 수입단가"), (AFRICA, "아프리카 수입단가")):
            q = sum(v for k, v in partners().items()
                    if k[0] == FLOW_IMPORT and k[1] in group and k[3] == Q and k[4] == y)
            val = sum(v for k, v in partners().items()
                      if k[0] == FLOW_IMPORT and k[1] in group and k[3] == V and k[4] == y)
            rows.append((label, round(val / q, 2) if q else 0))
        row = {"year": str(y), **dict(rows)}
        row["격차배수"] = r1(row["EU 수입단가"] / row["아프리카 수입단가"]) if row["아프리카 수입단가"] else 0
        data.append(row)
    last = data[-1]
    return {
        "title": "수입단가 양극화 (EU vs 아프리카)",
        "subtitle": f"FAO 양자교역 기준 {last['year']}년 EU ${last['EU 수입단가']}/kg vs 아프리카 $"
                    f"{last['아프리카 수입단가']}/kg, {last['격차배수']}배.",
        "chartType": "Composed", "xKey": "year",
        "bars": [{"key": "EU 수입단가", "color": C["emerald"]},
                 {"key": "아프리카 수입단가", "color": C["amber"]}],
        "lines": [{"key": "격차배수", "color": C["rose"], "yAxisId": "right"}],
        "data": data, "unit": "USD/kg / 배",
        "sit": f"같은 고등어인데 EU 향과 아프리카 향의 단가가 {last['격차배수']}배 벌어진다. 규격·선도·가공도가 갈리면서 시장이 사실상 "
               f"둘로 나뉘어 있다.",
        "strat": "아프리카는 물량·회수 조건, EU는 규격·인증이 협상의 축이라 두 시장은 하나의 영업 전략으로 안 묶인다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PARTNERS", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A",
                      note="EU는 네덜란드·스페인·프랑스·폴란드·덴마크·독일·아일랜드·영국 합산."),
    }
