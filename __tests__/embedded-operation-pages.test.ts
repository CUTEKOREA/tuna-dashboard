import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BangkokOfficeDashboard,
  CosmoDashboard,
  EmbeddedDashboardFrameView,
} from '../components/EmbeddedDashboardFrame';

describe('embedded operation pages', () => {
  it('renders the Bangkok weekly report in a full-size unsandboxed iframe', () => {
    const markup = renderToStaticMarkup(React.createElement(BangkokOfficeDashboard));

    expect(markup).toContain('src="/reports/bangkok_weekly_2020_2026.html"');
    expect(markup).toContain('title="방콕사무소 주간보고"');
    expect(markup).toContain('width:100%');
    expect(markup).toContain('height:100%');
    expect(markup).toContain('border:0');
    expect(markup).toContain('방콕사무소 주간보고 불러오는 중...');
    expect(markup).not.toContain('sandbox=');
  });

  it('keeps the protected Cosmo iframe unmounted until availability is confirmed', () => {
    const markup = renderToStaticMarkup(React.createElement(CosmoDashboard));

    expect(markup).toContain('코스모 대시보드 연결 중...');
    expect(markup).not.toContain('<iframe');
  });

  it('renders the required Korean Cosmo fallback with a safe new-tab link', () => {
    const markup = renderToStaticMarkup(React.createElement(EmbeddedDashboardFrameView, {
      status: 'unavailable',
      src: 'https://cosmo-dashboard-cutekorea-3280s-projects.vercel.app/',
      title: '코스모 대시보드',
      loadingLabel: '코스모 대시보드 연결 중...',
      unavailableMessage: '코스모 대시보드에 연결할 수 없습니다. Vercel 배포 보호 설정을 확인하세요.',
      externalLinkLabel: '새 탭에서 열기',
    }));

    expect(markup).toContain('코스모 대시보드에 연결할 수 없습니다. Vercel 배포 보호 설정을 확인하세요.');
    expect(markup).toContain('href="https://cosmo-dashboard-cutekorea-3280s-projects.vercel.app/"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener"');
    expect(markup).toContain('새 탭에서 열기');
    expect(markup).not.toContain('<iframe');
  });
});
