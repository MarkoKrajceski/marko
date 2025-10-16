import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CustomCursor } from '@/components';
import StructuredData from '@/components/StructuredData';
import Analytics from '@/components/Analytics';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Marko - AI • Cloud • Automation Expert',
    template: '%s | Marko - AI • Cloud • Automation'
  },
  description: 'Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions. I help businesses automate the boring and scale the bold with cutting-edge technology.',
  keywords: [
    'cloud consultant', 'serverless architecture', 'AWS expert', 'automation engineer', 
    'AI solutions', 'full-stack developer', 'Next.js', 'Lambda functions', 
    'DevOps', 'CI/CD pipelines', 'infrastructure as code', 'cloud migration',
    'serverless applications', 'API development', 'microservices', 'cloud optimization'
  ],
  authors: [{ name: 'Marko', url: 'https://marko.business' }],
  creator: 'Marko',
  publisher: 'Marko',
  category: 'Technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Marko - AI • Cloud • Automation Expert',
    description: 'Expert full-stack developer and AWS cloud consultant specializing in serverless architecture, automation pipelines, and applied AI solutions. I help businesses automate the boring and scale the bold.',
    siteName: 'Marko - Cloud & AI Solutions',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Marko - AI, Cloud & Automation Expert - Serverless Architecture and Applied AI Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marko - AI • Cloud • Automation Expert',
    description: 'Expert AWS cloud consultant & full-stack developer. Specializing in serverless architecture, automation pipelines, and applied AI solutions.',
    images: ['/og-image.jpg'],
    creator: '@marko', // Update with actual Twitter handle if available
    site: '@marko',
  },
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
    // Add verification codes when available
    // google: 'google-verification-code',
    // yandex: 'yandex-verification-code',
    // yahoo: 'yahoo-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Analytics />
        <ErrorBoundary>
          <CustomCursor />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
