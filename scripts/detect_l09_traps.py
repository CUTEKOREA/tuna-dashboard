#!/usr/bin/env python3
"""
L-09 시스템적 함정 자동 검출 스크립트

룰북 V4.2 L-09 (정직 LIVE 라벨) 패턴을 grep하여 즉시 정정 대상 위젯·라우트 보고.

사용:
    python3 scripts/detect_l09_traps.py                    # 전체 검사
    python3 scripts/detect_l09_traps.py --commodity squid  # 특정 commodity
    python3 scripts/detect_l09_traps.py --strict           # 의심 패턴까지

검출 패턴:
1. TSX 위젯: `import rawData from '../data/*.json'` + `status: 'LIVE'`
2. API 라우트: `readFileSync` + `"LIVE API"` / `🟢 LIVE` / `Forensic Audit Verified`
3. 위젯 카드: `apiSource: '...[LIVE API 연동]'` + 정적 import

종료 코드: 함정 검출 시 1, 깨끗하면 0 (CI 통합 가능).
"""
import re
import sys
import argparse
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
COMPONENTS = ROOT / "components"
API = ROOT / "app" / "api"

# 검출 패턴 정의
PATTERNS = {
    "tsx_live_static_json": {
        "desc": "TSX 위젯: 정적 JSON import + LIVE 라벨",
        "files": COMPONENTS,
        "ext": "*.tsx",
        "needs_all": [
            re.compile(r"import\s+\w+\s+from\s+['\"]\.\./data/.*\.json['\"]"),
            re.compile(r"status:\s*['\"]LIVE(?:\s+API)?['\"]"),
        ],
    },
    "tsx_apisource_live": {
        "desc": "TSX 위젯: apiSource '[LIVE API 연동]' 텍스트 + 정적 데이터",
        "files": COMPONENTS,
        "ext": "*.tsx",
        "needs_all": [
            re.compile(r"apiSource:\s*['\"][^'\"]*\[LIVE API"),
        ],
        "extra_check": "static_data_only",
    },
    "api_route_live_json": {
        "desc": "API 라우트: readFileSync + 'LIVE API' / '🟢 LIVE'",
        "files": API,
        "ext": "*.ts",
        "needs_all": [
            re.compile(r"readFileSync|fs\.readFileSync"),
        ],
        "needs_any": [
            re.compile(r"['\"](?:🟢\s*)?LIVE API['\"]"),
            re.compile(r"status:\s*['\"]🟢[^'\"]*['\"]"),
            re.compile(r"Forensic Audit Verified"),
            re.compile(r"\"실시간\s+텔레메트리"),
        ],
    },
    "api_route_isLive_hardcoded": {
        "desc": "API 라우트: isLive: true 하드코딩 + Math.random/정적 데이터",
        "files": API,
        "ext": "*.ts",
        "needs_all": [
            re.compile(r"isLive(?:Api)?:\s*true"),
        ],
        "needs_any": [
            re.compile(r"Math\.random"),
            re.compile(r"FALLBACK_|MOCK_"),
        ],
    },
    "api_route_sanctions_live": {
        "desc": "API 라우트: SANCTIONS_API_LIVE / API_LIVE 등 허위 라벨 변형",
        "files": API,
        "ext": "*.ts",
        "needs_all": [
            re.compile(r"(SANCTIONS_API_LIVE|API_LIVE\s*[:=]\s*true|\"LIVE\":\s*true)"),
        ],
    },
}


def scan_file(path: Path, pattern: dict) -> list[str]:
    """파일에서 패턴 검출. 매치된 라인 번호 반환."""
    try:
        src = path.read_text()
    except Exception:
        return []

    # needs_all: 모든 패턴이 파일에 있어야 함
    for p in pattern.get("needs_all", []):
        if not p.search(src):
            return []

    # needs_any: 적어도 하나
    if "needs_any" in pattern:
        if not any(p.search(src) for p in pattern["needs_any"]):
            return []

    # extra_check
    if pattern.get("extra_check") == "static_data_only":
        # fetch() 호출이 없어야 함
        if re.search(r"\bfetch\s*\(", src):
            return []

    # 매치된 라인 번호
    lines = []
    for i, line in enumerate(src.splitlines(), 1):
        for p in pattern.get("needs_all", []) + pattern.get("needs_any", []):
            if p.search(line):
                lines.append(f"  L{i}: {line.strip()[:120]}")
                break
    return lines[:5]  # 최대 5건


def scan_commodity(commodity: str | None = None, strict: bool = False) -> dict:
    """commodity별 또는 전체 검사."""
    findings = defaultdict(list)

    for name, pattern in PATTERNS.items():
        base = pattern["files"]
        ext = pattern["ext"]

        if name.startswith("tsx_"):
            files = list(base.glob(ext))
            if commodity:
                pfx = commodity.capitalize()
                files = [f for f in files if f.name.startswith(pfx)]
        else:
            files = list(base.rglob(ext))
            if commodity:
                files = [f for f in files if f"/{commodity.lower()}/" in str(f) or f"-{commodity.lower()}" in str(f)]

        for f in files:
            matches = scan_file(f, pattern)
            if matches:
                findings[name].append({
                    "file": str(f.relative_to(ROOT)),
                    "matches": matches,
                })

    return findings


def main():
    parser = argparse.ArgumentParser(description="L-09 시스템적 함정 자동 검출")
    parser.add_argument("--commodity", help="특정 commodity만 검사 (예: squid)")
    parser.add_argument("--strict", action="store_true", help="의심 패턴까지 검사")
    parser.add_argument("--json", action="store_true", help="JSON 출력")
    args = parser.parse_args()

    findings = scan_commodity(args.commodity, args.strict)

    if args.json:
        import json
        print(json.dumps(findings, ensure_ascii=False, indent=2))
        sys.exit(1 if findings else 0)

    # 사람용 출력
    total = sum(len(v) for v in findings.values())
    print(f"\n{'=' * 60}")
    print(f"🔍 L-09 시스템적 함정 검출 결과")
    print(f"{'=' * 60}")
    if args.commodity:
        print(f"대상 commodity: {args.commodity}")
    print(f"검출 패턴: {len(PATTERNS)}종")
    print(f"발견: {total}건\n")

    if not findings:
        print("✅ 깨끗! L-09 함정 없음.")
        sys.exit(0)

    for pattern_name, hits in findings.items():
        if not hits:
            continue
        pattern = PATTERNS[pattern_name]
        print(f"\n🚨 [{pattern_name}] {pattern['desc']}")
        print(f"   파일 {len(hits)}건:")
        for h in hits:
            print(f"\n  📄 {h['file']}")
            for m in h["matches"]:
                print(m)

    print(f"\n{'=' * 60}")
    print(f"⚠️  총 {total}건 L-09 함정 발견. 룰북 V4.2 L-09 정정 권고.")
    print(f"{'=' * 60}\n")
    sys.exit(1)


if __name__ == "__main__":
    main()
