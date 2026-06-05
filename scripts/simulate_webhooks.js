const http = require('http');

const PORT = process.env.PORT || 3000;
const TOKEN = 'secret123';

const emailJune2 = `금일(6/2) M/V SEIN PHOENIX 하역결과
일일 하역량 198.78 MT
하역 누계 2304.99 MT
잔 량 4650.01 MT
작업 시간: 08:20 ~ 14:00
작업 어창: S/SPR(#1-A), MOAMARI(#4-C)
어종별 하역량:
CMC 150.0 MT
TUM 48.78 MT
제품상태:
S/SPR(#1-A): 어창 개방 측정온도 -20.0℃ ~ -21.0℃. 외관상태 및 색택 전반적으로 양호.
MOAMARI(#4-C): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호.
5. 명일
명일(6/3)은 약 235톤 하역 진행 예정.`;

const emailJune3 = `금일(6/3) M/V SEIN PHOENIX 하역결과
일일 하역량 236.14 MT
하역 누계 2541.13 MT
잔 량 4413.87 MT
작업 시간: 08:10 ~ 18:40
작업 어창: S/PIO(#3-A), MOAKONA(#2-B)
어종별 하역량:
CMC 226.04 MT
TUM 10.10 MT
제품상태:
S/PIO(#3-A): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호.
MOAKONA(#2-B): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호.
5. 명일
명일(6/4)은 약 330톤 하역 진행 예정.`;

const emailJune4 = `수신: 해양수산본부
발신: 방콕사무소

1. 업무에 노고가 많으십니다.

2. 금일(6/4) SEIN PHOENIX 하역결과를 아래와 같이 보고 드립니다.

* CMC:                 82.400 MT (KONA:#2-B)
  ISA:                240.470 MT (S/PIO:#3-A)
-------------------------------------------------------------------------------
일일  하역량:            322.870 MT
하 역 누 계:           2,864.000 MT
잔      량:  -        4,091.000 MT (총 적재량 : 6,955 MT)

3. 금일(6/4) 하역작업은 08:20 ~ 18:30 까지 진행하였습니다.

4. 금일(6/4) 하역 시 관찰된 제품상태 관하여 다음과 같이 보고 드립니다.

* S/PIO(#3-A)
- 어창 개방 측정온도는 -18.0℃ ~ -21.0℃ 입니다.
- 외관상태 및 색택 전반적으로 양호하였습니다.

* MOAKONA(#2-B)
- 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다.
- 외관상태 및 색택 전반적으로 양호하였습니다.

5. 명일(6/5)은 약 580톤 하역 진행 예정입니다.

6. 수고하십시오.`;

function postEmail(emailBody, subject) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const payload = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="subject"',
      '',
      subject,
      `--${boundary}`,
      'Content-Disposition: form-data; name="text"',
      '',
      emailBody,
      `--${boundary}--`,
      ''
    ].join('\r\n');

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api/webhooks/unloading?token=${TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status Code: ${res.statusCode}, Body: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

function fetchDbData() {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}/api/unloading-db`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status Code: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Sending June 2 email webhook simulation...`);
  try {
    const res2 = await postEmail(emailJune2, 'Fwd: M/V SEIN PHOENIX 하역결과 (6/2)');
    console.log('June 2 Response:', res2);

    console.log(`Sending June 3 email webhook simulation...`);
    const res3 = await postEmail(emailJune3, 'Fwd: M/V SEIN PHOENIX 하역결과 (6/3)');
    console.log('June 3 Response:', res3);

    console.log(`Sending June 4 email webhook simulation...`);
    const res4 = await postEmail(emailJune4, 'Fwd: M/V SEIN PHOENIX 하역결과 (6/4)');
    console.log('June 4 Response:', res4);

    console.log('Fetching database data via API to verify...');
    const dbData = await fetchDbData();
    if (dbData.success && dbData.data && dbData.data['sein-phoenix']) {
      const sp = dbData.data['sein-phoenix'];
      console.log('\n--- VERIFICATION RESULTS ---');
      console.log('Vessel ID:', sp.vessel_id || 'sein-phoenix');
      console.log('Vessel Name:', sp.name);
      console.log('Reported Total:', sp.reportedTotal);
      console.log('Actual Total:', sp.actualTotal);
      console.log('Reports Count:', sp.timeline ? sp.timeline.length : 0);
      console.log('Species actual amounts:');
      
      let sjActual = 0;
      let yfActual = 0;
      
      if (sp.species) {
        sp.species.forEach(s => {
          console.log(`- ${s.name} (${s.id}): reported=${s.reported}, actual=${s.actual}`);
          if (s.id === 'SJ') sjActual = s.actual;
          if (s.id === 'YF') yfActual = s.actual;
        });
      }
      
      const expectedSj = 2689.500;
      const expectedYf = 164.500;
      const expectedTotal = 2864.000;
      
      console.log(`\nExpected Skipjack (SJ): ${expectedSj}, Got: ${sjActual}`);
      console.log(`Expected Yellowfin (YF): ${expectedYf}, Got: ${yfActual}`);
      console.log(`Expected Total Actual: ${expectedTotal}, Got: ${sp.actualTotal}`);
      
      if (Math.abs(sjActual - expectedSj) < 0.001 && Math.abs(yfActual - expectedYf) < 0.001 && Math.abs(sp.actualTotal - expectedTotal) < 0.001) {
        console.log('\nSUCCESS: Webhook simulation verified successfully!');
        process.exit(0);
      } else {
        console.error('\nFAILURE: Webhook simulation values mismatch!');
        process.exit(1);
      }
    } else {
      console.error('Verification failed: sein-phoenix data not found or structure invalid');
      process.exit(1);
    }
  } catch (err) {
    console.error('Simulation error:', err.message);
    process.exit(1);
  }
}

run();
