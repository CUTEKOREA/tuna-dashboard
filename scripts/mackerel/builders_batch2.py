#!/usr/bin/env python3
"""Batch 2 빌더 — 1차 보고서(PDF+MD 짝) 및 주간 통계 기반 9건.

원칙: 원문에 적혀 있는 수치만 옮긴다. 보간·추정·확장 금지.
각 수치 옆의 주석은 근거 위치다. 값을 고칠 일이 생기면 원문을 먼저 확인할 것.

grade 규칙
  A = 기계 판독(xlsx) → method=script
  B = PDF/MD 수동 추출 → method=manual_extract
"""
from build import C, builder, r1
from scope import ARCHIVE

ICES_MD = ARCHIVE / "01_자연산_어획·자원/ices/2026-08-12_full/ICES_Atlantic_mackerel_advice_2026.md"
NPFC_MD = ARCHIVE / "01_자연산_어획·자원/npfc/2026-08-12_full/NPFC_TWG_CMSA11_report_2025.md"
NSC_XLSX = ARCHIVE / "03_무역·가격/norwegian_seafood_council/2026-08-12_full/NSC_herring_mackerel_week_32_2026.xlsx"
MSC_MD = ARCHIVE / "07_지속가능성·인증·ESG/msc/2026-08-12_full/MSC_small_pelagic_yearbook_2026.md"
GLOBEFISH_MD = ARCHIVE / "05_시장·소매·소비/globefish/2026-08-12_full/FAO_GLOBEFISH_small_pelagics_May_2026.md"
EUMOFA_MD = ARCHIVE / "05_시장·소매·소비/eumofa/2026-08-12_full/EUMOFA_Monthly_Highlights_4_2026.md"
KMI_MD = ARCHIVE / "03_무역·가격/kmi_fishdata/2026-08-12_full/KMI_popular_fish_June_2026.md"
FTA_JSON = "data/mackerel_fta_quarterly.json"


# ─────────────────────────── S1 ───────────────────────────

@builder("s1_tac_quota")
def s1_tac_quota():
    # ICES_MD:24 권고 2026 / :104 권고 2025 / :69,102 추정 어획 2025 / :160 평균 초과율
    advice_2026, advice_2025, catch_2025, avg_excess = 174357, 576958, 755143, 39
    data = [
        {"구분": "2025 권고", "톤": advice_2025},
        {"구분": "2025 실제 어획(추정)", "톤": catch_2025},
        {"구분": "2026 권고", "톤": advice_2026},
    ]
    cut = 100 * (advice_2026 / advice_2025 - 1)
    over = 100 * (catch_2025 / advice_2025 - 1)
    return {
        "title": "TAC·쿼터 변동과 물량 전망",
        "subtitle": f"ICES 2025-09-30 권고(대서양고등어, 아해역 1–8·14). 2026년 권고 {advice_2026:,}톤 — "
                    f"2025년 권고 {advice_2025:,}톤 대비 {r1(cut)}%. 2025년 실제 어획은 권고를 {r1(over)}% 초과했다.",
        "chartType": "Bar", "xKey": "구분",
        "bars": [{"key": "톤", "color": C["rose"]}],
        "data": data, "unit": "톤",
        "sit": f"2026년 대서양고등어 권고 어획량이 {advice_2026:,}톤으로 전년 권고 대비 {r1(cut)}% 잘렸다. "
               f"연안국 일방 쿼터 합계 때문에 실제 어획은 2010년 이후 평균 {avg_excess}% 권고를 초과해 왔고, "
               f"2025년에도 {r1(over)}% 초과했다.",
        "strat": "권고가 70% 잘려도 실제 어획은 그만큼 안 줄어든다는 것이 지난 15년의 기록이다. "
                 "다만 방향은 분명하다 — 대서양 원물은 계속 조인다. 노르웨이·영국 계약은 "
                 "물량 확보를 단가보다 앞세워 잡아야 한다.",
        "_kpi": {"title": "2026 대서양 권고 어획량", "value": f"{advice_2026:,}톤",
                 "trend": f"{r1(cut)}% (전년 권고 대비)",
                 "desc": f"실제 어획은 2010년 이후 평균 {avg_excess}% 권고 초과"},
        "_prov": dict(source_id="ICES_ATLANTIC_MACKEREL", period="2025-2026",
                      inputs=[ICES_MD], method="manual_extract", grade="B",
                      note="ICES advice 2026 원문 수동 추출. 권고 174,357톤(본문), 2025 권고 576,958톤(표2 각주), "
                           "2025 추정 어획 755,143톤(표1), 2010년 이후 평균 초과 39%(Issues relevant for the advice). "
                           "국제 합의 TAC는 존재하지 않는다."),
    }


@builder("s1_stock_status")
def s1_stock_status():
    # ICES_MD:63 SSB / :187 MSY Btrigger / :61 F / NPFC_MD:1150-1152 어획·한도
    ssb, btrigger, f_current = 2740823, 4119337, 0.29
    npfc_2018, npfc_2024, npfc_limit = 516000, 128586, 66740
    data = [
        {"지표": "대서양 SSB", "현재": round(100 * ssb / btrigger), "기준선": 100},
        {"지표": "태평양 어획(2024)", "현재": round(100 * npfc_2024 / npfc_2018), "기준선": 100},
    ]
    return {
        "title": "자원평가 상태 스코어카드 (ICES·NPFC)",
        "subtitle": f"대서양: SSB {ssb:,}톤 = MSY Btrigger({btrigger:,}톤)의 {round(100 * ssb / btrigger)}%, Blim 미만. "
                    f"태평양: 어획 {npfc_2018:,}톤(2018)→{npfc_2024:,}톤(2024), NPFC 2025 어획한도 {npfc_limit:,}톤.",
        "chartType": "Bar", "xKey": "지표",
        "bars": [{"key": "현재", "color": C["rose"]}, {"key": "기준선", "color": C["slate"]}],
        "data": data, "unit": "% (기준=100)",
        "sit": f"대서양고등어는 산란자원량이 Blim 아래이고 어획강도(F={f_current})는 FMSY 위다 — 자원평가상 최악 조합이다. "
               f"태평양참고등어도 2018년 대비 어획이 {r1(100 * (npfc_2024 / npfc_2018 - 1))}% 줄었다. "
               f"두 대양이 동시에 조인 상태다.",
        "strat": "대체 원산지 전략의 전제가 흔들린다. 대서양이 막히면 태평양으로라는 계획은 "
                 "태평양도 같이 줄고 있어 성립하지 않는다. 원산지가 아니라 어종·가공형태 대체를 봐야 한다.",
        "_prov": dict(source_id="ICES_ATLANTIC_MACKEREL", period="2024-2026",
                      inputs=[ICES_MD, NPFC_MD], method="manual_extract", grade="B",
                      note="ICES: SSB 2,740,823톤(표1 2025 전망), MSY Btrigger 4,119,337톤(표4), Fages4-8=0.29(표1). "
                           "NPFC: 516,000mt(2018)→128,586mt(2024), CMM 2025-07 어획한도 66,740mt. "
                           "두 자원은 종·해역이 달라 직접 비교가 아니라 각자의 기준선 대비 위치로만 읽어야 한다."),
    }


@builder("s1_nsc_weekly")
def s1_nsc_weekly():
    """NSC 주간 xlsx 기계 판독. 유일한 주간 해상도 소스."""
    import openpyxl
    wb = openpyxl.load_workbook(NSC_XLSX, data_only=True)
    ws = wb["Fryst makrell < 600g"]
    rows = {r[2]: r for r in ws.iter_rows(values_only=True) if r[2] in ("TOTALT", "EU27")}
    tot = rows["TOTALT"]
    # 열: 라벨, 주간물량, 주간단가, 전년동주물량, 전년동주단가, 누계물량, 누계단가, 전년누계물량, 전년누계단가
    wk_q, wk_p, wk_q_ly, wk_p_ly, ytd_q, ytd_p, ytd_q_ly, ytd_p_ly = tot[3:11]
    data = [
        {"구분": "주간 물량", "2026": wk_q, "2025": wk_q_ly},
        {"구분": "누계 물량", "2026": ytd_q, "2025": ytd_q_ly},
    ]
    dp = 100 * (ytd_p / ytd_p_ly - 1)
    dq = 100 * (ytd_q / ytd_q_ly - 1)
    return {
        "title": "노르웨이 주간 수출 물량·단가",
        "subtitle": f"노르웨이수산물위원회 2026년 32주 — 냉동고등어 600g 미만 FOB. "
                    f"누계 단가 {ytd_p} NOK/kg({r1(dp):+}%), 누계 물량 {ytd_q:,}톤({r1(dq):+}%).",
        "chartType": "Bar", "xKey": "구분",
        "bars": [{"key": "2026", "color": C["sky"]}, {"key": "2025", "color": C["slate"]}],
        "data": data, "unit": "톤",
        "sit": f"32주 누계 기준 노르웨이 수출 물량이 전년 대비 {r1(dq)}% 줄고 단가는 {r1(dp):+}% 올랐다. "
               f"주간 단가는 {wk_p} NOK/kg으로 전년 동주 {wk_p_ly} NOK/kg 대비 {r1(100 * (wk_p / wk_p_ly - 1)):+}%다. "
               f"물량이 반으로 줄면서 가격이 뛰는 전형적인 공급 축소 국면이다.",
        "strat": "이 시트는 600g 미만 소형 규격만 담는다. 대형어 계약 단가와 직접 비교하면 안 된다. "
                 "다만 방향성은 전 규격에 공통이므로 주간 단가 추세를 협상 타이밍 지표로 쓴다.",
        "_kpi": {"title": "노르웨이 수출단가 (2026 누계)", "value": f"{ytd_p} NOK/kg",
                 "trend": f"{r1(dp):+}% · 물량 {r1(dq):+}%",
                 "desc": "600g 미만 규격 FOB. 주간 해상도 유일 소스"},
        "_prov": dict(source_id="NORWEGIAN_SEAFOOD_EXPORTS", period="2026-W32",
                      inputs=[NSC_XLSX], grade="A",
                      note="시트 'Fryst makrell < 600g' TOTALT 행. HS 03035401·03035403. "
                           "NOK 표시이며 원화 환산은 하지 않았다. 600g 미만 규격 한정."),
    }


# ─────────────────────────── S3 ───────────────────────────

@builder("s3_fta_quarterly")
def s3_fta_quarterly():
    """KMI FTA 분기 보고서 21건 수동 추출본. 기존 저장소 데이터를 그대로 승계한다."""
    import json
    from build import ROOT
    src = ROOT / FTA_JSON
    raw = json.loads(src.read_text(encoding="utf-8"))
    data = [{"year": r["year"], "수입물량": r["volume"], "수입금액": r["value"]}
            for r in raw["yearly"]]
    first, last = data[0], data[-1]
    dq = 100 * (last["수입물량"] / first["수입물량"] - 1)
    dv = 100 * (last["수입금액"] / first["수입금액"] - 1)
    return {
        "title": "FTA 체결국 수입 물량·금액 추이",
        "subtitle": f"KMI FTA 수산물 수입동향 보고서 21개 분기 원문에서 수동 추출. "
                    f"{first['year']}→{last['year']} 물량 {r1(dq):+}% / 금액 {r1(dv):+}% — 금액이 물량보다 빠르게 늘었다.",
        "chartType": "Composed", "xKey": "year",
        "bars": [{"key": "수입물량", "color": C["sky"]}],
        "lines": [{"key": "수입금액", "color": C["amber"], "yAxisId": "right"}],
        "data": data, "unit": "천톤 / 백만USD",
        "sit": f"{first['year']}년 이후 수입 물량은 {r1(dq):+}% 늘었는데 금액은 {r1(dv):+}% 늘었다. "
               f"증가분의 상당 부분이 물량이 아니라 단가다. 관세 인하 효과가 단가 상승에 상쇄되고 있다.",
        "strat": "이 위젯만 갱신 주기가 사람 손에 달려 있다. 분기 보고서 발간일을 캘린더에 걸어두고 "
                 "추출이 밀리면 화면의 최신 분기가 곧 신뢰도 상한이라는 것을 인지해야 한다.",
        "_prov": dict(source_id="KMI_FISHERIES_OUTLOOK", period="분기",
                      inputs=[KMI_MD], method="manual_extract", grade="B",
                      note=f"수치 출처는 저장소 내 {FTA_JSON}(KMI 보고서 21건 수동 추출본). "
                           "아카이브 KMI 자료로 재검증이 필요하며 자동 재현되지 않는다."),
    }


# ─────────────────────────── S4 ───────────────────────────

@builder("s4_eu_retail_inflation")
def s4_eu_retail_inflation():
    # EUMOFA_MD:847-855 Table 14 FIRST-SALES PRICE OF SMALL PELAGICS
    data = [
        {"국가": "아일랜드", "2025-01": 2.12, "2026-01": 4.00, "증감": 89},
        {"국가": "덴마크", "2025-01": 2.15, "2026-01": 1.84, "증감": -14},
    ]
    return {
        "title": "EU 산지 1차 판매가 (고등어)",
        "subtitle": "EUMOFA Monthly Highlights 4/2026 표14 — 2026년 1월 vs 2025년 1월 1차 판매가. "
                    "아일랜드 2.12→4.00 EUR/kg(+89%), 덴마크 2.15→1.84 EUR/kg(−14%).",
        "chartType": "Bar", "xKey": "국가",
        "bars": [{"key": "2025-01", "color": C["slate"]}, {"key": "2026-01", "color": C["emerald"]}],
        "data": data, "unit": "EUR/kg",
        "sit": "같은 달 같은 어종인데 국가별로 정반대로 움직였다. 아일랜드는 +89%, 덴마크는 −14%다. "
               "EU 역내에서도 산지 가격이 하나의 시세로 수렴하지 않는다.",
        "strat": "'유럽 시세'라는 단일 기준값은 존재하지 않는다. 소싱 국가를 특정하지 않은 "
                 "유럽 가격 인용은 협상에서 근거로 쓸 수 없다.",
        "_prov": dict(source_id="EUMOFA_MARKET", period="2025-01 / 2026-01",
                      inputs=[EUMOFA_MD], method="manual_extract", grade="B",
                      note="EUMOFA 표14 원문 2개국만 고등어 항목이 있다. 표본이 작아 EU 전체를 대표하지 않는다."),
    }


@builder("s4_korea_retail")
def s4_korea_retail():
    # KMI_MD 2026년 6월호(통권 384호) 대중성 어종 고등어
    apr, may, price = 10806, 3214, 11474
    data = [
        {"월": "2026-04", "생산량": apr},
        {"월": "2026-05", "생산량": may},
    ]
    return {
        "title": "국내 생산량·소비자가격 (월간)",
        "subtitle": f"KMI 수산관측 2026년 6월호 — 5월 생산 {may:,}톤(전월 대비 −70%), "
                    f"소비자가격 kg당 {price:,}원. 고등어 금어기 4.30~7.3 및 대형선망 자율휴어기 영향.",
        "chartType": "Bar", "xKey": "월",
        "bars": [{"key": "생산량", "color": C["sky"]}],
        "data": data, "unit": "톤",
        "sit": f"5월 국내 생산이 {may:,}톤으로 전월 대비 70% 급감했다. 금어기(4.30~7.3)와 "
               f"대형선망 자율휴어기가 겹친 계절 요인이며 자원 감소와는 구분해서 읽어야 한다.",
        "strat": "금어기 구간은 매년 반복된다. 이 시기 국내 물량 공백을 수입으로 메우는 관행이 "
                 "노르웨이 의존을 구조적으로 굳힌다. 휴어기 전 재고 확보가 단가 방어의 핵심이다.",
        "_prov": dict(source_id="KMI_FISHDATA_PRICE", period="2026-04~2026-05",
                      inputs=[KMI_MD], method="manual_extract", grade="B",
                      note="KMI 수산관측 2026년 6월호(통권 384호) 대중성 어종 고등어 항목. "
                           "소비자가격은 월 대표값이며 규격·채널별 편차가 있다."),
    }


@builder("s4_globefish_brief")
def s4_globefish_brief():
    # GLOBEFISH_MD 상단 요약 + 페루 멸치 실적
    data = [
        {"항목": "페루 멸치 어획 2024", "백만톤": 4.80},
        {"항목": "페루 멸치 어획 2025", "백만톤": 4.25},
    ]
    return {
        "title": "소형부어류 수급 브리핑",
        "subtitle": "FAO GLOBEFISH 2026년 5월 분기분석 — 노르웨이산 대서양고등어 가격이 "
                    "2025·2026 연속 쿼터 감축으로 최근 없던 수준까지 올랐고, 수요가 태평양참고등어·"
                    "칠레전갱이 등 저가 어종으로 이동 중이다.",
        "chartType": "Bar", "xKey": "항목",
        "bars": [{"key": "백만톤", "color": C["amber"]}],
        "data": data, "unit": "백만 톤",
        "sit": "FAO는 2025년 아시아가 냉동 소형부어류 최대 지역시장이었다고 본다. 고등어 가격 급등의 "
               "원인을 2025·2026 쿼터 감축으로 지목하며, 소비자·가공업체가 대체 어종을 찾고 있다고 기록했다. "
               "페루 멸치는 2025년 425만톤으로 전년 480만톤 대비 11.5% 감소했다.",
        "strat": "대체 수요가 태평양참고등어로 몰리면 우리가 아프리카에 파는 물량의 경쟁 상대가 늘어난다. "
                 "고등어 가격 상승이 수출에 유리하다고만 볼 수 없다.",
        "_prov": dict(source_id="FAO_GLOBEFISH_SMALL_PELAGICS", period="2026-05",
                      inputs=[GLOBEFISH_MD], method="manual_extract", grade="B",
                      note="GLOBEFISH Quarterly Small Pelagics Analysis 2026년 5월호 요약부 및 페루 멸치 실적. "
                           "고등어 가격 '최근 없던 수준'은 원문 서술이며 구체 수치는 제시되지 않았다."),
    }


# ─────────────────────────── S5 ───────────────────────────

@builder("s5_msc_cert")
def s5_msc_cert():
    # MSC_MD:44-45,58-59,87 Small Pelagics Yearbook 2026
    data = [
        {"어종군": "백색어류", "MSC 참여율": 80},
        {"어종군": "참치", "MSC 참여율": 63},
        {"어종군": "소형부어류", "MSC 참여율": 14},
    ]
    return {
        "title": "MSC 인증 커버리지",
        "subtitle": "MSC Small Pelagics Yearbook 2026 — 소형부어류 어업의 MSC 참여율은 14%로 "
                    "백색어류 80%·참치 63%에 크게 못 미친다. 글로벌 소형부어류 어획의 13%만 MSC 인증이다.",
        "chartType": "Bar", "xKey": "어종군",
        "bars": [{"key": "MSC 참여율", "color": C["emerald"]}],
        "data": data, "unit": "%",
        "sit": "고등어가 속한 소형부어류는 지속가능성 인증에서 가장 뒤처진 어종군이다. "
               "MSC 참여 어업이 전체 소형부어류 어획의 20% 미만을 차지하며, "
               "인증 물량의 58%는 통조림으로 간다.",
        "strat": "인증 원물 확보가 어렵다는 뜻이자, 확보하면 차별화가 된다는 뜻이다. "
                 "유럽·미국 대형 유통 납품을 노린다면 인증 물량 선점이 진입 조건에 가깝다.",
        "_prov": dict(source_id="MSC_MACKEREL_FISHERIES", period="2026",
                      inputs=[MSC_MD], method="manual_extract", grade="B",
                      note="MSC Small Pelagics Yearbook 2026: 소형부어류 14%·백색어류 80%·참치 63% 참여율, "
                           "글로벌 어획의 13% 인증, 인증 물량의 58%가 통조림. "
                           "MSC는 제3자 인증기관이며 공공기관 통계가 아니다."),
    }


@builder("s3_kcs_monthly")
def s3_kcs_monthly():
    """관세청 HS10 월별 통관 실적. FAO(2024)보다 최신인 2026 YTD 실측."""
    import csv as _csv
    from collections import defaultdict as _dd
    from scope import KCS_HS_CSV, KCS_MACKEREL_HS

    by_month = _dd(lambda: [0.0, 0.0])          # month -> [kg, USD]
    by_country = _dd(float)                      # country -> kg
    with KCS_HS_CSV.open(encoding="utf-8-sig") as fh:
        for r in _csv.DictReader(fh):
            if r["hs_query"] not in KCS_MACKEREL_HS or r["year"] == "총계":
                continue
            kg, usd = float(r["impWgt"] or 0), float(r["impDlr"] or 0)
            if kg <= 0:
                continue
            by_month[r["year"]][0] += kg
            by_month[r["year"]][1] += usd
            by_country[r["statCdCntnKor1"] or "미상"] += kg

    months = sorted(by_month)
    data = [{"월": m, "수입량": round(by_month[m][0] / 1000),
             "수입단가": round(by_month[m][1] / by_month[m][0], 2)} for m in months]
    tot_kg = sum(v[0] for v in by_month.values())
    top = sorted(by_country.items(), key=lambda kv: -kv[1])[:3]
    top_s = " · ".join(f"{c} {100 * v / tot_kg:.1f}%" for c, v in top)
    return {
        "title": "관세청 HS10별 월별 수입 실적 (2026)",
        "subtitle": f"관세청 품목별 수출입실적 {months[0]}~{months[-1]} 누계 {tot_kg / 1000:,.0f}톤. "
                    f"원산지 {top_s}. HS 030244·030354·160415.",
        "chartType": "Composed", "xKey": "월",
        "bars": [{"key": "수입량", "color": C["sky"]}],
        "lines": [{"key": "수입단가", "color": C["rose"], "yAxisId": "right"}],
        "data": data, "unit": "톤 / USD/kg",
        "sit": f"2026년 통관 실적은 FAO 연간 통계(2024)보다 1~2년 앞선 유일한 국내 실측이다. "
               f"누계 {tot_kg / 1000:,.0f}톤이며 {top[0][0]}이 {100 * top[0][1] / tot_kg:.1f}%를 차지한다.",
        "strat": "월별 단가 추이가 곧 계약 타이밍 지표다. FAO·NSC가 보여주는 국제 가격 방향과 "
                 "국내 통관 단가가 벌어지는 구간이 재고 확보 기회다.",
        "_prov": dict(source_id="KCS_NITEMTRADE", period=f"{months[0]}~{months[-1]}",
                      inputs=[KCS_HS_CSV], grade="A",
                      note="2026-07-06 수집본. 관세청 API가 현재 서비스키 없이 401이라 자동 갱신 불가 — "
                           "키 확보 전까지 이 스냅샷이 최신이다. 범용 HS 030489는 고등어 전용이 아니라 제외."),
    }
