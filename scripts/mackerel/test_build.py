#!/usr/bin/env python3
"""빌드 파이프라인 자체점검. assert 기반, 프레임워크 없음.

  python scripts/mackerel/test_build.py
"""
import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build
import scope

DATA = build.OUT_DIR


def digest():
    """산출물 전체의 단일 해시. 결정성 확인용."""
    h = hashlib.sha256()
    for p in sorted(DATA.glob(build.OUT_GLOB)):
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()


def test_scope_excludes_lookalikes():
    """전갱이·삼치·임연수어가 고등어로 새어 들어오면 모든 수치가 부풀려진다."""
    assert scope.is_scomber_commodity("Mackerels nei, frozen")
    assert scope.is_scomber_commodity("Atlantic mackerel, frozen")
    assert scope.is_scomber_commodity("Chub mackerel prepared or preserved, not minced")
    assert not scope.is_scomber_commodity("Jack and horse mackerel, frozen")
    assert not scope.is_scomber_commodity("Atka mackerel, frozen")
    assert not scope.is_scomber_commodity("Spanish mackerel, frozen")
    assert not scope.is_scomber_commodity("Anchovies, Indian mackerels, seerfishes, jacks, frozen")
    assert not scope.is_scomber_commodity("Herring,anchovy,sardine,mackerel,dried")
    assert not scope.is_scomber_commodity("Cod, frozen")
    assert scope.is_scomber_species("Atlantic mackerel")
    assert not scope.is_scomber_species("Jack and horse mackerels NEI")
    assert not scope.is_scomber_species("Mako sharks")


def test_confirmed_definitions():
    """2026-08-13 승인된 정의 3건이 산출물에 그대로 박혀 있는가."""
    prod = json.loads((DATA / "s1_korea_production.json").read_text(encoding="utf-8"))
    last = prod["data"][-1]
    assert last["year"] == "2024", last
    assert last["국내조달비율"] == 76.1, f"국내 조달 비율 정의 이탈: {last['국내조달비율']}"
    assert last["공식자급률"] > 100, f"공식 자급률(수출 차감) 100% 초과 예상: {last['공식자급률']}"
    assert last["수출"] > last["수입"], "수출>수입 구조가 깨지면 서사를 다시 써야 한다"

    mix = json.loads((DATA / "s1_import_origin_mix.json").read_text(encoding="utf-8"))
    nor = mix["data"][-1]["노르웨이"]
    assert 87 <= nor <= 89, f"노르웨이 의존도(물량) 이탈: {nor}"

    afr = json.loads((DATA / "s3_africa_volume_price.json").read_text(encoding="utf-8"))
    assert afr["data"][-1]["YoY"] == -16.9, afr["data"][-1]
    assert "+137.1%" in afr["subtitle"], afr["subtitle"]


def test_provenance_present():
    for p in sorted(DATA.glob(build.OUT_GLOB)):
        w = json.loads(p.read_text(encoding="utf-8"))
        prov = w.get("provenance")
        assert prov, f"{p.name}: provenance 없음"
        assert prov["source_id"], p.name
        assert prov["input_sha256"] and all(len(h) == 64 for h in prov["input_sha256"]), p.name
        assert w.get("sit") and w.get("strat"), f"{p.name}: SIT/TAK 누락"


def test_deterministic():
    """같은 입력 → 같은 출력. 시각·난수가 새어 들어가면 여기서 걸린다."""
    before = digest()
    build.run()
    assert digest() == before, "재빌드 결과가 달라졌다 — 비결정적 요소가 있다"


def main():
    build.run()
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"  ✓ {t.__name__}")
    print(f"\n{len(tests)}개 통과")


if __name__ == "__main__":
    main()
