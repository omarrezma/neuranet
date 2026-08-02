import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CDropdown, CDropdownToggle, CDropdownMenu, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'
import { alertService } from '../../api/alerts'

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${(Number(value) * 100).toFixed(1)}%`
}

export default function NotificationsMenu() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await alertService.list({ limit: 6 })
      setAlerts(data || [])
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false} className="py-0" style={{ position: 'relative' }}>
        <CIcon icon={cilBell} size="lg" />
        {alerts.length > 0 && (
          <CBadge
            color="danger" shape="rounded-pill"
            style={{ position: 'absolute', top: 2, insetInlineEnd: 0, fontSize: 9, padding: '2px 5px' }}
          >
            {alerts.length}
          </CBadge>
        )}
      </CDropdownToggle>
      <CDropdownMenu className="nn-glass-strong" style={{ width: 340, padding: 8, border: 'none' }}>
        <div className="nn-eyebrow" style={{ padding: '8px 10px' }}>Recent Alerts</div>

        {loading && (
          <div className="nn-text-secondary" style={{ padding: '10px', fontSize: 'var(--nn-fs-sm)' }}>Loading…</div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="nn-text-secondary" style={{ padding: '10px', fontSize: 'var(--nn-fs-sm)' }}>No recent alerts.</div>
        )}

        {!loading && alerts.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate('/alerts')}
            style={{
              display: 'flex', flexDirection: 'column', gap: 2, width: '100%', textAlign: 'left',
              padding: '10px 10px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer',
              borderBottom: '1px solid var(--nn-border)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--nn-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--nn-text-primary)', fontWeight: 600, fontSize: 'var(--nn-fs-sm)' }}>{a.prediction || 'Detection'}</span>
              <span className="nn-text-tertiary" style={{ fontSize: 'var(--nn-fs-xs)' }}>{timeAgo(a.timestamp)}</span>
            </div>
            <span className="nn-mono nn-text-secondary" style={{ fontSize: 'var(--nn-fs-xs)' }}>
              {a.src_ip} → {a.dst_ip} · {formatPercent(a.confidence)} confidence
            </span>
          </button>
        ))}

        <button
          onClick={() => navigate('/alerts')}
          style={{
            width: '100%', padding: '10px', marginTop: 4, background: 'none', border: 'none',
            color: 'var(--nn-signal-400)', fontSize: 'var(--nn-fs-sm)', fontWeight: 600, cursor: 'pointer',
          }}
        >
          View all alerts
        </button>
      </CDropdownMenu>
    </CDropdown>
  )
}
