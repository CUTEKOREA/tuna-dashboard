const fs = require('fs');

const routeContent = fs.readFileSync('app/api/tuna/route.ts', 'utf8');
const jsonContent = fs.readFileSync('public/data/tuna_real_data_v3.json', 'utf8');

const data = JSON.parse(jsonContent);

const dashboardContent = fs.readFileSync('components/TunaDashboard.tsx', 'utf8');
const usedIds = new Set();
const matches = dashboardContent.matchAll(/'(w\d+_[^']+)'/g);
for (const match of matches) {
  usedIds.add(match[1]);
}

const widgets = data.widgets.filter(w => usedIds.has(w.id));

// Also check route.ts
const routeMatches = routeContent.match(/id:\s*'w01_paradigm'[\s\S]*?title:\s*'([^']+)'[\s\S]*?id:\s*'w02_bluefin'[\s\S]*?title:\s*'([^']+)'/);

const all = widgets.map(w => ({ id: w.id, title: w.title }));
if (routeMatches) {
  const w1 = all.find(w => w.id === 'w01_paradigm');
  if (w1) w1.title = routeMatches[1];
  const w2 = all.find(w => w.id === 'w02_bluefin');
  if (w2) w2.title = routeMatches[2];
}

console.log(JSON.stringify(all, null, 2));
