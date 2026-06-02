const fs = require('fs');
const path = require('path');

const dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/sashimi-strategy';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Convert takeaway="string" to takeaway={{ ... }}
  content = content.replace(/takeaway="([^"]+)"/g, 'takeaway={{ situation: "$1", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}');

  // 2. Add takeaway prop if it's completely missing
  if (!content.includes('takeaway={')) {
    let insightText = "사시미/스테이크 시장 동향 모니터링";
    const insightMatch = content.match(/<strong>인사이트:<\/strong>\s*([^<]+)/);
    if (insightMatch) {
      insightText = insightMatch[1].trim();
    }
    
    // Insert takeaway prop right after cardDesc
    content = content.replace(/(cardDesc="[^"]+")/, '$1\n      takeaway={{ situation: "' + insightText + '", actionPlan: "시장 변화에 따른 전략적 대응", source: "Sashimi Market Report 2025" }}');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Fixed missing and incorrectly formatted takeaway props.');
