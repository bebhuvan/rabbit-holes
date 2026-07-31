# Stardust — figure specs

Written before any figure code, per the craft standard. No spec, no build.

Each spec answers: what question does this figure answer, what does a reader
remember a week later, where do the numbers come from, which parts are settled
/ contested / open, what renders with JavaScript off, and what the alt text is.

**Reviewed as a set**, so the breakout widths form a deliberate rhythm rather
than lurching. Reading down the piece:

```
ch0  wide      ch1  FULL      ch2  wide      ch3  wide
ch4  wide      ch5  FULL      ch6  FULL      ch7  measure    ch8  wide
```

Three full-bleeds, spaced. Chapter 7 deliberately returns to the measure — after
two full-bleed spreads the reader needs the column back, and its subject (how we
know) is argumentative rather than spatial.

---

## FIG 0 — The body census
`figures/BodyCensus.astro` · **wide** · ch0 *The claim, tested*

**Question.** What is actually in you, and where did each part come from?

**Takeaway.** Sorted by mass you are mostly oxygen; sorted by atom count you are
mostly hydrogen — and hydrogen is the one thing stars have never made.

**Form.** Two vertical columns, the same body sorted two ways: **by mass** on
the left, **by atom count** on the right. Ribbons connect each element between
its two positions. The ribbons cross, violently, and that crossing *is* the
insight — hydrogen's ribbon swoops from a thin band on the left to the dominant
block on the right.

Explicitly not a pie chart, and not two bar charts side by side. The argument is
about *re-ordering*, so the figure must show the re-ordering happening rather
than leaving the reader to compare two lists.

Fill encodes **origin**, not element: Big Bang, stellar fusion, massive-star
death, dying low-mass stars. Elements are labelled directly on their bands.

**Data.** `data/body-composition.json` ← Freitas, *Nanomedicine* Vol I Table 3-1.
Origins from Johnson 2019.

**Epistemic.** Composition `settled`. Origin attribution mostly `settled`;
nitrogen's split between CNO-cycle return and other channels is `contested` and
is drawn hatched.

**Static.** Fully static SVG. Both columns and all ribbons render at build time.
Interaction (highlight one element across both columns) is an enhancement only.

**Alt.** "Two columns comparing the human body by mass and by atom count.
By mass: oxygen 65%, carbon 18.5%, hydrogen 9.5%, nitrogen 3.2%. By atom count
the order inverts: hydrogen 62%, oxygen 24%, carbon 12%, nitrogen 1.1%. Bands
are coloured by origin, showing that the hydrogen which dominates by count was
made in the Big Bang, while almost everything else was made in stars."

**Returns as FIG 8.** Same component, `annotated` prop on.

---

## FIG 1 — Deep time
`figures/DeepTime.astro` · **full-bleed** · ch1 *The first three minutes*

**Question.** When was each kind of matter actually made?

**Takeaway.** Everything that makes hydrogen was finished within three minutes.
Everything else waited hundreds of millions of years for the first stars.

**Form.** A full-bleed logarithmic time axis from the Planck time to now —
fifty-odd decades — scrubbed by scroll. A playhead travels the axis; beneath it
an abundance panel resolves as the epochs pass: quarks → protons and neutrons →
the neutron/proton ratio freezing → deuterium surviving → helium locking up.

This is the figure that justifies the log-scale work in `kit/scale.js`, and the
first of the two that prove the motion doctrine: the playhead is *bound* to
scroll position, so scrubbing back returns the panel exactly.

Direct-labelled moments only, no generic tick grid competing with them: Planck
time, inflation, quark confinement (10⁻⁶ s), neutrino decoupling (1 s), the
deuterium bottleneck (~3 min), recombination (380,000 yr), first stars
(~200 Myr), now.

**Data.** `data/bbn-timeline.json` ← Cyburt et al. 2016.

**Epistemic.** Nucleosynthesis onward `settled` — primordial abundances are
measured and agree with theory. Inflation `contested`. Anything before the
Planck time is not drawn at all, because there is nothing honest to draw.

**Static.** Renders at its final state: full axis, all moments labelled,
abundance panel complete. The scrub adds sequence, not information.

**Alt.** "A logarithmic timeline from the Planck time to the present, spanning
about fifty-four powers of ten. Marked moments: quark confinement at a
millionth of a second, neutrino decoupling at one second, Big Bang
nucleosynthesis between roughly ten seconds and twenty minutes producing helium
and traces of deuterium and lithium, recombination at 380,000 years, and the
first stars at around 200 million years. Almost all hydrogen and helium in the
universe was fixed in the first few minutes."

---

## FIG 2 — The asymmetry we cannot explain
`figures/Asymmetry.astro` · **wide** · ch2 *Why there is anything at all*

**Question.** Why is there matter rather than nothing?

**Takeaway.** One particle in about a billion survived annihilation, and the
Standard Model's known CP violation falls short of explaining that by ten orders
of magnitude. This is not a gap in the exposition; it is a gap in physics.

**Form.** Deliberately *not* glowing particles annihilating in space — that is
the exact cliché this document exists to avoid, and it also hides the number.

Instead: a quantitative comparison. A measured bar for the baryon asymmetry we
observe (η ≈ 6×10⁻¹⁰), set against what the Standard Model's CP violation can
produce. The shortfall is drawn as an **unfilled red void** — the epistemic
register's `open` treatment, used literally. The void is the largest single
element in the figure, at true scale, because that is honest.

Beside it, Sakharov's three conditions as three boxes: baryon number violation
(mechanism exists — sphalerons), C and CP violation (observed, but far too
little), departure from equilibrium (available). Two solid, one hatched-into-
void.

**Data.** `data/baryon-asymmetry.json` ← Planck 2018 for η; Standard Model CP
estimate cited in text.

**Epistemic.** η `settled` (measured precisely). Sphaleron mechanism
`contested`. The explanation itself `open` — id `baryogenesis`, which is what
generates the chapter 8 entry.

**Static.** Entirely static. Nothing here needs motion; the void does the work.

**Alt.** "A comparison of the observed matter–antimatter asymmetry, about six
parts in ten billion, against the much smaller asymmetry the Standard Model's
known CP violation can account for. The shortfall spans roughly ten orders of
magnitude and is drawn as an open void, marking it as unexplained. Alongside,
Sakharov's three necessary conditions: baryon number violation and departure
from thermal equilibrium are available, sufficient CP violation is not."

---

## FIG 3 — Why the Sun should not burn
`figures/GamowPeak.astro` · **wide** · ch3 *How a star burns*

**Question.** The Sun's core is nowhere near hot enough for protons to overcome
their mutual repulsion. So why is it burning?

**Takeaway.** Fusion happens in a narrow window where the *falling* tail of the
thermal energy distribution overlaps the *rising* probability of tunnelling
through the Coulomb barrier. Neither alone is enough. The overlap is tiny, and
it is why the Sun burns slowly enough to have a biosphere under it.

**Form.** The Gamow peak, drawn properly and to scale. Three real curves on one
energy axis:
- Maxwell–Boltzmann tail, falling as e^(−E/kT)
- tunnelling probability, rising as e^(−b/√E)
- their product — the peak — which is so much smaller than both that it must be
  drawn magnified, with the magnification factor stated on the drawing rather
  than hidden

Scroll drives core temperature. As T rises the peak moves right and grows
sharply — the reader *feels* the extreme temperature sensitivity of fusion,
which is the real lesson and is almost impossible to convey in prose.

The second doctrine-proving figure: temperature is bound to scroll position, so
it scrubs both ways.

**Data.** Computed from the analytic forms at build time; solar core T = 15.7
MK from Bahcall's standard solar model.

**Epistemic.** `settled` throughout. This is textbook physics that has been
confirmed by solar neutrino measurement.

**Static.** Renders at solar core temperature with all three curves and the
peak labelled. The scrub varies T; it does not add curves.

**Alt.** "Three curves against particle energy. The Maxwell–Boltzmann
distribution falls steeply with energy; the quantum tunnelling probability rises
steeply with energy; their product forms a narrow peak — the Gamow peak — at an
energy far below the Coulomb barrier. Fusion in the Sun happens almost entirely
within this narrow window, which is why the reaction rate is extraordinarily
sensitive to temperature."

---

## FIG 4 — Where fusion stops paying
`figures/BindingEnergy.astro` · **wide** · ch4 *The forge*

**Question.** Why do stars build elements up to iron and then stop?

**Takeaway.** Binding energy per nucleon rises to a peak around iron and nickel
and falls after. Below the peak, fusion releases energy; above it, fusion costs
energy. A star that reaches iron has run out of fuel while still being a star,
and that is why it collapses.

**Form.** The binding-energy-per-nucleon curve from **real AME2020 mass-table
values**, not a drawn approximation. That distinction is the craft rule in this
document and this is the figure where it bites: the curve's fine structure —
the local peaks at ⁴He, ¹²C, ¹⁶O — is real and is worth seeing.

Directly annotated: ¹H at zero, the enormous jump to ⁴He, ¹²C, ¹⁶O, the ⁵⁶Fe
region, ²³⁸U falling away. Fusion-pays and fission-pays regions marked as
shaded directions on the curve itself.

**The honest footnote, drawn not buried:** ⁵⁶Fe is famous as "the most bound
nucleus" and is not quite — ⁶²Ni has the highest binding energy per nucleon.
⁵⁶Fe wins on a different measure and dominates in stars for kinetic reasons.
Both are marked. Getting this right is a small thing that signals whether the
rest of the document can be trusted.

**Data.** `data/binding-energy.json` ← AME2020 (Wang et al. 2021), computed to
MeV per nucleon.

**Epistemic.** `settled`.

**Static.** Entirely static.

**Alt.** "Binding energy per nucleon plotted against mass number, from hydrogen
to uranium, using measured atomic masses. The curve rises steeply through
helium, carbon and oxygen, peaks in the iron–nickel region at about 8.8 MeV per
nucleon, and declines slowly toward uranium. Fusion releases energy only below
the peak, which is why stellar fusion halts at iron. Nickel-62 is marginally
more bound per nucleon than iron-56."

---

## FIG 5 — Building the heavy things
`figures/NeutronCapture.astro` · **full-bleed** · ch5 *Making the heavy things*

**Question.** Iron is the end of fusion — so where do gold, uranium and iodine
come from?

**Takeaway.** Not from fusion at all. Heavy elements are built by capturing
neutrons, along two different routes: a slow one inside ageing low-mass stars,
and a fast one in a catastrophe. Which catastrophe is still being argued about.

**Form.** The chart of nuclides — neutron number against proton number — with
the valley of stability drawn from real data. Two paths across it:
- **s-process**: slow, hugging the valley, stepping up one nucleus at a time
- **r-process**: fast, driven far into the neutron-rich territory to the right,
  then decaying back diagonally toward stability

Drawn full-bleed because the plane genuinely is two-dimensional and large; the
r-process excursion is meaningless if compressed.

The r-process path is drawn `contested` — dashed — because the dominant site is
an open research question. GW170817 is marked as the one direct observation.

**Data.** `data/nuclides.json` ← NUBASE2020 for stability; process paths
schematic and labelled as such on the drawing.

**Epistemic.** Nuclide chart `settled`. s-process site `settled` (AGB stars).
r-process site `contested` — neutron-star mergers observed to produce it, but
whether they account for all of it, and the role of collapsars, is unresolved.

**Static.** Fully static.

**Alt.** "The chart of nuclides, plotting proton number against neutron number.
Stable isotopes form a valley curving away from equal numbers toward
neutron-rich compositions. Two element-building paths are shown: the slow
neutron-capture process, which follows the valley closely inside ageing stars,
and the rapid process, which pushes far into neutron-rich territory before
decaying back — occurring in neutron-star mergers, and possibly other events
still under debate."

---

## FIG 6 — The periodic table, by origin
`figures/OriginTable.astro` · **full-bleed** · ch6 *The census*

**Question.** For every element, where was it made — and how sure are we?

**Takeaway.** The periodic table is a map of at least six different production
histories, and our confidence in the attribution varies enormously across it.

**Form.** The periodic table with each tile divided by **dominant origin**: Big
Bang, cosmic-ray spallation, dying low-mass stars, exploding massive stars,
merging neutron stars, exploding white dwarfs, human-made.

The second layer is the one nobody else draws: each tile also carries its
**epistemic treatment**. Well-constrained attributions are solid; contested ones
are hatched. Lithium — whose primordial abundance disagrees with theory by a
factor of three, a genuinely unresolved problem — is marked `open`.

**This figure doubles as the epistemic legend for the whole document.** By
chapter 6 the reader has met all three treatments in context; here they see them
laid out across all 118 elements at once. That is why it sits this late.

The elements present in the human body are outlined in the author's red — the
figure ties back to chapter 0 without repeating it.

**Data.** `data/element-origins.json` ← Johnson 2019.

**Epistemic.** Per-element, from the source. This figure is *about* epistemic
status as much as about origins.

**Static.** Fully static.

**Alt.** "The periodic table with every element coloured by where it is
principally made: the Big Bang for hydrogen and helium, cosmic-ray collisions
for lithium, beryllium and boron, dying low-mass stars, exploding massive stars,
merging neutron stars, and exploding white dwarfs. Hatching marks elements whose
origin is contested. Lithium is marked as unresolved — its observed primordial
abundance disagrees with prediction. Elements found in the human body are
outlined."

---

## FIG 7 — The chain of inference
`figures/HowWeKnow.astro` · **measure** · ch7 *How we know*

**Question.** How can anyone possibly claim to know where a carbon atom was
made?

**Takeaway.** Nobody observed it. Every claim in this document is the end of a
chain — instrument, measurement, inference — and the chains are short enough to
check.

**Form.** Not a picture of instruments; a diagram of *inference*. Four chains
run left to right, each: observation → instrument → what it constrains → which
claim in this document it supports.

- stellar spectra → spectrographs → photospheric abundances → ch4, ch6
- meteoritic isotope ratios → mass spectrometry → presolar grain origins → ch5
- GW170817 + its kilonova → LIGO/Virgo + optical follow-up → r-process yields → ch5
- reaction cross-sections → accelerators → stellar reaction rates → ch3, ch4

Each chain terminates in a link to the chapter it supports, so the reader can
walk backwards from any claim to the instrument that grounds it. Held at the
measure deliberately: this is an argument, and it is the one chapter that should
read like prose with a diagram rather than a diagram with captions.

Payne-Gaposchkin, Bethe, Gamow, Hoyle and B²FH appear in the prose here, not as
portraits in the figure. People carry chapters; they do not decorate them.

**Data.** No dataset — this is structural. Source links per chain.

**Epistemic.** `settled`, with the honest note that chains are only as good as
their weakest link, and the r-process chain has the weakest.

**Static.** Fully static.

**Alt.** "Four chains of inference, each running from an observation through an
instrument to the claim it supports: stellar spectra through spectrographs to
stellar abundances; meteoritic isotope ratios through mass spectrometry to the
origins of presolar grains; the gravitational-wave event GW170817 and its
kilonova through LIGO and optical telescopes to heavy-element yields; and
laboratory reaction cross-sections through particle accelerators to stellar
reaction rates."

---

## FIG 8 — The census, returned
`figures/BodyCensus.astro` with `annotated` · **wide** · ch8 *The edge*

**Question.** Now that you know where it all came from — what is still unknown
about the atoms in your own hand?

**Takeaway.** The reader sees, in one image, what forty minutes of reading
bought them. The same figure they met as a plain question now carries origins,
confidence, and the open questions sitting inside their own body.

**Form.** FIG 0 re-rendered with every annotation layer on: origin labels,
epistemic treatment per band, and red marginal annotations pointing at the
unresolved pieces — the lithium problem, the r-process site, and baryogenesis
underneath all of it.

**This is the strongest available argument that the piece was worth reading**,
and it costs one component built twice with different props.

The open marks here are *generated* from the `<Uncertainty status="open">`
entries collected through the document, so this figure cannot contradict the
chapters above it.

**Data.** As FIG 0.

**Epistemic.** The whole point.

**Static.** Fully static.

**Alt.** "The body census figure from the opening, now fully annotated. Each
band carries its origin and how well that origin is known. Marginal notes mark
the three unresolved questions the document reached: the primordial lithium
discrepancy, the dominant site of rapid neutron capture, and why any matter
survived at all."
