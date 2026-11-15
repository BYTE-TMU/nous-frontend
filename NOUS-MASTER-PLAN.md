# Nous: Master Plan

**Version:** 8.0
**Supersedes:** v7.0, which planned the batch susceptibility-matrix harness and its demo. That plan is retired.

## The document set

| Document | What it holds |
|---|---|
| **This document** | Scope, build order, what is done, blockers |
| `NOUS-PROJECT-SPEC.md` v6.0 | What Nous is and why. Concepts, architecture, data model, invariants. |
| `NOUS-SPRINT-FRONTEND.md` | Frontend build order |

If documents disagree on an invariant, the spec wins. If they disagree on order, this document wins.

This version deliberately contains **no dates, gates, or hour budgets.** The previous schedule was built around a demo and a batch run that no longer exist. Dates get added here once the team has re-estimated against the new scope.

---

## 1. The product in one paragraph

Nous is a testbed for AI researchers. An approved researcher logs in, configures an experiment by choosing an attacker and a defender model and a prompt for each (preset or custom), and watches the two models converse. The transcript is organised by turn, one message from each model, and shows each model's thought process and an independent judge's view of the turn.

## 2. What exists today

| Area | State |
|---|---|
| Three repos, CI, contracts mechanism | Built |
| JWT auth: register, login, `/auth/me` | Built. Registration is open. |
| `POST /runs` creates and enqueues an experiment | Built, defender prompt and persona only |
| Conversation driver alternating attacker and defender via `nous-ai /turn` | Built, capped at 10 turns |
| Turn persistence with token counts | Built, one row per message |
| Frontend app shell and brand tokens | Built |
| Frontend screens | Only legacy screens from the previous product remain |

## 3. Build order

Ordered by dependency. Each step is usable on its own.

1. **Restrict access.** Researcher allowlist enforced at login; open registration closed or gated. Nothing below should be used by real researchers before this.
2. **Complete experiment configuration.** Attacker prompt, preset-or-custom per role, and the preset and model listing endpoints.
3. **Read APIs.** List experiments, fetch one experiment with its turns. Settle the turn storage shape first (spec Q3).
4. **Experiment list and configuration form** in the frontend, against the real endpoints.
5. **Transcript view, messages only.** Turn-organised, live while running. This is the first point at which a researcher can do something useful.
6. **Thought process.** Capture in `nous-ai` and the backend, then show in the transcript. Resolve spec Q1 first.
7. **Judge.** `/judge` in `nous-ai`, a judgements table, a worker step per turn, and the judge panel in the transcript. Resolve spec Q2 first.
8. **Cost controls.** Usage log, spend cap, concurrency limit per researcher.
9. **Cleanup.** Remove Neo4j, pgvector, the legacy frontend screens, and the old contracts. Replace the contracts with experiment, turn, and judgement shapes.

Steps 1 and 9 are small but easy to defer indefinitely. Step 1 is a precondition for exposing the system at all. Do not skip it.

## 4. Operating rules

1. **One named owner per ticket.** Documents assign by role; the ticket names a person.
2. **No self-merge** on `app/auth/`, `app/api/deps.py`, `contracts/`, or the conversation driver. A second engineer's approving comment is required. These are the components where a quiet bug corrupts everything downstream or exposes data.
3. **Contract changes go first.** A shared shape changes in `contracts/` in its own PR with a tag, before any consumer bumps its pin.
4. **Definition of done:** merged, CI green, tested, documented in the repo, deployed to preview.
5. **Model output is shown as stored.** No paraphrase, no rewriting in the UI.

## 5. Blockers and decisions

| # | Item | Needed before |
|---|---|---|
| D1 | Allowlist mechanism and who administers it (spec Q6) | Step 1 |
| D2 | Turn storage shape (spec Q3) | Step 3 |
| D3 | How thought processes are obtained, per model (spec Q1) | Step 6 |
| D4 | What the judge sees and how it judges (spec Q2) | Step 7 |
| D5 | Model roster and cost tier per role (spec Q7) | Step 2 |
| D6 | Provider terms of service read and recorded, per provider offered | Any provider reaching researchers |
| D7 | Where presets live (spec Q4) | Step 2 |
| D9 | Two-user isolation test for INV-4 | Step 3 |

## 6. Risks

| Risk | Mitigation |
|---|---|
| Open registration lets unapproved users run experiments and spend money | Step 1 first. Until then keep the deployment off the public internet. |
| Thought process is unavailable or unreliable for some models | Show it as unavailable; do not synthesise it. Spec Q1. |
| The judge's commentary is mistaken for ground truth | Label it plainly as one model's opinion, with the judge model named. |
| Cost grows with turns and concurrency | Turn cap now; usage log, spend cap, concurrency limit in step 8. |
| Provider terms restrict adversarial use | D6, before any provider is exposed. |
| Transcripts contain adversarial prompts | Per-researcher access control (INV-4); repo and exports reviewed before going public. |
| Legacy code (Neo4j, graph, insight, upload) confuses new contributors | Step 9, and the READMEs mark it as legacy in the meantime. |
