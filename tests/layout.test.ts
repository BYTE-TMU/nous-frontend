// Smoke test for the one export that has no feature logic to mock.
import { describe, expect, it } from "vitest";
import { metadata } from "../app/layout";

describe("root layout metadata", () => {
  it("sets the app title", () => {
    expect(metadata.title).toBe("Nous");
  });
});
