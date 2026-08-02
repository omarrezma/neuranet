/**
 * TrafficDonut — SVG donut chart splitting classified traffic into
 * normal vs attack, sourced from GET /api/security (attacks/normal counts).
 * Pure SVG stroke-dasharray donut, consistent with the app's chart-library-free
 * visual language (see AttackTrendChart, RadialGauge).
 */
export default function TrafficDonut({ normal = 0, attacks = 0, size = 200 }) {
  const total = normal + attacks
  const r = size / 2 - 18
  const circumference = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  const normalPct = total > 0 ? normal / total : 1
  const attacksPct = total > 0 ? attacks / total : 0

  const normalLen = circumference * normalPct
  const attacksLen = circumference * attacksPct

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Traffic classification breakdown">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.10)" strokeWidth="18" />

        {total > 0 ? (
          <>
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke="var(--nn-sev-low)"
              strokeWidth="18"
              strokeDasharray={`${normalLen} ${circumference - normalLen}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: 'drop-shadow(0 0 5px var(--nn-sev-low))', transition: 'stroke-dasharray 500ms var(--nn-ease)' }}
            />
            <circle
              cx={cx} cy={cy} r={r} fill="none"
              stroke="var(--nn-sev-critical)"
              strokeWidth="18"
              strokeDasharray={`${attacksLen} ${circumference - attacksLen}`}
              strokeDashoffset={-normalLen}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: attacks > 0 ? 'drop-shadow(0 0 5px var(--nn-sev-critical))' : 'none', transition: 'stroke-dasharray 500ms var(--nn-ease)' }}
            />
          </>
        ) : (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--nn-border-strong)" strokeWidth="18" strokeDasharray="4 8" />
        )}

        <text x={cx} y={cy - 6} textAnchor="middle" className="nn-mono" fontSize="28" fontWeight="700" fill="var(--nn-text-primary)">
          {total > 0 ? `${Math.round(normalPct * 100)}%` : '—'}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10.5" letterSpacing="0.06em" fill="var(--nn-text-tertiary)">
          NORMAL
        </text>
      </svg>

      <div style={{ display: 'flex', gap: 20 }}>
        <Legend color="var(--nn-sev-low)" label="Normal" value={normal} />
        <Legend color="var(--nn-sev-critical)" label="Attacks" value={attacks} />
      </div>
    </div>
  )
}

function Legend({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className={`nn-dot`} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>{label}</span>
      <span className="nn-mono" style={{ fontSize: 'var(--nn-fs-sm)', color: 'var(--nn-text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
