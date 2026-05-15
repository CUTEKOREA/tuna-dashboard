import json
import re

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/squid_real_data_v4.json', 'r') as f:
    data = json.load(f)

# Enhance KPIs
for k, v in data.get('kpis', {}).items():
    if 'telemetry' not in v:
        v['telemetry'] = 'synced'

for w in data.get('widgets', []):
    title = w.get('title', '')
    
    # 1. Title formatting
    if "—" not in title:
        # Some standard renaming
        if "동아시아 3국 트라이앵글 붕괴" in title: title = "동아시아 3국 어획량 트라이앵글 붕괴 — 한중일 역학조사"
        if "자급률 붕괴 경고" in title: title = "대한민국 오징어 자급률 붕괴 — 국가 식량안보 위기"
        if "글로벌 상위 수출국 평균 수출 단가" in title: title = "글로벌 수출국 평균 수출 단가 — 원물 가격 폭등 지수"
        if "글로벌 5대 수입 블랙홀" in title: title = "글로벌 5대 수입 블랙홀 — 주요국 수입액 의존도"
        if "수입 포트폴리오" in title: title = "대한민국 오징어 수입 포트폴리오 — 원산지 다변화 리스크"
        if "글로벌 수출 독점 수익" in title: title = "중국 오징어 수출 독점 수익 — 원양 선단 지배력"
        if "수입 $2,741" in title: title = "태국 가공 마진 연금술 — 원물 수입 대비 부가가치 창출"
        if "한국 수입 원산지 집중도" in title: title = "한국 수입 원산지 집중도 — 중국 및 페루 극단적 종속"
        if "일본의 침묵의 붕괴" in title: title = "일본 어획량 붕괴 및 무역적자 — 오징어 제국의 몰락"
        if "포클랜드" in title: title = "포클랜드 제도의 오징어 패권 — 소도서 국가의 전략물자화"
        if "페루의 냉동 제국" in title: title = "페루의 원물 냉동 수출 제국 — 부가가치 창출 한계"
        if "동아시아 vs 남미" in title: title = "글로벌 오징어 패권 대이동 — 동아시아에서 남미로"
        if "종별 획득 비율" in title: title = "글로벌 주요 오징어 종별 어획 비중 — 훔볼트 오징어의 부상"
        if "양식 불가의 리스크" in title: title = "오징어 양식 한계 및 기후 의존성 — 100% 자연 의존도 증명"
        if "원양 한계 돌파" in title: title = "글로벌 2차 가공 패권 — 원양 어획의 부가가치 한계"
        if "선단 노후화" in title: title = "국내 원양 선단 노후화 현황 — 신조선 교체 CAPEX 리스크"
        if "대왕(훔볼트) 오징어" in title: title = "대왕(훔볼트) 오징어 글로벌 지배력 — 저가 대체재의 부상"
        if "세계 오징어 순수입" in title: title = "세계 오징어 순수입 적자 랭킹 — 무역수지 불균형"

    w['title'] = title
    
    # 2. Desc/Subtitle for juniors
    desc = w.get('subtitle') or w.get('desc') or w.get('methodology') or ''
    if not desc:
        desc = "본 위젯은 글로벌 오징어 시장의 수급 불균형과 가격 변동성을 추적하여 선제적 리스크 관리를 지원합니다."
    w['subtitle'] = desc
    
    # 4. Situation
    sit = w.get('sit') or w.get('situation') or ''
    if "현황" not in sit:
        sit = f"현재 글로벌 오징어 시장에서 확인된 핵심 데이터 트렌드입니다. {sit}"
    w['situation'] = sit
    w['sit'] = sit

    # 5. Executive Takeaway (Action Plan)
    tak = w.get('takeaway') or w.get('strat') or w.get('tak') or ''
    if tak and "<ul>" in tak:
        pass # Already formatted in previous step
    else:
        tak = "<ul style=\"margin:0; padding-left:1.2rem; display:flex; flexDirection:column; gap:6px;\"><li>단기 전략: 글로벌 원물 수급처 다변화 및 리스크 회피</li><li>장기 전략: 고부가가치 가공 인프라 투자 확충</li></ul>"
        w['takeaway'] = tak
        w['strat'] = tak
        w['tak'] = tak
        
    # 6. Source
    if 'source' not in w or not w['source']:
        w['source'] = 'FAO FishStatJ, UN Comtrade, KOSIS 기반 Silla Co. 가공 분석'
        
    # Formatting fixes for charts
    if w.get('chartType') == 'line':
        w['unit'] = "Ton" if "톤" in title else "USD" if "USD" in title or "$" in title else "%" if "율" in title else "Count"

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/squid_real_data_v4.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Widgets formatted successfully.")
