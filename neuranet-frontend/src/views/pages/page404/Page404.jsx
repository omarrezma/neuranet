import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSpeedometer } from '@coreui/icons'

import '../../../styles/theme.css'
import CircuitBackground from '../../../components/svg/CircuitBackground'

export default function Page404() {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--nn-bg-0)',
        overflow: 'hidden',
        padding: 20,
      }}
    >
      <CircuitBackground density="dense" />
      <div className="nn-glass-strong" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '52px 48px', maxWidth: 460 }}>
        <div className="nn-eyebrow" style={{ marginBottom: 10 }}>Error 404</div>
        <div className="nn-mono" style={{ fontSize: 64, fontWeight: 800, color: 'var(--nn-signal-500)', lineHeight: 1, marginBottom: 8 }}>404</div>
        <h1 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-xl)', fontWeight: 700, marginBottom: 8 }}>Page not found</h1>
        <p className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)', marginBottom: 28 }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <CButton as={Link} to="/dashboard" color="primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CIcon icon={cilSpeedometer} size="sm" /> Go to Dashboard
          </CButton>
          <CButton onClick={() => window.history.back()} color="secondary" variant="ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CIcon icon={cilArrowLeft} size="sm" /> Go Back
          </CButton>
        </div>
      </div>
    </div>
  )
}
