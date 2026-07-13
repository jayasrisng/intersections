# Intersections Case Study

## Summary

Intersections is an identity-mapping quiz that turns a user's traits into a shareable quadrant chart. It combines a lightweight psychographic scoring model, diverse archetype selection, optional photo cutouts, and high-resolution canvas export.

The project is built as a fully client-side Next.js app: no accounts, no backend, and no uploaded identity data leaving the browser.

## Problem

People rarely fit into one professional or personal label. Conventional quizzes often collapse identity into a single archetype, which can feel reductive and predictable.

Intersections explores a different interaction:

> What if the output helped someone describe the tension between multiple parts of themselves instead of forcing one label?

## Approach

The app guides users through a short quiz, scores their answers against a multidimensional trait vector, selects four diverse archetypes, and renders the result as a polished visual map.

The main flow is:

1. Answer twelve trait questions.
2. Compute an eight-dimensional user vector.
3. Score archetypes with cosine similarity.
4. Use Maximal Marginal Relevance to avoid near-duplicate matches.
5. Let users upload or generate one sticker per archetype.
6. Render a downloadable quadrant chart on HTML Canvas.

## Technical stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand with localStorage persistence
- `@imgly/background-removal` for in-browser cutouts
- HTML Canvas for high-resolution PNG export

## Design decisions

### Pick diverse matches, not just high scores

A pure top-score ranking can return four archetypes that are too similar. Maximal Marginal Relevance keeps the result more interesting by balancing relevance with difference.

### Keep identity data local

The app does not need accounts or a backend. Quiz state persists locally, and photo cutouts happen in the browser.

### Make the output feel designed

The result is not just text. The final chart uses quadrant placement, stickers, captions, and a center identity statement so the output feels like something worth saving and sharing.

## Challenges

### Avoiding reductive labels

The copy and algorithm need to support nuance. The result should feel like a map, not a diagnosis.

### Canvas export quality

Browser canvas export requires careful handling of layout, typography, image placement, and high-DPI rendering so the saved PNG remains sharp.

### In-browser image processing

Background removal is useful but computationally heavier than typical UI work. Keeping it client-side preserves privacy but requires careful UX around loading and fallback states.

## What this demonstrates

- Product design around identity, self-description, and visual storytelling.
- Algorithmic scoring beyond a simple quiz tally.
- Privacy-conscious frontend architecture.
- High-polish React/Next.js interaction and export workflows.

## Future work

- Add more archetypes and better calibration data.
- Add accessibility review for keyboard navigation and screen readers.
- Add export presets for common social image sizes.
- Add optional manual weighting for users who want more control over the final map.
