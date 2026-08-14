import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

/* ── SEO Constants ── */
const SITE_URL = 'https://leedonggun.co.kr';
const SITE_NAME = '참치왕국 신라교역';
const SITE_DESCRIPTION = '참치·수산물·농산물 글로벌 공급망 인텔리전스 대시보드 — 실시간 시세, 선단 운영, 시장 동향, 물류 추적을 한눈에. Global Commodity Supply Chain Intelligence by Silla Trading.';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0a0f1f',
};

export const metadata: Metadata = {
  /* ── 기본 ── */
  title: {
    default: `${SITE_NAME} | 글로벌 수산·농산물 공급망 인텔리전스`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '참치', '참치시세', '수산물', '원양어업', '선망어업', '참치왕국', '신라교역',
    'tuna price', 'skipjack', 'yellowfin', 'commodity intelligence',
    '수산물 시세', '원양선단', '참치캔', 'Atuna', 'FCF', 'FFA',
    '글로벌 공급망', '수산물 대시보드', '농산물 시세', 'supply chain',
  ],
  authors: [{ name: '신라교역 해양수산본부', url: SITE_URL }],
  creator: '신라교역',
  publisher: '참치왕국 신라교역',
  applicationName: '참치왕국',

  /* ── Canonical & Alternates ── */
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
    languages: { 'ko-KR': '/' },
  },

  /* ── Open Graph ── */
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 글로벌 수산·농산물 공급망 인텔리전스`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: '참치왕국 신라교역 대시보드',
        type: 'image/jpeg',
      },
    ],
  },

  /* ── Twitter Card ── */
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — 글로벌 공급망 인텔리전스`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  /* ── PWA & Icons ── */
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '참치왕국',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  /* ── Misc ── */
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'FiLYMR1HrMNkg5-Sc4na1_fjBJtYpxlXmvdqRuaIK58',
    other: {
      'naver-site-verification': '6f739241c5a353219ffd1b90d90ffbcbc478e89f',
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-8056702374530895',
    'geo.region': 'KR',
    'geo.placename': 'Seoul',
    'geo.position': '37.5665;126.978',
    'ICBM': '37.5665, 126.978',
  },
  category: 'business',
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  image: OG_IMAGE,
  author: {
    '@type': 'Organization',
    name: '신라교역',
    url: SITE_URL,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
};

import { ToastProvider } from "@/components/ToastProvider";
import RouteScopedGlobalWidgets from "@/components/RouteScopedGlobalWidgets";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      className={`${geistSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        {/* Naver Search Advisor */}
        <meta name="naver-site-verification" content="6f739241c5a353219ffd1b90d90ffbcbc478e89f" />
        {/* GA4 */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YYK3VGG39D"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YYK3VGG39D');`,
          }}
        />
        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "s1ypdp7bi1");`,
          }}
        />
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8056702374530895"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
        <RouteScopedGlobalWidgets />
      </body>
    </html>
  );
}
