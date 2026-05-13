const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');

let stack = [];
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  // naive check skipping strings might be needed, but let's try basic stack
  if (char === '(' || char === '{' || char === '[') {
    stack.push({ char, pos: i });
  } else if (char === ')' || char === '}' || char === ']') {
    if (stack.length === 0) {
      console.log('Unmatched closing', char, 'at', i);
    } else {
      const last = stack.pop();
      if ((char === ')' && last.char !== '(') ||
          (char === '}' && last.char !== '{') ||
          (char === ']' && last.char !== '[')) {
        console.log('Mismatched closure at', i, 'expected matching for', last.char, 'got', char);
      }
    }
  }
}
if (stack.length > 0) {
    stack.forEach(s => {
        const line = content.substring(0, s.pos).split('\n').length;
        console.log('Unclosed', s.char, 'at line', line);
    });
}
