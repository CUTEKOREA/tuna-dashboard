const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const secret = fs.readFileSync('/tmp/td_e2e_secret.txt','utf8').trim();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const out = [];
  for (const [slug, key] of [['squid-industry','squid'],['tuna-industry','tuna'],['mackerel-industry','mackerel'],['whelk-industry','whelk'],['shrimp-industry','shrimp'],['pollock-industry','pollock'],['tuna-anatomy','tuna-anatomy']]) {
    for (const width of [1440, 390]) {
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({ 'x-dashboard-e2e-secret': secret });
      await page.setViewport({ width, height: 900 });
      await page.goto(`http://127.0.0.1:3111/${slug}`, { waitUntil: 'networkidle0', timeout: 90000 });
      await page.waitForFunction((k) => document.querySelectorAll(`[id^="${k}-stage-"]`).length > 0, { timeout: 60000 }, key).catch(()=>{});
      const r = await page.evaluate((k) => {
        const stages = new Set([...document.querySelectorAll(`[id^="${k}-stage-"]`)].map(e => e.id)).size;
        const tabs = new Set([...document.querySelectorAll(`[id^="${k}-industry-tab-"]`)].map(e => e.id)).size;
        const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
        const next = document.querySelectorAll('[class*="stageNext"]').length;
        const h = document.documentElement.scrollHeight;
        return { stages, tabs, overflow: sw - cw, next, height: h };
      }, key);
      out.push({ slug, width, ...r });
      if (width === 1440 && (slug === 'squid-industry')) {
        await page.screenshot({ path: `/tmp/td_shots/${slug}_${width}_top.png` });
        // 스크롤 추적: 5번째 절로 스크롤 후 활성 탭 확인
        const active0 = await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent);
        await page.evaluate((k) => { const els=[...document.querySelectorAll(`[id^="${k}-stage-"]`)]; const y = els[4].getBoundingClientRect().top + window.scrollY - 8; window.scrollTo(0, y); }, key);
        await new Promise(r => setTimeout(r, 800));
        const active1 = await page.evaluate(() => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent);
        await page.screenshot({ path: `/tmp/td_shots/${slug}_${width}_mid.png` });
        out.push({ slug, scrollspy: { before: active0, after: active1 } });
      }
      if (width === 390 && slug === 'squid-industry') await page.screenshot({ path: `/tmp/td_shots/${slug}_390_top.png` });
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync('/tmp/td_shots/result.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
