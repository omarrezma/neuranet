import { useMemo, useState } from 'react'
import { SkeletonLine } from './Skeleton'

/**
 * DataTable
 * -----------------------------------------------------------------------
 * Generic, reusable list-page table. Handles search, column sorting, and
 * pagination client-side so every page (Incidents, Devices, Alerts, ...)
 * gets the same behavior without re-implementing it.
 *
 * Props:
 *  - columns: [{ key, label, sortable, align, width, render(row) }]
 *  - rows: array of data objects
 *  - rowKey: (row) => unique key
 *  - loading: bool
 *  - error: string | null
 *  - searchPlaceholder: string
 *  - searchKeys: array of column keys to search across (defaults to all)
 *  - pageSize: number (default 10)
 *  - toolbarRight: extra node rendered at the right of the search bar
 *  - emptyTitle / emptyBody: copy for the empty state
 */
export default function DataTable({
  columns,
  rows = [],
  rowKey = (r) => r.id,
  loading = false,
  error = null,
  searchPlaceholder = 'Search…',
  searchKeys,
  pageSize = 10,
  toolbarRight = null,
  emptyTitle = 'Nothing here yet',
  emptyBody = 'New records will appear here as soon as they come in.',
  onRowClick = null,
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const keysToSearch = searchKeys || columns.map((c) => c.key)

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((row) =>
      keysToSearch.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
    )
  }, [rows, query, keysToSearch])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  function toggleSort(col) {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '18px 22px 14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--nn-text-tertiary)' }}
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="nn-mono"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--nn-border)',
              borderRadius: 'var(--nn-radius-sm)',
              color: 'var(--nn-text-primary)',
              fontSize: 13,
            }}
          />
        </div>
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 10 }}>{toolbarRight}</div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: 'var(--nn-surface-glass-strong)', backdropFilter: 'blur(12px)', zIndex: 1 }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col)}
                  style={{
                    textAlign: col.align || 'start',
                    padding: '10px 22px',
                    fontSize: 'var(--nn-fs-xs)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--nn-text-tertiary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--nn-border)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginInlineStart: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '14px 22px', borderBottom: '1px solid var(--nn-border)' }}>
                    <SkeletonLine height={12} width={col.width || '70%'} />
                  </td>
                ))}
              </tr>
            ))}

            {!loading && error && (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--nn-sev-critical)' }}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0 }}>
                  <div style={{ textAlign: 'center', padding: '48px 22px' }}>
                    <div style={{ color: 'var(--nn-text-primary)', fontWeight: 600, marginBottom: 6 }}>{emptyTitle}</div>
                    <div className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>{emptyBody}</div>
                  </div>
                </td>
              </tr>
            )}

            {!loading && !error && pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                className="nn-table-row"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  transition: 'background var(--nn-dur-fast) var(--nn-ease)',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '14px 22px',
                      borderBottom: '1px solid var(--nn-border)',
                      textAlign: col.align || 'start',
                      color: 'var(--nn-text-primary)',
                      fontSize: 'var(--nn-fs-sm)',
                      whiteSpace: col.nowrap === false ? 'normal' : 'nowrap',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && sorted.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', flexWrap: 'wrap', gap: 10 }}>
          <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <PageButton disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Prev</PageButton>
            <span className="nn-mono nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)', padding: '6px 10px' }}>
              {safePage} / {totalPages}
            </span>
            <PageButton disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next</PageButton>
          </div>
        </div>
      )}

      <style>{`
        .nn-table-row:hover td { background: var(--nn-surface-hover); }
      `}</style>
    </div>
  )
}

function PageButton({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--nn-radius-sm)',
        border: '1px solid var(--nn-border)',
        background: 'rgba(255,255,255,0.03)',
        color: disabled ? 'var(--nn-text-tertiary)' : 'var(--nn-text-primary)',
        fontSize: 'var(--nn-fs-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
