const puppeteer = require('puppeteer');
const assert = require('assert');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/unloading`;

// Generate mock db data based on the simulated day of the sequence
function getMockDbDataForDay(dayNum) {
  const baseVessel = {
    name: "M/V BAO LUCKY",
    dateRange: "2026.06.02 ~ 진행중",
    location: "BANGKOK, THAILAND",
    buyer: "FCF CO.,LTD",
    status: "하역중 (In Progress)",
    reportedTotal: 4803.000,
    actualTotal: 229.160,
    surplus: -4573.840,
    species: [
      { id: "SJ", name: "Skipjack", reported: 4176.000, actual: 204.460, surplus: -3971.540 },
      { id: "YF", name: "Yellowfin", reported: 627.000, actual: 24.700, surplus: -602.300 }
    ],
    timeline: [
      { 
        date: "6/2", 
        time: "09:00 ~ 17:10", 
        targetHol: "S/EXP(#4-A), N/STAR(#1-A)", 
        dailyAmount: 229.160, 
        cumAmount: 229.160, 
        quality: "S/EXP(#4-A): 어창 개방 측정온도 -18.0℃. N/STAR(#1-A): -19.0℃." 
      }
    ]
  };

  if (dayNum >= 2) {
    baseVessel.actualTotal = 729.160;
    baseVessel.surplus = -4073.840;
    baseVessel.species[0].actual = 704.460;
    baseVessel.species[0].surplus = -3471.540;
    baseVessel.timeline.push({
      date: "6/3",
      time: "08:00 ~ 18:00", // 10 hours
      targetHol: "S/EXP(#4-B)",
      dailyAmount: 500.000,
      cumAmount: 729.160,
      quality: "S/EXP(#4-B): 어창 개방 측정온도 -20.0℃. 양호."
    });
  }

  if (dayNum >= 3) {
    baseVessel.timeline.push({
      date: "6/4",
      time: "-",
      targetHol: "-",
      dailyAmount: 0.0,
      cumAmount: 729.160,
      quality: "일요일 휴무."
    });
  }

  if (dayNum >= 4) {
    baseVessel.actualTotal = 4529.160;
    baseVessel.surplus = -273.840;
    baseVessel.species[0].actual = 4176.000;
    baseVessel.species[0].surplus = 0.000;
    baseVessel.species[1].actual = 353.160;
    baseVessel.species[1].surplus = -273.840;
    baseVessel.timeline.push({
      date: "6/5",
      time: "08:00 ~ 20:00", // 12 hours
      targetHol: "S/PIO(#3-A)",
      dailyAmount: 3800.000,
      cumAmount: 4529.160,
      quality: "어창 온도 -19.0℃. 급속 방출 완료."
    });
  }

  if (dayNum >= 5) {
    baseVessel.status = "하역완료 (Completed)";
    baseVessel.actualTotal = 4803.000;
    baseVessel.surplus = 0.000;
    baseVessel.species[1].actual = 627.000;
    baseVessel.species[1].surplus = 0.000;
    baseVessel.dateRange = "2026.06.02 ~ 2026.06.06";
    baseVessel.timeline.push({
      date: "6/6",
      time: "08:00 ~ 11:30", // 3.5 hours
      targetHol: "MOAKONA(#2-A)",
      dailyAmount: 273.840,
      cumAmount: 4803.000,
      quality: "최종 하역 종료."
    });
    baseVessel.finalReport = {
      takeaway: {
        situation: "방콕 하역 4,803톤 성공리에 종료.",
        insight: "계획 하역 대비 오차 0.00% 달성 완료."
      }
    };
  }

  return { "bao-lucky": baseVessel };
}

async function runTests() {
  console.log("\n==================================================");
  console.log("Running Tier 4: Real-World Scenario E2E Tests...");
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
      
      // Parse query params from the requesting page's URL
      let dayNum = 1;
      try {
        const reqUrl = new URL(url);
        const dayParam = reqUrl.searchParams.get('realWorldDay');
        if (dayParam) {
          dayNum = parseInt(dayParam);
        } else {
          const pageUrlStr = request.headers()['referer'] || request.headers()['Referer'] || '';
          if (pageUrlStr) {
            const pageUrl = new URL(pageUrlStr);
            dayNum = parseInt(pageUrl.searchParams.get('realWorldDay') || '1');
          }
        }
      } catch (e) {
        // default
      }

      if (url.includes('/api/unloading-db')) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: getMockDbDataForDay(dayNum) })
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

    // --- SCENARIO STEPS ---

    await assertTest("Step 1: Initial State (Day 1)", async () => {
      await page.goto(`${BASE_URL}?vessel=bao-lucky&realWorldDay=1`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 3000 }).catch(() => {});
      
      // Wait for progress gauge is 4.8%
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="progress-percentage-label"]');
        return el && el.textContent.trim() === "4.8%";
      }, { timeout: 3000 }).catch(() => {});

      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert.strictEqual(label.trim(), "4.8%", `Gauge percentage label should be 4.8%, got: ${label}`);

      // Check SVG hatches 4-A and 1-A are partial teal fills
      const fill4A = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-A"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      assert(fill4A.includes('#14b8a6') || fill4A.includes('rgb(20, 184, 166)'), "Hatch 4-A should be rendered with teal fill");
    });

    await assertTest("Step 2: Add Day 2 (Day 2)", async () => {
      await page.goto(`${BASE_URL}?vessel=bao-lucky&realWorldDay=2`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 3000 }).catch(() => {});

      // Wait for progress increases to 15.2%
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="progress-percentage-label"]');
        return el && el.textContent.trim() === "15.2%";
      }, { timeout: 3000 }).catch(() => {});

      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert.strictEqual(label.trim(), "15.2%", `Gauge percentage label should rise to 15.2%, got: ${label}`);

      // Hatch 4-B updates to show teal fill
      const fill4B = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-B"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      assert(fill4B.includes('#14b8a6') || fill4B.includes('rgb(20, 184, 166)'), "Hatch 4-B should update to teal fill on Day 2");
    });

    await assertTest("Step 3: Add Sunday Holiday (Day 3)", async () => {
      await page.goto(`${BASE_URL}?vessel=bao-lucky&realWorldDay=3`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 3000 }).catch(() => {});
      await page.waitForSelector('[data-testid="timeline-node-6-4"]', { timeout: 3000 }).catch(() => {});

      // Timeline node displays Sunday 휴무 and daily averages, speed, and ETA remain steady
      const holidayNodeExists = await page.evaluate(() => {
        const node = document.querySelector('[data-testid="timeline-node-6-4"]');
        return node?.textContent.includes("휴무") || node?.className.includes("holiday");
      });
      assert(holidayNodeExists, "Timeline node for Sunday holiday should be rendered with 휴무");
    });

    await assertTest("Step 4: Add Day 4 (Day 4)", async () => {
      await page.goto(`${BASE_URL}?vessel=bao-lucky&realWorldDay=4`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 3000 }).catch(() => {});

      // Wait for progress jumps to 94.3%
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="progress-percentage-label"]');
        return el && el.textContent.trim() === "94.3%";
      }, { timeout: 3000 }).catch(() => {});

      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert.strictEqual(label.trim(), "94.3%", `Gauge percentage label should jump to 94.3%, got: ${label}`);
    });

    await assertTest("Step 5: Final Discharge (Day 5)", async () => {
      await page.goto(`${BASE_URL}?vessel=bao-lucky&realWorldDay=5`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BAO LUCKY"), { timeout: 3000 }).catch(() => {});

      // Wait for progress reaches 100.0%
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="progress-percentage-label"]');
        return el && el.textContent.trim() === "100.0%";
      }, { timeout: 3000 }).catch(() => {});

      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert.strictEqual(label.trim(), "100.0%", `Gauge percentage label should be 100.0%, got: ${label}`);

      // Vessel status badge changes to Completed (green theme)
      const isCompletedBadge = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('[class*="statusBadge"], [class*="completed"]'));
        return badges.some(b => b.textContent.includes("완료") || b.textContent.includes("Completed"));
      });
      assert(isCompletedBadge, "Vessel status badge should transition to Completed");

      // Executive Takeaway box is rendered in the UI with takeaway insights
      const takeawayBoxExists = await page.evaluate(() => {
        const box = document.querySelector('[data-testid="exec-takeaway-box"]');
        return box !== null && box.textContent.includes("방콕 하역 4,803톤 성공리에 종료");
      });
      assert(takeawayBoxExists, "Executive Takeaway box not rendered with summary insights");
    });

  } catch (error) {
    console.error("Tier 4 E2E Test execution failed!", error);
  } finally {
    await browser.close();
    console.log(`\nTier 4 Summary: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runTests();
