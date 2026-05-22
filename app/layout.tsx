import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: "참치왕국 신라교역",
  description: "Tuna Market Intelligence Dashboard",
  manifest: "/manifest.json",
  applicationName: "참치왕국",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "참치왕국",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: { telephone: false },
};

import DeepOceanCreatures from "@/components/DeepOceanCreatures";
import { ToastProvider } from "@/components/ToastProvider";
import HermesAgent from "@/components/HermesAgent";
import PWARegister from "@/components/PWARegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DeepOceanCreatures />
        <ToastProvider>
          {children}
        </ToastProvider>
        <HermesAgent category="농수산물" />
        <PWARegister />
      </body>
    </html>
  );
}
