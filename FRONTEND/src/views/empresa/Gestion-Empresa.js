import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

import InformacionEmpresa from './informacion-empresa/InformacionEmpresa';
import Sucursales from './sucursales/Sucursales';
import Usuarios from './usuarios/Usuarios';

export default function Empresa() {
  const [tabActiva, setTabActiva] = useState('EMPRESA');

  const tabs = [
    { id: 'EMPRESA', nombre: 'EMPRESA', icono: faBuilding },
    { id: 'SUCURSALES', nombre: 'SUCURSALES', icono: faMapMarkerAlt },
    { id: 'USUARIOS', nombre: 'USUARIOS', icono: faUser }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full px-6">
        {/* Título */}
        <div className="bg-gradient-to-br from-blue-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            GESTIÓN EMPRESARIAL
          </h2>
        </div>
        <p className="text-center text-gray-600 italic">Administra la información de tu empresa, sucursales y usuarios</p>
      </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{boxShadow: '0 0 8px #1c04f440, 0 0 0 1px #4e33ea33'}}>
          <div className="flex border-b-2 border-blue-600/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  tabActiva === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600'
                }`}
                style={tabActiva !== tab.id ? {backgroundColor: '#f0f4f8'} : {}}
              >
                <FontAwesomeIcon icon={tab.icono} className="w-5 h-5" />
                {tab.nombre}
              </button>
            ))}
          </div>

          <div className="p-6" style={{backgroundColor: '#f0f4f8'}}>
            {tabActiva === 'EMPRESA' && <InformacionEmpresa />}
            {tabActiva === 'SUCURSALES' && <Sucursales />}
            {tabActiva === 'USUARIOS' && <Usuarios />}
          </div>
        </div>

      </div>
    </div>
  );
}