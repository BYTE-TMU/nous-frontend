# Nous: Master Plan

**Version:** 7.0
**Owner:** VP of Technology, TMU BYTE
**Supersedes:** `NOUS-SPRINT-PLAN.md` v6.0, which is retired. Its week-by-week content moved into the three team documents.

## The document set

| Document | What it holds | Who reads it |
|---|---|---|
| **This document** | Dates, gates, capacity, cuts, blockers, escalation | Everyone, once, then on reference |
| `NOUS-PROJECT-SPEC.md` v5.1 | What Nous is and why. Invariants, architecture, data model, ethics. | Everyone, properly |
| `NOUS-SPRINT-AIML.md` | AI/ML tasks per week, with exit conditions | AI/ML |
| `NOUS-SPRINT-BACKEND.md` | Backend tasks per week, with exit conditions | Backend |
| `NOUS-SPRINT-FRONTEND.md` | Frontend tasks per week, with exit conditions | Frontend |
| `NOUS-HOWTO.md` | Step-by-step procedure for each task | Whoever is doing the task, that day |
| `NOUS-PIVOT-MEMO.md` | What changed in Week 3 and why | Everyone, once |

**The split between a team document and the how-to.** The team document says *what* and *when* and who owns it. The how-to says *how*. If they disagree on a date, the team document wins. If they disagree on a method, the how-to wins. If either disagrees with the spec on an invariant, the spec wins.

**Anything in this document appears here only.** Gates, freeze dates and escalation are not repeated in the team documents, because a gate that says two different things in two places is worse than no gate.

---

## 1. The dates

**Demo day is Friday, November 20. It is public and already announced.**

| | |
|---|---|
| Term | Week 1 began Aug 31. Week 15 ends Dec 13. |
| This plan takes effect | Mid Week 3, Sep 15 |
| **Last high-capacity week** | **Week 5, ending Oct 4.** All hard engineering lands before it. |
| Gate 1 | Monday, Oct 19. Work freezes Sat Oct 17. |
| Demo path freeze | Monday, Nov 9 |
| Recording | Nov 11 to 13 |
| Gate 2, feature freeze | Sunday, Nov 15 |
| **Demo day** | **Friday, Nov 20** |
| Gate 3 | Dec 7 to 8. Exams start Dec 9. |

---

## 2. Capacity

Nous hours only, 65 percent of team capacity, across 13 engineers.

| Wk | Dates | Total | AI/ML | Backend | Frontend |
|---|---|---|---|---|---|
| 3 | Sep 14 to 20 | 30 | 9 | 12 | 9 |
| 4 | Sep 21 to 27 | 62 | 19 | 25 | 18 |
| 5 | Sep 28 to Oct 4 | 57 | 17 | 23 | 17 |
| 6 | Oct 5 to 11 | 29 | 9 | 12 | 8 |
| 7 | Oct 12 to 18 | 20 | 6 | 8 | 6 |
| 8 | Oct 19 to 25 | 26 | 8 | 10 | 8 |
| 9 | Oct 26 to Nov 1 | 29 | 9 | 12 | 8 |
| 10 | Nov 2 to 8 | 42 | 13 | 17 | 12 |
| 11 | Nov 9 to 15 | 46 | 14 | 18 | 14 |
| 12 | Nov 16 to 22 | 52 | 16 | 21 | 15 |
| 13 | Nov 23 to 29 | 52 | 16 | 21 | 15 |
| 14 | Nov 30 to Dec 6 | 29 | 9 | 12 | 8 |
| 15 | Dec 7 to 13 | 13 | 4 | 5 | 4 |
| | **Total** | **487** | **149** | **196** | **142** |

About **438 usable** after 10 percent overhead. The remaining ask is an average of **2.8 hours per week per person**, peaking at 4.8 in Week 4.

**The shape is the problem.** Weeks 4 and 5 hold 119 of the 487 remaining hours. Weeks 6 through 9 hold 104 across four weeks. Everything technically uncertain finishes before October 5.

### The gap

```
demand, revised                                   543 h
minus usable capacity                            -438 h
--------------------------------------------------------
OVER BY                                           105 h
```

Down from 583 because the judge epic shrank by about 40 hours: a single labeller on 5 to 10 transcripts instead of two labellers on 70.

### The cut list

| # | Cut | Saves |
|---|---|---|
| **D1** | Defender models from 5 to 3. One frontier, two mid tier. Attacker held constant. | 35 h |
| **D2** | Personas from 6 to 4 | 20 h |
| **D4** | Re-run-saved-config deferred to Weeks 13 to 14, optional | 15 h |
| **D5** | Cross-batch comparison view deferred to Weeks 13 to 14, optional | 15 h |
| **D7** | Neo4j and pgvector go dormant by documentation, not deletion | 15 h |
| | **Total** | **100 h** |

Leaves about 5 hours over. D4 and D5 are already marked optional in the how-to, so cutting them from the core is consistent with it.

**The results table is not cut.** It is in the how-to and it is what the team will actually use to read results.

**CONFIRM: sign the cut list this week.** It is only cheap while the work has not started.

---

## 3. The gates

### Gate 1: Monday, October 19. Work freezes Saturday, October 17.

**Is the judge trustworthy, and which demo tier are we making?**

| Measured |
|---|
| Judge agreement with the hand-labelled transcripts at or above 85 percent, reported with break-class recall. **Break-class recall at or above 80 percent is a hard sub-gate**, because agreement alone passes for a judge that always answers "not broken". |
| Pilot cells show a differential exceeding within-cell variance on at least one axis |
| Full matrix ready to launch: adapters stable, batch runner resumable, cost estimate signed off |
| **Provider ToS check complete and recorded (B10). Hard sub-gate.** |

**Output:** a written tier decision, and the full batch launches the same week.

**Interim checkpoint end of Week 6.** Early warning, not a gate. Judge agreement under 70 percent in Week 6 means the problem is the rules or the rubric, not the judge prompt.

### Gate 2: Sunday, November 15. Work closes Friday, November 13.

Feature freeze holds. Security review signed by Backend Director plus one reviewer from outside auth. Full matrix completed and reproducible from its INV-7 record. Export working. Dormancy migration clean.

### Gate 3: Monday December 7 to Tuesday December 8

Spec section 8.2, plus: the demo landed. Winter recommendation: extend the matrix, resume the graph, or publish the harness. Do not pre-commit.

### The three demo tiers

Chosen October 19, in writing, not revisited.

| Tier | Condition | What the video shows |
|---|---|---|
| **A** | Judge agreement ≥85%, break-class recall ≥80%, matrix launching on schedule | Full result. Setup, one transcript, complete heatmap, stated finding with intervals. |
| **B** | Agreement 75 to 85%, or matrix narrows to two models or two strategy families | Same three beats, narrower matrix, limitation stated on screen. |
| **C** | Agreement below 75%, or no differential in the pilot cells | Demo the instrument. Harness, blind judging, verdict verification, disagreement analysis. A negative result, framed as one. |

Tier C is real and respectable. It only fails if you dress it up as something else.

---

## 4. Operating rules

1. **Mono-tasking by week.** No engineer splits a week across two products.
2. **Nous receives 65 percent of weekly hours.** Fixed.
3. **Auth is exempt from rotation.** Backend Director stays on N-107 through Week 4.
4. **No self-merge** on `app/auth/`, `app/api/deps.py`, `contracts/`, or the conversation driver. Second engineer's approving comment required. The Backend Director reports the weekly audit number even when it is zero.
5. **One named owner per ticket.** These documents assign work by role. The ticket itself names a person, because a role cannot be chased on a Thursday.
6. **Demo path freezes Nov 9. Feature freeze Nov 15.** Two dates, two purposes, both absolute.
7. **Definition of done:** merged, CI green, tested, documented in the repo, deployed to preview. For verdicts, add: cited turn index verified present and resolving.
8. **Personas and strategies freeze end of Week 4.** Changing either invalidates every transcript generated before it.
9. **No batch launches without a stored cost estimate.** Above $75, the lead signs off.

---

## 5. Blockers

| # | Item | Owner | Due |
|---|---|---|---|
| **B11** | **Rule selection and difficulty piloting** | AI Director, CTO | **Week 3** |
| **B0** | **Name the video owner**, clear their Weeks 10 to 12. Open since Week 1. | VP of Tech | **Week 3** |
| **B10** | **Provider ToS read and recorded, per provider** | VP of Tech | **Week 4, before any batch** |
| B13 | Model roster confirmed with budget attached | VP of Tech, AI Director | Week 4 |
| B12 | Attack strategy taxonomy frozen | AI Director, AI Engineer | Week 4 |
| B14 | Dormancy migration | Backend Engineer | Week 4 |
| B15 | Spend cap live at $400, alert at $250 | Backend | Week 4 |
| B4 | `NOUS_BACKEND_TOKEN` expiry recorded | Backend Director | Week 3 |
| B7 | Two-user isolation test | Backend Director | Week 4 |
| B3 | CI-enforce frontend type generation | Frontend Director | Week 4 |

**Closed by the direction change:** B1, B5, B6, B8, B9.

---

## 6. Risks

| # | Risk | Mitigation |
|---|---|---|
| **R9** | **No differential. Everything breaks, or nothing does.** Project-killing. | Rule difficulty piloting, Week 3. Keep only rules landing between roughly 10 and 90 percent. |
| **R14** | **At 3 to 5 runs per cell, within-cell variance may swamp the differential.** | Report confidence intervals, not point estimates. The finding is an axis of variation, not a cell-by-cell ranking. If a cell needs more resolution, add runs to that cell rather than all 72. |
| **R15** | **Single-labeller ground truth has no inter-annotator check**, so rubric ambiguity is invisible until the judge disagrees. | CTO spot-checks 5 transcripts against the labeller's calls. One hour, and it is the only visibility available. |
| R10 | Judge agreement never reaches 85 percent | Crisper rules make crisper breaks. Tighten the rules, not the judge. |
| R11 | Provider rate limits stretch the batch over days | Batch runner resumable from Week 5. Launch Monday Oct 19, not Thursday. |
| R12 | Cost overrun on the first full batch | Estimator before launch, sign-off above $75, cheap models carry the matrix. |
| R5 | The AI Director and AI Engineers carry the moat | Cross-train the Backend Director and one Frontend Engineer, Week 4. Rubric written as a repo document from day one. |

---

## 7. Escalation

| Trigger | Action | Owner |
|---|---|---|
| A weekly exit condition is missed | Raised at Monday standup, re-plan within 48 hours | VP of Tech |
| **No piloted rules land in the 10 to 90 percent band by end of Week 3** | Stop. Redesign rules before anything is built on them. | AI Director, CTO |
| **Pilot batch in Week 5 shows no differential** | R9 is live. Widen strategies or models before Week 6. | VP of Tech, AI Director |
| Judge agreement below 70 percent on the dev transcripts in Week 6 | The problem is upstream. Fix rules or rubric, not the judge prompt. | AI Director |
| **Raw agreement reported without break-class recall** | Reject the number | CTO |
| **A batch launch proposed without a stored cost estimate** | Refuse | Backend Engineer |
| LLM spend passes $250 CAD | Freeze batch runs, pilot scale only | VP of Tech |
| **Full matrix not launched by end of Week 8** | Cut cells, not runs per cell. Runs are already at the floor. | VP of Tech |
| Logged hours under 80 percent of plan by end of Week 6 | Re-cut scope | VP of Tech |
| Unreviewed merge on a protected path | Logged in the weekly audit, reported regardless of count | Backend Director |
| **Anything proposed for merge after November 9** | Refuse unless demo-blocking | VP of Tech |
| Provider ToS found to forbid the design | Stop that provider's cells, record it in the limitations | VP of Tech |
| AI Director or AI Engineer unavailable two weeks or more | Cross-trained backup activates, demo tier drops one level | Backend Director |
| A gate is missed | The failure action executes as written | VP of Tech, CTO |
