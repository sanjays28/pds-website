import Image from "next/image";

/** The PDS wordmark — same asset and size as the nav's logo, shared so the footer reuses it. */
export function Logo({ src = "/pds-logo-white.png", alt = "Proven Delivery Services" }: { src?: string; alt?: string }) {
  return <Image src={src} alt={alt} width={140} height={40} className="logo-img" />;
}
