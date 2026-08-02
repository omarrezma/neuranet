import api from './axios'

// Matches app/routers/alerts.py exactly:
//   GET /alerts/?skip=&limit=   -> List[Alert]   (limit capped at 100 server-side)
// Alert fields (app/models/alert.py):
//   { id, timestamp, src_ip, dst_ip, src_port, dst_port, protocol, prediction, confidence, probability }
// Read-only endpoint — there is no create/update/delete for alerts, so none is exposed here.
export const alertService = {
  list: async ({ skip = 0, limit = 100 } = {}) => {
    const { data } = await api.get('/alerts/', { params: { skip, limit } })
    return data
  },
}

export default alertService
