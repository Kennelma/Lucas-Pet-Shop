import axios from 'axios';

const API_URL = "http://localhost:4000/api";

//INSTANCIA DE AXIOS
const axiosInstance = axios.create({
    baseURL: API_URL
});

//INTERCEPTOR DE REQUEST (SOLICITUD) PARA AÑADIR EL TOKEN EN CADA REQUEST
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//INTERCEPTOR DE RESPUESTA (RESPONSE) PARA GESTIONAR ERRORES GLOBALES
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si:
    // 1. Es un 401
    // 2. NO es la ruta de login (para evitar el loop)
    // 3. Existe un token (significa que era una sesión válida que expiró)
    if (
      error.response &&
      error.response.status === 401 &&
      error.config.url !== '/login' &&
      sessionStorage.getItem('token')
    ) {
      console.log('🚨 Sesión expirada. Redirigiendo al login...');
      
      sessionStorage.setItem('sessionExpired', 'true');

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;