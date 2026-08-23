# components/ui/

## Purpose

Primitives only — buttons, cards, empty states. The generic building blocks every other component tree composes from.

## What belongs here

`Button.tsx`, `Card.tsx`, `EmptyState.tsx`, and anything else with no opinion about insights, entries, or the graph.

## What does not

- **Business logic.** If a component in here is ranking, scoring, or deciding what counts as an insight, it belongs in `nous-backend`, not in a UI primitive (hard rule #4).
- Anything that calls `lib/api.ts` — primitives receive data as props, they don't fetch it

## Key files

| File | Purpose |
|---|---|
| `EmptyState.tsx` | shared shell for cold-start / not-enough-data states used across `app/` |

## Rules

- A primitive stays generic — no `InsightCard`-specific styling leaking in here. If it needs to know about insights, it's not a primitive.
