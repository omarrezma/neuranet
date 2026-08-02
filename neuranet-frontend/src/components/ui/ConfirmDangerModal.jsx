import { useState } from 'react'
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormInput, CFormLabel, CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'

/**
 * ConfirmDangerModal
 * -----------------------------------------------------------------------
 * For actions that can't be undone (bulk deletes, wiping data). The user
 * must type an exact confirmation phrase before the confirm button enables.
 * This is deliberately more friction than a normal "Are you sure?" modal —
 * appropriate for endpoints like DELETE /maintenance/all.
 */
export default function ConfirmDangerModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmPhrase,
  confirmLabel = 'Delete',
  loading = false,
  error = null,
}) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim() === confirmPhrase

  function handleClose() {
    setTyped('')
    onClose()
  }

  return (
    <CModal visible={visible} onClose={handleClose} alignment="center">
      <CModalHeader>
        <CModalTitle style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CIcon icon={cilWarning} style={{ color: 'var(--nn-sev-critical)' }} />
          {title}
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ color: 'var(--nn-text-secondary)', margin: 0, fontSize: 'var(--nn-fs-sm)' }}>{description}</p>

        {error && (
          <div style={{ color: 'var(--nn-sev-critical)', fontSize: 'var(--nn-fs-sm)' }}>{error}</div>
        )}

        <div>
          <CFormLabel>
            Type <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)' }}>{confirmPhrase}</strong> to confirm
          </CFormLabel>
          <CFormInput
            className="nn-mono"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmPhrase}
            autoComplete="off"
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={handleClose} disabled={loading}>Cancel</CButton>
        <CButton
          color="danger"
          disabled={!matches || loading}
          onClick={onConfirm}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {loading && <CSpinner size="sm" />} {confirmLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
