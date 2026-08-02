/**
 * NetworkTopology — a small cluster of nodes connected by animated links,
 * representing monitored devices reporting into the platform. Used in the
 * dashboard header accent and as an illustration in empty/loading states.
 * One node can be marked `alert` to show the severity-ramp color reused
 * from tokens.css.
 */
export default function NetworkTopology({ width = 220, height = 140, alertIndex = 2 }) {
  const nodes = [
    { x: 30, y: 100 }, { x: 70, y: 40 }, { x: 120, y: 70 },
    { x: 165, y: 30 }, { x: 190, y: 100 }, { x: 110, y: 118 },
  ]
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [0, 5]]

  return (
    <svg width={width} height={height} viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Network topology">
      {links.map(([a, b], i) => {
        const n1 = nodes[a], n2 = nodes[b]
        return (
          <g key={i}>
            <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="rgba(148,163,184,0.18)" strokeWidth="1.2" />
            <circle r="2" fill="var(--nn-cyan-500, #22d3ee)">
              <animateMotion
                dur={`${3.5 + i * 0.5}s`}
                repeatCount="indefinite"
                path={`M ${n1.x} ${n1.y} L ${n2.x} ${n2.y}`}
              />
            </circle>
          </g>
        )
      })}

      {nodes.map((n, i) => {
        const isAlert = i === alertIndex
        const color = isAlert ? 'var(--nn-sev-high, #f97316)' : 'var(--nn-signal-500, #3b82f6)'
        return (
          <g key={i}>
            {isAlert && (
              <circle cx={n.x} cy={n.y} r="6" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7">
                <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r="5" fill="var(--nn-bg-1, #0a0f1c)" stroke={color} strokeWidth="1.6" />
            <circle cx={n.x} cy={n.y} r="2" fill={color} />
          </g>
        )
      })}
    </svg>
  )
}
