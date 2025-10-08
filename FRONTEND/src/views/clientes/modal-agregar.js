import React, { useState } from "react";


import clienteImage from "../../views/clientes/icon-formulario-clientes.png";

import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";

import { insertarCliente } from "../../AXIOS.SERVICES/clients-axios.js";


export default function FormularioCliente({ isOpen, onClose, onClienteAgregado }) {

    //ESTADOS A USAR
    const toast = useRef(null);

    //ESTADO PARA PREPARAR EL REGISTRO DEL CLIENTE CON SUS CAMPOS
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre_cliente: "",
        apellido_cliente: "",
        identidad_cliente: "",
        telefono_cliente: ""
    });

    //CONSTANTE QUE ME NORMALIZA EL TEXTO 
    const capitalizar = (texto) => {
    if (!texto) return "";
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    //ESTADO QUE ENVIA ESTE CLIENTE 
    const handleChange = (e) => {
        const {name, value} = e.target;

        let nuevoValor = value;
        if (name === "nombre_cliente" || name === "apellido_cliente") {
            nuevoValor = nuevoValor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
            nuevoValor = capitalizar(nuevoValor);
        }

        setNuevoCliente({ ...nuevoCliente, [name]: nuevoValor })

        //SE LIMPIAN LOS ERRORES CUANDO SE EMPIEZA A LLENAR LOS DATOS FALTANTE
        if (nuevoValor.trim() !== "") {
            setErrores({ ...errores, [name]: false });
        }

    };

    //ESTADO PARA EL MANEJO DE ERRORES EN EL FORMULARIO
    const [errores, setErrores] = useState ({
        nombre_cliente: false, 
        apellido_cliente: false, 
        identidad_cliente: false, 
        telefono_cliente: false
    });

    //FUNCION QUE VALIDA 
    const validacionFormulario =() => {
        const nuevosErrores = {
            nombre_cliente: nuevoCliente.nombre_cliente.trim() === "",
            apellido_cliente: nuevoCliente.apellido_cliente.trim() === "",
            identidad_cliente: nuevoCliente.identidad_cliente.trim() === "",
            telefono_cliente: nuevoCliente.telefono_cliente.trim() === ""
        };
        setErrores(nuevosErrores); 
        //RETORNA SI NO HAY ERRORES
        return !Object.values(nuevosErrores).some(error => error === true);
    };


    //ESTADO DEL BOTON DE GUARDAR CLIENTE
    const handleSubmit = async (e) => {
        e.preventDefault();

        //SE VALIDA ANTES DE ENVIAR
        if(!validacionFormulario()){
            return;
        }

        try {
            const res = await insertarCliente(nuevoCliente);
            if (res.Consulta !== false) {

                toast.current.show({
                    severity: 'success',
                    summary: 'Registrado',
                    detail: `Cliente ${nuevoCliente.nombre_cliente} ${nuevoCliente.apellido_cliente} registrado correctamente`,
                    life: 3000
                });
                onClienteAgregado();
                onClose();
    
                //SE LIMPIA LOS ERRORES SI SE INGRESAN LOS DATOS FALTANTES
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
        //SE RESETEAN LOS VALORES SI NO INGRESO NADA
        setErrores({
            nombre_cliente: false,
            apellido_cliente: false,
            identidad_cliente: false,
            telefono_cliente: false
        });
        //RESETEO LOS CAMPOS
        setNuevoCliente({
            nombre_cliente: "",
            apellido_cliente: "",
            identidad_cliente: "",
            telefono_cliente: ""
        });
        onClose(); //CIERRO EL MODAL
    };

    const footer = (
        <div className="flex justify-end gap-3 mt-2">
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={handleCerrarModal} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} />
        </div>
    );

    return (

        <>
        <Toast ref={toast} position="top-center" />
        
        <Dialog
            header={<div className="w-full text-center text-lg font-bold">NUEVO CLIENTE</div>}
            visible={isOpen}
            style={{ width: '42rem', borderRadius: '1.5rem' }}
            modal
            closable={false}
            onHide={handleCerrarModal}
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
                        <label htmlFor="nombre_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                            NOMBRE {errores.nombre_cliente && <span className="text-red-500">*</span>}
                        </label>
                        <InputText
                            id="nombre_cliente"
                            name="nombre_cliente"
                            value={nuevoCliente.nombre_cliente}
                            onChange={handleChange}
                            className={`w-full rounded-xl h-9 text-sm ${errores.nombre_cliente ? 'p-invalid' : ''}`}
                            autoComplete="off"
                        />
                            {errores.nombre_cliente && (<small className="text-red-500 ">Campo obligatorio</small>)}
                            
                    </span>

                    <span>
                        <label htmlFor="apellido_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                            APELLIDO {errores.apellido_cliente && <span className="text-red-500">*</span>}
                        </label>
                        <InputText
                            id="apellido_cliente"
                            name="apellido_cliente"
                            value={nuevoCliente.apellido_cliente}
                            onChange={handleChange}   
                            className={`w-full rounded-xl h-9 text-sm ${errores.apellido_cliente ? 'p-invalid' : ''}`}
                            autoComplete="off"
                        />
                            {errores.apellido_cliente && (<small className="text-red-500">Campo obligatorio</small>)}
                            
                    </span>
                </div>

                {/*IDENTIDAD Y TELEFONO*/}
                <div className="grid grid-cols-2 gap-3">
                    <span>
                        <label htmlFor="identidad_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                            IDENTIDAD {errores.identidad_cliente && <span className="text-red-500">*</span>}
                        </label>
                        <InputMask
                            id="identidad_cliente"
                            name="identidad_cliente"
                            value={nuevoCliente.identidad_cliente}
                            onChange={(e) => {
                                    setNuevoCliente({ ...nuevoCliente, identidad_cliente: e.value });
                                    //LIMPIA CUANDO EL USUARIO EMPEIZA A ESCRIBIR
                                    if (e.value && e.value.trim() !== "") {
                                        setErrores({ ...errores, identidad_cliente: false });
                                    }
                                }}
                            mask="9999-9999-99999"
                            placeholder="0000-0000-00000"
                            className={`w-full rounded-xl h-9 text-sm ${errores.identidad_cliente ? 'p-invalid' : ''}`}
                            autoComplete="off"
                        />
                            {errores.identidad_cliente && (<small className="text-red-500">Campo obligatorio</small>)}
                            
                    </span>

                    <span>
                        <label htmlFor="telefono_cliente" className="text-xs font-semibold text-gray-700 mb-1">
                            TÉLEFONO {errores.telefono_cliente && <span className="text-red-500">*</span>}
                        </label>
                        <InputMask
                            id="telefono_cliente"
                            name="telefono_cliente"
                            value={nuevoCliente.telefono_cliente}
                            onChange={(e) => {
                                setNuevoCliente({ ...nuevoCliente, telefono_cliente: e.value });

                                // Quita el error solo si la máscara está completa
                                if (e.value && e.value.trim() !== "-") {
                                        setErrores({ ...errores, telefono_cliente: false });
                                }
                            }}
                            mask="9999-9999"
                            placeholder="0000-0000"
                            className={`w-full rounded-xl h-9 text-sm ${errores.telefono_cliente ? 'p-invalid' : ''}`}
                            autoComplete="off"
                        />
                            {errores.telefono_cliente && (<small className="text-red-500">Campo obligatorio</small>)}
                    </span>
                </div>
            </div>

            
        </div>
    </Dialog>
    </>
    );
}