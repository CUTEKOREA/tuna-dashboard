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

async function preparePage(
  page,
  { failHistoryApi = false, blockedAppPath, historyResponse } = {},
) {
  const localE2EAuthSecret = process.env.DASHBOARD_E2E_AUTH_SECRET;
  assert.ok(localE2EAuthSecret, '로컬 E2E 인증 비밀값이 필요합니다');
  const pageErrors = [];
  const consoleErrors = [];
  const networkErrors = [];
  let blockedAppRequestCount = 0;
  let historyApiRequestCount = 0;
  const expectedPath = failHistoryApi ? '/api/unloading-history' : blockedAppPath;
  const blockedExternalScriptPatterns = [
    /The script resource is behind a redirect, which is disallowed\./,
  ];
  const allowedConsolePatterns = failHistoryApi
    ? [...blockedExternalScriptPatterns, /500 \(Internal Server Error\)/]
    : blockedAppPath
      ? [...blockedExternalScriptPatterns, /과거 실적 패널 렌더링 오류|ChunkLoadError|Loading chunk|Failed to load resource/i]
      : blockedExternalScriptPatterns;

  await page.setBypassServiceWorker(true);
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (!isAppOwnedUrl(request.url(), appOrigin)) {
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
    if (historyResponse && new URL(request.url()).pathname === '/api/unloading-history') {
      historyApiRequestCount += 1;
      void request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(historyResponse()),
      });
      return;
    }
    const requestHeaders = isAppOwnedUrl(request.url(), appOrigin)
      ? { ...request.headers(), 'x-dashboard-e2e-secret': localE2EAuthSecret }
      : request.headers();
    void request.continue({ headers: requestHeaders });
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
    const failureText = request.failure()?.errorText ?? '알 수 없는 네트워크 오류';
    const requestUrl = new URL(request.url(), appOrigin);
    if (failureText === 'net::ERR_ABORTED' && requestUrl.searchParams.has('_rsc')) {
      return;
    }
    if (shouldCaptureNetworkFailure(request.url(), appOrigin, expectedPath)) {
      networkErrors.push(`${request.url()}: ${failureText}`);
    }
  });
  page.on('response', (response) => {
    const responseUrl = response.url();
    if (
      response.request().resourceType() === 'script'
      && response.status() >= 300
      && response.status() < 400
      && isAppOwnedUrl(responseUrl, appOrigin)
    ) {
      networkErrors.push(`${responseUrl}: HTTP ${response.status()}`);
      return;
    }
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
    getHistoryApiRequestCount: () => historyApiRequestCount,
  };
}

function readHistorySnapshot() {
  return JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'lib', 'unloading-history', 'history_2021_2025.json'),
    'utf8',
  ));
}

function buildPreVerificationSnapshot() {
  const snapshot = structuredClone(readHistorySnapshot());
  Object.assign(snapshot.meta, {
    verifiedVoyageCount: 87,
    unverifiedVoyageCount: 7,
    generatedAt: '2026-08-12T23:40:00+09:00',
    dataAsOf: '2026-08-12',
  });
  Object.assign(snapshot._metadata, {
    syncDate: '2026-08-12',
    dataAsOf: '2026-08-12',
  });

  const annual2023 = snapshot.annual.find((row) => row.year === 2023);
  Object.assign(annual2023, {
    verifiedActualMt: 88246.11,
    verifiedVoyageCount: 28,
    candidateVoyageCount: 29,
    partialCount: 0,
    unverifiedCount: 1,
    averageVerifiedMt: 3151.6468,
    allocationMethodCounts: {
      dailyReport: 3,
      completionYear: 25,
      finalReportAdjustment: 0,
    },
  });

  const voyageIndex = snapshot.voyages.findIndex(
    (voyage) => voyage.voyageId === 'sein-queen-2023-01-11-bkk',
  );
  snapshot.voyages[voyageIndex] = {
    voyageId: 'sein-queen-2023-unknown-01',
    sourceYear: 2023,
    completionYear: null,
    displayYearBasis: 'source_year',
    vessel: { canonicalName: 'SEIN QUEEN' },
    period: { startDate: null, endDate: null },
    ports: [],
    reportedMt: null,
    actualMt: null,
    verification: 'unverified',
    kpiIncluded: false,
    yearAllocations: [],
    evidenceDocumentCount: 1,
  };
  return snapshot;
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
  const response = await page.goto(`${appOrigin}/api/mgo`, {
    waitUntil: 'networkidle0',
  });
  assert.equal(response?.status(), 200, '로컬 E2E 인증 경계를 통과해야 합니다');
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

async function clickButtonByText(page, label) {
  const clicked = await page.$$eval(
    'button',
    (buttons, target) => {
      const button = buttons.find((candidate) => candidate.textContent?.trim() === target);
      if (!button) return false;
      button.click();
      return true;
    },
    label,
  );
  assert.equal(clicked, true, `버튼을 찾지 못했습니다: ${label}`);
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
  assert.match(body, /38,966\s+MT/);
  assert.match(body, /Low\s+\(방콕\)/);
  assert.match(body, /허용\s+13\.3일/);
  assert.match(body, /사용\s+6일/);
  assert.match(body, /여유\s+7\.3일/);
  assert.doesNotMatch(body, /진행 중 항차가 없어 체선 계산 대상이 없습니다/);
  assert.match(body, /M\/V HIKARI 1 - 상세 하역 분석/);
  assert.match(body, /완료 선박:\s*12\s*척/);
  assert.doesNotMatch(body, /어종 분해 미확인/);

  const hikariDemurrageText = await page.$eval(
    '[data-testid="selected-vessel-demurrage"]',
    (node) => node.innerText,
  );
  for (const pattern of [
    /체선 등급\s+낮음/,
    /허용 정박일수\s+13\.3일/,
    /사용일수\s+6일/,
    /여유\s+7\.3일/,
    /체선료 추정\s+없음/,
    /2026년\s+13항차 동일 산식 적용/,
  ]) {
    assert.match(hikariDemurrageText, pattern);
  }

  const expandedCompleted = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')]
      .find((candidate) => candidate.textContent?.includes('완료 선박 펼치기'));
    button?.click();
    return Boolean(button);
  });
  assert.equal(expandedCompleted, true, '완료 선박 목록을 펼치지 못했습니다.');
  await page.waitForSelector('[data-testid="vessel-select-item-sein-venus"]');
  await page.click('[data-testid="vessel-select-item-sein-venus"]');
  await page.waitForFunction(() => (
    document.querySelector('[data-testid="selected-vessel-demurrage"]')?.textContent?.includes('14.9일')
  ));
  const seinVenusDemurrageText = await page.$eval(
    '[data-testid="selected-vessel-demurrage"]',
    (node) => node.innerText,
  );
  for (const pattern of [
    /체선 등급\s+주의/,
    /허용 정박일수\s+14\.9일/,
    /사용일수\s+13일/,
    /여유\s+1\.9일/,
    /체선료 추정\s+없음/,
  ]) {
    assert.match(seinVenusDemurrageText, pattern);
  }
  const noWorkDays = await page.$eval(
    '[data-testid="unloading-daily-chart"]',
    (node) => node.getAttribute('data-no-work-days'),
  );
  assert.equal(noWorkDays, '8/9,8/12,8/16');

  await page.click('[data-testid="vessel-select-item-sein-phoenix-2025-12"]');
  await page.waitForFunction(() => (
    document.querySelector('[data-testid="selected-vessel-demurrage"]')?.textContent?.includes('$30,000')
  ));
  const crossYearDemurrageText = await page.$eval(
    '[data-testid="selected-vessel-demurrage"]',
    (node) => node.innerText,
  );
  for (const pattern of [
    /체선 등급\s+높음/,
    /사용일수\s+20일/,
    /초과\s+3\.0일/,
    /체선료 추정\s+\$30,000 \(조율 전\)/,
  ]) {
    assert.match(crossYearDemurrageText, pattern);
  }

  await page.click('[data-testid="vessel-select-item-sein-venus"]');
  await page.waitForFunction(() => (
    document.querySelector('[data-testid="selected-vessel-demurrage"]')?.textContent?.includes('14.9일')
  ));

  await page.click('#unloading-tab-timeline');
  await page.waitForSelector('[data-testid="timeline-node-8-22"]');
  const latestReport = await page.$eval(
    '[data-testid="timeline-node-8-22"]',
    (node) => node.innerText,
  );
  for (const pattern of [
    /8\/22/,
    /08:20 ~ 10:40/,
    /\+89\.520 MT/,
    /GPZ\s+89\.520 MT/,
    /S\/PIO\(#1-C\)/,
    /-21\.0℃ ~ -22\.0℃/,
    /당일 보정 -7\.450 MT/,
    /누적 보정 \+54\.080 MT/,
    /실제 잔량 0 MT/,
  ]) {
    assert.match(latestReport, pattern);
  }
  assert.doesNotMatch(latestReport, /300톤/);

  await page.click('#unloading-tab-holds');
  await page.waitForSelector('[data-testid="hold-species-unavailable"]');
  const unavailableHold = await page.$eval(
    '[data-testid="hold-species-unavailable"]',
    (node) => node.innerText,
  );
  assert.match(unavailableHold, /어창별 어종 분해 없음/);
  assert.match(unavailableHold, /일일 결과보고는 어종별 합계를 제공/);
  assert.match(unavailableHold, /추정하지 않습니다/);

  await clickButtonByText(page, '리플레이');
  await page.waitForSelector('[data-testid="replay-species-chart"]');
  const replayText = await page.$eval(
    '[data-testid="replay-species-chart"]',
    (node) => node.innerText,
  );
  assert.doesNotMatch(replayText, /어종별 실적 추이 미제공/);
  await page.click('button[aria-label="Close"]');

  await clickButtonByText(page, '보고서');
  await page.waitForSelector('[role="dialog"][aria-label="일일 보고서 자동 생성"]');
  const generatedReport = await page.$eval(
    '[role="dialog"][aria-label="일일 보고서 자동 생성"]',
    (node) => node.innerText,
  );
  for (const pattern of [
    /금일\(8\/22\)/,
    /GPZ:\s+89\.520 MT/,
    /일일\s+하역량:\s+89\.520 MT/,
    /하 역 누 계:\s+3,329\.080 MT/,
    /증\s+감:\s+\+\s+54\.080 MT/,
    /-21\.0℃ ~ -22\.0℃/,
    /운반선 SEIN VENUS\(BKK\)에서 보고량\(3,275톤\) 대비 54\.080톤 증가한 3,329\.080톤 하역 종료하였습니다/,
  ]) {
    assert.match(generatedReport, pattern);
  }
  assert.doesNotMatch(generatedReport, /\* SJ:\s+89\.520 MT/);
  assert.doesNotMatch(generatedReport, /명일 하역 예정량/);
  await page.click('[role="dialog"][aria-label="일일 보고서 자동 생성"] button[aria-label="닫기"]');

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
  assert.match(body, /38,966\s+MT/);
  assert.match(body, /완료 선박:\s*12\s*척/);
  assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  assert.equal(consoleErrors.length, 0, consoleErrors.join('\n'));
  assert.equal(networkErrors.length, 0, networkErrors.join('\n'));
  await page.close();
}

async function runOpenTabRefresh(browser) {
  const page = await browser.newPage();
  let historySnapshot = buildPreVerificationSnapshot();
  const {
    pageErrors,
    consoleErrors,
    networkErrors,
    getHistoryApiRequestCount,
  } = await preparePage(page, {
    historyResponse: () => historySnapshot,
  });
  await unlock(page);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.click('[data-testid="history-year-2023"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /88,246\.110 MT/);
  assert.equal(getHistoryApiRequestCount(), 1);

  historySnapshot = readHistorySnapshot();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));

  await waitForText(page, '[data-testid="history-kpi-actual"]', /94,075\.080 MT/);
  assert.equal(getHistoryApiRequestCount(), 2);
  const januaryQueen = await page.$$eval(
    '[data-testid="unloading-history-panel"] tbody tr',
    (rows) => rows.map((row) => row.innerText).find((text) => text.includes('2023.01.11')),
  );
  assert.match(januaryQueen || '', /SEIN QUEEN/);
  assert.match(januaryQueen || '', /5,828\.970 MT/);
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
  assert.match(body, /38,966\s+MT/);
  assert.match(body, /완료 선박:\s*12\s*척/);
  assert.equal(getBlockedAppRequestCount(), 1);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('[data-testid="unloading-history-boundary-error"] button'),
  ]);
  await page.waitForSelector('[data-testid="unloading-history-panel"]');
  await waitForText(page, '[data-testid="history-kpi-actual"]', /76,050\.239 MT/);
  const recoveredBody = await page.evaluate(() => document.body.innerText);
  assert.match(recoveredBody, /38,966\s+MT/);
  assert.match(recoveredBody, /완료 선박:\s*12\s*척/);
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
    await runOpenTabRefresh(browser);
    await runFailureIsolation(browser);
    await runChunkFailureIsolation(browser);
    console.log('PASS unloading history desktop, mobile, keyboard, open-tab refresh, API and chunk failure isolation');
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
