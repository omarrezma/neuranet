import { useCallback, useEffect, useRef, useState } from 'react'
import { CContainer, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilChartPie,
  cilSpeedometer,
  cilShieldAlt,
  cilWarning,
  cilReload,
  cilBolt,
} from '@coreui/icons'

import '../../styles/theme.css'
import '../../styles/dashboard.css'

import GlassCard, { GlassCardHeader } from '../../components/ui/GlassCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import RadarScan from '../../components/svg/RadarScan'
import RadialGauge from '../../components/svg/RadialGauge'
import TrafficDonut from '../../components/svg/TrafficDonut'
import AttackTrendChart from '../../components/AttackTrendChart'

import { analyticsService } from '../../api/analytics'

const REFRESH_INTERVAL_MS = 15000

// Small KPI card in the same visual language as StatCard, but with
// title/icon/color passed explicitly since Analytics' metrics don't
// belong to StatCard's fixed Dashboard icon map.
function MetricCard({ title, value, icon, color, loading }) {
  if (loading) {
    return (
      <GlassCard className="h-100">
        <SkeletonCard lines={0} />
      </GlassCard>
    )
  }
  return (
    <GlassCard className="h-100" style={{ overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', insetInlineStart: 0, top: 0, bottom: 0, width: 3,
          background: color, boxShadow: `0 0 12px ${color}`,
        }}
      />
      <div style={{ padding: '22px 22px 22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div className="nn-eyebrow" style={{ marginBottom: 10 }}>{title}</div>
          <div className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontWeight: 700, fontSize: 'var(--nn-fs-3xl)', lineHeight: 1 }}>
            {value}
          </div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--nn-radius-md)',
          background: `color-mix(in srgb, ${color} 16%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CIcon icon={icon} size="lg" style={{ color }} />
        </div>
      </div>
    </GlassCard>
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [security, setSecurity] = useState(null)
  const [trend, setTrend] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)

  const fetchAll = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    setError(null)
    try {
      const [summaryData, securityData, trendData] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getSecurity(),
        analyticsService.getAttackTrend(),
      ])
      setSummary(summaryData || {})
      setSecurity(securityData || {})
      setTrend(Array.isArray(trendData) ? trendData : [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error(err)
      setError('Unable to reach the NeuraNet API. Check that the backend is running and try again.')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll(false)
    intervalRef.current = setInterval(() => fetchAll(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [fetchAll])

  const totalIncidents = summary?.total_incidents ?? 0
  const totalAlerts = security?.alerts ?? 0
  const attacks = security?.attacks ?? 0
  const devices = security?.devices ?? 0

  return (
    <CContainer fluid className="dashboard-page">
      <div className="dashboard-hero nn-glass-strong">
        <div className="dashboard-hero-content">
          <div>
            <div className="nn-eyebrow" style={{ marginBottom: 8 }}>Network Intelligence</div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">System performance and threat-detection trends, sourced live from the analytics and security APIs</p>
          </div>
          <RadarScan size={110} />
        </div>
      </div>

      {error && (
        <div className="nn-glass" role="alert" style={{ padding: '14px 20px', marginTop: 20, color: 'var(--nn-sev-medium)', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="nn-dot nn-dot-medium" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => fetchAll(false)}
            className="nn-mono"
            style={{ background: 'transparent', border: '1px solid var(--nn-border-strong)', borderRadius: 'var(--nn-radius-sm)', color: 'var(--nn-text-primary)', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <CIcon icon={cilReload} size="sm" /> Retry
          </button>
        </div>
      )}

      {lastUpdated && !error && (
        <div className="nn-text-tertiary nn-mono" style={{ fontSize: 'var(--nn-fs-xs)', marginTop: 14, textAlign: 'end' }}>
          Last updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      <CRow className="stats-grid mt-3">
        <CCol lg={3} md={6}>
          <MetricCard title="Total Incidents" value={totalIncidents} icon={cilWarning} color="var(--nn-sev-medium)" loading={loading} />
        </CCol>
        <CCol lg={3} md={6}>
          <MetricCard title="Total Alerts" value={totalAlerts} icon={cilBolt} color="var(--nn-signal-500)" loading={loading} />
        </CCol>
        <CCol lg={3} md={6}>
          <MetricCard title="Attacks Detected" value={attacks} icon={cilShieldAlt} color="var(--nn-sev-critical)" loading={loading} />
        </CCol>
        <CCol lg={3} md={6}>
          <MetricCard title="Devices Monitored" value={devices} icon={cilSpeedometer} color="var(--nn-violet-500)" loading={loading} />
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol lg={8}>
          <GlassCard>
            <GlassCardHeader eyebrow="Last 24 hours" title="Attack Trend" icon={<CIcon icon={cilShieldAlt} size="lg" style={{ color: 'var(--nn-sev-critical)' }} />} />
            <div style={{ padding: '16px 22px 22px' }}>
              {loading ? <SkeletonCard lines={5} /> : <AttackTrendChart data={trend} />}
            </div>
          </GlassCard>
        </CCol>
        <CCol lg={4}>
          <GlassCard className="h-100">
            <GlassCardHeader eyebrow="Traffic classification" title="Threat Breakdown" icon={<CIcon icon={cilChartPie} size="lg" style={{ color: 'var(--nn-cyan-500)' }} />} />
            <div style={{ padding: '18px 22px 26px', display: 'flex', justifyContent: 'center' }}>
              {loading ? (
                <SkeletonCard lines={3} />
              ) : (
                <TrafficDonut normal={security?.normal ?? 0} attacks={security?.attacks ?? 0} />
              )}
            </div>
          </GlassCard>
        </CCol>
      </CRow>

      <CRow className="mt-4">
        <CCol lg={8}>
          <GlassCard>
            <GlassCardHeader eyebrow="Collector telemetry" title="Resource Utilization" icon={<CIcon icon={cilSpeedometer} size="lg" style={{ color: 'var(--nn-signal-500)' }} />} />
            <div style={{ padding: '10px 22px 26px' }}>
              {loading ? (
                <SkeletonCard lines={5} />
              ) : (
                <CRow className="justify-content-around">
                  <CCol xs={12} sm={6} className="d-flex justify-content-center mt-3">
                    <RadialGauge
                      label="CPU"
                      value={summary?.average_cpu ?? 0}
                      peak={summary?.max_cpu ?? null}
                      valueLabel={`${summary?.average_cpu ?? 0}%`}
                      peakLabel={`Peak ${summary?.max_cpu ?? 0}%`}
                      color="var(--nn-signal-500)"
                    />
                  </CCol>
                  <CCol xs={12} sm={6} className="d-flex justify-content-center mt-3">
                    <RadialGauge
                      label="Memory"
                      value={summary?.average_memory ?? 0}
                      peak={summary?.max_memory ?? null}
                      valueLabel={`${summary?.average_memory ?? 0}%`}
                      peakLabel={`Peak ${summary?.max_memory ?? 0}%`}
                      color="var(--nn-violet-500)"
                    />
                  </CCol>
                </CRow>
              )}
            </div>
          </GlassCard>
        </CCol>

        <CCol lg={4}>
          <GlassCard className="h-100">
            <GlassCardHeader eyebrow="Detection quality" title="AI Confidence" icon={<CIcon icon={cilBolt} size="lg" style={{ color: 'var(--nn-violet-500)' }} />} />
            {loading ? (
              <SkeletonCard lines={4} />
            ) : (
              <div style={{ padding: '4px 22px 22px' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div className="nn-mono" style={{ color: 'var(--nn-signal-500)', fontWeight: 700, fontSize: 'var(--nn-fs-3xl)', lineHeight: 1 }}>
                    {security?.average_confidence ?? 0}%
                  </div>
                  <p className="nn-text-secondary" style={{ margin: '6px 0 14px', fontSize: 'var(--nn-fs-sm)' }}>
                    Average model confidence
                  </p>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.12)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, security?.average_confidence ?? 0)}%`,
                        background: 'var(--nn-signal-500)',
                        boxShadow: '0 0 10px var(--nn-signal-500)',
                        transition: 'width 500ms var(--nn-ease)',
                      }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--nn-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>High-confidence detections (≥90%)</span>
                    <strong className="nn-mono" style={{ color: 'var(--nn-violet-500)', fontSize: 'var(--nn-fs-sm)' }}>{security?.high_confidence ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="nn-text-secondary" style={{ fontSize: 'var(--nn-fs-sm)' }}>Total packets analyzed</span>
                    <strong className="nn-mono" style={{ color: 'var(--nn-text-primary)', fontSize: 'var(--nn-fs-sm)' }}>{security?.total_packets ?? 0}</strong>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
