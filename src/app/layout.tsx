import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SashaLeads AI',
    template: `%s | SashaLeads AI`,
  },
  description: 'SashaLeads is an intelligent, AI-powered CRM designed to streamline sales, task management, and team collaboration.',
  openGraph: {
    title: 'SashaLeads AI',
    description: 'The Future of Intelligent CRM',
    url: siteUrl,
    siteName: 'SashaLeads AI',
    images: [
      {
        url: '/sasha-og.png', // Default OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SashaLeads AI',
    description: 'The Future of Intelligent CRM',
    images: ['/sasha-og.png'],
  },
  manifest: '/manifest.json',
};


const faviconSvg = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="hsl(222 84% 4.9%)"/>
  <rect x="12" y="32" width="8" height="20" rx="4" fill="hsl(217 91% 60%)"/>
  <rect x="28" y="22" width="8" height="30" rx="4" fill="hsl(217 91% 60%)"/>
  <rect x="44" y="12" width="8" height="40" rx="4" fill="hsl(217 91% 60%)"/>
</svg>
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`data:image/svg+xml,${encodeURIComponent(faviconSvg)}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', 'dark')}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
