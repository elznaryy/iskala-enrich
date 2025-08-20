import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'iSkala Enrich - Professional Lead Enrichment Platform',
  description:
    'Transform your sales pipeline with iSkala Enrich. Access 20+ premium data providers to find verified email addresses and mobile numbers. Only pay for valid data.',
  keywords:
    'lead enrichment, email finder, phone number lookup, B2B data, sales prospecting, contact enrichment, data verification',
  authors: [{ name: 'iSkala Business Solutions' }],
  creator: 'iSkala Business Solutions',
  publisher: 'iSkala Business Solutions',
  icons: {
    icon: [
      { url: '/images/iskala-icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/images/iskala-icon.png',
    shortcut: '/images/iskala-icon.png',
  },
  openGraph: {
    title: 'iSkala Enrich - Professional Lead Enrichment Platform',
    description:
      'Transform your sales pipeline with verified contact data. Access 20+ premium data providers and only pay for valid results.',
    type: 'website',
    url: 'https://iskala-enrich.com',
    siteName: 'iSkala Enrich',
    images: [
      {
        url: '/images/iskala-logo.png',
        width: 1200,
        height: 630,
        alt: 'iSkala Enrich - Professional Lead Enrichment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iSkala Enrich - Professional Lead Enrichment Platform',
    description:
      'Transform your sales pipeline with verified contact data. Access 20+ premium data providers.',
    images: ['/images/iskala-logo.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
