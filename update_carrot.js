const fs = require('fs');
const file = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/CarrotDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Chart heights
content = content.replace(/height:\s*['"](?:250|260|280|300)px['"]/g, "height:'375px'");

// 2. Legend
content = content.replace(/<Legend wrapperStyle=\{\{fontSize:'10px'\}\} \/>/g, '<Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:\'10px\'}} />');

// 3. Pillar Titles
content = content.replace(/🌱 Part I — 원물 생산 \(Raw Material\)/g, "🌱 제1지주: 원물 생산");
content = content.replace(/🏭 Part II — 가공 산업 \(Processing\)/g, "🏭 제2지주: 가공 산업");
content = content.replace(/🚢 Part III — 물류 및 무역 \(Logistics\)/g, "🚢 제3지주: 물류 및 무역");
content = content.replace(/🛒 Part IV — 판매 및 수요 \(Sales & Demand\)/g, "🛒 제4지주: 판매 및 수요");
content = content.replace(/🌍 Part V — ESG 및 미래 농업 \(Sustainability\)/g, "🌍 제5지주: ESG 및 미래 농업");
content = content.replace(/Executive Strategy Command/g, "경영진 전략 지휘소");
content = content.replace(/Data Intelligence Upgrade — OEC · KAMIS · FAOSTAT SCL 실측 통합/g, "데이터 인텔리전스 고도화: OEC · KAMIS · FAOSTAT SCL 실측 통합");

// 4. Update Header Title and subtitle
content = content.replace(/Carrot Strategic Command Center — 32 Widgets/g, "당근 전략 지휘소 — 32개 위젯");

fs.writeFileSync(file, content);
console.log('Done updating basic styling and texts.');
