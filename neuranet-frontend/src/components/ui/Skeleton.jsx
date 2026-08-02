export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return <div className="nn-skeleton" style={{ width, height, ...style }} />
}

export function SkeletonCircle({ size = 48 }) {
  return <div className="nn-skeleton" style={{ width: size, height: size, borderRadius: '50%' }} />
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ flex: 1, marginRight: 16 }}>
          <SkeletonLine width="45%" height={12} style={{ marginBottom: 10 }} />
          <SkeletonLine width="65%" height={26} />
        </div>
        <SkeletonCircle size={54} />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={`${85 - i * 12}%`} height={11} style={{ marginBottom: 10 }} />
      ))}
    </div>
  )
}
