import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/navigation/AppHeader";
import { HideOnAuthRoutes } from "@/components/auth/HideOnAuthRoutes";

const geist = Geist({subsets:['latin'],variable:'--font-geist-sans'});

export const metadata: Metadata = {
  title: "Nous",
  description: "Your mind, mapped.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <HideOnAuthRoutes>
          <AppHeader />
        </HideOnAuthRoutes>
        {children}
      </body>
    </html>
  );
}
