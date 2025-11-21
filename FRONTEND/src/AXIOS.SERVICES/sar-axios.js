const express = require("express");
const mysqlConnection = require("../config/conexion");


const API_URL = "/sar";

//SERVICIO DE AXIOS QUE ME OBTIENE EL CATÁLOGO DE CAI
export const verCatalogoCAI = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/cai/verCatalogo`);
        return res.data;
    } catch (error) {
        throw error;
    }
};


//SERVICIO DE AXIOS PARA CREAR UN NUEVO CAI
export const crearCAI = async (datosCAI) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/cai/crear`, datosCAI);
        return res.data;
    } catch (error) {
        throw error;
    }
};

//SERVICIO DE AXIOS PARA VER EL CAI ACTIVO CON ESTADISTICAS
export const verCAIActivo = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/cai/verActivo`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

//SERVICIO DE AXIOS PARA OBTENER LAS ALERTAS DEL CAI ACTIVO
export const obtenerAlertasCAI = async () => {
    try {
        const res = await axiosInstance.get(`${API_URL}/cai/alertas`);
        return res.data;
    }
    catch (error) {
        throw error;
    }
};