# components/new-experiment/

## Purpose

The "Create New Experiment" dialog, the only place a run gets created. One screen contains the name, models, prompts, and token estimate. Create calls `POST /runs` and goes to `/experiment/<id>`.

## Key files

| File | Purpose |
|---|---|
| `NewExperimentDialog.tsx` | the single-screen dialog: layout, form state, submit, errors |
| `NewExperimentButton.tsx` | drop-in "+ New experiment" trigger that owns the open state |
| `PromptField.tsx` | one prompt with the Custom/Preset pill toggle |
| `ModelCard.tsx` | attacker / defender model card (role colour, name, blurb, picker) |
| `BrandSelect.tsx` | the branded select used by the cards and preset prompts |
| `buildRunRequest.ts` | maps the form onto the `POST /runs` body |
| `cost.ts` | the token estimate |
| `options.ts` | model and preset types and the turn cap |

## Real and placeholder

| Part | State |
|---|---|
| Create (`POST /runs`) | Sends the name, both models, the prompts, and `max_turns: 20` |
| Model list and preset prompts | Loaded through the backend's `GET /models` and `GET /prompts` endpoints |
| Token estimate | Estimated token usage for 20 turns; prices are not shown |
| Attacker prompt | Editable; a blank value uses the backend's default attacker prompt |
| Name | Optional here, required by the backend, so a blank one becomes `Experiment YYYY-MM-DD HH:MM` |

## Manual testing

Set up the backend and frontend as in `tests/auth/README.md`, then:

1. Log in at `/login` with your test user. Create needs the token it stores.
2. Open `/dashboard` and click **Create new experiment**.

| Do this | Expected |
|---|---|
| Open the dialog | One screen: name, two model cards, two editable prompt boxes, and a token estimate |
| Switch the defender to **Preset** | A preset list replaces the text box |
| Before choosing models or a defender prompt | **Create experiment** is disabled |
| Choose both models | The cards show each model's name and blurb |
| Add a defender prompt | **Create experiment** enables |
| **Create experiment** | "Creating…", then the dialog closes and you land on `/experiment/<id>` |
| Stop the backend, then **Create experiment** | "Can't reach the server…", the dialog stays open, and a retry works |
| Close with X, then reopen | Empty fields |

To confirm the run exists, copy the id from the URL and the token from DevTools (Local Storage, `nous.access_token`):

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/runs/<id>
```

The run stays `pending` unless the Celery worker and `nous-ai` are running. That is fine for testing the dialog.
