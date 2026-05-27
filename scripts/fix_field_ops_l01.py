#!/usr/bin/env python3
"""
L-07 일괄 변환 — TunaOperationalIntelWidgets.tsx
1. "⚡ 실무/현장 작전 인텔리전스 (Field Ops)" h3 헤더 5개 제거 (불필요한 sub-section banner)
2. CardHeader term="<English>" 30건을 한글로 변환 (L-01 위반)
"""

import re
import sys
from pathlib import Path

FILE = Path(__file__).parent.parent / "components" / "TunaOperationalIntelWidgets.tsx"

# 영문 term → 한글 translation map
TERM_TRANSLATIONS = {
    "SST Anomaly": "수온 아노말리",
    "Acoustic FADs": "스마트 집어장치",
    "Area Exhaustion": "어장 고갈",
    "El Nino-La Nina": "엘니뇨·라니냐",
    "Habitat Shift": "서식지 이동",
    "Species Dominance": "어종 점유율",
    "Hegemony Shift": "패권 이동",
    "Premium Peak Cross": "프리미엄 교차점",
    "Aquaculture Disruption": "양식업 파괴",
    "Profit Paradigm": "수익 패러다임",
    "Decentralization": "가공 허브 분산",
    "Ready-To-Eat": "즉석조리 식품",
    "By-products": "부산물 활용",
    "CVC Diversification": "포트폴리오 다각화",
    "Logistics Bottleneck": "물류 병목",
    "Tariff Arbitrage": "관세 차익",
    "Export Share Risk": "수출 집중도 리스크",
    "Korea Import Radar": "한국 수입 레이더",
    "Import Blackhole": "수입 블랙홀",
    "Panic Buying": "패닉 매입",
    "Economic Switching": "경기 전환",
    "Albacore Surge": "알바코어 부상",
    "Alt-Tuna Intrustion": "대체 참치 침투",
    "Electronic Monitoring": "전자 모니터링",
    "Human Rights Tracing": "인권 추적",
    "Penalty Limit Exceedance": "쿼터 초과 페널티",
    "MSC Premium": "MSC 프리미엄",
    "BEP Crossover": "손익분기 교차",
    "Green Bond": "녹색 채권",
}


def main():
    text = FILE.read_text()
    original = text

    # 1. Banner 제거 — h3 헤더 1개를 통째로 정규식으로 매칭
    banner_pattern = re.compile(
        r"      <h3 style=\{\{ fontSize: '1\.15rem', color: '#f8fafc', marginBottom: '1\.5rem', display: 'flex', alignItems: 'center', gap: '8px' \}\}>\s*\n"
        r"        ⚡ 실무/현장 작전 인텔리전스 \(Field Ops\)\s*\n"
        r"      </h3>\s*\n",
        re.MULTILINE,
    )
    banner_count = len(banner_pattern.findall(text))
    text = banner_pattern.sub("", text)
    print(f"[1] Banner removed: {banner_count} occurrences")

    # 2. term=" English " → term=" 한글 "
    term_count = 0
    for eng, kor in TERM_TRANSLATIONS.items():
        # term=" + literal + " (no regex — use str.replace)
        pattern = f'term="{eng}"'
        replacement = f'term="{kor}"'
        before = text.count(pattern)
        text = text.replace(pattern, replacement)
        if before > 0:
            term_count += before
            print(f"    {eng:30s} → {kor:20s} ({before})")
    print(f"[2] Term translated: {term_count} occurrences")

    if text == original:
        print("⚠ No changes")
        sys.exit(1)

    FILE.write_text(text)
    print(f"✓ Wrote {FILE}")


if __name__ == "__main__":
    main()
