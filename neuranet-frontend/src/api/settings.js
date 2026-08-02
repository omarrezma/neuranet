import axios from './axios'

export const settingsService = {
  getSettings: () => axios.get('/settings/'),
  updateSettings: (data) => axios.put('/settings/', data),
}

export default settingsService