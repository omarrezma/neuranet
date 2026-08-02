import { useNavigate } from 'react-router-dom'
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBolt, cilPlus, cilBug, cilCog } from '@coreui/icons'

const ACTIONS = [
  { label: 'Add Device', path: '/devices', icon: cilPlus },
  { label: 'Log Incident', path: '/incidents', icon: cilBug },
  { label: 'Open Maintenance', path: '/maintenance', icon: cilCog },
]

export default function QuickActionsMenu() {
  const navigate = useNavigate()

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false} title="Quick actions">
        <CIcon icon={cilBolt} size="lg" />
      </CDropdownToggle>
      <CDropdownMenu className="nn-glass-strong" style={{ minWidth: 220, padding: 6, border: 'none' }}>
        <CDropdownHeader className="nn-eyebrow">Quick Actions</CDropdownHeader>
        {ACTIONS.map((a) => (
          <CDropdownItem
            key={a.path}
            onClick={() => navigate(a.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 8 }}
          >
            <CIcon icon={a.icon} size="sm" style={{ color: 'var(--nn-signal-500)' }} />
            {a.label}
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  )
}
