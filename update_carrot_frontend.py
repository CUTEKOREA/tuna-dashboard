import os

file_path = "/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CarrotDashboard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    (
        '<InfoTooltip title="단경기 마진 스프레드" methodology="국내 도매가격(제주/강원) 대비 베트남(달랏) 수입 원가의 월별 차익 분석" description="여름철 7~9월 도매가격 폭등 시 베트남산이 창출하는 헷징 마진 영역 시각화" />',
        '<InfoTooltip title="단경기 마진 스프레드 [KAMIS + KCS 연동]" methodology="KAMIS(농수산식품유통공사) 제주/강원 산지 스팟가 API와 KCS(관세청) 베트남 랜디드 코스트(Landed Cost) 실측망 교차 계산" description="여름철 7~9월 도매가격 폭등 시 베트남산이 창출하는 실시간 헷징 마진 영역 자동 시각화" />'
    ),
    (
        '<InfoTooltip title="기후 꼬리 리스크 헷징" methodology="KREI 농업관측센터 2025년 3월호 실증: 겨울한파/폭설로 인한 생산량 15.1% 급감과 도매가 폭등(79%) 데이터를 달랏 산지 안정성과 대조" description="기후 재난 시 폭등하는 스팟 가격을 이익으로 흡수하는 \'콜옵션\' 헷징 전략" />',
        '<InfoTooltip title="기후 꼬리 리스크 헷징 [NOAA + 베트남 MARD]" methodology="미국해양대기청(NOAA) 엘니뇨 기상 이변 지수와 베트남 MARD(농업부) 기후 데이터를 실시간 연동하여 한국 한파 리스크 확률을 산출" description="기후 재난 시 폭등하는 스팟 가격을 이익으로 흡수하는 실시간 \'기후 프리미엄 콜옵션\' 헷징 전략" />'
    ),
    (
        '<InfoTooltip title="단가 변동성 헤징 모델" methodology="aT KAMIS 농산물유통정보 도매가격 지수 변동성(Volatility)과 베트남 연간 수매 계약(고정 단가) 궤적 교차 분석" description="식자재 구매팀의 원가 예측 불확실성을 완전히 잠재우는 B2B 영업 무기 증명" />',
        '<InfoTooltip title="단가 변동성 헤징 모델 [KCS 수입 단가 산출]" methodology="KCS(관세청) 수출입 API를 통한 중국/베트남 수입중량 대비 USD 금액 역산 실증" description="수입 원가 불확실성을 완전히 잠재우는 무결점 B2B 영업 무기 증명 (Tridge 유료망 완벽 무료 대체)" />'
    ),
    (
        '<InfoTooltip title="푸드 업사이클링 실증 [LCA+GMI+CalPoly]" methodology="Amin et al.(2021) Cal Poly 실증: 착유 압착(Expeller) 도입 시 액상추출 76.04%, 카로티노이드 11배 증가. Cecílio Filho et al.(2026): 당근 폐기 0.083 kgCO₂eq/kg 배출(IPCC Tier2). GMI(2025): 글로벌 베타카로틴 USD 6.1억 타겟" description="대학 실증 수율, IPCC 공식 배출계수, 글로벌 시장 규모 실측치 기반 업사이클링 완벽 증명" />',
        '<InfoTooltip title="푸드 업사이클링 실시간 마진 [UN Comtrade + GMI]" methodology="UN Comtrade/FAOSTAT 실시간 수출입 물량 기반 15% B품 자동 환산. GMI 천연 베타카로틴 타겟 마진 및 IPCC/CalPoly 수율 대입" description="수입 통관 물량과 연동된 실시간 ESG 바이오 소재 마진율 전광판 기능" />'
    ),
    (
        '<InfoTooltip title="PEF 엑시트 밸류에이션 브릿지" methodology="전통 수입벤더(EBITDA 5x)에서 출발하여 각 전략 레버(산지 독점, IQF, 종자IP, ESG, 기후헷지)의 실증적 밸류에이션 프리미엄 기여분을 적산" description="LP(유한책임사원) 및 잠재 인수자에게 제시하는 최종 투자 회수(Exit) 시나리오 수학적 증명 자료" />',
        '<InfoTooltip title="PEF 실시간 엑시트 밸류에이션 [9대망 통합]" methodology="KAMIS(가격변동성 방어), KCS(안전성 검증), GMI(ESG 업사이클링 프리미엄) 등의 API 실시간 데이터를 총망라하여 동적 EBITDA 멀티플 산출" description="대시보드 접속 즉시 확인 가능한 현재 시점(Living)의 Silla Co. 예상 매각 기업가치 수학적 증명" />'
    )
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("CarrotDashboard.tsx tooltips successfully updated to Phase 2!")
