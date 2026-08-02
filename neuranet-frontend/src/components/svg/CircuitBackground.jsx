/**
 * CircuitBackground
 * -----------------------------------------------------------------------
 * Ambient, restrained SVG backdrop: a faint grid with a handful of traveling
 * light pulses along circuit-style paths. This is the "signature" motion
 * element reused across pages — it should always sit behind content at low
 * opacity, never compete with foreground data.
 *
 * Pure SVG/CSS animation, no canvas, no JS animation loop.
 */
import { useId } from 'react'

export default function CircuitBackground({ className = '', density = 'normal' }) {
  const uid = useId()
  const gridId = `nn-grid-${uid}`
  const fadeId = `nn-fade-${uid}`

  const paths = [
    'M -50 120 H 260 V 40 H 520 V 220 H 900',
    'M -50 300 H 180 V 380 H 460 V 260 H 780 V 340 H 1100',
    'M -50 60 H 400 V 160 H 700 V 60 H 1100',
  ]

  const isDense = density === 'dense'

  return (
    <svg
      className={className}
      viewBox="0 0 1100 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <pattern id={gridId} width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M 46 0 L 0 0 0 46" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id={fadeId} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect width="1100" height="400" fill={`url(#${gridId})`} />

      {paths.map((d, i) => (
        <g key={i} opacity={isDense ? 0.5 : 0.32}>
          <path d={d} fill="none" stroke="var(--nn-border-strong, rgba(148,163,184,0.22))" strokeWidth="1" />
          <circle r="3" fill="var(--nn-signal-500, #3b82f6)">
            <animateMotion
              dur={`${7 + i * 2.4}s`}
              repeatCount="indefinite"
              path={d}
              begin={`${i * 1.3}s`}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.9;1"
              dur={`${7 + i * 2.4}s`}
              repeatCount="indefinite"
              begin={`${i * 1.3}s`}
            />
          </circle>
        </g>
      ))}

      <rect width="1100" height="400" fill="black" opacity="0" />
      <rect width="1100" height="400" fill="none" />
      <rect width="1100" height="400" style={{ mixBlendMode: 'multiply' }} fill={`url(#${fadeId})`} opacity="0.6" />
    </svg>
  )
}
