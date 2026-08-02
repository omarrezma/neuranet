/**
 * InitialsAvatar — derives initials + a stable color from the username so
 * the profile menu shows something real instead of a generic stock photo.
 */
const PALETTE = ['#3b82f6', '#8b7cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444']

function colorFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initialsFor(name) {
  if (!name) return '?'
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function InitialsAvatar({ name, size = 36 }) {
  const color = colorFor(name || 'user')
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        border: `1.5px solid ${color}`,
        color,
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initialsFor(name)}
    </div>
  )
}
