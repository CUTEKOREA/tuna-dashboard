const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const atlanticTrawl = [
  { name: '슐에스테 701', company: '동남', callSign: 'N/A', tonnage: 1612.00, length: 62.20, launchDate: '2023-06-05', area: '대서양', purpose: '대서양트롤' },
  { name: '오양 77', company: '사조오양', callSign: 'N/A', tonnage: 899.12, length: 59.70, launchDate: '1974-08-31', area: '대서양', purpose: '대서양트롤' },
  { name: '오양 88', company: '사조오양', callSign: 'N/A', tonnage: 294.00, length: 52.37, launchDate: '1983-04-15', area: '대서양', purpose: '대서양트롤' },
  { name: '코세차', company: '선민수산', callSign: 'N/A', tonnage: 278.00, length: 52.10, launchDate: '1982-11-15', area: '대서양', purpose: '대서양트롤' },
  { name: '아그네스 3', company: '아그네스수산', callSign: 'N/A', tonnage: 327.00, length: 55.38, launchDate: '1979-11-21', area: '대서양', purpose: '대서양트롤' },
  { name: '아그네스 5', company: '아그네스수산', callSign: 'N/A', tonnage: 995.56, length: 60.74, launchDate: '1972-06-01', area: '대서양', purpose: '대서양트롤' },
  { name: '세인리더', company: '정일산업', callSign: 'N/A', tonnage: 3012.00, length: 85.26, launchDate: '1985-10-01', area: '대, 남', purpose: '대서양트롤' },
  { name: '세인챔피언', company: '정일산업', callSign: 'N/A', tonnage: 2999.12, length: 88.94, launchDate: '1970-10-15', area: '대, 남', purpose: '대서양트롤' },
  { name: '프라티디나 28', company: '코삭교역', callSign: 'N/A', tonnage: 664.00, length: 53.03, launchDate: '1986-01-01', area: '대서양', purpose: '대서양트롤' },
  { name: '슐에스테 703', company: '참손푸드', callSign: 'N/A', tonnage: 1612.00, length: 62.20, launchDate: '1983-08-10', area: '대서양', purpose: '대서양트롤' },
  { name: '슐에스테 707', company: '참손푸드', callSign: 'N/A', tonnage: 276.00, length: 52.35, launchDate: '1983-08-10', area: '대서양', purpose: '대서양트롤' }
];

data['대서양트롤'] = atlanticTrawl;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Appended Atlantic Trawl vessels successfully.');
