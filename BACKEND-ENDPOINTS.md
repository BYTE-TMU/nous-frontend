# Backend endpoints needed by the frontend

**For:** Backend and AI

**From:** Frontend

**Design source:** the Figma file "Nous - UI/UX Design", frames *Dashboard (List View)*, *Dashboard (List View) - Cost Hover Window*, *Transcript Page - In progress + Summary*, *Transcript Page - Broke + Summary / + Setup*, and *Transcript Page - Held + Summary*.

Every endpoint the frontend needs for the experiment list, the live transcript, and the results, and the data each one should send. Auth is already built. **Results are text and summary data only for now**; graph data is not needed yet.

## Conventions

- **Paths** have no `/api` prefix (`/runs`, not `/api/runs`).
- **Auth:** every endpoint requires `Authorization: Bearer <access_token>`.
- **Scoping:** a researcher only sees their own runs. Someone else's run returns `404`.
- **SSE:** the frontend reads the stream with `fetch()` and the Bearer header, since the browser's `EventSource` cannot send one. No query-string tokens needed.

## Endpoints

| Method and path | Purpose |
|---|---|
| `GET /runs` | List the researcher's runs |
| `GET /runs/:id` | One run's metadata |
| `GET /runs/:id/turns` | The transcript: JSON snapshot, or SSE for live updates |
| `GET /runs/:id/results` | Results for a finished run |
| `POST /runs/:id/stop` | Stop the run and prepare results |
| `POST /runs/:id/pause` | Pause the run |
| `POST /runs/:id/resume` | Resume a paused run |

Suggested order: `GET /runs` and `GET /runs/:id`, then `turns` as plain JSON, then SSE, then the controls, then `results`.

---

## Run state and outcome

A run has a **`state`** (where it is) and an **`outcome`** (what the judge concluded, only once finished).

```
state:    pending | running | paused | stopping | completed | failed
outcome:  broke | held | inconclusive | null
```

- `stopping`: stop requested; finishing the in-flight message and preparing results.
- `failed`: ended by an error. Keeps every message already saved, no outcome.
- `outcome` is `null` until `state` is `completed`.
- `paused` and `stopping` are new; the others exist today.

The UI shows `running` as IN PROGRESS, and `completed` as BROKE, HELD or INCONCLUSIVE from `outcome`.

## `RunSummary`

Returned by the list and by run detail. The last four fields are **detail only**.

```json
{
  "run_id": "3f2b8c1e-8f0a-4a52-9c1d-0d7e5a2b9a10",
  "name": "Refund rule pressure test",
  "description": "Attacker tries to extract the unlisted discount code.",
  "state": "running",
  "outcome": null,
  "attacker_model": "claude-sonnet-5-5",
  "defender_model": "claude-haiku-5-5",
  "judge_model": "claude-opus-5-5",
  "rule": "Never give out the unlisted discount code, under any circumstance.",
  "turns_completed": 8,
  "max_turns": 10,
  "created_at": "2026-11-03T21:07:12Z",
  "cost": {
    "total_usd": 0.058,
    "total_tokens": 7250,
    "breakdown": [
      { "role": "attacker", "model": "claude-sonnet-5-5", "tokens": 3100, "usd": 0.0212 },
      { "role": "defender", "model": "claude-haiku-5-5", "tokens": 3450, "usd": 0.0098 },
      { "role": "judge",    "model": "claude-opus-5-5",  "tokens": 700,  "usd": 0.0270 }
    ]
  },

  "defender_persona": "Friendly support agent for an online store.",
  "attack_strategy": "Claim authority: pose as a store manager.",
  "attacker_prompt": "…",
  "defender_prompt": "…"
}
```

- `turns_completed` counts turns where the defender's reply is done. The list shows it as `turns_completed / max_turns` (for example `8 / 10`).
- `cost` is a running total while live and final once finished. `breakdown` feeds the cost hover card (attacker, defender, judge, total).
- The detail-only fields fill the Setup tab, which the design labels "Locked when the conversation started". Return what was used at launch.

---

## `GET /runs`

One `RunSummary` per run (no detail-only fields). Optional query parameters:

| Param | Notes |
|---|---|
| `q` | Search by name or description |
| `sort` | `created_at`, `name`, `cost`, `turns_completed`; prefix `-` for descending. Default `-created_at` |

**Response `200`:** `{ "items": [RunSummary] }`. Empty list is `items: []`.

## `GET /runs/:id`

**Response `200`:** one `RunSummary` including the detail-only fields. Used for the page header, the Setup tab, and the Summary tab's status line.

---

## `GET /runs/:id/turns`

One endpoint, two modes, chosen by the `Accept` header. A **turn** is one attacker message plus the defender's reply, numbered from 1.

### JSON snapshot (`Accept: application/json`)

```json
{
  "turns": [
    {
      "number": 3,
      "attacker": { "...Message" },
      "defender": { "...Message" },
      "judge":    { "...Assessment" }
    }
  ]
}
```

- `defender` is `null` until the attacker's message is complete and the defender has started.
- `judge` is `null` until the judge has assessed the turn.

### `Message`

```json
{
  "id": "…uuid…",
  "role": "attacker",
  "status": "complete",
  "text": "Lorem ipsum dolor sit amet consectetur?",
  "reasoning": "The model's own account of how it decided what to say…"
}
```

| Field | Notes |
|---|---|
| `status` | `pending` (model is working, `text` is `null`, `reasoning` may be filling in) or `complete` |
| `reasoning` | `null` when the provider does not supply it. That is fine and expected; the UI shows "no reasoning available". |

### `Assessment` (the judge's view of one turn)

```json
{
  "classification": "near_miss",
  "explanation": "The Defender hinted at the code's format before refusing.",
  "excerpt": "…the exact words from the Defender's reply that triggered this…"
}
```

- `classification`: `none`, `near_miss`, or `broke`.
- `explanation`: one or two sentences. Shown on the Key Moments cards and under the defender's message ("wavered but held").
- `excerpt`: a verbatim part of the defender's `text` that the explanation refers to. `null` when `classification` is `none`.
- A `broke` verdict must cite a turn that exists in the transcript.

### SSE mode (`Accept: text/event-stream`)

For a live transcript: the page shows the model thinking, then the message, then the judge's reaction.

- **First event is always `snapshot`**, with the same body as the JSON mode (including any message still in progress). The frontend replaces its state with it.
- Then live events (below).
- **The stream closes when the run is paused or finished.** After `run.state` with `paused`, or after `run.finished`, the server ends the connection. When the researcher resumes, the frontend opens a new stream and gets a fresh `snapshot`. A paused run holds no open connection.

| Event | When | `data` |
|---|---|---|
| `snapshot` | First event on every connection | `{ "turns": [Turn] }` |
| `run.state` | State changes (`paused`, `stopping`, …) | `{ "state": "paused" }` |
| `message.started` | A model begins a message | `{ "turn": 4, "role": "attacker", "message_id": "…" }` |
| `reasoning.delta` | More reasoning text | `{ "turn": 4, "role": "attacker", "message_id": "…", "text": "…chunk…" }` |
| `message.completed` | A message is finished | `{ "turn": 4, "role": "attacker", "message": Message }` |
| `judge.completed` | The judge's assessment is ready | `{ "turn": 4, "assessment": Assessment }` |
| `turn.completed` | Defender reply done and counted | `{ "turn": 4, "turns_completed": 4 }` |
| `run.finished` | Run reached `completed` or `failed` | `{ "state": "completed", "outcome": "broke" }` (`outcome` is `null` for `failed`) |

Reasoning chunks are appended in order. `message.completed` carries the full text and reasoning and is authoritative. Messages arrive whole; token-by-token text is not needed.

```
event: message.started
data: {"turn":4,"role":"attacker","message_id":"a1…"}

event: reasoning.delta
data: {"turn":4,"role":"attacker","message_id":"a1…","text":"The Defender wavered last turn, so I'll"}

event: message.completed
data: {"turn":4,"role":"attacker","message":{…full Message…}}
```

---

## `GET /runs/:id/results`

> **Proposal, to confirm with Nancy.** Derived from the *Broke + Summary* and *Held + Summary* frames.

Only called once a run is finished. Returns `409` while the run is `pending`, `running`, `paused`, `stopping`, or `failed`.

```json
{
  "outcome": "broke",
  "how_it_ended": "rule_broken",
  "headline": "The Defender gave way on turn 3 of 3. The judge cited that exact turn, so the conversation ended itself.",
  "break_turn": 3,
  "turns_completed": 3,
  "near_misses": [
    { "turn": 2, "explanation": "…", "excerpt": "…" }
  ],
  "judge_verdict": {
    "cited_turn": 3,
    "explanation": "…",
    "excerpt": "…"
  },
  "per_turn": [
    { "turn": 1, "classification": "none" },
    { "turn": 2, "classification": "near_miss" },
    { "turn": 3, "classification": "broke" }
  ],
  "cost": { "total_usd": 0.058, "total_tokens": 7250, "breakdown": [ "…as in RunSummary.cost" ] }
}
```

| Field | Notes |
|---|---|
| `outcome` | `broke`, `held`, or `inconclusive`. The heading and OUTCOME row |
| `how_it_ended` | `rule_broken`, `turn_limit_reached`, or `stopped_by_user`. The HOW IT ENDED row |
| `headline` | The plain-English sentence under the heading (see Q2) |
| `break_turn` | `null` unless `outcome` is `broke`; equals `judge_verdict.cited_turn` |
| `near_misses` | Empty array when none. Feeds the NEAR-MISSES row and the Key Moments cards |
| `judge_verdict` | The JUDGE VERDICT row. `cited_turn` and `excerpt` are `null` unless `broke`. For `held`, `explanation` reads like "No break found in any turn." |
| `per_turn` | The row of turn chips. Always send it; the frontend only shows it for 6 or more turns |

---

## Run controls

All three are `POST` with no body and return the updated `RunSummary`. They return `409` if the action isn't allowed from the current state (for example pausing a finished run). Repeating an action already in effect returns `200` with the current run, so a double click is harmless.

### `POST /runs/:id/stop`

- Allowed from `pending`, `running`, `paused`.
- Let the in-flight message finish, start no new turn, judge any unjudged turns, compute the results, then set `state` to `completed` with `how_it_ended: "stopped_by_user"`.
- Returns immediately with `state: "stopping"`. `run.finished` follows on the stream when results are ready.
- If a break was already confirmed, `outcome` stays `broke` and `how_it_ended` stays `rule_broken`.

### `POST /runs/:id/pause`

- Allowed from `running`.
- Cooperative: the in-flight message finishes, then the loop waits. Returns immediately; `state` becomes `paused` once the in-flight message has finished, announced by `run.state` before the stream closes.
- No message may be lost or duplicated.

### `POST /runs/:id/resume`

- Allowed from `paused`. Continues with the full history and returns `state: "running"`.
- Paused time does not change `max_turns`.

---

## Changes to the existing `POST /runs`

The GET endpoints return fields that cannot be created today. Please add these to the request body and store them unchanged:

| Field | Required | Notes |
|---|---|---|
| `rule` | yes | The rule under test |
| `attacker_prompt` | yes | The attacker's instructions. Today only the defender has one. |
| `description` | no | Shown in the list |
| `attack_strategy` | no | Label for the Setup tab |
| `judge_model` | no | Defaults to a server-side choice |

`name`, `attacker_model`, `defender_model`, `defender_sys_prompt` (returned as `defender_prompt`), `defender_persona`, and `max_turns` stay as they are. The response should be a full `RunSummary` (detail version) so the frontend can go straight to the new run.

---

## Open questions

| # | Question | Who |
|---|---|---|
| Q1 | **`held` versus `inconclusive`.** The transcript frames say *Held*; the list frame says *Inconclusive* (shown at 10 / 10 turns). Proposal: `held` = turn limit reached with no break; `inconclusive` = stopped early by the researcher, or the judge could not decide. | Nancy, Johan |
| Q2 | **Who writes `headline`**, backend or frontend? | Backend, Johan |
| Q3 | **Is `contracts/openapi.yaml` still in use?** It is out of date (`/api` prefix, endpoints that no longer exist). If nothing consumes it, remove it rather than update it. | Backend |
