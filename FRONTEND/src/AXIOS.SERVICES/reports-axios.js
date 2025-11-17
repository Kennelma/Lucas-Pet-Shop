// src/api/reportesService.js
import axiosInstance from "./axiosConfig";

const API_URL = "/reportes";


//SERVICIOS DE AXIOS PARA EL REPORTES DIARIO AUTOMATICO
export const obtenerReporteDiario = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/reporteDiario`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//SERVICIOS DE AXIOS PARA EL REGISTRO FINANCIERO DE GRAFICOS
export const obtenerRegistroFinanciero = async (anio) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/registroFinanciero`, {
      params: { anio },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//SERVICIOS DE AXIOS PARA LAS VENTAS DIARIAS
export const obtenerVentasDiarias = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/ventasDiarias`);
      return response.data;
  } catch (error) {
    throw error;
  }
};

// SERVICIOS DE AXIOS PARA EL HISTORIAL DE REPORTES GENERADOS
// para poder verlos diarios
export const obtenerHistorialReportes = async (anio, mes, dia) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/historialReportes`, {
      params: { anio, mes, dia },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


//SERVICIOS PARA VER LOS DETALLES DE ESE REPORTE A DETALLES
export const obtenerReportesDetallados = async (fecha_reporte) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/reportesDetallados`, {
      params: { fecha_reporte },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};