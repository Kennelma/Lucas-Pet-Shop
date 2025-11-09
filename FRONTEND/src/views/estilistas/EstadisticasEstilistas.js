import React, { useState, useEffect } from 'react';

const EstadisticasEstilistas = ({ estilistaSeleccionado = null, onClearSelection = null, estilistas = [] }) => {
  // Nota: Las estadísticas  vendrán del backend cuando esté disponible

  // Calcular datos para mostrar
  const obtenerDatosParaMostrar = () => {
    if (estilistaSeleccionado) {
      // Si hay un estilista seleccionado, mostrar sus datos individuales
      return {
        titulo: `${estilistaSeleccionado.nombre_estilista} ${estilistaSeleccionado.apellido_estilista}`,
        subtitulo: `ID: ${estilistaSeleccionado.identidad_estilista}`,
        mascotas: 0, // Será conectado con el backend 
        servicios: 0, // Será conectado con el backend 
        textoMascotas: 'Por este estilista',
        textoServicios: 'Por este estilista',
        iconoPersona: ' Estilista Seleccionado'
      };
    } else {
      // Si no hay selección, mostrar estadísticas generales
      return {
        titulo: 'Aún no hay estilista estrella',
        mascotas: 0, // Será la suma total del equipo
        servicios: 0, // Será la suma total del equipo  
        textoMascotas: 'Total del equipo',
        textoServicios: 'Total del equipo',
        iconoPersona: ' Estadísticas Generales'
      };
    }
  };

  const datosActuales = obtenerDatosParaMostrar();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
      {/* Header */}
      <div className="mb-6 text-center relative">
        {/* Botón Refresh - Esquina superior derecha */}
        {estilistaSeleccionado && onClearSelection && (
          <button
            onClick={() => onClearSelection()}
            className="absolute top-0 right-0 text-black hover:text-gray-600 p-2 rounded-full text-xs transition-all duration-200 hover:bg-gray-100"
            title="Ver datos generales"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        
        <div className="text-xl font-bold text-gray-800 mb-1">
          ESTADÍSTICAS DE RENDIMIENTO
        </div>
        <p className="text-gray-600 text-sm">
          {estilistaSeleccionado 
            ? `DATOS INDIVIDUALES DE ${estilistaSeleccionado.nombre_estilista?.toUpperCase()} ${estilistaSeleccionado.apellido_estilista?.toUpperCase()}`
            : 'MÉTRICAS GENERALES DEL EQUIPO DE PELUQUERÍA'
          }
        </p>
      </div>

      {/* Cards Dinámicas - Se actualizan según estilista seleccionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Card 1: Nombre del Estilista / Info General */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              {datosActuales.iconoPersona}
            </p>
            <p className="text-xl font-bold text-yellow-600 mb-1">
              {datosActuales.titulo}
            </p>
            <p className="text-sm text-gray-500">
              {datosActuales.subtitulo}
            </p>
          </div>
        </div>

        {/* Card 2: Mascotas Atendidas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2"> Mascotas Atendidas</p>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {datosActuales.mascotas}
            </p>
            <p className="text-sm text-blue-500">
              {datosActuales.textoMascotas}
            </p>
          </div>
        </div>

        {/* Card 3: Servicios Realizados */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2"> Servicios Realizados</p>
            <p className="text-3xl font-bold text-green-600 mb-1">
              {datosActuales.servicios}
            </p>
            <p className="text-sm text-green-500">
              {datosActuales.textoServicios}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EstadisticasEstilistas;