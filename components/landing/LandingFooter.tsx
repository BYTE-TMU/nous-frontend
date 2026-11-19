import Image from "next/image";
import Link from "next/link";
import { LINKS } from "./content";

/** Minimal footer: wordmark with the name's meaning, the two auth links, and the year. */
export default function LandingFooter() {
  return (
    <footer className="border-t border-graphite">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Image src="/brand/nous-wordmark.svg" alt="Nous" width={72} height={20} />
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm text-ash">
          <Link href={LINKS.signIn} className="hover:text-signal-lime">
            Sign in
          </Link>
        </nav>
        <p className="font-mono text-xs text-smoke">© {new Date().getFullYear()} Nous</p>
      </div>
    </footer>
  );
}
