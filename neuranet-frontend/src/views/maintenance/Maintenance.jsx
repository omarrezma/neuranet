import { useCallback, useEffect, useState } from 'react'
import { CContainer, CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTrash, cilDevices, cilBug, cilWarning, cilShieldAlt,
  cilReload, cilCheckCircle, cilXCircle,
} from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import ConfirmDangerModal from '../../components/ui/ConfirmDangerModal'
import { SkeletonLine } from '../../components/ui/Skeleton'

import { deviceService } from '../../api/devices'
import { incidentService } from '../../api/incidents'
import { alertService } from '../../api/alerts'
import { getSystemStatus } from '../../api/system'
import { maintenanceService } from '../../api/maintenance'

// One entry per /maintenance/{entity} endpoint. `count` is fetched live from
// each entity's own list endpoint so the number shown is always real.
const ENTITIES = [
  { key: 'devices', label: 'Devices', icon: cilDevices, clear: 'clearDevices', phrase: 'CLEAR DEVICES' },
  { key: 'incidents', label: 'Incidents', icon: cilBug, clear: 'clearIncidents', phrase: 'CLEAR INCIDENTS' },
  { key: 'alerts', label: 'Alerts', icon: cilWarning, clear: 'clearAlerts', phrase: 'CLEAR ALERTS' },
  { key: 'predictions', label: 'AI Predictions', icon: cilShieldAlt, clear: 'clearPredictions', phrase: 'CLEAR PREDICTIONS' },
]

export default function Maintenance() {
  const [system, setSystem] = useState({})
  const [systemLoading, setSystemLoading] = useState(true)

  const [counts, setCounts] = useState({})
  const [countsLoading, setCountsLoading] = useState(true)

  const [target, setTarget] = useState(null) // the ENTITIES row currently being confirmed, or 'all'
  const [working, setWorking] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [banner, setBanner] = useState(null)

  const loadHealth = useCallback(async () => {
    setSystemLoading(true)
    try {
      setSystem(await getSystemStatus())
    } catch (err) {
      console.error(err)
    } finally {
      setSystemLoading(false)
    }
  }, [])

  const loadCounts = useCallback(async () => {
    setCountsLoading(true)
    try {
      const [devices, incidents, alerts] = await Promise.all([
        deviceService.list(),
        incidentService.list(),
        alertService.list({ limit: 100 }),
      ])
      setCounts({
        devices: devices?.length ?? 0,
        incidents: incidents?.length ?? 0,
        // /alerts/ caps at 100 server-side, so 100 means "100 or more", not exactly 100.
        alerts: alerts?.length === 100 ? '100+' : (alerts?.length ?? 0),
        predictions: null, // backend has no list endpoint for predictions, so no honest count to show
      })
    } catch (err) {
      console.error(err)
    } finally {
      setCountsLoading(false)
    }
  }, [])

  useEffect(() => { loadHealth(); loadCounts() }, [loadHealth, loadCounts])

  async function runClear() {
    if (!target) return
    setWorking(true)
    setActionError(null)
    try {
      let result
      if (target === 'all') {
        result = await maintenanceService.clearAll()
        setBanner(`Cleared all application data — ${result.devices} devices, ${result.incidents} incidents, ${result.alerts} alerts, ${result.predictions} predictions removed.`)
      } else {
        result = await maintenanceService[target.clear]()
        setBanner(`${result.message} (${result.deleted} record${result.deleted === 1 ? '' : 's'} removed).`)
      }
      setTarget(null)
      await loadCounts()
    } catch (err) {
      setActionError(err?.response?.data?.detail || 'That operation failed. Please try again.')
    } finally {
      setWorking(false)
    }
  }

  const healthChecks = [
    { label: 'API Backend', ok: !!system.backend },
    { label: 'Database', ok: !!system.database },
    { label: 'Packet Collector', ok: !!system.collector },
    { label: 'AI Model', ok: !!system.ai_model },
  ]

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Platform Operations</div>
            <h1 className="page-title">Maintenance</h1>
            <p className="page-subtitle">System diagnostics and destructive data-management tools. Every action below is irreversible.</p>
          </div>
          <CButton color="secondary" variant="ghost" onClick={() => { loadHealth(); loadCounts() }} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CIcon icon={cilReload} size="sm" /> Refresh
          </CButton>
        </div>
      </div>

      {banner && (
        <div className="nn-glass" style={{ padding: '14px 20px', marginBottom: 20, color: 'var(--nn-sev-low)', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CIcon icon={cilCheckCircle} size="sm" /> {banner}
          </span>
          <button onClick={() => setBanner(null)} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* System diagnostics */}
      <GlassCard style={{ marginBottom: 24 }}>
        <GlassCardHeader eyebrow="Live diagnostics" title="System Health" />
        <div style={{ padding: '18px 22px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {healthChecks.map((c) => (
            <div key={c.label} className="nn-glass" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {systemLoading ? (
                <SkeletonLine width={20} height={20} style={{ borderRadius: '50%' }} />
              ) : (
                <CIcon
                  icon={c.ok ? cilCheckCircle : cilXCircle}
                  style={{ color: c.ok ? 'var(--nn-sev-low)' : 'var(--nn-sev-critical)', flexShrink: 0 }}
                />
              )}
              <div>
                <div style={{ fontSize: 'var(--nn-fs-sm)', color: 'var(--nn-text-primary)', fontWeight: 600 }}>{c.label}</div>
                <div className="nn-text-tertiary" style={{ fontSize: 'var(--nn-fs-xs)' }}>{systemLoading ? '—' : (c.ok ? 'Online' : 'Offline')}</div>
              </div>
            </div>
          ))}
        </div>
        {!systemLoading && (system.model_name || system.dataset) && (
          <div style={{ padding: '0 22px 22px', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <MetaField label="Model" value={system.model_name} />
            <MetaField label="Trained on" value={system.dataset} />
            <MetaField label="Features" value={system.features} />
          </div>
        )}
      </GlassCard>

      {/* Data management */}
      <GlassCard style={{ marginBottom: 24 }}>
        <GlassCardHeader eyebrow="Bulk operations" title="Data Management" />
        <div style={{ padding: '18px 22px 22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {ENTITIES.map((ent) => (
            <div key={ent.key} className="nn-glass" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CIcon icon={ent.icon} style={{ color: 'var(--nn-signal-500)' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--nn-text-primary)', fontWeight: 600, fontSize: 'var(--nn-fs-sm)' }}>{ent.label}</div>
                  <div className="nn-mono nn-text-secondary" style={{ fontSize: 'var(--nn-fs-xs)' }}>
                    {countsLoading
                      ? <SkeletonLine width={40} height={10} />
                      : (counts[ent.key] === null ? 'count unavailable' : `${counts[ent.key]} records`)}
                  </div>
                </div>
              </div>
              <CButton
                size="sm" color="danger" variant="ghost"
                onClick={() => setTarget(ent)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
              >
                <CIcon icon={cilTrash} size="sm" /> Clear {ent.label}
              </CButton>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard strong style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
        <GlassCardHeader
          eyebrow="Irreversible"
          title="Danger Zone"
          icon={<CIcon icon={cilWarning} style={{ color: 'var(--nn-sev-critical)' }} />}
        />
        <div style={{ padding: '18px 22px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: '48ch' }}>
            <div style={{ color: 'var(--nn-text-primary)', fontWeight: 600, marginBottom: 4 }}>Clear all application data</div>
            <p className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)', margin: 0 }}>
              Wipes every device, incident, alert, and AI prediction from the database in one operation. There is no undo.
            </p>
          </div>
          <CButton color="danger" onClick={() => setTarget('all')} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CIcon icon={cilTrash} size="sm" /> Clear All Data
          </CButton>
        </div>
      </GlassCard>

      <ConfirmDangerModal
        visible={!!target}
        onClose={() => { setTarget(null); setActionError(null) }}
        onConfirm={runClear}
        loading={working}
        error={actionError}
        title={target === 'all' ? 'Clear all application data?' : `Clear all ${target?.label.toLowerCase()}?`}
        description={
          target === 'all'
            ? 'This permanently deletes every device, incident, alert, and AI prediction in the database.'
            : `This permanently deletes every ${target?.label.toLowerCase()} record in the database.`
        }
        confirmPhrase={target === 'all' ? 'DELETE ALL DATA' : target?.phrase}
        confirmLabel={target === 'all' ? 'Clear All Data' : `Clear ${target?.label}`}
      />
    </CContainer>
  )
}

function MetaField({ label, value }) {
  return (
    <div>
      <div className="nn-eyebrow" style={{ marginBottom: 3 }}>{label}</div>
      <div className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)', fontWeight: 600 }}>{value ?? '—'}</div>
    </div>
  )
}
