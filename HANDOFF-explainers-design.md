# Handoff: make the explainer figures actually good

## What you're inheriting

`rabbitholes.garden` — a personal "commonplace book" (Astro 5 + Cloudflare Workers,
388 link-blog posts). A new section has been built at `/explainers`: long-form,
visual-first explainers. The first piece is complete and live locally:

**`/explainers/stardust`** — *"Is it true that all the elements in the human body
come from stars?"* Nine chapters, nine bespoke SVG figures, 12 cited sources,
~25 min read. The thesis: mostly yes by mass, but ~61% of your *atoms* are
hydrogen and no star has ever made a hydrogen nucleus — so by count you are older
than stars. And all of it rests on a matter/antimatter asymmetry nobody can explain.

> **⚠ READ THIS FIRST — this document was overtaken by events.**
>
> It was written at ~12:40 on 2026-07-29 describing figures that no longer
> exist. **A parallel session rebuilt all nine figures between ~12:53 and
> ~13:23** and the result is substantially better than what is criticised
> below. Verified after the rebuild: build clean, 37/37 tests, typecheck clean,
> page 266KB → 339KB.
>
> The breakthrough that session found, and which the criticism below was
> groping toward: **stop fitting figures into columns; give them the full
> spread and set the prose into the figure's own negative space.** The chart of
> nuclides now does this — 3,383 real NUBASE2020 nuclides as territory, 288
> natural ones solid, the neutron-rich edge computed from the data, and three
> blocks of explanatory prose laid into the empty corners of the plane.
>
> So: **look at the current state before believing anything in the table
> below.** Treat the Constraints and Tooling sections as still valid; treat the
> per-figure assessments as historical.

**The engineering is done and works. The visual design WAS the problem.**

Run it: `npm run dev` → `/explainers/stardust`. Build: `npm run build`.
Tests: `npm test` (37 pass). Typecheck: `npm run check`.

---

## Your job

**Make these figures worth looking at.** The prose is good, the data is real and
verified, the infrastructure is solid. The figures are correct and lifeless.

The previous session iterated four times on the deep-time figure and the author's
verdict each round was "looks like shit", then "still weak", then "too tiny."
That's a signal the approach was wrong, not that the polish was insufficient.

### The diagnosis, as far as it got

1. **Figures are designed to fit columns instead of the page being designed
   around the figures.** Everything is squeezed into a `--measure` (33em) or a
   sticky sub-column and comes out small, thin, and apologetic. The last
   rebuild — a vertical ledger — is genuinely better *information design* and
   still renders at ~530px wide inside a scrolly column, so it reads as a tiny
   grey table. A visual explainer's figures should command the page.

2. **No density, no craft, no presence.** They look like competent D3 output
   dropped into a nice editorial layout. There is no weight, no hierarchy of
   scale between figures, nothing that makes you stop.

3. **The scrollytelling layout may be the wrong container entirely.** Two layouts
   exist (`side`, `top`) and neither gives a wide figure enough room while
   keeping the step prose readable. Consider whether these figures want to be
   full-bleed static spreads with prose *around* them, rather than pinned
   alongside a narrow column of steps.

You are explicitly authorised to **throw away the figure designs and the scrolly
layout and start over**. What you may not throw away is listed under Constraints.

---

## Constraints that must survive

These were expensive to establish. Do not quietly drop them.

### Accuracy and provenance — non-negotiable
- Every figure's numbers are **real measured data** in
  `src/explainers/stardust/data/*.json`. Binding energies are AME2020 (verified:
  Ni-62 8.7945 > Fe-58 8.7922 > Fe-56 8.7903). Body composition is Freitas 1999;
  **atom counts are derived from mass ÷ atomic weight in the component**, not
  stored, so the arithmetic is checkable. Primordial helium Yp = 0.247, baryon
  ratio η = 6.1×10⁻¹⁰ (both verified against sources).
- `src/utils/provenance.ts` **fails the build** if a dataset lacks
  `source.title/url/retrieved`, or if a `<Cite id>` points at nothing, or if a
  `<Term k>` has no gloss. Test them — they bite. Do not weaken them.
- **Never generate figure imagery with an image model.** These are data figures;
  a generated image is numerically fiction. This was considered and rejected.

### The motion doctrine
> **Scroll is a parameter, not a trigger.**

No `IntersectionObserver`-fires-once fade-and-rise anywhere. Figure state is
recomputed from scroll position every frame in `src/explainers/kit/scrolly.js` —
no accumulators, no eased carry-over, no `hasPlayed` flags. `scripts/test-figures.mjs`
asserts this: scrub to 40%, back to 20%, byte-identical path data. Keep it passing.

### The epistemic register — the piece's best idea
The site already encodes *whose voice* in ink (black = the world, red = the
author, brown = the machine). Explainers add *how sure we are*, as **treatment,
not hue**: solid = settled, dashed/hatched = contested, red-and-unfilled = open.
Never colour alone. `<Uncertainty status="open" id="...">` marks are collected to
generate the final chapter, so they cannot contradict the prose.

### The design system
`src/styles/tokens.css` is the source of truth — major-third type scale, three
tracking values, no raw `rem` font sizes. Fonts are **self-hosted** in
`public/fonts/` (Bodoni Moda display, Newsreader body, Spline Sans Mono labels).
Light and dark are both first-class; hairlines that read on paper vanish on
`#181713`. Don't introduce new hues — the palette (`--c-musings`, `--c-links`,
`--c-reflections`, `--c-verse`, `--c-practical`, `--red`) is fixed.

### Rejected, permanently — the brief is "no clichés, no bullshit"
Constellation-map watermarks, celestial coordinate grids, faux-letterpress
grain/stipple filters, botanical ornaments or daggers instead of data points,
"glowing particles in space", fade-up-on-scroll. All of these have been proposed
and refused. Every mark must do informational work.

### Performance budget
Zero blog pages may load explainer CSS or JS. Currently holds exactly
(`_slug_.*.css` on 0 non-explainer pages). Explainer JS ~18KB. Verify after changes.

---

## The figures, and how bad each is

In `src/explainers/stardust/figures/`. Specs in `../SPECS.md`.

| Figure | Chapter | State |
|---|---|---|
| `DeepTime.astro` | 1 | **Rebuilt twice, still failing.** Was a 60-decade log axis (60% empty). Now a vertical ledger — better information design, renders far too small. Start here. |
| `BodyCensus.astro` | 0 + 8 | **Best of the set.** Two columns (by mass / by atom count) with ribbons showing the inversion; hydrogen's ribbon painted last so its swoop is unobstructed. Still could be bigger and denser. Reused annotated in ch8 as the "returning figure". |
| `GamowPeak.astro` | 3 | Correct physics (peak at 6.1 keV vs textbook 5.9), scroll-scrubbed temperature. Visually plain. |
| `BindingEnergy.astro` | 4 | Real AME2020 curve. Callouts collide-prone, plain. |
| `OriginTable.astro` | 6 | Periodic table by origin + confidence. Was garish, now tinted and legible. Should be the visual centrepiece — it's the epistemic legend for the whole document. |
| `Asymmetry.astro` | 2 | The unexplained gap drawn as a literal unfilled red void at true scale. Conceptually the strongest; visually underdone. |
| `NeutronCapture.astro` | 5 | **Rebuilt from real NUBASE2020 data** (`scripts/fetch-nuclides.mjs` → `data/nuclides.json`). Now the strongest figure in the set. |
| `HowWeKnow.astro` | 7 | HTML not SVG — four inference chains. Check current state. |

---

## Known-good, keep it

- **Wikipedia glosses** — `scripts/fetch-wikipedia.mjs` fetches 34 term summaries
  at build time into `src/explainers/data/wikipedia.json`; `<Term k="r-process">`
  renders a hover/focus card with the extract, article link, CC BY-SA and read
  date. Build-time so the site stays static and the CSP is untouched. The licence
  notice on the page is a condition of reuse, not decoration.
- **Numbered citation chips** ordered by first appearance
  (`kit/citeRegistry.ts` + `Cite.astro`), with a neutral fallback if numbering
  is unavailable — degrades to unnumbered, never to a wrong number.
- **`kit/scale.js`** — zero-dependency linear/log scales, `niceTicks`,
  `logTicks` (thins across 54 decades), path builders. 26 unit tests.
- **`Nuclide.astro`** — ⁵⁶Fe set properly (absolutely positioned so it can't
  grow the line box).
- **The depth rail** — chapter ticks indent as the material deepens, so the nav
  draws the descent. Chapter depths: 0,1,2,2,3,3,2,1,0.

---

## Tooling available

- **Headless Chrome** (`google-chrome-stable --headless --screenshot`) — use it
  constantly. Dark mode: inject `data-theme="dark"` into a copy of the built HTML.
- **`agy` CLI with Gemini 3.1 Pro** — genuinely useful as a *critic on rendered
  screenshots*, not a generator:
  `agy --model "Gemini 3.1 Pro (High)" --mode plan -p "..."`.
  It diagnosed the census's real problem (four translucent ribbons mixing to grey
  mud exactly where the argument is) which unblocked that figure. Roughly a third
  of its notes land; it also proposes the exact clichés listed above, so filter hard.
- `gemini` CLI also present (weaker for this).

---

## Repo hazards

- **Other sessions commit to this repo while you work.** Seven commits landed
  mid-session last time. `git log` before trusting any before/after measurement;
  a start-of-session `dist/` snapshot is not a valid baseline by the end.
- `git worktree` + symlinked `node_modules` **does not work** for an isolated
  Astro build (resolver breaks on the symlinked path).
- Dev server ports 4321–4323 are often taken; it lands on 4324+.
- Nothing is committed. Working tree has ~11 modified + ~10 new paths (see
  `git status`). Branch before committing — currently on `master`.
- TS generic casts like `as Array<X['y']>` **inside Astro template markup** fail
  the build with an error pointing at the wrong line. Keep casts in frontmatter.

---

## What "done" looks like

A reader scrolling this page should stop at least three times because a figure
is genuinely arresting — and each time, the thing that arrested them should be
information, not decoration. The figures should feel like they were made for
this document and could not be lifted into another one.

Verify: `npm run build`, `npm test` (37), `npm run check`, both themes rendered,
375px mobile, JS-disabled fallback, and the budget invariant (zero explainer CSS
on blog pages).


---

## Addendum — state as of ~13:25, 2026-07-29

All nine figures rebuilt by a parallel session. New since this doc was written:

- `scripts/fetch-nuclides.mjs` + `src/explainers/stardust/data/nuclides.json`
  — 3,383 nuclides from the evaluated table, with sanity checks.
- `gamow.js` widened to a 1340-unit viewBox with a **magnitude panel** down the
  right third: the "peak is a millionth of either curve" fact is now drawn on a
  log scale rather than asserted in small print.
- `explainer.css` — rail labels got a paper backing, because a fixed rail over a
  full-bleed figure is no longer floating on blank paper.

**The pattern worth generalising from the nuclide chart:**
1. Full-bleed, large, dense — the figure is the spread, not an inset.
2. Prose set into the figure's negative space, in the figure's own voice.
3. Everything drawn from the real evaluated dataset, so the *shape* of the data
   (ragged rows from nucleon pairing, the table simply ending) becomes the
   argument rather than something annotated on top of a schematic.
4. Red reserved for the author's marks on that landscape.

Apply the same to whichever figures still read as insets.
