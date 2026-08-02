/**
 * RadialGauge — a half-circle SVG gauge used to visualize a bounded metric
 * (0–100%) with an optional secondary "peak" marker. Built to sit alongside
 * CircuitBackground / RadarScan / NetworkTopology as part of the shared
 * SVG enterprise visual language — no chart library, no canvas.
 *
 * Props:
 *  - value: number (0-100) — primary filled value (e.g. average utilization)
 *  - peak: number (0-100) | null — optional marker for a secondary value (e.g. max)
 *  - label: string — metric name, e.g. "CPU"
 *  - valueLabel: string — formatted primary value, e.g. "42%"
 *  - peakLabel: string — formatted marker value, e.g. "Peak 91%"
 *  - color: string — CSS color/token for the filled arc
 */
export default function RadialGauge({
  value = 0,
  peak = null,
  label = '',
  valueLabel = '',
  peakLabel = '',
  color = 'var(--nn-signal-500)',
  size = 220,
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 22
  const clampedValue = Math.max(0, Math.min(100, value))
  const clampedPeak = peak == null ? null : Math.max(0, Math.min(100, peak))

  const pointAt = (pct) => {
    const angle = 180 - (pct / 100) * 180 // 180deg at pct=0 (left) -> 0deg at pct=100 (right)
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }

  const start = pointAt(0)
  const end = pointAt(clampedValue)
  const trackEnd = pointAt(100)
  const largeArc = clampedValue > 50 ? 1 : 0

  const trackPath = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`
  const valuePath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`

  const peakPoint = clampedPeak == null ? null : pointAt(clampedPeak)
  const peakInner = clampedPeak == null ? null : (() => {
    const angle = 180 - (clampedPeak / 100) * 180
    const rad = (angle * Math.PI) / 180
    const innerR = r - 12
    return { x: cx + innerR * Math.cos(rad), y: cy - innerR * Math.sin(rad) }
  })()

  const height = size / 2 + 56

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} role="img" aria-label={`${label} gauge, ${valueLabel}`}>
        <path d={trackPath} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="14" strokeLinecap="round" />
        <path d={valuePath} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'all 500ms var(--nn-ease)' }} />

        {peakPoint && (
          <line
            x1={peakInner.x} y1={peakInner.y}
            x2={peakPoint.x} y2={peakPoint.y}
            stroke="var(--nn-sev-medium)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        <text x={cx} y={cy - 4} textAnchor="middle" className="nn-mono" fontSize="26" fontWeight="700" fill="var(--nn-text-primary)">
          {valueLabel}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="11" letterSpacing="0.06em" fill="var(--nn-text-tertiary)">
          {label.toUpperCase()}
        </text>
      </svg>
      {peakLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: -8 }}>
          <span style={{ width: 8, height: 2, background: 'var(--nn-sev-medium)', display: 'inline-block' }} />
          <span className="nn-mono nn-text-secondary" style={{ fontSize: 'var(--nn-fs-xs)' }}>{peakLabel}</span>
        </div>
      )}
    </div>
  )
}
