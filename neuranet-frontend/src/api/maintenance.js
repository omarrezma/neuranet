import api from './axios'

// Matches app/routers/maintenance.py exactly. Every one of these is a
// destructive, irreversible bulk delete — never call without an explicit,
// typed confirmation from the user (see ConfirmDangerModal).
export const maintenanceService = {
  clearDevices: async () => (await api.delete('/maintenance/devices')).data,
  clearIncidents: async () => (await api.delete('/maintenance/incidents')).data,
  clearAlerts: async () => (await api.delete('/maintenance/alerts')).data,
  clearPredictions: async () => (await api.delete('/maintenance/predictions')).data,
  clearAll: async () => (await api.delete('/maintenance/all')).data,
}

export default maintenanceService
