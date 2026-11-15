# Nous: Project Specification

**Version:** 6.0
**Status:** Draft for approval
**Audience:** the entire technical team
**Companion documents:** `NOUS-MASTER-PLAN.md` for scope and build order. `NOUS-SPRINT-FRONTEND.md` for frontend work.

## How to use this document

This is the source of truth for **what** Nous is and **why** it is built this way. If this document and the code disagree, the code is right and this document is the bug. Raise it and it gets amended.

Statements are marked **Built** or **Planned** where the difference matters. Unmarked statements describe the intended product.

### What changed in v6.0

This is a direction change. Earlier versions described Nous first as a semantic graph over personal chat exports, then as a batch harness that produced a susceptibility matrix. Nous is now an **interactive testbed**: researchers run individual attacker-versus-defender experiments and inspect them turn by turn.

- Removed: the personal-data graph, batch matrix runs, cost sign-off for batches, the heatmap, and the calibrated-judge gate.
- Kept: the three-repo architecture, the stateless `nous-ai`, the backend-driven conversation loop, JWT auth, Celery, and the contracts mechanism.
- New: a researcher allowlist, per-role presets and custom prompts, capture of each model's thought process, and a judge that comments on every turn.

---

## 1. Summary

Nous lets AI researchers stage a conversation between two language models and study it closely.

A researcher chooses an **attacker** model and a **defender** model. Each model gets a prompt, either a preset from Nous or text the researcher writes. Nous provisions the experiment and the two models converse using their personas and prompts. The researcher reads the result in a **transcript view** organised by turn.

A **turn** is one message from each model. For each turn the researcher sees:

1. the attacker's message and the defender's reply,
2. each model's thought process behind its message,
3. what an independent **judge** model thinks of the turn.

The value is in the inspection. Seeing what a model said is easy; seeing why it said it, and how a separate judge reads it, is what makes Nous useful for research.

## 2. Users and access

Nous has one kind of user: the **researcher**.

- Only an **approved list** of researchers can log in. Having valid credentials is not enough; the account must be on the list.
- Every experiment belongs to the researcher who created it. Every read is scoped to that researcher.
- There is no public sign-up.

**Status:** login and JWT issuance are **Built**. Registration is currently open and there is no allowlist. **This is a gap to close before any real researcher uses the system.** The allowlist is **Planned**.

## 3. Core concepts

| Term | Meaning |
|---|---|
| **Researcher** | An approved user. |
| **Experiment** | One configured attacker-versus-defender conversation. Stored as a `run` in the current schema; the code has not been renamed. |
| **Role** | Attacker or defender. |
| **Model** | The language model assigned to a role. |
| **Prompt** | The instructions and persona that shape a role. For each role it is either a **preset** chosen from a list or **custom** text the researcher writes. |
| **Turn** | One attacker message and one defender message. The unit of the transcript view. |
| **Thought process** | The reasoning a model produced behind a message. |
| **Judge** | A separate model that reads the conversation and gives its assessment of each turn. It never takes part in the conversation. |
| **Transcript** | The ordered turns of one experiment, with thoughts and judge commentary. |

## 4. The experiment lifecycle

```
configure -> provision -> converse (turn 1..N) -> complete | failed
                              |
                              +-> judge assesses each turn as it lands
```

1. **Configure.** The researcher picks a model and a prompt for each role, a name, and a maximum number of turns. Each prompt is a preset or custom text.
2. **Provision.** The backend validates the configuration, records it, and enqueues the experiment. Status is `pending`.
3. **Converse.** A background worker alternates the two models, attacker first, for up to the maximum number of turns. Each message is saved the moment it arrives. Status is `running`.
4. **Judge.** After each turn the judge assesses it. A turn is readable before its assessment exists.
5. **Finish.** Status becomes `completed`, or `failed` if a provider error stops the loop. A failed experiment keeps every turn already saved.

**Built:** steps 1 to 3 for the defender side and the status values `pending`, `running`, `completed`, `failed`. The attacker's prompt, presets, thought capture, and the judge are **Planned**. Today only the defender's system prompt and persona are configurable, and the loop has a hard cap of 10 turns.

## 5. The transcript view

This is the most important screen in the product.

- **Organised by turn.** Each turn is a block containing the attacker message, the defender message, and their companions below.
- **Thought process per message.** The reasoning for each message is available alongside it. It is clearly marked as the model's own account, not a ground truth.
- **Judge commentary per turn.** The judge's reading of the turn, shown next to the messages it concerns.
- **Experiment header.** Name, status, both models, both prompts (preset name or custom text), turn count. A transcript without its conditions is unreadable a week later.
- **Live while running.** Turns appear as they complete. A running experiment looks running.
- **Honest about gaps.** A missing thought process, a pending judge assessment, or a failed experiment is shown as exactly that.

Built for reading speed. Researchers scan many turns to find the interesting one.

## 6. Architecture

```
nous-frontend  --HTTPS-->  nous-backend  --HTTPS-->  nous-ai
  (Next.js 15)               (FastAPI)               (FastAPI, stateless)
                                  |                       |
                                  |                       +--> provider APIs (metered wrapper)
                                  +--> Postgres           (users, experiments, turns, thoughts, judgements)
                                  +--> Redis + Celery     (the conversation driver)
```

| Repo | Owns |
|---|---|
| `nous-backend` | HTTP API, auth and allowlist, the conversation driver, all persistence, and `contracts/` |
| `nous-ai` | `/turn`, `/judge`, the provider adapters, preset prompts, the LLM wrapper |
| `nous-frontend` | All UI. API types generated from the backend's OpenAPI document. |

### 6.1 Where the conversation loop lives

A multi-turn conversation is stateful, but `nous-ai` holds no state and `nous-backend` calls no provider. So:

- **`nous-ai` exposes `POST /turn`.** Stateless. It takes a role, the model, the prompt and persona, and the history so far. It returns one message, the thought process where available, and token counts.
- **`nous-backend` drives the loop.** A Celery task calls `/turn` for each side in turn and persists every message as it arrives.
- **`nous-ai` exposes `POST /judge`** (**Planned**). Stateless. Takes the conversation so far and returns an assessment of the latest turn.

Running the whole conversation inside `nous-ai` would be simpler to write and worse to use. One long request fails atomically after spending real money, nothing is visible until the end, and a partial run cannot be kept. Driving from the backend gives per-turn persistence and live progress at the cost of more round trips, which are small next to model latency.

### 6.2 The contracts mechanism

`contracts/` is the single definition point for shared shapes. `nous-ai` installs it as a package pinned to a `nous-backend` git tag, between the backend and `nous-ai`. The frontend does not consume it. The frontend's contract is the backend's OpenAPI document (`GET /openapi.json`, generated by FastAPI from the live routes): `npm run generate:api` turns it into `lib/api-schema.d.ts`, and that generated file is the source of truth for request and response shapes. `contracts/openapi.yaml` is not that document and is out of date. A shape change between the backend and `nous-ai` lands in `contracts/` first, in its own PR, with a tag.

**Status:** `contracts/` still holds the old entity, extraction, and insight shapes and has no experiment or turn definitions. Replacing them is **Planned**.

## 7. Data model

Everything lives in Postgres. Neo4j and pgvector are retired.

| Table | Purpose | Status |
|---|---|---|
| `users` | Auth. Needs an approval flag or a separate allowlist table. | Built, allowlist Planned |
| `runs` (experiment) | Name, both models, prompts, max turns, status, owner. Needs the attacker prompt and the preset-or-custom marker per role. | Built, partial |
| `turns` | The conversation. Currently one row per message with token counts. | Built |
| thoughts | A model's reasoning for a message. May be a column on `turns` or its own table. | Planned |
| judgements | The judge's assessment of a turn, plus which judge model produced it. | Planned |
| presets | Named attacker and defender prompts. May live in `nous-ai` rather than Postgres. | Open |
| `usage_log` | Token counts and cost for every model call. | Planned |

**Turn shape.** The product's turn is a pair, but `turns` stores one row per message, with a check that exactly one message column is set. Either group rows into pairs when reading, or move to one row per pair. Decide this when building the transcript endpoint, before the thoughts and judgements tables are designed around it.

## 8. API surface

Public, called by the frontend:

```
POST   /auth/register          Built (to be restricted or removed)
POST   /auth/login             Built
GET    /auth/me                Built
POST   /runs                   Built. Create and enqueue an experiment.
GET    /runs                   Planned. The researcher's experiments.
GET    /runs/{id}              Planned. Config, status, and the transcript with thoughts and judgements.
GET    /presets                Planned. Available prompt presets per role.
GET    /models                 Planned. Models available per role.
```

Internal, backend to AI only: `POST /turn` (**Built**), `POST /judge` (**Planned**).

## 9. Invariants

| # | Invariant | How it is enforced |
|---|---|---|
| **INV-1** | `nous-ai` never touches a database | CI banned-import rule |
| **INV-2** | `nous-backend` never calls a provider API directly | CI banned-import rule |
| **INV-3** | `nous-frontend` never calls `nous-ai` | Network topology and code review |
| **INV-4** | Every read is scoped to the researcher's own experiments | Query filters by the authenticated user id, never a client-supplied one. A two-user isolation test is owed. |
| **INV-5** | Only approved researchers get a working session | Allowlist check at login. **Planned.** |
| **INV-6** | Every experiment is reproducible from its record | The stored row captures both models, both prompts, the max turn count, and the temperature. Provider version strings and a seed where available are **Planned**. |
| **INV-7** | Messages, thoughts, and judgements are shown as stored | The UI never paraphrases or rewrites them. |

## 10. Research scope and safety

Nous exists so researchers can observe how models behave when one tries to push the other. That is a legitimate area of study and it carries responsibilities.

1. **Access is limited.** Only approved researchers can run experiments. The allowlist is a safety control, not a convenience.
2. **Transcripts are access-controlled.** They can contain adversarial prompts. They are visible only to the researcher who ran them.
3. **Presets use benign scenarios.** Shipped presets centre on operational rules, such as keeping a code secret or staying in scope, not on eliciting harmful content. Researchers can write custom prompts, and that is their responsibility.
4. **Provider terms apply.** Pointing one model at another to induce a rule break may be restricted by a provider's usage policy. Read and record the policy for each provider before it is offered as a model choice.
5. **Provider data policy.** Confirm in writing that the API tier in use is not retained for training.

## 11. Cost

Every turn costs two model calls, and the judge adds a third. An experiment of ten turns is about thirty calls. Cost is bounded by the maximum turn count and by who is allowed in, so the controls are simple:

- A hard cap on turns per experiment (currently 10).
- A usage log of every call's tokens and cost (**Planned**).
- A spend cap with an alert threshold at the provider or wrapper level (**Planned**).
- Limits on concurrent experiments per researcher (**Planned**).

## 12. Open questions

| # | Question | Notes |
|---|---|---|
| Q1 | **How are thought processes obtained?** | Provider-native reasoning output where a model exposes it, or a structured "reasoning" field requested in the prompt. Decide per model and be explicit in the UI about which one was used. |
| Q2 | **What does the judge see and judge?** | The whole conversation up to this turn, or each turn alone. A rubric, or the judge's own free reading. What it is told about the defender's rule. |
| Q3 | **Turn storage shape** | Pair per row, or message per row. See section 7. |
| Q4 | **Where presets live** | In `nous-ai` with the prompts, or in Postgres so they can be edited without a deploy. |
| Q5 | **Live updates** | Polling or server-sent events. Start with polling. |
| Q6 | **Allowlist mechanism** | An approved-email table managed by an admin, or an environment-driven list. Who administers it. |
| Q7 | **Model roster** | Which models are available to which role at launch, and their cost tier. |
| Q8 | **Batch and comparison features** | Running many experiments at once, or comparing two. Deliberately out of scope for now; revisit once single experiments are solid. |
