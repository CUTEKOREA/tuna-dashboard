const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

const sauryVessels = [
  { name: '금양 103', company: '가나마린', callSign: 'N/A', tonnage: 380.00, length: 62.24, launchDate: '1988-01-01', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '동일 7', company: '경태', callSign: 'N/A', tonnage: 371.00, length: 61.53, launchDate: '1989-01-01', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '동일 7', company: '경태', callSign: 'N/A', tonnage: 371.00, length: 61.53, launchDate: '1978-12-15', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '바다 103', company: '동원해사랑', callSign: 'N/A', tonnage: 356.00, length: 64.03, launchDate: '1987-07-28', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '통영 803', company: '동원해사랑', callSign: 'N/A', tonnage: 441.00, length: 49.91, launchDate: '1986-07-12', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '통영 805', company: '동원해사랑', callSign: 'N/A', tonnage: 499.00, length: 66.36, launchDate: '2021-08-27', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '은해 91', company: '선민수산', callSign: 'N/A', tonnage: 447.00, length: 51.96, launchDate: '1975-11-15', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '성경 517', company: '성경수산', callSign: 'N/A', tonnage: 281.00, length: 54.62, launchDate: '1989-03-01', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '스카이맥스101', company: '씨맥스피셔리', callSign: 'N/A', tonnage: 1037.00, length: 65.24, launchDate: '2012-01-01', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '태백 91', company: '예람교역', callSign: 'N/A', tonnage: 495.00, length: 51.73, launchDate: '1988-08-02', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '금양 102', company: '원양물산', callSign: 'N/A', tonnage: 544.00, length: 51.73, launchDate: '1990-12-13', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '세인 1', company: '정일산업', callSign: 'N/A', tonnage: 539.00, length: 53.40, launchDate: '1990-07-15', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '세인 3', company: '정일산업', callSign: 'N/A', tonnage: 355.00, length: 63.89, launchDate: '1987-08-25', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '창진 302', company: '창진교역', callSign: 'N/A', tonnage: 427.00, length: 51.20, launchDate: '1974-09-15', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '601 다가', company: '피에이아이', callSign: 'N/A', tonnage: 314.00, length: 61.28, launchDate: '1986-12-02', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '삼영 301', company: '피에이아이', callSign: 'N/A', tonnage: 454.00, length: 50.10, launchDate: '1986-09-06', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '드림 파크', company: '홍진실업', callSign: 'N/A', tonnage: 499.00, length: 66.36, launchDate: '2021-08-11', area: '태, 대', purpose: '꽁치봉수망' },
  { name: '씨엠 파크', company: '홍진실업', callSign: 'N/A', tonnage: 499.00, length: 66.36, launchDate: '2021-08-11', area: '태, 대', purpose: '꽁치봉수망' },
];

data['꽁치봉수망 (오징어꽁치겸업)'] = sauryVessels;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Appended detailed Saury vessels successfully.');
