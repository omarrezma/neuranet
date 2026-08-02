import axios from './axios'

export const authService = {
  login: (username, password) =>
    axios.post('/auth/login', { username, password }),
  register: (username, email, password) =>
    axios.post('/auth/register', { username, email, password }),
}

export default authService