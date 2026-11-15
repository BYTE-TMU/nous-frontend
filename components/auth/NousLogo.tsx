import Image from "next/image";

// Wordmark used at the top of every auth screen.
export function NousLogo() {
  return <Image src="/brand/nous-wordmark.svg" alt="Nous" width={116} height={32} priority />;
}
