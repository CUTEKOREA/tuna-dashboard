const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  try {
    await page.goto('https://tuna-dashboard-kappa.vercel.app/cassava', { waitUntil: 'load', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
  } catch (err) {
    console.error('PUPPETEER ERROR:', err.message);
  } finally {
    await browser.close();
  }
})();
