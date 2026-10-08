// Measure how wide every chart renders on each dashboard menu (read-only, local E2E auth bypass).
// Usage: VW=1309 node e2e/measure-chart-layout.js <out.json> [menu,menu,...]
// Per menu: load, scroll to mount lazy widgets, click through each [role=tab] / stage nav button, and record
// every chart (recharts wrapper / echarts instance): cw = chart width / main width, pts = points on the longest
// line, cats = categories per bar series. Used for the "charts 2 per row" rule (docs/run-log/chart-rollout_2026-09-11.md):
// cw > 0.6 is full width, which is only allowed for dense (> 24 points), table-bearing or toggle-dense charts.
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || 'chart-layout.json');
const PORT = Number(process.env.SHOT_PORT || 3917);
const VW = Number(process.env.VW || 1440);
const puppeteer = require(path.join(ROOT, 'node_modules', 'puppeteer'));
const reg = fs.readFileSync(path.join(ROOT, 'lib/dashboard-registry.ts'), 'utf8');
const MENUS = process.argv[3] ? process.argv[3].split(',')
  : [...reg.match(/DASHBOARD_PANEL_ORDER = \[([\s\S]*?)\]/)[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);

const secret = crypto.randomBytes(32).toString('hex');
const env = { ...process.env, DASHBOARD_E2E_MODE: 'local', DASHBOARD_E2E_AUTH_SECRET: secret, NEXT_TELEMETRY_DISABLED: '1' };
delete env.VERCEL; delete env.VERCEL_ENV;
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next', { paths: [ROOT] }), 'dev', '-p', String(PORT), '-H', '127.0.0.1'],
  { cwd: ROOT, env, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitUp(deadline) {
  return new Promise((resolve, reject) => {
    const poll = () => {
      const req = http.get({ host: '127.0.0.1', port: PORT, path: '/market', headers: { 'x-dashboard-e2e-secret': secret } }, (r) => { r.resume(); resolve(); });
      req.setTimeout(3000, () => req.destroy());
      req.on('error', () => (Date.now() > deadline ? reject(new Error('server not up')) : setTimeout(poll, 1000)));
    };
    poll();
  });
}

async function scrollThrough(page) {
  for (let i = 0; i < 40; i++) {
    const done = await page.evaluate(() => {
      const el = document.scrollingElement;
      const before = el.scrollTop;
      el.scrollTop += window.innerHeight * 0.9;
      return el.scrollTop === before;
    });
    await sleep(350);
    if (done) break;
  }
  await page.evaluate(() => { document.scrollingElement.scrollTop = 0; });
  await sleep(300);
}

function collect(page, tab) {
  return page.evaluate((tabLabel) => {
    const mainW = (document.querySelector('main') || document.body).getBoundingClientRect().width;
    return [...document.querySelectorAll('.recharts-wrapper, [_echarts_instance_]')]
      .filter((el) => !el.parentElement.closest('.recharts-wrapper, [_echarts_instance_]'))
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => {
        const card = el.closest('[data-pillar], figure') || el.parentElement.parentElement;
        const heading = document.evaluate('preceding::*[self::h1 or self::h2 or self::h3 or self::h4][1]', card, null, 9, null).singleNodeValue;
        return {
          tab: tabLabel,
          title: (card.querySelector('h3, h4, h2, figcaption strong')?.textContent || '').trim().slice(0, 60),
          heading: (heading?.textContent || '').trim().slice(0, 50),
          cw: +(el.getBoundingClientRect().width / mainW).toFixed(2),
          pts: Math.max(0, ...[...el.querySelectorAll('.recharts-line-curve, .recharts-area-curve')]
            .map((c) => ((c.getAttribute('d') || '').match(/[LC]/g) || []).length + 1)),
          cats: Math.round(el.querySelectorAll('.recharts-bar-rectangle').length / Math.max(1, el.querySelectorAll('.recharts-bar').length)),
        };
      });
  }, tab);
}

(async () => {
  const result = {};
  try {
    await waitUp(Date.now() + 180_000);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], protocolTimeout: 600_000 });
    for (const menu of MENUS) {
      const page = await browser.newPage();
      await page.setViewport({ width: VW, height: 1000 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.setExtraHTTPHeaders({ 'x-dashboard-e2e-secret': secret });
      const rows = [];
      try {
        await page.goto(`http://127.0.0.1:${PORT}/${menu}`, { waitUntil: 'networkidle2', timeout: 180_000 });
        await sleep(2500);
        await scrollThrough(page);
        rows.push(...(await collect(page, '')));
        const sel = 'main [role="tab"], main nav button';
        const count = (await page.$$(sel)).length;
        for (let i = 0; i < count; i++) {
          const tabs = await page.$$(sel);
          if (!tabs[i]) break;
          const label = (await tabs[i].evaluate((b) => b.textContent.trim())).slice(0, 30);
          await tabs[i].click();
          await sleep(1500);
          await scrollThrough(page);
          rows.push(...(await collect(page, label)));
        }
      } catch (e) {
        rows.push({ error: String(e).slice(0, 200) });
      }
      const seen = new Set();
      result[menu] = rows.filter((r) => {
        const k = r.error || `${r.title}|${r.heading}|${r.cw}|${r.pts}|${r.cats}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      const wide = result[menu].filter((r) => r.cw > 0.6).length;
      console.log(`${menu}\tcharts=${result[menu].length}\tfull-width=${wide}`);
      await page.close();
    }
    await browser.close();
  } catch (e) {
    console.error(String(e));
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
    server.kill('SIGTERM');
  }
})();
