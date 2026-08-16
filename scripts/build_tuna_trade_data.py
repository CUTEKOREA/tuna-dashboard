#!/usr/bin/env python3
"""FAO FishStat 무역통계에서 「시장 이해 > 참치」 교역 집계 JSON을 만든다.

2026-08 감사에서 교역 계열 위젯 여섯 개가 2023년에 멈춰 있는 것이 드러났다. 원인은
로컬에 무역 원본이 FishStatJ 워크스페이스(.fws — 내부가 Apache Derby DB)뿐이라
기계가독 CSV가 없었던 것이다. FAO 공식 배포본 FI_Trade_2026.1.0 을 받아 여기서 집계한다.

원본: TRADE_QUANTITY.csv (톤) · TRADE_VALUE.csv (천 USD), 각 1976–2024.
   TRADE_FLOW.ALPHA_CODE  E=수출 I=수입 R=재수출 P=가공생산
   COMMODITY.FAO_CODE     ISSCFC 계층 코드. **리프만 보고되고 부모 집계행은 없다**
                          (확인: 034.2.5.6 같은 맨 부모 코드는 0행). 그래서 리프를
                          그냥 더하면 되고 부모·자식 중복집계 걱정이 없다.

⚠ 바스켓 주의: ISSCFC 는 참치·가다랑어·새치류를 한 묶음으로 분류한다. 어떤 코드는
  이름 자체가 "Tunas, bonitos, billfishes, etc." 라 참치만 떼어낼 수 없다. 그래서
  이 집계의 이름은 **참치류**이고, 어획 집계(주요 상업어종 7종)와 바스켓이 다르다.
  두 숫자를 나란히 놓을 때는 그 사실을 밝혀야 한다.

원본은 Google Drive 아카이브에 있다. 드라이브가 없는 환경(CI·Vercel)에서는 돌리지
않는다 — 산출 JSON 이 커밋돼 있다. 갱신할 때만 로컬에서 수동 실행한다.

사용법:
    python3 scripts/build_tuna_trade_data.py
"""
from __future__ import annotations

import argparse
import collections
import csv
import json
import sys
from pathlib import Path

DEFAULT_SOURCE = Path(
    "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브"
    "/agri_data/01_수산물(Seafood)/tuna/00_참치_관련자료/10_원본데이터셋/01_FAO_FishStat_추출"
)
OUT_PATH = Path(__file__).resolve().parent.parent / "public/data/tuna_trade_v1.json"

# 이 연도보다 최신이 없으면 원본이 낡은 것이다.
# FishStat 릴리스 캘린더(2026-07-31 판): 무역 현재 기준연도 1976–2024.
MIN_EXPECTED_YEAR = 2024

# ── 품목군 ────────────────────────────────────────────────────────────
# 접두사로 가른다. 값은 (한글명, 사슬 단계) — 원어인지 반제품인지 완제품인지가
# 밸류체인 어디에 해당하는지를 그대로 나타낸다.
#
# ⚠ 접두사는 **참치 가지까지 정확히** 내려가야 한다. `035.02`(건조·염장)나 `035.03`(훈제)만
#   쓰면 틸라피아·연어·장어까지 딸려온다 — 실측 결과 035.02 는 데이터 내 117종 중
#   참치류가 8종뿐이었다. ISSCFC 에서 `.5.6` 이 참치·가다랑어·새치 가지다.
#
# 반대 방향도 확인해야 한다. `.5.6` 가지를 코드 구조로 전수로 훑어(이름 검색이 아니라
# 세그먼트가 5 다음 6 인지로) 바스켓 밖에 남은 참치 가지를 찾았고, 2024년 수입 기준
# 7.67억 USD(전체의 4.5%)가 빠져 있었다. 아래 뒤쪽 네 줄이 그때 채운 것이다.
#
# 일부러 뺀 것 하나 — `081.42.1.5.6` 참치 어분(meal)은 사료다. 식품 밸류체인 밖이라
# 넣지 않는다. 넣으려면 사슬 단계를 따로 만들어야 한다.
#
# 알고 넣는 것 하나 — `034.1.5.6.75` / `034.2.5.6.75` 삼치는 참치가 아니지만
# FAO 의 이 그룹(Tunas, bonitos, billfishes) 정의에 들어 있다. 2024년 원어 수입의
# 0.18%(1,000만 USD)라 규모가 작고, 표준 그룹에서 한 종만 손으로 빼면 남과 대조할 수
# 없는 값이 된다. 빼지 않고 밝힌다.
PRODUCT_GROUPS: list[tuple[str, str, str]] = [
    ("034.1.5.6", "원어 신선·냉장", "원어"),
    ("034.2.5.6", "원어 냉동", "원어"),
    ("034.1.2.1.61", "활어 참다랑어", "원어"),
    ("034.1.2.1.62", "활어 남방참다랑어", "원어"),
    ("034.3.1.5.6", "필렛·로인 신선", "반제품"),
    ("034.4.1.5.6", "필렛·로인 냉동", "반제품"),
    ("034.3.2.2.5.6", "살코기 신선", "반제품"),
    ("034.4.4.2.5.6", "살코기 냉동", "반제품"),
    ("035.02.1.5.6", "건조·염장", "완제품"),
    ("035.02.2.5.6", "염장", "완제품"),
    ("035.02.3.5.6", "건조필렛", "완제품"),
    ("035.03.5.6", "훈제", "완제품"),
    ("037.1.1.5.6", "조제·저장", "완제품"),
    ("037.1.3.5.6", "다진 조제·저장", "완제품"),
]

COUNTRY_KO = {
    "Thailand": "태국",
    "Ecuador": "에콰도르",
    "Spain": "스페인",
    "China": "중국",
    "Viet Nam": "베트남",
    "Philippines": "필리핀",
    "Indonesia": "인도네시아",
    "Republic of Korea": "대한민국",
    "Japan": "일본",
    "United States of America": "미국",
    "Italy": "이탈리아",
    "France": "프랑스",
    "Germany": "독일",
    "United Kingdom of Great Britain and Northern Ireland": "영국",
    "Netherlands (Kingdom of the)": "네덜란드",
    "Portugal": "포르투갈",
    "Poland": "폴란드",
    "Belgium": "벨기에",
    "Mauritius": "모리셔스",
    "Seychelles": "세이셸",
    "Côte d'Ivoire": "코트디부아르",
    "Cote d'Ivoire": "코트디부아르",
    "Papua New Guinea": "파푸아뉴기니",
    "Taiwan Province of China": "대만",
    "Mexico": "멕시코",
    "Colombia": "콜롬비아",
    "Peru": "페루",
    "Türkiye": "튀르키예",
    "Turkey": "튀르키예",
    "Morocco": "모로코",
    "Ghana": "가나",
    "Senegal": "세네갈",
    "Maldives": "몰디브",
    "Sri Lanka": "스리랑카",
    "India": "인도",
    "Malaysia": "말레이시아",
    "Singapore": "싱가포르",
    "Canada": "캐나다",
    "Australia": "호주",
    "Brazil": "브라질",
    "Chile": "칠레",
    "Argentina": "아르헨티나",
    "Russian Federation": "러시아",
    "Egypt": "이집트",
    "Saudi Arabia": "사우디아라비아",
    "Israel": "이스라엘",
    "Denmark": "덴마크",
    "Norway": "노르웨이",
    "Sweden": "스웨덴",
    "Greece": "그리스",
    "Croatia": "크로아티아",
    "Malta": "몰타",
    "Ireland": "아일랜드",
    "Lithuania": "리투아니아",
    "Latvia": "라트비아",
    "Estonia": "에스토니아",
    "Slovenia": "슬로베니아",
    "Czechia": "체코",
    "Austria": "오스트리아",
    "Switzerland": "스위스",
    "Fiji": "피지",
    "Solomon Islands": "솔로몬제도",
    "Marshall Islands": "마셜제도",
    "Micronesia (Federated States of)": "미크로네시아",
    "Kiribati": "키리바시",
    "Vanuatu": "바누아투",
    "New Zealand": "뉴질랜드",
    "Panama": "파나마",
    "Costa Rica": "코스타리카",
    "Guatemala": "과테말라",
    "El Salvador": "엘살바도르",
    "Venezuela (Bolivarian Republic of)": "베네수엘라",
    "Yemen": "예멘",
    "Oman": "오만",
    "Iran (Islamic Republic of)": "이란",
    "Pakistan": "파키스탄",
    "United Arab Emirates": "아랍에미리트",
    "Tunisia": "튀니지",
    "Libya": "리비아",
    "Algeria": "알제리",
    "Mauritania": "모리타니",
    "Namibia": "나미비아",
    "South Africa": "남아프리카공화국",
    "Madagascar": "마다가스카르",
    "Kenya": "케냐",
    "United Republic of Tanzania": "탄자니아",
    "Mozambique": "모잠비크",
    "Angola": "앙골라",
    "Nigeria": "나이지리아",
    "Cameroon": "카메룬",
    "Gabon": "가봉",
    "Congo": "콩고",
    "Sao Tome and Principe": "상투메프린시페",
    "Cabo Verde": "카보베르데",
    "Guinea": "기니",
    "Sierra Leone": "시에라리온",
    "Liberia": "라이베리아",
    "Togo": "토고",
    "Benin": "베냉",
    "Hong Kong": "홍콩",
    "China, Hong Kong SAR": "홍콩",
    "China, Macao SAR": "마카오",
    "Timor-Leste": "동티모르",
    "Cambodia": "캄보디아",
    "Myanmar": "미얀마",
    "Bangladesh": "방글라데시",
    "Ukraine": "우크라이나",
    "Romania": "루마니아",
    "Bulgaria": "불가리아",
    "Hungary": "헝가리",
    "Slovakia": "슬로바키아",
    "Finland": "핀란드",
    "Iceland": "아이슬란드",
    "Faroe Islands": "페로제도",
    "Cyprus": "키프로스",
    "Lebanon": "레바논",
    "Jordan": "요르단",
    "Iraq": "이라크",
    "Kuwait": "쿠웨이트",
    "Qatar": "카타르",
    "Bahrain": "바레인",
}

KOREA = "Republic of Korea"
THAILAND = "Thailand"
YEARS_BACK = 9


def korean(name_en: str) -> str:
    return COUNTRY_KO.get(name_en.strip(), name_en.strip())


def load_codes(source: Path) -> set[str]:
    """참치류 ISSCFC 리프 코드 집합."""
    return set()  # 실제 판정은 접두사로 한다 — 아래 in_scope 참조


def in_scope(code: str) -> str | None:
    """품목군 한글명을 돌려준다. 참치류가 아니면 None."""
    for prefix, label, _stage in PRODUCT_GROUPS:
        if code.startswith(prefix):
            return label
    return None


def stage_of(code: str) -> str | None:
    for prefix, _label, stage in PRODUCT_GROUPS:
        if code.startswith(prefix):
            return stage
    return None


def read_flow(path: Path, countries: dict[str, str]) -> list[dict]:
    """참치류 행만 남겨 (flow, country_en, group, stage, year, value) 로 편다."""
    out: list[dict] = []
    with open(path, encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            code = row["COMMODITY.FAO_CODE"]
            group = in_scope(code)
            if group is None:
                continue
            flow = row["TRADE_FLOW.ALPHA_CODE"]
            if flow not in ("E", "I"):
                continue  # 재수출(R)·가공생산(P)은 이 페이지에서 안 쓴다
            try:
                value = float(row["VALUE"] or 0)
                year = int(row["PERIOD"])
            except ValueError:
                continue
            out.append(
                {
                    "flow": flow,
                    "country": countries.get(row["COUNTRY_REPORTER.UN_CODE"].zfill(3), ""),
                    "group": group,
                    "stage": stage_of(code),
                    "year": year,
                    "value": value,
                }
            )
    return out


def build(source: Path) -> dict:
    countries: dict[str, str] = {}
    with open(source / "CL_FI_COUNTRY_GROUPS.csv", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            countries[row["UN_Code"].zfill(3)] = row["Name_En"]

    qty_path = source / "TRADE_QUANTITY.csv"
    val_path = source / "TRADE_VALUE.csv"
    for path in (qty_path, val_path):
        if not path.exists():
            raise SystemExit(
                f"무역 원본이 없다: {path}\n"
                "FAO FI_Trade 벌크를 받아 이 폴더에 풀어라 — "
                "https://www.fao.org/fishery/static/Data/ 의 FI_Trade_<버전>.zip"
            )

    qty = read_flow(qty_path, countries)
    val = read_flow(val_path, countries)
    if not qty or not val:
        raise SystemExit("참치류 무역 행을 찾지 못했다 — 품목 접두사 정의를 확인하라")

    latest = max(r["year"] for r in val)
    if latest < MIN_EXPECTED_YEAR:
        raise SystemExit(
            f"무역 원본이 낡았다: 최신 연도 {latest}, 기대 {MIN_EXPECTED_YEAR} 이상.\n"
            "FAO 에서 최신 FI_Trade 벌크를 다시 받아라."
        )

    span = list(range(latest - YEARS_BACK + 1, latest + 1))

    # ── 국가별 수출·수입 (최신연도, 금액 천USD) ──
    def rank(flow: str, rows: list[dict], top: int = 10) -> list[dict]:
        agg: collections.Counter[str] = collections.Counter()
        for r in rows:
            if r["flow"] == flow and r["year"] == latest and r["country"]:
                agg[r["country"]] += r["value"]
        total = sum(agg.values())
        return [
            {
                "국가": korean(name),
                "금액": round(amount / 1000, 1),  # 천USD → 백만USD
                "비중": round(amount / total * 100, 2) if total else 0,
            }
            for name, amount in agg.most_common(top)
        ]

    export_rank = rank("E", val)
    import_rank = rank("I", val)

    # ── 한국 수출입 시계열 + 무역수지 ──
    def country_series(target: str) -> list[dict]:
        exp: collections.Counter[int] = collections.Counter()
        imp: collections.Counter[int] = collections.Counter()
        for r in val:
            if r["country"] != target or r["year"] not in span:
                continue
            (exp if r["flow"] == "E" else imp)[r["year"]] += r["value"]
        return [
            {
                "연도": str(y),
                "수출액": round(exp[y] / 1000, 1),
                "수입액": round(imp[y] / 1000, 1),
                "무역수지": round((exp[y] - imp[y]) / 1000, 1),
            }
            for y in span
        ]

    korea_trade = country_series(KOREA)
    thailand_trade = country_series(THAILAND)

    # ── 수출 단가: 한국 대 세계 평균 ──
    # 단가 = 금액(천USD) / 물량(톤) × 1000 = USD/톤
    def unit_price(target: str | None) -> list[dict]:
        v: collections.Counter[int] = collections.Counter()
        q: collections.Counter[int] = collections.Counter()
        for r in val:
            if r["flow"] == "E" and r["year"] in span and (target is None or r["country"] == target):
                v[r["year"]] += r["value"]
        for r in qty:
            if r["flow"] == "E" and r["year"] in span and (target is None or r["country"] == target):
                q[r["year"]] += r["value"]
        return [
            {"연도": str(y), "단가": round(v[y] / q[y] * 1000) if q[y] else 0}
            for y in span
        ]

    korea_price = unit_price(KOREA)
    world_price = unit_price(None)
    price_gap = [
        {
            "연도": k["연도"],
            "한국": k["단가"],
            "세계평균": w["단가"],
            "격차율": round((k["단가"] / w["단가"] - 1) * 100, 1) if w["단가"] else 0,
        }
        for k, w in zip(korea_price, world_price)
    ]

    # ── 품목군별 세계 교역 (수입 기준, 최신연도) ──
    stage_agg_v: collections.Counter[str] = collections.Counter()
    stage_agg_q: collections.Counter[str] = collections.Counter()
    for r in val:
        if r["flow"] == "I" and r["year"] == latest:
            stage_agg_v[r["stage"]] += r["value"]
    for r in qty:
        if r["flow"] == "I" and r["year"] == latest:
            stage_agg_q[r["stage"]] += r["value"]
    stage_mix = [
        {
            "구분": stage,
            "금액": round(stage_agg_v[stage] / 1000, 1),
            "물량": round(stage_agg_q[stage]),
            "단가": round(stage_agg_v[stage] / stage_agg_q[stage] * 1000)
            if stage_agg_q[stage]
            else 0,
        }
        for stage in ("원어", "반제품", "완제품")
    ]

    world_import_value = round(sum(stage_agg_v.values()) / 1000, 1)
    world_import_qty = round(sum(stage_agg_q.values()))

    return {
        "_meta": {
            "생성일": "2026-08-16",
            "기준연도": latest,
            "바스켓": (
                "FAO ISSCFC 참치류 — 참치·가다랑어·새치류를 한 묶음으로 분류한다. "
                "어떤 코드는 이름 자체가 'Tunas, bonitos, billfishes'라 참치만 떼어낼 수 없다. "
                "어획 집계(주요 상업어종 7종)와 바스켓이 다르므로 두 숫자를 나란히 놓을 때 밝힐 것."
            ),
            "단위": "금액 백만 USD · 물량 톤 · 단가 USD/톤",
            "출처": "FAO FishStat 무역통계 FI_Trade_2026.1.0 (TRADE_QUANTITY.csv · TRADE_VALUE.csv, 1976–2024)",
            "출처URL": "https://www.fao.org/fishery/static/Data/",
            "주의": (
                "수출·수입은 각 보고국이 신고한 값이라 세계 수출 합계와 수입 합계가 일치하지 않는다. "
                "운임·보험(수출은 FOB, 수입은 CIF)과 보고 누락 때문이다."
            ),
            "갱신방법": "python3 scripts/build_tuna_trade_data.py",
        },
        "요약": {
            "기준연도": latest,
            "세계수입액": world_import_value,
            "세계수입물량": world_import_qty,
            "최대수출국": export_rank[0]["국가"] if export_rank else None,
            "최대수입국": import_rank[0]["국가"] if import_rank else None,
        },
        "수출상위": export_rank,
        "수입상위": import_rank,
        "한국교역": korea_trade,
        "태국교역": thailand_trade,
        "수출단가비교": price_gap,
        "품목군구성": stage_mix,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--out", type=Path, default=OUT_PATH)
    args = parser.parse_args()

    payload = build(args.source)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    summary = payload["요약"]
    print(f"✅ {args.out} ({args.out.stat().st_size / 1024:,.0f} KB)")
    print(f"   기준연도 {summary['기준연도']} · 세계 수입 {summary['세계수입액']:,.0f}백만 USD")
    print(f"   최대 수출국 {summary['최대수출국']} · 최대 수입국 {summary['최대수입국']}")


if __name__ == "__main__":
    main()
