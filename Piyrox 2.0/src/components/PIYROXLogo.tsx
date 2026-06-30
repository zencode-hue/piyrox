import Image from "next/image";

interface PIYROXLogoProps {
  size?: number;
  className?: string;
}

export default function PIYROXLogo({ size = 32, className = "" }: PIYROXLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="PIYROX Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}