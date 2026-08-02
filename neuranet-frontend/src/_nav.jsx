import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilDevices,
  cilWarning,
  cilShieldAlt,
  cilChartLine,
  cilSettings,
  cilBug,
  cilCog,
} from '@coreui/icons'

import { CNavItem, CNavTitle } from '@coreui/react'

// Grouped into two sections purely for sidebar readability — every entry
// still maps 1:1 to a real route in routes.js, nothing here is decorative.
const _nav = [
  { component: CNavTitle, name: 'Monitoring' },

  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Devices',
    to: '/devices',
    icon: <CIcon icon={cilDevices} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Incidents',
    to: '/incidents',
    icon: <CIcon icon={cilBug} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Alerts',
    to: '/alerts',
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },

  { component: CNavTitle, name: 'Intelligence & Admin' },

  {
    component: CNavItem,
    name: 'AI Analysis',
    to: '/analysis',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Analytics',
    to: '/analytics',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Maintenance',
    to: '/maintenance',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  },
]

export default _nav
