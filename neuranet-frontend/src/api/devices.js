import api from './axios'

// Matches app/routers/device.py exactly:
//   GET    /devices/            -> List[Device]
//   POST   /devices/            -> Device
//   GET    /devices/{id}        -> Device
//   PUT    /devices/{id}        -> Device
//   DELETE /devices/{id}        -> { message }
// Device fields (app/models/device.py / DeviceResponse):
//   { id, hostname, ip_address, mac_address, vendor, device_type, status, last_seen }
export const deviceService = {
  list: async () => {
    const { data } = await api.get('/devices/')
    return data
  },
  get: async (id) => {
    const { data } = await api.get(`/devices/${id}`)
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/devices/', payload)
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/devices/${id}`, payload)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/devices/${id}`)
    return data
  },
}

export default deviceService
