import api from './axios'

// Matches the real backend surface exactly — no invented endpoints/fields:
//   GET /analytics/summary  (app/routers/analytics.py)
//     -> { total_incidents, average_cpu, average_memory, max_cpu, max_memory }
//   GET /api/security       (app/routers/dashboard.py)
//     -> { total_packets, attacks, normal, devices, alerts, average_confidence, high_confidence }
//   GET /api/attack-trend   (app/routers/dashboard.py)
//     -> [ { time, attacks } ]  (last 24h, grouped by hour)
export const analyticsService = {
  getSummary: async () => {
    const { data } = await api.get('/analytics/summary')
    return data
  },
  getSecurity: async () => {
    const { data } = await api.get('/api/security')
    return data
  },
  getAttackTrend: async () => {
    const { data } = await api.get('/api/attack-trend')
    return data
  },
}

export default analyticsService
