import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton, CForm, CFormInput, CFormLabel, CFormFeedback,
  CInputGroup, CInputGroupText, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import '../../../styles/theme.css'
import CircuitBackground from '../../../components/svg/CircuitBackground'
import NetworkTopology from '../../../components/svg/NetworkTopology'
import authService from '../../../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setSubmitting(true)
    try {
      const res = await authService.login(username, password)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('username', username)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid username or password.')
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

          <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Welcome back</div>
          <h1 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-2xl)', fontWeight: 800, marginBottom: 6 }}>Sign in</h1>
          <p className="nn-text-secondary" style={{ marginBottom: 28, fontSize: 'var(--nn-fs-sm)' }}>Access your NeuraNet security console.</p>

          <CForm onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)', marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ marginBottom: 18 }}>
              <CFormLabel>Username</CFormLabel>
              <CInputGroup>
                <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                  <CIcon icon={cilUser} style={{ color: 'var(--nn-text-tertiary)' }} />
                </CInputGroupText>
                <CFormInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="jane.doe"
                  autoFocus
                />
              </CInputGroup>
            </div>

            <div style={{ marginBottom: 24 }}>
              <CFormLabel>Password</CFormLabel>
              <CInputGroup>
                <CInputGroupText style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nn-border)' }}>
                  <CIcon icon={cilLockLocked} style={{ color: 'var(--nn-text-tertiary)' }} />
                </CInputGroupText>
                <CFormInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </CInputGroup>
            </div>

            <CButton type="submit" color="primary" disabled={submitting} className="w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {submitting && <CSpinner size="sm" />} Sign In
            </CButton>

            <p className="nn-text-secondary" style={{ textAlign: 'center', marginTop: 22, fontSize: 'var(--nn-fs-sm)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--nn-signal-400)', fontWeight: 600 }}>Create one</Link>
            </p>
          </CForm>
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
