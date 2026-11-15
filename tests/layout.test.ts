// Smoke test for the one export that has no feature logic to mock.
import { describe, expect, it, vi } from "vitest";

// next/font/google is a build-time transform in Next and is not callable under vitest.
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

import { metadata } from "../app/layout";

describe("root layout metadata", () => {
  it("sets the app title", () => {
    expect(metadata.title).toBe("Nous");
  });
});
