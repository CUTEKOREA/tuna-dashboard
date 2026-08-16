#!/usr/bin/env python3
"""「시장 이해 > 참치」 페이지가 쓸 위젯을 93개 중에서 골라 재배치한다.

원본 `public/data/tuna_real_data_v3.json` 은 5-Pillar 운영 대시보드용으로 만들어졌고
제목이 전부 `[대괄호 태그] + 결론 선언` 형식이다. 결론을 먼저 던지는 제목은 구조를 이미
아는 독자에게만 통한다 — 산업을 배우러 온 독자에게는 「무엇을 보여주는 그림인가」를
말해 주는 서술형 제목이 필요하다. 여기서 그 둘을 바꾼다.

데이터·출처·방법론·SIT·TAK 는 손대지 않는다. 검증을 이미 거친 내용이고,
이 스크립트가 하는 일은 **선별과 배치와 제목**뿐이다.

사용법:
    python3 scripts/curate_tuna_industry_widgets.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/data/tuna_real_data_v3.json"
OUT = ROOT / "public/data/tuna_industry_widgets_v1.json"

# ── 밸류체인 단계 정의 ────────────────────────────────────────────────────
# 세로축 7단계 = 참치 한 마리가 지나는 순서. 가로축 3축 = 사슬 전체를 관통하는 레이어.
# pillar 는 저장소 표준 5-Pillar 매핑 (WidgetCard 가 요구한다).
STAGES: list[dict] = [
    {
        "key": "s01",
        "axis": "chain",
        "order": 1,
        "label": "자원과 해역",
        "pillar": "S1",
        "widgets": [
            "w104_rfmo_radar",
            "w107_rfmo_kobe_radar",
            "w94_wcpo_record_catch",
            "w82_indian_ocean_tuna",
        ],
    },
    {
        "key": "s02",
        "axis": "chain",
        "order": 2,
        "label": "어획",
        "pillar": "S1",
        "widgets": [
            "w14_species_polar",
            "w03_pie",
            "w67_longline_cost",
            "w19_ecuador_surge",
            "w22_japan_decline",
            "w24_bluefin_ranch",
        ],
    },
    {
        "key": "s03",
        "axis": "chain",
        "order": 3,
        "label": "환적과 운반",
        "pillar": "S3",
        "widgets": [
            "w62_fuel_impact",
            "w50_bunker_freight",
            "w39_nl_tollgate",
        ],
    },
    {
        "key": "s04",
        "axis": "chain",
        "order": 4,
        "label": "1차 가공 — 로인",
        "pillar": "S2",
        "widgets": [
            "w15_canning_factory",
            "w25_byproduct_cashcow",
            "w102_spain_loin_outsourcing",
            "w49_yield_labor",
        ],
    },
    {
        "key": "s05",
        "axis": "chain",
        "order": 5,
        "label": "최종 가공",
        "pillar": "S2",
        "widgets": [
            "w54_mega_cannery_opex",
            "w32_species_margin",
            "w33_spain_vs_france",
            "w66_petfood_capacity_defense",
        ],
    },
    {
        "key": "s06",
        "axis": "chain",
        "order": 6,
        "label": "교역과 통관",
        "pillar": "S3",
        "widgets": [
            "w106_kr_frozen_canned_gap",
            "w20_thailand_paradox",
            "w07_export",
            "w08_import",
            "w65_export_price_benchmark",
            "w58_atq_loin_export",
        ],
    },
    {
        "key": "s07",
        "axis": "chain",
        "order": 7,
        "label": "소비",
        "pillar": "S4",
        "widgets": [
            "w43_retail_price_map",
            "w69_china_consumption",
            "w34_germany_blackhole",
            "w31_italy_multiplier",
            "w59_inflation_downtrading",
            "w37_china_dumping",
        ],
    },
    {
        "key": "x01",
        "axis": "cross",
        "order": 8,
        "label": "가격은 어떻게 정해지는가",
        "pillar": "S1",
        "widgets": [
            "w105_skj_spot",
            "w42_first_sale_cascade",
            "w45_skipjack_collapse",
            "w11_kr_price",
        ],
    },
    {
        "key": "x02",
        "axis": "cross",
        "order": 9,
        "label": "규제와 지속가능성",
        "pillar": "S5",
        "widgets": [
            "w86_observer_ems_cost",
            "w83_dfad_revenue_shock",
            "w48_vds_quota",
            "w52_msc_cbam",
            "w88_eu_landing_obligation",
        ],
    },
    {
        "key": "x03",
        "axis": "cross",
        "order": 10,
        "label": "한국과 신라의 자리",
        "pillar": "S4",
        "widgets": [
            "w13_korea_empire",
            "w17_korea_margin",
            "w21_korea_price_truth",
            "w23_korea_surplus",
            "w68_vessel_productivity",
            "w47_korea_thailand_pipeline",
        ],
    },
]

# ── 제목 재작성 ───────────────────────────────────────────────────────────
# 원칙: 결론이 아니라 「무엇을 보여주는 그림인가」를 쓴다. 과장어(폭등·폭발·제국·패권·
# 블랙홀·역설·비밀)를 뺀다. 룰북 P-03(컨빅션 태그 금지)과 같은 방향이다.
TITLE_OVERRIDES: dict[str, str] = {
    # 01 자원과 해역
    "w104_rfmo_radar": "어종별 어획강도 지표 (F/FMSY)",
    "w107_rfmo_kobe_radar": "5대 RFMO 어획강도 비교",
    "w94_wcpo_record_catch": "서·중부태평양 4대 다랑어 어획량 추이",
    "w82_indian_ocean_tuna": "인도양 열대다랑어 어획량과 자원 상태",
    # 02 어획
    "w14_species_polar": "어종별 어획량과 단가의 분포",
    "w03_pie": "가다랑어·황다랑어 국가별 어획 비중",
    "w67_longline_cost": "연승어업 비용 구조와 유류비 민감도",
    "w19_ecuador_surge": "에콰도르 어획량 증가 추이",
    "w22_japan_decline": "일본 어획량 감소와 한국의 상대 위치",
    "w24_bluefin_ranch": "참다랑어 축양 생산량 추이",
    # 03 환적과 운반
    "w62_fuel_impact": "선박용 경유(MGO) 가격과 조업 원가",
    "w50_bunker_freight": "해상운임·연료·포장재 원가 변동",
    "w39_nl_tollgate": "네덜란드 통관 경유 물량 비중",
    # 04 1차 가공
    "w15_canning_factory": "가공 처리량과 통조림 수출액의 국가별 분리",
    "w25_byproduct_cashcow": "가공 수율과 부산물 비중",
    "w102_spain_loin_outsourcing": "스페인의 아시아산 로인 조달 비중",
    "w49_yield_labor": "국가별 가공 수율과 인건비 비교",
    "w58_atq_loin_export": "EU 자율관세할당(ATQ)과 로인 수출",
    # 05 최종 가공
    "w54_mega_cannery_opex": "대형 캐너리 운영비 구조",
    "w32_species_margin": "가공 어종별 마진 비교",
    "w33_spain_vs_france": "스페인·프랑스 가공 마진율 대조",
    "w66_petfood_capacity_defense": "부산물 펫푸드 전환과 가동률",
    # 06 교역과 통관
    "w106_kr_frozen_canned_gap": "한국 냉동 원어와 통조림의 단가 차이",
    "w20_thailand_paradox": "태국의 어획량과 수출액 대비",
    "w47_korea_thailand_pipeline": "한국 원어에서 EU 수출까지의 경로",
    "w07_export": "참치 조제품 수출 상위 10개국",
    "w08_import": "참치 조제품 수입 상위 10개국",
    "w65_export_price_benchmark": "국가별 캔참치 수출 단가 비교",
    # 07 소비
    "w43_retail_price_map": "유럽 16개국 캔참치 소매가 비교",
    "w69_china_consumption": "중국 참치 수입 구조",
    "w34_germany_blackhole": "독일 수입 시장의 제품 구성",
    "w31_italy_multiplier": "이탈리아 시장의 원가·소매가 배수",
    "w59_inflation_downtrading": "물가 상승기의 제품군별 수요 이동",
    "w37_china_dumping": "중국의 저가 통조림과 유럽 시장",
    # x01 가격
    "w105_skj_spot": "방콕 가다랑어 현물가 추이",
    "w42_first_sale_cascade": "스페인 항구 경매가의 전이",
    "w45_skipjack_collapse": "가다랑어 산지가격과 어획량의 역방향 움직임",
    "w11_kr_price": "수입 단가와 국내 소매가의 괴리",
    # x02 규제
    "w86_observer_ems_cost": "옵서버·전자모니터링 의무화 비용",
    "w83_dfad_revenue_shock": "집어장치(FAD) 금어기와 조업 수익",
    "w48_vds_quota": "조업일수제도(VDS) 입어료 추이",
    "w52_msc_cbam": "MSC 인증의 시장 접근 효과",
    "w88_eu_landing_obligation": "EU 투기금지의무의 적용 범위",
    # x03 한국
    "w13_korea_empire": "한국 참치 어획량과 세계 순위",
    "w17_korea_margin": "한국 수출 단가와 세계 평균 대비",
    "w21_korea_price_truth": "한국의 수출 단가 포지션",
    "w23_korea_surplus": "원양 조업의 무역수지 기여",
    "w68_vessel_productivity": "선박별 생산성 분포",
}

# SIT/TAK 안의 과장 표현은 손대지 않되(검증된 원문 보존), 제목에 남은 대괄호 태그는 지운다.
BRACKET_TAG = re.compile(r"^\s*\[[^\]]+\]\s*")

# 원본 시리즈 라벨의 오타 교정과 한글화. dataKey 는 데이터 행의 키라 건드리면 안 되고,
# 화면에 보이는 name 만 바꾼다. 원본 93위젯 중 일부는 시리즈 name 이 비어 있어
# 렌더러가 영문 dataKey 를 그대로 범례에 노출한다 — 여기서 한글 표시명을 준다 (L-01).
SERIES_NAME_FIXES: dict[str, str] = {
    # 오타
    "가랑어(통조림용)": "가다랑어 (통조림용)",
    "황다랑어(초밥용)": "황다랑어 (사시미용)",
    "참다랑어(블루핀)": "참다랑어",
    # 어종 영문명
    "Skipjack": "가다랑어",
    "Yellowfin": "황다랑어",
    "Bigeye": "눈다랑어",
    # 원가·물류
    "MGOCost": "선박용 경유(MGO) 가격",
    "LandingCost": "착지원가",
    "Value": "금액",
    # 가공·기업
    "Silla SG&A": "신라 판매관리비",
    "TU SG&A": "타이유니온 판매관리비",
    "Silla GPM": "신라 매출총이익률",
    "TU GPM": "타이유니온 매출총이익률",
    "매출총이익률 (Gross Margin, %)": "매출총이익률 (%)",
    "스마트팩토리(EU/US)": "스마트팩토리 (유럽·미국)",
    # 관세·교역
    "Base Price": "기준 단가",
    "Tariff Penalty (24%)": "관세 부담 (24%)",
    "Net Revenue": "실수취 단가",
    "Canned/Preserved Import": "조제·저장품 수입",
    "Fresh/Frozen Import": "신선·냉동 수입",
    # 규제·모니터링
    "Required Coverage": "요구 커버리지",
    "Current Level": "현재 수준",
    "Revenue": "조업 수익",
    "Loss": "감소분",
    "Nominal CPUE": "명목 단위노력당어획량",
    "ANN-Standardized CPUE": "표준화 단위노력당어획량",
    "Reported Bycatch": "보고된 혼획",
    "Undetected (Hidden)": "미검출 혼획",
    "Reported Catch": "보고 어획",
    "Unreported Discard": "미보고 투기",
    # 단위 표기 정리
    "방콕 SKJ 현물가(USD/톤)": "방콕 가다랑어 현물가 (USD/톤)",
    "자숙 로인(Loin) 수입 비중": "자숙 로인 수입 비중",
    "투망 수 (만 hook)": "투망 수 (만 개)",
}

# X축에 그대로 찍히는 데이터 셀 문자열. 이쪽은 표시값이자 라벨이라 값 자체를 바꾼다.
# 시리즈 dataKey 가 아니므로 데이터 정합에는 영향이 없다.
CELL_LABEL_FIXES: dict[str, str] = {
    "1. 원어 (Raw)": "1. 원어",
    "PNG": "파푸아뉴기니",
    "자숙 로인(Loin) 수입 비중": "자숙 로인 수입 비중",
    "2020~ (Full)": "2020~ (전면)",
    "2025(E)": "2025 (추정)",
    "2026(E)": "2026 (추정)",
    "3개월 dFAD 금어기": "3개월 집어장치 금어",
    "6개월 dFAD 금어기": "6개월 집어장치 금어",
    "연중 dFAD 금지": "연중 집어장치 금지",
    "규제 없음 (Baseline)": "규제 없음",
    "Slow (< 1 ton/min)": "저속 (1톤/분 미만)",
    "Medium (1-2 ton/min)": "중속 (1~2톤/분)",
    "Fast (> 2 ton/min)": "고속 (2톤/분 초과)",
    "통원어 (Whole Round)": "통원어",
    "가공캔 (Prepared)": "가공캔",
    "Q1": "1분기",
    "Q2": "2분기",
    "Q3": "3분기",
    "Q4": "4분기",
}


def localize_cells(rows: list[dict]) -> list[dict]:
    """X축에 찍히는 문자열 셀을 한글로 바꾼다 (L-01).

    숫자 셀과 시리즈 dataKey 는 건드리지 않는다 — 바꾸면 차트가 값을 못 찾는다.
    """
    out: list[dict] = []
    for row in rows:
        out.append({k: (CELL_LABEL_FIXES.get(v, v) if isinstance(v, str) else v) for k, v in row.items()})
    return out


def normalize_series(raw: list[dict] | None) -> list[dict] | None:
    """이질적인 시리즈 스키마를 {key, name, color} 하나로 맞춘다.

    원본 93위젯은 두 세대의 스키마가 섞여 있다. 옛 위젯은 `dataKey` + `stroke`/`fill`,
    새 위젯은 `key` + `color` 를 쓴다. 정규화하지 않으면 렌더러가 key 를 못 찾아
    React 가 같은 key(undefined)를 반복 받는다.
    """
    if not raw:
        return None
    out: list[dict] = []
    for item in raw:
        key = item.get("key") or item.get("dataKey")
        if not key:
            continue
        name = item.get("name") or key
        out.append(
            {
                "key": key,
                "name": SERIES_NAME_FIXES.get(name, name),
                "color": item.get("color") or item.get("stroke") or item.get("fill"),
            }
        )
    return out or None


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"원본을 찾을 수 없다: {SRC}")

    payload = json.loads(SRC.read_text(encoding="utf-8"))
    by_id = {w["id"]: w for w in payload["widgets"] if "id" in w}

    missing: list[str] = []
    stages_out = []
    kept = 0

    for stage in STAGES:
        widgets_out = []
        for widget_id in stage["widgets"]:
            source = by_id.get(widget_id)
            if source is None:
                missing.append(widget_id)
                continue
            title = TITLE_OVERRIDES.get(widget_id) or BRACKET_TAG.sub("", source.get("title", ""))
            widgets_out.append(
                {
                    "id": widget_id,
                    "title": title,
                    "원제목": source.get("title", ""),
                    "chartType": (source.get("chartType") or "bar").lower(),
                    "xAxis": source.get("xAxis"),
                    "unit": source.get("unit"),
                    "source": source.get("source"),
                    "methodology": source.get("methodology"),
                    "situation": source.get("situation"),
                    "takeaway": source.get("takeaway"),
                    "syncDate": source.get("syncDate"),
                    # 이 페이지는 정적 집계본을 읽는다. 원본이 isLive 였더라도
                    # 런타임 fetch 가 없으므로 SYNCED 로 낮춘다 (L-09 정직 표기).
                    "telemetry": "SYNCED",
                    "data": localize_cells(source.get("data") or []),
                    "lines": normalize_series(source.get("lines")),
                    "bars": normalize_series(source.get("bars")),
                    "areas": normalize_series(source.get("areas")),
                    "xKey": source.get("xKey") or source.get("xAxis"),
                }
            )
            kept += 1

        stages_out.append(
            {
                "key": stage["key"],
                "axis": stage["axis"],
                "order": stage["order"],
                "label": stage["label"],
                "pillar": stage["pillar"],
                "widgets": widgets_out,
            }
        )

    if missing:
        print(f"⚠️  원본에 없는 위젯 ID {len(missing)}건: {', '.join(missing)}", file=sys.stderr)

    out = {
        "_meta": {
            "생성일": "2026-08-16",
            "원본": "public/data/tuna_real_data_v3.json (93위젯)",
            "선별": f"{kept}개",
            "규칙": (
                "밸류체인 7단계 + 횡단 3축으로 재배치. 제목은 결론 선언형에서 서술형으로 고쳐 썼고 "
                "데이터·출처·방법론·SIT·TAK 는 원문 그대로 보존한다."
            ),
            "텔레메트리": "런타임 fetch 가 없는 정적 재사용이므로 전부 SYNCED (L-09)",
            "갱신방법": "python3 scripts/curate_tuna_industry_widgets.py",
        },
        "stages": stages_out,
    }

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(f"✅ {OUT} ({size_kb:,.0f} KB)")
    print(f"   {len(stages_out)}단계 · 위젯 {kept}개 선별 (원본 93개 중)")


if __name__ == "__main__":
    main()
