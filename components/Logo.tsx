export default function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M 46 5 L 5 50 L 46 95 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinejoin="miter" 
        strokeMiterlimit="2.5" 
      />
      <path 
        d="M 64 28 Q 54 28 54 16 L 54 5 L 95 50 L 54 95 L 54 50 L 75 28" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinejoin="miter" 
        strokeLinecap="square" 
        strokeMiterlimit="2.5" 
      />
    </svg>
  );
}
