# Nous: Frontend Sprint

**Version:** 2.0
**Team lead:** Frontend Director
**Also on this track:** Frontend Engineers
**Read first:** `NOUS-PROJECT-SPEC.md` v5.1 sections 4, 5 and 12. Then `NOUS-MASTER-PLAN.md` for gates and dates.

This document is now the only one this track needs week to week. It says what, when, who, and how. The separate how-to guide has been merged in and retired.

Gates, capacity, blockers and escalation live in the master plan only and are not repeated here.

---

## Already done, do not redo

| Already exists | Note |
|---|---|
| **`nous-frontend` repo, Next.js 15, App Router, TypeScript strict, CI green** | Do not create a repo. |
| **App shell and auth screens** | Unaffected by the direction change. Login still works and is still needed. |
| **Brand tokens in Tailwind** | Deep forest green and gold. Land them fully before components harden against placeholders. |
| **`lib/types.ts` generated from the backend OpenAPI spec** | Never hand-edited. **B3: not yet CI-enforced.** Due Week 4. |

**What died:** the insight feed, the graph explorer, and the graph visualization library decision. B5 is closed because there is no graph.

**What carries over:** the evidence citation component becomes the transcript viewer. Same interaction, same reason it matters. It is where the audience stops taking your word for it.

**Four screens, in build order:** config, transcript viewer, results table, heatmap.

**The rule that shapes everything:** the home screen is the experiment list and the heatmap, **not a chat box**. Nobody types at a model through this UI. You configure a run, launch it, and read what came back.

---

### Week 3: Sep 14 to 20. About 9 hours. Pivot week.

**Theme: sketch two screens, agree the field names.**

* **Stop** any insight feed or graph explorer work.
* **Sketch two screens only.** A Config screen (pick persona, attacker model, defender model, attack strategy, then Run) and a Results screen (table of past runs).
* **Use Figma, or plain boxes on paper or slides.** The goal is agreeing on fields and flow, not visual polish yet.
* **Confirm the field names here match what backend plans to store**, so there is no rework later. This is the cheapest hour of the week and the one that prevents a Week 5 rebuild.
* Continue the app shell, auth screens and brand tokens. Unaffected.

**Exit:** both screens sketched, field names agreed with backend in writing.

---

### Week 4: Sep 21 to 27. About 18 hours. Build week.

**Theme: the config screen, for real.**

* **Build the Config screen.** Dropdowns for persona, attacker model, defender model and strategy, **populated by calling a backend endpoint that lists available options.** Do not hardcode the lists; personas and strategies freeze this week and will still get edited before they do.
* Add runs per cell, max turns, and **a display of the cost estimate the backend returns before launch.** Nobody launches a batch without seeing projected spend. Master plan operating rule 9.
* **On submit, POST the selections to backend and show a run id or a running status.**
* **No results view yet.** Just confirm a run can be triggered from the UI.
* **Turn on CI enforcement of type generation (B3)** before there are real API routes, or `lib/types.ts` drifts from the contract with nothing catching it.

**Exit:** a run can be launched from the UI and returns an id.

---

### Week 5: Sep 28 to Oct 4. About 17 hours. Last high-capacity week.

**Theme: the transcript viewer. This is the most important screen in the product.**

* **Build the transcript viewer.** Fetch one run by id, show the messages as a chat log with Attacker and Defender clearly distinguished, and **highlight the turn where the rule was broken**, if any.
* **Show the judge's verdict and one-sentence reason beside the highlighted turn.**
* **Show the run's metadata:** persona, rule text, strategy, both models, turn count. A transcript without its conditions is unreadable a week later.
* Link to the viewer from a basic list of recent runs.

**Exit:** any stored run can be opened and read, with the break point visible at a glance.

**Build it for reading speed, not for looking impressive.** AI/ML lives in this screen next week while labelling, so the faster it scans, the faster the labelling goes. It is also the single most important shot in the demo video.

---

### Week 6: Oct 5 to 11. About 8 hours. Midterms begin.

* **Build the susceptibility heatmap against synthetic data.** Rows are Defender models, columns are attack strategies, cell background colour scales with break rate. Three models by six strategies.
* **A grid of coloured divs is enough. Do not take a charting dependency for this.**
* **Leave room in each cell for run count and interval, not just colour.** At 3 to 5 runs per cell the uncertainty is large, and a bare colour invites the viewer to read a difference the data does not support.
* Viewer fixes from whatever labelling exposed.

**Exit:** heatmap renders correctly against fake data and has somewhere to put the interval.

---

### Week 7: Oct 12 to 18. About 6 hours. Protected week.

**Freeze work Saturday Oct 17.** Light bug rota only. Nothing new starts.

---

### Week 8: Oct 19 to 25. About 8 hours.

* **Build the results table.** All runs, with columns for persona, attacker, defender, strategy, broken yes or no, and turns-to-break.
* **Add basic filter and sort on those columns.** Sorting by turns-to-break is the one people will use most.

**Exit:** results table live against real pilot data, filterable.

---

### Week 9: Oct 26 to Nov 1. About 8 hours.

* **Wire the heatmap to the real aggregation endpoint** as the batch completes.
* **Show incomplete cells as visibly incomplete.** A cell with two of five runs finished must not render as a confident colour.

**Exit:** heatmap live against real data.

---

### Week 10: Nov 2 to 8. About 12 hours. The demo path.

* **Polish the demo path only:** config, transcript viewer, heatmap. Nothing speculative, nothing off-path.
* **Add a one-page summary view inside the app**, explaining the project to someone seeing it for the first time. Research question, method, what the heatmap means. This doubles as the opening frame of the video.
* **Screenshot-quality pass:** spacing, colour contrast on the heatmap, readable type at projector distance. **Test at projector resolution, not on your laptop.**

**Exit:** demo path visually final.

---

### Week 11: Nov 9 to 15. About 14 hours. Freeze and record.

* **Monday Nov 9: demo path freeze.** This applies hardest to frontend, because a visual change after the recording makes the video disagree with the live product.
* Support recording Nov 11 to 13. Be available for seed data and screen setup.
* Friday Nov 13: final merges close.

---

### Week 12: Nov 16 to 22. About 15 hours. Demo week.

* **Dress rehearsal Wednesday Nov 18. Real venue, real projector, real audio.** Demos fail on projectors and file formats far more often than on code.
* Thursday Nov 19: rehearsal fixes only.
* **Friday Nov 20: demo.**

---

### Week 13: Nov 23 to 29. About 15 hours. Post-demo.

* Bug burn-down from anything the demo exposed.
* **Optional, if capacity allows (D5):** comparison view between two experiment batches, for example before and after a rubric change.
* Component documentation in the repo.

---

### Week 14: Nov 30 to Dec 6. About 8 hours. Reserve.

* Final visual pass.
* Slip absorption.

---

### Week 15: Dec 7 to 13. About 4 hours. Gate 3.

* Gate 3 Dec 7 or 8.
* Repo handover, README completeness, post-mortem.
