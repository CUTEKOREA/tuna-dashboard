const puppeteer = require('puppeteer');

const PORT = 3001; // let's try port 3001 where dev/prod server might be running
const BASE_URL = `http://localhost:${PORT}/unloading`;

const mockDbData = {
  "sein-phoenix": {
    name: "M/V SEIN PHOENIX",
    dateRange: "2026.05.23 ~ 진행중",
    location: "BANGKOK, THAILAND",
    buyer: "FCF CO.,LTD",
    status: "하역중 (In Progress)",
    reportedTotal: 6955.000,
    actualTotal: 2304.990,
    surplus: -4650.010,
    species: [
      { id: "SJ", name: "Skipjack", reported: 6646.000, actual: 2172.490, surplus: -4473.510 },
      { id: "YF", name: "Yellowfin", reported: 309.000, actual: 132.500, surplus: -176.500 }
    ],
    timeline: [
      { date: "5/23", time: "08:10 ~ 20:30", targetHol: "S/HAR(#2-A)", dailyAmount: 146.890, cumAmount: 146.890, quality: "어창 개방 측정온도 -24.0℃ ~ -25.0℃. 외관상태 및 색택 전반적으로 양호." },
      { date: "5/24", time: "-", targetHol: "-", dailyAmount: 0, cumAmount: 146.890, quality: "일요일 휴무." },
      { date: "5/25", time: "08:10 ~ 19:00", targetHol: "S/HAR(#2-A), S/EXP(#4-A)", dailyAmount: 216.090, cumAmount: 362.980, quality: "어창 온도 -21.0℃ ~ -24.0℃. 외관상태 양호." }
    ]
  }
};

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/unloading-db')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockDbData })
      });
    } else if (url.includes('/api/tuna-live')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unloading: { congestion: "High", delayDays: 3 } })
      });
    } else {
      request.continue();
    }
  });

  try {
    console.log("Navigating to URL...");
    // Let's start the server ourselves if needed, or if it is already running. 
    // Wait, let's just run dev server to debug. But first let's see if we can connect.
    await page.goto(BASE_URL, { waitUntil: 'load' });
    console.log("Page loaded!");

    await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 3000 });
    console.log("Found SEIN PHOENIX");

    const segment = await page.$('[data-testid="hold-segment-2-A"]');
    if (!segment) {
      console.log("Segment 2-A not found!");
    } else {
      const box = await segment.boundingBox();
      console.log("Segment bounding box:", box);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      console.log("Moved mouse to segment 2-A");

      await new Promise(r => setTimeout(r, 500));
      const html = await page.evaluate(() => {
        const tt = document.querySelector('[data-testid="hold-tooltip"]');
        return tt ? tt.outerHTML : 'Tooltip NOT in DOM';
      });
      console.log("Tooltip HTML:", html);
    }
  } catch (e) {
    console.error("Error in debug:", e);
  } finally {
    await browser.close();
  }
}

main();
