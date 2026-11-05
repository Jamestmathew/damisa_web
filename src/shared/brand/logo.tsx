import Image from "next/image";
export function BrandLogo({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/smi-logo.jpeg"
      width={size}
      height={size}
      alt="School of Management and Innovation logo"
      className={`shrink-0 rounded-full bg-white object-contain ${className}`}
      priority={size >= 72}
    />
  );
}
