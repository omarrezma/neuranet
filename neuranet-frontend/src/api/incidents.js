import api from './axios'

// Matches app/routers/incident.py exactly:
//   GET    /incidents/          -> List[IncidentResponse]
//   POST   /incidents/          -> IncidentResponse
//   DELETE /incidents/{id}      -> { message }
// IncidentResponse: { id, device_name, cpu, memory, packet_loss, interface_errors, timestamp }
export const incidentService = {
  list: async () => {
    const { data } = await api.get('/incidents/')
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/incidents/', payload)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/incidents/${id}`)
    return data
  },
}

export default incidentService
