import { useMemo, useState } from 'react'

/**
 * AttackTrendChart
 * -----------------------------------------------------------------------
 * Renders the real /api/attack-trend series as an SVG area chart (no canvas,
 * no chart library — consistent with the app's SVG-only visual language).
 * Prop contract unchanged: { data: [{ time, attacks }] }.
 */
export default function AttackTrendChart({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null)

  const width = 640
  const height = 240
  const padding = { top: 20, right: 16, bottom: 30, left: 36 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const { points, maxVal, areaPath, linePath } = useMemo(() => {
    if (!data.length) return { points: [], maxVal: 0, areaPath: '', linePath: '' }

    const max = Math.max(...data.map((d) => d.attacks), 1)
    const step = data.length > 1 ? innerW / (data.length - 1) : 0

    const pts = data.map((d, i) => ({
      x: padding.left + i * step,
      y: padding.top + innerH - (d.attacks / max) * innerH,
      ...d,
    }))

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const area = `${line} L ${pts[pts.length - 1].x} ${padding.top + innerH} L ${pts[0].x} ${padding.top + innerH} Z`

    return { points: pts, maxVal: max, areaPath: area, linePath: line }
  }, [data])

  if (!data.length) {
    return (
      <div
        style={{
          height: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: 'var(--nn-text-tertiary)',
          border: '1px dashed var(--nn-border)',
          borderRadius: 'var(--nn-radius-md)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19h16M6 16l4-5 3 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 'var(--nn-fs-sm)' }}>No attacks recorded in the last 24 hours</span>
      </div>
    )
  }

  const gridLines = 4
  const active = hoverIdx !== null ? points[hoverIdx] : null

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={240}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="Attack trend over the last 24 hours"
      >
        <defs>
          <linearGradient id="attackAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--nn-sev-critical, #ef4444)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--nn-sev-critical, #ef4444)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (innerH / gridLines) * i
          const val = Math.round(maxVal - (maxVal / gridLines) * i)
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(148,163,184,0.08)" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--nn-text-tertiary)" className="nn-mono">
                {val}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#attackAreaFill)" />
        <path d={linePath} fill="none" stroke="var(--nn-sev-critical, #ef4444)" strokeWidth="2" />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - (innerW / points.length) / 2}
              y={padding.top}
              width={innerW / points.length || 20}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
            {(i % Math.ceil(points.length / 8) === 0) && (
              <text x={p.x} y={height - 10} textAnchor="middle" fontSize="10" fill="var(--nn-text-tertiary)" className="nn-mono">
                {p.time}
              </text>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === i ? 4.5 : 2.5}
              fill="var(--nn-sev-critical, #ef4444)"
              stroke="var(--nn-bg-1, #0a0f1c)"
              strokeWidth="1.5"
              style={{ transition: 'r 120ms ease' }}
            />
          </g>
        ))}

        {active && (
          <line x1={active.x} x2={active.x} y1={padding.top} y2={padding.top + innerH} stroke="rgba(239,68,68,0.35)" strokeDasharray="3 3" />
        )}
      </svg>

      {active && (
        <div
          className="nn-glass-strong nn-mono"
          style={{
            position: 'absolute',
            left: `calc(${(active.x / width) * 100}% - 46px)`,
            top: 4,
            padding: '6px 10px',
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span className="nn-text-secondary">{active.time}</span>
          {'  '}
          <strong style={{ color: 'var(--nn-sev-critical)' }}>{active.attacks} attacks</strong>
        </div>
      )}
    </div>
  )
}
