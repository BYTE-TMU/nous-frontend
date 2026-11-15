import Image from "next/image";

// Wordmark used at the top of every auth screen (170×47 in the Figma frames).
export function NousLogo() {
  return <Image src="/brand/nous-wordmark.svg" alt="Nous" width={170} height={47} priority />;
}
