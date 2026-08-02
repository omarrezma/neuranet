import api from "./axios";

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get("/api/stats");
    return data;
  },

  getSecurity: async () => {
    const { data } = await api.get("/api/security");
    return data;
  },

  getCards: async () => {
    const { data } = await api.get("/api/dashboard-cards");
    return data;
  },

  getAttackTrend: async () => {
    const { data } = await api.get("/api/attack-trend");
    return data;
  },
};