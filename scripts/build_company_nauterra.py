#!/usr/bin/env python3
"""Nauterra(구 Grupo Calvo · 등기 상호 Luis Calvo Sanz, S.A.) 카드 인테이크.

발행본 `docs/evidence/company-nauterra-2026-09/보고서.html` 이 정본이다.
여기 적는 값은 전부 그 보고서에 있는 것이어야 하며, `must` 로 대조한다 —
손으로 옮기다 자릿수를 틀리는 것이 이 작업의 주된 실패 모드이고 사람 눈에는 안 잡힌다.

⚠ **이 회사는 이름으로 조회되지 않는다.** 상업등기부·어선등록부 소유자 칸·인증 명부에
  「Nauterra」가 없다. 등기 상호는 Luis Calvo Sanz, S.A.(A15017205)이고 자산은 기능별로
  일곱 법인에 갈려 있다. 어느 명부를 여느냐에 따라 다른 법인이 나온다.
⚠ **판매량 115.822 t 을 생산량으로 쓰지 마라.** 회사 원문이 «conservas y aceite de oliva»
  라 적는다 — 올리브유가 섞인 판매량이고, 회사는 생산량을 「10만 t 이상」으로 따로 적는다.
  캐파 166.000 t 로 나눠 가동률을 내면 분자와 분모가 다른 것을 재게 된다.
⚠ **보조금 819.140,62 € 를 「거의 안 받는다」로 읽지 마라.** 그중 811.793,07 € 가 선단 법인
  한 곳이고 97,4% 가 어업용 경유·에너지비용 보전이다. 경쟁사가 받은 공장 전환투자와는
  돈이 붙은 자리가 다르다. 정작 공장을 돌리는 법인은 0건이다.
⚠ **인당 매출 분모를 섞지 마라.** 거점별 인력 합 4.370명(회사 웹)·기말 5.454명(실적 발표)·
  평균인원 5.563명(등기 계정)은 세는 기준이 다르다. 인당 매출은 매출과 같은 문단의 수를 쓴다.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-nauterra-2026-09/보고서.html"
OUT = ROOT / "public/data/companies/nauterra_v1.json"

META = {
    "회사": "Nauterra (등기 상호 Luis Calvo Sanz, S.A. · CIF A15017205)",
    "국가": "스페인 (Carballo · A Coruña)",
    "업종": "수산 통조림 · 원양 선망 조업 · 어분·어유",
    "출처": "Nauterra 조사 아카이브 (agri_data …/스페인/Nauterra, 2026-09) — "
            "6축 조사노트 + 반증 렌즈 2기 + 벤더 6갈래 교차검증",
    "출처한계": "비상장 가족그룹이다. 순이익은 회사가 발표하지 않고 상업등기소 제출 계정을 "
                "매체가 인용한 값이다. 2024·2025 순부채 절대액은 어느 경로로도 열리지 않는다. "
                "AGCM 결정문은 공동지배 판정의 근거가 된 거부권 조항을 [omissis] 로 가렸다.",
    "측정경계": "그룹 연결(Luis Calvo Sanz, S.A.)과 개별 법인을 섞지 않는다. "
                "선단 척수는 RFMO 등록부 IMO 기준이고 소유자 칸은 등록부마다 갈린다.",
    "갱신방법": "python3 scripts/build_company_nauterra.py + build_report_tables/prose/figures.py",
}

CARD = {
    "numeral": "Ⅹ",
    "name": "Nauterra",
    "country": "스페인",
    "tagline": "배 여덟 척과 공장 셋을 가졌는데 명부를 열면 이름이 없다",
    "stats": [
        {"label": "상업등기부 「Nauterra」", "value": "0건"},
        {"label": "어선등록부 소유자 칸", "value": "0건"},
        {"label": "Bolton 지분 · 이사회", "value": "40% · 4/10석"},
    ],
}

# 그룹 연결 (M€) — 순이익은 등기 계정 인용치
FINANCIALS = [
    {"연도": 2010, "매출": 492, "순이익": 12.58},
    {"연도": 2020, "매출": 578, "순이익": None},
    {"연도": 2022, "매출": 678, "순이익": 23.8},
    {"연도": 2023, "매출": 697, "순이익": 8.0},
    {"연도": 2024, "매출": 727, "순이익": 25.0},
    {"연도": 2025, "매출": 765, "순이익": 35.0},
]

# 갈리시아 3강 (그룹 연결, M€) — ⚠ 셋의 연결 범위가 서로 다르다
GALICIA = [
    {"연도": 2020, "jealsa": 712.8, "frinsa": 588, "nauterra": 578},
    {"연도": 2023, "jealsa": 778.5, "frinsa": 712.8, "nauterra": 697},
    {"연도": 2024, "jealsa": 781, "frinsa": 741, "nauterra": 727},
    {"연도": 2025, "jealsa": 825.7, "frinsa": None, "nauterra": 765},
]

# 스페인 법인 일곱 — 어느 명부에 나오는지가 이 편의 축이다
ENTITIES = [
    {"법인": "Luis Calvo Sanz, S.A.", "nif": "A15017205", "역할": "등기 모법인 · 지주 (CNAE 6420)", "보조금": 4763.70},
    {"법인": "Calvo Conservas, S.L.U.", "nif": "B15584642", "역할": "생산 — Carballo 공장 · 451명", "보조금": 0.0},
    {"법인": "Calvo Envases, S.L.U.", "nif": "B15721319", "역할": "용기", "보조금": 0.0},
    {"법인": "Calvo Distribución Alimentaria", "nif": "B15812142", "역할": "유통", "보조금": 2583.85},
    {"법인": "Central Tuna Management Corp.", "nif": "A15493059", "역할": "어로 면허 (구 CALVOPESCA)", "보조금": 0.0},
    {"법인": "Cantábrica de Túnidos, S.A.U.", "nif": "A11011772", "역할": "선단 운영", "보조금": 811793.07},
    {"법인": "Master Fish Trade", "nif": "B72783335", "역할": "거래", "보조금": 0.0},
]

# 선단 8척 — IMO 는 RFMO 등록부 대조분
FLEET = [
    {"선명": "Montecelo", "imo": "7409152", "기국": "엘살바도르", "유형": "선망"},
    {"선명": "Montefrisa Nueve", "imo": "7409176", "기국": "엘살바도르", "유형": "선망"},
    {"선명": "Montelape", "imo": "8021775", "기국": "엘살바도르", "유형": "선망"},
    {"선명": "Monterocío", "imo": "8919453", "기국": "엘살바도르", "유형": "선망"},
    {"선명": "Montelucía", "imo": "9232668", "기국": "엘살바도르", "유형": "선망"},
    {"선명": "Monteraiola", "imo": "9882009", "기국": "스페인", "유형": "선망"},
    {"선명": "Golfo de Fonseca", "imo": "8829440", "기국": "엘살바도르", "유형": "보급"},
    {"선명": "Faro de la Libertad", "imo": "8829452", "기국": "엘살바도르", "유형": "보급"},
]

# 가공거점 — 인력은 회사 웹 거점값. 그룹 인력과 기준이 다르다
PLANTS = [
    {"거점": "스페인 Carballo", "인력": 415, "캐파": 56000},
    {"거점": "브라질 Itajaí 완제품", "인력": 2428, "캐파": 86000},
    {"거점": "브라질 용기공장", "인력": 161, "캐파": None},
    {"거점": "엘살바도르 La Unión", "인력": 1366, "캐파": 24000},
]

# 국가보조금 대조 (€) — 돈이 붙은 자리가 다르다
SUBSIDY = [
    {"회사": "Jealsa", "금액": 5371309.09, "성격": "PERTE 공장 전환 · CDTI"},
    {"회사": "Frinsa", "금액": 4168964.58, "성격": "PERTE 공장 전환 · RECORE"},
    {"회사": "Nauterra 그룹", "금액": 819140.62, "성격": "어업용 경유 · 에너지비용 보전 (97,4%)"},
    {"회사": "Salica (Albacora 가공)", "금액": 84309.56, "성격": "재생에너지 · AI 적용"},
    {"회사": "Albacora", "금액": 0.0, "성격": "—"},
]

# 명부별 — 이 편의 축
REGISTRIES = [
    {"명부": "상업등기부 「Nauterra」", "결과": "0건", "대조군": "「nombramiento」 118.064건"},
    {"명부": "어선등록부 소유자 칸 (등기 상호)", "결과": "0건", "대조군": "배는 8척 실재"},
    {"명부": "MSC 어업인증", "결과": "0건", "대조군": "경쟁 6사 걸림"},
    {"명부": "ISSF 참여기업", "결과": "0건", "대조군": "명단 24사"},
    {"명부": "Mercadona 자체브랜드 공급사", "결과": "0건", "대조군": "8개사 걸림"},
    {"명부": "OPAGAC", "결과": "가입 — 어로 계열사 이름으로", "대조군": "—"},
    {"명부": "Friend of the Sea", "결과": "4건 — 네 법인이 각각", "대조군": "—"},
]

STATS = {
    "매출_2025": 765, "ebitda_2025": 80, "순이익_2025": 35, "순이익_2024": 25, "순이익_2023": 8,
    "순이익_2022": 23.8, "금융비용_2022": 7.64, "금융비용_2023": 14.55,
    "금융부채_2022": 238.8, "금융부채_2023": 213.4, "이자설명분_pct": 43.7,
    "총자산_2024": 543, "자본_2024": 187, "배당_2025": 17.54,
    "그룹인력": 5454, "인당매출_k": 140.3,
    "캐파_합계": 166000, "캐파_브라질": 86000, "캐파_스페인": 56000, "캐파_엘살바도르": 24000,
    "선단": 8, "선단_스페인기": 1, "선단_엘살바도르기": 7,
    "bolton_지분": 40, "이사회_정원": 10, "이사회_bolton": 4,
    "보조금_그룹": 819140.62, "보조금_선단법인": 811793.07, "보조금_연료에너지_pct": 97.4,
    "borme_대조군": 118064, "판례_등기상호": 29, "판례_사회부": 13,
    "창업": 1940, "리브랜딩": 2023, "수출국_회사현행": 77,
}

MUST = [
    "A15017205", "A15493059", "A11011772", "B15584642", "B15812142", "B15721319", "B72783335",
    "765", "5.454", "166.000", "86.000", "56.000", "24.000", "140,3",
    "23,8", "7,64", "14,55", "238,8", "213,4", "543", "187", "17,54", "43,7",
    "118.064", "811.793,07", "819.140,62", "4.763,70", "2.583,85",
    "5.371.309,09", "4.168.964,58", "84.309,56", "97,4",
    "8829440", "8829452", "7409152", "8021775", "9882009", "9232668", "7409176", "8919453",
    "CALVO CONSERVAS", "씨제이제일제당", "2026-08-24",
]


def main() -> int:
    if not SRC.exists():
        print(f"발행본이 없다: {SRC}", file=sys.stderr)
        return 1
    doc = SRC.read_text(encoding="utf8", errors="replace")
    missing = [m for m in MUST if m not in doc]
    if missing:
        print(f"발행본에 없는 값 {len(missing)}: {missing}", file=sys.stderr)
        return 1

    # 산술 재검증 — 옮겨 적기 오류는 사람 눈에 안 잡힌다
    grp = round(sum(e["보조금"] for e in ENTITIES), 2)
    if grp != STATS["보조금_그룹"]:
        print(f"법인별 보조금 합 {grp} ≠ 그룹 {STATS['보조금_그룹']}", file=sys.stderr)
        return 1
    cap = sum(p["캐파"] for p in PLANTS if p["캐파"])
    if cap != STATS["캐파_합계"]:
        print(f"캐파 합 {cap} ≠ {STATS['캐파_합계']}", file=sys.stderr)
        return 1
    if len(FLEET) != STATS["선단"]:
        print(f"선단 행 {len(FLEET)} ≠ {STATS['선단']}", file=sys.stderr)
        return 1
    es = sum(1 for f in FLEET if f["기국"] == "엘살바도르")
    if es != STATS["선단_엘살바도르기"] or len(FLEET) - es != STATS["선단_스페인기"]:
        print(f"기국 배분 불일치: 엘살바도르 {es}", file=sys.stderr)
        return 1
    if not all(re.fullmatch(r"\d{7}", f["imo"]) for f in FLEET):
        print("IMO 형식 오류", file=sys.stderr)
        return 1
    # 지분과 의석이 같은 비율인가 — 03절의 논지
    if STATS["이사회_bolton"] / STATS["이사회_정원"] * 100 != STATS["bolton_지분"]:
        print("이사회 배분이 지분율과 어긋난다", file=sys.stderr)
        return 1
    # 선단 법인 몫이 그룹의 절대다수인가
    if STATS["보조금_선단법인"] / STATS["보조금_그룹"] < 0.95:
        print("선단 법인 비중 서술이 데이터와 어긋난다", file=sys.stderr)
        return 1
    y25 = next(r for r in FINANCIALS if r["연도"] == 2025)
    if round(y25["매출"] * 1_000_000 / STATS["그룹인력"] / 1000, 1) != STATS["인당매출_k"]:
        print("인당 매출 재계산 불일치", file=sys.stderr)
        return 1

    payload = {
        "_meta": META, "card": CARD, "financials": FINANCIALS, "galicia": GALICIA,
        "entities": ENTITIES, "fleet": FLEET, "plants": PLANTS,
        "subsidy": SUBSIDY, "registries": REGISTRIES, "stats": STATS,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(f"{OUT.relative_to(ROOT)}: {len(MUST)}개 문자열 대조 통과 · {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
