/**
 * SCROLL BINDING — the one place in this project that reads scroll position.
 *
 * The doctrine, and the reason this file is written the way it is:
 *
 *   Scroll is a PARAMETER, not a trigger.
 *
 * The genre cliché is an IntersectionObserver that fires once, plays a
 * fade-and-rise, and leaves the element where it landed. That is scroll as a
 * detonator, and it is irreversible by construction — scroll back up and the
 * page is in a state it can never return to.
 *
 * Here, progress is recomputed from getBoundingClientRect() every frame and
 * written straight to the DOM. There is no accumulator, no eased value carried
 * between frames, and no "hasPlayed" flag anywhere in this file. That is not a
 * stylistic preference; it is what makes the figure land in exactly the same
 * state at 20% whether you arrived going down or coming back up. The acceptance
 * test for the whole section depends on it.
 *
 * What it publishes on the scrolly root, for figures to read:
 *   --progress        0..1 across the whole sequence
 *   --step-progress   0..1 within the current step
 *   data-step         integer index of the current step
 *
 * IntersectionObserver appears below, but only to decide whether to bother
 * doing the work — never to decide what the figure looks like.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';

/** @param {HTMLElement} root */
function bind(root) {
  const steps = /** @type {HTMLElement[]} */ (
    Array.from(root.querySelectorAll('[data-ex-step]'))
  );
  if (steps.length === 0) return;

  // The prose says the figure is live, so the static fallback comes off.
  root.dataset.static = 'false';

  const reduced = window.matchMedia(REDUCED);

  /**
   * Progress is a pure function of geometry. Called every frame while visible;
   * called nothing at all otherwise.
   */
  const measure = () => {
    // The reading line: a third down the viewport is where the eye actually
    // sits, not the middle and certainly not the top.
    const line = window.innerHeight * 0.4;

    let current = 0;
    let within = 0;

    for (let i = 0; i < steps.length; i++) {
      const box = steps[i].getBoundingClientRect();
      if (box.top <= line) {
        current = i;
        // How far through this step the reading line has travelled.
        within = box.height > 0 ? (line - box.top) / box.height : 0;
        if (within > 1) within = 1;
        if (within < 0) within = 0;
      }
    }

    // Under reduced motion the figure holds discrete states. Nothing tweens,
    // nothing is ever caught mid-transition — but every step is still reached,
    // so no content is lost. This is a different rendering of the same data,
    // not a degraded one.
    if (reduced.matches) within = 0;

    const overall =
      steps.length > 1 ? (current + within) / (steps.length - 1) : within;

    root.style.setProperty('--progress', String(Math.min(1, Math.max(0, overall))));
    root.style.setProperty('--step-progress', String(within));

    // Continuous progress, for figures that scrub rather than switch. A plain
    // callback set rather than an event: this runs every frame, and dispatching
    // a CustomEvent per frame to zero listeners is pure waste.
    const subscribers = root.__exProgress;
    if (subscribers) {
      for (const fn of subscribers) fn(overall, current, within);
    }

    // Written every frame, unconditionally.
    //
    // These used to be inside the `dataset.step` guard below, which looked like
    // a harmless optimisation and was in fact the one place in this file where
    // the rendered state depended on history. The markup ships with
    // data-step="0", so on first arrival at step 0 the guard was already
    // satisfied and no step was ever marked active — the highlight only
    // appeared once the reader had moved away and come back. Six attribute
    // writes a frame is nothing; a figure whose appearance depends on where you
    // have been is the whole thing this file exists to prevent.
    for (let i = 0; i < steps.length; i++) {
      steps[i].dataset.active = i === current ? 'true' : 'false';
    }

    if (root.dataset.step !== String(current)) {
      root.dataset.step = String(current);
      // One event, for work too expensive to do per frame.
      root.dispatchEvent(
        new CustomEvent('ex:step', { detail: { step: current, total: steps.length } })
      );
    }
  };

  // --- run only while on screen ---------------------------------------
  let running = false;
  let frame = 0;

  const tick = () => {
    frame = 0;
    measure();
  };

  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure();
  };

  const stop = () => {
    if (!running) return;
    running = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  // The ONLY job of the observer: decide whether to spend frames. It never
  // decides what anything looks like.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.isIntersecting ? start() : stop();
    },
    { rootMargin: '100% 0px' }
  );
  observer.observe(root);

  // Changing the setting mid-read re-renders immediately rather than waiting
  // for the next scroll.
  const onPreferenceChange = () => measure();
  if (typeof reduced.addEventListener === 'function') {
    reduced.addEventListener('change', onPreferenceChange);
  }

  measure();
}

/**
 * Subscribe a figure to continuous scroll progress.
 *
 * The callback receives (overall 0..1, step index, progress within step) and is
 * called every frame the sequence is on screen. It must be a PURE function of
 * those arguments — draw the state they describe, do not advance an animation.
 * That is what keeps the figure reversible.
 *
 * @param {HTMLElement} scrollyRoot
 * @param {(overall: number, step: number, within: number) => void} fn
 */
export function onProgress(scrollyRoot, fn) {
  if (!scrollyRoot) return () => {};
  const set = scrollyRoot.__exProgress || (scrollyRoot.__exProgress = new Set());
  set.add(fn);
  return () => set.delete(fn);
}

export function initScrolly(scope = document) {
  for (const root of scope.querySelectorAll('[data-ex-scrolly]')) {
    bind(/** @type {HTMLElement} */ (root));
  }
}

// Idempotent: safe to call again after a client-side navigation.
if (typeof document !== 'undefined') {
  const run = () => initScrolly();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  document.addEventListener('astro:page-load', run);
}
