# Nous: Frontend Sprint

**Version:** 3.0
**Team lead:** Frontend Director
**Read first:** `NOUS-PROJECT-SPEC.md` v6.0 sections 3, 5 and 9. Then `NOUS-MASTER-PLAN.md` for build order.

This document says what the frontend builds and in what order. It carries no dates; see the master plan note on scheduling.

---

## Already done, do not redo

| Already exists | Note |
|---|---|
| `nous-frontend` repo, Next.js 15, App Router, TypeScript strict, CI | Do not create a repo. |
| App shell and brand tokens in Tailwind | Deep forest green and gold. |
| `lib/api.ts`, `lib/auth.ts`, `lib/types.ts` | Currently stubs; `types.ts` is generated from the backend spec. |
| UI primitives in `components/ui/` | Button, Card, EmptyState. |

**Legacy, delete as replacements land:** `app/upload`, `app/fingerprint`, `app/entries`, `app/account`, `components/insight`, `components/graph`, `components/upload`. They belong to the previous product and nothing new should import from them.

**The rule that shapes everything:** researchers read and inspect; they do not chat. No screen has a text box that talks to a model.

---

## Build order

### 1. Login and the "not approved" state

- Login screen against `POST /auth/login`; token handling in `lib/auth.ts`.
- A valid login that is not on the allowlist gets a clear message, not a generic failure.
- Redirect unauthenticated visits to login.

**Exit:** an approved researcher can log in and reach the experiment list; an unapproved one sees why they cannot.

### 2. Type generation enforced in CI

- Make CI regenerate `lib/types.ts` and fail on a diff, before real routes exist.

**Exit:** a backend contract change that is not reflected in the frontend fails CI.

### 3. Experiment list

- Home screen. The researcher's experiments with name, status, models, turn count, and created time.
- Link each row to its transcript.
- Empty state for a researcher with no experiments, with a clear route to create one.

**Exit:** the list renders real data and every state (empty, loading, error) is handled.

### 4. Experiment configuration form

- Two role sections, attacker and defender. Each: model, and a prompt that is either a **preset** (from the backend list) or **custom** text.
- Name and maximum turns.
- Model and preset lists come from backend endpoints. Do not hardcode them.
- On submit, create the experiment and go to its transcript.

**Exit:** a researcher can launch an experiment from the UI and land on its transcript.

### 5. Transcript view, messages first

The most important screen in the product.

- Fetch one experiment by id.
- Header: name, status, both models, both prompts, turn count.
- Body: one block per turn, attacker message then defender message, clearly distinguished.
- **Live while running.** Poll while status is `pending` or `running`; stop when `completed` or `failed`. Show which turn is next.
- `failed` keeps and shows every turn that exists, with the reason.

**Exit:** any stored experiment can be opened and read; a running one updates by itself.

**Build it for reading speed, not for looking impressive.**

### 6. Thought process

- Per message, an expandable view of the model's reasoning, labelled as the model's own account.
- A distinct state when a model gave none.

**Exit:** thoughts display for models that produce them, and absence is shown honestly. Blocked on master plan D3.

### 7. Judge commentary

- Per turn, a panel with the judge's assessment and the name of the judge model.
- A pending state while the judgement is not yet available.
- Prototype side-by-side and expandable layouts before committing (README open question).

**Exit:** every judged turn shows its commentary beside the messages it concerns. Blocked on master plan D4.

### 8. Polish

- Screenshot-quality pass: spacing, contrast, readable type.
- Keyboard navigation through turns; accessible expand and collapse.
- Component documentation in the repo.

### 9. Optional, only once single experiments are solid

- Compare two experiments side by side.
- Re-run a saved configuration.
- Export a transcript.

---

## Standing rules

- Messages, thoughts, and judge commentary are rendered exactly as returned. No summarising, rewriting, or scoring in the UI.
- Every route that shows data depends on a logged-in session; the backend scopes data to the researcher, and the UI never passes a user id.
- Empty, loading, in-progress, failed, and pending states are part of each screen's definition of done.
