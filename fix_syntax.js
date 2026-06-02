const fs = require('fs');
const path = require('path');

const dir = '/Users/idong-geon/연구자동화애이전트들/tuna-dashboard/components/sashimi-strategy';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the broken bracket syntax
  // Look for: telemetry={{ status: 'STATIC', syncDate: '2025-26' }
  //           cardDesc="사시미/스테이크 시장 동향"}
  content = content.replace(/telemetry=\{\{ status: 'STATIC', syncDate: '2025-26' \}\n\s*cardDesc="([^"]+)"\}/g, 
    'telemetry={{ status: \'STATIC\', syncDate: \'2025-26\' }}\n      cardDesc="$1"');

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Fixed syntax in files');
