import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend says our token is invalid/expired, clear it and let the
// app know — but do NOT navigate here. This file runs outside React and
// has no knowledge of React Router's state. Writing to window.location
// directly while a HashRouter is mounted causes two navigation systems
// (raw location writes vs. <Navigate>/useNavigate) to fight over the same
// URL, which is what was causing the repeated "Maximum update depth
// exceeded" errors — several components (Dashboard, SystemIndicator,
// NotificationsMenu) all polling at once meant several interceptor
// callbacks tried to force-navigate independently on the same tick.
//
// Instead, we dispatch a plain DOM event. A single listener mounted
// inside the router (see AuthExpiredListener.jsx) is the only thing
// that ever calls navigate(), so there's one source of truth for routing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      if (hadToken) {
        window.dispatchEvent(new Event("neuranet:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
