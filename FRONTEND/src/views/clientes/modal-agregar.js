import React, { useState, useRef, useEffect } from "react";
import clienteImage from "../../views/clientes/icon-formulario-clientes.png";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
// ...existing code...
import { insertarCliente } from "../../AXIOS.SERVICES/clients-axios.js";

export default function FormularioCliente({
  isOpen,
  onClose,
  onClienteAgregado,
  identidadInicial = '' // ← Nueva prop
}) {
    // ...existing code...

    const [nuevoCliente, setNuevoCliente] = useState({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nuevoValor = value;
        if (name === "nombre_cliente" || name === "apellido_cliente") {
            nuevoValor = nuevoValor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            nuevoValor = nuevoValor.toUpperCase();
        }
        setNuevoCliente({ ...nuevoCliente, [name]: nuevoValor });
        if (nuevoValor.trim() !== "") {
            setErrores({ ...errores, [name]: false });
        }
    };

    const validacionFormulario = () => {
        const nuevosErrores = {
            nombre_cliente: nuevoCliente.nombre_cliente.trim() === "",
            apellido_cliente: nuevoCliente.apellido_cliente.trim() === "",
            identidad_cliente: nuevoCliente.identidad_cliente.trim() === "",
            telefono_cliente: nuevoCliente.telefono_cliente.trim() === ""
        };
        setErrores(nuevosErrores);
        return !Object.values(nuevosErrores).some(error => error === true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validacionFormulario()) {
            return;
        }
        try {
            const res = await insertarCliente(nuevoCliente);
            if (res.Consulta !== false) {
                // ...existing code...

                onClienteAgregado(nuevoCliente);

                onClose();
                setNuevoCliente({
                    nombre_cliente: "",
                    apellido_cliente: "",
                    identidad_cliente: "",
                    telefono_cliente: ""
                });
                setErrores({
                    nombre_cliente: false,
                    apellido_cliente: false,
                    identidad_cliente: false,
                    telefono_cliente: false
                });
            } else {
                console.error("Error en la consulta:", res.error);
            }
        } catch (error) {
            console.error("Error al guardar cliente:", error);
        }
    };

    const handleCerrarModal = () => {
        setErrores({
            nombre_cliente: false,
            apellido_cliente: false,
            identidad_cliente: false,
            telefono_cliente: false
        });
        setNuevoCliente({
            nombre_cliente: "",
            apellido_cliente: "",
            identidad_cliente: "",
            telefono_cliente: ""
        });
        onClose();
    };

    const footer = (
        <div className="flex justify-end gap-3 mt-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={handleCerrarModal} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
        </div>
    );

    // Resetear y pre-llenar cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (identidadInicial) {
                // Si viene identidad, pre-llenarla
                setNuevoCliente({
                    nombre_cliente: "",
                    apellido_cliente: "",
                    identidad_cliente: identidadInicial, // ← Pre-llenado
                    telefono_cliente: "",
                });
            } else {
                // Si no, resetear todo
                setNuevoCliente({
                    nombre_cliente: "",
                    apellido_cliente: "",
                    identidad_cliente: "",
                    telefono_cliente: "",
                });
            }
            setErrores({});
        }
    }, [isOpen, identidadInicial]);

    return (
        <>

            {/* Modal agregar cliente */}
            <Dialog
                header={<div className="w-full text-center text-lg font-bold">NUEVO CLIENTE</div>}
                visible={isOpen}
                style={{ width: '28rem', borderRadius: '1.5rem' }}
                modal
                closable={false}
                onHide={handleCerrarModal}
                footer={footer}
                position="center"
                dismissableMask={false}
                draggable={false}
                resizable={false}
            >
                <div className="mt-0">
                    {/* Imagen centrada */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={clienteImage}
                            alt="Cliente"
                            className="w-25 h-30 object-cover rounded-xl border border-white"
                        />
                    </div>

                    {/* Formulario */}
                    <div className="flex flex-col gap-3">
                        {/* Nombre del Cliente */}
                        <span>
                            <label htmlFor="nombre_cliente" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL CLIENTE</label>
                            <InputText
                                id="nombre_cliente"
                                name="nombre_cliente"
                                value={nuevoCliente.nombre_cliente}
                                onChange={handleChange}
                                className="w-full rounded-xl h-9 text-sm"
                                placeholder="Ingrese el nombre"
                                autoComplete="off"
                            />
                            {errores.nombre_cliente && <p className="text-xs text-red-600 mt-1">El nombre es requerido</p>}
                        </span>

                        {/* Apellido */}
                        <span>
                            <label htmlFor="apellido_cliente" className="text-xs font-semibold text-gray-700 mb-1">APELLIDO</label>
                            <InputText
                                id="apellido_cliente"
                                name="apellido_cliente"
                                value={nuevoCliente.apellido_cliente}
                                onChange={handleChange}
                                className="w-full rounded-xl h-9 text-sm"
                                placeholder="Ingrese el apellido"
                                autoComplete="off"
                            />
                            {errores.apellido_cliente && <p className="text-xs text-red-600 mt-1">El apellido es requerido</p>}
                        </span>

                        {/* Identidad */}
                        <span>
                            <label htmlFor="identidad_cliente" className="text-xs font-semibold text-gray-700 mb-1">IDENTIDAD</label>
                            <InputMask
                                id="identidad_cliente"
                                name="identidad_cliente"
                                value={nuevoCliente.identidad_cliente}
                                onChange={(e) => {
                                    setNuevoCliente({ ...nuevoCliente, identidad_cliente: e.value });
                                    if (e.value && e.value.trim() !== "") {
                                        setErrores({ ...errores, identidad_cliente: false });
                                    }
                                }}
                                mask="9999-9999-99999"
                                placeholder="0000-0000-00000"
                                className="w-full rounded-xl h-9 text-sm"
                                autoComplete="off"
                            />
                            {errores.identidad_cliente && <p className="text-xs text-red-600 mt-1">La identidad es requerida</p>}
                        </span>

                        {/* Teléfono */}
                        <span>
                            <label htmlFor="telefono_cliente" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
                            <InputMask
                                id="telefono_cliente"
                                name="telefono_cliente"
                                value={nuevoCliente.telefono_cliente}
                                onChange={(e) => {
                                    setNuevoCliente({ ...nuevoCliente, telefono_cliente: e.value });
                                    if (e.value && e.value.trim() !== "-") {
                                        setErrores({ ...errores, telefono_cliente: false });
                                    }
                                }}
                                mask="9999-9999"
                                placeholder="0000-0000"
                                className="w-full rounded-xl h-9 text-sm"
                                autoComplete="off"
                            />
                            {errores.telefono_cliente && <p className="text-xs text-red-600 mt-1">El teléfono es requerido</p>}
                        </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
