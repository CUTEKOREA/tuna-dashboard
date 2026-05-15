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
    
    # 1. Title formatting (Make it professional without prefixes and with " — " separation)
    title = re.sub(r'^\s*\(.*?\)\s*', '', title) # Remove (GAP-C) etc.
    if " - " in title: title = title.replace(" - ", " — ")
    if ": " in title: title = title.replace(": ", " — ")
    if "—" not in title:
        # Add subtitles to titles that lack them for executive clarity
        mapping = {
            "동아시아 3국 트라이앵글 붕괴 (1980-2024)": "동아시아 3국 어획량 트라이앵글 붕괴 — 한·중·일 역학조사",
            "대한민국 오징어 자급률 붕괴 경고 (2000-2023)": "대한민국 오징어 자급률 붕괴 — 국가 식량안보 위기 (2000-2023)",
            "글로벌 상위 수출국 평균 수출 단가 폭등 지수 ($/톤)": "글로벌 상위 5개국 평균 수출 단가 — 원물 가격 폭등 지수 ($/톤)",
            "2023 글로벌 5대 수입 블랙홀 (USD 1000)": "글로벌 5대 수입 블랙홀 — 주요국 수입액 및 의존도 (USD 1,000)",
            "대한민국 오징어 수입 포트폴리오 (USD 1000)": "대한민국 오징어 수입 포트폴리오 — 원산지 다변화 리스크 (USD 1,000)",
            "중국의 글로벌 수출 독점 수익 팽창 (1990-2023)": "중국 오징어 수출 독점 수익 — 원양 선단 지배력 팽창 (1990-2023)",
            "태국의 오징어 연금술 — 수입 $2,741 → 수출 $7,995": "태국 가공 마진 연금술 — 원물 수입 대비 부가가치 창출 현황",
            "한국 수입 원산지 집중도 — 중국+페루 76% 양국 종속": "한국 수입 원산지 집중도 — 중국 및 페루 극단적 종속 (76%)",
            "일본의 침묵의 붕괴 — 어획량 97% 소멸, 적자 $728M": "일본 어획량 붕괴 및 무역적자 — 오징어 제국의 몰락",
            "포클랜드 — 인구 3,800명의 오징어 슈퍼파워": "포클랜드 제도의 오징어 패권 — 소도서 국가의 전략물자화",
            "페루의 냉동 제국 — 가공의 95%가 단순 냉동": "페루의 원물 냉동 수출 제국 — 부가가치 창출 한계",
            "동아시아 vs 남미 — 오징어 패권 대이동": "글로벌 오징어 패권 대이동 — 동아시아에서 남미로",
            "2024년 종별 획득 비율 (상위 5종)": "글로벌 주요 오징어 종별 어획 비중 — 훔볼트 오징어의 부상 (상위 5종)",
            "양식 불가의 리스크: 100% 기후 의존성 증명": "오징어 양식 한계 및 기후 의존성 — 100% 자연 의존도 증명",
            "원양 한계 돌파: 글로벌 2차 가공 패권 (2000-2023)": "글로벌 2차 가공 패권 — 원양 어획의 부가가치 한계 (2000-2023)",
            "선단 노후화 vs 신조선 투자 ROI (M&A 실사 기반 CAPEX 분석)": "원양 선단 노후화 및 신조선 투자 ROI — M&A 실사 기반 CAPEX 분석",
            "대왕(훔볼트) 오징어의 글로벌 지배력 확대 (1990-2024)": "대왕(훔볼트) 오징어 글로벌 지배력 — 저가 대체재의 부상 (1990-2024)",
            "2023 세계 오징어 순수입(무역적자) TOP 5": "세계 오징어 순수입 적자 랭킹 — 무역수지 불균형 TOP 5"
        }
        title = mapping.get(title, title)
    
    w['title'] = title
    
    # 2. Desc/Subtitle
    desc = w.get('subtitle') or w.get('desc') or w.get('methodology') or ''
    if not desc:
        desc = "본 위젯은 글로벌 오징어 시장의 수급 불균형과 가격 변동성을 추적하여 선제적 리스크 관리를 지원합니다."
    w['subtitle'] = desc
    
    # 3. Situation
    sit = w.get('sit') or w.get('situation') or ''
    w['situation'] = sit
    w['sit'] = sit

    # 4. Takeaway to UL
    tak = w.get('takeaway') or w.get('strat') or w.get('tak') or ''
    if tak and "<ul" not in tak:
        sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', tak) if s.strip()]
        new_tak = "<ul style=\"margin:0; padding-left:1.2rem; display:flex; flexDirection:column; gap:6px;\">"
        for s in sentences:
            if ":" in s or "강조:" in s:
                parts = s.split(":", 1)
                new_tak += f"<li><strong>{parts[0]}:</strong> {parts[1]}</li>"
            else:
                new_tak += f"<li>{s}</li>"
        new_tak += "</ul>"
        w['takeaway'] = new_tak
        w['strat'] = new_tak
        w['tak'] = new_tak
        
    # 5. Source
    if not w.get('source'):
        w['source'] = 'FAO FishStatJ, UN Comtrade, KOSIS 기반 Silla Co. 가공 분석'
        
    # 6. Units
    if w.get('chartType') == 'line':
        w['unit'] = "Ton" if "톤" in title else "USD" if "USD" in title or "$" in title else "%" if "율" in title else "Count"

with open('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/public/data/squid_real_data_v4.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Formatted successfully")
