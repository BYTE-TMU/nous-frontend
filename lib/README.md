# lib/

## Purpose

The non-visual layer: backend calls, auth token handling, and the types for backend responses.

## What belongs here

- `api.ts` — the ONLY place `nous-backend` is called from
- `auth.ts` — token storage and attachment
- `api-schema.d.ts` — GENERATED from the backend's `/openapi.json` by `npm run generate:api`; never hand-edited. The source of truth for the API contract.
- `types.ts` — hand-written view types only for shapes the backend does not expose yet; transitional

## What does not

- A call to `nous-ai`, direct or proxied. No provider key exists in this repo and never will.
- An `as any` to paper over a missing field. If the backend response lacks something the UI needs, raise it against `BACKEND-ENDPOINTS.md`, then regenerate `api-schema.d.ts` once the backend serves it.

## Key files

| File | Purpose |
|---|---|
| `api.ts` | every backend call goes through here — no `fetch` calls scattered across components |
| `api-schema.d.ts` | generated request and response types for every backend endpoint |
| `types.ts` | hand-written view types for responses the backend does not serve yet, matching `BACKEND-ENDPOINTS.md` |

## Rules

- `api-schema.d.ts` is generated, never edited. When the backend API changes, run `npm run generate:api` against the updated backend and commit the result in the same PR as the UI that depends on it.
- Import API types through `api.ts` (or `components['schemas'][...]` from `api-schema.d.ts`); do not re-declare a shape the schema already has.
- `types.ts` is hand-written and shrinks over time: when an endpoint appears in the schema, delete its hand-written type.
