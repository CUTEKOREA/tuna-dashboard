const puppeteer = require('puppeteer');
const assert = require('assert');

const PORT = process.env.PORT || 3000;
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
      { id: "SJ", name: "Skipjack", reported: 4176.000, actual: 204.460, surplus: -3971.540 },
      { id: "YF", name: "Yellowfin", reported: 627.000, actual: 24.700, surplus: -602.300 }
    ],
    timeline: [
      { date: "6/2", time: "09:00 ~ 17:10", targetHol: "S/EXP(#4-A), N/STAR(#1-A)", dailyAmount: 229.160, cumAmount: 229.160, quality: "S/EXP(#4-A): 어창 개방 측정온도 -18.0℃ ~ -19.0℃. N/STAR(#1-A): -19.0℃ ~ -20.0℃." }
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
    ]
  }
};

const mockLiveData = {
  unloading: {
    congestion: "High",
    delayDays: 3
  }
};

async function runTests() {
  console.log("\n==================================================");
  console.log("Running Tier 1: Feature Coverage E2E Tests...");
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
          body: JSON.stringify(mockLiveData)
        });
      } else {
        request.continue();
      }
    });

    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForFunction(() => document.body.textContent.includes("SEIN PHOENIX"), { timeout: 5000 }).catch(() => {});

    // Helper function to run a test assertion block
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

    // --- FEATURE A: VESSEL SELECTION ---
    
    await assertTest("A1. Switch Vessel Focus", async () => {
      // Try data-testid first, fall back to matching text content in vesselCard
      const baoLuckyCardSelector = '[data-testid="vessel-select-item-bao-lucky"]';
      let card = await page.$(baoLuckyCardSelector);
      if (!card) {
        // Fallback: find by text content
        const found = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
          const target = cards.find(c => c.textContent.includes("BAO LUCKY"));
          if (target) {
            target.click();
            return true;
          }
          return false;
        });
        assert(found, "Could not find vessel card for BAO LUCKY via text fallback");
      } else {
        await card.click();
      }

      // Check if deep dive header updates
      await page.waitForFunction(
        () => document.body.textContent.includes("BAO LUCKY"),
        { timeout: 3000 }
      );
      const content = await page.evaluate(() => document.body.textContent);
      assert(content.includes("BAO LUCKY"), "Deep dive analysis did not update to BAO LUCKY");
    });

    await assertTest("A2. Active vs. Completed Rendering", async () => {
      // Find Completed vessel (HIKARI) and click it
      const hikariCardSelector = '[data-testid="vessel-select-item-hikari"]';
      let card = await page.$(hikariCardSelector);
      if (!card) {
        const found = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
          const target = cards.find(c => c.textContent.includes("HIKARI"));
          if (target) {
            target.click();
            return true;
          }
          return false;
        });
        assert(found, "Could not find vessel card for HIKARI via text fallback");
      } else {
        await card.click();
      }

      // Check for completed status badge
      const hasCompletedBadge = await page.evaluate(() => {
        // Look for completed class or status badge text
        const badges = Array.from(document.querySelectorAll('[class*="statusBadge"], [class*="completed"]'));
        return badges.some(b => b.textContent.includes("완료") || b.textContent.includes("Completed"));
      });
      assert(hasCompletedBadge, "Completed status badge not rendered correctly");
    });

    await assertTest("A3. Selection Highlight Sync", async () => {
      // Click SEIN PHOENIX
      const seinSelector = '[data-testid="vessel-select-item-sein-phoenix"]';
      let card = await page.$(seinSelector);
      if (!card) {
        await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
          const target = cards.find(c => c.textContent.includes("SEIN PHOENIX"));
          if (target) target.click();
        });
      } else {
        await card.click();
      }

      // Verify active class exists on selected vessel
      const isActiveHighlighted = await page.evaluate(() => {
        const activeCards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const activeCard = activeCards.find(c => c.textContent.includes("SEIN PHOENIX") && c.className.includes("active"));
        return activeCard !== undefined;
      });
      assert(isActiveHighlighted, "Selected vessel does not have active styling highlight");
    });

    await assertTest("A4. Vessel Listing Ordering", async () => {
      const isCorrectOrder = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        if (cards.length < 2) return true;
        // active vessels status contains '하역중' (In Progress) and completed contains '하역완료' (Completed)
        // active vessels should be above completed ones in the DOM
        let completedSeen = false;
        for (const card of cards) {
          const statusText = card.textContent;
          const isCompleted = statusText.includes("완료") || statusText.includes("Completed");
          const isActive = statusText.includes("하역중") || statusText.includes("Progress");
          if (isCompleted) {
            completedSeen = true;
          }
          if (isActive && completedSeen) {
            // Found active vessel after completed one!
            return false;
          }
        }
        return true;
      });
      assert(isCorrectOrder, "Active vessels are not ordered above completed ones");
    });

    await assertTest("A5. No Session Bypass Check", async () => {
      const isDashboardVisible = await page.evaluate(() => {
        const container = document.querySelector('[class*="container"]');
        const loginOverlay = document.querySelector('[class*="loginOverlay"]');
        return container !== null && loginOverlay === null;
      });
      assert(isDashboardVisible, "Dashboard should be visible and login overlay dismissed in development mode");
    });

    // --- FEATURE B: SVG SHIP SILHOUETTE ---
    
    await assertTest("B6. Presence of SVG", async () => {
      const svg = await page.$('svg[data-testid="ship-silhouette"]');
      assert(svg !== null, 'Element "svg[data-testid=\'ship-silhouette\']" not found');
    });

    await assertTest("B7. 4x3 Grid Segments", async () => {
      const segmentsCount = await page.evaluate(() => {
        return document.querySelectorAll('[data-testid^="hold-segment-"]').length;
      });
      assert(segmentsCount === 12 || segmentsCount === 15, `Expected 12 or 15 hold segments, found ${segmentsCount}`);
    });

    await assertTest("B8. Slanted Bow Geometry", async () => {
      const isPolygonBow = await page.evaluate(() => {
        const segment1B = document.querySelector('[data-testid="hold-segment-1-B"]');
        const segment1C = document.querySelector('[data-testid="hold-segment-1-C"]');
        return segment1B?.tagName.toLowerCase() === 'polygon' || segment1C?.tagName.toLowerCase() === 'polygon';
      });
      assert(isPolygonBow, "Bow cargo holds (1-B/1-C) should have slanted polygon geometry");
    });

    await assertTest("B9. Fill Completion Heights", async () => {
      const hasClipsOrGradients = await page.evaluate(() => {
        const segments = Array.from(document.querySelectorAll('[data-testid^="hold-segment-"]'));
        return segments.some(el => el.getAttribute('fill')?.includes('url(#') || el.getAttribute('clip-path') !== null);
      });
      assert(hasClipsOrGradients, "SVG segments should use gradients/clip-paths to reflect fill levels");
    });

    await assertTest("B10. Hold Text Overlays", async () => {
      const textOverlaysExist = await page.evaluate(() => {
        const textElements = Array.from(document.querySelectorAll('svg[data-testid="ship-silhouette"] text'));
        return textElements.some(t => t.textContent.includes("4A") || t.textContent.includes("1A"));
      });
      assert(textOverlaysExist, "SVG ship layout should include text overlays for hold names");
    });

    // --- FEATURE C: HOLD TOOLTIPS ON HOVER ---

    await assertTest("C11. Tooltip Trigger", async () => {
      const segment = await page.$('[data-testid="hold-segment-2-A"]');
      assert(segment !== null, 'Hold segment 2-A not found');
      await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box = await segment.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForSelector('[data-testid="hold-tooltip"]', { visible: true, timeout: 1000 });
      const tooltip = await page.$('[data-testid="hold-tooltip"]');
      assert(tooltip !== null, "Tooltip did not appear on hold segment hover");
    });

    await assertTest("C12. Tooltip Telemetry Verification", async () => {
      const tempText = await page.$eval('[data-testid="hold-tooltip"] [data-testid="tooltip-temp"]', el => el.textContent);
      assert(tempText.includes("-24.0") || tempText.includes("-25.0"), `Expected temperature info in tooltip, got: ${tempText}`);
    });

    await assertTest("C13. Tooltip Quality Description", async () => {
      const tooltipText = await page.$eval('[data-testid="hold-tooltip"]', el => el.textContent);
      assert(tooltipText.includes("외관상태 및 색택 전반적으로 양호"), "Tooltip does not render quality text");
    });

    await assertTest("C14. Tooltip Dismissal", async () => {
      await page.mouse.move(0, 0);
      await page.waitForFunction(() => {
        const tt = document.querySelector('[data-testid="hold-tooltip"]');
        return !tt || window.getComputedStyle(tt).opacity === '0' || window.getComputedStyle(tt).display === 'none';
      }, { timeout: 1500 });
      assert(true); // passed if wait succeeds
    });

    await assertTest("C15. Tooltip Update on Swap", async () => {
      // Hover 4-A
      const hold4A = await page.$('[data-testid="hold-segment-4-A"]');
      assert(hold4A !== null, "Segment 4-A not found");
      await hold4A.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box4A = await hold4A.boundingBox();
      await page.mouse.move(box4A.x + box4A.width / 2, box4A.y + box4A.height / 2);
      
      const tooltip4A = await page.$eval('[data-testid="hold-tooltip"]', el => el.textContent);
      
      // Move to 2-A
      const hold2A = await page.$('[data-testid="hold-segment-2-A"]');
      await hold2A.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const box2A = await hold2A.boundingBox();
      await page.mouse.move(box2A.x + box2A.width / 2, box2A.y + box2A.height / 2);
      
      const tooltip2A = await page.$eval('[data-testid="hold-tooltip"]', el => el.textContent);
      assert(tooltip4A !== tooltip2A, "Tooltip content should change when swapping hover target");
    });

    // --- FEATURE D: CIRCULAR PROGRESS GAUGES ---

    await assertTest("D16. Radial SVG Presence", async () => {
      // Click sein-phoenix to make sure we show its gauge
      const gauge = await page.$('svg[data-testid="progress-gauge-sein-phoenix"]');
      assert(gauge !== null, 'Progress gauge SVG not found');
      const circle = await page.$('svg[data-testid="progress-gauge-sein-phoenix"] circle');
      assert(circle !== null, 'Circle element in progress gauge not found');
    });

    await assertTest("D17. Stroke Dash Offset Match", async () => {
      const matchOffset = await page.evaluate(() => {
        const circle = document.querySelector('svg[data-testid="progress-gauge-sein-phoenix"] circle[stroke-dashoffset]');
        if (!circle) return false;
        const offset = parseFloat(circle.getAttribute('stroke-dashoffset'));
        const r = parseFloat(circle.getAttribute('r') || '0');
        const circumference = 2 * Math.PI * r;
        // sein-phoenix is 2304 / 6955 = 33.1% completed.
        // Expected offset around circumference * (1 - 0.331)
        const expected = circumference * (1 - 0.331);
        return Math.abs(offset - expected) < 20; // Allow small layout threshold difference
      });
      assert(matchOffset, "Progress gauge stroke-dashoffset does not correspond to progress percentage");
    });

    await assertTest("D18. Neon/Glow Filter Appended", async () => {
      const hasGlow = await page.evaluate(() => {
        const circle = document.querySelector('svg[data-testid="progress-gauge-sein-phoenix"] circle');
        return circle?.getAttribute('filter')?.includes('url(#radial-glow)') === true;
      });
      assert(hasGlow, "Glow filter should be appended to progress radial circle");
    });

    await assertTest("D19. Percentage Label Sync", async () => {
      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert(label.trim() === "33.1%", `Expected progress label "33.1%", got: ${label}`);
    });

    await assertTest("D20. Dynamic Re-calc on Switch", async () => {
      // Switch to bao-lucky
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("BAO LUCKY"));
        if (target) target.click();
      });
      await page.waitForFunction(
        () => document.querySelector('[data-testid="progress-percentage-label"]')?.textContent.includes("4.8%"),
        { timeout: 3000 }
      );
      const label = await page.$eval('[data-testid="progress-percentage-label"]', el => el.textContent);
      assert(label.trim() === "4.8%", `Gauge percentage label did not dynamically recalculate. Got: ${label}`);
    });

    // --- FEATURE E: VERTICAL TIMELINE PATH ---

    await assertTest("E21. Transit Lane Line Renders", async () => {
      const timelineLine = await page.$('[data-testid="vertical-shipping-path"]');
      assert(timelineLine !== null, 'Vertical timeline path selector "[data-testid=\'vertical-shipping-path\']" not found');
    });

    await assertTest("E22. Reverse Chronological Sort", async () => {
      // For sein-phoenix, timeline dates are: 5/23, 5/24, 5/25
      // Reverse chronological order should show 5/25 on top, then 5/24, then 5/23
      // Switch back to sein-phoenix first
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div[class*="vesselCard"]'));
        const target = cards.find(c => c.textContent.includes("SEIN PHOENIX"));
        if (target) target.click();
      });
      
      const dates = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('[data-testid^="timeline-node-"]'));
        return nodes.map(n => n.getAttribute('data-testid').replace('timeline-node-', ''));
      });
      
      assert(dates.length >= 3, `Expected at least 3 nodes, found ${dates.length}`);
      assert(dates[0] === '5-25', `Expected first node to be 5-25, got ${dates[0]}`);
      assert(dates[1] === '5-24', `Expected second node to be 5-24, got ${dates[1]}`);
      assert(dates[2] === '5-23', `Expected third node to be 5-23, got ${dates[2]}`);
    });

    await assertTest("E23. Anchor Node Presence", async () => {
      const hasAnchorNode = await page.evaluate(() => {
        const node = document.querySelector('[data-testid="timeline-node-5-25"]');
        return node?.querySelector('svg') !== null;
      });
      assert(hasAnchorNode, "Timeline milestones should contain anchor/ship indicator icons");
    });

    await assertTest("E24. Sunday Off-day Rendering", async () => {
      const hasSundayStyle = await page.evaluate(() => {
        const node = document.querySelector('[data-testid="timeline-node-5-24"]');
        // Sunday node should show 휴무 holiday text and distinct style class
        return node?.textContent.includes("휴무") || node?.className.includes("holiday");
      });
      assert(hasSundayStyle, "Sunday node should render with holiday off-day styling");
    });

    await assertTest("E25. Current Voyage Indicator Position", async () => {
      const indicator = await page.$('[data-testid="vertical-shipping-path"] + [class*="indicator"], [data-testid="current-voyage-dot"]');
      assert(indicator !== null, "Current voyage indicator dot/ship should be positioned relative to timeline progress");
    });

  } catch (error) {
    console.error("Tier 1 E2E Test execution failed!", error);
  } finally {
    await browser.close();
    console.log(`\nTier 1 Summary: ${passedCount} passed, ${failedCount} failed.`);
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runTests();
