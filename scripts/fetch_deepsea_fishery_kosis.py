#!/usr/bin/env python3
"""KOSIS 원양어업통계조사(승인 제114048호) 18개 표 → `public/data/deepsea_fishery_v1.json`.

해양수산부가 원양어업 허가를 받은 **모든 어선과 그 보유 업체를 전수조사**하는 법정 통계다.
KOSIS 공표분은 업종·어종·규모 구간까지만 내려온다 — **회사명·선박명은 없다.**
(OFIS 조사개요는 「(어선별) 생산실적」도 공표범위라 밝히지만 그 경로는 승인 계정이 필요하고
 공개 링크는 404 다. 2026-08-17 실측.)

⚠ 측정 경계 — 이 통계는 **원양어업만** 담는다. 연근해 어획과 더할 수 없고,
   FAO 생산 통계와도 집계 기준이 다르다. 그 경계를 데이터 meta 에 실어 화면까지 옮긴다.

키는 `KOSIS_API_KEY` 환경변수 또는 `--key` 로 받는다. 응답은 그대로 저장하지 않고
필요한 축만 남겨 경량 JSON 으로 만든다 (L-08 — 원본 덤프는 커밋하지 않는다).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/data/deepsea_fishery_v1.json"

ORG_ID = "146"
BASE = "https://kosis.kr/openapi/Param/statisticsParameterData.do"

# 표 ID → 화면에서 쓸 이름. KOSIS 목록(123_1449)에서 그대로 가져왔다.
TABLES: dict[str, str] = {
    "DT_MLTM_5002622": "종사자수",
    "DT_MLTM_5002623": "연간급여액",
    "DT_MLTM_5002624": "규모별생산",
    "DT_MLTM_5002625": "업종별생산",
    "DT_MLTM_5002626": "해역별생산",
    "DT_MLTM_5002627": "규모별수출",
    "DT_MLTM_5002628": "품종별수출",
    "DT_MLTM_5002629": "국가별수출",
    "DT_MLTM_5002630": "재무상태표",
    "DT_MLTM_5002631": "손익계산서",
    "DT_MLTM_5002632": "제조원가명세서",
    "DT_MLTM_5002633": "손익관계비율",
    "DT_MLTM_5002634": "자산자본관계비율",
    "DT_MLTM_5002635": "자산자본회전율",
    "DT_MLTM_5002636": "생산성지표",
    "DT_MLTM_5002637": "연간어로원가",
    "DT_MLTM_5002638": "선원승선현황",
    "DT_MLTM_5002639": "선원임금현황",
}

# 이 슬라이스가 오징어 화면의 근거다. 이름이 바뀌면 화면이 조용히 비므로 검사한다.
SQUID_GEAR = "오징어채낚기"


def fetch(key: str, tbl: str, years: int) -> list[dict]:
    """표마다 분류 축 수가 다르다 — 1개짜리도 3개짜리도 있다.

    축 수를 틀리면 KOSIS 가 「필수요청변수값이 누락」 또는 「잘못된 요청 변수」로 거절한다.
    메타를 따로 조회하는 대신 1~3축을 차례로 시도한다. 표가 18개뿐이라 이 편이 짧고,
    KOSIS 메타 API 는 표마다 응답 모양이 또 달라 파서를 하나 더 만들게 된다.
    """
    errors = []
    for depth in (1, 2, 3):
        params = {
            "method": "getList",
            "apiKey": key,
            "itmId": "ALL",
            "format": "json",
            "jsonVD": "Y",
            "prdSe": "Y",
            "newEstPrdCnt": years,
            "orgId": ORG_ID,
            "tblId": tbl,
        }
        for i in range(1, depth + 1):
            params[f"objL{i}"] = "ALL"
        with urllib.request.urlopen(f"{BASE}?{urllib.parse.urlencode(params)}", timeout=60) as r:
            body = json.loads(r.read().decode("utf8"))
        if isinstance(body, list):
            return body
        errors.append(f"{depth}축: {body.get('errMsg', body)}")
    raise RuntimeError(f"{tbl}: " + " / ".join(errors))


# 어종 축이 있는 표는 오징어 슬라이스와 합계만 남긴다. 전 어종을 실으면 10MB 를 넘어
# L-08 에 걸리고, 화면이 쓰지도 않는 68,000 행을 번들에 태우게 된다.
KEEP = ("오징어", "합계", "전체", "소계")


def is_wanted(r: dict) -> bool:
    """오징어 슬라이스이거나 비교 기준이 되는 합계 행인가."""
    c1 = str(r.get("분류1") or "")
    c2 = str(r.get("분류2") or "")
    if any(k in c1 for k in KEEP) or any(k in c2 for k in KEEP):
        return True
    # 어종 축이 아예 없는 표(재무·선원 등)는 원양 전체 구조라 그대로 둔다.
    return False


def slim(rows: list[dict]) -> list[dict]:
    """화면에 필요한 축만 남긴다. 원본 응답은 필드가 30개 넘고 대부분 안 쓴다."""
    out = []
    for r in rows:
        v = r.get("DT")
        if v in (None, "", "-"):
            continue
        try:
            num = float(v)
        except ValueError:
            continue
        out.append(
            {
                "연도": r.get("PRD_DE"),
                "분류1": r.get("C1_NM"),
                "분류2": r.get("C2_NM"),
                "항목": r.get("ITM_NM"),
                "값": num,
                "단위": r.get("UNIT_NM"),
            }
        )
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=os.environ.get("KOSIS_API_KEY", ""))
    ap.add_argument("--years", type=int, default=5)
    args = ap.parse_args()
    if not args.key:
        print("KOSIS_API_KEY 가 없다. --key 로 넘기거나 환경변수에 넣어라.", file=sys.stderr)
        return 1

    tables: dict[str, list[dict]] = {}
    failed: list[str] = []
    for tbl, name in TABLES.items():
        try:
            rows = slim(fetch(args.key, tbl, args.years))
        except Exception as exc:  # noqa: BLE001 — 한 표가 죽어도 나머지는 받는다
            print(f"⚠ {name}({tbl}) 실패: {exc}", file=sys.stderr)
            failed.append(name)
            continue
        # 어종 축이 있는 표만 거른다. 없는 표는 통째로 남긴다(원양 전체 구조라 다 쓴다).
        has_species = any("오징어" in str(r.get("분류1")) or "오징어" in str(r.get("분류2"))
                          for r in rows)
        kept = [r for r in rows if is_wanted(r)] if has_species else rows
        tables[name] = kept
        note = f" (어종축 → {len(rows)}행에서 추림)" if has_species else ""
        print(f"  {name:<14} {len(kept):>5}행{note}", file=sys.stderr)

    if failed:
        # 일부만 받고 조용히 내보내면 화면이 빈 채로 나간다. 무엇이 빠졌는지 밝힌다.
        print(f"⚠ 실패한 표 {len(failed)}개: {failed}", file=sys.stderr)
        return 1

    # 오징어 슬라이스가 실제로 있는지 본다. 업종 이름이 바뀌면 여기서 걸린다.
    gears = {r["분류2"] for r in tables["업종별생산"] if r["분류2"]}
    if SQUID_GEAR not in gears:
        print(f"⚠ 업종에 「{SQUID_GEAR}」가 없다. 실제 업종: {sorted(gears)}", file=sys.stderr)
        return 1
    squid = [r for r in tables["업종별생산"] if r["분류2"] == SQUID_GEAR]
    if not squid:
        print(f"⚠ {SQUID_GEAR} 행이 0개다", file=sys.stderr)
        return 1

    years = sorted({r["연도"] for r in tables["업종별생산"]})
    payload = {
        "_meta": {
            "출처": "해양수산부 원양어업통계조사 (통계법 승인 제114048호) · KOSIS 국가통계포털",
            "표": f"{len(tables)}종 (KOSIS 목록 123_1449)",
            "기간": f"{years[0]}~{years[-1]}",
            "조사방식": "원양어업 허가를 받은 모든 어선과 보유 업체 전수조사",
            "공표주기": "매년 8월",
            "측정경계": (
                "원양어업만 담는다. 연근해 어획과 더할 수 없고 FAO 생산 통계와도 집계 기준이 "
                "다르다. 생산량은 어획 기준이며 통관·수출 중량과도 직접 견줄 수 없다."
            ),
            "단위한계": (
                "KOSIS 공표분은 업종·어종·규모 구간까지다. 회사명·선박명은 공표되지 않는다. "
                "OFIS 조사개요는 「(어선별) 생산실적」도 공표범위라 밝히지만 승인 계정이 필요하고 "
                "공개 링크는 404 였다(2026-08-17 실측)."
            ),
            "갱신방법": "python3 scripts/fetch_deepsea_fishery_kosis.py --key <KOSIS_API_KEY>",
        },
        "tables": tables,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf8")
    total = sum(len(v) for v in tables.values())
    print(
        f"-> {OUT} ({OUT.stat().st_size // 1024}KB) · 표 {len(tables)}종 · 총 {total:,}행"
        f" · {SQUID_GEAR} {len(squid)}행",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
