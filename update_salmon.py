import json
import os

filepath = "public/data/salmon_real_data_v2.json"

replacements = {
    "과거 자연산 의존에서 벗어나 현재 대서양 연어는 99.9%가 스마트 양식(Aquaculture)을 통해 생산됨.": "[Commoditization via Smart-Farm] 과거 자연산 어획에 의존하던 원시적 서플라이 체인은 완전히 붕괴되었으며, 현재 대서양 연어(Atlantic Salmon) 물동량의 99.9%는 데이터 기반 스마트 양식(Smart Aquaculture) 인프라를 통해 생산되는 완벽한 공산품(Commodity)으로 진화했습니다.",
    "수산물의 완전한 공산품화 달성. 자본력과 바이오/IT 기술력이 시장 지배력을 결정하는 핵심 변수임.": "[Capital & Bio-Tech Monopoly] 수산물의 100% 공산품화(Industrialization)가 달성된 종목입니다. 거대 자본력(Capex)과 딥테크(Bio/IT) 수율 관리 능력을 보유한 극소수 과점 기업만이 글로벌 팜게이트(Farm-Gate) 프라이싱을 통제하는 구조입니다.",
    "수요 대비 양식 면허의 물리적 한계로 공급 곡선이 경직되며 톤당 생산 부가가치(USD)가 수직 폭등 중임.": "[Supply Rigidity & Margin Squeeze] 연안 양식 면허(License) 발급의 환경적, 물리적 임계점 도달로 글로벌 공급 곡선이 극도로 경직(Rigidity)되었으며, 이로 인해 톤당 생산 부가가치(USD)가 수직 폭등(Spike)하는 슈퍼 사이클에 진입했습니다.",
    "메이저 양식 기업들의 독점적 마진 극대화 구간. 생산량의 단순 증가가 아닌 단위당 마진의 성장이 산업을 견인 중.": "[Oligopoly Margin Maximization] 메이저 양식 카르텔의 독점적 초과 이익(Alpha Margin) 극대화 구간입니다. 물량 밀어내기(Volume)가 아닌 단위당 마진(Unit Economics)의 지수함수적 성장이 전체 밸류에이션 리레이팅(Re-rating)을 견인하고 있습니다.",
    "노르웨이와 칠레 등 환경적 해만 조건을 갖춘 극소수 국가가 전 세계 양식 생산의 절대 다수를 점유함.": "[Geographic Moat Monopoly] 피오르드(Fjord) 등 한랭 해만 조건을 독점한 극소수 국가(노르웨이, 칠레)가 전 세계 원물 생산의 90% 이상을 틀어쥐는 압도적 지리적 해자(Geographic Moat)를 구축했습니다.",
    "독점 생태계 고착화. 신규 진입자는 기존 밸류체인에 편입되거나 완전히 새로운 스마트 육상 양식(RAS)으로만 승부 가능.": "[RAS Pivot Requirement] 해상 독점 생태계는 완벽히 고착화되었습니다. 신규 자본은 기존 거대 벤더의 하청으로 편입되거나, 수조 원대 CAPEX를 투하해 차세대 순환여과양식(RAS, Recirculating Aquaculture Systems) 딥테크로 전면 우회(Pivot)하는 전략 외엔 진입로가 차단되었습니다.",
    "훈제, 필렛 등 냉장/냉동 2차 가공품 생산량이 폭발적으로 우상향하고 있음.": "[Value-Add Processing Explosion] 단순 원물(Raw) 유통을 넘어 훈제(Smoked), 필렛(Fillet) 등 하이엔드 2차 가공품(Processed Value-Add) 라인의 글로벌 물동량이 퀀텀 점프(Quantum Jump)하며 우상향 중입니다.",
    "원물을 도매로 파는 시대는 종말. B2C 및 B2B 직납이 가능한 2차 가공 팩토리를 보유하는 구가 및 기업이 매출 방어의 핵심.": "[Post-Brokerage Margin Capture] 단순 블록 브로커리지 시대는 종말을 고했습니다. 강력한 B2C/B2B 직납망(Direct-to-Consumer)과 무인화 2차 가공 클린룸(Cleanroom)을 내재화한 기업만이 라스트마일 마진(Last-mile Margin)을 방어하고 독식합니다.",
    "주요 양식 국가들의 매출액이 천문학적인 달러 규모로 상승 중. 생명공학과 해양공학이 결합된 고정 마진 산업.": "[Cash-cow Compounding] 탑 티어 국가들의 매출 규모가 천문학적 달러 팽창(Dollar Expansion)을 거듭 중입니다. 해양공학과 바이오테크가 결합되어 연간 30% 이상의 영업이익(OPM)을 확정적으로 뽑아내는 구조적 캐시카우(Cash-cow)입니다.",
    "노르웨이 연어 산업은 국가 핵심 캐시카우. 타 국가의 개별 기업이 자본집약적 전면전을 벌이기엔 한계가 명백함.": "[Sovereign Wealth Equivalent] 노르웨이의 연어 비즈니스는 단일 기업을 넘어선 '국가 국부 펀드(Sovereign Wealth)' 급 코어 산업입니다. 어설픈 중소 유통 자본으로 자본 집약적 전면전(Head-to-head)을 벌이는 것은 재무적 자살 행위입니다.",
    "신흥국 중산층 증가 및 스시/샐러드 문화 보급을 통해 무역 거래량이 기하급수적으로 팽창함.": "[Global Demand Super-cycle] 아시아/남미 신흥국 중산층의 폭발적 증가와 하이엔드 일식(Sushi)/샐러드 헬스케어 메가트렌드가 결합되어 글로벌 무역 볼륨이 지수함수적(Exponential)으로 팽창 중입니다.",
    "전 세계가 블랙홀처럼 연어를 흡수 중. 수요가 공급 한계선을 넘어서며 영구적인 셀러(Seller) 우위 시장이 형성됨.": "[Permanent Seller's Market] 전 세계 소비 시장이 원물을 블랙홀처럼 흡수(Absorbing)하고 있습니다. 수요 폭발이 물리적 공급 캡(Cap)을 영구적으로 돌파하며, 완벽하고도 영구적인 셀러 우위(Seller's Market) 프라이싱 파워가 확립되었습니다.",
    "글로벌 수출 이익 구조가 소수 국가의 메이저 기업(Mowi, SalMar 등)에 집중됨.": "[Cartel Profit Concentration] Mowi, SalMar 등 글로벌 탑 4 메가 트레이더들이 전 세계 연어 수출 마진의 80% 이상을 흡수하는 노골적인 카르텔(Cartel) 독식 구조가 완성되었습니다.",
    "자국 내 소비를 넘어 전 세계 식탁의 룰을 세팅하는 거대 생산국의 현금 창출 메커니즘을 벤치마킹할 필요가 있음.": "[Global Hegemony Replication] 자국 내전(Local Market)에 머무르지 마십시오. 글로벌 식음료 룰(Rule-setting)을 지배하는 거대 생산 카르텔의 현금 창출 밸류체인을 수직 분석하여 당사 SCM에 강제 이식(Replication)해야 합니다.",
    "미국과 EU 주요국 등 선진국 중심의 초거대 소비 시장이 무역액의 과반수 이상을 잠식함.": "[Mega-Market Consumption Gravity] 미국, EU 등 1인당 GDP 최상위 선진국 블록(Developed Block)이 글로벌 전체 무역 거래액의 60% 이상을 블랙홀처럼 빨아들이는 거대한 소비 중력(Consumption Gravity)을 형성 중입니다.",
    "메가 소비 국가들의 자가 증식. 국내 기업이 글로벌 무역에 뛰어들기 위해서는 이들 메가 바이어의 조달 시스템 공략이 필수.": "[Tier-1 Buyer Penetration] 선진국 메가 바이어 벤더십 확보가 생존의 알파입니다. 당사가 글로벌 무역 데스크를 셋업하려면, 이들 초거대 유통망(Walmart, Costco)의 중앙 조달 시스템(Central Sourcing)을 직타격(Direct Penetration)해야 합니다.",
    "국내 양식 인프라 부재로 수년 간 한국의 연어 수입량이 수직으로 폭등함.": "[Domestic Infrastructure Vacuum] 자국 내 RAS 양식 등 대체 인프라(Infrastructure Vacuum)의 완벽한 부재 속에서, 폭발하는 내수 수요를 감당하기 위해 한국의 수입 물동량이 통제 불능의 수직 폭등장(Vertical Spike)을 연출하고 있습니다.",
    "안정적인 식량 안보 붕괴. 전략적인 수입 다변화 혹은 해외 우량 파트너십(JV) 편입 없이는 향후 가격 폭탄을 그대로 떠안게 됨.": "[Hedging / JV Mandate] 단일 어종 의존에 따른 식량 안보 붕괴 리스크입니다. 칠레/호주 등 대체 산지 듀얼 소싱(Dual-Sourcing) 또는 글로벌 티어 1 팩토리와의 조인트 벤처(JV) 락인 없이는 인플레이션 가격 폭탄을 100% 흡수해야 합니다.",
    "수출 대비 수입이 압도적으로 많아 연어 단일 품목에서 매년 막대한 달러가 해외로 유출되는 중.": "[Structural Trade Deficit] 연어 단일 품목에 의한 압도적인 수입 초과로 국가 및 당사 차원의 거대한 달러 유출(Dollar Drain) 펀더멘털 적자가 매년 누적되고 있습니다.",
    "수산업 무역 적자의 최대 주범 중 하나. 단기적으로 부가가치를 내려면 국내에서의 필렛팅 2차 가공 수출이 해답.": "[Value-Add Arbitrage Strategy] 무역 적자를 역이용하는 전략(Arbitrage)이 필요합니다. 수입된 H&G(머리/내장 제거) 원물을 국내 최첨단 자동화 라인에 태워(Filleting/Portioning) 초격차 2차 프리미엄 가공품으로 전환, 아시아 타겟으로 역수출하는 밸류에드 포지션(Value-add Position)이 유일한 해답입니다.",
    "노르웨이/칠레 등 1차 공급자의 출하 가격 인상에 한국 수입 단가가 고스란히 방치됨.": "[Price-Taker Vulnerability] 글로벌 1차 벤더 카르텔의 팜게이트 단가(FOB) 랠리에 한국의 로컬 브로커들이 아무런 헷징 툴 없이 무방비 노출되는 치명적인 프라이스 테이커(Price-Taker) 포지션에 갇혀 있습니다.",
    "자체 수입 공급망(Direct Sourcing) 또는 대규모 선물 계약(Hedging) 역량이 절실히 요구됨.": "[Forward Hedging & SCM Lock-in] 구시대적 스팟(Spot) 매입을 폐기하십시오. 북유럽 메인 팜과의 연간 하드 락인(Hard Lock-in) 선도 계약(Forward Hedging)을 체결하고 자체 풀콜드체인(Full Cold-Chain)을 내재화하는 SCM 수직화 부서 신설을 지시합니다.",
    "전 세계 평균 수출 단가 대비 노르웨이산 연어의 수출 단가가 안정적인 프리미엄 갭을 유지 중.": "[Brand Premium Spread] 전 세계 평균 벤치마크 단가 대비, 노르웨이산(Norwegian Origin) 연어가 압도적 브랜드 IP를 바탕으로 구조적이고 영구적인 초과 마진 갭(Premium Spread)을 방어해내고 있습니다.",
    "가장 강력한 브랜드력. 한국 유통 시에도 '노르웨이 프리미엄 생연어' 카테고리가 핵심 이익 창출구.": "[High-Margin IP Exploitation] 기구축된 노르웨이 프리미엄 IP 파워에 무임승차(Free-riding)하십시오. 국내 B2C 런칭 시 '노르웨이 직항 항공 직송 생연어(Chilled)' 카테고리에 전사 마케팅 예산을 융단폭격하여 최고 마진율(Max OPM)을 창출해야 합니다."
}

if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated = False
    for widget in data.get("widgets", []):
        if widget.get("situation") in replacements:
            widget["situation"] = replacements[widget["situation"]]
            updated = True
        if widget.get("takeaway") in replacements:
            widget["takeaway"] = replacements[widget["takeaway"]]
            updated = True

    if updated:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Updated salmon_real_data_v2.json")
    else:
        print("No replacements made in salmon_real_data_v2.json")
else:
    print("File not found")

