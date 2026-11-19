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
  { href: "#run", label: "A run" },
  { href: "#judge", label: "The judge" },
  { href: "#personas", label: "Personas" },
  { href: "#principles", label: "Principles" },
];

/** True after mount when a session token exists. Read in an effect so SSR and first paint agree. */
function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(Boolean(getToken())), []);
  return signedIn;
}

/**
 * Wordmark, section links (desktop only), and two actions: "Request access" always,
 * plus "Sign in", or "Open dashboard" once a session token is found.
 */
export default function LandingNav() {
  const signedIn = useSignedIn();

  return (
    <header className="sticky top-0 z-50 border-b border-graphite/60 bg-night/70 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" aria-label="Nous home" className="shrink-0">
          <Image src="/brand/nous-wordmark.svg" alt="Nous" width={87} height={24} priority />
        </Link>

        <ul className="hidden items-center gap-7 text-sm text-ash md:flex">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="transition-colors hover:text-signal-lime">
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="lg" className="hidden px-3 text-ash sm:inline-flex">
            <Link href={signedIn ? LINKS.dashboard : LINKS.signIn}>
              {signedIn ? "Open dashboard" : "Sign in"}
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-gradient-primary px-3.5 font-semibold text-night hover:opacity-90">
            <Link href={LINKS.requestAccess}>Request access</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
