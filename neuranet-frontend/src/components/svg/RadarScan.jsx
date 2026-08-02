/**
 * RadarScan — a compact animated radar sweep, used as a small illustrative
 * graphic wherever the product is actively "watching" (security overview,
 * live monitoring states, empty states for scans in progress).
 */
import { useId } from 'react'

export default function RadarScan({ size = 120, color = 'var(--nn-signal-500, #3b82f6)' }) {
  const uid = useId()
  const sweepId = `nn-sweep-${uid}`

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Live network scan">
      <defs>
        <radialGradient id={sweepId} cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
      <circle cx="60" cy="60" r="18" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
      <line x1="8" y1="60" x2="112" y2="60" stroke="rgba(148,163,184,0.10)" />
      <line x1="60" y1="8" x2="60" y2="112" stroke="rgba(148,163,184,0.10)" />

      <g style={{ transformOrigin: '60px 60px' }}>
        <path d="M 60 60 L 60 8 A 52 52 0 0 1 100.8 27.2 Z" fill={`url(#${sweepId})`} />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 60"
          to="360 60 60"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </g>

      {[[76, 40], [40, 78], [88, 82]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color}>
          <animate attributeName="opacity" values="0.2;1;0.2" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <circle cx="60" cy="60" r="3" fill={color} />
    </svg>
  )
}
