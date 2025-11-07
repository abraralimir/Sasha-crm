import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'SashaLeads AI',
  description: 'AI-Powered Lead Management and Analytics',
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
      </body>
    </html>
  );
}
