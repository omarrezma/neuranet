/**
 * GlassCard — the single reusable panel surface. Every dashboard/settings/
 * table panel should render inside one of these instead of hand-rolling
 * background/border/blur styles per-component.
 */
export default function GlassCard({
  as: Tag = 'div',
  strong = false,
  hover = true,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const classes = [
    strong ? 'nn-glass-strong' : 'nn-glass',
    hover ? 'nn-glass-hover' : '',
    'nn-animate-in',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Tag className={classes} style={{ position: 'relative', ...style }} {...rest}>
      {children}
    </Tag>
  )
}

export function GlassCardHeader({ eyebrow, title, action, icon }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px 22px 0',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {icon && <div>{icon}</div>}
        <div>
          {eyebrow && <div className="nn-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
          <h4 style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-lg)', fontWeight: 600, margin: 0 }}>
            {title}
          </h4>
        </div>
      </div>
      {action}
    </div>
  )
}
