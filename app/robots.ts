import type { MetadataRoute } from 'next';

const SITE_URL = 'https://leedonggun.co.kr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['Mediapartners-Google', 'Google-Display-Ads-Bot'],
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
