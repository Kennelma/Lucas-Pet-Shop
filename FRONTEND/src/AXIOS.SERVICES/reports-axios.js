// src/api/reportesService.js
import axiosInstance from './axiosConfig';

const API_URL = '/reportes';

// Helper: arma params sin undefined/null
const buildParams = (obj) =>
  Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''));


export const verIngresos = async ({ anio, mes } = {}) => {
  try {
    const params = buildParams({ anio, mes });
    const { data } = await axiosInstance.get(`${API_URL}/ingresos`, { params });
    return data?.ingresos ?? [];
  } catch (err) {
    console.error('Error al traer ingresos:', err);
    return [];
  }
};


export const verGastos = async ({ anio, mes } = {}) => {
  try {
    const params = buildParams({ anio, mes });
    const { data } = await axiosInstance.get(`${API_URL}/gastos`, { params });
    return data?.gastos ?? [];
  } catch (err) {
    console.error('Error al traer gastos:', err);
    return [];
  }
};

export const verResumenDiario = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URL}/resumen-diario`);
    return data ?? { ok: false };
  } catch (err) {
    console.error('Error al traer resumen diario:', err);
    return { ok: false, msg: err.message };
  }
};


export const verGraficosMensual = async ({ anio } = {}) => {
  try {
    const params = buildParams({ modo: 'mensual', anio });
    const { data } = await axiosInstance.get(`${API_URL}/graficos`, { params });
    return data ?? { ok: false, data: [] };
  } catch (err) {
    console.error('Error al traer gráficos mensuales:', err);
    return { ok: false, data: [], msg: err.message };
  }
};


export const verGraficosDiario = async ({ anio, mes }) => {
  try {
    const params = buildParams({ modo: 'diario', anio, mes });
    const { data } = await axiosInstance.get(`${API_URL}/graficos`, { params });
    return data ?? { ok: false, data: [] };
  } catch (err) {
    console.error('Error al traer gráficos diarios:', err);
    return { ok: false, data: [], msg: err.message };
  }
};
