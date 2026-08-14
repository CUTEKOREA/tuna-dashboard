import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BangkokOfficeDashboard,
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

});
