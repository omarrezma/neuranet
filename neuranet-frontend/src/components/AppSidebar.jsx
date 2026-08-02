import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CNavTitle,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'

// Keeps a CNavTitle only if at least one of the items following it (up to
// the next title) still matches the query — otherwise you'd see an empty
// "Intelligence & Admin" header with nothing under it.
function filterNav(items, query) {
  if (!query.trim()) return items
  const q = query.trim().toLowerCase()

  const result = []
  let pendingTitle = null
  let titleHasMatch = false

  const flushTitle = () => {
    if (pendingTitle && titleHasMatch) result.push(pendingTitle)
    pendingTitle = null
    titleHasMatch = false
  }

  for (const item of items) {
    if (item.component === CNavTitle) {
      flushTitle()
      pendingTitle = item
      continue
    }
    if (item.name?.toLowerCase().includes(q)) {
      titleHasMatch = true
      result.push(item)
    }
  }
  flushTitle()
  return result
}

const AppSidebar = () => {
  const dispatch = useDispatch()

  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const [query, setQuery] = useState('')
  const filteredNav = useMemo(() => filterNav(navigation, query), [query])

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      colorScheme="dark"
      style={{
        background: "#0B1120",
        borderRight: "1px solid rgba(255,255,255,.08)",
      }}
      onVisibleChange={(visible) =>
        dispatch({ type: "set", sidebarShow: visible })
      }
    >
      <CSidebarHeader
        className="border-bottom"
        style={{
          borderColor: "rgba(255,255,255,.08)",
          padding: "20px",
        }}
      >
        <CSidebarBrand
          to="/dashboard"
          style={{
            textDecoration: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg,#3B82F6,#8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              N
            </div>

            {!unfoldable && (
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  NeuraNet
                </div>

                <small
                  style={{
                    color: "#94A3B8",
                  }}
                >
                  AI Security
                </small>
              </div>
            )}
          </div>
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() =>
            dispatch({
              type: "set",
              sidebarShow: false,
            })
          }
        />
      </CSidebarHeader>

      {!unfoldable && (
        <div style={{ padding: '0 14px 10px' }}>
          <div style={{ position: 'relative' }}>
            <CIcon
              icon={cilSearch} size="sm"
              style={{ position: 'absolute', insetInlineStart: 10, top: '50%', transform: 'translateY(-50%)', color: '#5c6b85' }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter navigation…"
              aria-label="Filter navigation"
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: '#e7ecf5',
                fontSize: 12.5,
              }}
            />
          </div>
        </div>
      )}

      <AppSidebarNav items={filteredNav} />

      <CSidebarFooter
        className="border-top d-none d-lg-flex"
        style={{
          borderColor: "rgba(255,255,255,.08)",
        }}
      >
        <CSidebarToggler
          onClick={() =>
            dispatch({
              type: "set",
              sidebarUnfoldable: !unfoldable,
            })
          }
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)