import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Nous: Two models. One rule. Watch where it breaks.",
  description:
    "An adversarial testbed for AI researchers. An attacker model pressures a defender holding one rule; an independent judge scores every turn.",
};

export default function Home() {
  return <LandingPage />;
}
