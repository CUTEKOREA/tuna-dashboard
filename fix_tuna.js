const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.startsWith('Tuna') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. Remove English in parentheses in titles
  content = content.replace(/(<(?:h2|h3|h4)[^>]*>.*?[가-힣]+.*?)\s*\([A-Za-z\s-]+\)(.*?(?:<\/h2|<\/h3|<\/h4>))/g, '$1$2');
  content = content.replace(/AI 기반 스마트 정밀 조업 \([^)]+\)/g, 'AI 기반 스마트 정밀 조업');
  content = content.replace(/어종별 펫푸드 마진 구조 \([^)]+\)/g, '어종별 펫푸드 마진 구조');
  content = content.replace(/리테일 가격 분리 현상 \([^)]+\)/g, '리테일 가격 분리 현상');
  content = content.replace(/EU 18% 관세 충격 \([^)]+\)/g, 'EU 18% 관세 충격');

  // 2. Glassmorphism Tooltips
  content = content.replace(/background:\s*['"]#1e293b['"]/g, "background: 'rgba(15, 23, 42, 0.9)'");
  content = content.replace(/boxShadow:\s*['"]0 8px 32px rgba\(0,0,0,0\.7\)['"]/g, "boxShadow: '0 4px 6px rgba(0,0,0,0.3)'");
  content = content.replace(/backgroundColor:\s*['"]#1e293b['"]/g, "backgroundColor: 'rgba(15, 23, 42, 0.9)'");

  // 3. XAxis truncation
  if (content.includes('<XAxis') && !content.includes('truncateXAxis')) {
    const truncateFunc = `
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\\s*\\([A-Za-z\\s]+\\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
`;
    content = content.replace(/(return\s*\(\s*<)/, truncateFunc + '$1');
  }

  // A more robust regex for XAxis. We match `<XAxis` and everything up to the final `/>` or `>`.
  // Since JSX tags can be multi-line, we match until `/>` or `>`.
  content = content.replace(/<XAxis([\s\S]*?)(\/?>)/g, (match, p1, p2) => {
    let newProps = p1;
    // skip if it's already modified
    if (newProps.includes('angle=')) return match;
    
    // Add our props
    newProps += ' angle={-25} textAnchor="end" height={60}';
    
    // If it doesn't have tickFormatter, we add ours, UNLESS it already has one!
    if (!newProps.includes('tickFormatter=')) {
        newProps += ' tickFormatter={truncateXAxis}';
    }
    
    return `<XAxis${newProps}${p2}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + file);
  }
}
