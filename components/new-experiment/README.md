# components/new-experiment/

## Purpose

The "Create New Experiment" dialog, the only place a run gets created. One screen (name, models, prompts, suggestions, cost). Create calls `POST /runs` and goes to `/experiment/<id>`.

## Key files

| File | Purpose |
|---|---|
| `NewExperimentDialog.tsx` | the single-screen dialog: layout, form state, submit, errors |
| `NewExperimentButton.tsx` | drop-in "+ New experiment" trigger that owns the open state |
| `PromptField.tsx` | one prompt with the Custom/Preset pill toggle |
| `ModelCard.tsx` | attacker / defender model card (role colour, name, blurb, picker) |
| `BrandSelect.tsx` | the branded select used by the cards and preset prompts |
| `buildRunRequest.ts` | maps the form onto the `POST /runs` body |
| `cost.ts` | the dollar estimate |
| `options.ts` | models, prices, presets and suggestions |

## Real and placeholder

| Part | State |
|---|---|
| Create (`POST /runs`) | Real. Sends the name, both models, the defender prompt, `max_turns: 30` |
| Model list, preset prompts, prices | **Placeholder** in `options.ts`. They live in `nous-ai`, which the frontend must not call, and the backend does not expose them yet |
| Cost estimate | Computed from the placeholder prices (30 turns, ~1500 tokens a message, judge excluded). Shows a "Placeholder prices" note |
| Attacker prompt | Shown but **not sent**: `POST /runs` has no field for it. Flip `ATTACKER_PROMPT_SUPPORTED` in `options.ts` once it does |
| Name | Optional here, required by the backend, so a blank one becomes `Experiment YYYY-MM-DD HH:MM` |

When the backend adds model and prompt endpoints, replace the constants in `options.ts` and remove `PRICES_ARE_PLACEHOLDER`.

## Manual testing

Set up the backend and frontend as in `tests/auth/README.md`, then:

1. Log in at `/login` with your test user. Create needs the token it stores.
2. Open `/dashboard` and click **+ New experiment**. This page is a placeholder that hosts the button until the dashboard lands.

| Do this | Expected |
|---|---|
| Open the dialog | One screen: name, two model cards, two prompt boxes, suggestions, cost. The attacker prompt is disabled with a "Not sent yet" note |
| Click a defender suggestion | The defender prompt fills with its text |
| Switch the defender to **Preset** | A preset list replaces the text box |
| Before choosing models or a defender prompt | **Create experiment** is disabled and the estimate shows "—" |
| Choose both models | The cards show each model's name and blurb, and the estimate shows a dollar amount |
| Add a defender prompt | **Create experiment** enables |
| **Create experiment** | "Creating…", then the dialog closes and you land on `/experiment/<id>` |
| Stop the backend, then **Create experiment** | "Can't reach the server…", the dialog stays open, and a retry works |
| Close with X, then reopen | Empty fields |

To confirm the run exists, copy the id from the URL and the token from DevTools (Local Storage, `nous.access_token`):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/runs/<id>
```

The run stays `pending` unless the Celery worker and `nous-ai` are running. That is fine for testing the dialog.
