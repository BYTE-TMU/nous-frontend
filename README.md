# nous-frontend

The Next.js 15 application for Nous. All UI, all client state, all rendering. One upstream: `nous-backend`.

**Owner:** Johan Philip (Director of Frontend Engineering)

## What Nous is

Nous is a testbed for AI researchers. An approved researcher logs in and starts an **experiment**: pick an attacker model and a defender model, then give each a prompt, either from a preset or written by hand. Once the experiment is provisioned, the two models converse as their personas and the researcher reads the conversation as it unfolds.

A **turn** is one message from each model. The transcript is organised by turn, and each turn shows three things:

- **What was said**: the attacker's message and the defender's reply.
- **How each model thought**: the reasoning behind each message.
- **What the judge made of it**: an independent judge model's assessment of the turn.

Full product definition: [`NOUS-PROJECT-SPEC.md`](NOUS-PROJECT-SPEC.md).

## The single most important UI decision

**The researcher watches and reads; they do not chat.** Nobody types at a model through this UI. You configure an experiment, launch it, and read what came back.

**The turn-based transcript view is the product.** It is the one screen that has to be excellent. Everything else (login, the experiment list, the configuration form) exists to get a researcher into it.

## This repo owns

- Every route, page, and component
- Auth client flow and token handling
- The experiment configuration form: model selection, presets, custom prompts
- The experiment list
- The transcript view: turns, thought process, judge commentary
- Empty, loading, in-progress, and error states

**Does not own:** business logic, running experiments, or judging (→ `nous-backend` and `nous-ai`); anything touching a model or a prompt (→ `nous-ai`); hand-written shared types (generated from `nous-backend/contracts/openapi.yaml`).

## Local setup

```bash
cp .env.example .env.local
npm install
npm run generate:types         # requires nous-backend checked out as a sibling
npm run dev                    # :3000
```

`nous-backend` must be running on `:8000`. To see an experiment actually run, the backend's Celery worker and `nous-ai` must be running too.

## Current state

The repo still contains the screens and components of the previous product (`upload/`, `fingerprint/`, `entries/`, `account/`, `components/insight/`, `components/graph/`, `components/upload/`). They are legacy and get deleted as their replacements land. Do not build on them. See [`NOUS-SPRINT-FRONTEND.md`](NOUS-SPRINT-FRONTEND.md) for the build order.

## States that matter more than usual here

An experiment is a long-running, multi-step job, and the transcript view is where a researcher spends their time. These states are part of the design, not afterthoughts.

1. **Provisioning.** The experiment exists but has not produced a turn yet. Say so.
2. **In progress.** Turns arrive over time. The view updates as they land, shows which turn is next, and never looks finished when it is not.
3. **Failed or partial.** A provider error can stop an experiment mid-way. Keep the turns that exist, show where and why it stopped.
4. **Judge pending.** A turn can exist before its judge assessment does. Show the gap rather than hiding the turn.
5. **No thoughts available.** Some models expose less reasoning than others. Say what is missing; never invent it.
6. **Not on the list.** A login that is valid but not approved gets a clear message, not a generic error.

## Conventions

**Branches:** `n-<ticket>/<short-slug>` — e.g. `n-301/transcript-turn-card`
**Commits:** `N-301: add judge panel to turn card`
**PRs:** one ticket per PR. Include a screenshot or a Vercel preview link for any visual change. 1 approval.
**Style:** ESLint + Prettier, TypeScript strict. No `any`. No `@ts-ignore` without a comment naming the ticket that will remove it.

Before opening a PR: `npm run lint && npm run typecheck && npm test`

## Settled decisions

- **Auth:** self-issued JWT from `nous-backend`, not Firebase. `lib/auth.ts` handles storage and attachment.
- **Types:** generated from `nous-backend/contracts/openapi.yaml` via `npm run generate:types`. There is no separate contracts repo.
- **Model output is rendered as received.** Messages, thoughts, and judge commentary are shown exactly as the backend returns them. The UI does not summarise, rewrite, or score them.

## Open questions

- **Live updates.** Polling versus server-sent events for in-progress experiments. Start with polling.
- **Layout of a turn.** Whether thoughts and judge commentary sit beside the messages or expand beneath them. Prototype both before committing.
