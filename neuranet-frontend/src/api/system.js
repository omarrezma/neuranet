import api from "./axios";

export const getSystemStatus = async () => {
  const response = await api.get("/system/status");
  return response.data;
};