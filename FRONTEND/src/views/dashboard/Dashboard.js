
import axios from "axios";

import React, { Suspense, useEffect, useState} from 'react'




const Dashboard = () => {

  const API_URL = "http://localhost:4000/api"; // <- tu backend en el nuevo puerto


  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/usuarios/ver`)
      .then(res => setUsuarios(res.data.datos || []))
      .catch(err => console.error("Error al traer usuarios:", err));
  }, []);


  
  return (
    <div className="p-6">
      {/*Estilo inline para comparar */}
      <div style={{backgroundColor: 'red', color: 'white', padding: '16px', marginBottom: '10px'}}>
        1. Estilo inline (debería verse rojo)
      </div>
      
      {/*Tarjetas con Tailwind*/}
      <div className="bg-green-500 text-white p-4 mb-4 rounded-lg shadow-lg">
        2. Fondo verde con Tailwind (tarjeta)
      </div>
      
      <div className="bg-blue-500 text-white p-4 mb-4 rounded-lg shadow-lg">
        3. Fondo azul con Tailwind (tarjeta)
      </div>
      
      <div className="bg-red-500 text-white p-4 mb-4 rounded-lg shadow-lg">
        4. Fondo rojo con Tailwind (tarjeta)
      </div>

      <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {usuarios.length > 0 && Object.keys(usuarios[0]).map((campo) => (
                <th
                  key={campo}
                  className="text-left px-4 py-2 border-b border-gray-300"
                >
                  {campo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.keys(u).map((campo) => (
                  <td key={campo} className="px-4 py-2 border-b border-gray-200">
                    {u[campo]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      





    </div>

  )
}

export default Dashboard
