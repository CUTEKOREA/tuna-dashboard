const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const bottomLongline = [
  { name: '청용 81', company: '사조대림', callSign: 'N/A', tonnage: 497.00, length: 49.61, launchDate: '1989-04-24', area: '태평양', purpose: '저연승' },
  { name: '청용 83', company: '사조대림', callSign: 'N/A', tonnage: 423.00, length: 49.61, launchDate: '1989-05-11', area: '태평양', purpose: '저연승' },
  { name: '그린스타', company: '티엔에스산업', callSign: 'N/A', tonnage: 584.00, length: 51.01, launchDate: '1995-02-16', area: '대서양', purpose: '저연승' },
  { name: '서던오션', company: '홍진실업', callSign: 'N/A', tonnage: 684.00, length: 56.01, launchDate: '1997-10-25', area: '대서양', purpose: '저연승' }
];

data['저연승'] = bottomLongline;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated Bottom Longline vessels successfully.');
