import React, { useState } from "react";
import { Trash2, Percent, X } from 'lucide-react';
import FilaItemFactura from "./FilaItemFactura";

// --- Funciones de Utilidad ---

// Formato de moneda
const formatCurrency = (value) => {
    const num = Number(value);
    return !isNaN(num) ? `L ${num.toFixed(2)}` : 'L 0.00';
};

// Generador de ID simple para las nuevas filas
let nextId = 1000;

// Estructura de un ítem vacío
const ITEM_VACIO = {
    id: null,
    tipo_item: "SERVICIO",
    descripcion: "",
    cantidad: 1,
    num_mascotas: 1,
    precio_unitario: 0.00,
    ajuste_precio: 0.00,
    // Este campo se llenará o actualizará después de la llamada al backend.
    total_linea: 0.00,
    estilistas: [],
};

// Lista de estilistas (Datos estáticos de ejemplo)
const estilistasDisponibles = ["Ana", "Beto", "Carlos", "Diana"];

// --- Componente Principal ---

const DetallesFactura = () => {

    // 1. Estado principal para los ítems de la factura (INICIA VACÍO)
    const [itemsFactura, setItemsFactura] = useState([]);

    // 2. Estado para el descuento y su visibilidad
    const [descuento, setDescuento] = useState(0);
    const [mostrarDescuento, setMostrarDescuento] = useState(false);

    // 3. Estado para totales recibidos del backend (asumimos un objeto)
    const [totalesBackend, setTotalesBackend] = useState({
        subtotalBruto: 0,
        descuentoAplicado: 0, // Usamos el estado 'descuento' directamente
        subtotalNeto: 0,
        impuestoCalculado: 0,
        totalFinal: 0,
    });


    // ----------------------------------------------------------------------
    // --- LÓGICA DE SIMULACIÓN DE CÁLCULO DESDE BACKEND (Nueva Función) ---
    // ----------------------------------------------------------------------

    /**
     * @description Esta función simula el envío de datos al backend para calcular totales
     * y actualizar los estados locales con la respuesta.
     * (En una app real, esta función haría un 'fetch' o 'axios.post')
     */
    const calcularTotalesBackend = (items, desc) => {

        // 1. Simular cálculo de subtotal basado en 'items.total_linea'
        const sb = items.reduce((sum, item) => sum + Number(item.total_linea || 0), 0);

        // 2. Aplicar descuento local
        const descAplicado = Number(desc || 0);
        const sn = sb - descAplicado;

        // 3. Simular cálculo de Impuesto y Total (Tasa 15%)
        const IMPUESTO_RATE = 0.15;
        const ic = sn > 0 ? sn * IMPUESTO_RATE : 0;
        const tf = sn + ic;

        // NOTA: Aquí se actualizaría el 'total_linea' de cada ítem si el backend lo enviara.

        setTotalesBackend({
            subtotalBruto: sb,
            descuentoAplicado: descAplicado,
            subtotalNeto: sn,
            impuestoCalculado: ic,
            totalFinal: tf,
        });

        console.log("Datos de ítems y descuento enviados al backend para recalcular.");
    };

    // --- LÓGICA DE GESTIÓN DE ITEMS ---

    /**
     * @description Añade un nuevo ítem vacío al final de la lista.
     */
    const agregarFilaVacia = () => {
        const nuevoItem = { ...ITEM_VACIO, id: nextId++ };
        const newItems = [...itemsFactura, nuevoItem];
        setItemsFactura(newItems);
        // Opcional: Recalcular totales inmediatamente para mostrar 0.00
        // calcularTotalesBackend(newItems, descuento);
    };

    /**
     * @description Elimina un ítem de la lista por su ID.
     */
    const eliminarItem = (id) => {
        const newItems = itemsFactura.filter(item => item.id !== id);
        setItemsFactura(newItems);
        // Después de eliminar, recalculamos para actualizar los totales
        calcularTotalesBackend(newItems, descuento);
    };

    /**
     * @description Actualiza un campo específico de un ítem.
     */
    const actualizarItem = (id, campo, valor) => {
        const newItems = itemsFactura.map(item => {
            if (item.id === id) {
                const newItem = { ...item, [campo]: valor };

                // Mantenemos la lógica de limpieza de campos al cambiar el tipo
                if (campo === "tipo_item") {
                    newItem.cantidad = newItem.tipo_item === "PRODUCTO" ? 1 : 0;
                    newItem.num_mascotas = newItem.tipo_item !== "PRODUCTO" ? 1 : 0;
                    if (newItem.tipo_item === "PRODUCTO") {
                        newItem.estilistas = [];
                        newItem.ajuste_precio = 0.00;
                    }
                }

                // NOTA IMPORTANTE: Ya NO calculamos el total_linea aquí.
                // Asumimos que el input es guardado y luego el backend lo calcula.

                return newItem;
            }
            return item;
        });

        setItemsFactura(newItems);

        // Opcional: Llamar a calcularTotalesBackend si se considera necesario
        // Pero es más común que esto se haga solo al guardar o al perder foco del input.
    };

    // --- LÓGICA DE ESTILISTAS ---
    const agregarEstilistaAItem = (itemId, estilista) => {
        // ... (misma lógica) ...
        const newItems = itemsFactura.map(item => {
            if (item.id === itemId && !item.estilistas.includes(estilista)) {
                return { ...item, estilistas: [...item.estilistas, estilista] };
            }
            return item;
        });
        setItemsFactura(newItems);
    };

    const eliminarEstilistaDeItem = (itemId, estilista) => {
        // ... (misma lógica) ...
        const newItems = itemsFactura.map(item => {
            if (item.id === itemId) {
                return { ...item, estilistas: item.estilistas.filter(e => e !== estilista) };
            }
            return item;
        });
        setItemsFactura(newItems);
    };

    // --- Funciones de Acción ---
    const guardarFactura = () => {
        console.log("Guardando factura. Enviando items y descuento a API...");
        // 1. Llamada a API (simulada aquí con la función de cálculo)
        calcularTotalesBackend(itemsFactura, descuento);
        // 2. Luego, llamada final al endpoint de guardar.
        alert("Factura guardada. Verifique la consola para ver la data.");
    };

    const limpiarFactura = () => {
        setItemsFactura([]);
        setDescuento(0);
        setMostrarDescuento(false);
        setTotalesBackend({ subtotalBruto: 0, descuentoAplicado: 0, subtotalNeto: 0, impuestoCalculado: 0, totalFinal: 0, });
    };

    // Se usa un efecto para recalcular totales cada vez que cambia el descuento
    React.useEffect(() => {
        calcularTotalesBackend(itemsFactura, descuento);
    }, [descuento, itemsFactura]); // Esto simula que los cálculos se actualizan siempre


    // --- RENDERIZADO ---
    return (
        <>
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Detalles de facturas
                </h3>
                <div className="overflow-x-auto border border-gray-300 rounded">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                                <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Cant.</th>
                                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Precio Unit.</th>
                                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Ajuste</th>
                                <th className="text-right py-2 px-2 text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 uppercase w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsFactura.map((item) => (
                                <FilaItemFactura
                                    key={item.id}
                                    item={item}
                                    actualizarItem={actualizarItem}
                                    eliminarItem={eliminarItem}
                                    estilistasDisponibles={estilistasDisponibles}
                                    agregarEstilistaAItem={agregarEstilistaAItem}
                                    eliminarEstilistaDeItem={eliminarEstilistaDeItem}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Botón Agregar detalle */}
                <div className="mt-3">
                    <button
                        onClick={agregarFilaVacia}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
                    >
                        ➕ Agregar detalle
                    </button>
                </div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Totales y Botones de acción */}
            <div className="flex justify-between items-end mt-4">
                {/* Botones de Guardar/Limpiar */}
                <div className="space-x-2">
                    <button
                        onClick={guardarFactura}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md text-sm"
                    >
                        Guardar Factura
                    </button>
                    <button
                        onClick={limpiarFactura}
                        className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                    >
                        Limpiar
                    </button>
                </div>

                {/* BLOQUE DE TOTALES */}
                <div className="flex flex-col items-end gap-2 w-full max-w-xs">
                    {/* Botón AGREGAR DESCUENTO */}
                    {!mostrarDescuento && (
                        <button
                            onClick={() => setMostrarDescuento(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center mb-1 transition-colors"
                        >
                            <Percent size={12} className="mr-1" />
                            <span>Agregar descuento</span>
                        </button>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 w-full">
                        <div className="space-y-1.5">
                            {/* Subtotal Bruto */}
                            <div className="flex justify-between text-gray-700 text-sm gap-8">
                                <span className="font-medium">Subtotal:</span>
                                {/* Usa los totales del backend */}
                                <span className="font-semibold">{formatCurrency(totalesBackend.subtotalBruto)}</span>
                            </div>

                            {/* Input de descuento */}
                            {mostrarDescuento && (
                                <>
                                    <div className="flex items-center gap-2 border-t border-gray-200 pt-1">
                                        <span className="text-xs font-medium text-red-700">Descuento (-):</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={descuento || ""}
                                            onChange={(e) => setDescuento(Number(e.target.value))}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-right text-red-600 focus:border-red-500 focus:ring-red-500"
                                            placeholder="0.00"
                                        />
                                        <button
                                            onClick={() => {
                                                setDescuento(0);
                                                setMostrarDescuento(false);
                                            }}
                                            className="text-red-600 hover:text-red-800 p-0.5 rounded"
                                            aria-label="Quitar descuento"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {/* Subtotal Neto */}
                                    <div className="flex justify-between text-gray-700 text-sm gap-8 border-b border-gray-200 pb-1">
                                        <span className="font-medium">Subtotal Neto:</span>
                                        {/* Usa los totales del backend */}
                                        <span className="font-semibold">{formatCurrency(totalesBackend.subtotalNeto)}</span>
                                    </div>
                                </>
                            )}

                            {/* IVA */}
                            <div className="flex justify-between text-gray-700 text-sm gap-8">
                                <span className="font-medium">IVA (15%):</span>
                                {/* Usa los totales del backend */}
                                <span className="font-semibold">{formatCurrency(totalesBackend.impuestoCalculado)}</span>
                            </div>

                            {/* TOTAL */}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-1.5 border-t-2 border-gray-400 gap-8">
                                <span>TOTAL:</span>
                                {/* Usa los totales del backend */}
                                <span>{formatCurrency(totalesBackend.totalFinal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetallesFactura;