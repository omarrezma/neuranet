import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilSearch, cilSpeedometer, cilDevices, cilBug, cilWarning,
  cilShieldAlt, cilChartLine, cilSettings, cilCog,
} from '@coreui/icons'
import { deviceService } from '../../api/devices'

const PAGES = [
  { name: 'Dashboard', path: '/dashboard', icon: cilSpeedometer },
  { name: 'Devices', path: '/devices', icon: cilDevices },
  { name: 'Incidents', path: '/incidents', icon: cilBug },
  { name: 'Alerts', path: '/alerts', icon: cilWarning },
  { name: 'AI Analysis', path: '/analysis', icon: cilShieldAlt },
  { name: 'Analytics', path: '/analytics', icon: cilChartLine },
  { name: 'Settings', path: '/settings', icon: cilSettings },
  { name: 'Maintenance', path: '/maintenance', icon: cilCog },
]

export default function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [devices, setDevices] = useState(null) // fetched lazily, once
  const containerRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function ensureDevicesLoaded() {
    if (devices !== null) return
    try {
      const list = await deviceService.list()
      setDevices(list || [])
    } catch {
      setDevices([]) // fail quietly — search still works for pages
    }
  }

  const q = query.trim().toLowerCase()
  const pageMatches = q ? PAGES.filter((p) => p.name.toLowerCase().includes(q)) : []
  const deviceMatches = q && devices
    ? devices.filter((d) => d.hostname?.toLowerCase().includes(q) || d.ip_address?.toLowerCase().includes(q)).slice(0, 5)
    : []

  function go(path) {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
      <div style={{ position: 'relative' }}>
        <CIcon
          icon={cilSearch} size="sm"
          style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--nn-text-tertiary)' }}
        />
        <input
          value={query}
          onFocus={() => { setOpen(true); ensureDevicesLoaded() }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          placeholder="Search pages, devices…"
          aria-label="Search NeuraNet"
          className="nn-mono"
          style={{
            width: '100%',
            padding: '8px 12px 8px 34px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--nn-border)',
            borderRadius: 'var(--nn-radius-sm)',
            color: 'var(--nn-text-primary)',
            fontSize: 13,
          }}
        />
      </div>

      {open && q && (
        <div
          className="nn-glass-strong"
          style={{ position: 'absolute', top: 'calc(100% + 6px)', insetInlineStart: 0, right: 0, zIndex: 20, maxHeight: 340, overflowY: 'auto', padding: 6 }}
        >
          {pageMatches.length === 0 && deviceMatches.length === 0 && (
            <div className="nn-text-secondary" style={{ padding: '12px 10px', fontSize: 'var(--nn-fs-sm)' }}>
              No matches for "{query}"
            </div>
          )}

          {pageMatches.length > 0 && (
            <SearchGroup label="Pages">
              {pageMatches.map((p) => (
                <SearchResult key={p.path} icon={p.icon} label={p.name} onClick={() => go(p.path)} />
              ))}
            </SearchGroup>
          )}

          {deviceMatches.length > 0 && (
            <SearchGroup label="Devices">
              {deviceMatches.map((d) => (
                <SearchResult
                  key={d.id}
                  icon={cilDevices}
                  label={d.hostname}
                  sublabel={d.ip_address}
                  onClick={() => go('/devices')}
                />
              ))}
            </SearchGroup>
          )}
        </div>
      )}
    </div>
  )
}

function SearchGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div className="nn-eyebrow" style={{ padding: '8px 10px 4px' }}>{label}</div>
      {children}
    </div>
  )
}

function SearchResult({ icon, label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8,
        color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)', textAlign: 'left', cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--nn-surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <CIcon icon={icon} size="sm" style={{ color: 'var(--nn-signal-500)', flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {sublabel && <span className="nn-mono nn-text-tertiary" style={{ fontSize: 'var(--nn-fs-xs)' }}>{sublabel}</span>}
    </button>
  )
}
