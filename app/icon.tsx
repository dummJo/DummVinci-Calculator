import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '128px',
          border: '12px solid rgba(201, 168, 76, 0.25)',
          boxShadow: 'inset 0 0 100px rgba(201, 168, 76, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: 270,
            fontFamily: 'serif',
            color: '#C9A84C',
            fontWeight: 400,
            letterSpacing: '-0.08em',
            marginTop: '20px',
          }}
        >
          dV
        </div>
      </div>
    ),
    { ...size }
  );
}
