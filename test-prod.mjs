import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    page.on('console', msg => { if (msg.type() === 'error') console.log('PROD PAGE ERR:', msg.text()) });
    page.on('pageerror', err => console.log('PROD PAGE ERROR:', err.toString()));
    
    console.log("Checking /squid...");
    const res1 = await page.goto('https://tuna-dashboard-kappa.vercel.app/squid', { waitUntil: 'networkidle2' });
    console.log("Squid Status:", res1.status());

    console.log("Checking /carrot...");
    const res2 = await page.goto('https://tuna-dashboard-kappa.vercel.app/carrot', { waitUntil: 'networkidle2' });
    console.log("Carrot Status:", res2.status());
  } finally {
    await browser.close();
  }
})();
