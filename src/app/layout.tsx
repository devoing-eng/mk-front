// src/app/layout.tsx

import { AppErrorBoundary } from './components/Global/AppErrorBoundary';
import LoadingBar from "./components/Global/LoadingBar";
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers/Providers';
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import type { Metadata, Viewport } from "next";
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css';
import VersionChecker from './components/Global/VersionChecker';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.memekult.com'),
  icons: {
    icon: '/images/mk-logo.png',
    shortcut: '/images/mk-logo.png',
    apple: '/images/mk-logo.png',
  },
  keywords: ['Ethereum', 'Meme Coins', 'Cryptocurrency', 'DeFi', 'Web3'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MemeKult',
  },
  applicationName: 'MemeKult',
}

export const viewport: Viewport = {
  themeColor: '#818cf8',
  width: 'device-width',
  initialScale: 1, 
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/images/mk-logo.png" type="image/png+xml" />

        <link rel="apple-touch-icon" href="/images/pwaImages/ios/180.png" />
        <link rel="apple-touch-icon" href="/images/pwaImages/ios/180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/pwaImages/ios/152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/images/pwaImages/ios/167.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/images/pwaImages/ios/120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/images/pwaImages/ios/114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/images/pwaImages/ios/76.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#818cf8" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XGE73H1CS8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XGE73H1CS8');
          `}
        </Script>
        <Script
          src="/tradingview/charting_library/charting_library.standalone.js"
          strategy="beforeInteractive"
          id="tradingview-charting-library"
        />
        <Script 
          src="/sw-register.js" 
          strategy="afterInteractive"
          id="sw-register"
        />
      </head>
      <body>

        <VersionChecker />
        <Providers>
          <div className="flex flex-col min-h-screen">
            {process.env.NODE_ENV === 'development' && ( 
              <Script id="csp-violation-detector">
                {`
                  document.addEventListener('securitypolicyviolation', (e) => {
                    console.warn('CSP Violation:', {
                      'violatedDirective': e.violatedDirective,
                      'blockedURI': e.blockedURI
                    });
                  });
                `}
              </Script>
            )} 
              <LoadingBar />
              <Toaster position="top-center" />
              <Header />
              <main className="flex-1">
                {children}
                <Analytics/>
              </main>
              <Footer />
          </div>
        </Providers>

      </body>
    </html>
  );
}