#!/usr/bin/env python3
"""
P1/P2 신규 위젯 Batch 2 — mackerel 4 + galchi 5 + squid 6 (검증완료·JSON 주입형).
JSON widgets[]에 append(id 중복 skip) + 백업(.bak_p1p2). 화이트리스트 패치는 별도 Edit.
수치는 artifacts enrichment + 실데이터 JSON(mackerel_fta_quarterly·squid_korea_supply) 검증치만. 날조 없음.
렌더러 스키마:
  - mackerel: NEW 포맷(xKey + bars/lines/areas). source(apiSource 금지!)·sit·strat·subtitle·reliability(>70=SYNCED).
  - galchi:   NEW 포맷(xKey + bars/lines, key+name). sit·strat·source·subtitle·telemetry/syncDate(STATIC 무시→SYNCED).
  - squid:    OLD 포맷(xAxis + series[{dataKey,color|type,yAxisId}]). sit·strat·source·cardDesc·reliability(<70=STATIC).
"""
import json, shutil, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ───────────── MACKEREL (NEW 포맷) ─────────────
MACKEREL = [
    {
        "id": "w_kosis_prod_value", "title": "한국 고등어류 생산량 6개년 추이 (KOSIS)",
        "subtitle": "KOSIS 어업생산동향조사(2024 잠정) · 생산금액 241,538→203,172백만원(-15.9%)",
        "chartType": "Bar", "xKey": "year",
        "bars": [{"key": "생산량(톤)", "color": "#0ea5e9"}],
        "data": [
            {"year": "2019", "생산량(톤)": 121373}, {"year": "2020", "생산량(톤)": 82839},
            {"year": "2021", "생산량(톤)": 151029}, {"year": "2022", "생산량(톤)": 152574},
            {"year": "2023", "생산량(톤)": 163001}, {"year": "2024", "생산량(톤)": 134604},
        ],
        "unit": "톤", "reliability": 95, "syncDate": "2025-02",
        "source": "KOSIS 어업생산동향조사(2024 잠정, 2025-02-21 공표)",
        "sit": "고등어류 국내 생산량이 2023년 163,001톤에서 2024년 134,604톤으로 -17.4% 급감했고, 생산금액도 241,538백만원에서 203,172백만원으로 -15.9% 동반 하락했습니다. 물량과 금액이 함께 꺾이며 원물 조달 기반이 구조적으로 위축되고 있습니다.",
        "strat": "약세 분기에는 산지 직매입 비중을 높여 단가 하락분을 선취하고 비축 물량을 확보해, 차기 쿼터 쇼크에 대비하는 카운터-사이클 매입 전략을 실행해야 합니다.",
    },
    {
        "id": "w_fta_import_trend", "title": "FTA 체결국 고등어 수입 물량·금액 6년 추이",
        "subtitle": "KMI FTA 수입동향(2026-05-27) · 냉동 97.7% · 2025 사상 최고 선제 매집",
        "chartType": "Composed", "xKey": "year", "dualAxis": True,
        "bars": [{"key": "수입물량(천톤)", "color": "#3b82f6"}],
        "lines": [{"key": "수입금액(백만$)", "color": "#ef4444", "yAxisId": "right"}],
        "data": [
            {"year": "2020", "수입물량(천톤)": 40.1, "수입금액(백만$)": 82.8},
            {"year": "2021", "수입물량(천톤)": 50.3, "수입금액(백만$)": 102.2},
            {"year": "2022", "수입물량(천톤)": 50.0, "수입금액(백만$)": 120.2},
            {"year": "2023", "수입물량(천톤)": 57.0, "수입금액(백만$)": 145.1},
            {"year": "2024", "수입물량(천톤)": 44.9, "수입금액(백만$)": 122.9},
            {"year": "2025", "수입물량(천톤)": 61.7, "수입금액(백만$)": 201.1},
        ],
        "unit": "천톤 / 백만$", "reliability": 92, "syncDate": "2026-05",
        "source": "KMI FTA 체결국 수산물 수입동향(2026-05-27)",
        "sit": "FTA 체결국발 고등어 수입은 2025년 물량 61.7천톤·금액 201.1백만달러로 사상 최고를 기록했습니다. 2024년 쿼터 압박으로 44.9천톤까지 둔화됐다가 2025년 수입업계의 선제 매집으로 +37% 반등했으며, 단가 상승으로 금액 증가폭이 물량을 앞섭니다.",
        "strat": "단가 급등 국면의 선제 매집은 재고 비용 리스크를 키우므로, 무관세 TRQ 한도 내 물량을 우선 통관하고 단가 피크 구간에서는 분할 매입으로 평균 단가를 평탄화해야 합니다.",
    },
    {
        "id": "w_origin_diversification", "title": "수입 원산지 다변화 — 노르웨이→영국·칠레 (분기)",
        "subtitle": "KMI FTA 분기(2026-05-27) · 2026Q1 점유 노르웨이 73.9%·영국 12.1%·중국 8.0%",
        "chartType": "Bar", "xKey": "country",
        "bars": [
            {"key": "2025Q1(천톤)", "color": "#94a3b8"},
            {"key": "2026Q1(천톤)", "color": "#3b82f6"},
        ],
        "data": [
            {"country": "노르웨이", "2025Q1(천톤)": 14.2, "2026Q1(천톤)": 6.1},
            {"country": "영국", "2025Q1(천톤)": 0.3, "2026Q1(천톤)": 1.0},
            {"country": "중국", "2025Q1(천톤)": 3.3, "2026Q1(천톤)": 1.9},
        ],
        "unit": "천톤", "reliability": 90, "syncDate": "2026-05",
        "source": "KMI FTA 분기 originShift(2026-05-27)",
        "sit": "노르웨이산 한국향 1분기 수입이 2025Q1 14.2천톤에서 2026Q1 6.1천톤으로 -62.9% 급감한 반면, 영국산은 0.3→1.0천톤(+216%)으로 급증했습니다. 노르웨이 점유율은 73.9%로 여전히 최대지만 영국(12.1%)·중국(8.0%)으로 공급원이 다변화되고 있습니다.",
        "strat": "노르웨이 쿼터 감축이 구조적 다변화를 강제하므로, 한-영 FTA 수혜 영국산 비중을 분기 단위로 고정 편입해 노르웨이 단일 의존 리스크를 선제 헤지해야 합니다.",
    },
    {
        "id": "w_trq_scenario", "title": "고등어 할당관세(TRQ) 한도 2배 확대 시나리오",
        "subtitle": "Korea Times·정책브리핑 · 무관세 한도 소진 후 MFN 10% 복귀",
        "chartType": "Bar", "xKey": "구분",
        "bars": [{"key": "한도(톤)", "color": "#10b981"}],
        "data": [
            {"구분": "2025 TRQ", "한도(톤)": 10000},
            {"구분": "2026 TRQ", "한도(톤)": 20000},
            {"구분": "2026 추가배정", "한도(톤)": 2000},
        ],
        "unit": "톤", "reliability": 85, "syncDate": "2026-01",
        "source": "Korea Times·정책브리핑(할당관세 확대 시행, 2026)",
        "sit": "정부가 고등어 할당관세(TRQ) 무관세 한도를 2025년 10,000톤에서 2026년 20,000톤으로 2배 확대했고, 별도 2,000톤이 추가 배정됐습니다. 한도 소진 후에는 MFN 10%로 복귀해 한도 내 무관세 물량 확보가 착지원가를 좌우합니다.",
        "strat": "2026 TRQ 22,000톤 한도를 연초에 선점 소진해 무관세 효과를 극대화하고, 한도 임박 시 MFN 10% 복귀 전 잔여 물량을 앞당겨 통관해 관세 비용을 회피해야 합니다.",
    },
]

# ───────────── GALCHI (NEW 포맷, key+name) ─────────────
GALCHI = [
    {
        "id": "w_galchi_no_aqua", "title": "갈치 양식 부재 — 100% 야생어획 (FAO 전수)",
        "subtitle": "FAO FishStat 전수 검증 — 갈치 생산 8,256행 전부 어획, 양식 0건",
        "chartType": "Bar", "xKey": "category", "unit": "레코드 수", "reliability": 95,
        "telemetry": "SYNCED", "syncDate": "FAO FishStat 2022",
        "bars": [{"key": "records", "name": "생산 레코드 수", "color": "#14b8a6"}],
        "data": [{"category": "어획(Capture)", "records": 8256}, {"category": "양식(Aquaculture)", "records": 0}],
        "source": "FAO FishStat 갈치 글로벌 생산 전수(8,256행)",
        "sit": "FAO FishStat 갈치 생산 8,256행이 전부 어획(Capture)이며 양식(Aquaculture)은 0건입니다. 공급 100%가 야생어획이라 가격 급등기에도 증산으로 완충할 수단이 구조적으로 부재합니다.",
        "strat": "공급 완충 수단이 재고·선도계약뿐이므로, 어획 부진 사이클에 대비한 3개월분 의무 비축 룰을 명문화해 가격 변동성에 대응해야 합니다.",
    },
    {
        "id": "w_galchi_fbs_pelagic", "title": "수산물 공급·이용 계정 (표층어류, 2020)",
        "subtitle": "FAOSTAT FBS — 2010~2023 전 연도 flag E(추정) · 1인 단백 4.63g/일",
        "chartType": "Bar", "xKey": "category", "unit": "천톤", "reliability": 75,
        "telemetry": "STATIC", "syncDate": "FAOSTAT FBS 2020",
        "bars": [{"key": "kt", "name": "2020 (천톤)", "color": "#0d9488"}],
        "data": [
            {"category": "생산", "kt": 737}, {"category": "수입", "kt": 660},
            {"category": "식용", "kt": 745}, {"category": "사료", "kt": 252},
        ],
        "source": "FAOSTAT FBS 표층어류 공급·이용 계정(2020, flag E 추정)",
        "sit": "FAOSTAT 표층어류 2020년 공급·이용 계정은 생산 737·수입 660·식용 745·사료 252천톤이며 1인 단백 공급 4.63g/일입니다. 단 2010~2023 전 연도가 flag E(추정)이라 실측이 아닌 FAO 추정 시계열입니다.",
        "strat": "표층어류 식용 공급의 수입 의존(660천톤)이 큰 구조이므로 갈치 수입 안정화를 핵심 리스크로 관리하되, 추정치임을 의사결정에 명시해야 합니다.",
    },
    {
        "id": "w_galchi_kr_import_rank", "title": "한국 수산물 수입 공급국 (2023, 전체 기준)",
        "subtitle": "USDA GAIN 2024 Table A1-1 — 수산물 전체 기준(갈치 단일 아님)",
        "chartType": "Bar", "xKey": "country", "unit": "백만달러", "reliability": 80,
        "telemetry": "STATIC", "syncDate": "GAIN 2024",
        "bars": [{"key": "musd", "name": "2023 수입액(백만$)", "color": "#0d9488"}],
        "data": [
            {"country": "중국", "musd": 1296}, {"country": "러시아", "musd": 1090}, {"country": "기타", "musd": 3543},
        ],
        "source": "USDA GAIN Korea Seafood 2024 (Table A1-1)",
        "sit": "2023년 한국 수산물 수입은 중국 $1,296M(+3.8%)·러시아 $1,090M(-23.1%)로 양강 구도이며 전체 $5,929M(-8.3%)로 축소됐습니다. 수산물 전체 기준이라 갈치 단일 품목이 아님을 명시합니다.",
        "strat": "중국·러시아 양강 의존 구조에서 베트남·노르웨이를 보조 공급권으로 등급화해 단일 산지 충격에 대비해야 합니다.",
    },
    {
        "id": "w_galchi_self_sufficiency", "title": "한국 수산물 자급률 추이 (전체 기준)",
        "subtitle": "USDA GAIN 2024 Table 5 — 전체 기준(갈치 단일 아님), 2023 추정",
        "chartType": "Composed", "xKey": "year", "unit": "%", "reliability": 80,
        "telemetry": "STATIC", "syncDate": "GAIN 2024",
        "lines": [{"key": "selfSufficiency", "name": "자급률(%)", "color": "#ef4444"}],
        "data": [
            {"year": "2016", "selfSufficiency": 71.4}, {"year": "2021", "selfSufficiency": 70.9}, {"year": "2023", "selfSufficiency": 64.8},
        ],
        "source": "USDA GAIN Korea Seafood 2024 (Table 5)",
        "sit": "한국 수산물 자급률은 2016년 71.4%에서 2021년 70.9%, 2023년 64.8%(추정)로 하락했습니다. 자급률 하락은 수입 의존 심화를 의미합니다.",
        "strat": "자급률 하락 추세에 맞춰 갈치 수입 공급망 다변화·비축을 내수 물가 방어의 핵심 KPI로 격상해야 합니다.",
    },
    {
        "id": "w_galchi_protein_cross", "title": "대체단백 교차압력 — 1인당 수산소비 -11%",
        "subtitle": "USDA GAIN 2024+FAOSTAT — 육류 CAGR 2.6% vs 수산 1.4%(2016-22)",
        "chartType": "Composed", "xKey": "year", "unit": "kg/년", "reliability": 75,
        "telemetry": "STATIC", "syncDate": "GAIN 2024",
        "lines": [{"key": "perCapita", "name": "1인당 수산소비(kg/년)", "color": "#0ea5e9"}],
        "data": [{"year": "2011", "perCapita": 59.53}, {"year": "2023", "perCapita": 52.82}],
        "source": "USDA GAIN 2024 + FAOSTAT FBS (육류 vs 수산 1인당 소비)",
        "sit": "한국 1인당 수산물 소비는 2011년 59.53kg에서 2023년 52.82kg으로 11% 감소했고, 같은 기간 육류 소비 증가율(CAGR 2.6%)이 수산(1.4%)을 앞서 2019~2022년 육류가 수산을 추월했습니다.",
        "strat": "수산 수요 둔화와 육류 대체 압력을 전제로 갈치를 가격 경쟁이 아닌 프리미엄·간편식(HMR)으로 재포지셔닝해야 합니다.",
    },
]

# ───────────── SQUID (OLD 포맷: xAxis + series) ─────────────
_SQUID_PRICE = [[2000,2187],[2001,2583],[2002,2175],[2003,2400],[2004,1822],[2005,2023],[2006,1990],
                [2007,2328],[2008,2234],[2009,2124],[2010,2550],[2011,2629],[2012,2749],[2013,2674],
                [2014,2422],[2015,2376],[2016,2657],[2017,2888],[2018,3605],[2019,3351],[2020,3137],
                [2021,2752],[2022,3063],[2023,3223]]
SQUID = [
    {
        "id": "w_squid_origin_diversification_2025", "title": "수입 산지 다변화 — 페루 +47% vs 중국 -0.7% (2025)",
        "cardDesc": "KMI _152 — 산지별 수입 증감률(2025 1-8월 누계)",
        "chartType": "bar", "xAxis": "원산지", "unit": "%", "reliability": 88, "syncDate": "2025-08",
        "series": [{"dataKey": "증감률(%)", "color": "#d946ef"}],
        "data": [
            {"원산지": "페루", "증감률(%)": 47}, {"원산지": "칠레", "증감률(%)": 10},
            {"원산지": "중국", "증감률(%)": -0.7}, {"원산지": "미국", "증감률(%)": -5.0},
        ],
        "source": "KMI _152 보고서(데이터 2025.06~08)",
        "sit": "2025년 1-8월 누계 수입은 페루 +47%로 급증한 반면 전통 1위 중국은 -0.7%로 정체했습니다. 8월 단월 냉동동체 수입은 +60.0%로 페루발 회복이 가속화되고 있습니다.",
        "strat": "중국 의존을 페루·에콰도르로 분산하는 3극 헷지 룰을 가동하고, 페루 어획 호조 구간에 6개월 선도 매입으로 평균 단가를 락-인해야 합니다.",
    },
    {
        "id": "w_squid_falkland_loligo_biomass", "title": "포클랜드 Loligo 자원평가 — 1만톤 보전 임계선",
        "cardDesc": "FIFD VUAEAC 2025(Crown Copyright) — 포클랜드 Loligo 1차시즌 바이오매스 vs 1만톤 임계선",
        "chartType": "composed", "xAxis": "season", "unit": "톤", "reliability": 90, "syncDate": "2024 시즌",
        "series": [
            {"dataKey": "1차시즌 바이오매스(톤)", "type": "bar", "color": "#8b5cf6", "yAxisId": "left"},
            {"dataKey": "보전 임계선(톤)", "type": "line", "color": "#ef4444", "yAxisId": "left"},
        ],
        "data": [
            {"season": "2020", "1차시즌 바이오매스(톤)": 52941, "보전 임계선(톤)": 10000},
            {"season": "2021", "1차시즌 바이오매스(톤)": 145482, "보전 임계선(톤)": 10000},
            {"season": "2022", "1차시즌 바이오매스(톤)": 242913, "보전 임계선(톤)": 10000},
            {"season": "2023", "1차시즌 바이오매스(톤)": 160375, "보전 임계선(톤)": 10000},
            {"season": "2024", "1차시즌 바이오매스(톤)": 138471, "보전 임계선(톤)": 10000},
        ],
        "source": "FIFD VUAEAC 2025 (Crown Copyright) — 1차 시즌 2020~2024",
        "sit": "포클랜드 Loligo(D. gahi) 1차 시즌 바이오매스는 2020년 52,941톤에서 2022년 242,913톤으로 정점을 찍은 뒤 2024년 138,471톤으로 조정됐습니다. FIG는 escapement 10,000톤을 자원 보전 마지노선으로 관리합니다.",
        "strat": "바이오매스가 1만톤 임계 대비 13배 이상 여유가 있는 2024 구간에 채낚기 라이선스를 선제 확보하고, 임계 접근 시 페루·아르헨티나 트롤 원물로 즉시 전환하는 룰을 운영해야 합니다.",
    },
    {
        "id": "w_squid_global_processing_yield", "title": "글로벌 가공유형 — 페루 단순냉동 94.7% 정체",
        "cardDesc": "FAO FishStat 가공통계(9.CSV, 2023, CC-BY-4.0) — 페루 가공 오징어 형태별",
        "chartType": "bar", "xAxis": "가공형태", "unit": "톤", "reliability": 90, "syncDate": "2023",
        "series": [{"dataKey": "2023 생산량(톤)", "color": "#a855f7"}],
        "data": [
            {"가공형태": "냉동동체", "2023 생산량(톤)": 354310},
            {"가공형태": "링(rings)", "2023 생산량(톤)": 19457},
            {"가공형태": "조제품(prepared)", "2023 생산량(톤)": 334},
        ],
        "source": "FAO FishStat 가공통계 9.오징어 가공 생산량 1976-2023 (CC-BY-4.0)",
        "sit": "2023년 페루 가공 오징어는 냉동동체 354,310톤·링 19,457톤·조제품 334톤으로 단순냉동 비중이 94.7%에 달합니다. 고부가 가공(링·조제) 전환율은 5% 미만으로 정체돼 있습니다.",
        "strat": "단순냉동 94.7% 구조는 한국 가공 내재화(링·튜브·진미채)로 마진을 흡수할 여백이 큽니다 — 페루 냉동 원물을 국내 가공 후 B2B 직납하는 라인을 CAPEX 1순위로 검토해야 합니다.",
    },
    {
        "id": "w_squid_route_leadtime_compliance", "title": "수입 루트 리드타임·IUU/ITQ 컴플라이언스",
        "cardDesc": "내부 정성모델(origin_diversification·compliance_risk.json) — 실측 운임 미연동(STATIC)",
        "chartType": "bar", "xAxis": "산지", "unit": "일", "reliability": 60, "syncDate": "2026-05-30",
        "series": [{"dataKey": "수입 리드타임(일)", "color": "#d946ef"}],
        "data": [
            {"산지": "포클랜드", "수입 리드타임(일)": 80},
            {"산지": "아르헨티나", "수입 리드타임(일)": 55},
            {"산지": "중국 공해", "수입 리드타임(일)": 30},
        ],
        "source": "내부모델(origin_diversification·compliance_risk.json) — 실측 운임 미연동·정성 스코어",
        "sit": "산지별 수입 리드타임은 포클랜드 80일·아르헨티나 55일·중국 공해 30일이며, 내부 컴플라이언스 모델상 포클랜드는 ITQ 85/IUU 15로 우수, 중국 공해 조업은 ITQ 10/IUU 95로 고위험입니다. (정성 내부모델·실측 운임 미연동)",
        "strat": "리드타임이 짧은 중국산은 IUU 95 고위험이라 EU CSDDD·미국 UFLPA 노출이 큽니다 — 리드타임 페널티를 감수하더라도 포클랜드 ITQ 원물 비중을 단계적으로 확대해야 합니다.",
    },
    {
        "id": "w_squid_forced_labor_dwf_carbon", "title": "강제노동·DWF 지배 — EJF 추적 343척 구성",
        "cardDesc": "EJF Bright Lights(2025)+CCP Global Fishing Offensive(2026) — 공해시간 +65%·63% 폭력연관",
        "chartType": "bar", "xAxis": "선적국", "unit": "%", "reliability": 90, "syncDate": "2026-05",
        "series": [{"dataKey": "EJF 추적 선박 비중(%)", "color": "#f43f5e"}],
        "data": [
            {"선적국": "중국", "EJF 추적 선박 비중(%)": 74.6},
            {"선적국": "대만", "EJF 추적 선박 비중(%)": 18.0},
            {"선적국": "한국", "EJF 추적 선박 비중(%)": 6.7},
        ],
        "source": "EJF Bright Lights(2025) + CCP Global Fishing Offensive(2026)",
        "sit": "EJF가 추적한 343척 중 중국이 74.6%·대만 18.0%·한국 6.7%를 차지하며, 공해 조업시간이 +65% 급증하고 63.0%가 폭력 사건과 연관됐습니다. 중국 원양어업(DWF)은 글로벌 어업노력의 44%·연 1.1억 시간을 점유합니다.",
        "strat": "중국 DWF의 강제노동·IUU 리스크가 EU·미국 규제 임계에 도달했습니다 — 중국산 비중을 ESG 정합 산지(포클랜드·페루)로 전환하고 면세유 탄소 프록시를 IR 지속가능성 지표로 표준 공시해야 합니다.",
    },
    {
        "id": "w_squid_import_unit_price_mt", "title": "수입 통관단가 23년 추이 ($/MT)",
        "cardDesc": "FAOSTAT 파생(squid_korea_supply.json) — 통관단가($/MT), 자급률은 w2_korea_supply 참조",
        "chartType": "line", "xAxis": "Year", "unit": "$/MT", "reliability": 90, "syncDate": "2023",
        "series": [{"dataKey": "수입 통관단가($/MT)", "color": "#ec4899"}],
        "data": [{"Year": y, "수입 통관단가($/MT)": p} for y, p in _SQUID_PRICE],
        "source": "squid_korea_supply.json (FAOSTAT TM 파생, 2000-2023)",
        "sit": "오징어 수입 통관단가는 2000년 MT당 $2,187에서 2023년 $3,223으로 +47.4% 상승했습니다. 2018년 $3,605로 정점을 찍은 뒤 등락하며, 자급률 붕괴(95.7→35.6%)와 맞물린 구조적 수입 의존 심화를 반영합니다.",
        "strat": "단가 상방 추세가 고착된 만큼, 페루·포클랜드 등 저단가 산지 선도계약으로 평균 통관단가를 낮추고 자급률 회복 한계를 상수로 둔 장기 조달 전략을 설계해야 합니다.",
    },
]

def inject(rel, widgets):
    path = os.path.join(ROOT, rel)
    shutil.copy(path, path + ".bak_p1p2")
    d = json.load(open(path, encoding="utf-8"))
    ws = d["widgets"]
    existing = {w.get("id") for w in ws}
    added = []
    for w in widgets:
        if w["id"] in existing:
            print(f"   SKIP dup {w['id']}"); continue
        ws.append(w); added.append(w["id"])
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    json.load(open(path, encoding="utf-8"))  # validate
    print(f"[{rel}] +{len(added)} → total {len(ws)}: {', '.join(added)}")

if __name__ == "__main__":
    inject("public/data/mackerel_real_data_v13.json", MACKEREL)
    inject("public/data/galchi_data.json", GALCHI)
    inject("public/data/squid_real_data_v4.json", SQUID)
    print("\n다음: 화이트리스트 패치(Edit) → npm run build → 배포")
