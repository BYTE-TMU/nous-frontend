# components/new-experiment/

## Purpose

The "Create New Experiment" dialog, the only place a run gets created. Two steps: prompts, then models and cost. Create calls `POST /runs` and goes to `/experiment/<id>`.

## Key files

| File | Purpose |
|---|---|
| `NewExperimentDialog.tsx` | the dialog: step state, form state, submit, errors |
| `NewExperimentButton.tsx` | drop-in "+ New experiment" trigger that owns the open state |
| `PromptStep.tsx`, `PromptField.tsx` | step 1: name, attacker and defender prompts (Custom/Preset), suggestions |
| `ModelStep.tsx` | step 2: attacker and defender model, cost estimate, Create |
| `buildRunRequest.ts` | maps the form onto the `POST /runs` body |
| `cost.ts` | the dollar estimate |
| `options.ts` | models, prices, presets and suggestions |

## Real and placeholder

| Part | State |
|---|---|
| Create (`POST /runs`) | Real. Sends the name, both models, the defender prompt, `max_turns: 10` |
| Model list, preset prompts, prices | **Placeholder** in `options.ts`. They live in `nous-ai`, which the frontend must not call, and the backend does not expose them yet |
| Cost estimate | Computed from the placeholder prices (10 turns, ~1500 tokens a message, judge excluded). Shows a "Placeholder prices" note |
| Attacker prompt | Shown but **not sent**: `POST /runs` has no field for it. Flip `ATTACKER_PROMPT_SUPPORTED` in `options.ts` once it does |
| Name | Optional here, required by the backend, so a blank one becomes `Experiment YYYY-MM-DD HH:MM` |

When the backend adds model and prompt endpoints, replace the constants in `options.ts` and remove `PRICES_ARE_PLACEHOLDER`.

## Manual testing

Set up the backend and frontend as in `tests/auth/README.md`, then:

1. Log in at `/login` with your test user. Create needs the token it stores.
2. Open `/dashboard` and click **+ New experiment**. This page is a placeholder that hosts the button until the dashboard lands.

| Do this | Expected |
|---|---|
| Open the dialog | "Step 1 of 2: prompts". The attacker prompt is disabled with a "Not sent yet" note |
| Click a defender suggestion | The defender prompt fills with its text |
| Switch the defender to **Preset** | A preset list replaces the text box |
| **Next**, then **Back** | Step 2 appears, and Back keeps what you typed |
| On step 2, before choosing models | **Create** is disabled and the estimate shows "—" |
| Choose both models | **Create** enables and the estimate shows a dollar amount |
| **Create** | "Creating…", then the dialog closes and you land on `/experiment/<id>` |
| Stop the backend, then **Create** | "Can't reach the server…", the dialog stays open, and a retry works |
| Close with X, then reopen | Back on step 1 with empty fields |

To confirm the run exists, copy the id from the URL and the token from DevTools (Local Storage, `nous.access_token`):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/runs/<id>
```

The run stays `pending` unless the Celery worker and `nous-ai` are running. That is fine for testing the dialog.
