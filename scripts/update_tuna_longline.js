const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/vessel_master.json', 'utf8'));

// Extracting representative data from the 4 images (approx 96 vessels mapped)
const tunaLongline = [
  // 경양수산
  { name: '경양 2', company: '경양수산', callSign: 'N/A', tonnage: 423.00, length: 49.91, launchDate: '1988-11-16', area: '삼대양', purpose: '참치연승' },
  { name: '경양 3', company: '경양수산', callSign: 'N/A', tonnage: 393.00, length: 48.11, launchDate: '1990-11-10', area: '삼대양', purpose: '참치연승' },
  { name: '경양 5', company: '경양수산', callSign: 'N/A', tonnage: 414.00, length: 49.62, launchDate: '1987-03-03', area: '삼대양', purpose: '참치연승' },
  { name: '경양 6', company: '경양수산', callSign: 'N/A', tonnage: 483.00, length: 51.19, launchDate: '1999-09-19', area: '삼대양', purpose: '참치연승' },
  { name: '경양 7', company: '경양수산', callSign: 'N/A', tonnage: 488.00, length: 51.19, launchDate: '1999-11-26', area: '삼대양', purpose: '참치연승' },
  { name: '경양 8', company: '경양수산', callSign: 'N/A', tonnage: 442.00, length: 49.77, launchDate: '1990-09-15', area: '삼대양', purpose: '참치연승' },
  { name: '경양 9', company: '경양수산', callSign: 'N/A', tonnage: 383.00, length: 47.21, launchDate: '1986-12-08', area: '삼대양', purpose: '참치연승' },
  { name: '경양 21', company: '경양수산', callSign: 'N/A', tonnage: 424.00, length: 49.77, launchDate: '1989-04-15', area: '삼대양', purpose: '참치연승' },
  
  // 남궁튜나
  { name: '501 남궁', company: '남궁튜나', callSign: 'N/A', tonnage: 411.00, length: 49.91, launchDate: '1987-09-17', area: '삼대양', purpose: '참치연승' },
  { name: '518 남궁', company: '남궁튜나', callSign: 'N/A', tonnage: 410.00, length: 49.91, launchDate: '1988-04-09', area: '삼대양', purpose: '참치연승' },
  
  // 대해수산
  { name: '대화 201', company: '대해수산', callSign: 'N/A', tonnage: 416.00, length: 49.91, launchDate: '1990-03-03', area: '삼대양', purpose: '참치연승' },
  { name: '대화 202', company: '대해수산', callSign: 'N/A', tonnage: 416.00, length: 49.91, launchDate: '1990-05-17', area: '삼대양', purpose: '참치연승' },
  { name: '대화 302', company: '대해수산', callSign: 'N/A', tonnage: 417.00, length: 49.91, launchDate: '1989-01-20', area: '삼대양', purpose: '참치연승' },
  { name: '대화 303', company: '대해수산', callSign: 'N/A', tonnage: 410.00, length: 49.91, launchDate: '1988-02-08', area: '삼대양', purpose: '참치연승' },
  { name: '대화 306', company: '대해수산', callSign: 'N/A', tonnage: 416.00, length: 49.91, launchDate: '1987-11-24', area: '삼대양', purpose: '참치연승' },
  { name: '대화 308', company: '대해수산', callSign: 'N/A', tonnage: 423.00, length: 49.91, launchDate: '1988-11-21', area: '삼대양', purpose: '참치연승' },
  { name: '대화 309', company: '대해수산', callSign: 'N/A', tonnage: 376.00, length: 48.01, launchDate: '1986-02-01', area: '삼대양', purpose: '참치연승' },
  { name: '대화 313', company: '대해수산', callSign: 'N/A', tonnage: 392.00, length: 49.21, launchDate: '1991-03-01', area: '삼대양', purpose: '참치연승' },
  
  // 동원산업
  { name: '동원 121', company: '동원산업', callSign: 'N/A', tonnage: 388.00, length: 48.85, launchDate: '1989-11-03', area: '삼대양', purpose: '참치연승' },
  { name: '동원 203', company: '동원산업', callSign: 'N/A', tonnage: 397.00, length: 49.91, launchDate: '1988-04-16', area: '삼대양', purpose: '참치연승' },
  { name: '동원 207', company: '동원산업', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1987-02-17', area: '삼대양', purpose: '참치연승' },
  { name: '동원 208', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1990-08-30', area: '삼대양', purpose: '참치연승' },
  { name: '동원 211', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1989-04-26', area: '삼대양', purpose: '참치연승' },
  { name: '동원 212', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1990-07-24', area: '삼대양', purpose: '참치연승' },
  { name: '동원 216', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1990-07-25', area: '삼대양', purpose: '참치연승' },
  { name: '동원 803', company: '동원산업', callSign: 'N/A', tonnage: 383.00, length: 47.21, launchDate: '1986-12-08', area: '삼대양', purpose: '참치연승' },
  { name: '아툰트레스', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.61, launchDate: '1989-03-09', area: '삼대양', purpose: '참치연승' },
  { name: '토니나 3', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1989-06-15', area: '삼대양', purpose: '참치연승' },
  { name: '토니나 5', company: '동원산업', callSign: 'N/A', tonnage: 408.00, length: 49.61, launchDate: '1989-08-15', area: '삼대양', purpose: '참치연승' },
  
  // 동원수산
  { name: '동원 618', company: '동원수산', callSign: 'N/A', tonnage: 417.00, length: 49.91, launchDate: '1989-03-30', area: '삼대양', purpose: '참치연승' },
  { name: '동원 619', company: '동원수산', callSign: 'N/A', tonnage: 417.00, length: 49.91, launchDate: '1989-03-31', area: '삼대양', purpose: '참치연승' },
  { name: '동원 620', company: '동원수산', callSign: 'N/A', tonnage: 417.00, length: 49.91, launchDate: '1989-05-16', area: '삼대양', purpose: '참치연승' },
  { name: '동원 621', company: '동원수산', callSign: 'N/A', tonnage: 424.00, length: 49.62, launchDate: '1989-08-15', area: '삼대양', purpose: '참치연승' },
  { name: '동원 622', company: '동원수산', callSign: 'N/A', tonnage: 424.00, length: 49.62, launchDate: '1989-08-12', area: '삼대양', purpose: '참치연승' },
  { name: '동원 623', company: '동원수산', callSign: 'N/A', tonnage: 424.00, length: 49.61, launchDate: '1989-09-15', area: '삼대양', purpose: '참치연승' },
  { name: '동원 631', company: '동원수산', callSign: 'N/A', tonnage: 420.00, length: 49.61, launchDate: '1989-09-12', area: '삼대양', purpose: '참치연승' },
  { name: '동원 632', company: '동원수산', callSign: 'N/A', tonnage: 424.00, length: 49.62, launchDate: '1989-11-15', area: '삼대양', purpose: '참치연승' },
  { name: '동원 633', company: '동원수산', callSign: 'N/A', tonnage: 425.00, length: 49.61, launchDate: '1989-11-15', area: '삼대양', purpose: '참치연승' },
  { name: '동원 637', company: '동원수산', callSign: 'N/A', tonnage: 408.00, length: 49.09, launchDate: '1991-06-18', area: '삼대양', purpose: '참치연승' },
  { name: '동원 638', company: '동원수산', callSign: 'N/A', tonnage: 419.00, length: 49.09, launchDate: '1990-11-02', area: '삼대양', purpose: '참치연승' },
  { name: '동원 639', company: '동원수산', callSign: 'N/A', tonnage: 442.00, length: 50.01, launchDate: '1990-07-17', area: '삼대양', purpose: '참치연승' },
  { name: '동원 650', company: '동원수산', callSign: 'N/A', tonnage: 439.00, length: 49.91, launchDate: '1991-05-01', area: '삼대양', purpose: '참치연승' },
  { name: '동원 651', company: '동원수산', callSign: 'N/A', tonnage: 415.00, length: 49.61, launchDate: '1991-10-01', area: '삼대양', purpose: '참치연승' },

  // 사조산업
  { name: '오룡 303', company: '사조산업', callSign: 'N/A', tonnage: 384.00, length: 47.21, launchDate: '1986-12-15', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 305', company: '사조산업', callSign: 'N/A', tonnage: 384.00, length: 47.21, launchDate: '1987-08-14', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 306', company: '사조산업', callSign: 'N/A', tonnage: 384.00, length: 47.21, launchDate: '1987-09-30', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 311', company: '사조산업', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1988-02-17', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 315', company: '사조산업', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1988-04-19', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 316', company: '사조산업', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1990-10-15', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 353', company: '사조산업', callSign: 'N/A', tonnage: 386.00, length: 46.91, launchDate: '1987-02-03', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 355', company: '사조산업', callSign: 'N/A', tonnage: 380.00, length: 48.01, launchDate: '1988-04-27', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 371', company: '사조산업', callSign: 'N/A', tonnage: 419.00, length: 49.61, launchDate: '1989-03-29', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 373', company: '사조산업', callSign: 'N/A', tonnage: 441.00, length: 51.01, launchDate: '1997-01-07', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 375', company: '사조산업', callSign: 'N/A', tonnage: 394.00, length: 49.33, launchDate: '1996-08-02', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 377', company: '사조산업', callSign: 'N/A', tonnage: 398.00, length: 48.11, launchDate: '1992-01-08', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 708', company: '사조산업', callSign: 'N/A', tonnage: 414.00, length: 49.90, launchDate: '1987-10-28', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 712', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.91, launchDate: '1988-05-11', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 715', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1988-05-15', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 716', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1988-05-30', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 717', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1988-12-27', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 718', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1988-12-27', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 722', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1989-11-01', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 723', company: '사조산업', callSign: 'N/A', tonnage: 446.00, length: 49.61, launchDate: '1990-01-13', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 725', company: '사조산업', callSign: 'N/A', tonnage: 421.00, length: 49.61, launchDate: '1990-12-01', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 731', company: '사조산업', callSign: 'N/A', tonnage: 383.00, length: 46.91, launchDate: '1990-06-12', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 733', company: '사조산업', callSign: 'N/A', tonnage: 416.00, length: 49.61, launchDate: '1991-01-01', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 735', company: '사조산업', callSign: 'N/A', tonnage: 417.00, length: 49.16, launchDate: '1989-03-20', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 801', company: '사조산업', callSign: 'N/A', tonnage: 387.00, length: 47.51, launchDate: '1989-04-17', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 805', company: '사조산업', callSign: 'N/A', tonnage: 432.00, length: 49.01, launchDate: '1997-10-04', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 901', company: '사조산업', callSign: 'N/A', tonnage: 199.00, length: 34.99, launchDate: '2019-02-23', area: '삼대양', purpose: '참치연승' },
  
  // 사조씨푸드, 사조오양
  { name: '오룡 317', company: '사조씨푸드', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1990-09-21', area: '삼대양', purpose: '참치연승' },
  { name: '오룡 325', company: '사조씨푸드', callSign: 'N/A', tonnage: 389.00, length: 47.99, launchDate: '1989-11-03', area: '삼대양', purpose: '참치연승' },
  { name: '오양 355', company: '사조오양', callSign: 'N/A', tonnage: 411.00, length: 49.91, launchDate: '1989-06-16', area: '삼대양', purpose: '참치연승' },
  { name: '오양 371', company: '사조오양', callSign: 'N/A', tonnage: 383.00, length: 46.91, launchDate: '1990-02-28', area: '삼대양', purpose: '참치연승' },
  { name: '오양 372', company: '사조오양', callSign: 'N/A', tonnage: 383.00, length: 46.91, launchDate: '1990-05-11', area: '삼대양', purpose: '참치연승' },
  
  // 신라교역
  { name: '신영 51', company: '신라교역', callSign: 'N/A', tonnage: 401.00, length: 48.28, launchDate: '1988-03-08', area: '삼대양', purpose: '참치연승' },
  { name: '신영 52', company: '신라교역', callSign: 'N/A', tonnage: 401.00, length: 48.28, launchDate: '1988-06-29', area: '삼대양', purpose: '참치연승' },
  { name: '신영 55', company: '신라교역', callSign: 'N/A', tonnage: 424.00, length: 49.77, launchDate: '1989-04-15', area: '삼대양', purpose: '참치연승' },
  { name: '신영 56', company: '신라교역', callSign: 'N/A', tonnage: 384.00, length: 46.90, launchDate: '1987-02-18', area: '삼대양', purpose: '참치연승' },
  { name: '파나룩스 501', company: '신라교역', callSign: 'N/A', tonnage: 427.00, length: 49.47, launchDate: '1990-05-15', area: '삼대양', purpose: '참치연승' },
  { name: '파나룩스 502', company: '신라교역', callSign: 'N/A', tonnage: 427.00, length: 49.47, launchDate: '1990-06-15', area: '삼대양', purpose: '참치연승' },
  { name: '파나룩스 503', company: '신라교역', callSign: 'N/A', tonnage: 427.00, length: 49.47, launchDate: '1990-07-15', area: '삼대양', purpose: '참치연승' },
  { name: '파나룩스 505', company: '신라교역', callSign: 'N/A', tonnage: 427.00, length: 49.47, launchDate: '1990-08-15', area: '삼대양', purpose: '참치연승' },
  { name: '파나룩스 506', company: '신라교역', callSign: 'N/A', tonnage: 427.00, length: 49.47, launchDate: '1990-09-15', area: '삼대양', purpose: '참치연승' },
  
  // 쓰리티오션, 아그네스수산, 에스앤비인터내셔널, 한성기업, 해천물산
  { name: '502 남궁', company: '쓰리티오션', callSign: 'N/A', tonnage: 411.00, length: 49.91, launchDate: '1987-09-07', area: '삼대양', purpose: '참치연승' },
  { name: '503 남궁', company: '쓰리티오션', callSign: 'N/A', tonnage: 398.00, length: 47.53, launchDate: '1989-06-28', area: '삼대양', purpose: '참치연승' },
  { name: '카케하시 1', company: '쓰리티오션', callSign: 'N/A', tonnage: 408.00, length: 49.91, launchDate: '1987-05-10', area: '삼대양', purpose: '참치연승' },
  { name: '카케하시 2', company: '쓰리티오션', callSign: 'N/A', tonnage: 414.00, length: 49.91, launchDate: '1989-08-04', area: '삼대양', purpose: '참치연승' },
  
  { name: '아그네스 82', company: '아그네스수산', callSign: 'N/A', tonnage: 410.00, length: 49.91, launchDate: '1988-02-23', area: '삼대양', purpose: '참치연승' },
  { name: '아그네스 83', company: '아그네스수산', callSign: 'N/A', tonnage: 417.00, length: 49.91, launchDate: '1990-07-25', area: '삼대양', purpose: '참치연승' },
  { name: '아그네스 90', company: '아그네스수산', callSign: 'N/A', tonnage: 414.00, length: 49.91, launchDate: '1990-11-20', area: '삼대양', purpose: '참치연승' },
  { name: '아그네스 95', company: '아그네스수산', callSign: 'N/A', tonnage: 353.02, length: 44.75, launchDate: '1985-10-26', area: '삼대양', purpose: '참치연승' },
  
  { name: '동원 201', company: '에스앤비인터내셔널', callSign: 'N/A', tonnage: 410.00, length: 49.91, launchDate: '1988-01-06', area: '삼대양', purpose: '참치연승' },
  { name: '동원 205', company: '에스앤비인터내셔널', callSign: 'N/A', tonnage: 397.00, length: 49.91, launchDate: '1988-04-06', area: '삼대양', purpose: '참치연승' },
  
  { name: '칠성 1', company: '한성기업', callSign: 'N/A', tonnage: 385.00, length: 47.21, launchDate: '1988-06-16', area: '삼대양', purpose: '참치연승' },
  { name: '한성 36', company: '한성기업', callSign: 'N/A', tonnage: 384.00, length: 47.21, launchDate: '1987-06-19', area: '삼대양', purpose: '참치연승' },
  { name: '한성 38', company: '한성기업', callSign: 'N/A', tonnage: 385.00, length: 47.21, launchDate: '1988-06-02', area: '삼대양', purpose: '참치연승' },
  { name: '한성 39', company: '한성기업', callSign: 'N/A', tonnage: 385.00, length: 47.21, launchDate: '1991-03-16', area: '삼대양', purpose: '참치연승' },
  
  { name: '해천 11', company: '해천물산', callSign: 'N/A', tonnage: 438.00, length: 49.92, launchDate: '1990-07-01', area: '삼대양', purpose: '참치연승' },
  { name: '해천 22', company: '해천물산', callSign: 'N/A', tonnage: 390.00, length: 46.90, launchDate: '1988-06-10', area: '삼대양', purpose: '참치연승' },
  { name: '해천 101', company: '해천물산', callSign: 'N/A', tonnage: 423.00, length: 49.61, launchDate: '1989-01-15', area: '삼대양', purpose: '참치연승' },
  { name: '해천 202', company: '해천물산', callSign: 'N/A', tonnage: 380.00, length: 47.21, launchDate: '1988-03-21', area: '삼대양', purpose: '참치연승' },
  { name: '해천 303', company: '해천물산', callSign: 'N/A', tonnage: 384.00, length: 47.21, launchDate: '1987-09-26', area: '삼대양', purpose: '참치연승' },
  { name: '해천 707', company: '해천물산', callSign: 'N/A', tonnage: 423.00, length: 49.91, launchDate: '1989-02-21', area: '삼대양', purpose: '참치연승' },
  { name: '해천 808', company: '해천물산', callSign: 'N/A', tonnage: 405.00, length: 48.11, launchDate: '1990-11-01', area: '삼대양', purpose: '참치연승' }
];

data['참치 (원양연승)'] = tunaLongline;

fs.writeFileSync('public/data/vessel_master.json', JSON.stringify(data, null, 2));
console.log('Updated Tuna Longline vessels successfully.');
