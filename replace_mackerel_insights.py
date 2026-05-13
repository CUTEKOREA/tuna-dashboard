import re
import os

replacements = [
    # MackerelFeedRatio.tsx
    (
        r'situation="거시 통계상 고등어 수급은 매년 유지되는 착시가 있으나, 실제 밥상에 오르는 먹거리용 고등어 파이는 48% 규모로 급감하는 진정한 수급 절벽입니다."',
        r'situation="[Food-Grade Supply Illusion] 국가 거시 통계상 총어획량은 유지되는 듯한 착시(Optical Illusion)를 보이나, 실질적인 B2C 식용(Food-grade) 체급 비중은 48%로 급감하며 심각한 수급 불균형(Supply Deficit) 한계치에 도달했습니다. 잔여 물량은 사료/어분용으로 강제 전용되는 품질 열화(Quality Degradation) 현상이 본질입니다."'
    ),
    (
        r'actionPlan="정부 정책 통계의 \'공급 과잉 기조\' 페이크\(Fake\)에 속아 덤핑에 편승하면 안 됩니다. 양질의 B2C 타겟 식용 물량 가치는 상상을 초월할 정도로 부족하므로, 대형 유통 3사 네고 시 압도적 가격 방어 전략을 취해야 합니다."',
        r'actionPlan="[B2C Margin Defense] 정책 통계의 \'공급 과잉\' 노이즈를 전면 무시하십시오. 양질의 식용 원물은 현재 극심한 숏티지(Shortage) 상태입니다. 국내 대형 유통 3사(할인점)와의 납품 단가 네고 시 일체의 볼륨 디스카운트를 거부하고, 철저한 \'공급자 우위(Seller\'s Market)\' 기반의 프리미엄 판가 방어 전략(Price Shielding)을 락인해야 합니다."'
    ),

    # MackerelSafetyPremium.tsx
    (
        r'situation="식품 방사능 이슈로 일본산 선호도가 붕괴된 틈을 타, 이를 대체할 한국산이 큰 반사이익\(\+38%\)을 거두며 아프리카 내수에서 \'청정 훈제원료\' 포지셔닝을 얻었습니다."',
        r'situation="[Geopolitical Risk Premium] 지정학적 식품 안전(Radioactivity) 이슈로 글로벌 바이어들의 일본산 펠라직(Pelagic) 기피 현상이 트리거(Trigger)되며, 한국산이 아프리카 권역에서 완벽한 펀더멘털 대체재(Substitute)로 급부상(+38% 볼륨 팽창)하는 구조적 반사이익(Windfall) 국면입니다."'
    ),
    (
        r'actionPlan="통관 패키징 시 국가 공인 방사능 검사 필증 라벨링\(QR 코드 결합\) 마케팅을 필수 의무화하여, 일회성 반사이익을 진입 장벽이 높은 프리미엄 브랜드화로 고착화시켜야 합니다."',
        r'actionPlan="[Quality Moat Construction] 일회성 무역풍(Tailwind)에 안주하지 마십시오. 즉시 선적 물량 100%에 대해 제3자 국가공인 방사능 안전검사(QR 트래킹) 패키징을 강제 의무화하여, 단순 원물 수출을 진입 장벽이 완벽히 구축된 \'청정 프리미엄 원료(Clean-Label)\' 브랜드 비즈니스로 수직 상승시켜야 합니다."'
    ),

    # MackerelNorwaySpread.tsx
    (
        r'situation="노르웨이 쿼터 감축으로 수입 원가가 \'24년 초부터 폭등\(\+66%\)했으나, 내수 소비 저항으로 도매가 전가 속도는 지연되며 중간 마진\(Spread\)이 위협받고 있습니다."',
        r'situation="[Import Cost Squeeze] 북해 연안국 간 쿼터 분쟁 격화로 노르웨이산 수입 원가가 +66% 수직 상승(Cost-Push)했으나, 국내 내수 시장의 강력한 소비 탄력성 저항선(Price Ceiling)에 부딪혀 도매 판가 인상이 지연되는 전형적인 마진 스퀴즈(Margin Squeeze) 위협 구간입니다."'
    ),
    (
        r'actionPlan="스프레드가 500원 이하로 집중 축소 시\(Squeeze\), 섣부른 국내 방출을 보류하고 창고 홀딩을 통해 재고 회전 방어 전략을 실행하거나 동남아 등으로 환적\(Transshipment\)해야 합니다."',
        r'actionPlan="[Liquidity & Inventory Hedging] 톤당 마진 스프레드가 500원(KRW) 하단 임계치를 붕괴할 경우, 국내 방출 스케줄을 전면 셧다운(Hold) 하십시오. 창고 롤오버(Rollover) 비용을 감수하더라도 시장 내 숏티지를 인위적으로 유발하여 판가를 견인하거나, 관세 장벽이 낮은 동남아 등 제3국으로 전량 환적(Transshipment)하는 차익 거래(Arbitrage) 채널을 즉각 가동해야 합니다."'
    ),

    # MackerelClimatePredictor.tsx
    (
        r'situation="평년 수온보다 1.5℃ 이상 끓어오른 임계점을 맞이하면, 대형 고등어 어군이 남하하지 못해 국내파 대형어 수확량이 최대 -65%까지 절멸하고 있습니다."',
        r'situation="[Climate-Driven Biomass Collapse] 글로벌 해수온(SST)이 1.5℃ 임계점(Tipping Point)을 돌파할 경우, 타겟 어군의 남하 회유 경로가 영구 붕괴되며 국내 EEZ 내 대형 체급 수확량이 65% 증발하는 구조적 꼬리 위험(Tail Risk)이 실시간으로 확인되고 있습니다."'
    ),
    (
        r'actionPlan="유통망 감각에 의존하지 마십시오. 해양수산부/NASA의 8~9월 표층 엘니뇨 징후 데이터상 \+1.5도 임계 데이터가 스크랩되는 순간, 이듬해 국내 흉작이 확률적으로 보장되므로 연말 북유럽 선물 매입 볼륨을 전격 상향하는 기후퀀트 헤징을 쏘아 올려야 합니다."',
        r'actionPlan="[Quant-Hedging Execution] 인적 직관에 의존하는 재래식 발주를 즉각 폐기하십시오. NASA/NOAA의 해수온 이상 지수(ENSO)가 +1.5℃ 상단을 뚫는 즉시 알고리즘을 가동하여 차기 년도 노르웨이산 선물(Forward) 매입 볼륨을 3배 상향 락인(Lock-in)하는 \'Climate-Quant\' 헷징 포지션을 전격 승인해야 합니다."'
    ),

    # MackerelSizePremium.tsx
    (
        r'situation="기후 변화로 국산 초대형 고등어 어군이 사라지며, 소형 고등어 대비 가격 배수가 무려 7배 위로 팽창한 \'초 양극화\(금등어\)\' 국면입니다."',
        r'situation="[Size-Premium Bifurcation] 해양 생태계 변화로 국내산 대형 사이즈 생물량(Biomass)이 절멸 국면에 진입하면서, 대-소 체급 간 단가 스프레드가 7배(7x Multiple) 위로 폭발적으로 팽창하는 극단적 마켓 양극화(Super-Polarization)가 완성되었습니다."'
    ),
    (
        r'actionPlan="국산 대형어를 조달하는 선망 어선 브로커에 역대급 인센티브를 부여하여 독점 매입하거나, 자체 HMR 브랜드에서 \'순살 고등어\' 패키징 시 소형어를 강제 배합하는 레시피 개발이 필요합니다."',
        r'actionPlan="[Supply Monopolization & Product Mix] 대형 체급은 단순 소비재가 아닌 \'Veblen Good(과시재)\'으로 격상되었습니다. 최상위 선단에 대한 독점적 조업 선도자금(Pre-financing) 투입으로 대형물을 100% 싹쓸이(Sweep)하고, 소형물은 당사 HMR(가정간편식) 브랜드의 순살 가공 블렌딩 원료로 강제 치환하는 정밀한 티어링(Tiering) 설계가 필요합니다."'
    ),

    # MackerelTRQMeter.tsx
    (
        r'situation="TRQ 소진율이 89%를 돌파하여 조만간 정상 관세\(10~22%\) 적용으로 인한 대규모 공급망 관세 절벽\(단가 폭등\)이 예고되어 있습니다."',
        r'situation="[Tariff Cliff Forewarning] 무관세 쿼터(TRQ) 소진율이 89% 위험 수위를 상향 돌파하며, 단기 내 기본 관세(10~22%) 원복에 따른 밸류체인 전반의 조달 원가(COGS) 폭등 및 치명적인 마진 훼손(Margin Erosion) 리스크가 카운트다운에 돌입했습니다."'
    ),
    (
        r'actionPlan="타 도매상들이 관세 폭탄을 우려할 때 재고를 미리 통관시켜 무관세 혜택을 온전히 확정 짓고, 방출 공백기\(약 한 달 뒤\)에 맞춰 시장 선행가격을 최고점 근처로 끌어올리는 마켓 메이킹을 검토하십시오."',
        r'actionPlan="[Regulatory Arbitrage Strategy] 경쟁 벤더들의 통관 지연 및 원가 패닉을 철저히 이용하십시오. 잔여 TRQ를 선제적으로 싹쓸이 통관(Front-loading)하여 제로(0) 관세율을 확정 지은 후, 1개월 뒤 관세가 전가된 도매 시장 평균 단가 상단에 맞춰 당사 재고를 스팟 방출(Spot Release)하는 \'마켓 메이커(Market Maker)\' 수준의 초과 수익을 추출해야 합니다."'
    ),

    # MackerelAfricanExportROI.tsx
    (
        r'situation="아프리카향 소형어 수출 비즈니스는 원물 단가보다는 일시적인 컨테이너 운임\(SCFI 등\) 폭등 시점\(M5\)에 즉각적인 역마진\(적자\) 타격을 받는 구조입니다."',
        r'situation="[Freight-Elasticity Squeeze] 아프리카향 하위 티어(소형어) 수출 포트폴리오는 원물 펀더멘털보다 글로벌 해상 운임 지수(SCFI) 변동성에 마진이 완벽히 종속되는 극단적 운임 민감도(Freight-Elastic) 구조입니다. 특정 임계점 돌파 시 즉각적 OPM(영업이익률) 적자 전환이 발생합니다."'
    ),
    (
        r'actionPlan="해상 운임 지수가 일정 임계치 상향 돌파 시, 가나 선적을 1~2개월 강제 보류하고 차라리 국내 남부 양식장 생사료\(우럭 등\) 도매 채널에 저가 덤핑 처분하는 시스템 스위칭이 요구됩니다."',
        r'actionPlan="[Agile Channel Switching] 컨테이너 운임 임계치가 내부 모델링 하한선을 이탈하는 순간, 선적 스케줄을 즉시 Force Majeure(불가항력) 급으로 보류(Hold) 하십시오. 악성 재고화 방지를 위해 차라리 국내 양식장 생사료(Feed) 체인으로 전량 저가 매각(Dump)하여 워킹캐피탈(Working Capital)을 긴급 회수하는 \'손절 룰베이스 스위칭\' 매뉴얼을 전사 적용하십시오."'
    ),

    # MackerelAltSourcingIndex.tsx
    (
        r'situation="노르웨이 프리미엄 폭발 속 영국/아일랜드산이 갭 메우기를 시도 중이며, 칠레산\(전갱이 등 혼용\)은 여전히 압도적 가성비를 보여줍니다."',
        r'situation="[Sourcing Diversification Dynamics] 노르웨이산의 초프리미엄(Hyper-premium) 지배력이 정점에 달한 가운데, 영국/아일랜드산이 티어 1.5 포지션으로 차익 거래 틈새를 침투 중입니다. 반면 칠레/페루산(펠라직 혼용)은 압도적 원가 우위(Cost Leadership)로 밑바닥 볼륨 마켓을 잠식하는 명확한 시장 분절(Fragmentation)이 포착됩니다."'
    ),
    (
        r'actionPlan="통조림, 식당 납품 등 B2B 식자재/사료 원료는 칠레산으로 원산지를 다변화하고, 기존 대형마트 B2C 매대 구역만 노르웨이산에 자본을 집중하는 투트랙\(Two-Track\)을 전개하십시오."',
        r'actionPlan="[Bifurcated Capital Allocation] 단일 소싱의 함정(Vendor Lock-in)을 즉각 해체하십시오. 단가 탄력성이 높은 B2B 통조림/식자재 유통 라인은 칠레산 기반의 파격적 로우코스트(Low-cost) 네트워크로 전면 개편하고, 투자가용자본(Dry Powder)은 철저히 B2C 대형 마트의 \'노르웨이 프리미엄 매대\' 브랜드 독점력 강화에만 100% 집중하는 투-트랙(Two-Track) 엣지를 실행해야 합니다."'
    ),

    # MackerelFilletPenetration.tsx
    (
        r'situation="어류 손질을 기피하는 1인가구 및 에어프라이어 가정 문화 확산이 꼬리 원물 시대를 마감시키며 순살 필렛의 보급률을 62% 위로 견인했습니다."',
        r'situation="[HMR Paradigm Shift] 1인 가구 폭증 및 에어프라이어(Air-fryer) 보급의 매크로 메가트렌드가 재래식 H&G(원물) 소비를 완전히 멸종시키며, 전처리(Pre-processed) 완료된 순살 필렛(Fillet)의 내수 침투율이 62%를 돌파하는 구조적 B2C 밸류업 변곡점에 도달했습니다."'
    ),
    (
        r'actionPlan="단순 냉동 상하차 사업에서 탈피하십시오. 차기년 장기 공급 수주 시 노르웨이 현지 공장에서부터 H/G\(머리/내장 제거\) 스펙 구매량을 절대적으로 사수해야 국내 자동화 라인 생산성 저하를 방어할 수 있습니다."',
        r'actionPlan="[Supply Chain Front-loading] 단순 트레이딩 시대는 종료되었습니다. 당사 자동화 필레팅 공정의 수율과 CAPA를 사수하기 위해, 차기 년도 노르웨이 공급망 체결 시 단순 원물이 아닌 최소 H&G(Head/Gut 제거) 이상 등급의 스펙(Spec) 선확보 조항을 독점적으로 강제(Mandate)하여 원물 손실 리스크(Yield Loss)를 해외 패커에게 사전 전가하십시오."'
    ),

    # MackerelStorageTurnover.tsx
    (
        r'situation="재고 체계의 이상 감지: W3~W4 구간에서 들어오는 입고 적재량은 수직 상승하나 물건이 전혀 빠져나가지 않는 기현상\(회전율 52일\)이 포착되었습니다."',
        r'situation="[Inventory Anomaly Detection] 창고 텔레메트리(Telemetry) 분석 결과 치명적 이상치(Outlier)가 감지되었습니다. 물류 유입 볼륨은 폭증(Spike)하나 출고(Outbound) 볼륨이 소멸하며 악성 재고 회전율(Inventory Turnover 52 days) 한계선을 붕괴시키는 전형적인 \'보틀넥(Bottleneck)\' 경고입니다."'
    ),
    (
        r'actionPlan="부산의 핵심 도매 유통 라인이 향후 통관세 부과나 명절 단가 상승 폭주를 예견하고 의도적으로 물량을 터트리지 않는 \'매점매석 홀딩\' 정황입니다. 직수입 바이어로서 가격 협상 시 막강한 숏스퀴즈 프리미엄을 역제안해야 합니다."',
        r'actionPlan="[Short-Squeeze Countermeasures] 이는 단순 유통 지연이 아닌, 관세 부과 및 성수기 단가 폭등을 노린 메이저 도매 벤더들의 전략적 매점매석(Hoarding) 카르텔 정황입니다. 당사는 직수입 공급망(Direct Importer)의 레버리지를 극대화하여 물량 출하를 전격 차단(Squeeze)하고, 역으로 최상위 도매 채널에 판가 협상권 100% 백지위임을 강요하는 독점적 프라이싱 파워를 행사하십시오."'
    ),
]

directory = "components"
count = 0

for filename in os.listdir(directory):
    if filename.startswith("Mackerel") and filename.endswith(".tsx"):
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
