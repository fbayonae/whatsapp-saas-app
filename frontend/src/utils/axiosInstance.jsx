// src/utils/axiosInstance.js
import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  withCredentials: true  // Permite el envío de cookies y credenciales
});

//añadir token al request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptar respuestas 401
instance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
  
      // Si el token expiró y no hemos intentado ya renovar
      if (
        error.response?.status === 403 &&
        !originalRequest._retry &&
        typeof window !== "undefined" // solo navegador
      ) {
        originalRequest._retry = true;
  
        try {
          const response = await axios.post("/auth/refresh-cookie", null, {
            withCredentials: true
          });
  
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
  
          // Reintenta la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("❌ Fallo al renovar el token:", refreshError);
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
  );

export default instance;
