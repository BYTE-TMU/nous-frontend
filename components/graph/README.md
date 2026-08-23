# components/graph/

## Purpose

The fingerprint graph visualisation.

## What belongs here

`GraphView.tsx` and any supporting rendering components once the library choice is made.

## What does not

- A hand-written entity-type-to-colour mapping duplicated from elsewhere — derive it from the generated types in `lib/types.ts`, which trace back to `nous_contracts`

## Key files

| File | Purpose |
|---|---|
| `GraphView.tsx` | currently a placeholder — see Open Questions |

## Rules

- **Graph visualisation library is undecided.** Johan evaluates and records the choice in the root `README.md` before Week 3. Don't commit to a library-specific API in this directory until then.
