import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { NousLogo } from "./NousLogo";

type AuthCardProps = {
  heading: string;
  children: ReactNode;
};

// The shell every login and password-reset screen shares: logo, heading, body.
// CardTitle renders a div, so the heading role is explicit. It is a polite live
// region because the login screen swaps it to "Incorrect login." on failure.
export function AuthCard({ heading, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="justify-items-center gap-4 text-center">
        <NousLogo />
        <CardTitle role="heading" aria-level={1} aria-live="polite" className="text-2xl">
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
