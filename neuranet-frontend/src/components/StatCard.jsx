import CIcon from '@coreui/icons-react'
import {
  cilDevices,
  cilWarning,
  cilShieldAlt,
  cilSpeedometer,
} from '@coreui/icons'

import GlassCard from './ui/GlassCard'

// Same prop contract as the original StatCard: { title, value }.
// Kept the icon/color mapping keyed by title so no call site needs to change.
const iconMap = {
  Devices: cilDevices,
  Alerts: cilWarning,
  Attacks: cilShieldAlt,
  'AI Confidence': cilSpeedometer,
}

const colorMap = {
  Devices: 'var(--nn-signal-500)',
  Alerts: 'var(--nn-sev-medium)',
  Attacks: 'var(--nn-sev-critical)',
  'AI Confidence': 'var(--nn-violet-500)',
}

export default function StatCard({ title, value }) {
  const color = colorMap[title] || 'var(--nn-signal-500)'
  const icon = iconMap[title] || cilDevices

  return (
    <GlassCard className="h-100" style={{ overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />

      <div style={{ padding: '22px 22px 22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div className="nn-eyebrow" style={{ marginBottom: 10 }}>{title}</div>
          <div
            className="nn-mono"
            style={{ color: 'var(--nn-text-primary)', fontWeight: 700, fontSize: 'var(--nn-fs-3xl)', lineHeight: 1 }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--nn-radius-md)',
            background: `color-mix(in srgb, ${color} 16%, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CIcon icon={icon} size="lg" style={{ color }} />
        </div>
      </div>
    </GlassCard>
  )
}
