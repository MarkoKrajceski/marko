import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CustomCursor } from '@/components';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Marko - AI • Cloud • Automation',
  description: 'Full-stack developer and cloud consultant. I automate the boring and scale the bold. Specializing in serverless architecture, automation pipelines, and applied AI solutions.',
  keywords: ['cloud consultant', 'serverless', 'AWS', 'automation', 'AI', 'full-stack developer', 'Next.js', 'Lambda'],
  authors: [{ name: 'Marko' }],
  creator: 'Marko',
  publisher: 'Marko',
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
    title: 'Marko - AI • Cloud • Automation',
    description: 'Full-stack developer and cloud consultant. I automate the boring and scale the bold. Specializing in serverless architecture, automation pipelines, and applied AI solutions.',
    siteName: 'Marko',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Marko - AI • Cloud • Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marko - AI • Cloud • Automation',
    description: 'Full-stack developer and cloud consultant. I automate the boring and scale the bold.',
    images: ['/og-image.jpg'],
    creator: '@marko', // Update with actual Twitter handle if available
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <ErrorBoundary>
          <CustomCursor />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
