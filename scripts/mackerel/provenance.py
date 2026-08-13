#!/usr/bin/env python3
"""provenance 블록 생성·검증 공용 모듈.

모든 위젯 JSON은 이 블록 없이 빌드될 수 없다. source_id 는
아카이브 소스 원장(00_운영/source_registry.csv)에 실재해야 한다.
"""
import csv
import hashlib
from functools import lru_cache
from pathlib import Path

from scope import ARCHIVE

REGISTRY = ARCHIVE / "00_운영/source_registry.csv"
GRADES = {"A", "B", "C"}
METHODS = {"script", "manual_extract", "api_live"}


@lru_cache(maxsize=1)
def registry_ids() -> frozenset:
    with REGISTRY.open(encoding="utf-8-sig") as fh:
        return frozenset(r["source_id"] for r in csv.DictReader(fh) if r["source_id"])


@lru_cache(maxsize=1)
def registry_meta() -> dict:
    with REGISTRY.open(encoding="utf-8-sig") as fh:
        return {r["source_id"]: r for r in csv.DictReader(fh) if r["source_id"]}


@lru_cache(maxsize=64)
def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def build(source_id: str, *, period: str, inputs: list[Path], method: str = "script",
          grade: str = "A", rebuild: str, note: str = "") -> dict:
    """provenance 블록을 만든다. 잘못된 입력은 여기서 죽는다."""
    if source_id not in registry_ids():
        raise ValueError(f"source_id '{source_id}' 가 소스 원장에 없다: {REGISTRY}")
    if method not in METHODS:
        raise ValueError(f"method '{method}' 불가. {METHODS}")
    if grade not in GRADES:
        raise ValueError(f"grade '{grade}' 불가. {GRADES}")
    missing = [p for p in inputs if not p.exists()]
    if missing:
        raise FileNotFoundError(f"입력 파일 없음(구글드라이브 동기화 확인): {missing}")

    meta = registry_meta()[source_id]
    return {
        "source_id": source_id,
        "publisher": meta["publisher"],
        "series": meta["series"],
        "period": period,
        "extract_date": meta["last_verified"],
        "input_files": [str(p.relative_to(ARCHIVE)) for p in inputs],
        "input_sha256": [sha256(p) for p in inputs],
        "method": method,
        "grade": grade,
        "rebuild": rebuild,
        "note": note,
    }
