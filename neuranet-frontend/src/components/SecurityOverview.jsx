/**
 * SecurityOverview
 * -----------------------------------------------------------------------
 * Same prop name as before: { security }. But GET /api/security returns
 *   { total_packets, attacks, normal, devices, alerts, average_confidence, high_confidence }
 * — not score / threats / safe_devices / blocked, which the previous
 * version read (and silently defaulted to 96% / 0 every time). The score
 * shown here is now derived honestly from real counts.
 */
export default function SecurityOverview({ security = {} }) {
  const total = security.total_packets ?? 0
  const attacks = security.attacks ?? 0
  const normal = security.normal ?? 0
  const devices = security.devices ?? 0
  const highConfidence = security.high_confidence ?? 0
  const avgConfidence = security.average_confidence ?? 0

  const score = total > 0 ? Math.round((normal / total) * 100) : 100
  const scoreColor = score >= 90 ? 'var(--nn-sev-low)' : score >= 70 ? 'var(--nn-sev-medium)' : 'var(--nn-sev-critical)'

  return (
    <div style={{ padding: '4px 22px 22px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="nn-mono" style={{ color: scoreColor, fontWeight: 700, fontSize: 'var(--nn-fs-3xl)', lineHeight: 1 }}>
          {score}%
        </div>
        <p className="nn-text-secondary" style={{ margin: '6px 0 14px', fontSize: 'var(--nn-fs-sm)' }}>
          Traffic classified normal
        </p>

        <div style={{ height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.12)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', width: `${score}%`,
              background: scoreColor,
              boxShadow: `0 0 10px ${scoreColor}`,
              transition: 'width 500ms var(--nn-ease)',
            }}
          />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--nn-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Row label="Total packets analyzed" value={total} />
        <Row label="Attacks detected" value={attacks} color="var(--nn-sev-critical)" />
        <Row label="Devices monitored" value={devices} color="var(--nn-signal-500)" />
        <Row label="High-confidence detections" value={highConfidence} color="var(--nn-violet-500)" />
        <Row label="Average AI confidence" value={`${avgConfidence}%`} />
      </div>
    </div>
  )
}

function Row({ label, value, color = 'var(--nn-text-primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>{label}</span>
      <strong className="nn-mono" style={{ color, fontSize: 'var(--nn-fs-sm)' }}>{value}</strong>
    </div>
  )
}
