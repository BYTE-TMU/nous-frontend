# nous-frontend

The Next.js 15 application for Nous. All UI, all client state, all rendering. One upstream: `nous-backend`.

**Owner:** Johan Philip (Director of Frontend Engineering)

## What Nous is

Nous builds a longitudinal semantic graph of how one person thinks, from their own words — initially a ChatGPT export — and surfaces reasoning patterns they could not see themselves, each one cited back to dated evidence in their own text.

It is not a note-taker, a journal, or a chatbot with memory. Every other tool returns what you put in. Nous returns what you did not notice.

**The one-liner:** *Your mind, mapped.*

## The single most important UI decision

**The home screen is the graph and the insight feed — not a text box.**

Users open Nous to see what it found, not to write something. Every layout decision follows from this. If a screen's primary affordance is an input field, it is probably wrong.

**`InsightCard` is the product.** It is the one component that has to be perfect. An insight without visible, clickable, dated evidence in the user's own words is not shippable.

## This repo owns

- Every route, page, and component
- Auth client flow and token handling
- Upload UX for ChatGPT exports, including the long-running job wait
- The insight feed, the fingerprint/graph visualisation, entry browsing
- Empty, loading, and error states — these matter more than usual here

**Does not own:** business logic, scoring, or ranking (→ `nous-backend`); anything touching a model or a prompt (→ `nous-ai`); hand-written shared types (generated from `nous-backend/contracts/openapi.yaml`).

## Local setup

```bash
cp .env.example .env.local
npm install
npm run generate:types         # requires nous-backend checked out as a sibling
npm run dev                    # :3000
```

`nous-backend` must be running on `:8000`. It does not need `nous-ai` unless you are exercising upload or insight generation.

## States that matter more than usual here

Nous has a genuinely hard UX problem: **value compounds over weeks, and the first-run experience has nothing to show.** These are the retention story, not afterthoughts.

1. **Cold start.** A brand-new user with no export uploaded has an empty graph. Never ship a blank feed with a spinner.
2. **Processing.** Export ingestion is a long Celery job, potentially many minutes. Poll the job endpoint and show honest progress.
3. **Not enough data yet.** Uploaded and processed, but too thin for a confident insight. Say so plainly — never manufacture a weak insight to fill space.
4. **Low-confidence insight.** Confidence is on the model. Surface it. Credibility comes from not overclaiming.

## Conventions

**Branches:** `n-<ticket>/<short-slug>` — e.g. `n-301/insight-card`
**Commits:** `N-301: add evidence expansion to InsightCard`
**PRs:** one ticket per PR. Include a screenshot or a Vercel preview link for any visual change. 1 approval.
**Style:** ESLint + Prettier, TypeScript strict. No `any`. No `@ts-ignore` without a comment naming the ticket that will remove it.

Before opening a PR: `npm run lint && npm run typecheck && npm test`

## Where this repo sits in the plan

16 weeks, Sep–Dec. Feature-complete Week 12 (Nov 15), launch Weeks 13–14.

| Gate | When | Bar |
|---|---|---|
| Gate 0 | End of Week 1 | Spike produces uncanny, evidence-cited insights. **Frontend is not on the critical path this week** — the spike is throwaway code with no UI. |
| Gate 1 | End of Week 8 | One external user receives a genuinely surprising insight, documented with a direct quote. **This is a frontend gate as much as an AI one** — the insight has to land through the UI. |
| Gate 2 | End of Week 12 | Feature complete. |
| Gate 3 | Week 16 | Launch target. |

More than half of Nous's hours land in Weeks 1–6. The back half is thin. Anything hard or foundational in the UI — the graph visualisation especially — needs to be built before October ends, not deferred to the launch window.

Note the mono-tasking rule: engineers work one product per week, Nous or Yapp, never both in the same week. Plan PRs around that.

## Settled decisions

- **Auth:** self-issued JWT from `nous-backend`, not Firebase. `lib/auth.ts` handles storage and attachment.
- **Types:** generated from `nous-backend/contracts/openapi.yaml` via `npm run generate:types`. There is no separate `nous-contracts` repo.

## Open questions

- **Graph visualisation library.** Johan to evaluate and record the decision here before Week 3. `components/graph/GraphView.tsx` is a placeholder until then.
