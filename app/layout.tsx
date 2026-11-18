import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/navigation/AppHeader";
import { HideOnAuthRoutes } from "@/components/auth/HideOnAuthRoutes";
import Providers from "./providers";

// Figma Variable collection: Font/Sans = Geist, Font/Mono = Geist Mono.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Nous",
  description: "An adversarial testbed for AI researchers: two models, one rule, and a judge on every turn.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, geistMono.variable)}>
      <body>
        <Providers>
          <HideOnAuthRoutes>
            <AppHeader />
          </HideOnAuthRoutes>
          {children}
        </Providers>
      </body>
    </html>
  );
}
