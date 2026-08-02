import { useEffect, useMemo, useState } from 'react'
import {
  CContainer, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormFeedback, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilWarning } from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import DataTable from '../../components/ui/DataTable'
import { incidentService } from '../../api/incidents'

const emptyForm = {
  device_name: '',
  cpu: '',
  memory: '',
  packet_loss: '',
  interface_errors: '',
  timestamp: '',
}

function toLocalDatetimeInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function severityFromIncident(row) {
  // The /incidents endpoint has no severity field of its own — this mirrors
  // the same thresholds the backend's ReasoningEngine uses (reasoner.py),
  // so the color shown here is consistent with what the AI panel would say
  // about the same reading, without inventing a new field.
  if (row.cpu > 90 && row.packet_loss > 5) return { label: 'High congestion', color: 'var(--nn-sev-medium)' }
  if (row.interface_errors > 100) return { label: 'Interface errors', color: 'var(--nn-sev-high)' }
  return { label: 'Healthy', color: 'var(--nn-sev-low)' }
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setError(null)
    try {
      const data = await incidentService.list()
      setIncidents(data || [])
    } catch (err) {
      console.error(err)
      setError('Unable to load incidents. Check that the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openForm() {
    setForm({ ...emptyForm, timestamp: toLocalDatetimeInputValue(new Date()) })
    setFormErrors({})
    setSubmitError(null)
    setShowForm(true)
  }

  function validate(values) {
    const errs = {}
    if (!values.device_name.trim()) errs.device_name = 'Device name is required.'
    for (const key of ['cpu', 'memory', 'packet_loss']) {
      const n = Number(values[key])
      if (values[key] === '' || Number.isNaN(n)) errs[key] = 'Enter a number.'
      else if (n < 0 || n > 100) errs[key] = 'Must be between 0 and 100.'
    }
    const errN = Number(values.interface_errors)
    if (values.interface_errors === '' || Number.isNaN(errN) || errN < 0) {
      errs.interface_errors = 'Enter a non-negative integer.'
    }
    if (!values.timestamp) errs.timestamp = 'Timestamp is required.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await incidentService.create({
        device_name: form.device_name.trim(),
        cpu: Number(form.cpu),
        memory: Number(form.memory),
        packet_loss: Number(form.packet_loss),
        interface_errors: Number(form.interface_errors),
        timestamp: new Date(form.timestamp).toISOString(),
      })
      setShowForm(false)
      await load()
    } catch (err) {
      console.error(err)
      setSubmitError(err?.response?.data?.detail || 'Could not log the incident. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await incidentService.remove(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch (err) {
      console.error(err)
      setError('Could not delete that incident. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(() => [
    { key: 'id', label: 'ID', sortable: true, width: 30 },
    {
      key: 'device_name', label: 'Device', sortable: true,
      render: (row) => {
        const sev = severityFromIncident(row)
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="nn-dot" style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}` }} title={sev.label} />
            {row.device_name}
          </span>
        )
      },
    },
    { key: 'cpu', label: 'CPU', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.cpu}%</span> },
    { key: 'memory', label: 'Memory', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.memory}%</span> },
    { key: 'packet_loss', label: 'Packet loss', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.packet_loss}%</span> },
    { key: 'interface_errors', label: 'Iface errors', sortable: true, align: 'end', render: (r) => <span className="nn-mono">{r.interface_errors}</span> },
    {
      key: 'timestamp', label: 'Timestamp', sortable: true,
      render: (r) => <span className="nn-mono">{new Date(r.timestamp).toLocaleString()}</span>,
    },
    {
      key: 'actions', label: '', align: 'end', nowrap: false,
      render: (row) => (
        <CButton size="sm" color="danger" variant="ghost" onClick={() => setPendingDelete(row)} aria-label={`Delete incident ${row.id}`}>
          <CIcon icon={cilTrash} size="sm" />
        </CButton>
      ),
    },
  ], [])

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Incident Management</div>
            <h1 className="page-title">Incidents</h1>
            <p className="page-subtitle">Every device reading captured for investigation, with the ability to log new ones manually.</p>
          </div>
          <CButton color="primary" onClick={openForm} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CIcon icon={cilPlus} size="sm" /> Log Incident
          </CButton>
        </div>
      </div>

      <GlassCard>
        <GlassCardHeader eyebrow={`${incidents.length} total`} title="All Incidents" />
        <DataTable
          columns={columns}
          rows={incidents}
          loading={loading}
          error={error}
          searchPlaceholder="Search by device…"
          searchKeys={['device_name']}
          pageSize={10}
          emptyTitle="No incidents logged"
          emptyBody="Incidents captured by the collector, or logged manually, will show up here."
        />
      </GlassCard>

      {/* Log incident modal */}
      <CModal visible={showForm} onClose={() => setShowForm(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Log Incident</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {submitError && (
              <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <CIcon icon={cilWarning} size="sm" /> {submitError}
              </div>
            )}

            <div>
              <CFormLabel>Device name</CFormLabel>
              <CFormInput
                value={form.device_name}
                invalid={!!formErrors.device_name}
                onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                placeholder="core-switch-01"
              />
              <CFormFeedback invalid={!!formErrors.device_name}>{formErrors.device_name}</CFormFeedback>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <CFormLabel>CPU (%)</CFormLabel>
                <CFormInput type="number" min="0" max="100" value={form.cpu} invalid={!!formErrors.cpu}
                  onChange={(e) => setForm({ ...form, cpu: e.target.value })} />
                <CFormFeedback invalid={!!formErrors.cpu}>{formErrors.cpu}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>Memory (%)</CFormLabel>
                <CFormInput type="number" min="0" max="100" value={form.memory} invalid={!!formErrors.memory}
                  onChange={(e) => setForm({ ...form, memory: e.target.value })} />
                <CFormFeedback invalid={!!formErrors.memory}>{formErrors.memory}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>Packet loss (%)</CFormLabel>
                <CFormInput type="number" min="0" max="100" value={form.packet_loss} invalid={!!formErrors.packet_loss}
                  onChange={(e) => setForm({ ...form, packet_loss: e.target.value })} />
                <CFormFeedback invalid={!!formErrors.packet_loss}>{formErrors.packet_loss}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>Interface errors</CFormLabel>
                <CFormInput type="number" min="0" step="1" value={form.interface_errors} invalid={!!formErrors.interface_errors}
                  onChange={(e) => setForm({ ...form, interface_errors: e.target.value })} />
                <CFormFeedback invalid={!!formErrors.interface_errors}>{formErrors.interface_errors}</CFormFeedback>
              </div>
            </div>

            <div>
              <CFormLabel>Timestamp</CFormLabel>
              <CFormInput type="datetime-local" value={form.timestamp} invalid={!!formErrors.timestamp}
                onChange={(e) => setForm({ ...form, timestamp: e.target.value })} />
              <CFormFeedback invalid={!!formErrors.timestamp}>{formErrors.timestamp}</CFormFeedback>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {submitting && <CSpinner size="sm" />} Log Incident
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete confirmation */}
      <CModal visible={!!pendingDelete} onClose={() => setPendingDelete(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Delete incident?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          This permanently removes the incident record for{' '}
          <strong>{pendingDelete?.device_name}</strong> logged at{' '}
          {pendingDelete && new Date(pendingDelete.timestamp).toLocaleString()}. This can't be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>Cancel</CButton>
          <CButton color="danger" onClick={confirmDelete} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {deleting && <CSpinner size="sm" />} Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}
