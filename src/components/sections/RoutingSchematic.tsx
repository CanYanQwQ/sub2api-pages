import { BrandMark } from '../ui'

/**
 * The one piece of custom vector art on the page.
 *
 * It draws what the gateway actually does: three client protocols fan into one
 * core, which fans back out into upstream account pools. Everything is hairline
 * strokes and mono labels — no glows, no gradient meshes.
 *
 * The entrance is choreographed rather than uniform: clients land first, the
 * inbound wires then draw themselves into the core, the core settles, the
 * outbound wires draw, and only then do the pools and the travelling signals
 * appear. Each wire carries `pathLength="100"` so the dash maths is identical
 * for a straight line and a bezier — see `wire-draw` in index.css.
 *
 * Coordinates are hand-placed on a 440x380 grid so the wires meet the nodes
 * exactly; changing a constant here means changing the path below it.
 */

interface ClientNode {
  x: number
  name: string
  protocol: string
}

const CLIENTS: ClientNode[] = [
  { x: 20, name: 'Claude Code', protocol: '/v1/messages' },
  { x: 158, name: 'Codex', protocol: '/v1/responses' },
  { x: 296, name: 'Gemini CLI', protocol: '/v1beta/models' },
]

const POOLS = [
  { x: 44, name: 'Claude' },
  { x: 168, name: 'OpenAI' },
  { x: 292, name: 'Gemini' },
]

const CORE_X = 220
const CORE_Y = 216
const CORE_R = 40
const RING_R = 58

const NODE_W = 124
const NODE_H = 42
const NODE_Y = 28
const POOL_W = 104
const POOL_H = 40
const POOL_Y = 316

/** Client bottom edge → core top edge. The middle wire is the straight one. */
function inboundPath(cx: number): string {
  if (cx === CORE_X) return `M${CORE_X},${NODE_Y + NODE_H} L${CORE_X},${CORE_Y - CORE_R}`
  return `M${cx},${NODE_Y + NODE_H} C${cx},${NODE_Y + 60} ${CORE_X},${CORE_Y - 60} ${CORE_X},${CORE_Y - CORE_R}`
}

/** Core bottom edge → pool top edge. */
function outboundPath(cx: number): string {
  if (cx === CORE_X) return `M${CORE_X},${CORE_Y + CORE_R} L${CORE_X},${POOL_Y}`
  return `M${CORE_X},${CORE_Y + CORE_R} C${CORE_X},${CORE_Y + 72} ${cx},${POOL_Y - 34} ${cx},${POOL_Y}`
}

const INBOUND = CLIENTS.map((client) => inboundPath(client.x + NODE_W / 2))
const OUTBOUND = POOLS.map((pool) => outboundPath(pool.x + POOL_W / 2))

/** Draw the wire, then let the signal start running along it. */
const INBOUND_DRAW = 200
const OUTBOUND_DRAW = 760
const DRAW_MS = 640
const WIRE_STEP = 70

function Wire({ d, index, start }: { d: string; index: number; start: number }) {
  const drawAt = start + index * WIRE_STEP
  return (
    <g>
      <path
        d={d}
        stroke="var(--c-line-strong)"
        strokeWidth="1"
        pathLength={100}
        className="wire-draw"
        style={{ animationDelay: `${drawAt}ms` }}
      />
      {/* The brand hairline is the packet's track: it must not appear until the
          grey line under it has finished drawing. */}
      <g className="fade-in-late" style={{ animationDelay: `${drawAt + DRAW_MS - 40}ms` }}>
        <path
          d={d}
          stroke="var(--c-brand)"
          strokeWidth="1.25"
          strokeOpacity="0.9"
          className="wire-flow"
          style={{ animationDelay: `${index * 220}ms` }}
        />
      </g>
    </g>
  )
}

export default function RoutingSchematic() {
  return (
    <svg
      viewBox="0 0 440 380"
      role="img"
      aria-label="Three client protocols route through the gateway into three upstream account pools"
      className="h-auto w-full"
      fill="none"
    >
      {/* Wires ------------------------------------------------------- */}
      <g>
        {INBOUND.map((d, index) => (
          <Wire key={d} d={d} index={index} start={INBOUND_DRAW} />
        ))}
        {OUTBOUND.map((d, index) => (
          <Wire key={d} d={d} index={index} start={OUTBOUND_DRAW} />
        ))}
      </g>

      {/* Client nodes ------------------------------------------------ */}
      <g className="rise" style={{ animationDelay: '40ms' }}>
        {CLIENTS.map((client, index) => (
          <g key={client.name}>
            <g className="rise" style={{ animationDelay: `${40 + index * 70}ms` }}>
              <rect
                x={client.x}
                y={NODE_Y}
                width={NODE_W}
                height={NODE_H}
                rx="7"
                fill="var(--c-surface)"
                stroke="var(--c-line)"
              />
              <text
                x={client.x + 14}
                y={NODE_Y + 18}
                fill="var(--c-ink)"
                fontSize="12"
                fontWeight="500"
                letterSpacing="-0.01em"
              >
                {client.name}
              </text>
              <text
                x={client.x + 14}
                y={NODE_Y + 32}
                fill="var(--c-ink-3)"
                fontSize="8.5"
                fontFamily="var(--font-mono)"
                letterSpacing="0.02em"
              >
                {client.protocol}
              </text>
              <circle
                cx={client.x + NODE_W / 2}
                cy={NODE_Y + NODE_H}
                r="2.25"
                fill="var(--c-brand)"
              />
            </g>
          </g>
        ))}
      </g>

      {/* Core -------------------------------------------------------- */}
      <g className="rise" style={{ animationDelay: '520ms' }}>
        {/* Breathing ring: the only thing still moving once the diagram is
            assembled, so the panel never looks like a static picture. */}
        <circle
          cx={CORE_X}
          cy={CORE_Y}
          r={CORE_R}
          stroke="var(--c-brand)"
          strokeWidth="1"
          className="core-pulse"
          style={{ transformOrigin: `${CORE_X}px ${CORE_Y}px` }}
        />
        <circle
          cx={CORE_X}
          cy={CORE_Y}
          r={RING_R}
          stroke="var(--c-line)"
          strokeWidth="1"
          strokeDasharray="2 6"
          className="spin-slow"
          style={{ transformOrigin: `${CORE_X}px ${CORE_Y}px` }}
        />
        <circle
          cx={CORE_X}
          cy={CORE_Y}
          r={CORE_R}
          fill="var(--c-surface)"
          stroke="var(--c-line-strong)"
        />
        <circle cx={CORE_X} cy={CORE_Y - CORE_R} r="2.25" fill="var(--c-brand)" />
        <circle cx={CORE_X} cy={CORE_Y + CORE_R} r="2.25" fill="var(--c-brand)" />
        <g transform={`translate(${CORE_X - 20}, ${CORE_Y - 20})`} color="var(--c-ink)">
          <BrandMark size={40} />
        </g>
      </g>

      {/* Upstream pools ---------------------------------------------- */}
      <g>
        {POOLS.map((pool, index) => (
          <g key={pool.name} className="rise" style={{ animationDelay: `${1080 + index * 80}ms` }}>
            <rect
              x={pool.x}
              y={POOL_Y}
              width={POOL_W}
              height={POOL_H}
              rx="7"
              fill="var(--c-surface-2)"
              stroke="var(--c-line)"
            />
            <rect
              x={pool.x + 12}
              y={POOL_Y + 16}
              width="8"
              height="8"
              rx="2"
              fill="var(--c-brand)"
              fillOpacity="0.18"
              stroke="var(--c-brand)"
              strokeOpacity="0.55"
            />
            <text
              x={pool.x + 28}
              y={POOL_Y + 24}
              fill="var(--c-ink-2)"
              fontSize="11.5"
              fontWeight="500"
            >
              {pool.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
