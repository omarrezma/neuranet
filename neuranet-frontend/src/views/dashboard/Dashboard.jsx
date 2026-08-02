import { useEffect, useState } from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import CircuitBackground from '../../components/svg/CircuitBackground'
import NetworkTopology from '../../components/svg/NetworkTopology'
import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import { SkeletonCard } from '../../components/ui/Skeleton'

import StatCard from '../../components/StatCard'
import AttackTrendChart from '../../components/AttackTrendChart'
import SystemStatus from '../../components/SystemStatus'
import PredictionCard from '../../components/PredictionCard'
import SecurityOverview from '../../components/SecurityOverview'

import { dashboardService } from '../../api/dashboard'
import { getSystemStatus } from '../../api/system'

export default function Dashboard() {
  const [cards, setCards] = useState({ devices: 0, alerts: 0, attacks: 0, average_confidence: 0 })
  const [system, setSystem] = useState({})
  const [security, setSecurity] = useState({})
  const [stats, setStats] = useState({})
  const [attackTrend, setAttackTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setError(null)
      try {
        const [cardsData, securityData, trendData, systemData, statsData] = await Promise.all([
          dashboardService.getCards(),
          dashboardService.getSecurity(),
          dashboardService.getAttackTrend(),
          getSystemStatus(),
          dashboardService.getStats(),
        ])

        if (cancelled) return
        setCards(cardsData || {})
        setSecurity(securityData || {})
        setAttackTrend(trendData || [])
        setSystem(systemData || {})
        setStats(statsData || {})
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('Unable to reach the NeuraNet API. Check that the backend is running and try again.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong">
        <CircuitBackground className="dashboard-hero-bg" />
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Enterprise Network Intelligence</div>
            <h1 className="page-title">NeuraNet Dashboard</h1>
            <p className="page-subtitle">Real-time visibility across every monitored device and connection</p>
          </div>
          <NetworkTopology width={200} height={120} alertIndex={cards.attacks > 0 ? 2 : -1} />
        </div>
      </div>

      {error && (
        <div className="nn-glass" role="alert" style={{ padding: '14px 20px', marginTop: 20, color: 'var(--nn-sev-medium)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="nn-dot nn-dot-medium" />
          {error}
        </div>
      )}

      <CRow className="stats-grid">
        <CCol lg={3} md={6}>
          {loading ? <GlassCard><SkeletonCard lines={0} /></GlassCard> : <StatCard title="Devices" value={cards.devices ?? 0} />}
        </CCol>
        <CCol lg={3} md={6}>
          {loading ? <GlassCard><SkeletonCard lines={0} /></GlassCard> : <StatCard title="Alerts" value={cards.alerts ?? 0} />}
        </CCol>
        <CCol lg={3} md={6}>
          {loading ? <GlassCard><SkeletonCard lines={0} /></GlassCard> : <StatCard title="Attacks" value={cards.attacks ?? 0} />}
        </CCol>
        <CCol lg={3} md={6}>
          {loading ? <GlassCard><SkeletonCard lines={0} /></GlassCard> : <StatCard title="AI Confidence" value={`${cards.average_confidence ?? 0}%`} />}
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol lg={8}>
          <GlassCard>
            <GlassCardHeader eyebrow="Last 24 hours" title="Attack Trend" />
            <div style={{ padding: '16px 22px 22px' }}>
              {loading ? <SkeletonCard lines={5} /> : <AttackTrendChart data={attackTrend} />}
            </div>
          </GlassCard>
        </CCol>
        <CCol lg={4}>
          <GlassCard>
            <GlassCardHeader eyebrow="Platform" title="System Status" />
            <SystemStatus loading={loading} system={system} />
          </GlassCard>
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol lg={6}>
          <GlassCard>
            <GlassCardHeader eyebrow="Reasoning engine" title="Recent AI Prediction" />
            {loading ? <SkeletonCard lines={4} /> : <PredictionCard stats={stats} />}
          </GlassCard>
        </CCol>
        <CCol lg={6}>
          <GlassCard>
            <GlassCardHeader eyebrow="Traffic classification" title="Security Overview" />
            {loading ? <SkeletonCard lines={4} /> : <SecurityOverview security={security} />}
          </GlassCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
