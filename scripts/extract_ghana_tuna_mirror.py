#!/usr/bin/env python3
"""가나 참치 무역 거울통계 -> public/data/panofi/ghana_tuna_mirror.json

가나가 «수출했다»고 보고한 값과, 상대국이 «가나에서 수입했다»고 보고한 값을 맞대본다.
둘이 크게 벌어지면 어느 한쪽의 미보고·과소보고를 의심할 근거가 된다.

거울통계는 원래 완전히 일치하지 않는다. 정상적인 차이 요인이 셋 있다:
  1) FOB(수출) vs CIF(수입) — 수입 신고액에 운임·보험이 얹혀 보통 5~15% 크다
  2) 계상 시점 차이 — 연말 선적분이 상대국에서는 다음 해로 잡힌다
  3) 원산지 규칙 — 제3국 경유·재수출이 서로 다르게 귀속된다
그래서 «수입 > 수출»은 자연스럽고, 반대로 **수입이 수출보다 크게 작으면** 가나 측
과대보고나 상대국 미보고를 의심한다. 판정은 사람이 한다 — 이 스크립트는 격차만 낸다.
"""
from __future__ import annotations

import json
import sys
import time
import urllib.request
from pathlib import Path

BASE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
GHANA = 288
YEAR = 2024
OUT = Path(__file__).resolve().parents[1] / "public/data/panofi/ghana_tuna_mirror.json"
GHANA_TRADE = Path(__file__).resolve().parents[1] / "public/data/panofi/ghana_tuna_trade.json"

# 가나 수출 상위 상대국(직전 추출 기준). 코드는 UN M49.
PARTNERS = {
    826: "영국", 250: "프랑스", 276: "독일", 380: "이탈리아", 156: "중국",
    784: "아랍에미리트", 56: "벨기에", 528: "네덜란드", 372: "아일랜드",
    620: "포르투갈", 724: "스페인", 840: "미국",
}
# 조제·통조림이 금액의 대부분이라 이 세번을 기준으로 맞댄다.
CODES = ["160414", "030342", "030343", "030487"]


def fetch(url: str, tries: int = 3) -> dict:
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=90) as r:
                return json.loads(r.read().decode("utf8"))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"조회 실패: {url[:90]}… — {last}")


def aggregate_rows(rows: list[dict]) -> dict[tuple[int, str], dict]:
    """집계 행만 남겨 (reporter, hs) 로 모은다."""
    out: dict[tuple[int, str], dict] = {}
    for r in rows:
        if str(r.get("customsCode")) != "C00" or int(r.get("motCode") or 0) != 0:
            continue
        if int(r.get("mosCode") or 0) != 0:
            continue
        key = (int(r.get("reporterCode") or 0), str(r.get("cmdCode") or "").zfill(6))
        cur = out.setdefault(key, {"valueUsd": 0.0, "netWgtT": 0.0})
        cur["valueUsd"] += float(r.get("primaryValue") or 0)
        cur["netWgtT"] += float(r.get("netWgt") or 0) / 1000
    return out


def main() -> int:
    if not GHANA_TRADE.exists():
        print(f"가나 수출 데이터 없음 — extract_ghana_tuna_trade.py 를 먼저 실행: {GHANA_TRADE}",
              file=sys.stderr)
        return 1
    ghana = json.loads(GHANA_TRADE.read_text(encoding="utf8"))

    # 가나가 보고한 «상대국별 수출» (연도·HS·상대국)
    exp: dict[tuple[int, str], dict] = {}
    for r in ghana["rows"]:
        if r["year"] != YEAR or r["flow"] != "수출" or r["partnerCode"] == 0:
            continue
        key = (r["partnerCode"], r["hs"])
        cur = exp.setdefault(key, {"valueUsd": 0.0, "netWgtT": 0.0})
        cur["valueUsd"] += r["valueUsd"] or 0
        cur["netWgtT"] += r["netWgtT"] or 0

    # 상대국이 보고한 «가나發 수입»
    reporters = ",".join(str(c) for c in PARTNERS)
    mirror: dict[tuple[int, str], dict] = {}
    for code in CODES:
        url = (f"{BASE}?reporterCode={reporters}&cmdCode={code}"
               f"&period={YEAR}&flowCode=M&partnerCode={GHANA}")
        data = fetch(url)
        rows = data.get("data") or []
        got = aggregate_rows(rows)
        mirror.update(got)
        print(f"{code}: 원행 {len(rows)} -> 집계 {len(got)}", file=sys.stderr)
        time.sleep(0.8)

    pairs = []
    for code_partner, ko in PARTNERS.items():
        for hs in CODES:
            e = exp.get((code_partner, hs))
            m = mirror.get((code_partner, hs))
            if not e and not m:
                continue
            ev = round(e["valueUsd"]) if e else None
            mv = round(m["valueUsd"]) if m else None
            ratio = round(mv / ev, 2) if (ev and mv) else None
            pairs.append({
                "partner": ko,
                "partnerCode": code_partner,
                "hs": hs,
                "ghanaExportUsd": ev,
                "partnerImportUsd": mv,
                "ghanaExportT": round(e["netWgtT"], 1) if e else None,
                "partnerImportT": round(m["netWgtT"], 1) if m else None,
                # 1.0 근처면 정합. 1.05~1.15 는 CIF-FOB 차로 정상. 0.5 미만이면 조사 대상.
                "importOverExport": ratio,
            })

    both = [p for p in pairs if p["importOverExport"] is not None]
    ratios = sorted(p["importOverExport"] for p in both)
    median = ratios[len(ratios) // 2] if ratios else None
    exp_total = sum(p["ghanaExportUsd"] or 0 for p in pairs)
    imp_total = sum(p["partnerImportUsd"] or 0 for p in pairs)

    print(f"\n대조쌍 {len(pairs)}건 (양쪽 보고 {len(both)}건)", file=sys.stderr)
    print(f"가나 수출 합계 ${exp_total:,.0f} vs 상대국 수입 합계 ${imp_total:,.0f}"
          f" (비율 {imp_total / exp_total:.2f})" if exp_total else "", file=sys.stderr)
    print(f"쌍별 비율 중앙값 {median}", file=sys.stderr)
    for p in sorted(both, key=lambda x: x["importOverExport"])[:5]:
        print(f"  낮은쪽 {p['partner']} HS{p['hs']}: 수출 ${p['ghanaExportUsd']:,} vs "
              f"수입 ${p['partnerImportUsd']:,} = {p['importOverExport']}", file=sys.stderr)

    payload = {
        "meta": {
            "year": YEAR,
            "codes": CODES,
            "source": "UN Comtrade public preview",
            "method": "가나가 보고한 상대국별 수출 vs 상대국이 보고한 가나發 수입",
            "interpretation": "거울통계는 원래 정확히 일치하지 않는다. 수입 신고액은 운임·보험이 "
                              "얹힌 CIF 라 보통 수출(FOB)보다 5~15% 크고, 연말 선적분은 상대국에서 "
                              "다음 해로 잡히며, 제3국 경유분은 원산지 귀속이 갈린다. 따라서 "
                              "«수입 > 수출»은 정상이고, 수입이 수출을 크게 밑돌 때만 미보고를 "
                              "의심한다. 이 파일은 격차만 제시하고 판정하지 않는다.",
            "pairCount": len(pairs),
            "bothReportedCount": len(both),
            "medianRatio": median,
            "ghanaExportTotalUsd": exp_total,
            "partnerImportTotalUsd": imp_total,
            "totalRatio": round(imp_total / exp_total, 3) if exp_total else None,
        },
        "pairs": sorted(pairs, key=lambda p: -(p["ghanaExportUsd"] or 0)),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    print(f"-> {OUT} ({OUT.stat().st_size // 1024}KB)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
