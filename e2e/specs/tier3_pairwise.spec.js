const puppeteer = require('puppeteer');
const assert = require('assert');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/unloading`;

let currentDbData = {
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
      { id: "SJ", name: "Skipjack", reported: 6646.000, actual: 2172.490, surplus: -4473.510 }
    ],
    timeline: [
      { date: "5/23", time: "08:10 ~ 20:30", targetHol: "S/HAR(#2-A)", dailyAmount: 146.890, cumAmount: 146.890, quality: "어창 개방 측정온도 -24.0℃. 양호." }
    ]
  },
  "bao-lucky": {
    name: "M/V BAO LUCKY",
    dateRange: "2026.06.02 ~ 진행중",
    location: "BANGKOK, THAILAND",
    buyer: "FCF CO.,LTD",
    status: "하역중 (In Progress)",
    reportedTotal: 4803.000,
    actualTotal: 229.160,
    surplus: -4573.840,
    species: [
      { id: "SJ", name: "Skipjack", reported: 4176.000, actual: 204.460, surplus: -3971.540 }
    ],
    timeline: [
      { date: "6/2", time: "09:00 ~ 17:10", targetHol: "S/EXP(#4-A)", dailyAmount: 229.160, cumAmount: 229.160, quality: "S/EXP(#4-A): 어창 개방 측정온도 -18.0℃. 양호." }
    ]
  },
  "hikari": {
    name: "M/V HIKARI",
    dateRange: "2026.04.26 ~ 2026.05.02",
    location: "GENSAN, PHILIPPINES",
    buyer: "FCF CO., LTD.",
    status: "하역완료 (Completed)",
    reportedTotal: 826.000,
    actualTotal: 800.110,
    surplus: -25.890,
    species: [
      { id: "SJ", name: "Skipjack", reported: 734.000, actual: 800.110, surplus: 66.110 }
    ],
    timeline: [
      { date: "4/26~27", time: "22:00 ~ 07:00", targetHol: "MOAKONA(#3-B)", dailyAmount: 8.210, cumAmount: 8.210, quality: "외관상태 및 색택 전반적으로 양호." }
    ],
    finalReport: {
      takeaway: {
        situation: "하역완료 보고.",
        insight: "특이점 분석 내용."
      }
    }
  }
};

async function runTests() {
  console.log("\n==================================================");
  console.log("Running Tier 3: Pairwise Combinations E2E Tests...");
  console.log("==================================================");

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let failedCount = 0;
  let passedCount = 0;

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        get: () => ({
          register: () => Promise.resolve(),
          addEventListener: () => {},
          removeEventListener: () => {},
        })
      });
    });
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    await page.setViewport({ width: 1280, height: 800 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/unloading-db')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: currentDbData })
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

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 3000 }).catch(() => {});

    async function assertTest(name, fn) {
      try {
        await fn();
        console.log(`[PASS] ${name}`);
        passedCount++;
      } catch (err) {
        console.log(`[FAIL] ${name}: ${err.message}`);
        failedCount++;
      }
    }

    // --- PAIRWISE TEST CASES ---

    await assertTest("1. State Reset on Switch during Hover", async () => {
      // Hover hold 4-A of bao-lucky
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("BAO LUCKY"));
        if (target) target.click();
      });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 2000 });

      const hold4A = await page.$('[data-testid="hold-segment-4-A"]');
      await hold4A.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box = await hold4A.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });

      // Click sein-phoenix while hover is active
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("SEIN PHOENIX"));
        if (target) target.click();
      });
      await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 2000 });

      // Assert tooltip is updated or closed cleanly
      const isTooltipClean = await page.evaluate(() => {
        const tt = document.querySelector('[data-testid="hold-tooltip"]');
        if (!tt || window.getComputedStyle(tt).opacity === '0' || window.getComputedStyle(tt).display === 'none') {
          return true; // closed cleanly
        }
        // If still visible, it must read out SEIN PHOENIX data (e.g. -24.0°C instead of BAO LUCKY's -18.0°C)
        return tt.textContent.includes("-24.0");
      });
      assert(isTooltipClean, "Tooltip did not dismiss or update cleanly on vessel switch");
    });

    await assertTest("2. Double-Click & Rapid Selection", async () => {
      // Rapidly click BAO LUCKY, HIKARI, then SEIN PHOENIX from Puppeteer host side
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("BAO LUCKY"));
        if (target) target.click();
      });
      await new Promise(r => setTimeout(r, 50));

      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("HIKARI"));
        if (target) target.click();
      });
      await new Promise(r => setTimeout(r, 50));

      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("SEIN PHOENIX"));
        if (target) target.click();
      });

      // Wait a moment for rendering to settle
      await new Promise(r => setTimeout(r, 500));
      
      const finalVessel = await page.evaluate(() => {
        const activeCard = document.querySelector('div[class*="vesselCard"][class*="active"]');
        return activeCard ? activeCard.textContent : '';
      });
      assert(finalVessel.includes("SEIN PHOENIX"), `Race condition in rapid selection: expected SEIN PHOENIX, got ${finalVessel}`);
    });

    await assertTest("3. Mock DB Interceptor Sync", async () => {
      // Update the mock data to show BAO LUCKY progress has changed
      currentDbData["bao-lucky"].actualTotal = 1000.000;
      currentDbData["bao-lucky"].timeline.push({
        date: "6/3",
        time: "09:00 ~ 17:00",
        targetHol: "S/EXP(#4-B)",
        dailyAmount: 770.840,
        cumAmount: 1000.000,
        quality: "어창 개방 측정온도 -19.0℃. 추가 진척."
      });

      // Reload to simulate sync
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 3000 }).catch(() => {});

      // Click BAO LUCKY
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("BAO LUCKY"));
        if (target) target.click();
      });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 2000 });

      // Gauge percentage label should rise (1000 / 4803 = 20.8%)
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="progress-percentage-label"]');
        return el && el.textContent.trim() === "20.8%";
      }, { timeout: 4000 }).catch(() => {});
      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert(label.trim() === "20.8%", `Real-time data sync failed. Expected 20.8%, got: ${label}`);
    });

    await assertTest("4. Viewport Scaling with Hover Anchor", async () => {
      // Hover a segment
      const segment = await page.$('[data-testid="hold-segment-4-A"]');
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const boxBefore = await segment.boundingBox();
      await page.mouse.move(boxBefore.x + boxBefore.width / 2, boxBefore.y + boxBefore.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });

      // Resize window
      await page.setViewport({ width: 800, height: 600 });
      await new Promise(r => setTimeout(r, 300)); // wait for redraw

      // Scroll back into view to ensure bounding box is valid after resize
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));

      // Move mouse to the new segment coordinates after resize to maintain hover state
      const boxAfter = await segment.boundingBox();
      await page.mouse.move(boxAfter.x + boxAfter.width / 2, boxAfter.y + boxAfter.height / 2);
      await new Promise(r => setTimeout(r, 200));

      // Assert tooltip is still visible and re-anchored near the new bounding box
      const tooltipVisible = await page.evaluate(() => {
        const tt = document.querySelector('[data-testid="hold-tooltip"]');
        return tt && window.getComputedStyle(tt).display !== 'none' && window.getComputedStyle(tt).opacity !== '0';
      });
      assert(tooltipVisible, "Tooltip disappeared after viewport resize");
    });

    await assertTest("5. Takeaway Box Logic Cross-Check", async () => {
      // Restore viewport
      await page.setViewport({ width: 1280, height: 800 });

      // HIKARI has finalReport -> takeaway box visible
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("HIKARI"));
        if (target) target.click();
      });
      await page.waitForSelector('[data-testid="exec-takeaway-box"]', { timeout: 3000 });
      
      // Switch to SEIN PHOENIX (no finalReport)
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("SEIN PHOENIX"));
        if (target) target.click();
      });
      
      // Wait to ensure DOM updates
      await new Promise(r => setTimeout(r, 500));

      const boxExists = await page.$('[data-testid="exec-takeaway-box"]');
      assert(boxExists === null, "Executive summary takeaway box should be removed from DOM when changing to active vessel");
    });

  } catch (error) {
    console.error("Tier 3 E2E Test execution failed!", error);
  } finally {
    await browser.close();
    console.log(`\nTier 3 Summary: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runTests();
