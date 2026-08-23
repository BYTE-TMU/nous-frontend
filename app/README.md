# app/

## Purpose

Every route in the App Router. `page.tsx` is the insight feed — THE home screen, not an input field.

## What belongs here

`layout.tsx`, `page.tsx`, and one directory per route (`fingerprint/`, `entries/`, `upload/`, `account/`, `(auth)/`).

## What does not

- Business logic, scoring, or ranking — pages call `lib/api.ts` and render what comes back, they don't decide what counts as an insight
- Reusable UI — that's `components/`; a page composes components, it doesn't define primitives inline

## Key files

| File | Purpose |
|---|---|
| `layout.tsx` | root layout — html/body shell, global CSS import |
| `page.tsx` | the insight feed — THE home screen |
| `upload/page.tsx` | export upload UX, including the long-running job wait |

## Rules

- If a screen's primary affordance is an input field, it is probably wrong — see root `README.md`.
- Cold start, processing, not-enough-data, and low-confidence are real states every relevant page handles, not TODOs.
