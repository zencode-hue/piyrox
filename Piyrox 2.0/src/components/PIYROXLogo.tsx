interface PIYROXLogoProps {
  size?: number;
  className?: string;
}

export default function PIYROXLogo({ size = 32, className = "" }: PIYROXLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </linearGradient>
      </defs>
      {/* Rounded background */}
      <rect x="4" y="4" width="92" height="92" rx="22" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      {/* Abstract Design: Interlocking shapes */}
      <circle cx="40" cy="40" r="18" fill="url(#mg1)" fillOpacity="0.8" />
      <rect x="42" y="42" width="30" height="30" rx="8" fill="url(#mg1)" fillOpacity="0.6" />
      <circle cx="65" cy="35" r="12" fill="url(#mg1)" fillOpacity="0.9" />
    </svg>
  );
}
