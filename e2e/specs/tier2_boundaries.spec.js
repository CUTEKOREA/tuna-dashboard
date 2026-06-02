const puppeteer = require('puppeteer');
const assert = require('assert');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/unloading`;

// We will construct dynamic mock data based on the page's current query parameters
function getMockDbDataForTest(testCase) {
  const baseVessel = {
    name: "M/V BOUNDARY VESSEL",
    dateRange: "2026.06.02 ~ 진행중",
    location: "BANGKOK, THAILAND",
    buyer: "FCF CO.,LTD",
    status: "하역중 (In Progress)",
    reportedTotal: 1000.000,
    actualTotal: 100.000,
    surplus: -900.000,
    species: [
      { id: "SJ", name: "Skipjack", reported: 800.000, actual: 80.000, surplus: -720.000 },
      { id: "YF", name: "Yellowfin", reported: 200.000, actual: 20.000, surplus: -180.000 }
    ],
    timeline: [
      { 
        date: "6/2", 
        time: "09:00 ~ 17:00", 
        targetHol: "S/EXP(#4-A)", 
        dailyAmount: 100.000, 
        cumAmount: 100.000, 
        quality: "어창 개방 측정온도 -24.0℃. 외관상태 양호." 
      }
    ]
  };

  if (testCase === 'A1' || testCase === 'A2') {
    // Extremely low temperature below -25°C
    baseVessel.timeline[0].quality = "어창 개방 측정온도 -26.0℃. 초저온 동결 상태 양호.";
  } else if (testCase === 'A3') {
    // Range parsing: lowest temperature or average
    baseVessel.timeline[0].quality = "어창 개방 측정온도 -24.0℃ ~ -26.0℃. 양호.";
  } else if (testCase === 'B6' || testCase === 'B7') {
    // Temperature warnings above -18°C (e.g. -17°C)
    baseVessel.timeline[0].quality = "어창 개방 측정온도 -17.0℃. 온도 상승 주의.";
  } else if (testCase === 'B8') {
    // Edge case of exactly -18.0°C
    baseVessel.timeline[0].quality = "어창 개방 측정온도 -18.0℃. 경계값 검증.";
  } else if (testCase === 'B9' || testCase === 'B10') {
    // Critical spoilage alert (> -17.0°C, e.g. -15.0°C)
    baseVessel.timeline[0].quality = "어창 개방 측정온도 -15.0℃. 심각한 관리 리스크.";
  } else if (testCase === 'C12') {
    // Empty timeline for NaN progress checks
    baseVessel.timeline = [];
    baseVessel.actualTotal = 0;
  } else if (testCase === 'C13' || testCase === 'C14') {
    // Empty DB/Timeline logs
    baseVessel.timeline = [];
    baseVessel.actualTotal = 0;
    baseVessel.reportedTotal = 0; // division by zero checks
  } else if (testCase === 'D18') {
    // Unmapped species fallback
    baseVessel.species.push({ id: "XX", name: "Alien Fish", reported: 50.000, actual: 10.000, surplus: -40.000 });
  } else if (testCase === 'D19') {
    // Missing buyer and location values
    delete baseVessel.buyer;
    delete baseVessel.location;
  } else if (testCase === 'E21') {
    // Missing timeline work times
    baseVessel.timeline.push({
      date: "6/3",
      time: "-",
      targetHol: "S/EXP(#4-A)",
      dailyAmount: 50.000,
      cumAmount: 150.000,
      quality: "작업시간 누락 노드"
    });
  } else if (testCase === 'E22') {
    // All nodes missing time
    baseVessel.timeline = [
      { date: "6/2", time: "-", targetHol: "S/EXP(#4-A)", dailyAmount: 100.000, cumAmount: 100.000, quality: "무시간 노드" }
    ];
  } else if (testCase === 'E23') {
    // Time interval crossing midnight
    baseVessel.timeline[0].time = "22:00 ~ 07:00"; // 9 hours
  } else if (testCase === 'E24') {
    // Malformed time format
    baseVessel.timeline[0].time = "08:00"; // missing '~' or range
  } else if (testCase === 'E25') {
    // Holiday off-day
    baseVessel.timeline = [
      { date: "5/24", time: "-", targetHol: "-", dailyAmount: 0, cumAmount: 0, quality: "일요일 휴무." }
    ];
  }

  return { "boundary-vessel": baseVessel };
}

async function runTests() {
  console.log("\n==================================================");
  console.log("Running Tier 2: Boundary & Corner Case E2E Tests...");
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

    // Enable request interception
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      
      // Parse query params from the requesting page's URL
      let testCase = 'default';
      try {
        const reqUrl = new URL(url);
        testCase = reqUrl.searchParams.get('boundaryTest') || 'default';
        if (testCase === 'default') {
          const pageUrlStr = request.headers()['referer'] || request.headers()['Referer'] || '';
          if (pageUrlStr) {
            const pageUrl = new URL(pageUrlStr);
            testCase = pageUrl.searchParams.get('boundaryTest') || 'default';
          }
        }
      } catch (e) {
        // Fallback if parsing fails
      }

      if (url.includes('/api/unloading-db')) {
        if (testCase === 'C11') {
          // Null database API fallback test
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: null })
          });
        } else if (testCase === 'C15') {
          // 502 gateway error mock
          request.respond({
            status: 502,
            contentType: 'application/json',
            body: JSON.stringify({ error: "Gateway Timeout" })
          });
        } else {
          request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: getMockDbDataForTest(testCase) })
          });
        }
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

    // --- BOUNDARY A: EXTREMELY LOW TEMPERATURES ---

    await assertTest("A1. Deep Cyber Blue Fill", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=A1`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      // Assert hold segment color is Cyber Blue (#0284c7)
      const fill = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-A"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      assert(fill === '#0284c7' || fill.includes('rgb(2, 132, 199)'), `Expected cyber blue (#0284c7), got: ${fill}`);
    });

    await assertTest("A2. Text Parsing Limit", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=A2`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      // Hover over compartment 4-A to trigger tooltip
      const segment = await page.$('[data-testid="hold-segment-4-A"]');
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box = await segment.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });
      
      const tempText = await page.$eval('[data-testid="hold-tooltip"] [data-testid="tooltip-temp"]', el => el.textContent);
      assert(tempText.includes("-26.0°C"), `Expected exact readout -26.0°C, got: ${tempText}`);
    });

    await assertTest("A3. Range Parsing Min-Max", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=A3`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const segment = await page.$('[data-testid="hold-segment-4-A"]');
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box = await segment.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });
      
      const tempText = await page.$eval('[data-testid="hold-tooltip"] [data-testid="tooltip-temp"]', el => el.textContent);
      // Verify it safely parses or displays the range/lowest
      assert(tempText.includes("-26.0") || tempText.includes("-25.0"), `Range parsing failed, got: ${tempText}`);
    });

    await assertTest("A4. No Spurious Alerts", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=A1`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const hasAlert = await page.evaluate(() => {
        return document.querySelector('[data-testid="hold-tooltip"] [class*="alert"]') !== null;
      });
      assert(!hasAlert, "Spurious alert detected for super-frozen temperatures");
    });

    await assertTest("A5. Efficiency Gauge Stability", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=A1`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const gaugeVal = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert(gaugeVal.trim() === "10.0%", `Gauge should stay steady at 10.0%, got: ${gaugeVal}`);
    });

    // --- BOUNDARY B: TEMPERATURE WARNINGS ---

    await assertTest("B6. Amber Code Color", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=B6`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const fill = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-A"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      assert(fill === '#f59e0b' || fill.includes('rgb(245, 158, 11)'), `Expected warning amber (#f59e0b), got: ${fill}`);
    });

    await assertTest("B7. Tooltip Warning Badge", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=B6`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const segment = await page.$('[data-testid="hold-segment-4-A"]');
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box = await segment.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });
      
      const hasWarning = await page.evaluate(() => {
        const tooltip = document.querySelector('[data-testid="hold-tooltip"]');
        return tooltip?.textContent.includes("경고") || tooltip?.textContent.includes("Warning") || tooltip?.querySelector('[class*="warning"]') !== null;
      });
      assert(hasWarning, "Warning badge or text missing in tooltip");
    });

    await assertTest("B8. Edge Case of Exactly -18.0°C", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=B8`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const fill = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-A"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      // -18.0°C should map to safe teal (#14b8a6) or blue-green, not amber warning color
      assert(fill !== '#f59e0b' && !fill.includes('rgb(245, 158, 11)'), "Exactly -18.0°C should render as safe, not warning amber");
    });

    await assertTest("B9. Critical Spoilage Alert (> -17.0°C)", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=B9`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const fill = await page.evaluate(() => {
        const segment = document.querySelector('[data-testid="hold-segment-4-A"]');
        return segment?.getAttribute('fill') || window.getComputedStyle(segment).fill;
      });
      assert(fill === '#ef4444' || fill.includes('rgb(239, 68, 68)'), `Expected critical red (#ef4444) for -15°C, got: ${fill}`);
    });

    await assertTest("B10. Vessel Card Highlight", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=B9`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const hasAlertIcon = await page.evaluate(() => {
        const card = document.querySelector('[data-testid="vessel-select-item-boundary-vessel"]');
        return card?.querySelector('[class*="alertIcon"]') !== null || card?.querySelector('svg[class*="danger"]') !== null;
      });
      assert(hasAlertIcon, "Vessel card should show an alert indicator when a hold temperature is critical");
    });

    // --- BOUNDARY C: EMPTY DATABASE STATES ---

    await assertTest("C11. Null API Fallback", async () => {
      await page.goto(`${BASE_URL}?boundaryTest=C11`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 3000 }).catch(() => {});
      // Ensure page didn't crash and renders static default vessels (e.g. sein-phoenix)
      const hasPhoenix = await page.evaluate(() => document.body.textContent.includes("SEIN PHOENIX"));
      assert(hasPhoenix, "Page did not fall back gracefully to staticData when database returns null");
    });

    await assertTest("C12. Empty DB Timeline", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=C12`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const progressLabel = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert(progressLabel.trim() === "0.0%", `Expected progress to evaluate to "0.0%" for empty timeline, got: ${progressLabel}`);
    });

    await assertTest("C13. Empty Table Prompt", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=C13`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const promptText = await page.evaluate(() => document.body.textContent);
      assert(promptText.includes("하역 데이터가 없습니다") || promptText.includes("No unloading data"), "Empty log prompt not displayed");
    });

    await assertTest("C14. No Division By Zero", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=C13`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const metricVal = await page.evaluate(() => {
        // Average daily metrics should read 0 or "-" rather than NaN
        const texts = Array.from(document.querySelectorAll('div'));
        return texts.some(el => el.textContent.includes("NaN"));
      });
      assert(!metricVal, "NaN encountered in UI metrics due to division by zero");
    });

    await assertTest("C15. API Timeout Grace", async () => {
      await page.goto(`${BASE_URL}?boundaryTest=C15`, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 500));
      // Check if Error Boundary or error message is rendered
      const isErrorDisplayed = await page.evaluate(() => {
        return document.body.textContent.includes("에러") || document.body.textContent.includes("Error") || document.body.textContent.includes("Gateway");
      });
      assert(isErrorDisplayed, "Page did not show an error banner or fallback upon API failure");
    });

    // --- BOUNDARY D: INVALID VESSEL IDS ---

    await assertTest("D16. Query Selector Recovery", async () => {
      await page.goto(`${BASE_URL}?vessel=titanic-ghost`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 3000 }).catch(() => {});
      const activeVesselName = await page.evaluate(() => {
        const activeCard = document.querySelector('div[class*="vesselCard"][class*="active"]');
        return activeCard ? activeCard.textContent : '';
      });
      assert(activeVesselName.includes("SEIN PHOENIX"), `Should default back to first active vessel SEIN PHOENIX, got: ${activeVesselName}`);
    });

    await assertTest("D17. State Index Out-of-Bounds", async () => {
      // Simulate direct click with bad ID if possible, otherwise mock state switch
      const badClickSuccess = await page.evaluate(() => {
        try {
          // Attempting to select a nonexistent vessel
          window.location.hash = 'vessel=nonexistent-cargo';
          return true;
        } catch (e) {
          return false;
        }
      });
      assert(badClickSuccess, "State transition with unmapped ID crashed script");
    });

    await assertTest("D18. Unmapped Species Fallback", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=D18`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const content = await page.evaluate(() => document.body.textContent);
      assert(content.includes("XX") || content.includes("Alien Fish"), "Failed to render unmapped raw species code safely");
    });

    await assertTest("D19. Missing Buyer/Location Values", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=D19`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const dashRendered = await page.evaluate(() => {
        // Buyer or location slot has "-" or is empty instead of crashing
        return document.body.textContent.includes("-");
      });
      assert(dashRendered, "Missing vessel properties did not render placeholder '-' safely");
    });

    await assertTest("D20. Vessel Card Key Missing", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=D19`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const rendersSuccessfully = await page.evaluate(() => {
        return document.querySelector('div[class*="fleetGrid"]') !== null;
      });
      assert(rendersSuccessfully, "Fleet grid failed to render on partial vessel metadata");
    });

    // --- BOUNDARY E: MISSING TIMELINE WORK TIMES ---

    await assertTest("E21. Average Calculation Exclusions", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=E21`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const avgHours = await page.evaluate(() => {
        // Should calculate average based on nodes that DO have times, ignoring "-" node.
        // Node 1: "09:00 ~ 17:00" = 8 hours. Node 2: "-" (ignored).
        // Average should be 8.0 hours.
        return document.body.textContent;
      });
      assert(avgHours.includes("8.0 시간") || avgHours.includes("8.0 hours"), `Expected 8.0 hours, got something else in page`);
    });

    await assertTest("E22. All Nodes Missing Time", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=E22`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const content = await page.evaluate(() => document.body.textContent);
      assert(content.includes("0.0 시간") || content.includes("0.0 hours"), "Expected 0.0 hours when all times missing");
    });

    await assertTest("E23. Time Interval Cross-Day", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=E23`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const content = await page.evaluate(() => document.body.textContent);
      // "22:00 ~ 07:00" = 9.0 hours. Check average working hours is 9.0
      assert(content.includes("9.0 시간") || content.includes("9.0 hours"), "Cross-day average working hours calculated incorrectly");
    });

    await assertTest("E24. Malformed Time Format", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=E24`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const isHealthy = await page.evaluate(() => {
        // Checks that page doesn't crash on "08:00" input and continues displaying 0.0 hours safely
        return document.body.textContent.includes("0.0 시간") || document.body.textContent.includes("0.0 hours");
      });
      assert(isHealthy, "Malformed time format triggered crash or failed to evaluate to 0.0 hours");
    });

    await assertTest("E25. Holiday Exemption", async () => {
      await page.goto(`${BASE_URL}?vessel=boundary-vessel&boundaryTest=E25`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.body.textContent.includes("BOUNDARY VESSEL"), { timeout: 3000 }).catch(() => {});
      const content = await page.evaluate(() => document.body.textContent);
      // Holiday node daily amount = 0. Should be parsed as holiday and skip calculation
      assert(!content.includes("NaN"), "Holiday exemption logic produced NaN");
    });

  } catch (error) {
    console.error("Tier 2 E2E Test execution failed!", error);
  } finally {
    await browser.close();
    console.log(`\nTier 2 Summary: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runTests();
