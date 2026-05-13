import os
import re

replacements = {
    "새우 산업은 2000년대 이후 인공 양식(Aquaculture)의 폭발적 증가로 전체 생산량이 수직 상승했습니다.": "[Aquaculture Hyper-Growth] 2000년대 이후 인공 양식(Aquaculture) 인프라의 폭발적 증가로 새우 생산량 곡선이 구조적 수직 팽창(Vertical Expansion) 단계에 진입하며, 글로벌 식량 밸류체인의 판도가 영구적으로 재편되었습니다.",
    "자연산 어획에 의존하던 비즈니스 모델을 완전히 탈피하고 글로벌 양식 밸류체인에 편입해야 합니다.": "[Value-Chain Migration] 자연산 어획에 의존하는 낡은 비즈니스 모델(Legacy Model)에서 즉각 탈피하십시오. 전사 CAPEX를 글로벌 양식 밸류체인 편입 및 스마트 아쿠아팜 지분 확보에 집중하여 원가 주도권(Cost Leadership)을 탈환해야 합니다.",
    "2000년대 초반 기점으로 양식 생산량이 자연산 어획량을 추월하는 골든 크로스가 발생했습니다.": "[Production Golden-Cross] 2000년대 초반을 기점으로 양식 생산량이 자연산 어획량을 영구적으로 초월(Structural Golden-Cross)하며, 공급 주도권이 해양 선단에서 육상 플랜트로 완전히 이전되었습니다.",
    "기존 원양어선 선단 투자를 전면 보류하고, 양식 인프라 펀드나 육상 가공 플랜트에 자본을 집중하십시오.": "[CAPEX Reallocation] 기존 원양어선 선단(Fleet)에 대한 신규 투자를 전면 보류(Hold)하십시오. 가용 유동성(Liquidity)을 양식 인프라 펀드(Infrastructure Fund) 및 최첨단 육상 가공 플랜트(Processing Plant) 확보에 전면 재배치(Reallocation)해야 합니다.",
    "양식 생산량 증대와 더불어 시장 단가 상승이 결합되어 산업 가치(Market Value)가 천문학적으로 팽창 중입니다.": "[Market Value Explosion] 생산량(Volume) 팽창과 마켓 프라이싱(Pricing) 상승이 결합된 강력한 쌍끌이 호황으로, 글로벌 양식 산업의 총체적 시장 가치(Total Addressable Market)가 천문학적 스케일로 팽창 중입니다.",
    "생산량(Volume) 경쟁을 넘어 단위당 고수익(Value)을 낼 수 있는 친환경/질병 내성 프리미엄 양식장 인수에 나서야 합니다.": "[Premium Asset Acquisition] 단순 볼륨(Volume) 기반의 덤핑 경쟁을 즉시 중단하십시오. 단위당 최고 마진율(Value)을 보장하는 친환경 인증(ASC) 및 질병 내성(SPF)을 갖춘 하이엔드 프리미엄 양식장 자산(Asset) 인수에 전사 M&A 역량을 집중하십시오.",
    "새우 공급망의 65% 이상이 양식업에 완전히 잠식되었습니다.": "[Aquaculture Penetration] 글로벌 새우 공급망(Supply Chain)의 65% 이상이 양식업 베이스로 완전히 재편(Market Penetration)되며, 양식 원가 경쟁력이 시장의 표준(Standard)으로 자리 잡았습니다.",
    "자연산 마케팅은 최상급 니치 마켓(Niche Market)으로 국한하고 대중적인 B2B 체인은 100% 양식 기반 SCM으로 개편해야 가격 경쟁력이 성립합니다.": "[Two-Track SCM Strategy] 포트폴리오를 철저히 이원화(Two-track)하십시오. 자연산은 최고가 파인다이닝향 니치 마켓(Niche Market) 전용으로 격리하고, 볼륨을 책임지는 B2B 프랜차이즈 체인은 100% 원가 통제가 가능한 양식 기반 SCM으로 전면 개편(Restructuring)해야 생존 가능합니다.",
    "중국, 인도, 에콰도르 3국이 글로벌 생산의 사실상 마켓 헤게모니를 쥐고 있습니다.": "[Triopoly Hegemony] 중국, 인도, 에콰도르 3개국이 글로벌 양식 생산 물량의 절대다수를 통제하며, 사실상의 시장 독과점(Oligopoly/Triopoly) 헤게모니를 완벽하게 구축했습니다.",
    "이 3개국의 작황이나 기후(El Nino 등) 리스크가 곧바로 당사의 영업이익 직격타로 돌아옵니다. 전담 인력을 통한 C/I/E 벨트 데일리 모니터링이 필수입니다.": "[Macro Risk Monitoring] 이 3대 메이저 국가의 기후변화(El Nino) 및 생물학적 리스크가 당사 영업이익(OPM)의 치명적 변수로 작용합니다. C/I/E(China/India/Ecuador) 벨트에 대한 퀀트 기반 실시간 리스크 모니터링 데스크를 즉각 신설하십시오.",
    "양식업 주도권은 자본과 토지가 집약된 아시아와 에콰도르에 극도로 쏠려 있습니다.": "[Geopolitical Concentration Risk] 양식업의 구조적 주도권이 광활한 토지와 값싼 자본이 집약된 아시아 및 에콰도르(LATAM) 지역으로 극단적 쏠림(Geopolitical Concentration) 현상을 보이고 있습니다.",
    "새로운 가공 조인트벤처(JV)를 설립한다면, 압도적 원물 소싱이 보장되는 인도나 에콰도르에 스마트 팩토리 형태로 진입하는 것이 유리합니다.": "[FDI & Joint Venture Strategy] 무의미한 제3국 투자를 배제하십시오. 압도적 원물 소싱 캐파(CAPA)가 보장되는 인도 또는 에콰도르 핵심 기지에 직접투자(FDI) 기반의 조인트벤처(JV) 스마트 팩토리를 설립하여 서플라이 체인의 최상단을 점유해야 합니다.",
    "양식업에 밀렸음에도 중국과 아르헨티나는 거대 선단을 이용해 붉은새우 등 특수 어종 생태계를 끌어가고 있습니다.": "[Niche Market Dominance] 범용 양식업의 폭발적 팽창 속에서도, 중국과 아르헨티나는 거대 조업 선단을 활용해 붉은새우(Argentine Red Shrimp) 등 고부가가치 특수 어종 생태계(Niche Market)를 강력하게 장악하고 있습니다.",
    "양식 새우(Vannamei)와 자연산(Argentine Red Shrimp)은 타겟 소비층 자체가 다릅니다. B2B 파인다이닝 납품용으로는 오히려 어획 물량 확보가 경쟁력이 될 수 있습니다.": "[Targeted Allocation Strategy] 양식(Vannamei)과 자연산 붉은새우(Argentine Red)의 타겟 소비층(Target Audience)은 완전히 디커플링(Decoupling)되어 있습니다. B2B 하이엔드 파인다이닝 전용으로 자연산 희귀 어획 물량을 독점 락인(Lock-in)하여 초격차 경쟁력을 확보하십시오.",
    "생산량 Top3와 부가가치 Top3가 정확히 일치하며 극강의 과점 시장을 형성 중입니다.": "[Value Capture Monopoly] 글로벌 물량 생산량(Volume) Top 3 국가가 창출하는 부가가치(Value-Add) Top 3 순위와 완벽히 동기화(Synchronization)되며 극단적인 이익 과점 체제(Oligopoly)를 완성했습니다.",
    "이들 국가는 물량 덤핑뿐만 아니라 '단가 프라이싱 권한'까지 보유하고 있습니다. 단일 국가 소싱 의존도를 낮춰 헤징(Hedging)하지 않으면 벤더로서 목이 묶이게 됩니다.": "[Pricing Power Hedging] 메이저 3국은 물량 공세(Dumping)를 넘어 글로벌 마켓 프라이싱 권한(Pricing Power)마저 독점하고 있습니다. 특정 국가에 대한 소싱 의존도를 30% 이하로 통제(Diversification)하여 공급망 병목 리스크(Bottleneck)를 완벽히 헤징(Hedging)해야 합니다.",
    "자연 생태계 파괴 여파로 지난 20년간 어획량은 3.5M 톤 언저리에서 완벽히 박스관에 갇혀 있습니다.": "[Capture Yield Stagnation] 극심한 해양 생태계 파괴 여파로 지난 20년간 글로벌 자연산 어획량은 3.5M 톤(Tonnes)의 완벽한 횡보 박스권(Stagnation Box)에 갇혀 한계치(Ceiling)에 도달했습니다.",
    "자연산 새우의 희소성은 지속 상승할 것입니다. MSC(지속가능성) 라벨을 부착할 수 있는 합법적 조업 쿼터를 선제 매입하여 초고가 럭셔리 라인을 구축하십시오.": "[ESG Premium Exploitation] 자연산 새우의 희소 가치(Scarcity Value)는 영구적으로 치솟을 것입니다. MSC(해양관리협의회) 지속가능성 라벨링이 가능한 합법적 조업 쿼터(Quota)를 프리미엄 가격에 선제 싹쓸이(Buyout)하여 럭셔리 VVIP 라인업을 즉각 런칭하십시오.",
    "현재 HHI 지수는 약 ${Math.round(hhi)} 포인트로, 상위 3개국이 전체 생산 라인의 멱법칙을 주도하고 있는 중독점(Oligopoly) 체제입니다.": "[HHI Supply Concentration] 현재 글로벌 HHI(허핀달-허쉬만 지수)는 약 ${Math.round(hhi)} 포인트 수준으로, 메이저 상위 3개국이 전체 서플라이 체인의 멱법칙(Power Law)을 완벽히 주도하는 강력한 중독점(Oligopoly) 체제를 시사합니다.",
    "공급망 다변화를 위해 멕시코나 베트남 등 '고성장 신흥 기지' 벤더를 억지로라도 일정 비율(15%) 발탁하여 공급 협상의 지렛대(Leverage)로 삼아야 합니다.": "[Supply Chain Diversification Leverage] 공급망 다변화 헷징(Hedging)을 위해 멕시코, 베트남 등 '고성장 신흥 기지'의 Tier-2 벤더 물량을 의무적으로 15% 이상 할당(Allocation)하여, 메이저 3국과의 단가 협상 시 강력한 지렛대(Negotiation Leverage)로 활용하십시오."
}

def replace_in_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    updated = False
    for k, v in replacements.items():
        if k in content:
            content = content.replace(k, v)
            updated = True
        else:
            k_escaped = k.replace("${Math.round(hhi)}", ".*?").replace("(", "\\(").replace(")", "\\)")
            match = re.search(k_escaped, content)
            if match:
                pass # Already handled by literal replace except for dynamic string
    
    # Handle the template literal specially
    template_k = "현재 HHI 지수는 약 ${Math.round(hhi)} 포인트로, 상위 3개국이 전체 생산 라인의 멱법칙을 주도하고 있는 중독점(Oligopoly) 체제입니다."
    template_v = "[HHI Supply Concentration] 현재 글로벌 HHI(허핀달-허쉬만 지수)는 ${Math.round(hhi)} 포인트 수준으로, 메이저 상위 3개국이 전체 서플라이 체인의 멱법칙(Power Law)을 완벽히 주도하는 강력한 중독점(Oligopoly) 체제를 시사합니다."
    if "현재 HHI 지수는 약" in content:
        content = content.replace(template_k, template_v)
        updated = True

    if updated:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")

replace_in_file("components/ShrimpWidgetsTab1.tsx")
