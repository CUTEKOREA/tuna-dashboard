const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const tunaPurseSeine = [
  { name: '디올린다', company: '동원산업', callSign: 'N/A', tonnage: 606.00, length: 61.63, launchDate: '1982-01-15', area: '삼대양', purpose: '참치선망' },
  { name: '미래로', company: '동원산업', callSign: 'N/A', tonnage: 1826.00, length: 70.80, launchDate: '2014-02-28', area: '삼대양', purpose: '참치선망' },
  { name: '바스코', company: '동원산업', callSign: 'N/A', tonnage: 986.00, length: 67.37, launchDate: '1991-12-12', area: '삼대양', purpose: '참치선망' },
  { name: '본아미', company: '동원산업', callSign: 'N/A', tonnage: 1862.00, length: 73.02, launchDate: '2019-06-05', area: '삼대양', purpose: '참치선망' },
  { name: '블루오션', company: '동원산업', callSign: 'N/A', tonnage: 2023.00, length: 74.51, launchDate: '2008-01-31', area: '삼대양', purpose: '참치선망' },
  { name: '세계로', company: '동원산업', callSign: 'N/A', tonnage: 1826.00, length: 70.80, launchDate: '2013-12-22', area: '삼대양', purpose: '참치선망' },
  { name: '아드리아', company: '동원산업', callSign: 'N/A', tonnage: 1072.00, length: 70.66, launchDate: '1992-10-15', area: '삼대양', purpose: '참치선망' },
  { name: '오션마스타', company: '동원산업', callSign: 'N/A', tonnage: 1349.20, length: 68.29, launchDate: '1989-06-17', area: '삼대양', purpose: '참치선망' },
  { name: '오션에이스', company: '동원산업', callSign: 'N/A', tonnage: 1994.00, length: 74.37, launchDate: '2006-01-25', area: '삼대양', purpose: '참치선망' },
  { name: '장보고', company: '동원산업', callSign: 'N/A', tonnage: 2009.00, length: 74.39, launchDate: '2008-07-03', area: '삼대양', purpose: '참치선망' },
  { name: '주빌리', company: '동원산업', callSign: 'N/A', tonnage: 1862.00, length: 72.02, launchDate: '2019-03-22', area: '삼대양', purpose: '참치선망' },
  { name: '코스모스김', company: '동원산업', callSign: 'N/A', tonnage: 733.00, length: 61.67, launchDate: '1981-10-15', area: '삼대양', purpose: '참치선망' },
  { name: '테라카', company: '동원산업', callSign: 'N/A', tonnage: 1811.00, length: 70.80, launchDate: '2015-07-03', area: '삼대양', purpose: '참치선망' },
  { name: '한아라', company: '동원산업', callSign: 'N/A', tonnage: 1811.00, length: 70.80, launchDate: '2015-08-12', area: '삼대양', purpose: '참치선망' },
  { name: '사조알렉산드리아', company: '사조산업', callSign: 'N/A', tonnage: 1016.00, length: 70.76, launchDate: '2013-11-04', area: '삼대양', purpose: '참치선망' },
  { name: '사조콘코디아', company: '사조산업', callSign: 'N/A', tonnage: 1105.00, length: 73.54, launchDate: '2014-10-27', area: '삼대양', purpose: '참치선망' },
  { name: '사조콜롬비아', company: '사조산업', callSign: 'N/A', tonnage: 1014.00, length: 70.76, launchDate: '2012-04-30', area: '삼대양', purpose: '참치선망' },
  { name: '사조패밀리아', company: '사조산업', callSign: 'N/A', tonnage: 1014.00, length: 70.76, launchDate: '2012-09-06', area: '삼대양', purpose: '참치선망' },
  { name: '사조테티시아', company: '사조산업', callSign: 'N/A', tonnage: 777.00, length: 56.56, launchDate: '1996-05-02', area: '삼대양', purpose: '참치선망' },
  { name: '사조포텐시아', company: '사조씨푸드', callSign: 'N/A', tonnage: 1061.00, length: 63.08, launchDate: '2010-01-20', area: '삼대양', purpose: '참치선망' },
  { name: '사조포세도니아', company: '사조오양', callSign: 'N/A', tonnage: 1016.00, length: 70.76, launchDate: '2013-10-05', area: '삼대양', purpose: '참치선망' },
  { name: '신라스프린터', company: '신라교역', callSign: 'N/A', tonnage: 1971.00, length: 73.82, launchDate: '2011-12-27', area: '삼대양', purpose: '참치선망' },
  { name: '신라익스플로러', company: '신라교역', callSign: 'N/A', tonnage: 2060.00, length: 73.54, launchDate: '2014-10-14', area: '삼대양', purpose: '참치선망' },
  { name: '신라쥬피터', company: '신라교역', callSign: 'N/A', tonnage: 780.00, length: 69.55, launchDate: '2001-04-01', area: '삼대양', purpose: '참치선망' },
  { name: '신라챌린저', company: '신라교역', callSign: 'N/A', tonnage: 1349.20, length: 68.29, launchDate: '1990-03-10', area: '삼대양', purpose: '참치선망' },
  { name: '신라파이어니어', company: '신라교역', callSign: 'N/A', tonnage: 2060.00, length: 73.54, launchDate: '2014-10-31', area: '삼대양', purpose: '참치선망' },
  { name: '신라하비스터', company: '신라교역', callSign: 'N/A', tonnage: 1971.00, length: 73.82, launchDate: '2011-07-19', area: '삼대양', purpose: '참치선망' }
];

data['참치 (원양선망)'] = tunaPurseSeine;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated Tuna Purse Seine vessels successfully.');
