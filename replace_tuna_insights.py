import re

with open('components/TunaInsightsDashboard.tsx', 'r') as f:
    content = f.read()

replacements = [
    (
        r'situation="태국 등 원어 거점의 1차 매입가\(Raw Material\)와, 이를 가공하여 EU/미주에 파는 2차 수출가 사이의 괴리를 통계적으로 추적하여 최고 마진 경로를 노출합니다."',
        r'situation="[Arbitrage Spread Analysis] 태국 등 1차 원물(Raw Material) 허브 매입가와 EU/미주향 2차 가공 수출가 간의 구조적 괴리를 정량 추적 중입니다. 2021년 물류 대란(Supply Chain Disruption) 이후 운임 상승폭을 흡수하고도 톤당 스프레드가 $3,450을 돌파하는 등 초과수익(Alpha) 구간이 형성되었습니다."'
    ),
    (
        r'actionPlan="2021년 이후 운임 상승분에도 불구하고 원어-가공품 간 스프레드가 3천불 이상으로 벌어지고 있습니다. 태국이나 에콰도르 가공 거점을 통한 유럽 수출 라인의 극대화가 요구됩니다."',
        r'actionPlan="[Capital Allocation Strategy] 단순 원물 트레이딩 볼륨을 축소하고, 가공 차익(Processing Margin)을 극대화하는 \'Value-Add\' 라인으로 자본을 전면 재배치해야 합니다. 특히 EU향 무관세 혜택(Tariff Advantage)이 있는 에콰도르 내 톨링(Tolling) 파트너십을 즉시 체결하여 규제 차익(Regulatory Arbitrage)까지 동시에 확보하십시오."'
    ),
    (
        r'situation="과거 미국, 일본 중심이던 참치 가공 산업이 동남아와 중남미로 이동하고 있음을 보여주는 글로벌 시장 점유율 데이터 궤적입니다."',
        r'situation="[Supply Chain Migration] 과거 미국·일본이 주도하던 가공 패권이 지정학적 임금 인플레이션 및 관세 장벽으로 인해 해체되며, 에콰도르(M/S 26%) 및 베트남 중심의 신흥 오프쇼어링(Offshoring) 허브로 시장 재편이 완료되는 국면입니다."'
    ),
    (
        r'actionPlan="미국/일본의 원가 경쟁력이 상실됨에 따라 중남미\(에콰도르\) 거점의 세제 혜택\(Tariff Advantage\)을 활용한 EU/미주 수출 전진기지 구축 투자가 필요합니다."',
        r'actionPlan="[M&A / FDI Strategy] 미국 및 일본 내 On-shore 가공 설비를 보유한 경쟁사들의 한계 비용(Marginal Cost)이 한계선에 도달했습니다. 우리는 중남미(에콰도르)의 기구축된 밸류체인을 활용해, 북미 리테일러향 \'관세 회피(Tariff-free) 프라이빗 라벨(PB)\' 장기 공급 계약을 선점하는 우회 진입(Bypass) 전략을 즉각 승인해야 합니다."'
    ),
    (
        r'situation="CAGR\(연평균성장률\)이 15%를 넘어가는 초고속 참치 소비 국가. 중진국 진입과 함께 통조림 수요가 폭발하는 시장입니다."',
        r'situation="[Emerging Market Demand Shock] 1인당 GDP 상승 곡선과 맞물려 상온 보관 단백질(Canned Tuna) 수요가 폭발하는 \'소비 블랙홀\' 국가들의 데이터입니다. 특히 나이지리아 등 아프리카/중동 권역에서 연평균 성장률(CAGR) 20% 이상의 비선형적 폭발(Exponential Growth)이 관측됩니다."'
    ),
    (
        r'actionPlan="전통적 참치 소비국인 선진국의 수요 정체에 대응하여, CAGR 20%를 상회하는 나이지리아 등 아프리카/중동 신흥국의 캔 참치 판로를 선점해야 합니다."',
        r'actionPlan="[Market Penetration Tactics] 선진국의 저성장(Stagnation) 굴레에서 벗어나, 아프리카 및 중동 내 1차 벤더(Tier 1 Distributor) 지분을 전략적으로 인수하거나 조인트벤처(JV)를 설립하십시오. 초기 진입 시 저가 블렌딩(Blending) 스킵잭 라인업으로 시장 점유율(Market Share)을 장악한 뒤, 프리미엄 라인으로 마진을 확대하는 2-Step 침투 전략을 집행해야 합니다."'
    ),
    (
        r'situation="엘니뇨 등 기상 이변으로 중서부태평양\(WCPO\) 조업이 급락할 때 대서양 어장이 반사 이익을 얻는 제로섬 시소 현상입니다."',
        r'situation="[Macro Climate Hedging] 엘니뇨/라니냐 사이클에 따른 중서부태평양(WCPO) 어획량의 변동성이 대서양 조업량과 완벽한 음의 상관관계(Zero-sum Seesaw)를 보이고 있습니다. 2015년, 2023년 기후 충격 당시 대서양이 +42%의 손실 보전(Compensation) 역할을 수행했습니다."'
    ),
    (
        r'actionPlan="2015년과 2023년 태평양 엘니뇨 변동 시 대서양 어장이 완벽한 헷징 역할을 수행했습니다. 선단 이동 재배치의 정량적 트리거 신호입니다."',
        r'actionPlan="[Fleet Redeployment Protocol] 기상 이변은 리스크가 아니라 기회입니다. 글로벌 ENSO(엘니뇨 남방진동) 지수가 1.5 임계치를 돌파하는 즉시, 태평양 선단(Fleet)의 30%를 대서양 공해상으로 전진 배치하는 \'동적 헷징(Dynamic Hedging) 매뉴얼\'을 전격 가동하십시오. 기상 리스크를 선제적 조업권 확보(Arbitrage)의 무기로 전환해야 합니다."'
    ),
    (
        r'situation="가나 마스터플랜의 아이디어처럼, 참치의 흉어 시 고등어 등 대체 펠라직\(표층수\) 어종의 수출입 볼륨이 역상관관계로 폭등하는 포인트입니다."',
        r'situation="[Cross-Commodity Correlation] 참치 어획량 급감에 따른 단가 폭등 시, 대체 단백질인 펠라직(고등어 등 표층수 어종) 수요가 수직 상승하는 강력한 역상관관계(-0.78, Negative Correlation) 지표입니다. 대체재 간의 완벽한 펀더멘털 헷징 구조입니다."'
    ),
    (
        r'actionPlan="강한 역상관관계\(-0.78\)를 보이는 고등어 포트폴리오를 참치 비즈니스와 결합하여 자연재해 리스크를 재무적으로 상쇄하는 통합 상품기획이 필수적입니다."',
        r'actionPlan="[Portfolio Diversification] 참치 단일 어종에 의존하는 \'One-trick Pony\' 비즈니스 모델을 즉시 폐기하십시오. 참치 흉어 리스크를 재무적으로 완전 상쇄(Offset)할 수 있도록, 스칸디나비아산 고등어 쿼터(Quota) 확보 및 트레이딩 부서를 통합 신설하여 \'펠라직 인덱스 펀드\' 관점의 다각화된 상품 포트폴리오를 구축해야 합니다."'
    ),
    (
        r'situation="특정 국가들의 \'수출 신고량\'과 \'수입국 반영량\' 사이의 무역 불일치 격차를 통해 불법 어획\(IUU\) 및 해상 전재 블랙마켓을 추적합니다."',
        r'situation="[Compliance & Tail Risk Monitor] 태평양 도서 국가 라인에서 발원하는 수출 통관량과 실제 수입 반영량 간의 거대한 이격(Discrepancy Gap)은 해상 전재(Transshipment) 기반의 불법·비보고·비규제(IUU) 블랙마켓 볼륨입니다. ESG 규제 당국의 다음 타겟이 될 시한폭탄입니다."'
    ),
    (
        r'actionPlan="태평양 도서 국가 라인에서의 6만 톤 이상의 무역 불일치는 다크 트레이딩 물량입니다. 자가 밸류체인 내의 해상 전재\(Transshipment\) 규정 준수 여부를 긴급 점검하십시오."',
        r'actionPlan="[ESG Compliance Audit] 무역 불일치 물량이 당사의 소싱 파이프라인(Supply Chain)에 1%라도 섞여 들어올 경우, 서구권 메이저 리테일러의 상장 폐지급 벤더 퇴출 리스크가 존재합니다. 즉시 제3자(Third-party) 블록체인 이력 추적 시스템을 도입하여 밸류체인의 무결성을 투명하게 증명(Auditability)하고, 이를 마케팅 무기로 역활용하십시오."'
    ),
    (
        r'situation="지속가능성 요구와 지방률 통제 기술 발달로 인해, 양식\(Ranching\) 참치의 톤당 단가가 자연산 야생 어획을 추월한 크로스오버를 보여줍니다."',
        r'situation="[Value Inversion: Wild vs Ranching] 2015년 임계점(Inversion Point)을 기점으로, 품질 균일성(Quality Control)과 지방률 정밀 통제가 가능한 양식(Ranching) 참치의 톤당 단가가 자연산 야생 어획 단가를 완벽하게 추월(+31.9% 프리미엄)하는 패러다임 역전이 고착화되었습니다."'
    ),
    (
        r'actionPlan="2015년을 기점으로 참다랑어 양식업의 부가가치가 폭발적으로 전세 역전되었습니다. 일관된 품질을 갖춘 Ranching 비즈니스로의 자본 선회가 필수적입니다."',
        r'actionPlan="[Capex Reallocation] 불확실성이 극심한 원양 어선 건조(Hardware)에 대한 CAPEX 승인을 전면 보류하십시오. 조업 의존형 구조에서 탈피하여, 지중해 및 호주 등지의 최상위 지분 구조를 가진 양식(Ranching/Farming) 인프라 또는 배양 기술(Bio-tech) 스타트업으로 전사적 투자가용자본(Dry Powder)을 전면 이동시켜야 합니다."'
    ),
    (
        r'situation="kg당 수입단가가 30달러를 넘는 극프리미엄 지상주의 \'소비 블랙홀\' 흐름. 전통적 일본 수요보다 더 비싸게 사가는 신규 미식 타겟 국가 리스트입니다."',
        r'situation="[Ultra-Premium Demand Dynamics] kg당 $30 이상의 막대한 지불 용의(Willingness to Pay)를 지닌 초프리미엄 미식(Gastronomy) 시장 지형입니다. 전통적 코어 마켓인 일본($28/kg)의 소비력이 정체된 반면, UAE(두바이) 및 홍콩 등 신진 부유층 마켓이 최고가 수요 블랙홀로 부상 중입니다."'
    ),
    (
        r'actionPlan="전통적 일본 수요 시장에 얽매이지 말고, 초프리미엄 지불 의사가 확인된 두바이\(UAE\) 등 중동 및 중국 고소득층을 향한 다이렉트 수출\(B2B\) 망을 즉각 신설하십시오."',
        r'actionPlan="[Direct-to-Market Expansion] 도쿄 츠키지/토요스 시장을 거치는 기존의 다단계 중간 유통(Middle-man) 구조를 즉각 해체하십시오. 최상급 O-Toro(대뱃살) 등 하이엔드 컷은 항공 냉장(Air-freight) 콜드체인을 통해 두바이, 리야드 등 중동 VVIP 럭셔리 호스피탈리티(Hospitality) 채널로 직결(B2B Direct)하는 고마진 파이프라인을 구축해야 합니다."'
    ),
    (
        r'situation="주요 참치 수출국 상위 3개국의 어획 집중도\(HHI\) 상승은 바이어\(제조사\)의 판가 교섭력 상실 및 조달 단가 폭등 리스크를 경고합니다."',
        r'situation="[Supply Monopoly Risk \(HHI\)] 글로벌 수출국 상위 3개국의 어획 할당 통제력이 심화되며, 시장 집중도(HHI)가 위험 수위인 2,950(Danger Zone)을 돌파했습니다. 이는 글로벌 바이어(캔 제조사)들의 네고 권력이 붕괴되고 원자재 공급사들의 마진 스퀴즈(Margin Squeeze) 횡포가 본격화되었음을 시사합니다."'
    ),
    (
        r'actionPlan="HHI 지수가 2500을 돌파한 것은 독과점이 심화되었음을 의미합니다. 상사 및 캔 제조사는 단가 변동성 폭격\(Squeeze\)을 대비하여 장기 선도계약\(Forward Contract\) 비율을 급증시켜야 합니다."',
        r'actionPlan="[Procurement Risk Mitigation] 조달 원가(COGS) 폭등 리스크가 임박했습니다. 현물(Spot) 시장에서의 단기 매입 비중을 최소화하고, 핵심 선단과의 3~5년 단위 장기 선도계약(Forward Contract) 혹은 상호 지분 스왑(Equity Swap)을 체결하여 원가 변동성을 락인(Lock-in)하는 강력한 헤지 포지션을 구축해야 합니다."'
    ),
    (
        r'situation="수온 상승에 따른 지난 30년간의 어종 믹스\(Species Mix\) 점진적 붕괴. 한대성\(Bluefin\)이 구축당하고 열대성\(Skipjack\)이 확장하는 궤적."',
        r'situation="[Climate-Driven Species Shift] 지난 30년간 글로벌 해수온 펀더멘털 변화로 인해 한대성 어종(Bluefin)의 생물량은 침식당하고 열대성 어종(Skipjack)이 88% 시장을 지배(Dominance)하는 영구적 생태계 역전(Ecosystem Inversion) 궤적입니다."'
    ),
    (
        r'actionPlan="거시적 수온 상승으로 인해 다가올 10년 뒤 신규 어선 건조 프로젝트\(Shipbuilding F/S\) 시 타겟 어종 및 망 스펙을 블루핀 기반에서 열대성 회유어종 캡처용으로 변경 설계해야 합니다."',
        r'actionPlan="[Future-Proof Asset Strategy] 당사의 장기 설비투자(Shipbuilding F/S) 타당성 검토 로직을 전면 수정하십시오. 10년 내용연수를 지닌 신규 참치선망어선(Purse Seiner) 설계 시, 더 이상 축소되는 고위도 어장에 베팅하지 말고, 적도 부근 표층수 열대 어종 대량 포획 및 가공 효율에 최적화된 하드웨어 스펙으로 과감한 피벗(Pivot)을 승인해야 합니다."'
    ),
    (
        r'situation="과거 맹목적 항해 의존 방식을 탈피하여 AI 기반 부표가 타겟 생물량\(Biomass\)을 정확히 타기팅하면서 연료 낭비를 제거하고 탄소 배출을 저감하고 있습니다."',
        r'situation="[AI-Driven Precision Fishing] 맹목적 탐색 조업(Blind Searching)의 시대가 종료되었습니다. 3D 소나 및 위성 통신 기반 AI 집어장치(FADs)의 결합으로 조업 성공률(CPUE)은 비약적으로 상승(+15%)하는 동시에 핵심 원가인 선박 연료비(MGO Cost)는 급감(-28%)하는 전형적인 기술-원가 구조 혁신(J-Curve)이 발생 중입니다."'
    ),
    (
        r'actionPlan="원양 선단에 3D 소나 및 AI 분석 부표 전면 도입\(Retrofit\) 투자를 가속하여, 고유가 시대의 직접적 MGO 비용 감축과 스코프 3 탄소 중립 요건을 조기 충족하십시오."',
        r'actionPlan="[Operational Capex Deployment] 구형 아날로그 선단의 퇴출이 임박했습니다. 즉각 전 선단에 대한 디지털 레트로핏(Retrofit) CAPEX 예산을 승인하십시오. 정밀 조업 시스템 장착은 단순 원가 절감을 넘어, 다가오는 해운업계 스코프 3(Scope 3) 탄소 배출 규제 페널티를 회피하는 가장 확실한 ESG 재무 헷징 수단입니다."'
    ),
    (
        r'situation="대미 수출 관세 15~20% 폭탄이 현실화되면서 타이유니온 등 빅 플레이어들이 미국 내 현지 공장\(FDI\) 신설로 선회하는 관세 회피 모델을 가동 중입니다."',
        r'situation="[Geopolitical Tariff Evasion] 미국발 고율 보호무역 관세(최대 20%) 쇼크로 인해 동남아 기반 벤더들의 대미 수출망이 붕괴(-60%)되고 있습니다. 반면, 글로벌 빅 플레이어들은 이미 조지아주 등 북미 현지(FDI)나 USMCA 무관세 혜택 국가(멕시코)로 생산 거점을 공격적으로 이전(On-shoring/Near-shoring) 중입니다."'
    ),
    (
        r'actionPlan="전통 라인업\(아시아 가공->수출\)에 의존하는 벤더망을 즉시 조정하고, 멕시코/에콰도르 및 미국 로컬 온쇼어 가공 설비를 인수한 업체들의 우회 공급망으로 구매 포트폴리오 전환해야 합니다."',
        r'actionPlan="[Near-Shoring Strategy Execution] 아시아 가공-미주 수출이라는 전통적 선형 밸류체인은 마진 붕괴로 직결됩니다. 이사회는 북미 로컬 온쇼어(On-shore) 가공 설비 인수(M&A)를 전격 검토하거나, 멕시코/중남미에 기반을 둔 로컬 티어 1(Tier 1) 제조사들과의 전략적 합작법인(JV) 설립 안건을 최우선으로 상정해야 합니다."'
    ),
    (
        r'situation="월마트, ALDI 등 대형 리테일러가 자체 PB라인에 100% MSC 의무화를 선언하면서, 비인증 하청들의 조달 탈락 기류가 발생하고 있습니다."',
        r'situation="[Eco-Premium Price Multiplier] 월마트, ALDI 등 글로벌 유통 채널 캡틴들이 MSC(해양관리협의회) 미인증 제품을 소싱 리스트에서 영구 퇴출(De-listing)시키고 있습니다. MSC 및 돌고래 안전(Dolphin-Safe) 듀얼 인증 확보 여부가 판가에 최대 +81%의 독점적 프리미엄(Monopoly Rent)을 부여하는 핵심 라이선스로 격상되었습니다."'
    ),
    (
        r'actionPlan="과거 선택적 CSR 투자였던 MSC/Dolphin-safe 인증이 이제 프리미엄 판로 진입의 유일한 \'입장권\'이 되었습니다. 전 선단 인증 획득을 최우선 KPI로 승격화하십시오."',
        r'actionPlan="[Compliance & Pricing Strategy] 인증 확보는 더 이상 CSR 부서의 마케팅 비용이 아니라, 생존과 초과수익을 가르는 핵심 무형자산(Intangible Asset)입니다. 전 선단 및 가공 라인의 MSC-COC 인증 획득 및 갱신을 전사 최우선 CEO KPI로 락인(Lock-in)하고, 인증 획득에 소요되는 컨설팅 비용을 무제한 승인하십시오."'
    ),
    (
        r'situation="참치의 최악의 사료 전환 효율\(FIFO\)과 엘니뇨로 인한 어분 가격 20% 폭등이 식물성/배양육 참치의 기술적 도래를 경제학적으로 앞당기고 있습니다."',
        r'situation="[Alternative Protein Disruption] 양식 참치의 생물학적 한계(극악의 사료전환효율 FIFO)와 글로벌 어분(Fishmeal) 원가 폭등이 결합되어, 푸드테크 기반의 식물성(Vegan) 및 세포 배양(Cultivated) 대체 참치 시장이 연 7.8% CAGR의 구조적 메가 트렌드($1.59B)로 폭발하고 있습니다."'
    ),
    (
        r'actionPlan="어획 기반의 성장에는 천장이 존재합니다. 범블비\(Bumble Bee\)처럼 식물성 참치 브랜드와의 M&A 혹은 세포 배양 스타트업에 지분 투자를 단행해 \'단백질 믹스\'를 다각화할 시점입니다."',
        r'actionPlan="[Future Food-Tech M&A] 레거시(Legacy) 어획 산업의 단백질 생산 한계치(Cap)에 도달했습니다. 벤처캐피털(CVC) 조직을 즉각 가동하여 글로벌 세포 배양 수산물 스타트업에 대한 시리즈 A/B 지분 투자를 단행하십시오. 단일 생물 단백질 회사를 넘어 글로벌 \'Alt-Protein\' 포트폴리오를 거느린 푸드테크 지주사로 기업가치(Valuation)를 재평가(Re-rating) 받아야 합니다."'
    ),
    (
        r'situation="타이유니온 등 가공 선두 업체는 참치 본연의 제품보다 버려지던 부산물로 만든 펫푸드\(PetCare\)에서 28%의 사상 최대 이익률을 추출하고 있습니다."',
        r'situation="[Downstream Margin Extraction] 가공 공정에서 폐기되거나 사료용으로 헐값에 넘겨지던 52%의 참치 부산물(머리, 뼈, 내장)이 고양이용 프리미엄 펫푸드 및 바이오/해양 콜라겐 시장으로 전용(Upcycling)되면서, 본업(Canned Tuna 8.5%)을 압도하는 28.5%의 비정상적 초과 영업이익률(Operating Margin)을 창출하고 있습니다."'
    ),
    (
        r'actionPlan="어분 라인으로 헐값에 넘기던 52%의 참치 부산물을 직접 수거하여 B2B 오메가-3 및 프리미엄 고양이 캔\(고마진 수익원\) 공정으로 직결하는 인프라를 대거 확충하십시오."',
        r'actionPlan="[Vertical Integration Execution] 부산물은 폐기물이 아니라 가장 수익성 높은 숨겨진 캐시카우(Hidden Cash-cow)입니다. 어분 라인 매각을 즉시 중단하고, 부산물 원료를 활용한 자체 \'하이엔드 펫 밀(Pet Meal) 팩토리\' 및 바이오-오메가3 추출 설비 구축에 즉각적인 조인트 벤처(JV) 자본을 투입하여 밸류체인 완전 수직 계열화를 달성하십시오."'
    ),
]

for search_pattern, replace_pattern in replacements:
    content = re.sub(search_pattern, replace_pattern, content, flags=re.MULTILINE)

with open('components/TunaInsightsDashboard.tsx', 'w') as f:
    f.write(content)

print("TunaInsightsDashboard updated successfully!")
