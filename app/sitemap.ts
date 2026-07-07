import type { MetadataRoute } from 'next';
import { PUBLIC_DASHBOARD_ROUTES } from '../lib/dashboard-registry';

const SITE_URL = 'https://leedonggun.co.kr';

/* 카테고리별 우선순위 매핑 */
const HIGH_PRIORITY_ROUTES = ['market', 'fleet', 'logistics', 'unloading'];
const MEDIUM_PRIORITY_ROUTES = ['mackerel', 'shrimp', 'salmon', 'pollock', 'squid', 'galchi', 'chicken'];

function getRoutePriority(route: string): number {
  if (!route) return 1.0;
  if (HIGH_PRIORITY_ROUTES.includes(route)) return 0.9;
  if (MEDIUM_PRIORITY_ROUTES.includes(route)) return 0.8;
  return 0.7;
}

function getChangeFrequency(route: string): 'daily' | 'weekly' | 'monthly' {
  if (!route) return 'daily';
  if (HIGH_PRIORITY_ROUTES.includes(route)) return 'daily';
  return 'weekly';
}

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
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: route ? `${SITE_URL}/${route}` : SITE_URL,
    lastModified,
    changeFrequency: getChangeFrequency(route),
    priority: getRoutePriority(route),
  }));
}
