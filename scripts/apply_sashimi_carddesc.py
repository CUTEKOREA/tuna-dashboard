#!/usr/bin/env python3
"""P1: replace generic placeholder cardDesc with grounded cardDesc (W-01).
Workflow-drafted, L-01 Koreanized (fish species names). 11 widgets."""
import os

BASE = "components/sashimi-strategy"
OLD = 'cardDesc="사시미/스테이크 시장 동향"'

# finalized cardDesc per widget (Koreanized fish names per L-01)
NEW = {
    "SasBluefinRanchingEconomics":
        "Eurostat 2023·EUMOFA BFT — 지중해 활어 €6.7/kg→축양→일본 수출 €13.3/kg 마진 2배 구조",
    "SasCoTreatmentImpact":
        "FDA Import Alert 45-02·미국 도매가 — CO 처리 베트남산 $2.50 vs 정상 황다랑어 $4.50/lb 단가 교란",
    "SasDomesticRetailTrend":
        "EUMOFA 2024 소매 분석 — 생물 참치 가구 침투율 프랑스 9.0%·독일 1.2%, 참다랑어 90%+ 일본 직수출",
    "SasEuQuotaProduction":
        "ICCAT 2024 쿼터 할당 보고서 — EU 참다랑어 21,503톤, 스페인·프랑스·이탈리아 3국이 93% 독점",
    "SasHawaiiDomesticNiche":
        "NOAA 호놀룰루 경매 — 최상급(#1) 생물 참치(황다랑어·눈다랑어) $12~14/lb·거래량 ~3,500톤",
    "SasHedonicPriceFactors":
        "호놀룰루 경매 쾌락적(Hedonic) 가격모델 — 눈다랑어 +$0.79·딥셋 +$0.62·조업일 1일당 -$0.14/lb",
    "SasQuotaVolatility":
        "ICCAT 2024 쿼터 리포트 — 서대서양 BFT 1,341톤(압박) vs EU 지중해 21,503톤(회복) 16배 양극화",
    "SasSashimiPriceLadder":
        "US Census 2024 도매 수입단가 — 냉동 사쿠 $11·생물 황다랑어 $13·참다랑어 $26+/kg 3단 계층",
    "SasSupplyChainSplit":
        "US Census 2024 비통조림 참치 수입 — 냉동 사쿠($487M·67%)·생물 참치($381M·33%) 이원 공급망 분리",
    "SasTraceabilityRatings":
        "Seafood Watch·NOAA SIMP — 자연산 참다랑어 'Red'(회피) 등급, US SIMP·EU CATCH(2026) 5대 리스크",
    "SasTriadDynamics":
        "US Census·UN Comtrade(HS0302-0304)·GLOBEFISH·MAFF — 미국 수입 $841M(2위)·EU 축양 허브·일본 소비 -51%",
}

applied, skipped = [], []
for comp, new in NEW.items():
    path = os.path.join(BASE, comp + ".tsx")
    txt = open(path, encoding="utf-8").read()
    if OLD not in txt:
        skipped.append((comp, "OLD not found"))
        continue
    if txt.count(OLD) != 1:
        skipped.append((comp, f"OLD count={txt.count(OLD)} (expected 1)"))
        continue
    new_line = f'cardDesc="{new}"'
    txt = txt.replace(OLD, new_line)
    open(path, "w", encoding="utf-8").write(txt)
    applied.append((comp, len(new)))

print(f"적용 {len(applied)}/{len(NEW)}:")
for c, l in applied:
    print(f"  ✅ {c} ({l}자)")
if skipped:
    print("건너뜀:")
    for c, r in skipped:
        print(f"  ⚠️ {c}: {r}")
