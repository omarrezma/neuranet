import CIcon from '@coreui/icons-react'
import { cilShieldAlt } from '@coreui/icons'
import RadarScan from './svg/RadarScan'

/**
 * PredictionCard
 * -----------------------------------------------------------------------
 * New prop contract: { stats } — the raw object from GET /api/stats:
 *   { device, cpu, memory, packet_loss, interface_errors, timestamp, prediction }
 *   prediction: { incident, cause, impact, recommendation, confidence }
 * (The previous version read security.attack / security.confidence /
 * security.source_ip / security.destination_ip from GET /api/security,
 * none of which that endpoint returns.)
 */
const impactColor = {
  low: 'var(--nn-sev-low)',
  medium: 'var(--nn-sev-medium)',
  high: 'var(--nn-sev-high)',
  critical: 'var(--nn-sev-critical)',
}

export default function PredictionCard({ stats = {} }) {
  const prediction = stats.prediction || {}
  const incident = prediction.incident || 'Healthy'
  const cause = prediction.cause || 'No abnormal behaviour detected'
  const recommendation = prediction.recommendation || 'No action required'
  const confidence = prediction.confidence ?? 0
  const impact = (prediction.impact || 'Low').toLowerCase()
  const color = impactColor[impact] || 'var(--nn-sev-low)'

  return (
    <div style={{ padding: '4px 22px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 50, height: 50, borderRadius: 14,
              background: 'rgba(139,124,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <CIcon icon={cilShieldAlt} size="lg" style={{ color: 'var(--nn-violet-500)' }} />
          </div>
          <div>
            <h5 style={{ color: 'var(--nn-text-primary)', marginBottom: 3, fontSize: 'var(--nn-fs-lg)', fontWeight: 600 }}>
              {incident}
            </h5>
            <small className="nn-text-secondary">AI reasoning · {stats.device || 'unknown device'}</small>
          </div>
        </div>

        <span
          className="nn-mono"
          style={{
            fontSize: 13, padding: '6px 12px', borderRadius: 'var(--nn-radius-pill)',
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {confidence}%
        </span>
      </div>

      <p style={{ color: 'var(--nn-text-secondary)', fontSize: 'var(--nn-fs-sm)', marginBottom: 4 }}>
        <strong style={{ color: 'var(--nn-text-primary)' }}>Cause: </strong>{cause}
      </p>
      <p style={{ color: 'var(--nn-text-secondary)', fontSize: 'var(--nn-fs-sm)', marginBottom: 18 }}>
        <strong style={{ color: 'var(--nn-text-primary)' }}>Recommendation: </strong>{recommendation}
      </p>

      <div style={{ borderTop: '1px solid var(--nn-border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <div>
            <small className="nn-text-tertiary" style={{ display: 'block', marginBottom: 2 }}>CPU</small>
            <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)' }}>{stats.cpu ?? '—'}%</strong>
          </div>
          <div>
            <small className="nn-text-tertiary" style={{ display: 'block', marginBottom: 2 }}>Memory</small>
            <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)' }}>{stats.memory ?? '—'}%</strong>
          </div>
          <div>
            <small className="nn-text-tertiary" style={{ display: 'block', marginBottom: 2 }}>Packet loss</small>
            <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)' }}>{stats.packet_loss ?? '—'}%</strong>
          </div>
        </div>
        <RadarScan size={40} color={color} />
      </div>
    </div>
  )
}
