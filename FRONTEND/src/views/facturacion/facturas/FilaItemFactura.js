import React from 'react';
import { Trash2, X } from 'lucide-react';

// Este componente representa una sola fila de la tabla de detalles de factura
const FilaItemFactura = ({
    item,
    actualizarItem,
    eliminarItem,
    estilistasDisponibles,
    agregarEstilistaAItem,
    eliminarEstilistaDeItem,
    formatCurrency
}) => {

    // Alias para el item (puedes usar 'item' directamente si prefieres)
    const itemEjemplo = item;

    return (
        <tr key={itemEjemplo.id} className="border-b hover:bg-gray-50">
            <td className="py-2 px-2 align-top w-28">
                <select
                    value={itemEjemplo.tipo_item}
                    // NOTA: En la implementación real, deberías pasar un id único del item aquí:
                    onChange={(e) => actualizarItem(itemEjemplo.id, "tipo_item", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="SERVICIO">Servicio</option>
                    <option value="PRODUCTO">Producto</option>
                    <option value="PROMOCION">Promoción</option>
                </select>
            </td>

            {/* Descripción + Estilistas */}
            <td className="py-2 px-2 align-top min-w-48">
                <div>
                    <input
                        type="text"
                        value={itemEjemplo.descripcion}
                        onChange={(e) => actualizarItem(itemEjemplo.id, "descripcion", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-2 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Descripción del item"
                    />

                    <div className="flex flex-wrap gap-2 items-start">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {itemEjemplo.tipo_item}
                        </span>

                        {/* Selector de estilistas */}
                        {(itemEjemplo.tipo_item === "SERVICIO" || itemEjemplo.tipo_item === "PROMOCION") && (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        agregarEstilistaAItem(itemEjemplo.id, e.target.value);
                                        // Esto limpia la selección después de agregar
                                        e.target.value = "";
                                    }
                                }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded max-w-28 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">+ Estilista</option>
                                {/* Filtra los estilistas ya asignados */}
                                {estilistasDisponibles.filter(e => !itemEjemplo.estilistas.includes(e)).map((e) => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        )}

                        {/* Chips de estilistas asignados */}
                        {itemEjemplo.estilistas && itemEjemplo.estilistas.map((est) => (
                            <span
                                key={est}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                                {est}
                                <button
                                    onClick={() => eliminarEstilistaDeItem(itemEjemplo.id, est)}
                                    className="text-blue-600 hover:text-blue-900 ml-1"
                                    aria-label={`Eliminar estilista ${est}`}
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </td>

            {/* Cantidad/Mascotas */}
            <td className="py-2 px-2 align-top w-20">
                <input
                    type="number"
                    min="1"
                    // Asume que si es producto se usa 'cantidad', si es servicio/promoción se usa 'num_mascotas'
                    value={itemEjemplo.cantidad || itemEjemplo.num_mascotas || ""}
                    onChange={(e) => actualizarItem(itemEjemplo.id, itemEjemplo.tipo_item === "PRODUCTO" ? "cantidad" : "num_mascotas", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center focus:border-blue-500 focus:ring-blue-500"
                    placeholder={itemEjemplo.tipo_item === "PRODUCTO" ? "Cant." : "# Masc."}
                />
            </td>

            {/* Precio Unitario */}
            <td className="py-2 px-2 align-top w-24">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemEjemplo.precio_unitario || ""}
                    onChange={(e) => actualizarItem(itemEjemplo.id, "precio_unitario", e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                />
            </td>

            {/* Ajuste */}
            <td className="py-2 px-2 align-top w-24">
                {itemEjemplo.tipo_item !== "PRODUCTO" ? (
                    <input
                        type="number"
                        step="0.01"
                        value={itemEjemplo.ajuste_precio || ""}
                        onChange={(e) => actualizarItem(itemEjemplo.id, "ajuste_precio", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-right focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                    />
                ) : (
                    <span className="text-gray-400 text-xs block text-center py-1">-</span>
                )}
            </td>

            {/* Total de Línea */}
            <td className="py-2 px-2 align-top text-right font-semibold w-24">
                {formatCurrency(itemEjemplo.total_linea)}
            </td>

            {/* Eliminar */}
            <td className="py-2 px-2 align-top text-center w-12">
                <button
                    onClick={() => eliminarItem(itemEjemplo.id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                    aria-label="Eliminar ítem"
                >
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
};

export default FilaItemFactura;