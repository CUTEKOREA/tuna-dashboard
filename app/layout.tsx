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
};

export const metadata: Metadata = {
  title: "참치왕국 신라교역",
  description: "Tuna Market Intelligence Dashboard",
};

import DeepOceanCreatures from "@/components/DeepOceanCreatures";
import { ToastProvider } from "@/components/ToastProvider";
import HermesAgent from "@/components/HermesAgent";

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
      </body>
    </html>
  );
}
