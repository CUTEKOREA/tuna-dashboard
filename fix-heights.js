const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components/WhelkDashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add height="100%" to all SafeResponsiveContainers
content = content.replace(/<SafeResponsiveContainer>/g, '<SafeResponsiveContainer height="100%">');

fs.writeFileSync(file, content);
console.log('Fixed SafeResponsiveContainer heights');
