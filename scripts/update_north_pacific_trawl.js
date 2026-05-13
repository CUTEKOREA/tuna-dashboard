const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const northPacificTrawl = [
  { name: '남 북', company: '남북수산', callSign: 'N/A', tonnage: 5549.02, length: 104.30, launchDate: '1974-03-28', area: '태평양', purpose: '북양트롤' },
  { name: '오양 99', company: '사조오양', callSign: 'N/A', tonnage: 1703.00, length: 75.99, launchDate: '1977-01-01', area: '태평양', purpose: '북양트롤' },
  { name: '준 성', company: '한성기업', callSign: 'N/A', tonnage: 2866.00, length: 84.91, launchDate: '1972-12-01', area: '태평양', purpose: '북양트롤' }
];

data['명태 (북양트롤)'] = northPacificTrawl;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated North Pacific Trawl vessels successfully.');
