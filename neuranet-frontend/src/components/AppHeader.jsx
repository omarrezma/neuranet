import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'

import { cilMenu } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header'
import GlobalSearch from './ui/GlobalSearch'
import SystemIndicator from './ui/SystemIndicator'
import QuickActionsMenu from './ui/QuickActionsMenu'
import NotificationsMenu from './ui/NotificationsMenu'

const AppHeader = () => {
  const headerRef = useRef()

  const dispatch = useDispatch()

  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    const listener = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle(
          'shadow-sm',
          document.documentElement.scrollTop > 0,
        )
      }
    }

    document.addEventListener('scroll', listener)

    return () => document.removeEventListener('scroll', listener)
  }, [])

  return (
    <CHeader
      position="sticky"
      ref={headerRef}
      style={{
        background: '#0B1120',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}
    >
      <CContainer fluid style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <CHeaderToggler
          onClick={() =>
            dispatch({
              type: 'set',
              sidebarShow: !sidebarShow,
            })
          }
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}>
          <GlobalSearch />
        </div>

        <CHeaderNav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <SystemIndicator />
          <QuickActionsMenu />
          <NotificationsMenu />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
