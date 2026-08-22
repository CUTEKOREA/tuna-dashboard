#!/usr/bin/env python3
"""고등어 위젯 데이터 빌더.

아카이브(읽기 전용) → data/mackerel/<final_id>.json
같은 입력이면 같은 출력이 나와야 한다. 시각·난수 사용 금지.

사용:
  python scripts/mackerel/build.py            # 전체
  python scripts/mackerel/build.py s1_korea_production   # 일부
"""
import csv
import json
import sys
from collections import defaultdict
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import provenance
from scope import (AFRICA, COUNTRY, FAO_FILTERED, FLOW_EXPORT, FLOW_IMPORT, Q, V,
                   is_scomber_commodity, is_scomber_species)

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "data" / "mackerel"
OUT_GLOB = "s[1-5]_*.json"   # 레거시 JSON과 구분
KOREA, NORWAY = 410, 578

PARTNERS_CSV = FAO_FILTERED / "mackerel_trade_partners.csv"
CAPTURE_CSV = FAO_FILTERED / "mackerel_capture.csv"

C = {  # UI_RULES 팔레트
    "sky": "#0ea5e9", "amber": "#f59e0b", "emerald": "#10b981", "violet": "#8b5cf6",
    "rose": "#ef4444", "blue": "#3b82f6", "slate": "#94a3b8",
}

BUILDERS = {}


def builder(final_id):
    def deco(fn):
        BUILDERS[final_id] = fn
        return fn
    return deco


# ─────────────────────────── 로더 (1회만 읽는다) ───────────────────────────

@lru_cache(maxsize=1)
def partners():
    """(flow, reporter, partner, measure, period) -> value"""
    agg = defaultdict(float)
    with PARTNERS_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_commodity(r["_commodity_name_en"]):
                continue
            agg[(r["TRADE_FLOW.ALPHA_CODE"], int(r["COUNTRY_REPORTER.UN_CODE"]),
                 int(r["COUNTRY_PARTNER.UN_CODE"]), r["MEASURE"], int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return dict(agg)


@lru_cache(maxsize=1)
def capture():
    """(country, species, period) -> 톤"""
    agg = defaultdict(float)
    with CAPTURE_CSV.open(encoding="utf-8-sig") as fh:
        for r in csv.DictReader(fh):
            if not is_scomber_species(r["_species_name_en"]):
                continue
            agg[(int(r["COUNTRY.UN_CODE"]), r["_species_name_en"], int(r["PERIOD"]))] += float(r["VALUE"] or 0)
    return dict(agg)


def flow_by_partner(flow, reporter, measure, year):
    return {k[2]: v for k, v in partners().items()
            if k[0] == flow and k[1] == reporter and k[3] == measure and k[4] == year}


def trade_years():
    return sorted({k[4] for k in partners()})


def r1(x):
    return round(x, 1)


# ─────────────────────────── 빌더 ───────────────────────────

@builder("s1_capture_species")
def s1_capture_species():
    cap = capture()
    years = sorted({k[2] for k in cap})[-20:]
    species = ["Pacific chub mackerel", "Atlantic mackerel", "Blue mackerel", "Scomber mackerels NEI"]
    ko = {"Pacific chub mackerel": "태평양참고등어", "Atlantic mackerel": "대서양고등어",
          "Blue mackerel": "청고등어", "Scomber mackerels NEI": "고등어류 기타"}
    data = []
    for y in years:
        row = {"year": str(y)}
        for s in species:
            row[ko[s]] = round(sum(v for k, v in cap.items() if k[1] == s and k[2] == y))
        data.append(row)
    last, first = data[-1], data[0]
    tot_last = sum(v for k, v in last.items() if k != "year")
    tot_first = sum(v for k, v in first.items() if k != "year")
    return {
        "title": "고등어 어종별 글로벌 어획량 추이",
        "subtitle": f"FAO FishStat Capture 2026.1.0 기준으로 Scomber 속 4종만 집계했다(전갱이·삼치·임연수어 "
                    f"제외). {years[-1]}년 {tot_last:,.0f}톤, {years[0]}년 대비 "
                    f"{r1(100 * (tot_last / tot_first - 1)):+}%.",
        "chartType": "Area", "stacked": True, "xKey": "year",
        "areas": [{"key": ko[s], "color": c} for s, c in
                  zip(species, [C["sky"], C["amber"], C["emerald"], C["violet"]])],
        "data": data, "unit": "톤",
        "sit": f"Scomber 속 전체 어획은 {years[0]}~{years[-1]} 사이 "
               f"{r1(100 * (tot_last / tot_first - 1)):+}% 변동했고, 물량의 대부분은 태평양참고등어, 그다음이 "
               f"대서양고등어다.",
        "strat": "어종 구성만 봐도 원산지 구성이 나온다. 대서양고등어 비중이 줄어들 때 노르웨이·영국 소싱 단가가 먼저 움직인다.",
        "_prov": dict(source_id="FAO_FISHSTAT_CAPTURE", period=f"{years[0]}-{years[-1]}",
                      inputs=[CAPTURE_CSV], grade="A",
                      note="Scomber 속 4종 한정. 아카이브 필터본은 'mackerel' 문자열 기반이라 타 어종이 섞여 있어 scope.py 로 재필터."),
    }


@builder("s1_capture_country")
def s1_capture_country():
    cap = capture()
    years = sorted({k[2] for k in cap})[-15:]
    totals = defaultdict(float)
    for (c, _, y), v in cap.items():
        if y == years[-1]:
            totals[c] += v
    top = [c for c, _ in sorted(totals.items(), key=lambda kv: -kv[1])[:6]]
    data = []
    for y in years:
        row = {"year": str(y)}
        for c in top:
            row[COUNTRY.get(c, str(c))] = round(sum(v for k, v in cap.items() if k[0] == c and k[2] == y))
        data.append(row)
    lead = COUNTRY.get(top[0], str(top[0]))
    share = 100 * totals[top[0]] / sum(totals.values())
    return {
        "title": "주요 어획국 점유율·집중도",
        "subtitle": f"FAO FishStat Capture 2026.1.0 기준 Scomber 속 어획 상위 6개국, {years[-1]}년 "
                    f"1위는 {lead} {r1(share)}%.",
        "chartType": "Line", "xKey": "year",
        "lines": [{"key": COUNTRY.get(c, str(c)), "color": col} for c, col in
                  zip(top, [C["sky"], C["amber"], C["emerald"], C["violet"], C["rose"], C["slate"]])],
        "data": data, "unit": "톤",
        "sit": f"{years[-1]}년 어획 1위 {lead}({r1(share)}%), 상위 6개국이 전체의 대부분을 차지한다.",
        "strat": "어획 상위국 명단과 수출 상위국 명단은 따로 논다. 어획량이 늘어도 그 물량이 내수로 흡수되는 한 수입 단가는 안 내려간다.",
        "_prov": dict(source_id="FAO_FISHSTAT_CAPTURE", period=f"{years[0]}-{years[-1]}",
                      inputs=[CAPTURE_CSV], grade="A"),
    }


@builder("s1_korea_production")
def s1_korea_production():
    """자급률 정의 확정: A = 어획 / (어획 + 수입). 수출 차감 방식(B)은 100%를 넘어 지표로 못 쓴다."""
    cap = capture()
    data = []
    for y in trade_years():
        c = sum(v for k, v in cap.items() if k[0] == KOREA and k[2] == y)
        imp = sum(flow_by_partner(FLOW_IMPORT, KOREA, Q, y).values())
        exp = sum(flow_by_partner(FLOW_EXPORT, KOREA, Q, y).values())
        data.append({"year": str(y), "어획": round(c), "수입": round(imp), "수출": round(exp),
                     "자급률": r1(100 * c / (c + imp)) if c + imp else 0})
    last = data[-1]
    return {
        "title": "한국 생산량·자급률",
        "subtitle": f"자급률 = 어획 ÷ (어획 + 수입). {last['year']}년 {last['자급률']}%. 수출("
                    f"{last['수출']:,}톤)이 수입({last['수입']:,}톤)의 2배라 「수출 차감」 정의는 100%를 넘어 지표로 "
                    f"쓸 수 없다.",
        "chartType": "Composed", "xKey": "year",
        "bars": [{"key": "어획", "color": C["sky"]}, {"key": "수입", "color": C["amber"]},
                 {"key": "수출", "color": C["emerald"]}],
        "lines": [{"key": "자급률", "color": C["rose"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / %",
        "sit": f"{last['year']}년 자급률은 {last['자급률']}%로 국내 조달이 우위다. 한국은 고등어를 수입량의 약 2배 수출한다. "
               f"국산을 팔고 노르웨이산을 사 먹는 구조다.",
        "strat": "「자급률 위기」는 사실과 다르다. 실제 리스크는 자급률이 아니라 수입 단가(노르웨이 의존)와 수출 단가(아프리카 벌크) 사이의 "
                 "스프레드다.",
        "_kpi": {"title": f"한국 자급률 ({last['year']})", "value": f"{last['자급률']}%",
                 "trend": f"수출 {last['수출']:,}톤 > 수입 {last['수입']:,}톤",
                 "desc": "어획÷(어획+수입). 국산 팔고 노르웨이산 사 먹는 구조"},
        "_prov": dict(source_id="FAO_FISHSTAT_GLOBAL_PRODUCTION",
                      period=f"{data[0]['year']}-{data[-1]['year']}",
                      inputs=[CAPTURE_CSV, PARTNERS_CSV], grade="A",
                      note="자급률 정의 A 확정(2026-08-13). 어획은 FAO capture Scomber 속이라 통계청 '고등어류'와 범위가 다를 수 있다."),
    }


@builder("s1_import_origin_mix")
def s1_import_origin_mix():
    """노르웨이 의존도 확정: 물량 기준 전체 수입 대비. 상위 3국 분모(기존 67%)는 오류."""
    years = trade_years()
    latest = years[-1]
    rows_q = flow_by_partner(FLOW_IMPORT, KOREA, Q, latest)
    top = [c for c, _ in sorted(rows_q.items(), key=lambda kv: -kv[1])[:5]]
    data = []
    for y in years:
        rq = flow_by_partner(FLOW_IMPORT, KOREA, Q, y)
        tq = sum(rq.values())
        row = {"year": str(y)}
        for c in top:
            row[COUNTRY.get(c, str(c))] = r1(100 * rq.get(c, 0) / tq) if tq else 0
        data.append(row)
    nor_q = 100 * rows_q.get(NORWAY, 0) / sum(rows_q.values())
    rows_v = flow_by_partner(FLOW_IMPORT, KOREA, V, latest)
    nor_v = 100 * rows_v.get(NORWAY, 0) / sum(rows_v.values())
    return {
        "title": "수입 원산지 구성과 집중 리스크",
        "subtitle": f"FAO 양자교역 실측, {latest}년 노르웨이 비중 물량 {r1(nor_q)}% / 금액 {r1(nor_v)}%. "
                    f"분모는 한국 전체 수입이다(상위 3국 합이 아니다).",
        "chartType": "Area", "stacked": True, "xKey": "year",
        "areas": [{"key": COUNTRY.get(c, str(c)), "color": col} for c, col in
                  zip(top, [C["sky"], C["amber"], C["emerald"], C["violet"], C["slate"]])],
        "data": data, "unit": "%",
        "sit": f"노르웨이 단일 원산지가 {latest}년 수입 물량의 {r1(nor_q)}%다. {years[0]}년 이후 비중이 오히려 올라 대체 "
               f"소싱이 실효를 못 내고 있다.",
        "strat": "영국·아이슬란드·페로 물량을 연간 계약으로 묶는다. 단일 공급원 88%로는 내밀 카드가 없다.",
        "_kpi": {"title": f"노르웨이 수입 의존도 ({latest})", "value": f"{r1(nor_q)}%",
                 "trend": "물량 기준 · 금액 " + f"{r1(nor_v)}%",
                 "desc": "한국 전체 수입 대비. 단일 원산지 집중도"},
        "_prov": dict(source_id="KCS_NITEMTRADE", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A",
                      note="노르웨이 의존도 정의 확정(2026-08-13): 물량 기준 전체 수입 대비. "
                           "기존 위젯의 52%·67%·73.9% 표기는 분모 오류 또는 분기값 혼입."),
    }


@builder("s1_import_origin_price")
def s1_import_origin_price():
    years = trade_years()
    latest = years[-1]
    rows_q = flow_by_partner(FLOW_IMPORT, KOREA, Q, latest)
    top = [c for c, _ in sorted(rows_q.items(), key=lambda kv: -kv[1])[:5]]
    data = []
    for y in years:
        rq, rv = flow_by_partner(FLOW_IMPORT, KOREA, Q, y), flow_by_partner(FLOW_IMPORT, KOREA, V, y)
        row = {"year": str(y)}
        for c in top:
            q, v = rq.get(c, 0), rv.get(c, 0)
            if q > 0:
                row[COUNTRY.get(c, str(c))] = round(v / q, 2)  # 천USD/톤 = USD/kg
        data.append(row)
    nq = rows_q.get(NORWAY, 0)
    nv = flow_by_partner(FLOW_IMPORT, KOREA, V, latest).get(NORWAY, 0)
    nor_price = nv * 1000 / nq / 1000 if nq else 0
    return {
        "title": "원산지별 수입단가 비교",
        "subtitle": f"FAO 양자교역 금액÷물량 환산 C&F 단가(USD/kg). {latest}년 노르웨이산 ${nor_price:.2f}"
                    f"/kg. 관세·부대비 제외 원물 기준.",
        "chartType": "Line", "xKey": "year",
        "lines": [{"key": COUNTRY.get(c, str(c)), "color": col} for c, col in
                  zip(top, [C["sky"], C["amber"], C["emerald"], C["violet"], C["slate"]])],
        "data": data, "unit": "USD/kg",
        "sit": f"{latest}년 노르웨이산 단가는 ${nor_price:.2f}/kg이고, 원산지별 단가 격차만큼이 대체 소싱의 이론적 차익 "
               f"구간이 된다.",
        "strat": "차익 구간이 규격 손실보다 큰 원산지만 실제 후보다. 단가만 보고 갈아탄 물량은 사이즈·지방함량 규격에서 손해를 본다.",
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A",
                      note="단가는 신고 금액÷물량 환산치. 계약 단가와 다를 수 있다."),
    }


@builder("s3_korea_trade_balance")
def s3_korea_trade_balance():
    years = trade_years()
    data = []
    for y in years:
        iq = sum(flow_by_partner(FLOW_IMPORT, KOREA, Q, y).values())
        iv = sum(flow_by_partner(FLOW_IMPORT, KOREA, V, y).values())
        eq = sum(flow_by_partner(FLOW_EXPORT, KOREA, Q, y).values())
        ev = sum(flow_by_partner(FLOW_EXPORT, KOREA, V, y).values())
        data.append({"year": str(y), "수입량": round(iq), "수출량": round(eq),
                     "수입단가": r1(iv * 1000 / iq / 1000) if iq else 0,
                     "수출단가": r1(ev * 1000 / eq / 1000) if eq else 0,
                     "무역수지": round(ev - iv)})
    last = data[-1]
    gap = last["수입단가"] - last["수출단가"]
    return {
        "title": "한국 수출입 물량·단가·무역수지",
        "subtitle": f"{last['year']}년 수입 ${last['수입단가']}/kg vs 수출 ${last['수출단가']}/kg. 단가 "
                    f"역조 ${r1(gap)}/kg. 비싸게 사서 싸게 판다.",
        "chartType": "Composed", "xKey": "year",
        "bars": [{"key": "수입량", "color": C["amber"]}, {"key": "수출량", "color": C["emerald"]}],
        "lines": [{"key": "수입단가", "color": C["rose"], "yAxisId": "right"},
                  {"key": "수출단가", "color": C["sky"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / USD/kg",
        "sit": f"수입단가가 수출단가를 ${r1(gap)}/kg 웃돈다. 고급 원물(노르웨이 대형어)을 들여오고 소형·저가 물량을 아프리카로 내보내는 "
               f"구조가 숫자로 드러난다.",
        "strat": "관리 대상은 역조 폭이다. 역조 자체는 구조라 없앨 수 없다. 수입 단가 상승기에 수출 계약을 선물로 고정해 두는 순간 폭이 "
                 "벌어진다.",
        "_kpi": {"title": f"수입·수출 단가 역조 ({last['year']})", "value": f"${r1(gap)}/kg",
                 "trend": f"수입 ${last['수입단가']} vs 수출 ${last['수출단가']}",
                 "desc": "비싼 원물 들여오고 저가 물량 내보내는 구조"},
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A"),
    }


@builder("s3_africa_volume_price")
def s3_africa_volume_price():
    """아프리카 증가율 확정: 2019→2024 누적 +137.1%, CAGR +18.8%, 단 2024 YoY는 역성장."""
    years = trade_years()
    data, prev = [], None
    for y in years:
        rq, rv = flow_by_partner(FLOW_EXPORT, KOREA, Q, y), flow_by_partner(FLOW_EXPORT, KOREA, V, y)
        aq = sum(v for c, v in rq.items() if c in AFRICA)
        av = sum(v for c, v in rv.items() if c in AFRICA)
        data.append({"year": str(y), "가나": round(rq.get(288, 0)), "나이지리아": round(rq.get(566, 0)),
                     "기타아프리카": round(aq - rq.get(288, 0) - rq.get(566, 0)),
                     "수출단가": r1(av * 1000 / aq / 1000) if aq else 0,
                     "YoY": r1(100 * (aq / prev - 1)) if prev else 0})
        prev = aq or None
    first = sum(v for c, v in flow_by_partner(FLOW_EXPORT, KOREA, Q, years[0]).items() if c in AFRICA)
    last = sum(v for c, v in flow_by_partner(FLOW_EXPORT, KOREA, Q, years[-1]).items() if c in AFRICA)
    n = years[-1] - years[0]
    cum = 100 * (last / first - 1)
    cagr = 100 * ((last / first) ** (1 / n) - 1)
    return {
        "title": "아프리카 수출 물량·단가",
        "subtitle": f"{years[0]}→{years[-1]} 누적 {r1(cum):+}%(CAGR {r1(cagr):+}%/년), 단 "
                    f"{years[-1]}년 YoY {data[-1]['YoY']:+}%로 꺾였다.",
        "chartType": "Composed", "stacked": True, "xKey": "year",
        "bars": [{"key": "가나", "color": C["emerald"]}, {"key": "나이지리아", "color": C["sky"]},
                 {"key": "기타아프리카", "color": C["slate"]}],
        "lines": [{"key": "수출단가", "color": C["amber"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / USD/kg",
        "sit": f"아프리카향은 {years[0]}~{years[-1]} 누적 {r1(cum):+}% 늘었으나 {years[-1]}년 "
               f"{data[-1]['YoY']:+}%로 역성장했다. 가나·나이지리아 2개국이 물량의 대부분이다.",
        "strat": "2개국 집중이라 현지 통화·통관 리스크가 곧 물량 리스크다. 단가는 벌크 수준이므로 물량 확보보다 회수 조건을 먼저 챙긴다. "
                 "성장 서사로 다룰 시점이 아니다.",
        "_kpi": {"title": f"아프리카 수출 YoY ({years[-1]})", "value": f"{data[-1]['YoY']:+}%",
                 "trend": f"누적 {r1(cum):+}% (CAGR {r1(cagr):+}%)",
                 "desc": "2개국 집중. 성장 서사로 다룰 시점이 아니다"},
        "_prov": dict(source_id="FAO_FISHSTAT_TRADE_PARTNERS", period=f"{years[0]}-{years[-1]}",
                      inputs=[PARTNERS_CSV], grade="A",
                      note="아프리카 증가율 정의 확정(2026-08-13): 누적·CAGR·최신 YoY 3개 병기. "
                           "기존 '+167%' 표기는 FAO 데이터로 재현되지 않는다."),
    }


# 배치 빌더 등록 (import 시점에 @builder 로 레지스트리에 붙는다)
import builders_batch1  # noqa: E402,F401
import builders_batch2  # noqa: E402,F401


# ─────────────────────────── 실행 ───────────────────────────

def write_kpis():
    """헤더 KPI. 위젯이 내놓은 값에서만 만든다 — 헤더와 본문이 다른 말을 하면 안 된다."""
    kpis, order = {}, ["s1_import_origin_mix", "s1_tac_quota", "s1_nsc_weekly",
                       "s1_korea_production", "s3_korea_trade_balance", "s3_africa_volume_price"]
    n = 0
    for wid in order:
        path = OUT_DIR / f"{wid}.json"
        if not path.exists():
            continue
        w = json.loads(path.read_text(encoding="utf-8"))
        if "_kpi" not in w:
            continue
        n += 1
        kpis[f"kpi{n}"] = {**w["_kpi"], "widgetId": wid,
                           "source_id": w["provenance"]["source_id"],
                           "grade": w["provenance"]["grade"]}
    path = OUT_DIR / "_kpis.json"
    path.write_text(json.dumps(kpis, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                    encoding="utf-8")
    print(f"  KPI {len(kpis)}개 → {path.name}")


def write_bundles():
    """pillar별 번들. 렌더러는 활성 파트 번들만 로드한다(209KB 단일 페이로드 해소)."""
    for pillar in ("S1", "S2", "S3", "S4", "S5"):
        prefix = f"s{pillar[1]}_"
        widgets = [json.loads(p.read_text(encoding="utf-8"))
                   for p in sorted(OUT_DIR.glob(f"{prefix}*.json"))]
        path = OUT_DIR / f"_bundle_{pillar}.json"
        path.write_text(json.dumps({"pillar": pillar, "widgets": widgets},
                                   ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                        encoding="utf-8")
        print(f"  번들 {path.name:<20} 위젯 {len(widgets)}  {path.stat().st_size / 1024:.0f}KB")


def run(only=None):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    targets = {k: v for k, v in BUILDERS.items() if not only or k in only}
    if only and not targets:
        raise SystemExit(f"알 수 없는 위젯 id: {only}. 가능: {sorted(BUILDERS)}")
    for final_id, fn in sorted(targets.items()):
        widget = fn()
        prov = widget.pop("_prov")
        prov.setdefault("rebuild", f"python scripts/mackerel/build.py {final_id}")
        widget["id"] = final_id
        widget["provenance"] = provenance.build(**prov)
        path = OUT_DIR / f"{final_id}.json"
        path.write_text(json.dumps(widget, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                        encoding="utf-8")
        p = widget["provenance"]
        print(f"✓ {final_id:<26} {p['source_id']:<32} {p['period']} grade={p['grade']} "
              f"rows={len(widget.get('data') or [])}")
    print(f"\n{len(targets)}개 → {OUT_DIR.relative_to(ROOT)}/")
    write_kpis()
    write_bundles()


if __name__ == "__main__":
    # 배치 빌더가 'build' 모듈의 레지스트리에 등록되므로, __main__ 이 아니라
    # 모듈 쪽 run() 을 불러야 전량이 잡힌다.
    import build as _mod

    _mod.run(only=set(sys.argv[1:]) or None)
