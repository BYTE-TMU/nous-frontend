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
| `content.ts` | rubric levels, the scripted demo, and principles |
| `LandingNav.tsx` | sticky nav; shows "Open dashboard" when a token exists |
| `NeuralOpening.tsx` | black opening with an animated, replayable Greek word reveal |
| `Hero.tsx` | centered headline and CTAs |
| `DuelDemo.tsx` | section 01: scripted run played through the real `components/transcript/` components |
| `BreakMeter.tsx` | the keyboard-accessible 0–2 rubric |
| `HowItWorks.tsx`, `Principles.tsx` | responsive workflow diagram and research principles |
| `ClosingCta.tsx`, `LandingFooter.tsx` | closing request-access panel and footer |
| `SectionHeading.tsx`, `Reveal.tsx`, `hooks.ts` | shared heading, scroll-reveal wrapper, `useInView` / `usePrefersReducedMotion` |

## Rules

- Keep rubric content in sync with `nous-ai/eval/judgement_rubric.md`.
- Motion lives in the "Landing page" block at the bottom of `app/globals.css`, gated on `prefers-reduced-motion: no-preference`. Reduced-motion viewers get the finished, static page.
- The demo must stay labelled as illustrative. Never present scripted text as model output.
