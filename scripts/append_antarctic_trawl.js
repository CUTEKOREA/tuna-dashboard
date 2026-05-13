const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const antarcticTrawl = [
  { name: '세종', company: '동원산업', callSign: 'N/A', tonnage: 7765.00, length: 110.22, launchDate: '1990-11-01', area: '태, 남', purpose: '남빙양트롤' }
];

data['남빙양트롤'] = antarcticTrawl;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Appended Antarctic Trawl vessels successfully.');
