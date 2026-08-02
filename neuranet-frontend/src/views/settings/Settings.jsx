import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CContainer, CForm, CFormLabel, CFormInput, CFormSelect, CFormSwitch,
  CFormFeedback, CButton, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSave, cilCog, cilShieldAlt, cilWarning, cilBellExclamation, cilRouter } from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import settingsService from '../../api/settings'

// A curated, common subset — the backend stores whatever string is sent,
// so this doesn't restrict anything the API would reject.
const TIMEZONES = [
  'UTC', 'Africa/Algiers', 'Africa/Cairo', 'Africa/Johannesburg',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney',
]

const emptyForm = {
  app_name: '',
  company_name: '',
  timezone: 'UTC',
  confidence_threshold: 0.3,
  auto_detect: true,
  auto_save_alerts: true,
  network_interface: '',
  capture_filter: '',
  auto_start_collector: false,
}

export default function Settings() {
  const [original, setOriginal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await settingsService.getSettings()
      setOriginal(res.data)
      setForm(res.data)
    } catch (err) {
      setLoadError(err?.response?.data?.detail || 'Unable to load settings. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const dirty = original && JSON.stringify(original) !== JSON.stringify(form)

  function validate(values) {
    const errs = {}
    if (!values.app_name?.trim()) errs.app_name = 'Application name is required.'
    if (!values.company_name?.trim()) errs.company_name = 'Company name is required.'
    const c = Number(values.confidence_threshold)
    if (Number.isNaN(c) || c < 0 || c > 1) errs.confidence_threshold = 'Must be between 0 and 1.'
    return errs
  }

  async function handleSave(e) {
    e.preventDefault()
    const errs = validate(form)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setSaveError(null)
    try {
      const payload = { ...form, confidence_threshold: Number(form.confidence_threshold) }
      const res = await settingsService.updateSettings(payload)
      setOriginal(res.data)
      setForm(res.data)
      setSaved(true)
    } catch (err) {
      setSaveError(err?.response?.data?.detail || 'Could not save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setForm(original)
    setFieldErrors({})
    setSaveError(null)
    setSaved(false)
  }

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong" style={{ marginBottom: 24 }}>
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Platform Configuration</div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Branding, detection sensitivity, and packet collector configuration.</p>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="nn-glass" role="alert" style={{ padding: '14px 20px', marginBottom: 20, color: 'var(--nn-sev-critical)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{loadError}</span>
          <CButton size="sm" color="danger" variant="ghost" onClick={load}>Retry</CButton>
        </div>
      )}

      {loading ? (
        <GlassCard><SkeletonCard lines={6} /></GlassCard>
      ) : !loadError && (
        <CForm onSubmit={handleSave}>
          {saveError && (
            <div className="nn-glass" style={{ padding: '14px 20px', marginBottom: 20, color: 'var(--nn-sev-critical)' }}>{saveError}</div>
          )}
          {saved && (
            <div className="nn-glass" style={{ padding: '14px 20px', marginBottom: 20, color: 'var(--nn-sev-low)' }}>Settings saved successfully.</div>
          )}

          {/* General / Branding */}
          <GlassCard style={{ marginBottom: 20 }}>
            <GlassCardHeader eyebrow="Identity" title="General" icon={<CIcon icon={cilCog} style={{ color: 'var(--nn-signal-500)' }} />} />
            <div style={{ padding: '18px 22px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <CFormLabel>Application name</CFormLabel>
                <CFormInput value={form.app_name} invalid={!!fieldErrors.app_name}
                  onChange={(e) => set('app_name', e.target.value)} />
                <CFormFeedback invalid={!!fieldErrors.app_name}>{fieldErrors.app_name}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>Company name</CFormLabel>
                <CFormInput value={form.company_name} invalid={!!fieldErrors.company_name}
                  onChange={(e) => set('company_name', e.target.value)} />
                <CFormFeedback invalid={!!fieldErrors.company_name}>{fieldErrors.company_name}</CFormFeedback>
              </div>
              <div>
                <CFormLabel>Timezone</CFormLabel>
                <CFormSelect value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </CFormSelect>
              </div>
            </div>
          </GlassCard>

          {/* Detection & AI */}
          <GlassCard style={{ marginBottom: 20 }}>
            <GlassCardHeader eyebrow="Reasoning engine" title="Detection & AI" icon={<CIcon icon={cilShieldAlt} style={{ color: 'var(--nn-violet-500)' }} />} />
            <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ maxWidth: 320 }}>
                <CFormLabel>Confidence threshold</CFormLabel>
                <CFormInput
                  type="number" min="0" max="1" step="0.01"
                  value={form.confidence_threshold}
                  invalid={!!fieldErrors.confidence_threshold}
                  onChange={(e) => set('confidence_threshold', e.target.value)}
                />
                <CFormFeedback invalid={!!fieldErrors.confidence_threshold}>{fieldErrors.confidence_threshold}</CFormFeedback>
                <small className="nn-text-secondary">Minimum probability (0–1) required before a flow is classified as an attack.</small>
              </div>

              <ToggleRow
                label="Auto Detect"
                description="Enable automatic AI-based traffic classification."
                checked={form.auto_detect}
                onChange={(v) => set('auto_detect', v)}
              />
            </div>
          </GlassCard>

          {/* Alerts */}
          <GlassCard style={{ marginBottom: 20 }}>
            <GlassCardHeader eyebrow="Notifications" title="Alerts" icon={<CIcon icon={cilBellExclamation} style={{ color: 'var(--nn-sev-medium)' }} />} />
            <div style={{ padding: '18px 22px 22px' }}>
              <ToggleRow
                label="Auto Save Alerts"
                description="Automatically persist detected attacks to the alerts table."
                checked={form.auto_save_alerts}
                onChange={(v) => set('auto_save_alerts', v)}
              />
            </div>
          </GlassCard>

          {/* Packet Collector */}
          <GlassCard style={{ marginBottom: 20 }}>
            <GlassCardHeader eyebrow="Data ingestion" title="Packet Collector" icon={<CIcon icon={cilRouter} style={{ color: 'var(--nn-cyan-500)' }} />} />
            <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <CFormLabel>Network interface</CFormLabel>
                  <CFormInput value={form.network_interface} onChange={(e) => set('network_interface', e.target.value)} placeholder="eth0" />
                </div>
                <div>
                  <CFormLabel>Capture filter</CFormLabel>
                  <CFormInput className="nn-mono" value={form.capture_filter} onChange={(e) => set('capture_filter', e.target.value)} placeholder="tcp port 443" />
                </div>
              </div>
              <ToggleRow
                label="Auto Start Collector"
                description="Start the packet collector automatically when the server boots."
                checked={form.auto_start_collector}
                onChange={(v) => set('auto_start_collector', v)}
              />
            </div>
          </GlassCard>

          {/* Data management cross-link, instead of duplicating destructive actions here */}
          <GlassCard style={{ marginBottom: 24, border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CIcon icon={cilWarning} style={{ color: 'var(--nn-sev-critical)' }} />
                <div>
                  <div style={{ color: 'var(--nn-text-primary)', fontWeight: 600, fontSize: 'var(--nn-fs-sm)' }}>Clearing devices, incidents, alerts, or AI data?</div>
                  <div className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-xs)' }}>Destructive data operations now live on the Maintenance page.</div>
                </div>
              </div>
              <CButton as={Link} to="/maintenance" color="secondary" variant="ghost">Go to Maintenance</CButton>
            </div>
          </GlassCard>

          <div style={{ position: 'sticky', bottom: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {dirty && (
              <CButton color="secondary" variant="ghost" onClick={handleReset} disabled={saving}>Discard changes</CButton>
            )}
            <CButton
              type="submit" color="primary" disabled={saving || !dirty}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {saving ? <CSpinner size="sm" /> : <CIcon icon={cilSave} size="sm" />} Save Settings
            </CButton>
          </div>
        </CForm>
      )}
    </CContainer>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
      <div>
        <div style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)', fontWeight: 600 }}>{label}</div>
        <div className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-xs)' }}>{description}</div>
      </div>
      <CFormSwitch checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ flexShrink: 0 }} />
    </div>
  )
}
