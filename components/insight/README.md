# components/insight/

## Purpose

`InsightCard` and its supporting components — the product. This is the one directory that has to be perfect.

## What belongs here

`InsightCard.tsx`, `EvidenceList.tsx`, `FeedbackButtons.tsx`.

## What does not

- Fabricated, paraphrased, or truncated-in-a-meaning-changing-way evidence text — `EvidenceList` renders exactly what the backend returns
- Ranking or scoring logic — confidence is a value from the API, not computed here

## Key files

| File | Purpose |
|---|---|
| `InsightCard.tsx` | THE hero component |
| `EvidenceList.tsx` | dated quotes, exact user wording |

## Rules

- Keyboard navigable, evidence expandable without a mouse, sensible contrast — accessibility is not optional here (hard rule #6).
- Confidence is always surfaced, never hidden to make an insight look stronger than it is.
