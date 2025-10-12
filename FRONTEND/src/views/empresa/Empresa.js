import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faMapMarkerAlt, faUser } from '@fortawesome/free-solid-svg-icons';

import InformacionEmpresa from './informacion-empresa/InformacionEmpresa';
import Sucursales from './sucursales/Sucursales';
import Usuarios from './usuarios/Usuarios';

export default function Empresa() {
  const [tabActiva, setTabActiva] = useState('EMPRESA');

  const tabs = [
    { id: 'EMPRESA', nombre: 'Empresa', icono: faBuilding },
    { id: 'SUCURSALES', nombre: 'Sucursales', icono: faMapMarkerAlt },
    { id: 'USUARIOS', nombre: 'Usuarios', icono: faUser }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sistema de Gestión</h1>
          <p className="text-gray-600">Administra empresas, sucursales y usuarios</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  tabActiva === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon icon={tab.icono} className="w-5 h-5" />
                {tab.nombre}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tabActiva === 'EMPRESA' && <InformacionEmpresa />}
            {tabActiva === 'SUCURSALES' && <Sucursales />}
            {tabActiva === 'USUARIOS' && <Usuarios />}
          </div>
        </div>

      </div>
    </div>
  );
}