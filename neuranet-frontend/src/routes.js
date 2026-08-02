import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Pages (create these next)
const Devices = React.lazy(() => import('./views/devices/Devices'))
const Incidents = React.lazy(() => import('./views/incidents/Incidents'))
const Alerts = React.lazy(() => import('./views/alerts/Alerts'))
const AIAnalysis = React.lazy(() => import('./views/analysis/AIAnalysis'))
const Analytics = React.lazy(() => import('./views/analytics/Analytics'))
const Settings = React.lazy(() => import('./views/settings/Settings'))
const Maintenance = React.lazy(() => import('./views/maintenance/Maintenance'))

export const routes = [
  {
    path: '/',
    exact: true,
    name: 'Dashboard',
    element: Dashboard,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: Dashboard,
  },
  {
    path: '/devices',
    name: 'Devices',
    element: Devices,
  },
  {
    path: '/incidents',
    name: 'Incidents',
    element: Incidents,
  },
  {
    path: '/alerts',
    name: 'Alerts',
    element: Alerts,
  },
  {
    path: '/analysis',
    name: 'AI Analysis',
    element: AIAnalysis,
  },
  {
    path: '/analytics',
    name: 'Analytics',
    element: Analytics,
  },
  {
    path: '/settings',
    name: 'Settings',
    element: Settings,
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    element: Maintenance,
  },
]

export default routes