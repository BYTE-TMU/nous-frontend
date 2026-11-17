# components/landing/

## Purpose

The public landing page at `/`. It explains Nous to researchers and asks them to request access. Signed-in work lives at `/dashboard`.

## What belongs here

Sections of the landing page, their static copy (`content.ts`), and small motion helpers used only by this page.

## What does not

- Fetching or anything that calls `lib/api.ts`. The page is static apart from reading whether a session token exists.
- Real experiment data. The demo run is scripted and labelled "Illustrative run".
- New colours or fonts. Everything uses the tokens in `app/globals.css` and Geist / Geist Mono.

## Key files

| File | Purpose |
|---|---|
| `LandingPage.tsx` | composes the page in story order; rendered by `app/page.tsx` |
| `content.ts` | all copy and data: rubric levels (verbatim from `nous-ai/eval/judgement_rubric.md`), persona rules (from `nous-ai/app/prompts/README.md`), the scripted demo, principles |
| `LandingNav.tsx` | sticky nav; shows "Open dashboard" when a token exists |
| `Hero.tsx`, `FaceOff.tsx` | headline, CTAs, rubric ticker; the animated brandmark (attacker vs defender, judge orbit) |
| `DuelDemo.tsx` | section 01: scripted run played through the real `components/transcript/` components |
| `BreakMeter.tsx` | section 02: the 0–5 rubric as a keyboard-accessible staircase |
| `HowItWorks.tsx`, `Personas.tsx`, `Principles.tsx` | sections 03–05 |
| `ClosingCta.tsx`, `LandingFooter.tsx` | closing request-access panel and footer |
| `SectionHeading.tsx`, `Reveal.tsx`, `hooks.ts` | shared heading, scroll-reveal wrapper, `useInView` / `usePrefersReducedMotion` |

## Rules

- Keep `content.ts` in sync with the rubric and persona files in `nous-ai` when they change.
- Motion lives in the "Landing page" block at the bottom of `app/globals.css`, gated on `prefers-reduced-motion: no-preference`. Reduced-motion viewers get the finished, static page.
- The demo must stay labelled as illustrative. Never present scripted text as model output.
