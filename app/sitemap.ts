import type { MetadataRoute } from 'next';

const SITE_URL = 'https://leedonggun.co.kr';

const PUBLIC_ROUTES = [
  '',
  'value-chain',
  'mackerel',
  'galchi',
  'squid',
  'jukkumi',
  'octopus',
  'pollock',
  'flatfish',
  'shrimp',
  'salmon',
  'whelk',
  'kim',
  'cashew',
  'cassava',
  'garlic',
  'carrot',
  'cocoa',
  'mangosteen',
  'chicken',
  'pork',
  'beef',
  'used-car',
  'cold-storage',
  'research-lab',
  'seasia-oem',
  'fleet-strategy',
  'korea-market',
  'purse-seiner-db',
  'msc',
  'sashimi-steak',
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
