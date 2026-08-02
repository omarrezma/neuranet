import { useEffect, useMemo, useState } from 'react'
import {
  CContainer, CButton, CFormSelect, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilShieldAlt } from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import DataTable from '../../components/ui/DataTable'
import { alertService } from '../../api/alerts'

function isBenign(prediction) {
  const p = (prediction || '').toLowerCase()
  return p === 'normal' || p === 'benign'
}

function PredictionPill({ prediction }) {
  const benign = isBenign(prediction)
  const color = benign ? 'var(--nn-sev-low)' : 'var(--nn-sev-critical)'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--nn-radius-pill)',
        fontSize: 'var(--nn-fs-xs)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      <span className={`nn-dot ${benign ? 'nn-dot-low' : 'nn-dot-critical'}`} />
      {prediction || 'Unknown'}
    </span>
  )
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${(Number(value) * 100).toFixed(1)}%`
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [predictionFilter, setPredictionFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  async function load() {
    setError(null)
    try {
      const data = await alertService.list({ limit: 100 })
      setAlerts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Unable to load alerts. Check that the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const predictionOptions = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.prediction).filter(Boolean))),
    [alerts],
  )

  const filteredAlerts = useMemo(() => {
    if (predictionFilter === 'all') return alerts
    return alerts.filter((a) => a.prediction === predictionFilter)
  }, [alerts, predictionFilter])

  const attackCount = useMemo(() => alerts.filter((a) => !isBenign(a.prediction)).length, [alerts])

  const columns = useMemo(() => [
    {
      key: 'timestamp', label: 'Timestamp', sortable: true,
      render: (r) => <span className="nn-mono">{r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</span>,
    },
    { key: 'src_ip', label: 'Source IP', sortable: true, render: (r) => <span className="nn-mono">{r.src_ip}</span> },
    { key: 'src_port', label: 'Src Port', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.src_port}</span> },
    { key: 'dst_ip', label: 'Destination IP', sortable: true, render: (r) => <span className="nn-mono">{r.dst_ip}</span> },
    { key: 'dst_port', label: 'Dst Port', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.dst_port}</span> },
    { key: 'protocol', label: 'Protocol', sortable: true },
    { key: 'prediction', label: 'Prediction', sortable: true, render: (r) => <PredictionPill prediction={r.prediction} /> },
    { key: 'confidence', label: 'Confidence', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{formatPercent(r.confidence)}</span> },
    { key: 'probability', label: 'Probability', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{formatPercent(r.probability)}</span> },
  ], [])

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Threat Detection</div>
            <h1 className="page-title">Alerts</h1>
            <p className="page-subtitle">Every flow the AI model has scored, ranked by most recent. Click a row for the full detection detail.</p>
          </div>
          <CButton color="secondary" variant="outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CIcon icon={cilReload} size="sm" /> Refresh
          </CButton>
        </div>
      </div>

      <GlassCard>
        <GlassCardHeader
          eyebrow={`${attackCount} flagged of ${alerts.length}`}
          title="All Alerts"
          icon={<CIcon icon={cilShieldAlt} size="lg" style={{ color: 'var(--nn-sev-critical)' }} />}
          action={
            <CFormSelect
              size="sm"
              style={{ width: 180 }}
              value={predictionFilter}
              onChange={(e) => setPredictionFilter(e.target.value)}
            >
              <option value="all">All predictions</option>
              {predictionOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </CFormSelect>
          }
        />
        <DataTable
          columns={columns}
          rows={filteredAlerts}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          searchPlaceholder="Search by IP, port, or protocol…"
          searchKeys={['src_ip', 'dst_ip', 'protocol', 'prediction', 'src_port', 'dst_port']}
          pageSize={10}
          emptyTitle="No alerts recorded"
          emptyBody="Flows scored by the AI model will show up here as the collector runs."
          onRowClick={(row) => setSelected(row)}
        />
      </GlassCard>

      {/* Row detail — clicking any row opens this, same info the old Alerts page surfaced */}
      <CModal visible={!!selected} onClose={() => setSelected(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Alert Detail</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 'var(--nn-fs-sm)' }}>
              <DetailField label="ID" value={selected.id} />
              <DetailField label="Timestamp" value={new Date(selected.timestamp).toLocaleString()} />
              <DetailField label="Source IP" value={selected.src_ip} mono />
              <DetailField label="Source Port" value={selected.src_port} mono />
              <DetailField label="Destination IP" value={selected.dst_ip} mono />
              <DetailField label="Destination Port" value={selected.dst_port} mono />
              <DetailField label="Protocol" value={selected.protocol} />
              <DetailField label="Prediction" value={<PredictionPill prediction={selected.prediction} />} />
              <DetailField label="Confidence" value={formatPercent(selected.confidence)} mono />
              <DetailField label="Probability" value={formatPercent(selected.probability)} mono />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setSelected(null)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

function DetailField({ label, value, mono }) {
  return (
    <div>
      <div className="nn-eyebrow" style={{ marginBottom: 3 }}>{label}</div>
      <div className={mono ? 'nn-mono' : ''} style={{ color: 'var(--nn-text-primary)' }}>{value ?? '—'}</div>
    </div>
  )
}
