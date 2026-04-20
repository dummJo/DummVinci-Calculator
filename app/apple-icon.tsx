import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#090807',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontFamily: 'serif',
            color: '#C9A84C',
            fontWeight: 400,
            letterSpacing: '-0.08em',
            marginTop: '8px',
          }}
        >
          dV
        </div>
      </div>
    ),
    { ...size }
  );
}
