import { useEffect, useState } from 'react'
import { getSystemStatus } from '../../api/system'

export default function SystemIndicator() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getSystemStatus()
        if (!cancelled) setStatus(data)
      } catch {
        if (!cancelled) setStatus({ backend: false })
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  if (!status) return null

  const healthy = status.backend && status.database && status.ai_model
  const label = healthy ? 'All systems operational' : 'Degraded — check Maintenance'

  return (
    <div
      title={label}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}
    >
      <span
        className={`nn-dot ${healthy ? 'nn-dot-low' : 'nn-dot-critical'}`}
      />
      <span className="nn-text-secondary d-none d-md-inline" style={{ fontSize: 'var(--nn-fs-xs)', whiteSpace: 'nowrap' }}>
        {healthy ? 'Operational' : 'Degraded'}
      </span>
    </div>
  )
}
