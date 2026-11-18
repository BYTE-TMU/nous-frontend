"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// "/" is the public landing page, which renders its own navigation.
const HIDDEN_HEADER_ROUTES = ["/", "/login", "/reset-password"];

// The app header (settings, avatar) belongs to signed-in screens. The login
// design is just a logo and a card, and the landing page has its own nav, so the
// root layout wraps the header in this.
export function HideOnAuthRoutes({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return HIDDEN_HEADER_ROUTES.includes(pathname) ? null : <>{children}</>;
}
