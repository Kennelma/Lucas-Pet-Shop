import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";

//import { insertarRegistro } from "../../services/apiService.js";

export default function FormularioCliente({ onClose, onClienteAgregado }) {
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre_cliente: "",
        apellido_cliente: "",
        identidad_cliente: "",
        telefono_cliente: ""
    });

    const handleChange = (e) => {
        setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await insertarRegistro("tbl_clientes", nuevoCliente);
            onClienteAgregado();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-xl"
                onClick={onClose}
            >
                &times;
            </button>

            <h2 className="flex-grow text-center text-lg font-medium text-gray-700 font-poppins">NUEVO CLIENTE</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Nombre y Apellido en la misma fila */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="nombre_cliente" className="block text-gray-600 mb-1">NOMBRE</label>
                        <InputText 
                            id="nombre_cliente"
                            name="nombre_cliente"
                            value={nuevoCliente.nombre_cliente}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="apellido_cliente" className="block text-gray-600 mb-1">APELLIDO</label>
                        <InputText 
                            id="apellido_cliente"
                            name="apellido_cliente"
                            value={nuevoCliente.apellido_cliente}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                </div>

                {/* Identidad */}
                <div>
                    <label htmlFor="identidad_cliente" className="block text-gray-600 mb-1">IDENTIDAD</label>
                    <InputMask 
                        id="identidad_cliente"
                        value={nuevoCliente.identidad_cliente}
                        onChange={handleChange}
                        mask="0000-00000-000000"
                        placeholder="0000-00000-000000"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label htmlFor="telefono_cliente" className="block text-gray-600 mb-1">TELÉFONO</label>
                    <InputText 
                        id="telefono_cliente"
                        name="telefono_cliente"
                        type="tel"
                        value={nuevoCliente.telefono_cliente}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <Button type="submit" label="Guardar" className="w-full mt-2" />
            </form>
        </div>
    );
}