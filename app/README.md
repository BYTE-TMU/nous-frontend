# app/

## Purpose

Every route in the App Router. The home screen is the experiment list, not an input field.

## What belongs here

`layout.tsx`, `page.tsx`, and one directory per route. Planned routes: `login/`, `experiments/new/` (configuration form), `experiments/[id]/` (the transcript view).

## What does not

- Business logic, running experiments, or judging — pages call `lib/api.ts` and render what comes back
- Reusable UI — that's `components/`; a page composes components, it doesn't define primitives inline

## Key files

| File | Purpose |
|---|---|
| `layout.tsx` | root layout — html/body shell, global CSS import |
| `page.tsx` | the experiment list — the home screen |

## Legacy

`upload/`, `fingerprint/`, `entries/`, and `account/` belong to the previous product. They are to be deleted; do not build on them.

## Rules

- Nobody types at a model through this UI. A screen whose primary affordance is a chat box is wrong.
- Provisioning, in-progress, failed, judge-pending, and no-thoughts are real states every transcript page handles, not TODOs.
