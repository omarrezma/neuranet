import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton, CForm, CFormInput, CFormLabel, CFormFeedback,
  CInputGroup, CInputGroupText, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeClosed, cilCheckCircle } from '@coreui/icons'

import '../../../styles/theme.css'
import CircuitBackground from '../../../components/svg/CircuitBackground'
import NetworkTopology from '../../../components/svg/NetworkTopology'
import authService from '../../../api/auth'

const emptyForm = { username: '', email: '', password: '', confirmPassword: '' }

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(values) {
    const errs = {}
    if (!values.username.trim()) errs.username = 'Username is required.'
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = 'Enter a valid email address.'
    if (values.password.length < 8) errs.password = 'Use at least 8 characters.'
    if (values.confirmPassword !== values.password) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      await authService.register(form.username.trim(), form.email.trim(), form.password)
      setDone(true)
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      // The backend doesn't return a clean validation message for a
      // duplicate username/email (it surfaces as a raw 500), so fall back
      // to an honest, generic explanation rather than showing a stack trace.
      setSubmitError(
        err?.response?.data?.detail || 'Could not create that account — the username or email may already be taken.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--nn-bg-0)',
        backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(59,130,246,0.12), transparent 45%), radial-gradient(circle at 90% 80%, rgba(139,124,246,0.09), transparent 40%)',
        padding: 20,
      }}
    >
      <div
        className="nn-glass-strong nn-auth-split"
        style={{ width: '100%', maxWidth: 920, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}
      >
        <div className="nn-auth-form" style={{ padding: '48px 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#3B82F6,#8B7CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>N</div>
            <div style={{ color: 'var(--nn-text-primary)', fontWeight: 700, fontSize: 18 }}>NeuraNet</div>
          </div>

          {done ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CIcon icon={cilCheckCircle} size="3xl" style={{ color: 'var(--nn-sev-low)', marginBottom: 16 }} />
              <h2 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-xl)', fontWeight: 700, marginBottom: 6 }}>Account created</h2>
              <p className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>Taking you to sign in…</p>
            </div>
          ) : (
            <>
              <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Get started</div>
              <h1 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-2xl)', fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
              <p className="nn-text-secondary" style={{ marginBottom: 28, fontSize: 'var(--nn-fs-sm)' }}>Set up access to the NeuraNet security console.</p>

              <CForm onSubmit={handleSubmit}>
                {submitError && (
                  <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)', marginBottom: 16 }}>{submitError}</div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <CFormLabel>Username</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                      <CIcon icon={cilUser} style={{ color: 'var(--nn-text-tertiary)' }} />
                    </CInputGroupText>
                    <CFormInput
                      value={form.username}
                      invalid={!!errors.username}
                      onChange={(e) => set('username', e.target.value)}
                      autoComplete="username"
                      placeholder="jane.doe"
                      autoFocus
                    />
                  </CInputGroup>
                  <CFormFeedback invalid={!!errors.username}>{errors.username}</CFormFeedback>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <CFormLabel>Email</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                      <CIcon icon={cilEnvelopeClosed} style={{ color: 'var(--nn-text-tertiary)' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      value={form.email}
                      invalid={!!errors.email}
                      onChange={(e) => set('email', e.target.value)}
                      autoComplete="email"
                      placeholder="jane@company.com"
                    />
                  </CInputGroup>
                  <CFormFeedback invalid={!!errors.email}>{errors.email}</CFormFeedback>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <CFormLabel>Password</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                      <CIcon icon={cilLockLocked} style={{ color: 'var(--nn-text-tertiary)' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      value={form.password}
                      invalid={!!errors.password}
                      onChange={(e) => set('password', e.target.value)}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                    />
                  </CInputGroup>
                  <CFormFeedback invalid={!!errors.password}>{errors.password}</CFormFeedback>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <CFormLabel>Confirm password</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                      <CIcon icon={cilLockLocked} style={{ color: 'var(--nn-text-tertiary)' }} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      value={form.confirmPassword}
                      invalid={!!errors.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                    />
                  </CInputGroup>
                  <CFormFeedback invalid={!!errors.confirmPassword}>{errors.confirmPassword}</CFormFeedback>
                </div>

                <CButton type="submit" color="primary" disabled={submitting} className="w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {submitting && <CSpinner size="sm" />} Create Account
                </CButton>

                <p className="nn-text-secondary" style={{ textAlign: 'center', marginTop: 22, fontSize: 'var(--nn-fs-sm)' }}>
                  Already have an account? <Link to="/login" style={{ color: 'var(--nn-signal-400)', fontWeight: 600 }}>Sign in</Link>
                </p>
              </CForm>
            </>
          )}
        </div>

        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(160deg, rgba(59,130,246,0.18), rgba(139,124,246,0.10))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            overflow: 'hidden',
          }}
        >
          <CircuitBackground />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <NetworkTopology width={220} height={140} alertIndex={-1} />
            <h3 style={{ color: 'var(--nn-text-primary)', fontWeight: 700, marginTop: 12 }}>Enterprise Network Intelligence</h3>
            <p className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)', maxWidth: '30ch', margin: '8px auto 0' }}>
              Real-time visibility, AI-driven detection, and full audit control across every monitored device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
