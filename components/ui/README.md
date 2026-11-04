# components/ui/

## Purpose

Primitives only — buttons, cards, empty states. The generic building blocks every other component tree composes from.

## What belongs here

shadcn components (`button.tsx`, `card.tsx`, added with `npx shadcn@latest add <name>`) and `EmptyState.tsx`, and anything else with no opinion about experiments, turns, or judges.

## What does not

- **Business logic.** Anything that decides what a result means belongs in the backend, not in a UI primitive.
- Anything that calls `lib/api.ts` — primitives receive data as props, they don't fetch it

## Key files

| File | Purpose |
|---|---|
| `EmptyState.tsx` | shared shell for empty and not-yet states used across `app/` |

## Rules

- A primitive stays generic. If it needs to know about turns or judgements, it belongs in `components/transcript/` or `components/experiment/`.
