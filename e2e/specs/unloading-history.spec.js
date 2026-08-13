const puppeteer = require('puppeteer');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const port = process.env.PORT || 3027;
const url = `http://127.0.0.1:${port}/unloading`;
const appOrigin = new URL(url).origin;
const thirdPartyHosts = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'googletagmanager.com',
  'google-analytics.com',
  'googlesyndication.com',
  'doubleclick.net',
];

function isBlockedThirdPartyUrl(value) {
  try {
    const hostname = new URL(value).hostname;
    return thirdPartyHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function isAppOwnedUrl(value, origin) {
  if (!value) return true;
  try {
    return new URL(value, origin).origin === origin;
  } catch {
    return true;
  }
}

function shouldCaptureConsoleError(message, origin, allowedPatterns = []) {
  if (message.type !== 'error') return false;
  if (message.locationUrl && !isAppOwnedUrl(message.locationUrl, origin)) return false;
  return !allowedPatterns.some((pattern) => pattern.test(message.text));
}

function shouldCaptureNetworkFailure(value, origin, expectedPath) {
  if (!isAppOwnedUrl(value, origin)) return false;
  if (!expectedPath) return true;
  try {
    return new URL(value, origin).pathname !== expectedPath;
  } catch {
    return true;
  }
}

async function preparePage(page, { failHistoryApi = false, blockedAppPath } = {}) {
  const pageErrors = [];
  const consoleErrors = [];
  const networkErrors = [];
  let blockedAppRequestCount = 0;
  const expectedPath = failHistoryApi ? '/api/unloading-history' : blockedAppPath;
  const allowedConsolePatterns = failHistoryApi
    ? [/500 \(Internal Server Error\)/]
    : blockedAppPath
      ? [/과거 실적 패널 렌더링 오류|ChunkLoadError|Loading chunk|Failed to load resource/i]
      : [];

  await page.setBypassServiceWorker(true);
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (isBlockedThirdPartyUrl(request.url())) {
      void request.abort('blockedbyclient');
      return;
    }
    if (
      blockedAppPath
      && blockedAppRequestCount === 0
      && new URL(request.url()).pathname === blockedAppPath
    ) {
      blockedAppRequestCount += 1;
      void request.abort('failed');
      return;
    }
    if (failHistoryApi && new URL(request.url()).pathname === '/api/unloading-history') {
      void request.respond({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      });
      return;
    }
    void request.continue();
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    const location = message.location();
    const diagnostic = {
      type: message.type(),
      text: message.text(),
      locationUrl: location.url,
    };
    if (shouldCaptureConsoleError(diagnostic, appOrigin, allowedConsolePatterns)) {
      consoleErrors.push(diagnostic.text);
    }
  });
  page.on('requestfailed', (request) => {
    if (shouldCaptureNetworkFailure(request.url(), appOrigin, expectedPath)) {
      networkErrors.push(`${request.url()}: ${request.failure()?.errorText ?? '알 수 없는 네트워크 오류'}`);
    }
  });
  page.on('response', (response) => {
    const responseUrl = response.url();
    if (
      response.status() >= 400
      && shouldCaptureNetworkFailure(responseUrl, appOrigin, expectedPath)
    ) {
      networkErrors.push(`${responseUrl}: HTTP ${response.status()}`);
    }
  });

  return {
    pageErrors,
    consoleErrors,
    networkErrors,
    getBlockedAppRequestCount: () => blockedAppRequestCount,
  };
}

function findHistoryChunkPath() {
  const chunksRoot = path.resolve(__dirname, '..', '..', '.next', 'static', 'chunks');
  const pending = [chunksRoot];
  while (pending.length > 0) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        pending.push(absolutePath);
      } else if (
        entry.name.endsWith('.js')
        && fs.readFileSync(absolutePath, 'utf8').includes('2021~2025 역사 실적')
      ) {
        const chunkPath = path.relative(chunksRoot, absolutePath).split(path.sep).join('/');
        return `/_next/static/chunks/${chunkPath}`;
      }
    }
  }
  throw new Error('Could not locate the built unloading history chunk');
}

async function unlock(page) {
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('silla-operation-access', 'granted');
  });
}

async function waitForText(page, selector, pattern) {
  await page.waitForFunction(
    (target, source, flags) => {
      const text = document.querySelector(target)?.textContent || '';
      return new RegExp(source, flags).test(text);
    },
    { timeout: 15000 },
    selector,
    pattern.source,
    pattern.flags,
  );
}

async function runHappyPath(browser) {
  const page = await browser.newPage();
  const { pageErrors, consoleErrors, networkErrors } = await preparePage(page);
  await unlock(page);
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-testid="unloading-history-panel"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /76,050\.239 MT/);

  const body = await page.evaluate(() => document.body.innerText);
  assert.match(body, /34,132\s+MT/);
  assert.match(body, /완료 선박:\s*11\s*척/);

  await page.click('[data-testid="history-year-2021"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /29,247\.939 MT/);
  const year2021 = await page.$eval('[data-testid="unloading-history-panel"]', (node) => node.innerText);
  assert.match(year2021, /자료 미확인|부분 자료/);

  await page.click('[data-testid="history-year-2023"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /94,075\.080 MT/);
  const januaryQueen = await page.$$eval(
    '[data-testid="unloading-history-panel"] tbody tr',
    (rows) => rows.map((row) => row.innerText).find((text) => text.includes('2023.01.11')),
  );
  assert.match(januaryQueen || '', /SEIN QUEEN/);
  assert.match(januaryQueen || '', /2023\.01\.11 ~ 2023\.01\.31/);
  assert.match(januaryQueen || '', /방콕/);
  assert.match(januaryQueen || '', /5,828\.970 MT/);
  assert.match(januaryQueen || '', /검증 완료/);

  await page.click('[data-testid="history-year-2025"]');
  await page.click('[data-testid="history-port-SKL"]');
  const songkhla = await page.$eval('[data-testid="unloading-history-panel"]', (node) => node.innerText);
  assert.match(songkhla, /SEIN GRACE/);
  assert.doesNotMatch(songkhla, /SEIN TOPAZ/);

  await page.focus('[data-testid="history-year-2025"]');
  await page.keyboard.press('ArrowLeft');
  assert.equal(
    await page.$eval('[data-testid="history-year-2024"]', (node) => node.getAttribute('aria-selected')),
    'true',
  );

  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-testid="unloading-history-panel"]');
  await page.click('[data-testid="history-year-2023"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /94,075\.080 MT/);
  const mobilePanel = await page.$eval(
    '[data-testid="unloading-history-panel"]',
    (node) => node.innerText,
  );
  assert.match(mobilePanel, /2023\.01\.11 ~ 2023\.01\.31/);
  assert.match(mobilePanel, /5,828\.970 MT/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.equal(overflow, 0);
  assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  assert.equal(consoleErrors.length, 0, consoleErrors.join('\n'));
  assert.equal(networkErrors.length, 0, networkErrors.join('\n'));
  await page.close();
}

async function runFailureIsolation(browser) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const { pageErrors, consoleErrors, networkErrors } = await preparePage(page, {
    failHistoryApi: true,
  });
  await unlock(page);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await waitForText(page, '[data-testid="unloading-history-section"]', /과거 이력을 불러오지 못했습니다/);
  const body = await page.evaluate(() => document.body.innerText);
  assert.match(body, /다시 시도/);
  assert.match(body, /34,132\s+MT/);
  assert.match(body, /완료 선박:\s*11\s*척/);
  assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  assert.equal(consoleErrors.length, 0, consoleErrors.join('\n'));
  assert.equal(networkErrors.length, 0, networkErrors.join('\n'));
  await page.close();
}

async function runChunkFailureIsolation(browser) {
  const historyChunkPath = findHistoryChunkPath();
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const {
    pageErrors,
    consoleErrors,
    networkErrors,
    getBlockedAppRequestCount,
  } = await preparePage(page, {
    blockedAppPath: historyChunkPath,
  });
  await unlock(page);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await waitForText(
    page,
    '[data-testid="unloading-history-boundary-error"]',
    /과거 실적 패널을 표시하지 못했습니다/,
  );
  const body = await page.evaluate(() => document.body.innerText);
  assert.match(body, /다시 시도/);
  assert.match(body, /34,132\s+MT/);
  assert.match(body, /완료 선박:\s*11\s*척/);
  assert.equal(getBlockedAppRequestCount(), 1);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('[data-testid="unloading-history-boundary-error"] button'),
  ]);
  await page.waitForSelector('[data-testid="unloading-history-panel"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /76,050\.239 MT/);
  const recoveredBody = await page.evaluate(() => document.body.innerText);
  assert.match(recoveredBody, /34,132\s+MT/);
  assert.match(recoveredBody, /완료 선박:\s*11\s*척/);
  assert.equal(getBlockedAppRequestCount(), 1);
  assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  assert.equal(consoleErrors.length, 0, consoleErrors.join('\n'));
  assert.equal(networkErrors.length, 0, networkErrors.join('\n'));
  await page.close();
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    await runHappyPath(browser);
    await runFailureIsolation(browser);
    await runChunkFailureIsolation(browser);
    console.log('PASS unloading history desktop, mobile, keyboard, API and chunk failure isolation');
  } finally {
    await browser.close();
  }
}

module.exports = {
  isBlockedThirdPartyUrl,
  shouldCaptureConsoleError,
  shouldCaptureNetworkFailure,
};

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
