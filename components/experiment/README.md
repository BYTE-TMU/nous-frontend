# components/experiment/

## Purpose

Experiment page pieces: status, the Summary and Setup tabs (`ExperimentOverview`), key moments, and results. The configuration form and experiment list are not yet built.

## What belongs here

- The configuration form: a section per role (attacker, defender), each with a model choice and a prompt that is a preset or custom text
- The experiment list and its rows

## What does not

- Hardcoded model or preset lists. They come from backend endpoints.
- Anything that runs or judges an experiment — that is backend work.

## Rules

- Show the projected scale of an experiment (turn limit) before launch.
- Submitting returns an experiment id and navigates to its transcript.

## Summary and Setup tabs

- **Rule under test:** pinned above the first turn (`RuleBanner`), clamped to two lines. The backend has no separate rule field, so this is the defender's prompt.
- **Summary:** "Turn N running" with a status line, and **key moments**: the turns the judge flagged, each with the defender's quote and the judge's explanation. They are derived from the turns' `assessment`, not stored separately (`deriveKeyMoments.ts`).
- **Setup:** read-only ("Locked when the conversation started"): defender persona, rule, attack strategy, and both models.
- **Typing state:** the backend returns only finished messages, so while a run is `running` the next message is inferred and shown as a typing bubble (`toTurns`).
