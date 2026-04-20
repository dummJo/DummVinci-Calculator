import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d1117',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 46 5 L 5 50 L 46 95 Z" fill="none" stroke="#C9A84C" strokeWidth="6" strokeLinejoin="miter" strokeMiterlimit="10" />
          <path d="M 62 32 Q 54 30 54 20 L 54 5 L 95 50 L 54 95 L 54 50 L 76 28" fill="none" stroke="#C9A84C" strokeWidth="6" strokeLinejoin="miter" strokeLinecap="square" strokeMiterlimit="10" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
