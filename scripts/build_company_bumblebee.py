#!/usr/bin/env python3
"""Bumble Bee 기업 해부 ⅩⅣ → 대시보드 카드 인테이크.

값의 정본은 발행본(`docs/evidence/company-bumblebee-2026-09/보고서.html`) 하나다.
여기서 만든 수치가 발행본에 문자열로 없으면 **빌드를 실패시킨다**.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "docs/evidence/company-bumblebee-2026-09/보고서.html"
OUT = ROOT / "public/data/companies/bumblebee_v1.json"
DOC = re.sub(r"<[^>]+>", " ", SRC.read_text(encoding="utf8"))

META = {
    "회사": "Bumble Bee Foods, LLC",
    "국가": "미국 · 캘리포니아 샌디에이고",
    "업종": "상온 수산가공 — 캔참치 · 정어리 · 연어 · 조개",
    "종목": "비상장 (FCF Co., Ltd. 간접 100%)",
    "출처": "Bankr. D. Del. 19-12502 도켓 원문 · 3:25-cv-00583 Doc 22-1 · Walmart 값표 · 21 CFR 161.190",
    "조사일": "2026-09-06",
}

# 대금 — Dkt. 17 ¶66 / APA §3.2
PRICE = {
    "현금": 275_000_000,
    "롤오버_텀론": 633_600_000,
    "롤오버_텀론_상한": 638_600_000,
    "DOJ_벌금_인수": 17_000_000,
    "EV": 925_600_000,
    "EV_상한": 930_600_000,
    "APP": 908_600_000,
    "APP_상한": 913_600_000,
    "계약금": 69_375_000,
    "DIP증액_상한": 5_000_000,
    "DIP증액_기준선": 237_412_000,
}

# 자본구조 — Dkt. 17 ¶31 · Dkt. 12
CAPITAL = [
    {"항목": "총자산 (2018-12-31)", "값": 1_000_000_000, "구분": "자산", "근사": True},
    {"항목": "선순위 텀론", "값": 649_233_814, "구분": "부채", "근사": False},
    {"항목": "ABL", "값": 192_420_215, "구분": "부채", "근사": False},
    {"항목": "일반 매입채무", "값": 77_000_000, "구분": "부채", "근사": True},
    {"항목": "└ 그중 FCF 앞", "값": 51_000_000, "구분": "부채", "근사": True},
    {"항목": "조기상환 프리미엄", "값": 32_461_691, "구분": "부채", "근사": False},
]
DIP = {"ABL": 200_000_000, "ABL_미국": 160_000_000, "ABL_캐나다": 40_000_000,
       "TERM": 80_000_000, "TERM_1차": 40_000_000, "TERM_2차": 40_000_000, "합계": 280_000_000}

FIN2018 = {"전사_순매출": 933_000_000, "전사_EBITDA": 112_300_000,
           "미국_순매출": 722_200_000, "미국_EBITDA": 86_300_000,
           "알바코어_미국매출": 279_000_000, "알바코어_매출비중": 38,
           "알바코어_매출총이익": 62_000_000, "알바코어_이익비중": 44}

SHARE = [
    {"부문": "즉석 참치식사", "점유": 71},
    {"부문": "알바코어 캔", "점유": 41},
    {"부문": "정어리", "점유": 40},
    {"부문": "연어", "점유": 16},
    {"부문": "라이트미트 캔", "점유": 13},
    {"부문": "참치 파우치", "점유": 12},
]

SUPPLY = {"알바코어_하한": 95, "알바코어_상한": 100, "라이트미트_하한": 70, "라이트미트_상한": 100,
          "FCF_계약선박": 500, "교체_최소개월": 6, "교체_최대개월": 12}

FINE = {"벌금": 25_000_000, "기납부": 8_000_000, "2019년8월분": 4_000_000,
        "신청일_잔액": 17_000_000, "조건부_별개주체": 81_500_000}

PROCESS = [("접촉", 190), ("비밀유지약정", 65), ("관심표명서", 11), ("2라운드", 7), ("최종 응찰", 3)]

CHAIN = ["Bumble Bee Foods, LLC", "Bumble Bee Holding Company 1", "FCF Americas",
         "Besford Limited", "Skymax International Corporation", "FCF Co., Ltd."]

DEBTORS = [("Bumble Bee Parent, Inc.", "5118", "Old BBP, Inc."),
           ("Bumble Bee Holdings, Inc.", "1051", "Old BBH, Inc."),
           ("Bumble Bee Foods, LLC", "0146", "Old BBF, LLC"),
           ("Anova Food, LLC", "2140", None),
           ("Bumble Bee Capital Corp.", "7816", None)]

PRICE_LADDER = [
    {"브랜드": "Bumble Bee", "제품": "Solid White Albacore", "itemId": "12167149", "oz": 5, "usd": 2.18, "본사": True},
    {"브랜드": "Great Value (PB)", "제품": "Solid White Albacore", "itemId": "11965047", "oz": 5, "usd": 2.08, "본사": False},
    {"브랜드": "StarKist", "제품": "Solid White Albacore", "itemId": "13398001", "oz": 5, "usd": 2.00, "본사": False},
    {"브랜드": "Bumble Bee", "제품": "Chunk Light", "itemId": "11996639", "oz": 5, "usd": 1.14, "본사": True},
    {"브랜드": "StarKist", "제품": "Chunk Light", "itemId": "13398002", "oz": 5, "usd": 1.14, "본사": False},
    {"브랜드": "Chicken of the Sea", "제품": "Chunk Light", "itemId": "15240751", "oz": 5, "usd": 1.00, "본사": False},
    {"브랜드": "Great Value (PB)", "제품": "Chunk Light", "itemId": "11965048", "oz": 5, "usd": 0.87, "본사": False},
]
for r in PRICE_LADDER:
    r["원per kg"] = round(r["usd"] / (r["oz"] * 28.3495 / 1000), 2)

STRATEGY = [
    {"사안": "소유", "말": "「passive, minority … strictly arms'-length」", "돈": "그 공급자가 회사를 샀다. 지주 사슬 다섯 단이 전부 wholly owned", "판정": "역방향"},
    {"사안": "조달", "말": "공급업체 강령(2025-07-01) · Seafood Future Report 2025", "돈": "알바코어의 95~100%가 한 곳에서. 규격이 연승만이라 바꿀 수 없다", "판정": "말뿐"},
    {"사안": "생산", "말": "—", "돈": "미국 자가 참치공장 2027년 3월까지 단계 폐쇄. 로인 가공은 피지 위탁", "판정": "축소"},
    {"사안": "선박", "말": "2009년 지속가능성 기구 창립 참여", "돈": "선박명부 등재 0. 감사가 항목 7.1을 N/A로 적는다", "판정": "해당없음"},
    {"사안": "준법", "말": "최고준법책임자 신설 · 지침 개정", "돈": "벌금 2,500만 중 800만 납부, 1,700만 잔액은 매수인이 승계", "판정": "부족"},
    {"사안": "노동", "말": "강제노동 규탄 · 적극 방어", "돈": "3:25-cv-00583 계류. 공판 2027-12-07", "판정": "계류"},
]

STATS = {
    "현금_비중": round(PRICE["현금"] / PRICE["EV"] * 100, 2),
    "무현금_비중": round((PRICE["EV"] - PRICE["현금"]) / PRICE["EV"] * 100, 2),
    "EV": PRICE["EV"], "현금": PRICE["현금"],
    "알바코어_점유": 41, "즉석식사_점유": 71,
    "선박_등재": 0, "자가_참치공장": 1, "채무자_수": 5, "지주_단수": 6,
    "매수인_수": 3, "FCF_계약선박": 500,
    "알바코어_공급_하한": 95, "라이트미트_공급_하한": 70,
    "최종응찰": 3, "접촉": 190,
    "벌금_잔액": FINE["신청일_잔액"], "벌금": FINE["벌금"],
    "미국_순매출_2018": FIN2018["미국_순매출"],
    "알바코어_배수": round(2.18 / 1.14, 2),
}

# ── 자체 검산 ────────────────────────────────────────────────
fails = []
def chk(n, got, want, tol=0):
    if abs(got - want) > tol: fails.append(f"{n}: {got} ≠ {want}")

chk("EV 3분해", PRICE["현금"] + PRICE["롤오버_텀론"] + PRICE["DOJ_벌금_인수"], PRICE["EV"])
chk("EV 상한", PRICE["현금"] + PRICE["롤오버_텀론_상한"] + PRICE["DOJ_벌금_인수"], PRICE["EV_상한"])
chk("APP", PRICE["EV"] - PRICE["DOJ_벌금_인수"], PRICE["APP"])
chk("APP = 현금+롤오버", PRICE["현금"] + PRICE["롤오버_텀론"], PRICE["APP"])
chk("롤오버 상한차", PRICE["롤오버_텀론_상한"] - PRICE["롤오버_텀론"], PRICE["DIP증액_상한"])
chk("현금 비중", STATS["현금_비중"], 29.71, 0.005)
chk("무현금 비중", STATS["무현금_비중"], 70.29, 0.005)
chk("DIP 합", DIP["ABL"] + DIP["TERM"], DIP["합계"])
chk("DIP ABL 내역", DIP["ABL_미국"] + DIP["ABL_캐나다"], DIP["ABL"])
chk("DIP Term 내역", DIP["TERM_1차"] + DIP["TERM_2차"], DIP["TERM"])
chk("벌금", FINE["기납부"] + FINE["신청일_잔액"], FINE["벌금"])
chk("알바코어 매출비중", round(FIN2018["알바코어_미국매출"] / FIN2018["미국_순매출"] * 100), 39, 1)
chk("채무자 수", len(DEBTORS), 5)
chk("지주 단수", len(CHAIN), 6)
for r in PRICE_LADDER:
    chk(f"$/kg {r['브랜드']} {r['제품']}", round(r["usd"] / (r["oz"] * 28.3495 / 1000), 2), r["원per kg"], 0.005)

MUST = ["925,600,000", "275,000,000", "633,600,000", "17,000,000", "908,600,000",
        "29.71%", "69,375,000", "649,233,814", "192,420,215", "77,000,000", "51,000,000",
        "280,000,000", "200,000,000", "80,000,000", "722,200,000", "933,000,000",
        "279,000,000", "25,000,000", "8,000,000", "41%", "71%", "13%", "12%",
        "19-12502", "3:25-cv-00583", "3:17-cr-00249", "Old BBP", "Old BBF", "Anova Food",
        "TONOS US LLC", "MELISSI 4 INC", "Besford", "Skymax", "FCF Americas",
        "only vendor", "only longline-caught tuna", "passive, minority",
        "$2.18", "$2.08", "$2.00", "$1.14", "$1.00", "$0.87", "15.38", "8.04",
        "12167149", "161.190", "Thunnus alalunga", "190", "500", "2027"]
miss = [m for m in MUST if m not in DOC]
if miss: fails.append(f"발행본에 없는 문자열 {len(miss)}개: {miss}")

if fails:
    print("❌ 인테이크 검산 실패", file=sys.stderr)
    for f in fails: print("  -", f, file=sys.stderr)
    sys.exit(1)

payload = {
    "_meta": META,
    "card": {"numeral": "ⅩⅣ", "tagline": "배가 한 척도 없는 회사가 미국 알바코어 캔의 41%를 판다."},
    "stats": STATS, "price": PRICE, "capital": CAPITAL, "dip": DIP,
    "fin2018": FIN2018, "share": SHARE, "supply": SUPPLY, "fine": FINE,
    "process": [{"단계": a, "수": b} for a, b in PROCESS],
    "chain": [{"층": i + 1, "법인": n} for i, n in enumerate(CHAIN)],
    "debtors": [{"채무자": a, "납세번호끝4": b, "현재표제": c} for a, b, c in DEBTORS],
    "priceladder": PRICE_LADDER, "strategy": STRATEGY,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
print(f"✅ {OUT.relative_to(ROOT)} · 검산 통과 · must {len(MUST)} · {OUT.stat().st_size/1024:.0f} KB")
