import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilSpeedometer } from '@coreui/icons'

import '../../../styles/theme.css'
import CircuitBackground from '../../../components/svg/CircuitBackground'

export default function Page500() {
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
        <div className="nn-eyebrow" style={{ marginBottom: 10, color: 'var(--nn-sev-critical)' }}>Error 500</div>
        <div className="nn-mono" style={{ fontSize: 64, fontWeight: 800, color: 'var(--nn-sev-critical)', lineHeight: 1, marginBottom: 8 }}>500</div>
        <h1 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-xl)', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
        <p className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)', marginBottom: 28 }}>
          This page is temporarily unavailable. Try again, or check the Maintenance page if the problem persists.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <CButton onClick={() => window.location.reload()} color="primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CIcon icon={cilReload} size="sm" /> Try Again
          </CButton>
          <CButton as={Link} to="/dashboard" color="secondary" variant="ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CIcon icon={cilSpeedometer} size="sm" /> Go to Dashboard
          </CButton>
        </div>
      </div>
    </div>
  )
}
