const fs = require('fs');

const content = fs.readFileSync('/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/TunaRanching.tsx', 'utf-8');

// Function to find the start and end of a div block
function extractBlock(startMarker, stopMarker, includeStartLine = true) {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) throw new Error("Could not find start marker: " + startMarker);
    
    // Find the end marker
    let endIndex;
    if (stopMarker) {
        endIndex = content.indexOf(stopMarker, startIndex);
        if (endIndex === -1) throw new Error("Could not find stop marker: " + stopMarker);
    } else {
        // Assume end of file
        endIndex = content.length;
    }
    
    return content.substring(startIndex, endIndex);
}

// 1. Asia Shift
const asiaShift = extractBlock('{/* 아시아 마켓 시프트 위젯 */}', '{/* 양식 vs 어획 패러다임 역전 (Aquaculture Value Premium) */}');

// 2. Aqua Prem + Gastronomy (we can split them or keep them)
// Let's find exactly where Aqua Prem starts:
const aquaPremStr = '<TrendingUp size={20} color="#f472b6"/> 양식 vs 어획 패러다임 역전 (Aquaculture Value Premium)';
const aquaPremIdx = content.indexOf(aquaPremStr);
const aquaPremStart = content.lastIndexOf('<div className={insightsStyles.insightCard}>', aquaPremIdx);

const gastronomyStr = '<Utensils size={20} color="#a855f7"/> Gastronomy 트렌드: 가공 참치의 진화';
const gastronomyIdx = content.indexOf(gastronomyStr);
const gastronomyStart = content.lastIndexOf('<div className={insightsStyles.insightCard}>', gastronomyIdx);

const arbitrageMarker = '{/* 글로벌 차익거래 레이더 (Arbitrage Radar) */}';
const arbitrageMarkerIdx = content.indexOf(arbitrageMarker);

const aquaPrem = content.substring(aquaPremStart, gastronomyStart);
const gastronomy = content.substring(gastronomyStart, arbitrageMarkerIdx);

// Now inside Arbitrage Radar
const arbitrageStart = content.indexOf('{arbitrageRadar && (');
if (arbitrageStart === -1) throw new Error("Missing arbitrageRadar");

// Arbitrage (Widget 1 in Radar)
const arbitrageWidgetStart = content.indexOf('<div className={insightsStyles.insightCard} style={{ gridColumn: \'1 / -1\', background: \'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))\', border: \'1px solid rgba(16,185,129,0.3)\' }}>');
const saudiStr = '<Thermometer size={20} color="var(--color-success)" /> 사우디아라비아 콜드체인 시장 성장 전망';
const saudiIdx = content.indexOf(saudiStr);
const saudiStart = content.lastIndexOf('<div className={insightsStyles.insightCard}>', saudiIdx);

const arbitrageWidget = content.substring(arbitrageWidgetStart, content.lastIndexOf('</div>', saudiStart - 1) + 6); // roughly...
// Wait, string search might be brittle.
