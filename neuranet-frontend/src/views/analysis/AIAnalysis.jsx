import { useEffect, useMemo, useState } from 'react'
import {
  CContainer, CForm, CFormLabel, CFormInput, CRow, CCol, CButton, CSpinner,
  CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBolt, cilShieldAlt, cilWarning } from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import DataTable from '../../components/ui/DataTable'
import { analysisService } from '../../api/analysis'

// Exact field list from the backend PredictionRequest schema (app/ai/schemas.py) —
// every field the CNN-LSTM model requires, grouped the way the NSL-KDD feature
// set is conventionally documented, so nothing here is invented.
const FIELD_GROUPS = [
  {
    title: 'Basic Connection Features',
    fields: [
      { name: 'duration', type: 'int' },
      { name: 'protocol_type', type: 'text', placeholder: 'e.g. tcp' },
      { name: 'service', type: 'text', placeholder: 'e.g. private' },
      { name: 'flag', type: 'text', placeholder: 'e.g. SF' },
      { name: 'src_bytes', type: 'int' },
      { name: 'dst_bytes', type: 'int' },
      { name: 'land', type: 'binary' },
      { name: 'wrong_fragment', type: 'int' },
      { name: 'urgent', type: 'int' },
    ],
  },
  {
    title: 'Content Features',
    fields: [
      { name: 'hot', type: 'int' },
      { name: 'num_failed_logins', type: 'int' },
      { name: 'logged_in', type: 'binary' },
      { name: 'num_compromised', type: 'int' },
      { name: 'root_shell', type: 'binary' },
      { name: 'su_attempted', type: 'binary' },
      { name: 'num_root', type: 'int' },
      { name: 'num_file_creations', type: 'int' },
      { name: 'num_shells', type: 'int' },
      { name: 'num_access_files', type: 'int' },
      { name: 'num_outbound_cmds', type: 'int' },
      { name: 'is_host_login', type: 'binary' },
      { name: 'is_guest_login', type: 'binary' },
    ],
  },
  {
    title: 'Time-Based Traffic Features',
    fields: [
      { name: 'count', type: 'int' },
      { name: 'srv_count', type: 'int' },
      { name: 'serror_rate', type: 'rate' },
      { name: 'srv_serror_rate', type: 'rate' },
      { name: 'rerror_rate', type: 'rate' },
      { name: 'srv_rerror_rate', type: 'rate' },
      { name: 'same_srv_rate', type: 'rate' },
      { name: 'diff_srv_rate', type: 'rate' },
      { name: 'srv_diff_host_rate', type: 'rate' },
    ],
  },
  {
    title: 'Host-Based Traffic Features',
    fields: [
      { name: 'dst_host_count', type: 'int' },
      { name: 'dst_host_srv_count', type: 'int' },
      { name: 'dst_host_same_srv_rate', type: 'rate' },
      { name: 'dst_host_diff_srv_rate', type: 'rate' },
      { name: 'dst_host_same_src_port_rate', type: 'rate' },
      { name: 'dst_host_srv_diff_host_rate', type: 'rate' },
      { name: 'dst_host_serror_rate', type: 'rate' },
      { name: 'dst_host_srv_serror_rate', type: 'rate' },
      { name: 'dst_host_rerror_rate', type: 'rate' },
      { name: 'dst_host_srv_rerror_rate', type: 'rate' },
    ],
  },
]

const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields)

function buildInitialForm() {
  const form = {}
  ALL_FIELDS.forEach(({ name, type }) => { form[name] = type === 'text' ? '' : 0 })
  return form
}

function labelize(name) {
  return name.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function isBenign(prediction) {
  return (prediction || '').toLowerCase() !== 'attack'
}

function PredictionPill({ prediction, size = 'md' }) {
  const benign = isBenign(prediction)
  const color = benign ? 'var(--nn-sev-low)' : 'var(--nn-sev-critical)'
  const big = size === 'lg'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: big ? 10 : 6,
        padding: big ? '8px 18px' : '3px 10px',
        borderRadius: 'var(--nn-radius-pill)',
        fontSize: big ? 'var(--nn-fs-xl)' : 'var(--nn-fs-xs)',
        fontWeight: 700,
        letterSpacing: big ? 'normal' : '0.04em',
        textTransform: big ? 'none' : 'uppercase',
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

function renderField(field, value, onChange) {
  const common = { value, onChange: (e) => onChange(field, e.target.value) }
  if (field.type === 'binary') return <CFormInput type="number" min={0} max={1} step={1} {...common} />
  if (field.type === 'rate') return <CFormInput type="number" min={0} max={1} step={0.01} {...common} />
  if (field.type === 'int') return <CFormInput type="number" step={1} {...common} />
  return <CFormInput type="text" placeholder={field.placeholder} {...common} />
}

export default function AIAnalysis() {
  const [formData, setFormData] = useState(buildInitialForm())
  const [submitting, setSubmitting] = useState(false)
  const [predictError, setPredictError] = useState(null)
  const [result, setResult] = useState(null)

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)

  async function fetchHistory() {
    setHistoryError(null)
    try {
      const data = await analysisService.history()
      setHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setHistoryError('Unable to load prediction history. Check that the backend is running and try again.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  function handleChange(field, rawValue) {
    setFormData((prev) => ({
      ...prev,
      [field.name]: field.type === 'text' ? rawValue : (rawValue === '' ? '' : Number(rawValue)),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setPredictError(null)
    setResult(null)
    try {
      const payload = { ...formData }
      ALL_FIELDS.forEach(({ name, type }) => { if (type !== 'text' && payload[name] === '') payload[name] = 0 })

      const data = await analysisService.predict(payload)
      setResult(data)
      await fetchHistory()
    } catch (err) {
      console.error(err)
      setPredictError(err?.response?.data?.detail || 'Prediction request failed. Please check the inputs and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const latest = history.length > 0 ? history[0] : null

  const columns = useMemo(() => [
    { key: 'id', label: 'ID', sortable: true, width: 30 },
    { key: 'prediction', label: 'Prediction', sortable: true, render: (r) => <PredictionPill prediction={r.prediction} /> },
    { key: 'confidence', label: 'Confidence', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.confidence}%</span> },
    {
      key: 'created_at', label: 'Run At', sortable: true,
      render: (r) => <span className="nn-mono">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</span>,
    },
  ], [])

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>CNN-LSTM Intrusion Model</div>
            <h1 className="page-title">AI Analysis</h1>
            <p className="page-subtitle">Run a manual prediction against the detection model, and review every run it has made.</p>
          </div>
        </div>
      </div>

      {latest && (
        <GlassCard strong style={{ marginBottom: 24, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Latest Detection</div>
              <PredictionPill prediction={latest.prediction} size="lg" />
            </div>
            <div style={{ textAlign: 'end' }}>
              <div className="nn-eyebrow" style={{ marginBottom: 6 }}>Confidence</div>
              <div className="nn-mono" style={{ fontSize: 'var(--nn-fs-2xl)', fontWeight: 700, color: 'var(--nn-text-primary)' }}>
                {latest.confidence}%
              </div>
            </div>
            <div style={{ textAlign: 'end' }}>
              <div className="nn-eyebrow" style={{ marginBottom: 6 }}>Run At</div>
              <div className="nn-mono nn-text-secondary">{new Date(latest.created_at).toLocaleString()}</div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard style={{ marginBottom: 24 }}>
        <GlassCardHeader
          eyebrow="Manual run"
          title="Run Prediction"
          icon={<CIcon icon={cilBolt} size="lg" style={{ color: 'var(--nn-violet-500)' }} />}
        />
        <div style={{ padding: '18px 22px 22px' }}>
          {predictError && (
            <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)', display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <CIcon icon={cilWarning} size="sm" /> {predictError}
            </div>
          )}

          <CForm onSubmit={handleSubmit}>
            <CAccordion alwaysOpen>
              {FIELD_GROUPS.map((group) => (
                <CAccordionItem itemKey={group.title} key={group.title}>
                  <CAccordionHeader>{group.title}</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-3">
                      {group.fields.map((field) => (
                        <CCol md={3} sm={6} xs={12} key={field.name}>
                          <CFormLabel style={{ fontSize: 'var(--nn-fs-sm)' }}>{labelize(field.name)}</CFormLabel>
                          {renderField(field, formData[field.name], handleChange)}
                        </CCol>
                      ))}
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <CButton type="submit" color="primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {submitting && <CSpinner size="sm" />} Run Prediction
              </CButton>
            </div>
          </CForm>

          {result && (
            <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 'var(--nn-radius-md)', border: '1px solid var(--nn-border)', background: 'var(--nn-surface-hover)' }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div className="nn-eyebrow" style={{ marginBottom: 6 }}>Result</div>
                  <PredictionPill prediction={result.prediction} />
                </div>
                <div>
                  <div className="nn-eyebrow" style={{ marginBottom: 6 }}>Confidence</div>
                  <div className="nn-mono" style={{ fontSize: 'var(--nn-fs-lg)', color: 'var(--nn-text-primary)' }}>{result.confidence}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader
          eyebrow={`${history.length} total`}
          title="Prediction History"
          icon={<CIcon icon={cilShieldAlt} size="lg" style={{ color: 'var(--nn-signal-500)' }} />}
        />
        <DataTable
          columns={columns}
          rows={history}
          loading={historyLoading}
          error={historyError}
          searchPlaceholder="Search by prediction…"
          searchKeys={['prediction']}
          pageSize={10}
          emptyTitle="No predictions recorded"
          emptyBody="Every manual run, and every automatic detection while auto-save is on, will show up here."
        />
      </GlassCard>
    </CContainer>
  )
}
