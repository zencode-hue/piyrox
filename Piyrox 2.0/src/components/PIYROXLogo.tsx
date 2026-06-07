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
      {/* PY letterform */}
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="54"
        fill="url(#mg1)"
        letterSpacing="-3"
      >
        PY
      </text>
    </svg>
  );
}
