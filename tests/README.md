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

- `InsightCard` and `EvidenceList` need tests that would catch evidence being truncated in a meaning-changing way or paraphrased — that's the one thing this product cannot get wrong.
- Accessibility on `InsightCard` (keyboard nav, evidence expansion) should be covered by a test, not just eyeballed.
