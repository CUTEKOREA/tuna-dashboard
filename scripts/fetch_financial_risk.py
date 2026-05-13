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

def generate_mock_gemini_analysis(market_data):
    # Simulated Gemini 3 Pro analysis
    wti_pct = market_data.get('CL=F', {}).get('change_pct', 0)
    
    risk_level = "High" if wti_pct > 2 else ("Medium" if wti_pct > 0 else "Low")
    risk_score = 85 if risk_level == "High" else (60 if risk_level == "Medium" else 30)
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "investment_memorandum": f"**[Geopolitical Risk Assessment]**\n현재 WTI 원유 가격 변동성({wti_pct}%)을 고려할 때, 중동 지역의 긴장 상태가 해운 물류비에 즉각적인 영향을 미치고 있습니다. 이는 당사의 핵심 비즈니스인 원양어업 및 해산물 유통 마진을 압박할 수 있습니다.\n\n**[Actionable Strategy]**\n1. **유가 헤징**: 장기 물류 계약의 경우 유가 상승에 대비한 BAF(Bunker Adjustment Factor) 조항 재점검 필수.\n2. **환율 변동성 대응**: 원/달러 환율 상승 시 수출 단가 유리하나 수입 원부자재 비용 증가 모니터링 필요.\n3. **지역 리스크 회피**: 특정 고위험 항구의 기항을 최소화하고 대체 물류 라인 확보 권장."
    }

def main():
    market_data = fetch_financial_data()
    gemini_analysis = generate_mock_gemini_analysis(market_data)
    
    output = {
        "market": market_data,
        "ai_analysis": gemini_analysis,
        "geopolitical_events": [
            {"id": 1, "lat": 25.2, "lng": 55.2, "location": "Strait of Hormuz", "intensity": 0.8, "description": "Hormuz Strait transit disruptions due to regional tensions."},
            {"id": 2, "lat": 31.5, "lng": 34.4, "location": "Gaza Strip", "intensity": 0.9, "description": "Ongoing conflict causing broader regional instability."},
            {"id": 3, "lat": 44.3, "lng": 33.5, "location": "Black Sea", "intensity": 0.7, "description": "Black Sea grain corridor risks impacting global food prices."},
            {"id": 4, "lat": 15.3, "lng": 42.8, "location": "Red Sea", "intensity": 0.85, "description": "Attacks on commercial vessels diverting traffic to Cape of Good Hope."},
            {"id": 5, "lat": 23.5, "lng": 121.0, "location": "Taiwan Strait", "intensity": 0.6, "description": "Heightened military exercises impacting tech supply chain."}
        ]
    }
    
    # Print JSON to standard output so Next.js can parse it
    print(json.dumps(output))

if __name__ == "__main__":
    main()
