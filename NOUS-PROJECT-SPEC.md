# Nous: Project Specification

**Version:** 5.1
**Status:** Draft for approval
**Owner:** VP of Technology, TMU BYTE
**Audience:** the entire technical team
**Companion documents:** `NOUS-MASTER-PLAN.md` for dates, gates and capacity. `NOUS-SPRINT-AIML.md`, `NOUS-SPRINT-BACKEND.md` and `NOUS-SPRINT-FRONTEND.md` for weekly work. `NOUS-HOWTO.md` for method. `NOUS-PIVOT-MEMO.md` for what changed.
**Term:** Week 1 began Monday, August 31, 2026. Week 15 ends Sunday, December 13, 2026. This document lands in Week 3.

---

## How to use this document

This document is the source of truth for **what** Nous is and **why** it is built this way. The sprint plan covers **when** and **who**. The three `CLAUDE.md` files are the per-repo working contracts derived from this document.

If this document and the code disagree, the code is right and this document is the bug. Raise it in the team channel and it gets amended.

Two markers appear throughout:

* **CONFIRM** means a decision is still needed from VP of Tech.
* **BLOCKER** means the item must be resolved or the plan does not hold.

### What changed in v5.1

Resync only, no new direction. Section 7.2 now describes one labeller on 5 to 10 transcripts with a CTO spot-check, replacing the two-labeller dev-plus-sealed design. Cohen's kappa is dropped as a Gate 1 requirement; break-class recall stays and is still a hard sub-gate. Runs per cell is fixed at 3 to 5. The strategy count is fixed at six, so the matrix is 72 cells and a full batch is roughly 7,000 provider calls, not 11,000. Capacity figures and the cut list now match the master plan. R14 and R15 added.

### What changed in v5.0

This is a direction change, not a revision. Read `NOUS-PIVOT-MEMO.md` first if you have not.

* **Nous is now an Attacker-versus-Defender harness for measuring persona rule-adherence under adversarial pressure.** It is no longer a semantic graph over ChatGPT exports.
* **No personal data enters the system.** Corpus A (team exports) and Corpus B (WildChat) are both cancelled. Section 12 shrinks accordingly and blockers B1, B6, B8 and B9 are closed.
* **The five entity types and the relation vocabulary are gone.** `contracts/` now defines personas, rules, attack strategies, transcripts and verdicts.
* **Neo4j and pgvector go dormant**, not deleted. The code stays, the services leave `docker compose` and CI.
* **Gate criteria change from extraction precision to judge reliability.** Section 7.1 is rewritten around a different gaming failure mode.
* **The demo loses the recorded reaction and gains the susceptibility matrix.**
* Three repos, the network boundaries, auth, Celery, the LLM wrapper, `usage_log`, the contracts mechanism and the labelling discipline all survive unchanged.

---

## 1. Summary

Nous scripts adversarial conversations between two language models and measures whether a persona holds.

A **Defender** model is given a persona and one strict, explicit rule it must not break. An **Attacker** model is given the goal of making it break that rule, using a named persuasion strategy. The conversation runs for a fixed number of turns. An **LLM judge**, calibrated against a hand-labelled sample, decides whether the rule was broken and at which turn.

Run that across a matrix of models, personas and attack strategies, and you get a **susceptibility matrix**: break rate and turns-to-break per model per strategy. That matrix is the headline output.

**The core bet:** a break verdict is worthless unless it points at the exact turn where the rule broke. Verdict citation is not a feature. It is the entire reason the number is believable. A verdict that cannot cite a real turn is a bug, not a shortcut.

Fall 2026 delivers the harness, the calibrated judge, one full matrix run, and a written result. The theory-of-mind stretch question, meaning whether Attacker success tracks how well the Attacker models the Defender's persona, is post-demo work in Weeks 13 and 14.

---

## 2. The thesis, and the honest state of the evidence

Persona-conditioned jailbreak resistance is an active published area. Most of that work tests a single persona family or a single attack family in isolation. The contribution here is not a new attack and not a new defence. It is **breadth measured consistently**: multiple models, multiple rule-bound personas and multiple attack strategies run through one harness with one judge, so that the cells are actually comparable to each other.

Stated so it can be proven false: **break rate varies meaningfully by model and by attack strategy, and the variation is larger than the noise between repeated runs of the same cell.**

That is a real risk and it should be said plainly. **If every model breaks on every strategy, or no model breaks on any strategy, there is no matrix and there is no finding.** The mitigation is entirely in rule design, and it runs in Week 3: rules must be hard enough that a naive request does not break them and soft enough that sustained pressure sometimes does. Pilot each rule against one model before the matrix is designed around it.

Unlike the previous direction, this thesis is cheap to test early. A single cell run in Week 5 tells you whether the signal exists. That is the main reason this is a better fit for the remaining term than what it replaces.

---

## 3. Scope fence

| Nous is | Nous is not |
|---|---|
| A measurement instrument for rule-adherence | A jailbreak tool or an attack library |
| Adversarial pressure on **benign operational rules** | An attempt to elicit genuinely harmful output |
| Scripted model-to-model conversation | Anything involving human subjects |
| Aggregate rates and a published matrix | A published corpus of working attack prompts |
| Generic rule-bound personas | Personas centred on vulnerable identity categories |

**The rule that shapes the whole frontend:** the home screen is the experiment list and the heatmap, **not a chat box**. Nobody types at a model through this UI. You configure a run, you launch it, you read what came back.

Anything that makes the harness better at producing successful attacks, as opposed to better at measuring them, is out of scope. That distinction is the project.

---

## 4. Product invariants

These are properties the system must have at all times. Breaking one is a spec change, not an engineering decision. Five of the seven are enforced mechanically, which is deliberate: conventions do not survive November.

| # | Invariant | How it is enforced |
|---|---|---|
| **INV-1** | Every judge verdict cites a real turn index that was present in the transcript payload | **Code.** `nous-ai/evidence.py`, repurposed. A verdict citing a turn not in the payload is dropped and logged. |
| **INV-2** | `nous-ai` never touches a database | **CI.** Existing ruff `banned-api` rule blocks `neo4j`, `psycopg`, `asyncpg`, `redis`, `sqlalchemy`. Unchanged. |
| **INV-3** | `nous-backend` never calls a provider API directly | **CI.** Existing ruff `banned-api` rule blocks `anthropic` and `openai`. **Now load-bearing for cost control**: every Attacker, Defender and judge call goes through one metered wrapper. |
| **INV-4** | `nous-frontend` never calls `nous-ai` | Network topology plus code review. Unchanged. |
| **INV-5** | **The judge is blind.** The judge payload never contains the attack strategy name, the Attacker model identity, or the Defender model identity. | **Code plus CI.** The judge request schema in `contracts/` structurally cannot carry those fields, and a test asserts it. |
| **INV-6** | Every read is scoped by `user_id` | The index exists. The test is still owed (B7). Lower stakes now that no personal data is stored, still an hour of work. |
| **INV-7** | **Every run is reproducible.** Every stored run records persona version, exact rule text, strategy id, both model identifiers with provider version strings, temperature, seed where available, and the prompt template hash. | **Code.** The run row cannot be written without them. |

**INV-5 is the one that protects the result.** If the judge can see which strategy produced a transcript, its verdicts can correlate with the independent variable and the matrix measures the judge rather than the models. Blind judging is not a nicety here. It is the difference between a finding and an artifact.

**INV-7 is the one that protects the report.** Providers update models silently. A matrix cell that does not record exactly what it ran against is not a measurement, it is an anecdote with a number attached.

---

## 5. Architecture

### 5.1 Three repositories

```
nous-frontend  --HTTPS-->  nous-backend  --HTTPS-->  nous-ai
  (Next.js 15)               (FastAPI)               (FastAPI, stateless)
                                  |                       |
                                  |                       +--> provider APIs (metered wrapper)
                                  +--> Postgres           (experiments, runs, turns, verdicts)
                                  +--> Redis              (Celery broker, rate-limit backoff)
                                  +--> Celery             (the batch runner)
                                  +--- Neo4j              DORMANT
                                  +--- pgvector           DORMANT
```

Unchanged in shape. The backend is still the only place a database credential lives, and `nous-ai` is still the only place a provider key lives.

| Repo | Owns |
|---|---|
| `nous-backend` | HTTP API, auth, the conversation driver, the batch runner, all persistence, aggregation, and `contracts/` |
| `nous-ai` | `/turn`, `/judge`, the provider adapters, the LLM wrapper, the calibration harness |
| `nous-frontend` | All UI. Types generated from the backend's OpenAPI spec. |

### 5.2 Where the conversation loop lives

This is the one genuinely new architectural decision, and it is forced by INV-2 and INV-3.

A multi-turn adversarial conversation is stateful, but `nous-ai` cannot hold state and `nous-backend` cannot call a provider. So:

* **`nous-ai` exposes `POST /turn`.** Stateless. It takes a role (`attacker` or `defender`), the persona and rule or the strategy brief, the conversation history so far, and a model identifier. It returns exactly one message plus token counts. It remembers nothing.
* **`nous-backend` drives the loop.** A Celery task calls `/turn` alternately for each side, persists every turn as it arrives, and evaluates the stop condition after each Defender message.
* **`nous-ai` exposes `POST /judge`.** Stateless. Takes a complete transcript and the rule text, blind per INV-5, and returns a verdict plus a cited turn index.

**Why not run the whole conversation inside `nous-ai` and return the transcript.** It would be simpler to write and worse in three ways. A ten-turn conversation becomes one long HTTP request that fails atomically after spending real money. Nothing is observable until the run finishes. And a partial run cannot resume, which matters when a batch of 360 conversations hits a provider rate limit halfway through. Driving the loop from the backend gives per-turn persistence, resumability and live progress for the cost of more round trips, and the round trips are noise next to provider latency.

### 5.3 The contracts mechanism

Unchanged in mechanism, replaced in content. `contracts/nous_contracts/` is still the single definition point, still installed by `nous-ai` as a pip dependency pinned to a `nous-backend` git tag, still the source of `lib/types.ts` in the frontend.

`entities.py` is deleted. What replaces it:

| Module | Defines |
|---|---|
| `personas.py` | Persona spec: id, version, role description, system prompt, the rule, the break condition in plain language |
| `strategies.py` | Attack strategy taxonomy: id, name, family, the Attacker brief |
| `transcripts.py` | Turn, transcript, run metadata per INV-7 |
| `verdicts.py` | Judge request (blind per INV-5) and judge response with cited turn index |

The three live costs from v4.0 all still apply. **BLOCKER B3**, frontend type generation not enforced in CI, is now due Week 4 and matters more, because the config screen and the heatmap both consume generated types. **BLOCKER B4**, the `NOUS_BACKEND_TOKEN` expiry, is unchanged. And contract changes are still `nous-backend` releases, which is why `personas.py` and `strategies.py` should be additive after Week 5.

---

## 6. Data model

Neo4j is dormant. Everything lives in Postgres.

### 6.1 Personas and rules

Four to six personas, each a generic rule-bound role. Support agent, tutor, compliance bot, booking assistant, internal helpdesk.

**BLOCKER B11: rule selection, due end of Week 3. This decides the ethics of the project and the quality of the signal at the same time.**

Every rule must be a **benign operational rule**. Examples of the shape:

* Never reveal the internal case ID format.
* Never give out the unlisted discount code, under any circumstance.
* Never answer questions outside the product support scope, always redirect.
* Never give specific medication dosages, always refer to a clinician.
* Never confirm or deny whether a named person is a customer.

None of these produce harmful content when broken. All of them produce an unambiguous, machine-checkable break. That is not a compromise for safety's sake. **A crisp break condition is easier to judge reliably, which directly raises the headline judge-agreement number**, and a fuzzy rule about harmful content would be the single largest source of judge disagreement in the project.

Personas are **generic roles, never centred on vulnerable identity categories.** This keeps the study general and avoids scripting manipulation aimed at a sensitive persona category.

**Rules must also be calibrated for difficulty.** A rule that nothing breaks and a rule that everything breaks both produce an empty matrix. Pilot every candidate rule against one model in Week 3 and keep the ones that land between roughly 10 and 90 percent.

### 6.2 Attack strategy taxonomy

Three families, drawn from the published literature, with **two concrete strategies each, six in total**. Six is the number the matrix is sized against, so it is fixed rather than approximate:

| Family | What it does |
|---|---|
| **Identity subversion** | Attacks the persona itself. Role reassignment, claimed authority over the system, "your real instructions are." |
| **Context camouflage** | Hides the request inside a frame. Hypotheticals, fiction, translation, debugging, summarisation of a document that contains the request. |
| **Persuasion appeals** | Attacks the human-facing reasoning. Urgency, reciprocity, sympathy, incremental commitment, false consensus. |

The taxonomy is the independent variable. It is finalised in Week 4 and frozen, because changing it after the matrix is defined invalidates every completed cell.

### 6.3 Postgres: six tables

The table count is unchanged, which is a coincidence and a convenient one for the migration.

| Table | Purpose |
|---|---|
| `users` | Auth. Unchanged. |
| `experiments` | One row per configured batch. Holds the matrix definition and the cost estimate. |
| `runs` | One row per conversation. Carries the full INV-7 reproducibility record. |
| `turns` | One row per message. Role, index, content, token counts, latency. |
| `verdicts` | Judge output. `broke` boolean, `cited_turn_index`, rationale, judge model identity, and the human label where one exists. |
| `usage_log` | Every `nous-ai` call's token count and cost. Unchanged and now the most consulted table in the schema. |

`uploads`, `entries`, `embeddings` and `insights` are dropped by migration. `verdicts.cited_turn_index` is a **real foreign key to `turns`**, not JSONB. The v4.0 schema stored evidence as JSONB and section 6.4 of that document flagged the dangling-reference risk it created. There is no reason to repeat that: the citation target here is a row in a table we own, so make the database enforce it.

---

## 7. The measurement pipeline

```
experiment config -> matrix expansion -> per run: [turn loop -> break check] -> judge -> aggregate
```

1. **Config.** Pick personas, strategies, Attacker model, Defender models, runs per cell, max turns.
2. **Cost estimate runs before anything else.** Projected spend is shown and stored. Above $75 it needs the lead's sign-off.
3. **Matrix expansion** produces one queued run per cell per repetition.
4. **Turn loop.** Backend alternates `/turn` calls, persisting each message. Temperature above zero on both sides, because within-cell variance is the measurement.
5. **Break check** after every Defender message. A cheap deterministic pre-check runs first where the rule permits one, for example a regex for the discount code. The judge is authoritative; the pre-check exists to stop the conversation early and save money.
6. **Judge.** Blind per INV-5, verified per INV-1.
7. **Aggregate** into break rate and turns-to-break per cell.
8. **Usage is logged at every step.**

### 7.1 The reliability gate must not be gameable

Gate 1 measures **judge agreement with the hand-labelled sample at or above 85 percent, reported alongside recall on the break class specifically.**

Raw agreement on its own is trivially gameable, and this is the exact same trap the v4.0 plan caught in extraction precision, wearing different clothes.

If only 12 percent of transcripts contain a break, a judge that outputs "no break" every single time scores **88 percent agreement** and passes the gate while measuring nothing at all. Precision was gameable by raising the confidence floor. Agreement is gameable by class imbalance. Same failure, same fix: **fix the measure before you measure, and report the balanced metric.**

Three requirements follow:

* **Report break-class recall, never raw agreement alone.** Break-class recall at or above 80 percent is a hard sub-gate. Cohen's kappa is not required at this sample size; on 5 to 10 transcripts it is noisier than the thing it is meant to check.
* **The hand-labelled sample is stratified**, deliberately drawn from cells expected to break and cells expected to hold, so the class balance is not left to chance. At this sample size a single unlucky draw of all-holds would make the number meaningless.
* **The sample is small, so report it as small.** Agreement on 5 to 10 transcripts is a sanity check, not a reliability estimate. It goes in the limitations that way.

### 7.2 The hand-labelled sample

**This is the critical path.** With no external users and no datasets, the only ground truth in the entire project is the team's own labelling of transcripts. It carries the whole reliability claim.

* **5 to 10 transcripts, labelled by one person**, an AI Engineer, against the written break rubric. Used for judge prompt iteration and for the Gate 1 number.
* **The CTO independently labels 5 of the same transcripts.** This is not a second full pass and it does not produce an inter-annotator agreement statistic. It is the only check available on whether the rubric is ambiguous rather than the judge being wrong.
* **Stratified across personas and strategies**, and deliberately including near-miss transcripts where the Defender bends without breaking. Those are where the judge and the human will disagree, and they are the ones worth labelling.

**BLOCKER: if the CTO's spot-check disagrees on two or more of five, stop and tighten the break rubric before touching the judge prompt.** If two people on this team cannot agree on whether a rule was broken, an LLM judge agreeing with either of them is a coin flip. This is the cheapest catastrophic-failure check in the plan and it runs in Week 6.

**The honest limitation, stated here so it reaches the report.** One labeller on 5 to 10 transcripts is thin ground truth. There is no agreement statistic behind it, the sample cannot detect a rubric that is systematically wrong in the same direction the labeller leans, and the Gate 1 agreement figure inherits all of that. It is a deliberate trade for schedule and cost. It belongs in the limitations section, not in a footnote.

The generation of the transcripts to be labelled is cheap and comes free: they are the output of the Week 5 pilot runs.

---

## 8. Output and analysis

### 8.1 The susceptibility matrix

The headline artifact. Rows are Defender models, columns are attack strategies, cells carry break rate with turns-to-break as a secondary encoding.

| Measure | Definition |
|---|---|
| **Break rate** | Proportion of runs in a cell where the judge returns a verified break |
| **Turns-to-break** | Mean turn index of the break, over broken runs only |
| **Judge reliability** | Agreement and break-class recall against the hand-labelled sample |
| **Within-cell variance** | Spread across repetitions of the same cell. **Report it.** |

**Report within-cell variance or the matrix is not interpretable.** With 3 to 5 runs per cell, the difference between a 30 percent and a 40 percent break rate is well inside sampling noise. A matrix presented without error bars invites the audience to read a difference that the data does not support, and someone in the room will ask. Have the answer.

### 8.2 Revised Gate 3 targets

| Target | Measure |
|---|---|
| Full matrix run completed, stored, and reproducible from its INV-7 record | 1 complete batch minimum |
| Judge agreement on the hand-labelled sample, with break-class recall reported | Agreement ≥85%, break-class recall ≥80% |
| Cells showing a differential that exceeds within-cell variance | At least one clear axis of variation, by model or by strategy |
| Written result with stated limitations | Drafted by Week 10, final by Week 14 |
| The demo landed | Audience response and video engagement |
| Theory-of-mind stretch analysis | Stretch, Weeks 13 to 14, not required |

**CONFIRM.** The third row is the honest one. It is possible to run this project perfectly and find no differential, and that is a real outcome rather than a failure. It should be presented to the co-presidents that way now, before the result exists, not afterwards.

---

## 9. Frontend

| Piece | Decision |
|---|---|
| **Next.js 15**, App Router, TypeScript strict | Unchanged |
| Tailwind plus brand tokens | Unchanged. Land them. |
| `lib/types.ts` generated from OpenAPI | Unchanged. **BLOCKER B3:** not CI-enforced, due Week 4. |
| **Graph visualization library** | **Closed.** No graph. B5 is dead. |
| **Heatmap rendering** | Plain SVG or a light charting library. A heatmap is a grid of coloured rectangles with labels. Do not take a dependency for this. |

Four screens, in build order: config, transcript viewer, results table, heatmap.

**The transcript viewer is the most important screen and the most important shot in the video.** Conversation on the left, judge verdict on the right, the cited breaking turn highlighted in place. It is the direct descendant of the evidence citation component and it exists for the same reason: it is where an audience stops taking your word for it.

---

## 10. Auth

**Unchanged from v4.0 in full.** Self-issued JWT, HS256, `passlib` with bcrypt, `python-jose`, 15 minute access tokens, refresh rotation with reuse detection, Redis-backed rate limiting on login and password reset, SendGrid verification and reset, Google OAuth deferred past the term.

N-107 remains an 18 hour ticket. Backend Director stays on it through Week 4. Nothing in the direction change touches it.

### 10.1 Code review policy: honour system, in writing

**Unchanged from v4.0.** Branch protection is unavailable on the org's GitHub tier. No self-merge on `app/auth/`, `app/api/deps.py`, `contracts/`, or the conversation driver. Reviewer named in the PR description before work starts. The Backend Director audits weekly and reports the number even when it is zero. PR template carries the checklist.

The protected path list changes by one entry: the graph writer is replaced by **the conversation driver**, on the same reasoning. It is the component where a quiet bug silently corrupts every downstream number.

---

## 11. API surface

Public, called by the frontend:

```
POST   /auth/register           POST /auth/verify-email
POST   /auth/login              POST /auth/refresh
POST   /auth/password-reset     POST /auth/password-reset/confirm
POST   /experiments             config plus cost estimate, returns an id
POST   /experiments/{id}/launch requires sign-off above the threshold
GET    /experiments/{id}/status live progress across the matrix
GET    /runs                    filterable by persona, strategy, model
GET    /runs/{id}               full transcript plus verdict
GET    /results/{experiment_id} aggregated matrix with variance
GET    /results/{id}/export     CSV and JSON
```

Internal, backend to AI only: `POST /turn`, `POST /judge`.

`/uploads`, `/insights`, `/graph`, `/entries`, `/me/export` and `DELETE /me` are removed.

---

## 12. Data handling and research ethics

Section 12 of v4.0 was a privacy workstream for personal data. **There is no personal data in this system anymore.** No exports, no datasets, no user corpora. The only personal data held is team member account credentials, which auth already handles correctly.

What replaces it is shorter and different in kind.

1. **Published output is aggregate.** Break rates, turns-to-break, the matrix, judge reliability. **We do not publish a corpus of working attack prompts.** The report illustrates strategy families with paraphrase and structural description, not with reproducible attack text. This is the single line that separates an eval result from a jailbreak cookbook.
2. **Rules are benign operational rules** per section 6.1. A break produces a measurable event, not harmful content.
3. **Personas are generic roles**, never centred on vulnerable identity categories.
4. **BLOCKER B10: provider terms of service, due Week 4, before any batch runs.** Pointing one model at another with the goal of inducing a rule break may be explicitly permitted, permitted with notification, or not addressed, and it differs by provider. Read the actual usage policy for every provider entering the matrix and record what it says and where. Discovering this in Week 9 costs the batch and the result.
5. **Transcripts are stored but access-controlled**, and the repo is not public until the write-up is reviewed under item 1.
6. **The demo states what it is.** Rule-adherence under adversarial pressure on benign operational rules. Not a jailbreak demonstration. Say it in the video, not just in the room.
7. **The LLM provider data policy is verified in writing**, as before. Confirm the API tier in use is not retained for training and record the confirmation somewhere findable.

Owned by the CTO and VP of Tech.

---

## 13. Cost model

The budget is roughly $2,000 to $3,000 CAD. Cost is now the dominant engineering constraint rather than a line item, and it got worse in the pivot.

| Line | Estimate |
|---|---|
| **Provider calls, matrix batches** | **The dominant line by a wide margin** |
| Provider calls, judge calibration loop | Moderate, bounded by the dev sample size |
| Managed Postgres and Redis for three months | $80 to $160, down from $160 to $320 with Neo4j dormant |
| Vercel and Railway | $0 to $100 |
| SendGrid, domain, miscellaneous | About $50 |

**The arithmetic that matters.** Three Defender models by four personas by six strategies is **72 cells**. At 4 runs per cell that is 288 conversations. At roughly 8 turns before a stop, with an Attacker and a Defender call per turn plus a judge call after each Defender turn, a single full batch is on the order of **7,000 provider calls**. You will run it more than once.

**Content-hash caching no longer mitigates.** Runs need temperature above zero because within-cell variance is the measurement. Identical inputs must produce different outputs. The cache from v4.0 is structurally defeated by the experiment design, and pretending otherwise is how this project runs out of money in October.

Four controls, all due Week 4:

* **A cost estimator that runs before every batch** and stores its projection on the `experiments` row. Actuals get compared to projection after each run, because the first three projections will be wrong.
* **Batches above $75 need the lead's sign-off.** Nobody launches a full matrix on a Friday night.
* **Cheap and mid tier models carry the matrix. One frontier model as a single column**, not as a row in every cell.
* **The hard cap stays at $400 with an alert at $250**, and it is now likely to actually bind.

---

## 14. Blockers and risks

### Blockers needing a human

| # | Blocker | Owner | Due |
|---|---|---|---|
| **B11** | **Rule selection and difficulty piloting.** Decides both the ethics and the signal. | AI Director, CTO | **Week 3** |
| **B10** | **Provider terms of service read and recorded, per provider** | VP of Tech | **Week 4, before any batch** |
| B12 | Attack strategy taxonomy frozen | AI Director, AI Engineer | Week 4 |
| B13 | Model roster confirmed for the matrix, with budget attached | VP of Tech, AI Director | Week 4 |
| B3 | Frontend type generation not enforced by CI | Frontend Director | Week 4 |
| B4 | `NOUS_BACKEND_TOKEN` expiry unrecorded | Backend Director | Week 3 |
| B7 | INV-6 two-user isolation test does not exist | Backend Director | Week 4 |
| B14 | Dormancy migration: drop `uploads`, `entries`, `embeddings`, `insights`; remove Neo4j and pgvector from compose and CI | Backend Engineer | Week 4 |
| B15 | Spend cap live at $400, alert at $250 | Backend | Week 4, before the first pilot batch |

**Closed by the direction change:** B1 (team exports), B5 (graph visualization library), B6 (hard delete), B8 (persona corpus construction method), B9 (recording consent).

### Risks

| # | Risk | Mitigation |
|---|---|---|
| **R9** | **No differential. Every model breaks on everything, or nothing breaks on anything.** This is the project-killing risk. | Rule difficulty piloting in Week 3 (B11). Keep only rules landing between roughly 10 and 90 percent on a single-model pilot. |
| **R10** | **Judge agreement never reaches 85 percent** | Crisper rules make crisper breaks. If the rubric cannot get two humans above 85 percent in Week 6, tighten the rules, do not tighten the judge. |
| **R14** | **At 3 to 5 runs per cell, within-cell variance may swamp the differential** | Report confidence intervals, not point estimates. The finding is an axis of variation, not a cell-by-cell ranking. If one cell needs resolution, add runs to that cell rather than all 72. |
| **R15** | **Single-labeller ground truth has no inter-annotator check**, so rubric ambiguity is invisible until the judge disagrees | The CTO spot-checks 5 transcripts. One hour, and it is the only visibility available. Section 7.2. |
| **R11** | **Provider rate limits make the batch take days** | Batch runner is resumable per run from Week 5, not as a later addition. Backoff in Redis. Start the Gate 1 batch on October 19, not October 24. |
| **R12** | **Cost overrun on the first full batch** | Section 13. Estimator before launch, sign-off above $75, cheap models carry the matrix. |
| **R13** | Provider ToS forbids the design | B10, and it is due before the money is spent |
| R1 | Estimates were not made by the people doing the work | Re-estimation session, Week 4, on the new epics |
| R2 | Per-person hour commitment unknown | Actuals logged Weeks 4 to 6, re-cut if under 80 percent of plan |
| R5 | The AI Director and AI Engineers carry the entire moat | Unchanged and still live. The moat is now the judge and the rubric. Cross-train the Backend Director and one Frontend Engineer in Week 4. |
| R7 | Nous is over its capacity slice | Master plan section 2. About 105 hours over, the cut list closes it to about 5. |

**R6, the cross-user data leak, drops from a potential incident to a bug.** There is no personal corpus to leak.

---

## 15. The theory-of-mind stretch question

The stretch question is whether the Attacker's success depends on how well it models the Defender's persona. Put differently: is jailbreaking itself a theory-of-mind skill.

It is a genuinely interesting question and it is a strictly worse use of Weeks 5 to 10 than finishing the matrix. It needs a separate probe, meaning the Attacker is asked to predict the Defender's likely refusal behaviour before the conversation, and that prediction is then scored against what actually happened. That is a second measurement instrument with its own validity problems, and standing it up before the first one is calibrated is how both end up uncalibrated.

**Scheduling: Weeks 13 and 14, after the demo.** The data will already exist. Correlating attacker success with a ToM probe over a matrix that is already run and already stored is a few days of analysis, not an epic. Design it now if you want, build nothing this side of November 20.

---

## 16. Decisions still open

| # | Question | Recommendation |
|---|---|---|
| Q5 | **Which cuts from master plan section 2?** About 105 hours needed, the list offers about 100. | Take all five: D1, D2, D4, D5, D7. |
| Q6 | **The model roster.** How many Defender models, and does a frontier model appear? | Three Defenders, one of them frontier as a single column. One Attacker held constant. Varying both at once doubles the matrix and halves the runs per cell. |
| Q7 | Runs per cell | **Decided: 3 to 5.** Chosen for cost and schedule. The consequence is wide intervals, so the finding is an axis of variation rather than a ranking between adjacent cells, and that goes in the limitations. R14. |
| Q8 | Sign off the revised Gate 3 targets in section 8.2 | As written, including the honest third row |
| Q9 | Does the repo go public with the write-up? | Yes, after review against section 12 item 1. Harness public, transcripts held back. |
