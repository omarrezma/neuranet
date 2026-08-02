import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import { SkeletonCard } from './ui/Skeleton'

/**
 * SystemStatus
 * -----------------------------------------------------------------------
 * Same prop contract as before: { loading, system }. The previous version
 * read system.cpu / system.memory / system.uptime, but GET /system/status
 * never returns those fields — it returns:
 *   { backend, database, collector, ai_model, model_name, dataset, features }
 * This version reads the real fields so the panel reflects actual state
 * instead of always showing 0% / "Unknown".
 */
export default function SystemStatus({ loading = false, system = {} }) {
  if (loading) return <SkeletonCard lines={4} />

  const checks = [
    { label: 'API Backend', ok: !!system.backend },
    { label: 'Database', ok: !!system.database },
    { label: 'Packet Collector', ok: !!system.collector },
    { label: 'AI Model', ok: !!system.ai_model },
  ]

  const allHealthy = checks.every((c) => c.ok)

  return (
    <div style={{ padding: '4px 22px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 'var(--nn-radius-md)',
            background: allHealthy ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <CIcon
            icon={allHealthy ? cilCheckCircle : cilXCircle}
            size="lg"
            style={{ color: allHealthy ? 'var(--nn-sev-low)' : 'var(--nn-sev-critical)' }}
          />
        </div>
        <div>
          <div style={{ color: 'var(--nn-text-primary)', fontWeight: 600, fontSize: 'var(--nn-fs-lg)' }}>
            {allHealthy ? 'All systems operational' : 'Degraded — see below'}
          </div>
          <small className="nn-text-secondary">Live platform health</small>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--nn-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {checks.map((c) => (
          <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>{c.label}</span>
            <span
              className={`nn-dot ${c.ok ? 'nn-dot-low' : 'nn-dot-critical'}`}
              style={{ marginInlineEnd: 0 }}
              title={c.ok ? 'Online' : 'Offline'}
            />
          </div>
        ))}

        {(system.model_name || system.dataset) && (
          <div style={{ borderTop: '1px solid var(--nn-border)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>Model</span>
              <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)' }}>
                {system.model_name || '—'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>Trained on</span>
              <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)' }}>
                {system.dataset || '—'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>Features</span>
              <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)' }}>
                {system.features ?? '—'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
