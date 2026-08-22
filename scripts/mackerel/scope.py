#!/usr/bin/env python3
"""고등어 종·품목 범위 정의. 모든 ETL이 이 모듈을 통해서만 필터한다.

아카이브 필터본(fao_filtered/*.csv)은 'mackerel' 문자열로 넓게 잡혀 있어
전갱이(jack/horse)·삼치(Spanish)·임연수어(Atka)·인도고등어(Indian), 심지어
Mako shark 까지 섞여 있다. 대시보드가 말하는 '고등어'는 Scomber 속이다.
"""
from pathlib import Path

ARCHIVE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/"
    "내 드라이브/agri_data/01_수산물(Seafood)/mackerel/00_고등어_관련자료"
)
FAO_FILTERED = ARCHIVE / "11_분석·가공데이터/collections/2026-08-12/fao_filtered"

# ── 어획: Scomber 속만 ──
CAPTURE_SPECIES = {
    "Atlantic mackerel",        # Scomber scombrus
    "Pacific chub mackerel",    # Scomber japonicus
    "Blue mackerel",            # Scomber australasicus
    "Scomber mackerels NEI",    # Scomber spp
}

# ── 교역: Scomber 계열 품목만. 혼합 품목코드와 타 어종은 제외 ──
_TRADE_EXCLUDE_TOKENS = (
    "jack and horse", "jack & horse", "jack mackerel",  # Trachurus — 전갱이
    "indian mackerel",      # Rastrelliger
    "spanish mackerel",     # Scomberomorus — 삼치
    "atka mackerel",        # Pleurogrammus — 임연수어
    "anchovies", "herring,", "seerfish",   # 혼합 품목코드
)


def is_scomber_commodity(name: str) -> bool:
    """FAO 교역 품목명이 Scomber 계열인지."""
    low = (name or "").lower()
    if "mackerel" not in low:
        return False
    return not any(tok in low for tok in _TRADE_EXCLUDE_TOKENS)


def is_scomber_species(name: str) -> bool:
    return (name or "") in CAPTURE_SPECIES


# ── UN M49 국가코드 ──
COUNTRY = {
    410: "한국", 578: "노르웨이", 826: "영국", 372: "아일랜드", 352: "아이슬란드",
    234: "페로제도", 156: "중국", 392: "일본", 528: "네덜란드", 643: "러시아",
    288: "가나", 566: "나이지리아", 384: "코트디부아르", 120: "카메룬", 180: "콩고민주",
    204: "베냉", 768: "토고", 270: "감비아", 686: "세네갈",
    840: "미국", 152: "칠레", 604: "페루", 724: "스페인", 250: "프랑스", 616: "폴란드",
    764: "태국", 704: "베트남", 208: "덴마크", 276: "독일", 504: "모로코", 478: "모리타니",
}

# 2026-08-22 정정: 임의 7개국은 2024년 아프리카 수출 물량의 12.5%(7,742t)를 빠뜨렸다.
# FAO CL_FI_COUNTRY_GROUPS 의 Continent_Group_En == 'Africa' 중 한국 수출 실적이 있는 30개국 실측.
# 모리타니(478)는 기존 7개국에 있었으나 2024년 실적이 0t 이라 이 목록에 없다.
AFRICA = {
    12, 120, 140, 174, 178, 180, 204, 231, 266, 288,
    324, 384, 404, 430, 480, 504, 508, 516, 566, 646,
    686, 690, 694, 710, 768, 788, 800, 818, 834, 854,
}

# 교역 흐름 코드
FLOW_IMPORT = "I"
FLOW_EXPORT = "E"

# 측정 단위
Q = "Q_tpw"          # 물량, 톤 (product weight)
V = "V_USD_1000"     # 금액, 천 USD


# ── 아카이브 내 기타 소스 경로 ──
COMTRADE_CSV = ARCHIVE / "10_원본데이터셋/collections/2026-08-12/api_extracts/un_comtrade/mackerel_trade_comtrade.csv"
USDA_CSV = ARCHIVE / "10_원본데이터셋/collections/2026-08-12/api_extracts/usda_gats/mackerel_trade_usda.csv"
MFDS_CSV = ARCHIVE / "06_식품안전·검역·통관/mfds/2026-08-12_full/MFDS_mackerel_imported_food_products_2025.csv"

# 자동 수집 범위 HS6 (아카이브 collection_receipt 기준)
HS6_SCOPE = ("030244", "030245", "030354", "030355", "160415")

KCS_HS_CSV = ARCHIVE / "10_원본데이터셋/legacy_updates/update_2026-07-06/kcs/KCS_2026YTD_HS_mackerel.csv"
# 관세청 추출본에 포함된 030489(기타 어류 필렛)는 고등어 전용이 아니라 제외한다.
KCS_MACKEREL_HS = ("030244", "030354", "160415")

# 식약처 국내 생산 명부 (2026-08-22 수집). 제품명에 「고등어」가 적힌 품목 + 원재료로 구제한 분.
MFDS_ROSTER = ARCHIVE / "06_식품안전·검역·통관/mfds/production_roster/2026-08-22"
MFDS_I0300_CSV = MFDS_ROSTER / "mfds_i0300_mackerel_scoped.csv"
MFDS_C002_CSV = MFDS_ROSTER / "mfds_c002_mackerel_scoped.csv"
