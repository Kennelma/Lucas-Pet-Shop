import React, { useState } from "react";


import clienteImage from "../../views/clientes/icon-formulario-clientes.png";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";

import { insertarCliente } from "../../AXIOS.SERVICES/clients-axios.js";

export default function FormularioCliente({ isOpen, onClose, onClienteAgregado }) {

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
            const res = await insertarCliente(nuevoCliente);
            if (res.Consulta !== false) {
                onClienteAgregado();
                onClose();
            } else {
                console.error("Error en la consulta:", res.error);
            }
        } catch (error) {
            console.error("Error al guardar cliente:", error);
        }
    };

    const footer = (
        <div className="flex justify-end gap-3 mt-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={onClose} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
        </div>
    );

    return (

        <Dialog
            header={<div className="w-full text-center text-lg font-bold">NUEVO CLIENTE</div>}
            visible={isOpen}
            style={{ width: '42rem', borderRadius: '1.5rem' }}
            modal
            closable={false}
            onHide={onClose}
            footer={footer}
        >
        <div className="flex flex-row gap-6 mt-2">

            {/*IMAGEN A LA IZQUIERDA*/}
            <div className="flex-shrink-0 flex items-start justify-center pt-3">
                <img
                    src={clienteImage}
                    alt="Cliente"
                    className="w-24 h-30 object-cover rounded-xl border-[1px] border-white"
                />
            </div>

            {/*FORMULARIO A LA DERECHA*/}
            <div className="flex-1 flex flex-col gap-3">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-3">
                    <span>
                        <label htmlFor="nombre_cliente" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE</label>
                        <InputText
                            id="nombre_cliente"
                            name="nombre_cliente"
                            value={nuevoCliente.nombre_cliente}
                            onChange={handleChange}
                            className="w-full rounded-xl h-9 text-sm"
                        />
                    </span>

                    <span>
                        <label htmlFor="apellido_cliente" className="text-xs font-semibold text-gray-700 mb-1">APELLIDO</label>
                        <InputText
                            id="apellido_cliente"
                            name="apellido_cliente"
                            value={nuevoCliente.apellido_cliente}
                            onChange={handleChange}
                            className="w-full rounded-xl h-9 text-sm"
                        />
                    </span>
                </div>

                {/*IDENTIDAD Y TELEFONO*/}
                <div className="grid grid-cols-2 gap-3">
                    <span>
                        <label htmlFor="identidad_cliente" className="text-xs font-semibold text-gray-700 mb-1">IDENTIDAD</label>
                        <InputMask
                            id="identidad_cliente"
                            name="identidad_cliente"
                            value={nuevoCliente.identidad_cliente}
                            onChange={(e) => setNuevoCliente({ ...nuevoCliente, identidad_cliente: e.value })}
                            mask="9999-9999-99999"
                            className="w-full rounded-xl h-9 text-sm"
                            placeholder="0000-0000-00000"
                        />
                    </span>

                    <span>
                        <label htmlFor="telefono_cliente" className="text-xs font-semibold text-gray-700 mb-1">TÉLEFONO</label>
                        <InputText
                            id="telefono_cliente"
                            name="telefono_cliente"
                            value={nuevoCliente.telefono_cliente}
                            onChange={handleChange}
                            className="w-full rounded-xl h-9 text-sm"
                            placeholder="0000-0000"
                        />
                    </span>
                </div>
            </div>

            
        </div>
    </Dialog>
    );
}
