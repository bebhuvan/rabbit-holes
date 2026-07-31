/**
 * The Gamow peak, computed.
 *
 * Imported by BOTH the build-time render and the client script, so the static
 * SVG and the scrubbed states come from identical math. Two copies of this
 * would drift, and the drift would be invisible — the figure would simply be
 * subtly wrong in one of its states.
 *
 * The physics, briefly:
 *
 *   Thermal energies follow Maxwell–Boltzmann, so the number of protons with
 *   energy E falls as exp(−E/kT).
 *
 *   The chance of tunnelling through the Coulomb barrier RISES with energy as
 *   exp(−b/√E), where b is the Gamow constant for the reacting pair.
 *
 *   Fusion needs both, so the rate goes as the product. One factor falls
 *   steeply, the other rises steeply, and the product is a narrow peak sitting
 *   far below the barrier — the Gamow peak.
 *
 * Constants are for proton–proton fusion:
 *   b = 31.28 · Z₁ · Z₂ · √A_reduced   keV^½,  with A_reduced = 0.5 amu
 *     = 22.12 keV^½
 *
 * Sanity check that this file is right: at the solar core temperature of
 * 15.7 MK it puts the peak at ≈6.1 keV, against the textbook ≈5.9 keV.
 */
import { linear, linePath, areaPath } from '../../kit/scale.js';

/** Gamow constant for p+p, keV^½. */
export const B_PP = 22.12;

/** Boltzmann constant in keV per kelvin. */
export const K_KEV = 8.617333e-8;

/** Solar core temperature, kelvin. Bahcall standard solar model. */
export const T_SOLAR = 15.7e6;

/** Coulomb barrier for p+p, keV — roughly, and far off the right of the plot. */
export const COULOMB_BARRIER_KEV = 1000;

/** Drawing geometry. Shared so build and browser agree exactly. */
export const GEOM = {
  // Wide and shallow. This figure pins to the top of the viewport while the
  // steps read past beneath it, so its aspect ratio decides how much width it
  // gets: at 470px tall it was height-capped to 931px wide on a normal display
  // and never filled the spread it had been given.
  width: 1340,
  height: 480,
  left: 70,
  // The right-hand third is the magnitude panel, not margin. See MAG below.
  right: 330,
  top: 44,
  // Deep enough for tick labels and the axis title stacked without collision.
  bottom: 92,
  /** Energy axis, keV. Wide enough to show the peak and the falling tail. */
  eMax: 26,
  samples: 320,
};

/**
 * The magnitude panel.
 *
 * The caption's headline — the peak is about a millionth of either curve — was
 * previously a line of small print under the plot, which is the one fact in the
 * figure that most needs drawing rather than asserting. Eight decades of log
 * scale down the right-hand side makes the drop something you look at.
 */
export const MAG = {
  x: 1080,
  decades: 7,
  top: GEOM.top,
  bottom: GEOM.height - GEOM.bottom,
};

/** y pixel for a value on the magnitude panel's log scale, 1 at the top. */
export const magY = (value) => {
  const decades = value > 0 ? Math.min(MAG.decades, -Math.log10(value)) : MAG.decades;
  return MAG.top + (decades / MAG.decades) * (MAG.bottom - MAG.top);
};

export const plotX = () =>
  linear([0, GEOM.eMax], [GEOM.left, GEOM.width - GEOM.right]);
export const plotY = () =>
  linear([0, 1], [GEOM.height - GEOM.bottom, GEOM.top]);

/** Peak energy of the Gamow window, keV. E₀ = (b·kT/2)^(2/3) */
export function peakEnergy(T) {
  return ((B_PP * K_KEV * T) / 2) ** (2 / 3);
}

/**
 * The three curves, each normalised to its own maximum so all three are
 * visible on one axis.
 *
 * Normalising is the only honest way to draw them together — the product is
 * some six orders of magnitude below the other two — but it is also exactly the
 * kind of thing that quietly misleads. So `magnification` comes back with the
 * curves and is printed ON the drawing, not buried in a caption.
 */
export function curves(T) {
  const kT = K_KEV * T;
  const x = plotX();
  const y = plotY();

  const maxwell = (E) => Math.exp(-E / kT);
  const tunnel = (E) => (E <= 0 ? 0 : Math.exp(-B_PP / Math.sqrt(E)));
  const product = (E) => maxwell(E) * tunnel(E);

  const step = GEOM.eMax / GEOM.samples;

  // Peak of the product, found on the same grid that gets drawn so the marked
  // peak and the drawn peak cannot disagree by a pixel.
  let peakE = 0;
  let peakV = 0;
  for (let i = 1; i <= GEOM.samples; i++) {
    const E = i * step;
    const v = product(E);
    if (v > peakV) {
      peakV = v;
      peakE = E;
    }
  }

  const tunnelMax = tunnel(GEOM.eMax);

  const sample = (fn, norm) => {
    const points = [];
    for (let i = 0; i <= GEOM.samples; i++) {
      const E = i * step;
      const v = norm > 0 ? fn(E) / norm : 0;
      points.push([x(E), y(Math.min(1, v))]);
    }
    return points;
  };

  const productPoints = sample(product, peakV);

  return {
    T,
    kT,
    peakE,
    peakY: y(1),
    peakX: x(peakE),
    /** How far the product had to be scaled up to be visible at all. */
    magnification: peakV > 0 ? 1 / peakV : 0,
    /** True, unnormalised heights — what the magnitude panel plots. */
    peakV,
    tunnelMax,
    maxwellPath: linePath(sample(maxwell, 1)),
    tunnelPath: linePath(sample(tunnel, tunnelMax)),
    productPath: linePath(productPoints),
    productArea: areaPath(productPoints, y(0)),
    /** kT marker, so the reader can see the peak sits well above typical energy. */
    kTx: x(kT),
  };
}

/** Rounded exponent for printing a magnification as 10ⁿ. */
export function magnitude(value) {
  return value > 0 ? Math.round(Math.log10(value)) : 0;
}
