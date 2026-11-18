"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getToken } from "@/lib/auth";
import { LINKS } from "./content";

// Sticky top navigation for the landing page. The root layout's AppHeader is hidden
// on "/" (see components/auth/HideOnAuthRoutes.tsx), so this replaces it here.

// In-page anchors; ids are set on the <section>s in LandingPage.tsx.
const SECTIONS = [
  { href: "#run", label: "Sample" },
  { href: "#judge", label: "Judgement" },
  { href: "#how", label: "Workflow" },
  { href: "#principles", label: "Records" },
];

/** True after mount when a session token exists. Read in an effect so SSR and first paint agree. */
function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(Boolean(getToken())), []);
  return signedIn;
}

/**
 * Wordmark, section links, and an action appropriate to the visitor's session.
 */
export default function LandingNav() {
  const signedIn = useSignedIn();

  return (
    <header className="sticky top-0 z-50 border-b border-graphite/60 bg-night/70 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 sm:px-6 md:h-16 md:flex-nowrap lg:px-8"
      >
        <Link href="/" aria-label="Nous home" className="order-1 shrink-0 py-4">
          <Image src="/brand/nous-wordmark.svg" alt="Nous" width={87} height={24} priority />
        </Link>

        <ul className="order-3 flex w-full items-center gap-6 overflow-x-auto text-sm text-ash md:order-2 md:w-auto md:flex-1 md:justify-center md:gap-7">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-signal-lime focus-visible:text-signal-lime">
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="order-2 ml-auto flex items-center gap-2 py-2 md:order-3 md:ml-0">
          {!signedIn && (
            <Button asChild variant="ghost" size="lg" className="hidden px-3 text-ash sm:inline-flex">
              <Link href={LINKS.signIn}>Sign in</Link>
            </Button>
          )}
          <Button asChild size="lg" className="bg-signal-lime px-3.5 font-semibold text-night hover:bg-impact-green">
            <Link href={signedIn ? LINKS.dashboard : LINKS.requestAccess}>
              {signedIn ? "Open dashboard" : "Request access"}
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
