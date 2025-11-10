import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SashaLeads AI - The Future of Intelligent CRM';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  const interRegular = fetch(
    'https://rsms.me/inter/font-files/Inter-Regular.woff'
  ).then((res) => res.arrayBuffer());

  const interBold = fetch(
    'https://rsms.me/inter/font-files/Inter-Bold.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'hsl(222, 84%, 4.9%)',
          color: 'hsl(210, 40%, 98%)',
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: 60 }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(217, 91%, 60%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M7 14v4" />
            <path d="M12 10v8" />
            <path d="M17 6v12" />
          </svg>
          <h1 style={{ fontWeight: 700, margin: 0 }}>SashaLeads AI</h1>
        </div>
        <p style={{ marginTop: 20, fontSize: 32, color: 'hsl(215, 20.2%, 65.1%)' }}>
          The Future of Intelligent CRM
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await interRegular,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Inter',
          data: await interBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
