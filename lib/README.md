# lib/

## Purpose

The non-visual layer: backend calls, auth token handling, and generated types.

## What belongs here

- `api.ts` — the ONLY place `nous-backend` is called from
- `auth.ts` — token storage and attachment
- `types.ts` — GENERATED, never hand-written

## What does not

- A call to `nous-ai`, direct or proxied. No provider key exists in this repo and never will.
- A hand-edited type. If a field is missing, the fix is a PR to `nous-backend/contracts/`, a tag, then `npm run generate:types` — not an `as any` here.

## Key files

| File | Purpose |
|---|---|
| `api.ts` | every backend call goes through here — no `fetch` calls scattered across components |
| `types.ts` | generated from `nous-backend/contracts/openapi.yaml` at a pinned tag |

## Rules

- CI regenerates `types.ts` and fails on a diff against what's committed, so frontend/backend drift is caught on the PR that causes it.
