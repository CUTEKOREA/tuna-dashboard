#!/usr/bin/env python3
"""기존 오징어 위젯 39개에서 「시장 이해 > 오징어」 페이지용을 골라 단계에 배치한다.

참치 페이지의 `curate_tuna_industry_widgets.py` 와 같은 골격이다.

원본 `public/data/squid_v5.json` 은 운영 감시용으로 만들어졌다. 이 페이지는 학습용이라
목적이 다르다 — **무엇이 지금 얼마인가**가 아니라 **왜 이런 구조인가**를 가르친다.
그래서 위젯을 전부 싣지 않고 서사 단계에 근거로 붙는 것만 고른다.

원본에 없는 것 둘을 여기서 채운다.

1. **SIT/TAK** — 원본 위젯에는 현황·실행지침이 없다. 이 페이지는 그것이 의무다(W-04).
   **그 위젯 자신의 데이터에서만** 끌어내 쓰고, 채운 위젯은 `narrativeFilled=true` 로
   표시해 카드 출처 줄에 그 사실을 밝힌다. 원본 위젯의 문장인 것처럼 두면 안 된다.

2. **한글화** — 원본은 학명·영문 라벨을 그대로 들고 있다. 화면에 나가는 문자열은
   100% 한글이어야 한다(L-01). 렌더 결과가 아니라 여기서 고쳐 데이터를 다시 만들어도
   유지되게 한다.

원본이 들고 있던 `basis`(측정 게이트)는 버리지 않고 옮긴다. 이 위젯의 수치를 **무엇과
비교하면 안 되는지**가 학습용 페이지에서는 수치 자체만큼 중요하다.

사용법:
    python3 scripts/curate_squid_industry_widgets.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/data/squid_v5.json"
OUT = ROOT / "public/data/squid_industry_widgets_v1.json"

# ── 단계 정의 ────────────────────────────────────────────────────────
# 사슬 7단계(s01~s07) + 횡단 3단계(x01~x03). 각 단계에 실을 위젯을 원본 id 로 지목한다.
# pillar 는 룰북의 Universal 5-Pillar.
STAGES: list[dict] = [
    {
        "key": "s01",
        "title": "자원 — 한 해살이 생물",
        "pillar": "S1",
        "widgets": ["A_species_production_split"],
    },
    {
        "key": "s02",
        "title": "어장 — 다섯 곳이 세계를 먹인다",
        "pillar": "S1",
        "widgets": [
            "A_sourcing_signal_board",
            "A_peru_pota_timeline",
            "A_falkland_loligo_season",
        ],
    },
    {
        "key": "s03",
        "title": "조업과 선단",
        "pillar": "S1",
        "widgets": ["A_sprfmo_cmm18_effort"],
    },
    {
        "key": "s04",
        "title": "쿼터와 규칙",
        "pillar": "S3",
        "widgets": ["A_korea_tac", "A_japan_surumeika_tac", "D_southam_regulation_timeline"],
    },
    {
        "key": "s05",
        "title": "가공과 제품",
        "pillar": "S2",
        "widgets": ["C_eu_processing_hub", "C_india_mpeda_exports"],
    },
    {
        "key": "s06",
        "title": "교역과 통관",
        "pillar": "S3",
        "widgets": [
            "C_hs_classification_map",
            "C_korea_import_monthly",
            "C_import_concentration",
            "C_fta_import_trend",
        ],
    },
    {
        "key": "s07",
        "title": "가격과 소비",
        "pillar": "S4",
        "widgets": [
            "B_stage_separated_prices",
            "B_species_price_ladder",
            "B_kcs_import_unit_price",
            "B_eu_market_prices",
            "B_globefish_market_brief",
            "C_usda_korea_market",
        ],
    },
    {
        "key": "x01",
        "title": "기후와 자원 변동",
        "pillar": "S1",
        "widgets": ["A_climate_stock_brief", "B_price_freshness_board"],
    },
    {
        "key": "x02",
        "title": "지속가능성·불법어업·노동",
        "pillar": "S5",
        "widgets": [
            "D_sprfmo_iuu_list",
            "D_sprfmo_compliance",
            "D_noaa_simp_checklist",
            "D_ejf_risk_map",
            "D_dwf_labor_risk",
            "D_msc_certified",
        ],
    },
    {
        "key": "x03",
        "title": "한국의 자리",
        "pillar": "S4",
        "widgets": ["C_import_concentration", "E_gate_status_board", "E_source_registry"],
    },
]

# ── 제목 손질 ────────────────────────────────────────────────────────
# 원본 제목은 운영 감시용이라 약어·영문이 섞여 있다. 학습용으로 다시 쓴다.
TITLE_OVERRIDES = {
    "A_species_production_split": "주요 4종 어획량 45년 (톤)",
    "A_climate_stock_brief": "기후 변화와 연근해 어획 구성 — 원문 발췌",
    "A_sourcing_signal_board": "산지 다섯 곳의 조업 상태",
    "A_peru_pota_timeline": "페루 대왕오징어 조업 중단 경과",
    "A_falkland_loligo_season": "포클랜드 파타고니아오징어 어기 전 자원조사 — 원문 발췌",
    "A_sprfmo_cmm18_effort": "남태평양 공해 오징어 선박 상한 (척·총톤수)",
    "A_korea_tac": "한국 총허용어획량 적용 업종 확대",
    "A_japan_surumeika_tac": "일본 살오징어 총허용어획량",
    "D_southam_regulation_timeline": "남미 3국 규제 변화 경과",
    "C_eu_processing_hub": "유럽 가공 허브 — 원문 발췌",
    "C_india_mpeda_exports": "인도 두족류 수출",
    "C_hs_classification_map": "오징어 통관 코드 분류표",
    "C_korea_import_monthly": "한국 월별 수입 × 상대국 (달러·킬로그램)",
    "C_import_concentration": "한국 수입 집중도 5년",
    "C_fta_import_trend": "자유무역협정별 수입 추이",
    "B_stage_separated_prices": "거래 단계별 가격 — 섞어 쓰면 안 되는 셋",
    "B_species_price_ladder": "종·규격별 수입 거래가격 계단 (유로/킬로그램)",
    "B_kcs_import_unit_price": "한국 수입단가 5년 (달러/톤)",
    "B_eu_market_prices": "유럽 시장 거래가격표",
    "B_globefish_market_brief": "세계 두족류 시장 브리핑 — 원문 발췌",
    "C_usda_korea_market": "미국 농무부가 본 한국 수산시장",
    "B_price_freshness_board": "가격 자료 신선도 점검판",
    "D_sprfmo_iuu_list": "남태평양 공해 불법어업 선박 목록",
    "D_sprfmo_compliance": "남태평양 공해 준수보고 요약",
    "D_noaa_simp_checklist": "미국 수산물 수입 감시 프로그램 점검표",
    "D_ejf_risk_map": "원양 선단 리스크 지도 — 원문 발췌",
    "D_dwf_labor_risk": "원양 어선 노동 리스크 — 원문 발췌",
    "D_msc_certified": "지속가능 인증 어장",
    "C_comtrade_coverage_matrix": "국제 무역통계 수록 범위 점검",
    "E_gate_status_board": "측정 게이트 현황판",
    "E_source_registry": "표준 출처 원장",
}

# ── 라벨 한글화 ──────────────────────────────────────────────────────
# 학명·영문 라벨이 화면에 그대로 나가면 L-01 위반이다. 셀 값 단위로 갈아끼운다.
CELL_FIXES = {
    # 학명
    "Todarodes pacificus": "살오징어",
    "Illex argentinus": "아르헨티나오징어",
    "Dosidicus gigas": "대왕오징어",
    "Doryteuthis gahi": "파타고니아오징어",
    "Loligo vulgaris": "유럽오징어",
    "Loligo spp": "오징어속",
    "Sepia officinalis": "참갑오징어",
    # 국가·회원
    "China": "중국",
    "Korea": "대한민국",
    "Chinese Taipei": "대만",
    "Total": "합계",
    "Peru": "페루",
    "Chile": "칠레",
    "Argentina": "아르헨티나",
    "Spain": "스페인",
    "India": "인도",
    "Viet Nam": "베트남",
    "Vietnam": "베트남",
    "Falkland Islands": "포클랜드제도",
    # 산지 통칭 — 현지 이름이 영문으로 남아 있었다. 한글명을 앞에 두고 통칭을 괄호로 남긴다.
    "페루 pota": "페루 대왕오징어(포타)",
    "칠레 jibia": "칠레 대왕오징어(히비아)",
    "포클랜드 Loligo": "포클랜드 파타고니아오징어",
    "아르헨티나 Illex": "아르헨티나오징어(일렉스)",
    "한국 살오징어": "한국 살오징어",
    "PRODUCE": "페루 생산부",
    "SERNAPESCA": "칠레 수산청",
    "SUBPESCA": "칠레 수산차관부",
    "INIDEP": "아르헨티나 수산연구소",
    "IMARPE": "페루 해양연구소",
    "FIFD": "포클랜드 수산국",
    "NIFS": "국립수산과학원",
    # 제품 형태
    "Fresh - whole": "신선 통마리",
    "Frozen - whole": "냉동 통마리",
    "Frozen - tubes": "냉동 몸통",
    "Frozen - tentacles": "냉동 다리",
    "Frozen - rings": "냉동 링",
    "Frozen - fillet": "냉동 필렛",
    "Dried": "건조",
    "Whole": "통마리",
    "Tubes": "몸통",
    "Tentacles": "다리",
    # 거래 단계
    "consumer": "소비자",
    "import_unit": "수입단가",
    "first_sale": "1차 판매",
    "wholesale": "도매",
    "retail": "소매",
    "ex_vessel": "위판",
    # 상태
    "available": "확보",
    "unavailable": "미확보",
    "verified": "검증됨",
    "pending": "대기",
    "stale": "낡음",
    "fresh": "최신",
    "ok": "정상",
    "blocked": "차단",
    "n/a": "해당 없음",
    "legal_limit": "법정 한도",
    "actual_catch": "실제 어획량",
    "recommendation": "권고안",
    "adopted": "채택된 조치",
    "effort_limit": "허용노력량",
    "TAC": "총허용어획량",
    "LMCTP": "법정 최대 허용어획량",
    "consumption": "소진 공지",
    "closure": "중단 조치",
    "closure_notice": "중단 공지",
    "notice": "공지",
    "adjustment": "조정",
    "broad": "포괄 분류",
    "1_fresh_broad": "1단계 활·신선 (포괄)",
    "1_fresh": "1단계 활·신선·냉장",
    "1_frozen": "1단계 냉동",
    "2_other_processed": "2단계 건조·염장·훈제",
    "3_prepared": "3단계 조제·저장",
    # 통관 코드 설명은 원본이 통째로 영문이라 한글 설명으로 갈아끼운다
    "cuttlefish/squid live/fresh/chilled legacy/broad": "갑오징어·오징어 활·신선·냉장 (구 포괄분류)",
    "cuttlefish/squid live/fresh/chilled": "갑오징어·오징어 활·신선·냉장",
    "cuttlefish/squid frozen": "갑오징어·오징어 냉동",
    "cuttlefish/squid other": "갑오징어·오징어 그 밖의 것 (건조·염장·훈제)",
    "prepared/preserved cuttlefish and squid": "갑오징어·오징어 조제·저장",
    # 학명 — 원본이 두 표기를 섞어 쓴다
    "Loligo gahi": "파타고니아오징어",
    "Loligo spp.": "오징어속",
    "Loligo vulgaris": "유럽오징어",
    "Illex coindetii": "짧은지느러미오징어",
    # 산지·기준지
    "Croatia": "크로아티아",
    "France": "프랑스",
    "Italy": "이탈리아",
    "Mauritania": "모리타니",
    "Morocco": "모로코",
    "South Africa": "남아프리카공화국",
    "Yemen": "예멘",
    "Portugal/Italy": "포르투갈·이탈리아",
    "Spain wholesale": "스페인 도매",
    "United States": "미국",
    "for Chinese": "중국계 수요",
    "wholesale": "도매",
    "Falkland Islands (Malvinas)": "포클랜드제도",
    # 제품 형태·규격
    "Grade A": "A등급",
    "IQF, glazed": "개별급속동결·빙의",
    "Tubes, skin-on": "몸통 껍질 있음",
    "Tubes, skinless": "몸통 껍질 벗김",
    "cut, no wings, tentacles": "절단·지느러미 제거·다리 포함",
    # 인도조건
    "CIF": "운임보험료포함",
    "CPT": "운송비지급",
    "FOB": "본선인도",
    # 갱신 주기
    "annual": "연간",
    "annual_event": "연간·수시",
    "event": "수시",
    "event_monthly": "수시·월간",
    "event_weekly": "수시·주간",
    "monthly": "월간",
    "monthly_annual": "월간·연간",
    "on_revision": "개정 시",
    "quarterly": "분기",
    "seasonal": "어기별",
    "weekly": "주간",
    "weekly_annual": "주간·연간",
    "weekly_in_season": "어기 중 주간",
    "weekly_monthly": "주간·월간",
    # 상태
    "active": "가동",
    "active_gap": "가동·결측 있음",
    "coverage_gap": "수록 결측",
    "manual_export_gap": "수기 반출 결측",
    "pipeline_gap": "수집 경로 결측",
    "scheduled": "예정",
    "UN Comtrade legacy": "유엔 무역통계 구 계열",
    # 기관 약어 — 처음 노출되는 자리라 한글 풀네임으로 편다
    "KMI": "한국해양수산개발원",
    "KCS": "관세청",
    "NIFS": "국립수산과학원",
    "MPEDA": "인도 해산물수출개발청",
    "EUMOFA": "유럽 수산시장관측소",
    "GACC": "중국 해관총서",
    "YTD": "연초 누계",
    # 게이트 원문에 남아 있던 영문
    "squid-only": "오징어만",
    "live weight": "생중량",
    "product weight": "제품중량",
    "squid_only": "오징어만",
    "incl_cuttlefish": "갑오징어 포함",
    "cephalopods_nei": "두족류 미분류 포함",
    "live_weight": "생중량",
    "product_weight": "제품중량",
    "net_weight": "순중량",
    "none": "없음",
}

# ── 시리즈 이름 한글화 ────────────────────────────────────────────────
SERIES_FIXES = {
    "tonnes_live_weight": "어획량 (톤)",
    "vessel_limit": "선박 상한 (척)",
    "gross_tonnage_gt": "총톤수 (GT)",
    "price_eur_per_kg": "가격 (유로/킬로그램)",
    "price_usd_per_kg": "가격 (달러/킬로그램)",
    "import_usd": "수입액 (달러)",
    "import_kg": "수입량 (킬로그램)",
    "total_import_usd": "총 수입액 (달러)",
    "top1_share_pct": "1위국 비중 (%)",
    "top3_share_pct": "상위 3국 비중 (%)",
    "hhi": "집중도 지수",
    "unit_price_usd_per_tonne": "수입단가 (달러/톤)",
    "value": "값",
    "year": "연도",
    "month": "월",
}

# ── 차트 축·시리즈 교정 ────────────────────────────────────────────────
# 원본 위젯 일부가 `xAxis` 없이 차트 타입만 들고 있다. 그대로 두면 렌더러가
# 존재하지 않는 키를 축으로 잡아 **빈 차트**가 나온다 — 화면에는 축만 있고 막대가 없다.
# 원본에 없는 것을 여기서 지정한다.
XKEY_OVERRIDES = {
    "A_sprfmo_cmm18_effort": "member",
    "C_import_concentration": "year",
    "B_species_price_ladder": "__label",
}

# 시리즈 키가 데이터에 없는 경우도 있다(예: share_pct 는 origins 안에만 있었다).
SERIES_OVERRIDES = {
    "C_import_concentration": ["top1_share_pct", "top3_share_pct"],
    "B_species_price_ladder": ["price_eur_per_kg"],
}

# 축으로 쓸 라벨이 없는 위젯은 여러 열을 합쳐 만든다.
LABEL_RECIPES = {
    "B_species_price_ladder": ("scientific_name", "product_form"),
}

# ── 축 라벨 한글화 ────────────────────────────────────────────────────
XKEY_KO = {
    "year": "연도",
    "month": "월",
    "member": "회원국",
    "scientific_name": "어종",
    "origin": "산지",
    "species": "어종",
}

# ── SIT/TAK ──────────────────────────────────────────────────────────
# 원본 위젯에는 없다. **그 위젯 자신의 데이터에서만** 끌어내 쓴다.
# 여기 없는 위젯은 SIT/TAK 가 비어 페이지에서 걸러진다 — 그게 의도다.
SIT_TAK: dict[str, tuple[str, str]] = {
    "A_species_production_split": (
        "네 종의 45년 궤적이 서로 반대로 간다. 살오징어는 1980년 40만 톤대에서 2024년 3.4만 톤으로 내려앉았고, "
        "같은 기간 대왕오징어와 아르헨티나오징어가 그 자리를 채웠다. 세계 총량은 유지되는데 구성이 통째로 바뀐 것이다.",
        "원료를 어종이 아니라 **산지**로 관리해야 한다. 살오징어 기준으로 짠 조달 계획은 이미 존재하지 않는 자원을 전제한다. "
        "남미 두 종에 대한 산지 계약과 대체 산지를 같은 표에서 관리하라.",
    ),
    "A_sourcing_signal_board": (
        "다섯 산지의 상태가 같은 시점에 갈린다. 페루 대왕오징어는 2026년 7월 24일 중단 공지가 확인됐고, "
        "칠레는 조업 중이며 잔여 쿼터가 남아 있다. 산지마다 신호가 다르다는 것 자체가 이 시장의 구조다.",
        "한 산지가 멈춰도 다른 산지가 도는 것이 오징어 조달의 기본 전제다. "
        "**단일 산지 의존을 계약 단계에서 금지**하고, 산지별 중단 공지를 주간 단위로 확인하라.",
    ),
    "A_sprfmo_cmm18_effort": (
        "남태평양 공해 오징어 조업은 선박 수로 관리한다. 상한 651척 중 중국이 570척으로 87.6%를 가진다. "
        "한국은 43척, 대만은 38척이다. 총톤수로도 중국이 54.8만 GT 중 대부분이다.",
        "공해 오징어 가격은 사실상 **중국 선단의 조업 결정**에 달려 있다. "
        "중국의 연례 조업 계획과 자율 휴어 공고를 원료 가격 선행지표로 삼아라.",
    ),
    "C_import_concentration": (
        "한국의 수입은 소수 산지에 몰려 있다. 2020년 상위 1개국 비중 36.2%, 상위 3개국 74.5%, "
        "집중도 지수 2,330이었다. 경쟁당국이 통상 집중 시장으로 보는 1,800을 크게 넘는다.",
        "집중도가 높다는 것은 한 산지의 사고가 곧 가격 충격이 된다는 뜻이다. "
        "상위 3국 비중을 낮추는 것 자체를 조달 목표로 세우고 해마다 측정하라.",
    ),
    "B_stage_separated_prices": (
        "같은 오징어라도 어느 단계의 가격인지에 따라 값이 다르다. 소비자가는 마리당 4,926원, "
        "수입단가는 톤당 3,288.74달러다. 단위도 기준중량도 달라 그대로 비교할 수 없다.",
        "가격을 인용할 때 **거래 단계와 중량 기준을 함께 적어라.** "
        "소비자가로 수입 채산성을 따지거나 수입단가로 소매 마진을 추정하면 결론이 통째로 틀린다.",
    ),
    "C_hs_classification_map": (
        "통관 코드가 오징어와 갑오징어를 한 소호에 담는다. 0307.42·0307.43·0307.49 가 모두 "
        "「갑오징어와 오징어」로 묶여 있고, 조제품만 1605.54 로 갈린다.",
        "통관 통계로 오징어만 따로 세려는 시도는 **소호 단계에서 이미 불가능하다.** "
        "종 구분이 필요한 계약에서는 통관 코드가 아니라 어획증명·원산지증명을 근거로 삼아라.",
    ),
    "D_sprfmo_iuu_list": (
        "남태평양 공해 관리기구가 불법어업 선박을 명단으로 관리한다. 등재된 선박과 그 이력이 공표된다.",
        "명단은 **거래 전 확인 항목**이다. 공급업체의 선박명·호출부호를 최신 명단과 대조하는 절차를 "
        "구매 표준작업절차에 넣어라. 등재 선박의 어획물은 미국·유럽 시장에서 통관이 막힌다.",
    ),
    "D_noaa_simp_checklist": (
        "미국은 수입 수산물에 어획 이력 신고를 요구한다. 오징어도 대상이며 신고 항목이 정해져 있다.",
        "대미 수출을 계획한다면 **어획 단계부터 신고 항목을 수집**해야 한다. "
        "가공 후에 소급해 만들 수 없는 항목이 있어, 사후 대응으로는 선적이 막힌다.",
    ),
    "D_msc_certified": (
        "지속가능 인증을 받은 오징어 어장이 존재한다. 인증 어장과 그 범위가 목록으로 공표된다.",
        "유럽 대형 유통은 인증을 사실상 입점 조건으로 요구한다. "
        "인증 어장 물량을 **프리미엄 채널 전용**으로 분리 조달해 채널별 원가를 나눠 관리하라.",
    ),
    "E_gate_status_board": (
        "이 페이지가 쓰는 자료마다 「무엇과 비교하면 안 되는지」가 게이트로 걸려 있다. "
        "종 범위·중량 기준·거래 단계·합산 여부가 항목별로 기록돼 있다.",
        "게이트를 무시한 합산이 이 품목에서 가장 흔한 오류다. "
        "새 지표를 만들 때 **먼저 게이트를 확인하고**, 통과하지 못하면 지표를 만들지 마라.",
    ),
}

# ── 컬럼 한글 라벨 ────────────────────────────────────────────────────
# 표·카드형 위젯은 데이터 키가 그대로 열 제목이 된다. 화면에 영문 키가 나가면
# L-01 위반이라 여기서 한글 라벨을 붙이고 표시 순서도 정한다.
COLUMN_KO: dict[str, str] = {
    "year": "연도",
    "month": "월",
    "scientific_name": "어종",
    "tonnes_live_weight": "어획량 (톤)",
    "country": "국가",
    "country_code": "국가코드",
    "import_usd": "수입액 (달러)",
    "import_kg": "수입량 (킬로그램)",
    "unit_price_usd_mt": "수입단가 (달러/톤)",
    "origin": "산지",
    "product_form": "제품 형태",
    "size_grade": "규격",
    "price_eur_per_kg": "가격 (유로/킬로그램)",
    "price_usd_per_kg": "가격 (달러/킬로그램)",
    "trend": "추세",
    "reference_area": "기준 해역",
    "incoterm": "인도조건",
    "market_stage": "거래 단계",
    "rank": "순위",
    "member": "회원국",
    "vessel_limit": "선박 상한 (척)",
    "gross_tonnage_gt": "총톤수 (GT)",
    "species": "어종",
    "applicable_fishery": "적용 업종",
    "application_stage": "적용 단계",
    "hs6": "통관 코드",
    "stage": "단계",
    "description": "설명",
    "status": "상태",
    "as_of": "기준일",
    "reason": "근거",
    "label": "항목",
    "value": "값",
    "unit": "단위",
    "currency": "통화",
    "available": "확보 여부",
    "coverage_end": "자료 종료 시점",
    "weight_basis": "중량 기준",
    "total_import_usd": "총 수입액 (달러)",
    "top1_share_pct": "1위국 비중 (%)",
    "top3_share_pct": "상위 3국 비중 (%)",
    "hhi": "집중도 지수",
    "publisher": "발행기관",
    "series": "계열",
    "frequency": "갱신 주기",
    "latest_verified": "최종 확인",
    "grade": "등급",
    "priority": "우선순위",
    "note": "비고",
    "landing_url": "원문 주소",
    "next_check": "다음 확인",
    "age_days": "경과 일수",
    "band": "구간",
    "indicator": "지표",
    "gate_id": "게이트",
    "subject": "대상",
    "allowed_use": "허용 용도",
    "blocked_use": "금지 용도",
    "explicit_widget_count": "적용 위젯 수",
    "reporter": "보고국",
    "reporter_code": "보고국 코드",
    "row_count": "행 수",
    "density_pct": "수록 밀도 (%)",
    "source_path": "출처 파일",
    "date": "일자",
    "event": "사건",
    "quota_semantics": "쿼터 성격",
    "tonnes": "물량 (톤)",
    "progress_pct": "소진율 (%)",
    "closures": "중단 조치",
    "vessel": "선박",
    "flag": "선적국",
    "listed_since": "등재 시점",
    "fishery": "어장",
    "certifier": "인증기관",
    "scope": "범위",
    "requirement": "요구 항목",
    "applies_to": "적용 대상",
    "risk": "리스크",
    "category": "구분",
    "detail": "내용",
    "product": "품목",
    "quantity": "물량",
    "amount": "금액",
    "share_pct": "비중 (%)",
    "period": "기간",
    "measure": "지표",
    "region": "지역",
}

# 화면에 낼 필요가 없는 내부 키. 표에서 뺀다.
COLUMN_DROP = {
    "kind",
    "text",
    "source_line",
    "source_id",
    "source_widget",
    "evidence_widget",
    "state_evidence",
    "evidence_path",
    "archive_subdir",
    "origins",
}


# 한글 라벨이 없는 키를 그대로 내보내면 화면에 영문 열 제목이 뜬다(L-01).
# 사후에 grep 으로 잡는 대신 빌드가 멈추게 한다 — 사후 정리는 룰북이 금지한다.
UNMAPPED_COLUMNS: set[str] = set()


def build_columns(rows: list) -> list[dict]:
    """표·카드형 위젯의 열 정의. 등장 순서를 지키되 내부 키는 뺀다."""
    seen: list[str] = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        for key in row:
            if key in COLUMN_DROP or key in seen:
                continue
            seen.append(key)
    for key in seen:
        if key not in COLUMN_KO:
            UNMAPPED_COLUMNS.add(key)
    return [{"key": k, "label": COLUMN_KO.get(k, k)} for k in seen]


def split_excerpts(rows: list) -> tuple[list, list]:
    """원문 발췌와 일반 표 행을 가른다.

    발췌는 한글 번역(`text_ko`)이 있는 것만 남긴다. 원문만 있는 발췌를 그대로 실으면
    화면에 영문이 나가 L-01 위반이 된다 — 번역이 없으면 싣지 않는 편이 낫다.
    """
    excerpts, plain = [], []
    for row in rows:
        if isinstance(row, dict) and row.get("kind") == "source_excerpt":
            ko = (row.get("text_ko") or "").strip()
            if not ko:
                continue
            excerpts.append({"인용": ko, "출처": row.get("source_path") or ""})
        else:
            plain.append(row)
    return excerpts, plain

# 아래는 각 위젯의 자체 데이터에서 끌어낸 것이다. 원본 문장이 아니므로 narrativeFilled 로 표시된다.
SIT_TAK.update({
    "A_climate_stock_brief": (
        "국립수산과학원 기후변화 브리핑 원문은 살오징어가 1990~2000년대에 높은 어획량을 기록한 뒤 2010년대 이후 급감했고 그 뒤로도 낮은 수준이 이어진다고 적었다. 같은 문서에서 명태는 자원량 급감으로 2019년부터 전면 조업이 금지됐고, 갈치는 2020년대 들어 반등해 연평균 약 5.5만 톤 수준을 기록하고 있다. 함께 실린 미국 해양대기청 자료는 긴지느러미오징어 어업이 이 어종의 계절 이동을 반영한다는 사실만 밝힌다.",
        "국내 살오징어 물량이 곧 회복된다는 전제를 이 원문은 뒷받침하지 않으므로, **연근해 살오징어를 고정 원료로 잡은 계약은 수입 대체 경로와 짝지어** 설계해야 한다.",
    ),
    "A_peru_pota_timeline": (
        "페루 생산부 문서는 2026년 7월 4일 법정한도를 589,230톤으로 조정했고, 7월 9일에는 누적 하역량이 529,391.41톤으로 한도의 89.84%에 이르렀다고 공지했다. 이어 7월 24일 공지에서 선창용적 10세제곱미터 미만 선박은 7월 22일부터, 10~32.6세제곱미터 선박은 7월 18일부터 조업이 중단됐다. 소진율 공지에서 중단 발효까지 열흘 안팎이 걸렸다.",
        "페루산 원물은 소진율이 90%에 닿는 순간 선적 창구가 열흘 안에 닫힐 수 있으므로, **잔여 한도 10% 구간에서는 신규 발주를 멈추고 기확보 물량의 선적 완료 확인에 집중**하는 기준을 두어야 한다.",
    ),
    "A_falkland_loligo_season": (
        "포클랜드 수산국 조사에서 2025년 제1기 어기 전 총 생물량은 31,048.62톤(95% 신뢰구간 27,431.33~42,174.42톤)으로 2020년 이후 제1기 조사 중 가장 낮았고, 제2기는 21,695톤으로 2022년 이후 제2기 중 최고였으나 2006~2025년 스무 해 가운데 다섯 번째로 낮았다. 어획량은 2021년 59,499톤에서 2025년 37,492톤으로 줄었고, 2025년 제1기 어기는 소형 오징어 크기 우려로 약 엿새 일찍 중단됐다. 2026년 허용 노력량의 선박 단위는 최근 세 해 평균인 27.01로 산정됐는데, 이는 어획량 배분이 아니라 노력량 기준이다.",
        "제2기 어기가 최근 세 차례 각각 조기 종료·미개장·보통 수준으로 흔들렸으므로, **포클랜드산 계약에는 어기 단축 시 물량 감축 조항과 대체 산지 전환 시점을 미리 명시**해 어기 리스크를 계약으로 넘겨야 한다.",
    ),
    "A_korea_tac": (
        "해양수산부 보도자료 표에는 총허용어획량 적용 업종 확대 3건이 담겼다. 살오징어는 서남해구외끌이중형저인망에 2단계로, 민어는 대형트롤에 2단계로 적용하며, 정치망은 전 어종을 1단계로 적용한다. 이 표에는 어종·업종·적용 단계만 있고 살오징어에 배분되는 물량(톤)은 적혀 있지 않다.",
        "살오징어에 총허용어획량이 걸리는 업종이 늘어나는 만큼, **국내 산지 매입 계약에 업종별 소진 시점 확인 조항을 넣고** 배분 물량이 고시되면 연간 매입 계획을 즉시 다시 계산해야 한다.",
    ),
    "A_japan_surumeika_tac": (
        "일본 수산청 자원평가에서 살오징어 추계 발생계군의 2025년 친어량은 3.9만 톤으로 목표관리기준값 25.5만 톤과 한계관리기준값 12.3만 톤을 모두 밑돌았다. 동계 발생계군은 친어량 15.0만 톤으로 목표값에는 못 미치지만 한계값 14.5만 톤은 웃돌았다. 동계계군의 2026년 어기 생물학적허용어획량은 4.4만 톤으로 제시됐고, 레이와 8 관리연도(2026년 4월~2027년 3월)의 어획가능량 설정·배분은 아직 안(案) 단계다.",
        "두 계군 모두 목표관리기준값 아래에 있고 배분도 확정 전이므로, **일본산 살오징어를 전제로 한 물량 계획은 확정 고시 전까지 보수적으로 잡고** 남미산 대체 비중을 미리 점검해야 한다.",
    ),
    "D_southam_regulation_timeline": (
        "아르헨티나 연방수산위원회 결의 6/2026은 채낚기만 쓰는 아르헨티나오징어 어업사업계획서 제출을 허가하면서 선창용적 1,300세제곱미터 이하, 선령 20년 미만이라는 선박 요건을 달았다. 해양전선 공동기술위원회 결의 2/2026은 2026년 4월 1일부터 공동어업수역에서 같은 어종의 대상어업을 열었다. 칠레 수산차관실은 2026년 전국 해역의 대왕오징어 총어획쿼터를 200,000톤으로 정했다.",
        "세 관할권이 같은 해에 진입 요건과 쿼터를 동시에 손대고 있으므로, **산지 계약 전에 상대 선단의 선박 제원이 신규 등록 요건을 충족하는지 문서로 확인**해 통관 단계의 서류 리스크를 줄여야 한다.",
    ),
    "C_eu_processing_hub": (
        "유럽 수산물 시장 관측소 자료에서 유럽연합의 2023년 오징어 어획량은 40,861톤으로 세계 어획량의 1%였고, 오징어 자급률은 15%에 그쳤다. 1인당 오징어 소비는 0.61킬로그램으로 전년 대비 16% 줄었다. 반면 2024년 역외 수출은 17,063톤이었고 그중 98%가 냉동품, 스페인이 수출량의 83%를 차지했으며 중국·한국·알바니아·모로코가 수출의 69%를 받았다.",
        "유럽은 자급률 15%의 순수입 지역이면서 냉동품을 다시 내보내는 가공 허브이므로, **스페인발 냉동 재수출 물량을 상시 견적 대상에 넣어** 산지 직구매 단가와 비교하는 편이 조달 선택지를 넓힌다.",
    ),
    "C_india_mpeda_exports": (
        "인도 해산물수출개발청 자료에서 냉동 오징어 수출은 102,060톤, 5억 1,384만 달러였다. 냉동 갑오징어는 67,157톤에 3억 3,196만 달러로 수량 13.32%, 달러 금액 16.25% 늘었다. 원문에는 냉동 오징어의 전년 대비 증감률이 없어 두 품목의 증감을 같은 기준으로 나란히 놓을 수는 없다.",
        "인도는 오징어와 갑오징어를 별도 품목으로 집계·수출하는 산지이므로, **견적과 계약서에서 두 품목의 통관 코드를 분리 표기**해 갑오징어 물량이 오징어 단가로 계상되는 것을 막아야 한다.",
    ),
    "C_korea_import_monthly": (
        "관세청 통관 자료에서 2026년 1월 오징어·갑오징어 수입은 중국 2,027만 달러(540.6만 킬로그램)와 페루 1,514만 달러(422.1만 킬로그램)가 앞섰다. 베트남은 831만 달러로 금액 3위였지만 물량은 86.0만 킬로그램에 그쳐, 276만 달러에 161.2만 킬로그램을 들여온 에콰도르보다 적었다. 2026년 2월에도 중국이 1,660만 달러(452.8만 킬로그램)로 선두였다.",
        "금액 순위와 물량 순위가 어긋나는 국가는 제품 형태가 다르다는 신호이므로, **국가별 견적을 킬로그램당 단가와 제품형태를 함께 놓고 비교**해 베트남산 고단가 물량을 원물 단가 협상의 근거로 쓰지 말아야 한다.",
    ),
    "C_fta_import_trend": (
        "한국해양수산개발원 자료에서 2025년 자유무역협정 체결국으로부터의 오징어 수입은 127,099톤·577,723천 달러로 전년 대비 물량은 3.5%, 금액은 28.8% 늘었다. 4분기 수입량은 41.4천 톤으로 전년 동기보다 14.3% 많았고, 수입액 비중은 중국 34.6%, 페루 28.2%, 칠레 9.8% 순이었다. 제품 형태로는 냉동품이 76.8%, 조미·자숙품이 22.5%를 차지했다.",
        "물량 증가율(3.5%)보다 금액 증가율(28.8%)이 훨씬 커 단가 부담이 커진 구간이므로, **냉동 원물과 조미·자숙품 계약을 분리해 협상하고** 가공품 라인부터 원가 전가 여력을 다시 계산해야 한다.",
    ),
    "B_species_price_ladder": (
        "유엔식량농업기구 거래가격을 수입단가 단계 안에서만 정렬하면 최상단은 크로아티아산 신선 통마리 300-500 규격 25.00유로/킬로그램, 이탈리아산 100-300그램/마리 24.00유로/킬로그램이다. 같은 원산지·인도조건 안에서는 규격이 커질수록 값이 올라, 모로코산 유럽오징어 통마리(스페인 도착 운임·보험료포함인도)가 12-16 규격 6.98유로에서 27-31 규격 12.98유로까지 벌어진다. 남아프리카공화국산 오징어속 통마리(이탈리아 도착)도 18센티미터 미만 8.90유로에서 25~30센티미터 10.90유로로 계단을 이룬다.",
        "같은 산지 안에서도 규격 한 칸이 킬로그램당 2~4유로를 가르므로, **매입 규격을 한 칸 낮추고 가공 수율로 메우는 안**을 원가표에 올려 규격 차익부터 확인해야 한다.",
    ),
    "B_kcs_import_unit_price": (
        "관세청 통관 자료로 계산한 오징어·갑오징어 가중 수입단가(달러/톤)는 2026년 2월 3,985.58달러로 가장 높았다가 3월 3,000.88달러로 한 달 만에 24.7% 내렸다. 이후 4월 3,150.80달러, 5월 3,288.74달러로 두 달 연속 올랐다. 자료에 담긴 구간은 2026년 1~5월 다섯 달뿐이어서 연 단위 추세로 읽을 수는 없다.",
        "단가가 3,000달러 선에서 반등한 구간이므로, **톤당 3,100달러 아래를 분할 매입 실행선으로 정해두고** 다음 저점 구간에서 물량을 앞당겨 확보하는 규칙을 세워두는 편이 낫다.",
    ),
    "B_eu_market_prices": (
        "표에 담긴 오징어 거래가격은 예멘산 등급품 6-10·10-20 규격 5.22유로/킬로그램에서 크로아티아산 신선 통마리 300-500 규격 25.00유로/킬로그램까지 다섯 배 가까이 벌어진다. 다만 한 표 안에 운임·보험료포함인도, 운송비지급인도, 본선인도와 도매 기준이 섞여 있어 행끼리 빼서 마진으로 읽을 수 없다. 같은 유럽오징어라도 신선 통마리(크로아티아 15.27~25.00유로)와 등급품(예멘 5.22~6.93유로)이 서로 다른 구간을 이룬다.",
        "이 표를 벤치마크로 쓸 때는 **인도조건과 제품형태가 같은 행끼리만 묶어 비교**하고, 조건이 다른 행을 평균 낸 단일 시세는 협상 자료로 인용하지 말아야 한다.",
    ),
    "B_globefish_market_brief": (
        "유엔식량농업기구 세계수산물무역정보는 2026년 초 문어 가격이 사상 최고에 이른 것과 달리 오징어·갑오징어는 풍부한 공급이 가격에 하방 압력을 가했다고 정리했다. 페루의 2026년 1~6월 어획쿼터는 305,417톤이고 1분기 양륙량은 200,211톤으로 쿼터의 3분의 2에 가까웠으며, 아르헨티나의 2026년 1~3월 어획량은 169,592.7톤으로 2025년 같은 분기보다 73.35% 많았다. 한국의 2025년 오징어·갑오징어 수입은 177,244톤으로 15.15% 늘었는데, 중국산은 17.81% 줄어 60,330톤, 페루산은 68.1% 늘어 42,517톤이었다.",
        "남미 공급 확대와 중국산 축소가 한국 수입 구성에서도 함께 확인되므로, **중국 경유 물량의 일부를 페루·칠레 직수입으로 옮기는 안**을 원가와 리드타임 기준으로 비교해볼 시점이다.",
    ),
    "B_price_freshness_board": (
        "가격 자료 세 종 가운데 기준일이 날짜까지 확정된 것은 한국해양수산개발원 소비자가격뿐으로, 2026년 8월 11일까지를 담아 경과 2일이다. 유엔식량농업기구 유럽 거래가격은 2026년 7월, 관세청 수입단가는 2026년 5월까지여서 월 단위 표기 탓에 경과일을 계산할 수 없는 「기준일정밀도부족」 상태다. 세 자료의 최신 시점은 최대 석 달가량 어긋난다.",
        "시차가 다른 세 자료를 한 화면에 얹으면 마진 착시가 생기므로, **월 단위 자료에는 기준월을 함께 적고** 주간 매입 판단에는 날짜가 확정된 자료만 쓰는 규칙이 필요하다.",
    ),
    "D_sprfmo_compliance": (
        "남태평양 공해 관리기구의 2024/25년(2024년 10월~2025년 9월) 최종 준수보고서는 선박감시시스템 사건 28건과 그 밖의 사안 13건, 모두 7개 보존관리조치와 관련된 잠재적 비준수를 정리했다. 페루대왕오징어를 다루는 보존관리조치 제18-2025호 관련 사안은 1건, 전재 및 이전(제12-2023호)은 4건이었다. 대한민국 기국 어선 제5동일보의 2025년 1월 22일 오징어 전재는 1분기 전재자료 제출기한 2025년 4월 20일을 넘겨 5월 8일에 제출돼 비준수로 기록됐다.",
        "전재 서류 지연 한 건이 기국 준수기록에 남는 구조이므로, **전재가 발생하면 분기 제출기한을 역산해 내부 마감을 앞당기는 규칙**을 원양 협력선사 계약에 넣어야 한다.",
    ),
    "D_ejf_risk_map": (
        "환경정의재단 조사에서 대상 원양 오징어선 249척의 기국은 중국 70%, 대만 16%, 대한민국 14%였고, 중국 선박 152척(표본의 87%)에서 강제노동 지표가 8~12개 확인됐다. 면담자 431명 기준 강제노동 지표의 중앙값은 12개 중 9개였다. 같은 보고서는 남동태평양·남서대서양·북서인도양 세 어업이 세계 보고 양륙량의 약 60%를 차지하는데, 유엔식량농업기구에 「달리 포함되지 않음」으로 보고된 오징어 비중은 2002년 25%에서 2023년 33%로 늘었다고 적었다.",
        "세계 물량의 상당 부분이 위험이 집중된 선단에서 나오고 어종 분류마저 흐려지고 있으므로, **매입 계약에 선박 단위 식별정보 제출을 필수 조건으로 넣어** 기국 표기만으로 위험을 판단하지 않는 실사 기준을 세워야 한다.",
    ),
    "D_dwf_labor_risk": (
        "미국 노동부 보고서는 원양어업 어획물이 양륙 뒤 합쳐지고 혼합·포장되면서 강제노동 연계 물량을 다른 제품 로트와 구분하기가 사실상 불가능해진다고 진단했다. 인도네시아 선원 조사에서 60%는 보복이 두려워 노동조건 문제를 제기할 수 없다고 답했고, 85%는 외국 어선에서 다시 일할 계획이라고 답했다. 중국·대만·인도네시아 어느 곳도 국제노동기구 어선원노동협약 제188호를 비준하지 않았으며, 미국 관세국경보호청의 강제노동 무역집행 조치 다섯 건이 어선·선단을 대상으로 유효하다.",
        "미국향 물량은 집행 조치 한 건으로 통관이 멈출 수 있으므로, **선박 단위 문서와 감사 가능한 관리 연속성을 갖춘 공급처로 미국향 라인을 분리 운영**하는 편이 사후 대응보다 비용이 싸다.",
    ),
    "C_comtrade_coverage_matrix": (
        "국제 무역통계의 보고국×연도 21개 조합은 모두 행이 존재하지만 밀도가 크게 갈린다. 스페인은 2023년 1,562행(밀도 100.0%)인 반면 페루는 2022년 2행(0.1%), 일본은 2022년 18행(1.2%)에 그친다. 한국은 2021~2023년 78·77·72행으로 고르지만 밀도는 5% 안팎이다.",
        "밀도가 이렇게 어긋난 자료로 뽑은 점유율과 연평균성장률은 보고 습관을 시장 구조로 오독하게 하므로, **이 자료는 품목 존재 확인용으로만 쓰고 금액 집계는 관세청 자료로 대체**해야 한다.",
    ),
    "E_source_registry": (
        "출처 원장은 발행기관·갱신주기·최종 확인일과 함께 각 출처의 사용 제약을 한 줄로 묶어 둔 표다. 신뢰등급을 한 단계 낮춰 잡은 항목은 한국해양수산개발원 자유무역협정 수입동향과 수산물 가격동향, 유엔식량농업기구 유럽 어가보고 셋이고 나머지 표시 항목은 모두 최상 등급이다. 제약 메모에는 관세청 자료가 2026년 1~5월만 존재하고 해당 통관 코드에 갑오징어가 섞여 있다는 점, 국제 무역통계는 일본·스페인·태국의 연도 누락으로 세계 점유율 산출이 금지된다는 점이 적혀 있다.",
        "원장의 메모가 곧 각 위젯의 사용 한계이므로, **새 수치를 인용하기 전에 해당 출처의 제약 메모를 먼저 확인**하고 금지된 산출(세계 점유율·연평균성장률)을 요구하는 보고 양식은 바꾸는 편이 낫다.",
    ),
})

# 데이터가 SIT/TAK 를 지지하기에 모자라 일부러 비워 둔 위젯.
# C_usda_korea_market — 발췌에 연도·단위·수치의 성격이 없어 무엇의 값인지 확정할 수 없다.
# 빈약한 문장을 채우는 것보다 위젯을 빼는 편이 낫다.
SIT_TAK_DELIBERATELY_EMPTY = ['C_usda_korea_market']

# 데이터가 비어 있어 화면에 카드만 남는 위젯. 학습용 페이지에는 싣지 않는다.
DROP_EMPTY = True


# 기관명·간행물명이 들어가는 열. 번역하면 원문을 찾을 수 없게 되므로 원어를 남긴다.
# 대신 그 열의 한글 라벨이 무엇을 담은 열인지 알려 준다.
PROPER_NOUN_COLUMNS = {
    "series",
    "publisher",
    "landing_url",
    "source_path",
    "latest_verified",
    "next_check",
    "gate_id",
    "reporter_code",
    "country_code",
    "hs6",
    "size_grade",
    "trend",
}

# 문장 안에 박힌 약어. 길이가 짧아 일반 부분치환 규칙에 안 걸리므로 단어 경계로 바꾼다.
ABBREV_KO = {
    "KMI": "한국해양수산개발원",
    "KCS": "관세청",
    "NIFS": "국립수산과학원",
    "TAC": "총허용어획량",
    "LMCTP": "법정 최대 허용어획량",
    "CMM": "보존관리조치",
    "YTD": "연초 누계",
    "CAGR": "연평균 성장률",
    "SIMP": "미국 수산물 수입감시제도",
    "MSC": "지속가능 인증",
    "IUU": "불법어업",
    "HHI": "집중도 지수",
    "EEZ": "배타적경제수역",
    "GT": "총톤수",
    "basis": "측정 기준",
    "update": "갱신",
    "reporter-year": "보고국·연도",
    "cuttlefish": "갑오징어",
    "squid": "오징어",
    "octopus": "문어",
    "KAMIS": "농수산물유통정보",
    "lane": "경로",
    "Cephalopods": "두족류",
    "NEI": "미분류",
    "data rows": "데이터 행",
    "rows": "행",
    "reporters": "보고국",
    "frozen": "냉동",
    "UI": "화면",
    "year": "연도",
    "data": "데이터",
}

UNMAPPED_CELLS: set[str] = set()


def flatten_cell(value):
    """중첩 구조를 읽을 수 있는 한 줄로 편다.

    원본에 객체·배열 셀이 섞여 있다(예: 페루 조업중단 공지의 선박 규모별 목록).
    그대로 두면 화면이 렌더에서 죽는다. 여기서 문자열로 눕히고,
    렌더 쪽에도 같은 방어를 둔다.
    """
    if isinstance(value, list):
        return " · ".join(flatten_cell(v) for v in value if v not in (None, ""))
    if isinstance(value, dict):
        parts = [
            str(v)
            for k, v in value.items()
            # 원문 발췌·경로는 셀에 넣지 않는다 — 길고 화면에서 읽히지 않는다
            if k not in ("source_text", "source_path", "archive_path", "derivation", "evidence_type")
            and isinstance(v, (str, int, float))
        ]
        return " ".join(parts)
    return value


def localize_value(value):
    """셀 값 하나를 한글화한다. 문자열이 아니면 그대로 둔다."""
    if not isinstance(value, str):
        return value
    if value in CELL_FIXES:
        return CELL_FIXES[value]
    # 「Frozen - whole」 처럼 조합형은 부분 치환한다
    out = value
    for eng, ko in CELL_FIXES.items():
        if eng in out and len(eng) > 3:
            out = out.replace(eng, ko)
    import re as _re0

    # 긴 것부터 바꿔야 「data rows」가 「data」+「rows」로 쪼개지지 않는다
    for abbr in sorted(ABBREV_KO, key=len, reverse=True):
        out = _re0.sub(
            rf"(?<![A-Za-z]){_re0.escape(abbr)}(?![A-Za-z])", ABBREV_KO[abbr], out
        )
    # 한글이 하나도 없고 영단어만 남았으면 매핑이 빠진 것이다.
    # 약어·코드·경로는 그대로 두고, 그 밖의 것은 빌드에서 잡는다.
    import re as _re

    if not _re.search(r"[가-힣]", out) and _re.search(r"[a-z]{4,}", out):
        if "/" not in out and not out.startswith("http"):
            UNMAPPED_CELLS.add(out)
    return out


def localize_rows(rows: list) -> list:
    """행을 한글화하면서 내부 키를 뺀다.

    열 정의에서만 빼면 값은 데이터에 남아 툴팁·검사에 새어 나온다.
    화면에 낼 것이 아니면 데이터에서 아예 지운다.
    """
    out = []
    for row in rows:
        if not isinstance(row, dict):
            out.append(localize_value(row))
            continue
        out.append(
            {
                k: (
                    flatten_cell(v)
                    if k in PROPER_NOUN_COLUMNS or k == "kind"
                    else localize_value(flatten_cell(v))
                )
                for k, v in row.items()
                # 발췌 판별에 쓰는 kind/text_ko/source_path 는 뒤에서 따로 처리하므로 남긴다
                if k not in COLUMN_DROP or k in ("kind", "text_ko", "source_path")
            }
        )
    return out


def normalize_series(widget: dict) -> list[dict]:
    """원본은 시리즈를 문자열 배열 / 객체 배열 두 형태로 들고 있다. 하나로 편다."""
    raw = widget.get("series")
    if not raw:
        return []
    out: list[dict] = []
    for item in raw:
        if isinstance(item, str):
            name = SERIES_FIXES.get(item) or COLUMN_KO.get(item)
            if not name:
                UNMAPPED_COLUMNS.add(item)
                name = item
            out.append({"key": item, "name": name})
        elif isinstance(item, dict):
            key = item.get("key") or item.get("dataKey") or ""
            name = item.get("name") or ""
            name = CELL_FIXES.get(name, name) or SERIES_FIXES.get(key, key)
            entry = {"key": key, "name": name}
            if item.get("groupBy"):
                entry["groupBy"] = item["groupBy"]
            if item.get("color") or item.get("stroke") or item.get("fill"):
                entry["color"] = item.get("color") or item.get("stroke") or item.get("fill")
            out.append(entry)
    return out


def detect_year(widget: dict) -> int | None:
    """카드에 붙일 데이터 기준연도. 낡은 줄 모르고 보는 것을 막는다."""
    years: list[int] = []
    blob = json.dumps(widget.get("data") or [], ensure_ascii=False)
    for match in re.finditer(r"(19|20)\d{2}", blob):
        y = int(match.group(0))
        if 1950 <= y <= 2030:
            years.append(y)
    return max(years) if years else None


def basis_ko(basis: dict | None) -> dict | None:
    """측정 게이트를 한글 키로 옮긴다. 화면에 그대로 나가기 때문이다."""
    if not isinstance(basis, dict):
        return None
    out = {}
    if basis.get("taxon_scope"):
        out["분류범위"] = CELL_FIXES.get(basis["taxon_scope"], basis["taxon_scope"])
    if basis.get("weight_basis"):
        out["중량기준"] = CELL_FIXES.get(basis["weight_basis"], basis["weight_basis"])
    if basis.get("market_stage"):
        out["거래단계"] = CELL_FIXES.get(basis["market_stage"], basis["market_stage"])
    if basis.get("aggregation"):
        out["합산여부"] = CELL_FIXES.get(basis["aggregation"], basis["aggregation"])
    if basis.get("quota_semantics"):
        out["쿼터의미"] = CELL_FIXES.get(basis["quota_semantics"], basis["quota_semantics"])
    return out or None


def main() -> None:
    src = json.loads(SRC.read_text(encoding="utf-8"))
    widgets = src["widgets"]

    stages_out = []
    picked = 0
    dropped: list[str] = []

    for stage in STAGES:
        items = []
        for wid in stage["widgets"]:
            raw = widgets.get(wid)
            if raw is None:
                dropped.append(f"{wid} (원본에 없음)")
                continue
            data = raw.get("data") or []
            if DROP_EMPTY and not data:
                dropped.append(f"{wid} (데이터 비어 있음)")
                continue

            if wid in SIT_TAK_DELIBERATELY_EMPTY:
                dropped.append(f"{wid} (데이터가 현황·실행지침을 지지하지 못함)")
                continue
            sit_tak = SIT_TAK.get(wid)
            localized = localize_rows(data)
            excerpts, plain = split_excerpts(localized)
            # 발췌만 있고 표 행이 없으면 인용 카드다. 차트 타입을 바로잡는다.
            chart_type = raw.get("chartType", "table")
            if excerpts and not plain:
                chart_type = "excerpt"

            entry = {
                "id": wid,
                "title": TITLE_OVERRIDES.get(wid, raw.get("title", wid)),
                "chartType": chart_type,
                "data": plain,
                "pillar": stage["pillar"],
            }
            if excerpts:
                entry["excerpts"] = excerpts
            columns = build_columns(plain)
            if columns:
                entry["columns"] = columns
            # 축으로 쓸 라벨을 합성해야 하는 위젯
            recipe = LABEL_RECIPES.get(wid)
            if recipe:
                for row in plain:
                    parts = [str(row.get(k)) for k in recipe if row.get(k)]
                    row["__label"] = " ".join(parts) or "미상"
                if columns and not any(c["key"] == "__label" for c in columns):
                    columns.insert(0, {"key": "__label", "label": "구분"})

            series = normalize_series(raw)
            override = SERIES_OVERRIDES.get(wid)
            if override:
                series = [
                    {"key": k, "name": SERIES_FIXES.get(k) or COLUMN_KO.get(k, k)} for k in override
                ]
            if series:
                entry["series"] = series
            xkey = XKEY_OVERRIDES.get(wid) or raw.get("xAxis")
            if xkey:
                entry["xKey"] = xkey
                entry["xLabel"] = XKEY_KO.get(xkey, COLUMN_KO.get(xkey, xkey))
            if raw.get("unit"):
                entry["unit"] = raw["unit"]
            if raw.get("methodology"):
                entry["cardDesc"] = raw["methodology"]
            year = detect_year(raw)
            if year:
                entry["dataYear"] = year
            basis = basis_ko(raw.get("basis"))
            if basis:
                entry["basis"] = basis
            if sit_tak:
                entry["situation"], entry["takeaway"] = sit_tak
                entry["narrativeFilled"] = True
            if not entry["data"] and not entry.get("excerpts"):
                # 한글 번역이 없는 발췌만 있던 위젯이다. 영문을 그대로 실을 수 없으니 뺀다.
                dropped.append(f"{wid} (한글 번역된 내용이 없음)")
                continue
            items.append(entry)
            picked += 1

        stages_out.append({"key": stage["key"], "title": stage["title"], "widgets": items})

    payload = {
        "_meta": {
            "생성일": "2026-08-16",
            "원본": "public/data/squid_v5.json (위젯 39개)",
            "선별": picked,
            "규칙": (
                "학습용 페이지는 운영 감시용 위젯을 전부 싣지 않는다. 서사 단계에 근거로 "
                "붙는 것만 고른다. 데이터가 빈 위젯은 뺀다."
            ),
            "보완": (
                "원본에 없는 현황·실행지침을 채운 위젯은 narrativeFilled=true 로 표시하고 "
                "카드 출처 줄에 그 사실을 밝힌다. 채울 때는 그 위젯 자신의 데이터만 쓴다."
            ),
            "게이트": (
                "원본 위젯의 basis(측정 게이트)를 한글 키로 옮겨 카드에 함께 싣는다. "
                "이 수치를 무엇과 비교하면 안 되는지가 학습용에서는 수치만큼 중요하다."
            ),
            "갱신방법": "python3 scripts/curate_squid_industry_widgets.py",
        },
        "stages": stages_out,
    }

    # ── 차트 무결성 게이트 ──
    # 축이나 시리즈 키가 데이터에 없으면 화면에 **빈 차트**가 나온다. 축만 있고
    # 막대가 없는 그림은 오류처럼 보이지 않아 사후에 발견되기 어렵다. 빌드에서 막는다.
    CHART_TYPES = {"line", "bar", "stackedBar"}
    chart_problems: list[str] = []
    for stage in stages_out:
        for widget in stage["widgets"]:
            if widget["chartType"] not in CHART_TYPES:
                continue
            rows = widget.get("data") or []
            xkey = widget.get("xKey")
            if not xkey:
                chart_problems.append(f"{widget['id']}: 축(xKey)이 없다")
                continue
            if not any(xkey in row for row in rows):
                chart_problems.append(f"{widget['id']}: 축 '{xkey}' 가 데이터에 없다")
            series = widget.get("series") or []
            if not series:
                chart_problems.append(f"{widget['id']}: 시리즈가 없다")
                continue
            for item in series:
                key = item.get("key")
                grouped = item.get("groupBy")
                # groupBy 를 쓰는 경우 값 열과 분류 열이 둘 다 있어야 한다
                needed = [key] + ([grouped] if grouped else [])
                for column in needed:
                    if not any(column in row for row in rows):
                        chart_problems.append(f"{widget['id']}: 시리즈 열 '{column}' 이 데이터에 없다")

    if chart_problems:
        raise SystemExit(
            "차트가 빈 채로 나갈 것이다 — XKEY_OVERRIDES / SERIES_OVERRIDES 를 고쳐라:\n  "
            + "\n  ".join(chart_problems)
        )

    if UNMAPPED_CELLS:
        raise SystemExit(
            "한글로 옮기지 않은 셀 값이 있다 — CELL_FIXES 에 추가하라: "
            + ", ".join(sorted(UNMAPPED_CELLS)[:20])
        )

    if UNMAPPED_COLUMNS:
        raise SystemExit(
            "한글 라벨이 없는 열이 있다 — COLUMN_KO 에 추가하라: "
            + ", ".join(sorted(UNMAPPED_COLUMNS))
        )

    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    size = OUT.stat().st_size / 1024
    print(f"✅ {OUT} ({size:,.0f} KB)")
    print(f"   {len(stages_out)}단계 · 위젯 {picked}개 선별 (원본 {len(widgets)}개 중)")
    filled = sum(1 for s in stages_out for w in s["widgets"] if w.get("narrativeFilled"))
    missing = [w["id"] for s in stages_out for w in s["widgets"] if not w.get("situation")]
    print(f"   현황·실행지침 채움 {filled}개 · 미작성 {len(missing)}개")
    if missing:
        print("   미작성:", ", ".join(missing))
    if dropped:
        print("   제외:", ", ".join(dropped))
    for s in stages_out:
        print(f"     {s['key']} {s['title']}: {len(s['widgets'])}개")


if __name__ == "__main__":
    main()
