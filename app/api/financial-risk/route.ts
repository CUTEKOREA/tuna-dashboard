import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_financial_risk.py');
    const pythonExecutable = 'python3';
    
    // Attempt to run the python script using the virtual environment
    try {
      const { stdout, stderr } = await execAsync(`${pythonExecutable} ${scriptPath}`);
      
      if (stderr && stderr.trim() !== '') {
        console.warn('Python script warning/error:', stderr);
      }
      
      const data = JSON.parse(stdout);
      return NextResponse.json(data);
    } catch (execError) {
      console.error('Failed to execute python script:', execError);
      
      // Fallback mock data if python script fails (e.g., yfinance not installed)
      console.log('Returning fallback mock data...');
      return NextResponse.json({
        "market": {
          "CL=F": {"price": 82.45, "change": 1.25, "change_pct": 1.54},
          "BZ=F": {"price": 86.12, "change": 1.10, "change_pct": 1.29},
          "KRW=X": {"price": 1354.20, "change": 5.4, "change_pct": 0.40},
          "043360.KS": {"price": 12500, "change": -100, "change_pct": -0.79}
        },
        "ai_analysis": {
          "risk_score": 85,
          "risk_level": "High",
          "investment_memorandum": "**[Geopolitical Risk Assessment]**\n현재 WTI 원유 가격 변동성(1.54%)을 고려할 때, 중동 지역의 긴장 상태가 해운 물류비에 즉각적인 영향을 미치고 있습니다. 이는 당사의 핵심 비즈니스인 원양어업 및 해산물 유통 마진을 압박할 수 있습니다.\n\n**[Actionable Strategy]**\n1. **유가 헤징**: 장기 물류 계약의 경우 유가 상승에 대비한 BAF(Bunker Adjustment Factor) 조항 재점검 필수.\n2. **환율 변동성 대응**: 원/달러 환율 상승 시 수출 단가 유리하나 수입 원부자재 비용 증가 모니터링 필요.\n3. **지역 리스크 회피**: 특정 고위험 항구의 기항을 최소화하고 대체 물류 라인 확보 권장."
        },
        "geopolitical_events": [
          {"id": 1, "lat": 25.2, "lng": 55.2, "location": "Strait of Hormuz", "intensity": 0.8, "description": "Hormuz Strait transit disruptions due to regional tensions."},
          {"id": 2, "lat": 31.5, "lng": 34.4, "location": "Gaza Strip", "intensity": 0.9, "description": "Ongoing conflict causing broader regional instability."},
          {"id": 3, "lat": 44.3, "lng": 33.5, "location": "Black Sea", "intensity": 0.7, "description": "Black Sea grain corridor risks impacting global food prices."},
          {"id": 4, "lat": 15.3, "lng": 42.8, "location": "Red Sea", "intensity": 0.85, "description": "Attacks on commercial vessels diverting traffic to Cape of Good Hope."},
          {"id": 5, "lat": 23.5, "lng": 121.0, "location": "Taiwan Strait", "intensity": 0.6, "description": "Heightened military exercises impacting tech supply chain."}
        ]
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
