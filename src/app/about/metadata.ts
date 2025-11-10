import type { Metadata } from 'next';

const title = 'About SashaLeads AI';
const description = 'Discover how SashaLeads AI is revolutionizing customer relationship management with a powerful, intelligent, and intuitive platform designed for growth.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};
