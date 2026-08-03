import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const apiClient = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE PETICIÓN: Inyecta el JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// INTERCEPTOR DE RESPUESTA: Manejo global de errores (401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Si el token expira, se puede disparar un logout automático aquí
      console.error("Sesión expirada o no autorizada");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
