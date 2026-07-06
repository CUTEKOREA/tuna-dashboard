import type { MetadataRoute } from 'next';
import { PUBLIC_DASHBOARD_ROUTES } from '../lib/dashboard-registry';

const SITE_URL = 'https://leedonggun.co.kr';

const PUBLIC_ROUTES = [
  '',
  'bni-global',
  ...PUBLIC_DASHBOARD_ROUTES,
  'manual',
  'financial-risk',
  'ffa-report',
  'falkland',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-02T00:00:00+09:00');

  return PUBLIC_ROUTES.map((route) => ({
    url: route ? `${SITE_URL}/${route}` : SITE_URL,
    lastModified,
    changeFrequency: route ? 'weekly' : 'daily',
    priority: route ? 0.7 : 1,
  }));
}
