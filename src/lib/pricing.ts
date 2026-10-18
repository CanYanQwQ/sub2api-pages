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
  // Prices are read as money, not as numbers: `$0.2` next to `$0.15` and
  // `$0.25` looks like a truncated column, so anything under a dollar keeps two
  // decimals — unless that would lose a digit (0.028 must not print as 0.03).
  const twoDecimals = scaled.toFixed(2)
  const text = scaled >= 1 ? String(scaled) : Number(twoDecimals) === scaled ? twoDecimals : String(scaled)
  return `$${text}`
}

/**
 * One billing tier, as the backend reports it.
 *
 * `tier_label` is not a caption the backend invented for display: for image
 * models it is the resolution ("1K" / "2K" / "4K"), and for token models with
 * long-context pricing it is the context window ("≤272K" / ">272K"). Both are
 * the thing that decides which price applies, so both are rendered.
 */
export interface PriceTier {
  label: string
  text: string
}

export interface PriceTag {
  /** Tiers worth showing. Empty when the row carries no usable price. */
  tiers: PriceTier[]
  /** Compact single-line form, used in the row. */
  text: string
  /** Full breakdown for the `title` attribute; empty when there is one tier. */
  detail: string
  /** True when the model is free of charge in this group. */
  free: boolean
}

interface RawInterval {
  tier_label?: string | null
  input_price?: number | null
  output_price?: number | null
  per_request_price?: number | null
}

/** Per-call modes: the visitor pays once per request, not per token. */
const PER_CALL_MODES = new Set(['per_request', 'image', 'video'])

function tierText(
  mode: string | undefined,
  interval: RawInterval,
  labels: { perCall: string; free: string },
  /** The unit is appended once per row, not once per tier. */
  withUnit = true,
): string {
  if (mode && PER_CALL_MODES.has(mode)) {
    const price = interval.per_request_price
    if (price == null) return ''
    if (price === 0) return labels.free
    const value = formatUsd(price, 1)
    return withUnit ? `${value} / ${labels.perCall}` : value
  }

  const input = interval.input_price
  const output = interval.output_price
  if (input == null && output == null) return ''
  if (input === 0 && output === 0) return labels.free

  return input != null && output != null && input !== output
    ? `${formatUsd(input, PER_MILLION)} / ${formatUsd(output, PER_MILLION)}`
    : formatUsd((input ?? output) as number, PER_MILLION)
}

/**
 * Resolve one model's price.
 *
 * `pricing.intervals` is the authoritative list: an instance that charges
 * different rates for 1K / 2K / 4K renders, or for prompts above a context
 * threshold, puts those rates there. The top-level `input_price` /
 * `per_request_price` fields repeat only the first tier, which is why showing
 * them alone made the image group look like it had a single flat price.
 */
export function priceTag(
  model: PlazaModel,
  labels: { perCall: string; free: string; from?: string },
): PriceTag | null {
  const pricing: PlazaPricing | null = model.pricing ?? null
  if (!pricing) return null

  const mode = pricing.billing_mode
  const raw = (pricing as { intervals?: RawInterval[] | null }).intervals
  const intervals: RawInterval[] =
    Array.isArray(raw) && raw.length > 0
      ? raw
      : [
          {
            input_price: pricing.input_price,
            output_price: pricing.output_price,
            per_request_price: pricing.per_request_price,
          },
        ]

  const perCallMode = mode != null && PER_CALL_MODES.has(mode)
  const multi = intervals.length > 1

  const tiers: PriceTier[] = []
  for (const interval of intervals) {
    const text = tierText(mode, interval, labels, !(perCallMode && multi))
    if (!text) continue
    tiers.push({ label: interval.tier_label?.trim() || '', text })
  }
  if (tiers.length === 0) return null

  const free = tiers.every((tier) => tier.text === labels.free)
  const joined = tiers
    .map((tier) => (tier.label ? `${tier.label} ${tier.text}` : tier.text))
    .join(' · ')
  // One unit for the whole row: "1K $0.15 · 2K $0.20 · 4K $0.25 / 次".
  const detail = perCallMode && multi ? `${joined} / ${labels.perCall}` : joined

  // Image models price by resolution, so every tier is a different product the
  // visitor can ask for: print all of them. Token models tier by context
  // window, where the first tier is the price almost everyone pays — printing
  // two prices per row would double the height of the list to describe an edge
  // case, so the rest live in the tooltip behind a "from" marker.
  const first = tiers[0]
  const text =
    perCallMode || tiers.length === 1 || !first
      ? detail
      : `${first.text}${labels.from ? ` ${labels.from}` : ''}`

  return { tiers, text, detail: tiers.length > 1 ? detail : '', free }
}
