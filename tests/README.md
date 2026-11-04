# tests/

## Purpose

Test suite for `nous-frontend`, run via `vitest` (`npm run lint && npm run typecheck && npm test` is the pre-PR gate).

## What belongs here

`*.test.ts` / `*.test.tsx` files, one per component or module under test.

## What does not

- End-to-end tests against a live backend — this suite tests frontend code in isolation

## Key files

| File | Purpose |
|---|---|
| `layout.test.ts` | smoke test for `app/layout.tsx`'s metadata export |

## Rules

- The turn card needs tests that messages, thoughts, and judge commentary render exactly as given, with no truncation or rewriting that changes meaning.
- Each transcript state (provisioning, running, completed, failed, judge pending, no thoughts) gets a test.
- Keyboard navigation and expand/collapse of the turn card are covered by a test, not just eyeballed.
