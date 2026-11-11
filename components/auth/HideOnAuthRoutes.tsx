"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const AUTH_ROUTES = ["/login", "/reset-password"];

// The app header (settings, avatar) belongs to signed-in screens. The login
// design is just a logo and a card, so the root layout wraps the header in this.
export function HideOnAuthRoutes({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return AUTH_ROUTES.includes(pathname) ? null : <>{children}</>;
}
