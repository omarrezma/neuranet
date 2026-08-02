import { useEffect, useMemo, useState } from 'react'
import {
  CContainer, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormSelect, CFormLabel, CFormFeedback, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilPencil, cilWarning, cilDevices } from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import DataTable from '../../components/ui/DataTable'
import { deviceService } from '../../api/devices'

// Same dropdown vocabulary the old frontend used for these two fields —
// carried over as-is rather than invented, since the backend stores them
// as free-form strings and has no enum of its own.
const DEVICE_TYPES = ['ROUTER', 'SWITCH', 'SERVER', 'PC']
const STATUSES = ['ONLINE', 'OFFLINE', 'WARNING']

const emptyForm = {
  hostname: '',
  ip_address: '',
  mac_address: '',
  vendor: '',
  device_type: 'ROUTER',
  status: 'ONLINE',
}

function severityFromStatus(status) {
  const s = (status || '').toLowerCase()
  if (s === 'online' || s === 'active') return { key: 'low', label: 'Online' }
  if (s === 'offline' || s === 'inactive') return { key: 'critical', label: 'Offline' }
  if (s === 'warning' || s === 'unknown') return { key: 'medium', label: 'Warning' }
  return { key: 'info', label: status || 'Unknown' }
}

function StatusPill({ status }) {
  const sev = severityFromStatus(status)
  const color = `var(--nn-sev-${sev.key})`
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
      <span className={`nn-dot nn-dot-${sev.key}`} />
      {sev.label}
    </span>
  )
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setError(null)
    try {
      const data = await deviceService.list()
      setDevices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Unable to load devices. Check that the backend is running and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const counts = useMemo(() => {
    const c = { online: 0, offline: 0, warning: 0 }
    for (const d of devices) {
      const s = (d.status || '').toLowerCase()
      if (s === 'online' || s === 'active') c.online += 1
      else if (s === 'offline' || s === 'inactive') c.offline += 1
      else if (s === 'warning' || s === 'unknown') c.warning += 1
    }
    return c
  }, [devices])

  function openCreate() {
    setFormMode('create')
    setForm(emptyForm)
    setEditingId(null)
    setFormErrors({})
    setSubmitError(null)
    setShowForm(true)
  }

  function openEdit(device) {
    setFormMode('edit')
    setForm({
      hostname: device.hostname || '',
      ip_address: device.ip_address || '',
      mac_address: device.mac_address || '',
      vendor: device.vendor || '',
      device_type: device.device_type || 'ROUTER',
      status: device.status || 'ONLINE',
    })
    setEditingId(device.id)
    setFormErrors({})
    setSubmitError(null)
    setShowForm(true)
  }

  function validate(values) {
    const errs = {}
    if (!values.hostname.trim()) errs.hostname = 'Hostname is required.'
    if (!values.ip_address.trim()) {
      errs.ip_address = 'IP address is required.'
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(values.ip_address.trim())) {
      errs.ip_address = 'Enter a valid IPv4 address.'
    }
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
      const payload = {
        hostname: form.hostname.trim(),
        ip_address: form.ip_address.trim(),
        mac_address: form.mac_address.trim() || 'Unknown',
        vendor: form.vendor.trim() || 'Unknown',
        device_type: form.device_type,
        status: form.status,
      }
      if (formMode === 'create') {
        await deviceService.create(payload)
      } else {
        await deviceService.update(editingId, payload)
      }
      setShowForm(false)
      await load()
    } catch (err) {
      console.error(err)
      setSubmitError(err?.response?.data?.detail || 'Could not save the device. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deviceService.remove(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch (err) {
      console.error(err)
      setError('Could not delete that device. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo(() => [
    {
      key: 'hostname', label: 'Hostname', sortable: true,
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className={`nn-dot nn-dot-${severityFromStatus(row.status).key}`}
            title={severityFromStatus(row.status).label}
          />
          {row.hostname}
        </span>
      ),
    },
    { key: 'ip_address', label: 'IP Address', sortable: true, render: (r) => <span className="nn-mono">{r.ip_address}</span> },
    { key: 'mac_address', label: 'MAC Address', sortable: true, render: (r) => <span className="nn-mono">{r.mac_address}</span> },
    { key: 'vendor', label: 'Vendor', sortable: true },
    { key: 'device_type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'last_seen', label: 'Last Seen', sortable: true,
      render: (r) => <span className="nn-mono">{r.last_seen ? new Date(r.last_seen).toLocaleString() : '—'}</span>,
    },
    {
      key: 'actions', label: '', align: 'end', nowrap: false,
      render: (row) => (
        <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <CButton size="sm" color="secondary" variant="ghost" onClick={() => openEdit(row)} aria-label={`Edit ${row.hostname}`}>
            <CIcon icon={cilPencil} size="sm" />
          </CButton>
          <CButton size="sm" color="danger" variant="ghost" onClick={() => setPendingDelete(row)} aria-label={`Delete ${row.hostname}`}>
            <CIcon icon={cilTrash} size="sm" />
          </CButton>
        </span>
      ),
    },
  ], [])

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Network Inventory</div>
            <h1 className="page-title">Devices</h1>
            <p className="page-subtitle">Every host discovered on the network, with live status and the ability to manage inventory manually.</p>
          </div>
          <CButton color="primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <CIcon icon={cilPlus} size="sm" /> Add Device
          </CButton>
        </div>
      </div>

      <GlassCard>
        <GlassCardHeader
          eyebrow={`${devices.length} total`}
          title="All Devices"
          icon={<CIcon icon={cilDevices} size="lg" style={{ color: 'var(--nn-signal-500)' }} />}
        />
        <DataTable
          columns={columns}
          rows={devices}
          loading={loading}
          error={error}
          searchPlaceholder="Search by hostname, IP, MAC, vendor…"
          searchKeys={['hostname', 'ip_address', 'mac_address', 'vendor', 'device_type', 'status']}
          pageSize={10}
          emptyTitle="No devices found"
          emptyBody="Devices discovered by the collector, or added manually, will show up here."
          toolbarRight={
            <span style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 'var(--nn-fs-sm)' }}>
              <span className="nn-text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="nn-dot nn-dot-low" /> {counts.online} online
              </span>
              <span className="nn-text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="nn-dot nn-dot-medium" /> {counts.warning} warning
              </span>
              <span className="nn-text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="nn-dot nn-dot-critical" /> {counts.offline} offline
              </span>
            </span>
          }
        />
      </GlassCard>

      {/* Create / Edit modal */}
      <CModal visible={showForm} onClose={() => setShowForm(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>{formMode === 'create' ? 'Add Device' : 'Update Device'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {submitError && (
              <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <CIcon icon={cilWarning} size="sm" /> {submitError}
              </div>
            )}

            <div>
              <CFormLabel>Hostname</CFormLabel>
              <CFormInput
                value={form.hostname}
                invalid={!!formErrors.hostname}
                onChange={(e) => setForm({ ...form, hostname: e.target.value })}
                placeholder="core-switch-01"
              />
              <CFormFeedback invalid={!!formErrors.hostname}>{formErrors.hostname}</CFormFeedback>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <CFormLabel>IP Address</CFormLabel>
                <CFormInput
                  value={form.ip_address}
                  invalid={!!formErrors.ip_address}
                  onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                  placeholder="10.0.0.1"
                />
                <CFormFeedback invalid={!!formErrors.ip_address}>{formErrors.ip_address}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>MAC Address</CFormLabel>
                <CFormInput
                  value={form.mac_address}
                  onChange={(e) => setForm({ ...form, mac_address: e.target.value })}
                  placeholder="Unknown"
                />
              </div>
            </div>

            <div>
              <CFormLabel>Vendor</CFormLabel>
              <CFormInput
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                placeholder="Unknown"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <CFormLabel>Device Type</CFormLabel>
                <CFormSelect
                  value={form.device_type}
                  onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                >
                  {DEVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </CFormSelect>
              </div>
              <div>
                <CFormLabel>Status</CFormLabel>
                <CFormSelect
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </CFormSelect>
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {submitting && <CSpinner size="sm" />} {formMode === 'create' ? 'Add Device' : 'Save Changes'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete confirmation */}
      <CModal visible={!!pendingDelete} onClose={() => setPendingDelete(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Delete device?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          This permanently removes <strong>{pendingDelete?.hostname}</strong> ({pendingDelete?.ip_address}) from inventory. This can't be undone.
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
