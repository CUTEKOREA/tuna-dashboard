import os
import re

replacements = {
    # Tab2
    "양식 기술의 발달과 콜드체인의 결합으로 글로벌 수출 물동량이 폭발적으로 우상향 중입니다.": "[Global Logistics Expansion] 스마트 양식 기술의 대량생산과 글로벌 콜드체인(Cold Chain) 물류망의 결합으로 거시적 관점의 수출 물동량(Trade Volume) 곡선이 구조적 메가 트렌드(Mega-trend)에 진입했습니다.",
    "원물 자체가 수출용 글로벌 상품화(Commoditization) 단계를 마쳤습니다. 현지 가공보다는 무역 환차익(Arbitrage) 거래에 먼저 뛰어들 자본력을 마련하십시오.": "[Commoditization Arbitrage] 새우 원물 자체의 완벽한 글로벌 상품화(Commoditization)가 종료되었습니다. 복잡한 현지 생산 라인보다는 글로벌 환율 및 판가 스프레드를 타겟팅하는 환차익 무역(Arbitrage Trading) 데스크에 자본금(Capital)을 우선 배치하십시오.",
    "가공 기술의 발전(탈각, 꼬리 남김 등)으로 단순 물량보다 달러 가치의 상승 각도가 훨씬 큽니다.": "[Value-Add Margin Explosion] 단순 수율 향상을 초월하는 초정밀 탈각/포장 밸류에드(Value-Add) 공정의 고도화로, 물리적 톤수(Volume) 대비 절대적 달러 가치(Value)의 상승 계수(Multiplier)가 압도적으로 치솟고 있습니다.",
    "동일한 1톤을 수입하더라도 B2B 포대를 떼와서 B2C 팩으로 쪼개는 작업장(Processing Line)을 국내 허브에 셋업하여 수 백만 달러의 밸류 에드를 이뤄야 합니다.": "[Processing Hub Internalization] 단순 포대(Bulk) 수입 브로커리지 모델은 폐기해야 합니다. 수입 1차 원물을 국내 허브 클린룸에서 B2C 프리미엄 팩으로 소분(Re-packaging)하여 스프레드 마진을 100% 흡수하는 자체 밸류에드 라인(Value-Add Line)을 구축하십시오.",
    "Covid-19 및 물류 대란 등에도 불구하고 새우의 기초 소비 물동량은 전혀 타격을 받지 않는 필수재 성격입니다.": "[Inelastic Demand Resilience] 팬데믹(COVID-19) 및 지정학적 물류 대란(Disruption)이라는 매크로 쇼크에도 기초 소비 물동량의 훼손이 전혀 발생하지 않는 극단적인 필수재(Inelastic Good) 방어력을 입증했습니다.",
    "수입/수출 물동량의 불일치가 발생하는 구간을 역추적하여, 냉동 창고 적재 기간을 조절하는 투기적 보관(Speculative Inventory) 전략을 수행하십시오.": "[Speculative Inventory Operation] 수급 펀더멘털의 미스매치(Mismatch)가 발생하는 마이크로 윈도우를 포착하십시오. 물동량의 병목(Bottleneck) 구간에서 냉동 보관 주차를 극단적으로 조절하는 전술적 롱 포지션(Speculative Long Position) 투기 전략을 승인합니다.",
    "인플레이션 방어력이 극히 뛰어난 해산물이며, 대금 규모 자체가 매해 레벨업을 진행 중입니다.": "[Inflation Hedge Premium] 초인플레이션 국면에서 판가를 100% 전가(Pass-through)할 수 있는 최강의 헤지(Hedge) 자산으로, 전년 동기 대비 USD 거래 스케일의 레벨업(Level-up) 랠리가 지속 중입니다.",
    "자금팀은 무역 규모 팽창에 비례하는 무역 금융(Trade Finance) 한도와 L/C 라인을 선제적으로 최소 30% 증액해 두어야 실기를 면할 수 있습니다.": "[Trade Finance Preemption] 전사 재무 데스크(Treasury)에 즉시 지시하십시오. 폭증하는 수입 대금 스케일을 감당하기 위해 글로벌 은행의 무역 금융(Trade Finance) 한도 및 L/C 라인을 현재 대비 최소 30% 이상 선제적 오버부킹(Overbooking) 해야 캐시 플로우 마비를 막습니다.",
    "에콰도르와 인도가 글로벌 물량 밀어내기 수출의 절반을 점유하는 양강 체제입니다.": "[Duopoly Export Hegemony] 에콰도르(LATAM)와 인도(Asia) 양대 국가가 글로벌 덤핑 출하 물량의 50%를 장악하며 글로벌 공급을 쌍끌이하는 완벽한 양강 체제(Duopoly)를 구축했습니다.",
    "신규 수입 라인을 구축하려면, 베트남이나 인도네시아 보다 에콰도르의 주요 항구(Guayaquil) 수출 거이(Supplier)와 독점 장기 계약을 우선 협상하십시오.": "[Targeted Long-Term Contracting] 신규 벤더 확충 시 동남아권 브로커리지를 패스하십시오. 물량의 정점인 에콰도르 과야킬(Guayaquil) 메이저 수출 팩토리(Supplier) 대표단과의 다이렉트 롱텀(Long-term) 독점 소싱 계약에 협상 자원을 전면 투입해야 합니다.",
    "미국, 중국, EU가 글로벌 물동량의 대부분을 진공청소기처럼 흡수합니다.": "[Tri-Polar Demand Vacuum] 미국, 중국, 유럽연합(EU) 3대 메가 컨슈머 마켓이 전 세계 새우 물동량을 진공청소기처럼 빨아들이는 극단적인 수요 쏠림(Demand Tri-Polarization) 상태입니다.",
    "미/중 무역 분쟁 또는 중국의 내부 락다운(Lockdown) 시 발생하는 '공매도 물량'을 가로채어 한국 시장에 덤핑 릴레이를 치는 작전을 세팅하십시오.": "[Macro Disruption Arbitrage] 미중 무역 전쟁 텐션 및 중국의 내부 소비 셧다운 시 글로벌 시장에 강제 출하되는 '고아 물량(Orphaned Cargo)'을 실시간 모니터링 하십시오. 이를 초저가 덤핑으로 가로채어 한국 로컬 마켓에 쏟아붓는 극강의 아비트라지(Arbitrage) 채널을 세팅해야 합니다.",
    "물동량 순위와 달리, 달러 환산 시 고부가가치 꼬리절단/자숙 새우 포장 능력을 가진 국가 라인업 순위가 요동칩니다.": "[Value-Add Disruption Matrix] 순수 톤수(Volume) 랭킹을 완전히 무시하는, 초고정밀 탈각/자숙 밸류에드(Value-Add) 마진 장착 국가들의 경이적인 달러 매출 점유율 전복(Disruption) 현상이 목격됩니다.",
    "원물 강자인 에콰도르보다 가공 역량이 우수한 국가산(태국, 베트남) 브랜드 상품을 들여오는 것이 국내 로컬 마진 방어 기조에 한층 유리합니다.": "[Margin Defense via Value-Add Sourcing] 원물 단가 싸움에서 패배를 인정하십시오. 무식한 캐파를 앞세운 에콰도르 대신, 가공 기술의 정점에 선 베트남/태국 팩토리의 완제품(Finished Goods) 브랜드를 B2B로 다이렉트 꽂아 넣는 것이 로컬 마진(OPM) 수성에 절대적으로 유리합니다.",

    # Tab3
    "대한민국은 새우 소비 대국으로, 2000년대 이후 수입 물동량이 가파르게 J커브를 그리며 폭등하고 있습니다.": "[Korea Import J-Curve] 대한민국 새우 컨슈머 마켓은 2000년대 이후 구조적 폭발기를 맞이하여, 국가 총수입 물동량이 전례 없는 J커브(J-Curve) 상승 궤도를 그리는 메가 호황장입니다.",
    "자체 바잉 파워(Buying Power)를 활용해 소매 점유율을 늘리고 패밀리레스토랑 B2B 도매 라인을 틀어쥐는 볼륨 게임(Volume Game)을 전개하십시오.": "[Volume Game Aggression] 당사 본연의 자본력 기반 바잉 파워(Buying Power)를 극한으로 끌어올리십시오. 프랜차이즈 및 대형 패밀리 레스토랑 B2B 공급 라인을 공격적으로 탈취(Takeover)하여 절대적 소매 점유율 중심의 볼륨 게임(Volume Game)으로 경쟁사를 압살해야 합니다.",
    "현재 대한민국 새우 산업의 자급률은 ${koreaSelfSufficiency}%에 불과하며, 철저하게 수입상과 무역상들에게 끌려다니는 천수답(天水畓) 시장입니다.": "[Domestic Autonomy Deficit] 대한민국의 현재 로컬 새우 자급률은 ${koreaSelfSufficiency}%라는 절망적 수준으로, 사실상 글로벌 트레이더와 환율 변동성에 영혼이 묶여 있는 리스크 극대화(Maximum Exposure) 상태입니다.",
    "스마트 육상 양식(바이오플락) 등 R&D에 투자하여 무균 새우 자급률을 국지적으로 확보, 프리미엄 오프라인 매장용 라인업을 자립화해야 합니다.": "[Strategic Self-Sufficiency CAPEX] 수입 덤핑에 의존하는 리스크를 타개해야 합니다. 즉각 스마트 바이오플락(Bio-floc) 육상 양식장 R&D에 벤처 투자를 단행하여, 국내 무균 프리미엄(SPF) 오프라인 라인업의 부분적 수직 자립화(Vertical Independence)를 이루십시오.",
    "본 대시보드의 연산 결과, 한국은 주요 아시아 경쟁국 대비 톤당 소싱 매입 단가가 약 7% 비싸게 책정되어 바잉파워에서 밀립니다.": "[Buying Power Squeeze] 퀀트 엔진 분석 결과, 대한민국은 글로벌 벤더 협상력에서 완벽히 패배하며 경쟁국 대비 톤당 7% 이상의 악성 프리미엄(Korea Discount/Penalty) 페널티를 강제로 지불하고 있습니다.",
    "거대 종합 상사 한두 곳에 의존하는 구조를 박살내고, 구매팀이 직접 베트남 까마우(Ca Mau) 팩토리와 다이렉트 직계약을 체결해 원가를 방어하십시오.": "[Direct Sourcing Disintermediation] 구시대적 종합상사 의존 구조(Middleman)를 완전히 해체하십시오. 전사 구매 파트를 베트남 까마우(Ca Mau) 등 팩토리 현장에 상주시켜 다이렉트 프라이싱 라인(Direct Pricing Line)을 구축해 유통 마진 누수를 원천 봉쇄해야 합니다.",
    "전통적 새우 극강소비국이던 일본의 물량을 한국이 무서운 속도로 잠식(Cannibalizing)해가고 있습니다.": "[Asian Hegemony Cannibalization] 극강의 하이엔드 소비 마켓이었던 일본의 파이를 한국 시장이 경이로운 속도로 잠식(Cannibalizing)하며 동북아시아 새우 컨슈머 헤게모니가 교체 중입니다.",
    "일본향 고품질 규격(Panko, 초밥용 나비새우)을 취급하는 동남아 공장의 물량을 빼앗아, 국내 프리미엄 일식 프랜차이즈에 역마진 공격 투하를 감행하십시오.": "[Predatory Sourcing Attack] 철저하게 일본 수출 라인만 태우던 베트남 최상위 팩토리의 고품질 물량(Panko, 초밥용 나비새우)에 프리미엄 웃돈을 얹어 탈취하십시오. 이를 국내 하이엔드 오마카세 프랜차이즈에 덤핑 투하(Dumping Strike)하여 신규 시장 지배력을 장악해야 합니다.",
    "2010년 이전 평이하던 수입선이 1) 베트남 FTA 체결 2) 먹방 유튜버 대유행 3) HMR 밀키트 폭발에 맞춰 3차례 부스트 엔진을 점화했습니다.": "[Triple Macro Inflection] 2010년 이전의 횡보장은 완전히 종료되었습니다. 1) FTA 무관세 발효 2) 디지털 미디어 먹방 신드롬 3) HMR/밀키트 혁명이라는 3대 매크로 부스터(Macro Boosters)가 연쇄 점화되며 시장 펀더멘털이 리빌딩되었습니다.",
    "가장 강력한 트리거인 HMR/밀키트 트렌드에 대응하기 위해 단순 냉동블록이 아닌 개별급속냉동(IQF) 원물 수입 포트폴리오를 80% 달성하십시오.": "[IQF Sourcing Pivot] 블록 냉동 중심의 낡은 조달 시스템을 즉각 폐기하십시오. 메가트렌드인 HMR 확장에 대응하기 위해, 수입 물량의 80% 이상을 즉시 투입 가능한 하이엔드 개별급속냉동(IQF) 포트폴리오로 전면 피벗(Pivot)해야 합니다.",
    "식당(외식)으로 들어가던 브라더/블랙타이거 비중을, 이마트 트레이더스와 곰곰(Coupang) 밀키트 등 HMR 시장이 피투성이로 흡수해버렸습니다.": "[Consumption Channel Disruption] B2B 외식업 중심이던 블랙타이거 계열의 레거시 물량을 이마트 트레이더스 및 이커머스(Coupang) 밀키트 등 B2C HMR 생태계가 블랙홀처럼 빨아들이며 채널 간 피의 대학살이 벌어졌습니다.",
    "오프라인 재래시장 및 도매상 공급을 즉각 중단하고, 쿠팡/마켓컬리 입점을 위한 소분 패키징 라인을 자체 공장에 풀-셋업 해야 살아남습니다.": "[B2B Wholesale Exit & B2C DTC] 부실한 오프라인 재래시장 및 영세 도매상(Wholesale) 벤더 공급망을 가차 없이 셧다운(Shutdown) 하십시오. 컬리, 쿠팡 향(向) 초정밀 소분 패키징 라인을 자체 팩토리에 풀-셋업하여 다이렉트 투 컨슈머(DTC) 볼륨을 압도해야 합니다.",
    "국내 새우 1위 자리를 베트남이 철옹성처럼 지키고 있는 단 하나의 이유는 관세율 0% 쿠폰(VKFTA)의 절대적 권력 때문입니다.": "[Tariff Shield Monopoly] 대한민국 새우 수입 생태계 1위 헤게모니를 베트남이 철옹성처럼 방어하는 유일무이한 핵심 무기(Moat)는 VKFTA 발효에 따른 '관세 0% 프리미엄'의 극단적 비대칭성(Asymmetry) 덕분입니다.",
    "만약 에콰도르와 SECA(자유무역협정)가 최종 타결된다면? 관세 20% 족쇄가 풀리는 순간 베트남 물량은 대학살을 겪습니다. 남미산 선매입 예약(Option)을 걸어두십시오.": "[SECA Option Contingency Plan] 에콰도르와의 SECA 협상이 최종 타결될 경우 20% 관세 족쇄가 풀리며 베트남 카르텔은 붕괴(Bloodbath)됩니다. 관세 철폐 즉시 실행 가능한 남미산 대량 선물 매입 콜옵션(Call Option)을 즉각 세팅하여 사태 반전에 선제 대응하십시오.",
    "한국 수입상들의 '경쟁적 중복 소싱(치킨게임)'으로 현지 패커(Packer)들에게 단가 주도권을 뺏겨 약 4% 프리미엄을 웃돈으로 상납 중입니다.": "[Pricing Power Surrender] 국내 중소 브로커리지들의 자기 파괴적인 소싱 치킨게임(Chicken Game)으로 인해, 현지 팩토리(Packer)들에게 프라이싱 통제권을 완전히 헌납하며 연간 4%의 바보 비용(Korea Premium)을 지불 중입니다.",
    "동종업계 중소 브로커리지를 아예 시장에서 몰아내야 합니다. 신라교역 이름으로 메가톤급 블록 딜(Block Deal)을 쳐서 현지 팩토리 라인을 독점 가동시켜 단가를 폭락시키십시오.": "[Market Squeeze & Block Deal] 무의미한 중소 수입업자 카르텔을 시장에서 강제 퇴출(Squeeze-out)시키십시오. 사내 막대한 잉여 자금을 투입, 신라교역 명의로 베트남/인니 팩토리에 메가톤급 블록 딜(Block Deal)을 타결하여 현지 CAPA를 100% 독점, 매입 단가(COGS)를 인위적으로 박살내야 합니다.",
    "수입 92, 수출 5. 그야말로 블랙홀처럼 외화를 유출시키는 극단적인 수지 타격 품목 1순위로 지정되었습니다.": "[Trade Deficit Anomaly] 수입 92 대 수출 5 라는, 국가 거시 경제 지표를 왜곡시킬 수준의 비정상적 무역수지 적자(Trade Deficit Anomaly)를 창출하는 치명적 자본 유출 핵심 품목입니다.",
    "수입 원물을 국내에서 고급 안주/간편식으로 '밸류 에드(Value Add)' 한 뒤, 한류 프리미엄 포장재를 입혀 역으로 미국 한인 마켓에 K-로컬푸드로 재수출하십시오.": "[K-Food Reverse Export Arbitrage] 수입한 원물에 밸류를 입혀 다시 수출하는 리버스 엔지니어링(Reverse Engineering)을 가동하십시오. 국내 클린룸에서 K-안주/하이엔드 간편식으로 밸류업(Value-up)한 뒤, 압도적인 K-팝 뷰티 패키징을 입혀 미주 H-Mart 등 교민 마켓에 수 배의 마진으로 역수출하는 라인을 뚫어야 합니다.",
    "국내 실물 경기가 침체(GDP 정체)하든 말든, 새우 수입 지수는 거시 경제를 농락하는 속도로 우상향(Decoupling) 중입니다.": "[Macro Decoupling Phenomenon] 대한민국의 로컬 GDP 펀더멘털 침체(Recession) 여부와 완벽히 탈동조화(Decoupling)되어, 새우 소비 및 수입 팽창 지수만이 나홀로 우주로 솟구치는 괴랄한 메가트렌드 시그널이 감지됩니다.",
    "아무리 경기가 어려워도 치킨과 감바스, 마라탕 속 새우는 소비자들의 '소확행 마지노선'입니다. 경기 침체 방어주(Defensive Stock)로서 사내 메인 투자 풀을 배정하십시오.": "[Recession-Proof Asset Allocation] 새우는 단순한 식자재를 넘어 2030 세대의 마지막 '소비 심리 방어선(Psychological Moat)'입니다. 극단적 불황에도 소비가 무너지지 않는 완벽한 경기방어재(Defensive Asset) 성격이 입증되었으므로, 그룹 차원의 메인 유동성을 새우 밸류체인 장악에 전액 몰빵 배정하십시오."
}

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    updated = False
    for k, v in replacements.items():
        if k in content:
            content = content.replace(k, v)
            updated = True
        else:
            k_escaped = k.replace("${koreaSelfSufficiency}", ".*?").replace("(", "\\(").replace(")", "\\)")
            match = re.search(k_escaped, content)
            if match:
                pass

    template_k = "현재 대한민국 새우 산업의 자급률은 ${koreaSelfSufficiency}%에 불과하며, 철저하게 수입상과 무역상들에게 끌려다니는 천수답(天水畓) 시장입니다."
    template_v = "[Domestic Autonomy Deficit] 대한민국의 현재 로컬 새우 자급률은 ${koreaSelfSufficiency}%라는 절망적 수준으로, 사실상 글로벌 트레이더와 환율 변동성에 영혼이 묶여 있는 리스크 극대화(Maximum Exposure) 상태입니다."
    if "현재 대한민국 새우 산업의 자급률은" in content:
        content = content.replace(template_k, template_v)
        updated = True

    if updated:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")

replace_in_file("components/ShrimpWidgetsTab2.tsx")
replace_in_file("components/ShrimpWidgetsTab3.tsx")
