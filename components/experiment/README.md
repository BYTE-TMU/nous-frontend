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

- **Summary:** the rule under test, a status line, and **key moments**: the turns the judge flagged, each with the defender's quote and the judge's explanation. They are derived from the turns' `assessment`, not stored separately (`deriveKeyMoments.ts`).
- **Setup:** read-only ("Locked when the conversation started"): defender persona, attack strategy, and both models. The rule lives on the Summary tab.
