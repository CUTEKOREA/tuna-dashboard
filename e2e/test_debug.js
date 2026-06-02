const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const port = process.env.PORT || 3000;
  await page.goto(`http://localhost:${port}/unloading`, { waitUntil: 'networkidle2' });

  const segment = await page.$('[data-testid="hold-segment-2-A"]');
  if (!segment) {
    console.log("Segment 2-A not found!");
    await browser.close();
    return;
  }

  await segment.evaluate(el => el.scrollIntoView({ block: 'center' }));
  const box = await segment.boundingBox();
  console.log("Bounding box of segment 2-A:", box);

  const elementAtPoint = await page.evaluate((x, y) => {
    const el = document.elementFromPoint(x, y);
    return el ? {
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      outerHTML: el.outerHTML.substring(0, 300)
    } : null;
  }, box.x + box.width / 2, box.y + box.height / 2);

  console.log("Element at center point:", elementAtPoint);

  // Let's also see if hovering manually works
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout?.(500) || new Promise(r => setTimeout(r, 500));

  const tooltipVisible = await page.evaluate(() => {
    const tt = document.querySelector('[data-testid="hold-tooltip"]');
    return tt ? {
      display: window.getComputedStyle(tt).display,
      visibility: window.getComputedStyle(tt).visibility,
      opacity: window.getComputedStyle(tt).opacity,
      outerHTML: tt.outerHTML
    } : null;
  });

  console.log("Tooltip element after hover:", tooltipVisible);

  await browser.close();
}

main().catch(console.error);
