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
    if (error.response && error.response.status === 401) {

      console.log('🚨 ¡ERROR 401 CAPTURADO! Redirigiendo...');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      
      //REDIRECCIONA AL LOGIN
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



export default axiosInstance;