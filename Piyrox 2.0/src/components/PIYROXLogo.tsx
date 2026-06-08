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
        <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="50%" stopColor="#00ccff" />
          <stop offset="100%" stopColor="#8844ff" />
        </linearGradient>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#1a1a2e" />
        </linearGradient>
      </defs>
      {/* Background with gradient */}
      <rect x="0" y="0" width="100" height="100" rx="20" fill="url(#bgGradient)" />
      
      {/* Abstract coding-themed design */}
      {/* Left bracket */}
      <path d="M20 30 L20 70 L30 70 L30 40 L70 40 L70 30 Z" fill="url(#codeGradient)" opacity="0.9" />
      
      {/* Right bracket */}
      <path d="M80 30 L80 70 L70 70 L70 40 L30 40 L30 30 Z" fill="url(#codeGradient)" opacity="0.7" />
      
      {/* Central code slash */}
      <path d="M45 25 L55 75 L50 75 L40 25 Z" fill="url(#codeGradient)" opacity="0.8" />
      
      {/* Binary dots pattern */}
      <circle cx="25" cy="25" r="2" fill="#00ff88" opacity="0.8" />
      <circle cx="35" cy="25" r="2" fill="#00ccff" opacity="0.8" />
      <circle cx="65" cy="25" r="2" fill="#00ccff" opacity="0.8" />
      <circle cx="75" cy="25" r="2" fill="#8844ff" opacity="0.8" />
      
      <circle cx="25" cy="75" r="2" fill="#8844ff" opacity="0.8" />
      <circle cx="35" cy="75" r="2" fill="#00ccff" opacity="0.8" />
      <circle cx="65" cy="75" r="2" fill="#00ccff" opacity="0.8" />
      <circle cx="75" cy="75" r="2" fill="#00ff88" opacity="0.8" />
    </svg>
  );
}