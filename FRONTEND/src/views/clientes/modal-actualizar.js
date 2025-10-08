import React, { useState, useEffect } from "react";

import clienteImage from "../../views/clientes/icon-formulario-clientes.png";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";


import { actualizarCliente } from "../../AXIOS.SERVICES/clients-axios.js";


export default function FormularioActualizarCliente({ isOpen, onClose, cliente, onClienteActualizado }) {

    const toast = useRef(null);

    const [clienteData, setClienteData] = useState({
        id_cliente: "",
        nombre_cliente: "",
        apellido_cliente: "",
        identidad_cliente: "",
        telefono_cliente: ""
    });

    const [errores, setErrores] = useState({
        nombre_cliente: false,
        apellido_cliente: false,
        identidad_cliente: false,
        telefono_cliente: false
    });

    //DATOS QUE SE MUESTRAN AL ABRIR EL MODAL
    useEffect(() => {
    if (cliente) {
        setClienteData({
            id_cliente: cliente.id_cliente_pk || "",
            nombre_cliente: cliente.nombre_cliente || "",
            apellido_cliente: cliente.apellido_cliente || "",
            identidad_cliente: cliente.identidad_cliente || "",
            telefono_cliente: cliente.telefono_cliente || "",
            indexVisual: cliente.indexVisual || null
        });
    }
    }, [cliente]);


    const capitalizar = (texto) => {
        if (!texto) return "";
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let nuevoValor = value;
        if (name === "nombre_cliente" || name === "apellido_cliente") {
            nuevoValor = nuevoValor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            nuevoValor = capitalizar(nuevoValor);
        }

        setClienteData({ ...clienteData, [name]: nuevoValor });

        if (nuevoValor.trim() !== "") {
            setErrores({ ...errores, [name]: false });
        }
    };

    const validacionFormulario = () => {
        const nuevosErrores = {
            nombre_cliente: clienteData.nombre_cliente.trim() === "",
            apellido_cliente: clienteData.apellido_cliente.trim() === "",
            identidad_cliente: clienteData.identidad_cliente.trim() === "",
            telefono_cliente: clienteData.telefono_cliente.trim() === ""
        };
        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(error => error === true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validacionFormulario()) return;

        try {
            const res = await actualizarCliente(clienteData);

            if (res.Consulta !== false) {
                
                onClienteActualizado();
                handleCerrarModal();
                toast.current.show({ 
                    severity: 'success', 
                    summary: 'Actualizado', 
                    detail: `Cliente ${clienteData.nombre_cliente} (ID: ${clienteData.indexVisual}) actualizado con éxito`, 
                    life: 2000 
                });
            } else {
                console.error("Error en la consulta:", res.error);
            }
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
        }
    };

    //CUANDO SE CIERRA
    const handleCerrarModal = () => {
        setErrores({
            nombre_cliente: false,
            apellido_cliente: false,
            identidad_cliente: false,
            telefono_cliente: false
        });
        onClose();
    };

    const footer = (
        <div className="flex justify-end gap-3 mt-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={handleCerrarModal} />
            <Button label="Actualizar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
        </div>
    );

    return (

        <>
            <Toast ref={toast} position="top-center" />

        <Dialog

            header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR CLIENTE</div>}
            visible={isOpen}
            style={{ width: '42rem', borderRadius: '1.5rem' }}
            modal
            closable={false}
            onHide={handleCerrarModal}
            footer={footer}
        >
            <div className="flex flex-row gap-6 mt-2">

                {/* Imagen */}
                <div className="flex-shrink-0 flex items-start justify-center pt-3">
                    <img
                        src={clienteImage}
                        alt="Cliente"
                        className="w-24 h-30 object-cover rounded-xl border-[1px] border-white"
                    />
                </div>

                {/* Formulario */}
                <div className="flex-1 flex flex-col gap-3">
                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-3">
                        <span>
                            <label htmlFor="nombre_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                                NOMBRE {errores.nombre_cliente && <span className="text-red-500">*</span>}
                            </label>
                            <InputText
                                id="nombre_cliente"
                                name="nombre_cliente"
                                value={clienteData.nombre_cliente}
                                onChange={handleChange}
                                className={`w-full rounded-xl h-9 text-sm ${errores.nombre_cliente ? 'p-invalid' : ''}`}
                                autoComplete="off"
                            />
                            {errores.nombre_cliente && (<small className="text-red-500 text-[10px]">Campo obligatorio</small>)}
                        </span>

                        <span>
                            <label htmlFor="apellido_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                                APELLIDO {errores.apellido_cliente && <span className="text-red-500">*</span>}
                            </label>
                            <InputText
                                id="apellido_cliente"
                                name="apellido_cliente"
                                value={clienteData.apellido_cliente}
                                onChange={handleChange}
                                className={`w-full rounded-xl h-9 text-sm ${errores.apellido_cliente ? 'p-invalid' : ''}`}
                                autoComplete="off"
                            />
                            {errores.apellido_cliente && (<small className="text-red-500 text-[10px]">Campo obligatorio</small>)}
                        </span>
                    </div>

                    {/* Identidad y Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <span>
                            <label htmlFor="identidad_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                                IDENTIDAD {errores.identidad_cliente && <span className="text-red-500">*</span>}
                            </label>
                            <InputMask
                                id="identidad_cliente"
                                name="identidad_cliente"
                                value={clienteData.identidad_cliente}
                                onChange={(e) => {
                                    setClienteData({ ...clienteData, identidad_cliente: e.value });
                                    if (e.value && e.value.trim() !== "-") {
                                        setErrores({ ...errores, identidad_cliente: false });
                                    }
                                }}
                                mask="9999-9999-99999"
                                placeholder="0000-0000-00000"
                                className={`w-full rounded-xl h-9 text-sm ${errores.identidad_cliente ? 'p-invalid' : ''}`}
                                autoComplete="off"
                            />
                            {errores.identidad_cliente && (<small className="text-red-500 text-[10px]">Campo obligatorio</small>)}
                        </span>

                        <span>
                            <label htmlFor="telefono_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                                TÉLEFONO {errores.telefono_cliente && <span className="text-red-500">*</span>}
                            </label>
                            <InputMask
                                id="telefono_cliente"
                                name="telefono_cliente"
                                value={clienteData.telefono_cliente}
                                mask="9999-9999"
                                placeholder="0000-0000"
                                className={`w-full rounded-xl h-9 text-sm ${errores.telefono_cliente ? 'p-invalid' : ''}`}
                                onChange={(e) => {
                                    setClienteData({ ...clienteData, telefono_cliente: e.value });
                                    if (e.value && e.value.trim() !== "-") {
                                        setErrores({ ...errores, telefono_cliente: false });
                                    }
                                }}
                                autoComplete="off"
                            />
                            {errores.telefono_cliente && (<small className="text-red-500 text-[10px]">Campo obligatorio</small>)}
                        </span>
                    </div>
                </div>
            </div>
        </Dialog>
        </>
    );
}
