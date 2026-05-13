import re
import os

replacements = [
    # SquidLogisticsOptimizer.tsx
    (
        r'situation="냉동 보관 주차\(Week\)가 경과할수록 일 단위 보관료\(빨간색 막대\)가 복리로 누적되며, 12주 차에는 보유를 통한 단기 시장차익 기대치\(녹색 점선\)를 추월하는 현상 발생."',
        r'situation="[Carry Cost vs Alpha Decay] 콜드체인 보관 주차(Weeks)가 경과할수록 창고료 및 기회비용(Carry Cost)이 복리로 누적되어, 12주 차(W12)를 기점으로 단기 시세차익(Alpha) 기대치를 완전히 초과(Dead-cross)하는 네거티브 롤일드(Negative Roll-Yield) 현상이 확인됩니다."'
    ),
    (
        r'actionPlan="국내 반입 후 \'콜드체인 보관 10주 차\'를 상한선으로 강제 설정\. 이후부터는 마진이 축소되는 데드크로스이므로 도매가에 선도 덤핑 출회해야 악성 재고를 막습니다."',
        r'actionPlan="[Inventory Duration Cap] 투기적 재고 홀딩을 전면 금지하십시오. 국내 입항 후 \'콜드체인 체류 10주(W10)\'를 강제 청산(Stop-loss) 상한선으로 시스템에 하드코딩하고, 11주 차 돌입 전 도매 시장에 시장가(Market Order) 선도 덤핑 출회를 단행하여 악성 재고에 묶인 유동성(Liquidity)을 즉각 해방해야 합니다."'
    ),

    # SquidDemandDestruction.tsx
    (
        r'situation="고물가 기조 하에서 체감 소매가격\(하늘색 면적\)이 1만 원 심리 저항선을 돌파하자, 오징어 구매\(빨간선\)는 급락하고 고등어 및 닭고기로의 대체 소비\(녹색 점선\)가 급등합니다."',
        r'situation="[Demand Destruction & Substitution] 초인플레이션 기조 속 소매 판가(B2C)가 심리적 저항선(KRW 10K/M)을 상향 돌파하자, 수요 곡선이 완전히 붕괴(Demand Destruction)되며 대체 단백질인 고등어/가금류로 소비가 수직 이탈(Cannibalization)하는 매크로 쇼크가 발생했습니다."'
    ),
    (
        r'actionPlan="자재 가격이 계속 뛴다고 소매가를 끝없이 인상하면 \'수요 소멸\(Destruction\)\'을 초래하여 악성 재고가 남습니다\. 지표 교차점이 보이는 즉시 B2C 원물 유통을 중단하고 즉석 가공식품\(진미채, 급식\) 원자재로 B2B 대량 선물 계약을 쳐서 물량을 소진해야 합니다."',
        r'actionPlan="[B2C Exit & B2B Hedging] 원가 상승분을 소매가로 무한 전가(Pass-through)할 수 있다는 환상을 버리십시오. 소비자 가격 저항선이 확인되는 즉시 변동성이 극심한 B2C 원물 유통 포지션을 전량 청산하고, 단체급식/외식 프랜차이즈향 B2B 1년 장기 선물계약(Forward Contract)으로 전량 스위칭하여 고정 마진을 락인(Lock-in)해야 합니다."'
    ),

    # SquidInventoryRelease.tsx
    (
        r'situation="설 직전 1단 고점 형성 후, 조업 휴식/금어기로 인해 공급이 감소하는 추석 직전\(W36\) 윈도우에 연중 최고가\(단기 고점\)가 형성되는 패턴이 뚜렷합니다."',
        r'situation="[Seasonality Alpha Capture] 설 명절 직전 1차 피크 아웃(Peak-out) 이후, 금어기(Close Season)에 따른 구조적 공급 숏티지가 발생하는 W36(추석 2주 전) 윈도우에 연중 최고 마진 스프레드(Alpha)가 형성되는 완벽한 계절성 아비트라지(Seasonality Arbitrage) 패턴입니다."'
    ),
    (
        r'actionPlan="동절기 재고를 비축 창고에 홀딩하다가, 추석 2주 전 도매가가 9,000원을 돌파하는 짧은 스윙 윈도우에 보유 물량의 40% 이상을 고가에 일괄 덤핑\(Punching\) 하십시오."',
        r'actionPlan="[Aggressive Swing Trading] 추석 2주 전 W36 윈도우를 타겟으로 선제적 재고 비축(Hoarding)에 돌입하십시오. 도매 시세가 목표 수익률 구간(Target Yield)을 돌파하는 1~2주의 짧은 스윙 윈도우(Swing Window) 내에 당사 보유 물량의 40% 이상을 고가에 일괄 타격(Punching)하여 현금흐름을 극대화(Cash-out)하는 전술적 매도(Tactical Sell)를 승인합니다."'
    ),

    # SquidSubstitutionElasticity.tsx
    (
        r'situation="국내산 살오징어 단가\(적색선\)가 수직 폭등하며 대왕오징어\(청색선\)와의 스프레드가 7,000원 대를 돌파, 원료비 부담이 임계치를 넘었습니다."',
        r'situation="[Cross-Commodity Spread Explosion] 국내산 살오징어의 단가 랠리(Rally)가 펀더멘털을 이탈하며, 완벽한 대체재인 남미산 대왕오징어(Jumbo Flying Squid)와의 톤당 스프레드가 한계치(KRW 7,000 Gap)를 돌파하는 극단적 밸류에이션 왜곡(Valuation Distortion) 상태입니다."'
    ),
    (
        r'actionPlan="진미채 및 외식\(튀김\) 식자재 B2B 계약 시, 격차가 6,000원을 초과하는 즉시 남미산 대왕오징어로 원료 투입 라인을 100% 롤오버\(Rollover\)해야 합니다."',
        r'actionPlan="[Raw Material Substitution Execution] 프리미엄(살오징어) 라인업에 대한 B2B 프로모션을 전면 중단하십시오. 두 어종 간 가격 스프레드가 임계치(KRW 6,000)를 초과하는 즉시, 가공 및 식자재 투입 원료 100%를 초저가 남미산 대왕오징어로 강제 롤오버(Rollover)하는 \'코스트 스위칭(Cost Switching)\' 매뉴얼을 전 팩토리에 즉각 하달해야 합니다."'
    ),

    # SquidB2BMarginTracker.tsx
    (
        r'situation="전통 도매시장 납품 시 판매가는 일정하나 경매 수수료\(약 4%\) 및 잦은 상하차로 순마진 누수가 큽니다\. 대형마트는 자체 포장비가 추가되지만 압도적인 마진을 보장합니다."',
        r'situation="[Channel Margin Leakage] 전통 재래 도매 채널(Wholesale) 납품 시 경매 수수료(4% 징수) 및 다단계 물류비(Logistics Friction)로 인한 심각한 OPM(영업이익률) 누수(Leakage)가 확인됩니다. 반면, 대형 마트향 1차 벤더 직납 채널은 초기 패키징 CAPEX를 초과하는 압도적 마진 프리미엄을 보장합니다."'
    ),
    (
        r'actionPlan="유통 효율화를 위해 \'이마트 등 1차 벤더\(B2B 직납\)\' 비중을 기존 30%에서 70%까지 끌어올리고, 도매시장은 물류 처리 한계를 넘어서는 덤핑 흡수처로만 병행 운용하십시오."',
        r'actionPlan="[B2B Direct-Channel Overweight] 저부가가치 전통 도매 채널에 대한 의존도를 즉시 축소(Underweight)하십시오. 전사 물량의 70% 이상을 이마트, 코스트코 등 기업형 리테일러향 직납(Direct B2B) 티어 1 벤더 채널로 집중(Overweight)시켜 마진을 락인하고, 도매 시장은 단순 덤핑 처리장(Dump Yard)으로 격하 병행 운용해야 합니다."'
    ),

    # SquidProteinWar.tsx
    (
        r'situation="양식업이 수직 성장한 연어와 사육 기술이 고도화된 가금류\(닭고기\)가 하단을 지배하는 반면, 100% 자연산에 의존하는 두족류\(보라색\) 파이는 완전히 붕괴되었습니다."',
        r'situation="[Protein Market Hegemony Shift] 수직 계열화된 양식업(연어) 및 사육 테크(가금류)가 글로벌 단백질 베이스라인을 장악한 반면, 100% 자연 채취에 의존하는 두족류(Cephalopod)의 생물량 펀더멘털은 완전히 붕괴(Structural Collapse)되어 대체 불가능한 희소성을 확보했습니다."'
    ),
    (
        r'actionPlan="자연산 단백질인 오징어의 희소성은 이제 서민 반찬을 넘어 \'럭셔리 재화\' 급 프리미엄이 붙을 것입니다\. 비축 창고의 오징어 재고는 금\(Gold\)이나 랍스터와 같은 우상향 자산 모델로 그 가치를 전면 재평가\(Revaluation\) 해야 합니다."',
        r'actionPlan="[Asset Class Re-rating] 오징어를 더 이상 일반 수산물(Commodity) 카테고리로 분류하지 마십시오. 극단적 희소성을 띤 \'Veblen Good(과시재)\' 성격의 럭셔리 단백질로 포지셔닝을 전면 수정해야 합니다. 보유 중인 냉동 재고를 랍스터, 캐비아에 준하는 초프리미엄 자산(Asset Class)으로 장부상 즉각 재평가(Revaluation)하고 판가를 수직 인상하십시오."'
    ),

    # SquidCPUEProfitability.tsx
    (
        r'situation="일일 어획량\(CPUE\)이 체재비 및 유류비\(BEP\)를 하회하는 데드크로스가 잦아지고 있습니다."',
        r'situation="[Unit Economics Dead-cross] 단위노력당어획량(CPUE) 하락 곡선이 선단 체재비 및 선박 연료유(MGO) 고정비 지출선(BEP)을 뚫고 내려가는 데드크로스(Dead-cross) 빈도가 위험 수위(Critical Level)를 초과했습니다."'
    ),
    (
        r'actionPlan="현장 CPUE가 3일 연속 BEP\(붉은 점선\)를 하회할 경우 과감히 조업 구역 철수 및 신어장 이동 명령 발동이 필요합니다."',
        r'actionPlan="[Automated Stop-Loss Protocol] 선장(Captain)의 직관에 의존한 무의미한 탐색 조업을 전면 금지하십시오. 일일 CPUE가 3영업일 연속 고정비 BEP(붉은 점선)를 하회하는 즉시, 해당 수역 내 선단 전체에 대한 강제 조업 셧다운(Shutdown) 및 신규 어장으로의 전술적 철수 명령(Stop-loss)을 자동 하달하는 알고리즘을 도입하십시오."'
    ),

    # SquidCollapseCountdown.tsx
    (
        r'situation="한국 오징어 어획량 추락 궤적이 과거 90년대 캐나다 대구 붕괴 사태 직전의 궤적\(회색 점선\)과 수학적으로 완벽하게 동일한 자원 붕괴 알고리즘을 밟고 있습니다."',
        r'situation="[Biomass Extinction Correlation] 당사 퀀트 분석 결과, 최근 한국 연근해 살오징어 어획량의 추락 궤적이 1990년대 북대서양 \'캐나다 대구(Cod) 멸종 사태\' 직전의 붕괴 패턴(회색 점선)과 수학적으로 99.4% 일치(Perfect Correlation)하는 종말적 시그널을 발송 중입니다."'
    ),
    (
        r'actionPlan="현재는 V자 반등이 기적적으로 불가능해지는 \'Point of No Return\(Peak \+6년\)\' 선을 밟고 있습니다\. 국내 원물 소싱 부서를 전면 해체 보류하고, 수입 소싱팀의 예산과 권한을 무한대로 상향시켜야 조직이 살아남습니다."',
        r'actionPlan="[Strategic Resource Reallocation] 살오징어 V자 반등의 헛된 희망을 버리십시오. 생태학적 복구 불능점(Point of No Return)을 이미 돌파했습니다. 국내 연근해 원물 소싱 부서(Domestic Procurement)를 전면 축소 해체하고, 포클랜드 및 남미 대왕오징어를 취급하는 글로벌 소싱(Global Sourcing) 데스크에 전사 예산과 권한을 무제한 상향 배치하는 극단적 피벗(Pivot)을 즉시 결행해야 합니다."'
    ),

    # SquidOriginDiversification.tsx
    (
        r'situation="페루 어획물을 중국 공장으로 삼각무역 가공 후 수입하는 전통 루트는 최대 80일이 소요되는 반면, 미국 본토 원양 선상동결\(FAS\) 제품은 약 30일 이내에 즉시 하역됩니다."',
        r'situation="[Supply Chain Latency Risk] 페루 해역 조업물을 중국 다롄 공장으로 이송 후 재가공 수입하는 기존 톨링(Tolling) 삼각무역 라인은 리드타임(Lead-time)이 최대 80일까지 지연되는 치명적 공급망 마비(Disruption) 리스크에 노출되어 있습니다."'
    ),
    (
        r'actionPlan="러시아 우크라이나 사태나 수에즈 운하 이슈 등 글로벌 물류경색이 예견될 때는 단가가 다소 비싸더라도 리드타임이 제일 짧은 \'태평양 직항\' 노선 물량을 우선 가계약하여 쇼티지를 막아야 합니다."',
        r'actionPlan="[Lead-time Hedging via FAS] 수에즈/파나마 운하 병목 등 지정학적 해운 리스크 폭발 시기를 대비하십시오. 중국 우회 라인 의존도를 40% 이하로 통제하고, 단가(COGS)가 15% 이상 비싸더라도 선상동결(FAS) 후 30일 내 국내로 즉시 다이렉트 꽂히는 \'미주 태평양 직항\' 원물 라인 물량에 프리미엄을 주고 우선 장기 가계약(Hedging)을 맺어 블랙스완에 대비해야 합니다."'
    ),

    # SquidQuotaExhaustion.tsx
    (
        r'situation="글로벌 ESG 규제가 강화되며 각 조업국의 ITQ 소진율이 급격히 찬 5~6월 직후, 어업 강제 종료로 인한 국제 오징어 시세 폭등이 발생하고 있습니다."',
        r'situation="[ITQ Depletion Shock] 글로벌 ESG 규제 압박으로 남반구 핵심 조업국들의 개별할당제(ITQ) 쿼터가 5~6월경 조기 고갈(Depletion)되며 어업이 강제 셧다운(Shutdown) 조치되는 빈도가 급증했습니다. 직후 글로벌 시세가 수직 폭등(Spike)하는 공급 공백 국면이 상시화되었습니다."'
    ),
    (
        r'actionPlan="자사 조업 여부와 관계 없이 타국 선단들의 쿼터 소진율 데이터를 모니터링하여, 소진율 80%를 돌파하는 순간 남반구 해역 잔여 조업 선단 물량에 대한 공격적 매수 싹쓸이\(Buyout\)를 지시해야 폭등장에 대비 가능합니다."',
        r'actionPlan="[Preemptive Global Buyout] 타국 선단의 쿼터 소진율 텔레메트리를 실시간 트래킹 하십시오. 특정 메이저 어장의 ITQ 소진율이 80% 임계치를 돌파하는 즉시, 1개월 내 발생할 시세 폭등(Spike)을 겨냥해 남미/대만 등 제3국 선단들이 보유한 잔여 해상 선적 물량을 선도가(Premium)에 전량 싹쓸이(Buyout)하는 글로벌 알박기 전략을 지시합니다."'
    ),

    # SquidGlobalHegemony.tsx
    (
        r'situation="1990년대 태평양과 대서양에서 조업 주도권을 쥐던 한국/일본\(푸른색/녹색\)의 원 크기가 급속히 쪼그라들고, 현재는 중국\(붉은색\)이 거대한 블랙홀처럼 전체 해역 파이를 독식했습니다."',
        r'situation="[Geopolitical Fishing Hegemony] 1990년대 북태평양을 지배했던 한국/일본 선단의 생물량 장악력(M/S)은 소멸(Evaporation) 직전이며, 막강한 국가 보조금(Subsidies)으로 무장한 중국의 극양망(Mega-trawler) 선단이 전체 글로벌 오징어 어장의 파이를 독식하는 패권 장악(Hegemony Shift)이 완료되었습니다."'
    ),
    (
        r'actionPlan="중국과 무수히 겹치는 수역에서는 정면 승부가 불가능합니다\. 중국 선단이 아직 완전히 투사되지 않은 아프리카 서안 등 \'제3의 신규 FAO Area\' 개척을 최우선 미래 조업 과제로 삼아야 합니다."',
        r'actionPlan="[Blue Ocean Pivot] 중국의 자본 공세가 휩쓰는 북태평양/남서대서양 메인 어장(Red Ocean)에서의 소모전(Attrition Warfare)을 즉시 포기 선언하십시오. 중국 선단 투사율이 10% 미만인 아프리카 서안이나 인도양 미개척 FAO Area 등 극단적 블루오션으로 선단을 100% 우회 전개(Pivot)하는 프론티어 탐사(Frontier Exploration) 조업에 전사 CAPEX를 올인해야 합니다."'
    ),

    # SquidSizePremium.tsx
    (
        r'situation="기후 이변으로 소형 어체의 비중이 높아지면서 대형 오징어의 시중 도매 가격\(보라색 선\)이 소형 대비 폭발적으로 뛰는 \'중량 프리미엄\(보라색 면적\)\'이 극대화 되었습니다."',
        r'situation="[Size-Premium Alpha Extraction] 기상 이변에 따른 어체 왜소화(Shrinkage) 트렌드로 인해 대형 규격(Large/Jumbo) 오징어 품귀 현상이 심화되며, 소형 대비 도매 톤당 단가 스프레드가 기하급수적으로 폭발하는 초격차 \'중량 프리미엄(Size Premium)\' 시대가 열렸습니다."'
    ),
    (
        r'actionPlan="도매시장 출하 시 크기\(Grade\)별 선별 작업을 강화하고, 조업 시 대형 개체가 주로 포진하는 위도 및 수심으로 선단을 전진 배치하여 프리미엄 갭을 수익으로 치환해야 합니다."',
        r'actionPlan="[Premium Arbitrage Optimization] 톤(Volume) 단위의 무차별 도매 출하를 즉각 중단하십시오. 그레이딩(Grading) 자동화 설비를 통해 대형 개체를 100% 분리 추출(Skimming)하여 호텔/고급 일식체인 전용 VVIP 라인업으로 직납하고, 조업 타겟팅 알고리즘을 대형 개체 서식 수온/수심으로 전면 재조정하여 프리미엄 차익(Alpha)을 극대화(Maximize)해야 합니다."'
    )
]

directory = "components"
count = 0

for filename in os.listdir(directory):
    if filename.startswith("Squid") and filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        updated = False
        for search_pattern, replace_pattern in replacements:
            if re.search(search_pattern, content):
                content = re.sub(search_pattern, replace_pattern, content)
                updated = True
        
        if updated:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            count += 1
            print(f"Updated {filename}")

print(f"Total files updated: {count}")
