const fs = require('fs');
const path = require('path');

const dirs = ['data', 'components', 'app'];
const extRegex = /\.(json|tsx?)$/;

// The regex matches:
// 1. "💡 작동 원리:" or "💡작동 원리:" with optional trailing space
// 2. "작동 원리:" with optional trailing space
// 3. "위젯 설명:" with optional trailing space
// 4. "💡 " or "💡" 
const replaceRegex = /(💡\s*작동 원리:\s*|작동 원리:\s*|위젯 설명:\s*|💡\s*)/g;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (extRegex.test(file)) {
        results.push(file);
      }
    }
  });
  return results;
}

let changedCount = 0;

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walk(dir);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (replaceRegex.test(content)) {
        const newContent = content.replace(replaceRegex, '');
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Cleaned:', file);
        changedCount++;
      }
    });
  }
});

console.log(`Total files cleaned: ${changedCount}`);
