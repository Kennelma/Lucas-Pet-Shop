// src/api/reportesService.js
import axiosInstance from './axiosConfig';

const API_URL = '/reportes';

//SERVICIOS DE AXIOS PARA EL REPORTES DIARIO AUTOMATICO
export const obtenerReporteDiario = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/reporteDiario`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//SERVICIOS DE AXIOS PARA EL REGISTRO FINANCIERO DE GRAFICOS Y DE TABLAS
export const obtenerRegistroFinanciero = async (anio) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/registroFinanciero`, {
      params: { anio }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};