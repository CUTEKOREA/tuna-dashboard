#!/usr/bin/env python3
"""월간 위젯 데이터 재생성 — agri_data 갱신 후 대시보드 JSON 자동 동기화.

agri_data 월간 파이프라인(매월 1일 launchd) 직후 실행하면, 매월 변하는
국내가(KAMIS)·관세청 수입 위젯의 `public/data/agri/*.json` 을 최신값으로 재생성한다.

대상(월 단위로 값이 바뀌는 것만):
  - shrimp_kamis.json   (흰다리새우 도매가)
  - carrot_kamis.json   (당근 도매가)
  - petfood_customs.json (펫푸드 수입원 의존도)

Comtrade 글로벌무역 위젯(salmon·chicken·tuna·squid·cassava·pollock·carrot W25/26)은
연 단위(완료연도)로 바뀌므로 월간 재생성 대상이 아니다. Comtrade 2025 완성 시 또는
연 1회 별도 갱신한다(REGEN_COMTRADE=1 환경변수로 강제 가능 — 미구현 placeholder).

사용:  python3 regen_widgets.py        # 라이브 자료로 재계산·기록
출력:  ../../public/data/agri/*.json
"""
from __future__ import annotations
import json
import statistics
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import agri_convert as a  # noqa: E402

OUT = Path(__file__).resolve().parents[2] / "public" / "data" / "agri"
TODAY = "{:%Y-%m-%d}".format(date.today()) if False else None  # set below; date.today OK here
TODAY = date.today().isoformat()


def _kamis_price_json(commodity: str, item_label: str, kind_filter: str | None,
                      cls: str = "02") -> dict:
    s = a.kamis_series(commodity, cls)
    if kind_filter:
        s = [r for r in s if kind_filter in (r.get("kind") or "")] or a.kamis_series(commodity, cls)
    bym: dict = {}
    for r in s:
        if r.get("date") and r.get("price"):
            bym.setdefault(r["date"][:7], []).append(r["price"])
    months = sorted(bym)
    mavg = {m: round(statistics.mean(v), 1) for m, v in bym.items()}
    latest = s[-1] if s else {}
    mom = (round(100 * (mavg[months[-1]] - mavg[months[-2]]) / mavg[months[-2]], 1)
           if len(months) >= 2 else None)
    trend = "상승" if (mom or 0) > 0 else ("하락" if (mom or 0) < 0 else "보합")
    return {
        "isLive": False, "status": "SYNCED", "syncDate": TODAY,
        "source": f"KAMIS periodProductList cls{cls}(도매·kg환산) via agri_data 월간 파이프라인",
        "dataWindow": (f"{months[0]}~{months[-1]} (월간 누적)" if months else "-"),
        "metrics": {
            "item": item_label,
            "wholesalePrice_KRW_per_KG": round(latest.get("price", 0)),
            "currentPrice": round(latest.get("price", 0)),
            "latestDate": latest.get("date"), "currentDate": latest.get("date"),
            "monthlyAvg_KRW_per_KG": mavg, "monthlyAvg": mavg,
            "momChangePercent": mom, "trend": trend,
        },
        "currentPrice": round(latest.get("price", 0)), "unit": "원/kg",
        "momChangePercent": mom, "trend": trend,
        "series": [{"date": r["date"], "price": round(r["price"])} for r in s],
        "historicalTrends": [{"date": r["date"], "price": round(r["price"])} for r in s],
    }


def regen_shrimp_kamis():
    return _kamis_price_json("shrimp", "흰다리새우 (수입/냉동)", None)


def regen_carrot_kamis():
    d = _kamis_price_json("carrot", "당근", "무세척")
    d["commodity"] = "당근"
    d["market"] = "KAMIS 도매(무세척)"
    return d


def regen_petfood_customs():
    imp = a.customs_korea_by_country("petfood", "imp")
    months = a.customs_months("petfood")
    top = imp[:6]
    d_w12 = [{"country": r["country"], "value": round(r["value_usd"] / 1000),
              "share": r["share_pct"]} for r in top]
    return {
        "isLive": False, "status": "SYNCED", "syncDate": TODAY,
        "source": (f"관세청 nitemtrade(HS6 필터) via agri_data, "
                   f"{months[0]}~{months[-1]} 누적" if months else "관세청 via agri_data"),
        "unit": "천USD", "d_w12": d_w12,
    }


GENERATORS = {
    "shrimp_kamis.json": regen_shrimp_kamis,
    "carrot_kamis.json": regen_carrot_kamis,
    "petfood_customs.json": regen_petfood_customs,
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for fname, gen in GENERATORS.items():
        try:
            data = gen()
            (OUT / fname).write_text(json.dumps(data, ensure_ascii=False, indent=2),
                                     encoding="utf-8")
            n = len(data.get("series", data.get("d_w12", [])))
            print(f"  ✓ {fname}  ({n} rows, syncDate={TODAY})")
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {fname}  FAILED: {exc}")
    print(f"재생성 완료 → {OUT}")
    print("참고: Comtrade 글로벌무역 위젯은 연 단위(완료연도) — 2025 완성 시 별도 갱신.")


if __name__ == "__main__":
    main()
