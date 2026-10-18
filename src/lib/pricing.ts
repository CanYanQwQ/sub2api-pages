import type { PlazaModel, PlazaPricing } from './instance'

/**
 * Price formatting for the catalogue.
 *
 * Sub2API bills per token but quotes per million tokens, and its own frontend
 * does the same thing (`frontend/src/utils/pricing.ts` in 0.2.17):
 *
 *   formatScaled(0.000003, 1_000_000)  -> "$3"
 *   formatScaled(3e-05,    1_000_000)  -> "$30"
 *
 * The `toPrecision(10)` round trip is not decoration: `5e-8 * 1e6` evaluates to
 * 0.049999999999999996, and printing that on a price list looks like a bug.
 */
const PER_MILLION = 1_000_000

function formatUsd(value: number, scale: number): string {
  const scaled = Number((value * scale).toPrecision(10))
  return `$${scaled}`
}

/** A model the visitor can actually call, or null when the row carries no data. */
export interface PriceTag {
  /** Text to render on the right of the row, e.g. "$5 / $30" or "$0.15 / 次". */
  text: string
  /** True when the model is free of charge in this group. */
  free: boolean
}

/**
 * Resolve one model's price line.
 *
 * Token billing prints input/output per million tokens. Per-request, image and
 * video billing have no meaningful input/output split, so they print the single
 * request price instead — a chat price list built from image rows would
 * otherwise show two identical columns of `-`.
 */
export function priceTag(
  model: PlazaModel,
  labels: { perCall: string; free: string },
): PriceTag | null {
  const pricing: PlazaPricing | null = model.pricing ?? null
  if (!pricing) return null

  const mode = pricing.billing_mode
  const perRequest = pricing.per_request_price
  if (mode === 'per_request' || mode === 'image' || mode === 'video') {
    if (perRequest == null) return null
    return {
      text: `${formatUsd(perRequest, 1)} / ${labels.perCall}`,
      free: false,
    }
  }

  const input = pricing.input_price
  const output = pricing.output_price
  if (input == null && output == null) return null
  if (input === 0 && output === 0) return { text: labels.free, free: true }

  const parts =
    input != null && output != null && input !== output
      ? `${formatUsd(input, PER_MILLION)} / ${formatUsd(output, PER_MILLION)}`
      : `${formatUsd((input ?? output) as number, PER_MILLION)}`

  return { text: parts, free: false }
}
