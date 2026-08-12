import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GET as getCurrent } from '../app/api/unloading-db/route';
import { GET as getHistory } from '../app/api/unloading-history/route';
import { UnloadingHistoryBoundary } from '../components/UnloadingHistoryBoundary';

const require = createRequire(import.meta.url);
const { load: loadYaml, JSON_SCHEMA } = require('js-yaml') as {
  load: (source: string, options?: { schema?: unknown }) => unknown;
  JSON_SCHEMA: unknown;
};
const {
  isBlockedThirdPartyUrl,
  shouldCaptureConsoleError,
  shouldCaptureNetworkFailure,
} = require('../e2e/specs/unloading-history.spec.js') as {
  isBlockedThirdPartyUrl: (url: string) => boolean;
  shouldCaptureConsoleError: (
    message: { type: string; text: string; locationUrl?: string },
    origin: string,
    allowedPatterns?: RegExp[],
  ) => boolean;
  shouldCaptureNetworkFailure: (
    url: string,
    origin: string,
    expectedPath?: string,
  ) => boolean;
};

describe('unloading history isolation', () => {
  it('does not mix historical IDs into the current operational API', async () => {
    const current = await (await getCurrent()).json();
    const history = await (await getHistory()).json();

    expect(current.success).toBe(true);
    expect(history.success).toBe(true);
    const currentIds = new Set(Object.keys(current.data));
    expect(history.voyages.some((voyage: { voyageId: string }) => currentIds.has(voyage.voyageId))).toBe(false);
    expect(Object.keys(current.data)).toHaveLength(9);
  });

  it('lazy-loads history after analytics without changing its current data input', () => {
    const source = readFileSync(join(process.cwd(), 'components/UnloadingStatus.tsx'), 'utf8');

    expect(source).toContain("import UnloadingHistoryBoundary from './UnloadingHistoryBoundary'");
    expect(source).toContain('<UnloadingHistoryBoundary />');
    expect(source).toContain('allVessels={data}');
    expect(source.indexOf('<UnloadingHistoryBoundary />')).toBeGreaterThan(source.indexOf('<UnloadingAnalytics'));
    expect(source).not.toContain('vesselsList.push');
    expect(source).not.toContain('data.history');
    expect(source).not.toContain("fetch('/api/unloading-history'");
  });

  it('isolates a history chunk failure and delegates retry without reusing the failed import', () => {
    let retryCount = 0;
    const failedState = UnloadingHistoryBoundary.getDerivedStateFromError();
    const boundary = new UnloadingHistoryBoundary({
      loadHistory: async () => { throw new Error('history chunk failed'); },
      onRetry: () => { retryCount += 1; },
    });
    boundary.state = { ...boundary.state, ...failedState };

    const markup = renderToStaticMarkup(boundary.render());
    expect(markup).toContain('과거 실적 패널을 표시하지 못했습니다.');
    expect(markup).toContain('다시 시도');
    expect(markup).toContain('data-testid="unloading-history-boundary-error"');
    expect(markup).not.toContain('history chunk failed');

    boundary.retryHistory();
    expect(retryCount).toBe(1);
    expect(boundary.state).toEqual({ hasError: true });
  });

  it('blocks third-party noise while retaining app-owned browser failures', () => {
    const origin = 'http://127.0.0.1:3027';

    expect(isBlockedThirdPartyUrl('https://fonts.googleapis.com/css2?family=Inter')).toBe(true);
    expect(isBlockedThirdPartyUrl('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')).toBe(true);
    expect(isBlockedThirdPartyUrl(`${origin}/_next/static/chunks/history.js`)).toBe(false);

    expect(shouldCaptureConsoleError({
      type: 'error',
      text: 'font request failed',
      locationUrl: 'https://fonts.gstatic.com/s/inter.woff2',
    }, origin)).toBe(false);
    expect(shouldCaptureConsoleError({
      type: 'error',
      text: 'chunk crashed',
      locationUrl: `${origin}/_next/static/chunks/history.js`,
    }, origin)).toBe(true);
    expect(shouldCaptureConsoleError({ type: 'error', text: 'React render failed' }, origin)).toBe(true);
    expect(shouldCaptureConsoleError({
      type: 'error',
      text: '500 (Internal Server Error)',
      locationUrl: `${origin}/unloading`,
    }, origin, [/500 \(Internal Server Error\)/])).toBe(false);

    expect(shouldCaptureNetworkFailure(`${origin}/_next/static/chunks/history.js`, origin)).toBe(true);
    expect(shouldCaptureNetworkFailure('https://fonts.gstatic.com/s/inter.woff2', origin)).toBe(false);
    expect(shouldCaptureNetworkFailure(`${origin}/api/unloading-history`, origin, '/api/unloading-history')).toBe(false);
  });

  it('runs the history browser acceptance in CI when e2e files change', () => {
    const workflowSource = readFileSync(
      join(process.cwd(), '.github/workflows/app-quality-gate.yml'),
      'utf8',
    );
    const workflow = loadYaml(workflowSource, { schema: JSON_SCHEMA }) as {
      on: {
        pull_request: { paths: string[] };
        push: { paths: string[] };
      };
      jobs: { verify: { steps: Array<{ name?: string; run?: string }> } };
    };
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };
    const steps = workflow.jobs.verify.steps;
    const qualityGateIndex = steps.findIndex((step) => step.run === 'npm run verify');
    const historyE2eIndex = steps.findIndex(
      (step) => step.run === 'npm run test:e2e:unloading-history',
    );

    expect(workflow.on.pull_request.paths).toContain('e2e/**');
    expect(workflow.on.push.paths).toContain('e2e/**');
    expect(workflow.on.pull_request.paths).toContain('.github/workflows/app-quality-gate.yml');
    expect(workflow.on.push.paths).toContain('.github/workflows/app-quality-gate.yml');
    expect(packageJson.scripts['test:e2e:unloading-history']).toBe(
      'node e2e/run-unloading-history.js',
    );
    expect(historyE2eIndex).toBeGreaterThan(qualityGateIndex);
  });
});
