const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const squidJigging = [
  { name: '동일 5', company: '경태', callSign: 'N/A', tonnage: 338.00, length: 61.11, launchDate: '1991-11-05', area: '태, 대', purpose: '오징어채낚기' },
  { name: '해랑 101', company: '동신어업', callSign: 'N/A', tonnage: 454.00, length: 50.55, launchDate: '1987-10-01', area: '태, 대', purpose: '오징어채낚기' },
  { name: '통영 808', company: '동원해사랑', callSign: 'N/A', tonnage: 316.00, length: 60.49, launchDate: '1986-10-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '은해 101', company: '선민수산', callSign: 'N/A', tonnage: 499.00, length: 51.69, launchDate: '1979-06-13', area: '태, 대', purpose: '오징어채낚기' },
  { name: '은해 107', company: '선민수산', callSign: 'N/A', tonnage: 362.00, length: 62.64, launchDate: '1987-08-12', area: '태, 대', purpose: '오징어채낚기' },
  { name: '은해 109', company: '선민수산', callSign: 'N/A', tonnage: 313.00, length: 60.17, launchDate: '1986-09-28', area: '태, 대', purpose: '오징어채낚기' },
  { name: '801 승진', company: '승진수산', callSign: 'N/A', tonnage: 499.00, length: 66.36, launchDate: '2020-08-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '7 대양', company: '신해피셔리', callSign: 'N/A', tonnage: 490.00, length: 49.00, launchDate: '1974-07-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 101', company: '아그네스수산', callSign: 'N/A', tonnage: 338.00, length: 61.59, launchDate: '1991-06-01', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 102', company: '아그네스수산', callSign: 'N/A', tonnage: 499.37, length: 51.45, launchDate: '1974-11-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 103', company: '아그네스수산', callSign: 'N/A', tonnage: 498.59, length: 51.45, launchDate: '1974-02-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 107', company: '아그네스수산', callSign: 'N/A', tonnage: 485.00, length: 50.23, launchDate: '1984-06-16', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 108', company: '아그네스수산', callSign: 'N/A', tonnage: 485.00, length: 50.23, launchDate: '1984-09-24', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 110', company: '아그네스수산', callSign: 'N/A', tonnage: 499.00, length: 66.36, launchDate: '2020-07-17', area: '태, 대', purpose: '오징어채낚기' },
  { name: '세인 5', company: '정일산업', callSign: 'N/A', tonnage: 359.00, length: 63.70, launchDate: '1987-11-01', area: '태, 대', purpose: '오징어채낚기' },
  { name: '세인 7', company: '정일산업', callSign: 'N/A', tonnage: 539.00, length: 53.93, launchDate: '1990-11-22', area: '태, 대', purpose: '오징어채낚기' },
  { name: '세인 9', company: '정일산업', callSign: 'N/A', tonnage: 661.00, length: 55.02, launchDate: '1988-10-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '아그네스 109', company: '정일산업', callSign: 'N/A', tonnage: 437.87, length: 49.68, launchDate: '1973-12-15', area: '태, 대', purpose: '오징어채낚기' },
  { name: '해인 27', company: '해인수산', callSign: 'N/A', tonnage: 361.00, length: 63.99, launchDate: '1987-08-01', area: '태, 대', purpose: '오징어채낚기' },
  { name: '은해 108', company: '현원수산', callSign: 'N/A', tonnage: 361.00, length: 59.12, launchDate: '1987-08-01', area: '태, 대', purpose: '오징어채낚기' }
];

data['오징어 (원양채낚기)'] = squidJigging;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated Squid Jigging vessels successfully.');
