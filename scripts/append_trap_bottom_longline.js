const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const trapBottomLongline = [
  { name: '썬스타', company: '티엔에스산업', callSign: 'N/A', tonnage: 628.00, length: 51.91, launchDate: '2001-08-15', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '킹스타', company: '티엔에스산업', callSign: 'N/A', tonnage: 573.00, length: 51.01, launchDate: '1989-10-20', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '블루오션', company: '티엔에스산업', callSign: 'N/A', tonnage: 836.00, length: 57.07, launchDate: '2002-05-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '리무스', company: '신지수산', callSign: 'N/A', tonnage: 60.00, length: 20.40, launchDate: '1980-03-07', area: '태평양', purpose: '통발저연승겸업' },
  { name: '세인마스터', company: '정일산업', callSign: 'N/A', tonnage: 534.00, length: 51.95, launchDate: '2001-06-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '세인파이오니아', company: '정일산업', callSign: 'N/A', tonnage: 628.00, length: 50.75, launchDate: '1989-03-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '세인빅터', company: '정일산업', callSign: 'N/A', tonnage: 495.00, length: 46.50, launchDate: '2001-07-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '홍진701', company: '홍진실업', callSign: 'N/A', tonnage: 694.00, length: 53.40, launchDate: '1990-09-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' },
  { name: '홍진707', company: '홍진실업', callSign: 'N/A', tonnage: 587.00, length: 50.77, launchDate: '1986-06-01', area: '대서양, 남빙양', purpose: '통발저연승겸업' }
];

data['통발저연승겸업'] = trapBottomLongline;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated Trap/Bottom Longline vessels successfully.');
