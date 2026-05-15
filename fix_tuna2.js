const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.startsWith('Tuna') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Remove the block I inserted earlier
  content = content.replace(/const truncateXAxis = \(tick: any\) => \{\s*if \(typeof tick !== 'string'\) return tick;\s*const noEng = tick\.replace\(\/\\\\s\*\\\\(\[A-Za-z\\\\s\]\+\\\\)\/g, ''\);\s*return noEng\.length > 6 \? noEng\.substring\(0, 6\) \+ '\.\.\.' : noEng;\s*\};\s*/g, '');

  // But we need to insert it at the top level
  if (content.includes('truncateXAxis') && !content.includes('export const truncateXAxis')) {
    // Insert after the last import
    const truncateFunc = `\nexport const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\\s*\\([A-Za-z\\s]+\\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};\n\n`;
    
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + truncateFunc + content.slice(nextLineIndex + 1);
    } else {
        content = truncateFunc + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + file);
  }
}
