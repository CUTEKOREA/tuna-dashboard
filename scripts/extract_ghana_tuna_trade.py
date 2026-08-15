#!/usr/bin/env python3
"""가나 참치 무역(어종별·품목별·상대국별) -> public/data/panofi/ghana_tuna_trade.json

출처: UN Comtrade public preview 엔드포인트(구독키 불필요).
  https://comtradeapi.un.org/public/v1/preview/C/A/HS

주의 2가지:
  1) preview 는 **기간을 1개씩만** 받는다("Maximum number of periods for preview is 1").
     연도 루프로 돌린다. HS 코드와 flow 는 콤마로 묶을 수 있다.
  2) preview 응답의 reporterDesc/partnerDesc/flowDesc 는 **전부 null** 이다.
     코드만 오므로 partnerAreas.json 레퍼런스로 이름을 붙이고, 화면 노출용
     한글명은 아래 KO 사전으로 매핑한다(UI_RULES 3-3 국가명 한글화).

HS 코드는 app/api/_shared/hs-codes.ts 의 참치 계열과 정합한다(L-04 단일 출처).
"""
from __future__ import annotations

import json
import sys
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

BASE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
REF = "https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json"
GHANA = 288
YEARS = [2020, 2021, 2022, 2023, 2024]
OUT = Path(__file__).resolve().parents[1] / "public/data/panofi/ghana_tuna_trade.json"

# 어종·품목 축. 냉동 원어는 어종이 갈리고, 필레·조제품은 어종이 합쳐진다.
COMMODITIES = {
    "030341": {"ko": "날개다랑어", "form": "냉동 원어", "species": "날개다랑어"},
    "030342": {"ko": "황다랑어", "form": "냉동 원어", "species": "황다랑어"},
    "030343": {"ko": "가다랑어", "form": "냉동 원어", "species": "가다랑어"},
    "030344": {"ko": "눈다랑어", "form": "냉동 원어", "species": "눈다랑어"},
    "030345": {"ko": "참다랑어", "form": "냉동 원어", "species": "참다랑어"},
    "030349": {"ko": "기타 다랑어", "form": "냉동 원어", "species": "기타"},
    "030231": {"ko": "날개다랑어(신선)", "form": "신선·냉장", "species": "날개다랑어"},
    "030232": {"ko": "황다랑어(신선)", "form": "신선·냉장", "species": "황다랑어"},
    "030233": {"ko": "가다랑어(신선)", "form": "신선·냉장", "species": "가다랑어"},
    "030234": {"ko": "눈다랑어(신선)", "form": "신선·냉장", "species": "눈다랑어"},
    "030487": {"ko": "다랑어 필레(냉동)", "form": "필레", "species": "합산"},
    "160414": {"ko": "다랑어 조제품·통조림", "form": "조제·통조림", "species": "합산"},
}

FLOWS = {"X": "수출", "M": "수입"}

# 가나 참치 교역에 실제로 등장하는 상대국 한글명. 사전에 없으면 영문을 그대로 두고
# unmappedPartners 로 보고한다 — 조용히 영문을 흘리면 L-01 위반이 누적된다.
KO = {
    0: "전세계", 4: "아프가니스탄", 12: "알제리", 24: "앙골라", 32: "아르헨티나",
    36: "호주", 40: "오스트리아", 56: "벨기에", 76: "브라질", 100: "불가리아",
    124: "캐나다", 152: "칠레", 156: "중국", 170: "콜롬비아", 178: "콩고",
    191: "크로아티아", 196: "키프로스", 203: "체코", 204: "베냉", 208: "덴마크",
    218: "에콰도르", 231: "에티오피아", 233: "에스토니아", 246: "핀란드", 250: "프랑스",
    266: "가봉", 268: "조지아", 270: "감비아", 276: "독일", 288: "가나",
    300: "그리스", 324: "기니", 328: "가이아나", 344: "홍콩", 348: "헝가리",
    356: "인도", 360: "인도네시아", 372: "아일랜드", 376: "이스라엘", 380: "이탈리아",
    384: "코트디부아르", 388: "자메이카", 392: "일본", 400: "요르단", 404: "케냐",
    410: "한국", 428: "라트비아", 430: "라이베리아", 434: "리비아", 440: "리투아니아",
    442: "룩셈부르크", 450: "마다가스카르", 458: "말레이시아", 466: "말리", 470: "몰타",
    478: "모리타니", 480: "모리셔스", 484: "멕시코", 504: "모로코", 508: "모잠비크",
    528: "네덜란드", 554: "뉴질랜드", 562: "니제르", 566: "나이지리아", 578: "노르웨이",
    586: "파키스탄", 591: "파나마", 604: "페루", 608: "필리핀", 616: "폴란드",
    620: "포르투갈", 634: "카타르", 642: "루마니아", 643: "러시아", 682: "사우디아라비아",
    686: "세네갈", 690: "세이셸", 694: "시에라리온", 702: "싱가포르", 703: "슬로바키아",
    705: "슬로베니아", 710: "남아프리카공화국", 724: "스페인", 736: "수단", 752: "스웨덴",
    757: "스위스", 764: "태국", 768: "토고", 780: "트리니다드토바고", 788: "튀니지",
    792: "튀르키예", 800: "우간다", 804: "우크라이나", 818: "이집트", 826: "영국",
    834: "탄자니아", 840: "미국", 854: "부르키나파소", 858: "우루과이", 860: "우즈베키스탄",
    894: "잠비아", 704: "베트남", 116: "캄보디아", 496: "몽골", 899: "지역 미상",
    84: "벨리즈", 234: "페로제도", 251: "프랑스", 364: "이란", 422: "레바논",
    512: "오만", 624: "기니비사우", 699: "인도", 706: "소말리아", 784: "아랍에미리트",
    842: "미국", 887: "예멘",
}


def fetch(url: str, tries: int = 3) -> dict:
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=90) as r:
                return json.loads(r.read().decode("utf8"))
        except Exception as e:  # noqa: BLE001 — 재시도 후 그대로 올린다
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"조회 실패: {url[:90]}… — {last}")


def main() -> int:
    # 레퍼런스는 {"results": [...]} 로 감싸 오기도 하고 배열이 바로 오기도 한다.
    raw_ref = fetch(REF)
    ref_list = raw_ref["results"] if isinstance(raw_ref, dict) else raw_ref
    ref = {int(p["PartnerCode"]): p["PartnerDesc"] for p in ref_list}
    codes = ",".join(COMMODITIES)

    rows: list[dict] = []
    truncated: list[str] = []
    for year in YEARS:
        for cmd_one in COMMODITIES:
            url = f"{BASE}?reporterCode={GHANA}&cmdCode={cmd_one}&period={year}&flowCode=X,M"
            data = fetch(url)
            got = data.get("data") or []
            if len(got) >= 500:
                # 상한에 닿았다는 건 뒤가 잘렸다는 뜻이다. 조용히 넘기면 화면이 거짓말한다.
                truncated.append(f"{year}/{cmd_one}")
            if got:
                print(f"{year} {cmd_one}: {len(got)}행", file=sys.stderr)
            time.sleep(0.6)
            for r in got:
                # Comtrade 는 같은 (연도·흐름·HS·상대국) 을 통관절차(customsCode)와
                # 운송수단(motCode) 별로 쪼개 보내고 소계 행까지 섞어 준다.
                # 그대로 합산하면 2~3배로 부푼다 — 집계 행만 남긴다.
                #   customsCode C00 = 전체 통관절차, motCode 0 = 전체 운송수단
                if str(r.get("customsCode")) != "C00" or int(r.get("motCode") or 0) != 0:
                    continue
                if int(r.get("mosCode") or 0) != 0:
                    continue
                cmd = str(r.get("cmdCode") or "").zfill(6)
                meta = COMMODITIES.get(cmd)
                if not meta:
                    continue
                partner = int(r.get("partnerCode") or 0)
                wgt = r.get("netWgt")
                val = r.get("primaryValue")
                rows.append({
                    "year": r.get("refYear"),
                    "flow": FLOWS.get(r.get("flowCode"), r.get("flowCode")),
                    "hs": cmd,
                    "commodity": meta["ko"],
                    "form": meta["form"],
                    "species": meta["species"],
                    "partnerCode": partner,
                    "partner": KO.get(partner) or ref.get(partner) or f"코드 {partner}",
                    "partnerEn": ref.get(partner),
                    "netWgtT": round(wgt / 1000, 3) if wgt else None,
                    "valueUsd": round(val) if val else None,
                    "unitUsdPerT": round(val / (wgt / 1000)) if (wgt and val and wgt > 0) else None,
                })

    if not rows:
        print("행 없음 — 엔드포인트 응답 확인 필요", file=sys.stderr)
        return 1

    unmapped = sorted({r["partnerCode"] for r in rows if r["partnerCode"] not in KO})
    # 합계는 '전세계(0)' 행이 따로 오므로 국가별 집계에서 제외해야 이중계상이 없다.
    by_country = defaultdict(lambda: {"수출": 0, "수입": 0})
    for r in rows:
        if r["partnerCode"] == 0 or not r["valueUsd"]:
            continue
        by_country[r["partner"]][r["flow"]] += r["valueUsd"]

    totals = defaultdict(lambda: defaultdict(lambda: {"valueUsd": 0, "netWgtT": 0.0}))
    for r in rows:
        if r["partnerCode"] != 0:
            continue  # 전세계 행만으로 총계를 잡는다
        t = totals[r["year"]][r["flow"]]
        t["valueUsd"] += r["valueUsd"] or 0
        t["netWgtT"] += r["netWgtT"] or 0

    payload = {
        "meta": {
            "source": "UN Comtrade public preview (C/A/HS)",
            "reporter": "가나",
            "reporterCode": GHANA,
            "years": YEARS,
            "commodities": COMMODITIES,
            "rowCount": len(rows),
            "note": "preview 엔드포인트는 국가·품목 설명이 null 로 와서 코드만 신뢰한다. 이름은 partnerAreas 레퍼런스와 자체 한글 사전으로 붙였다.",
            "unmappedPartners": unmapped,
            "truncatedQueries": truncated,
            "caveat": "가나가 UN Comtrade 에 보고한 값이다. 미보고·과소보고가 있으면 실제 교역과 벌어진다 — 상대국 거울통계와 교차하지 않았다.",
        },
        "totals": {str(y): dict(v) for y, v in sorted(totals.items())},
        "byCountry": [
            {"partner": k, "수출": v["수출"], "수입": v["수입"]}
            for k, v in sorted(by_country.items(), key=lambda kv: -kv[1]["수출"])
        ],
        "rows": rows,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · {len(rows)}행", file=sys.stderr)
    if unmapped:
        print(f"한글명 미매핑 상대국 {len(unmapped)}건: {unmapped}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
