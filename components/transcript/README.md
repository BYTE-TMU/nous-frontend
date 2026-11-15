# components/transcript/

## Purpose

The transcript view: the product's core screen. Turn-organised display of one experiment's conversation, with thought process and judge commentary. Built against placeholder data (`placeholder-data.ts`) until the experiment read endpoint exists.

## What belongs here

- A turn card: the attacker message and defender message for one turn, with their thought processes and the judge's commentary
- The experiment header: name, status, models, prompts, turn count
- The in-progress, failed, judge-pending, and no-thoughts states

## What does not

- Fetching — components receive data as props from a page that calls `lib/api.ts`
- Summarising, rewriting, or scoring model output. Messages, thoughts, and judge text render exactly as returned.

## Rules

- Thought process is labelled as the model's own account. Judge commentary is labelled as one model's opinion, with the judge model named.
- A missing thought or a pending judgement is shown as such, never hidden and never invented.
- Keyboard navigable, expand and collapse without a mouse, sensible contrast.
- Build for reading speed over visual flourish.

## Key files

| File | Purpose |
|---|---|
| `Transcript.tsx` | header and the list of turns |
| `TurnView.tsx` | one turn: a `TurnMarker`, then the attacker message and the defender reply |
| `TranscriptMessageView.tsx` | one message: avatar, role and model, bubble, near-miss footer, reasoning |
| `ReasoningTrace.tsx` | the model's thought process as a collapsible trace; also the pending ("thinking") state |
| `TurnMarker.tsx` | the divider between turns |
| `types.ts` | local view types; move to generated `lib/api-schema.d.ts` once the API exists |

Built on the shadcn `message`, `bubble`, `marker`, and `trace` components in `components/ui/`.
