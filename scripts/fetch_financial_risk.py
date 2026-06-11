import yfinance as yf
import json
import sys

def fetch_financial_data():
    try:
        # Tickers: WTI Crude Oil, Brent Crude, USD/KRW, Silla Co.
        tickers = ['CL=F', 'BZ=F', 'KRW=X', '043360.KS']
        data = yf.download(tickers, period='1d', progress=False)
        
        result = {}
        for ticker in tickers:
            try:
                # Use iloc[-1] to get the most recent data point
                latest_close = data['Close'][ticker].iloc[-1]
                # If we have previous close, calculate change
                if len(data['Close'][ticker]) >= 2:
                    prev_close = data['Close'][ticker].iloc[-2]
                else:
                    prev_close = data['Open'][ticker].iloc[-1]
                    
                change = latest_close - prev_close
                change_pct = (change / prev_close) * 100 if prev_close else 0
                
                result[ticker] = {
                    'price': round(float(latest_close), 2),
                    'change': round(float(change), 2),
                    'change_pct': round(float(change_pct), 2)
                }
            except Exception as e:
                result[ticker] = {'error': str(e)}
                
        return result
    except Exception as e:
        return {'error': str(e)}

def generate_rule_based_analysis(market_data):
    # Rule-based risk memo derived from WTI change_pct thresholds.
    # NOT an LLM output (honest labeling — ex-'generate_mock_gemini_analysis').
    wti_pct = market_data.get('CL=F', {}).get('change_pct', 0)

    risk_level = "High" if wti_pct > 2 else ("Medium" if wti_pct > 0 else "Low")
    risk_score = 85 if risk_level == "High" else (60 if risk_level == "Medium" else 30)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "investment_memorandum": f"**[지정학 리스크 평가]**\n현재 WTI 원유 가격 변동성({wti_pct}%)을 고려할 때, 중동 지역의 긴장 상태가 해운 물류비에 즉각적인 영향을 미칠 수 있습니다. 이는 당사의 핵심 비즈니스인 원양어업 및 해산물 유통 마진을 압박할 수 있습니다.\n\n**[실행 전략]**\n1. **유가 헤징**: 장기 물류 계약의 경우 유가 상승에 대비한 BAF(유류할증료 조정) 조항 재점검 필수.\n2. **환율 변동성 대응**: 원/달러 환율 상승 시 수출 단가 유리하나 수입 원부자재 비용 증가 모니터링 필요.\n3. **지역 리스크 회피**: 특정 고위험 항구의 기항을 최소화하고 대체 물류 라인 확보 권장."
    }

def main():
    market_data = fetch_financial_data()
    rule_based_analysis = generate_rule_based_analysis(market_data)

    output = {
        "market": market_data,
        "ai_analysis": rule_based_analysis,
        # Curated static event list (not a live feed) — rendered on the globe
        "geopolitical_events": [
            {"id": 1, "lat": 25.2, "lng": 55.2, "location": "호르무즈 해협", "intensity": 0.8, "description": "역내 긴장 고조로 호르무즈 해협 통항 차질 우려."},
            {"id": 2, "lat": 31.5, "lng": 34.4, "location": "가자 지구", "intensity": 0.9, "description": "분쟁 지속으로 역내 불안정 확산."},
            {"id": 3, "lat": 44.3, "lng": 33.5, "location": "흑해", "intensity": 0.7, "description": "흑해 곡물 회랑 리스크가 글로벌 식량 가격에 영향."},
            {"id": 4, "lat": 15.3, "lng": 42.8, "location": "홍해", "intensity": 0.85, "description": "상선 공격으로 희망봉 우회 항로 전환 확대."},
            {"id": 5, "lat": 23.5, "lng": 121.0, "location": "대만 해협", "intensity": 0.6, "description": "군사 훈련 격화로 기술 공급망 영향."}
        ]
    }
    
    # Print JSON to standard output so Next.js can parse it
    print(json.dumps(output))

if __name__ == "__main__":
    main()
