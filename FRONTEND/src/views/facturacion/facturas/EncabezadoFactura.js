import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { InputMask } from 'primereact/inputmask';
import { buscarCliente } from '../../../AXIOS.SERVICES/factura-axios';
import FormularioCliente from '../../clientes/modal-agregar';

const EncabezadoFactura = ({
  identidad,
  setIdentidad = () => {},
  RTN,
  setRTN = () => {},
  nombreCliente,
  setNombreCliente = () => {},
  fecha,
  onFechaChange,
  vendedor,
  sucursal,
}) => {
  const [internalFecha, setInternalFecha] = useState('');
  const [identidadBusqueda, setIdentidadBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [identidadTemp, setIdentidadTemp] = useState('');

  const toDateTimeLocal = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    const tick = () => {
      const now = toDateTimeLocal(new Date());
      onFechaChange?.(now);
      if (!onFechaChange) setInternalFecha(now);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onFechaChange]);

  const fechaValue = fecha ? fecha : internalFecha;

  // Búsqueda dinámica por identidad
  useEffect(() => {
    const onlyDigits = identidadBusqueda.replace(/\D/g, '');
    if (onlyDigits.length < 8) {
      setClienteEncontrado(false);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const lista = await buscarCliente(identidadBusqueda);
        const c = lista[0];
        if (c) {
          setIdentidad(c.identidad);
          setNombreCliente(`${c.nombre} ${c.apellido}`.trim());
          setRTN('');
          setClienteEncontrado(true);
        } else {
          setClienteEncontrado(false);
        }
      } catch (e) {
        console.error('Error buscarCliente:', e);
        setClienteEncontrado(false);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [identidadBusqueda, setIdentidad, setNombreCliente, setRTN]);

  // Manejo cuando se pierde el foco del input (onBlur)
  const handleBlurBusqueda = async () => {
    if (clienteEncontrado) return; // Si ya encontró el cliente, no hacer nada

    const onlyDigits = identidadBusqueda.replace(/\D/g, '');
    if (onlyDigits.length < 8) return; // Si no tiene suficientes dígitos, no hacer nada

    // Esperar un poco para asegurarse que la búsqueda automática termine
    setTimeout(async () => {
      if (clienteEncontrado) return; // Verificar de nuevo

      try {
        const lista = await buscarCliente(identidadBusqueda);
        const c = lista[0];

        if (!c) {
          // Cliente no encontrado - Mostrar confirmación
          const agregar = window.confirm(
            `No se encontró un cliente con identidad "${identidadBusqueda}".\n\n¿Desea agregar este cliente al sistema?`
          );

          if (agregar) {
            setIdentidadTemp(identidadBusqueda);
            setShowModalCliente(true);
          } else {
            // Usuario dijo NO - Poner CONSUMIDOR FINAL
            setIdentidad(identidadBusqueda);
            setNombreCliente('CONSUMIDOR FINAL');
            setRTN('');
            setClienteEncontrado(true);
            setIdentidadBusqueda('');
          }
        } else {
          // Por si acaso, rellenar datos
          setIdentidad(c.identidad);
          setNombreCliente(`${c.nombre} ${c.apellido}`.trim());
          setRTN('');
          setClienteEncontrado(true);
          setIdentidadBusqueda('');
        }
      } catch (e) {
        console.error('Error al buscar cliente (blur):', e);
      }
    }, 600);
  };

  // Cuando se agrega un cliente desde el modal
  const handleClienteAgregado = (nuevoCliente) => {
    if (nuevoCliente) {
      setIdentidad(nuevoCliente.identidad_cliente || identidadTemp);
      setNombreCliente(`${nuevoCliente.nombre_cliente} ${nuevoCliente.apellido_cliente}`.trim());
      setRTN('');
      setClienteEncontrado(true);
    }
    setShowModalCliente(false);
    setIdentidadBusqueda('');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-3">Factura</h1>

        <div className="grid grid-cols-3 gap-3 items-end mb-4 border-b pb-4 border-gray-200">
          {/* IDENTIDAD CON BÚSQUEDA Y MÁSCARA */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar Cliente (Identidad)*
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
              <InputMask
                value={identidad}
                onChange={(e) => {
                  const v = e.value;
                  setIdentidad(v);
                  setIdentidadBusqueda(v);
                  setClienteEncontrado(false);
                }}
                onBlur={handleBlurBusqueda}
                mask="9999-9999-99999"
                placeholder="0000-0000-00000"
                className={`w-full pl-10 pr-10 py-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  clienteEncontrado ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              {buscando && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin pointer-events-none z-10" size={18} />
              )}
              {clienteEncontrado && !buscando && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 pointer-events-none z-10">
                  ✓
                </div>
              )}
            </div>
            {/* Solo mensaje de "Buscando..." */}
            {buscando && (
              <p className="absolute -bottom-5 left-0 text-xs text-gray-500 z-20">Buscando cliente...</p>
            )}
          </div>

          {/* NOMBRE CLIENTE (BLOQUEADO) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Cliente*</label>
            <input
              type="text"
              value={nombreCliente}
              readOnly
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Nombre completo del cliente"
            />
          </div>

          {/* RTN CON MÁSCARA */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">RTN</label>
            <InputMask
              value={RTN}
              onChange={(e) => setRTN(e.value)}
              mask="9999-9999-999999"
              placeholder="0000-0000-000000"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* VENDEDOR */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
            <input
              type="text"
              value={vendedor}
              readOnly
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-default"
              placeholder="Nombre del vendedor"
            />
          </div>

          {/* SUCURSAL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sucursal</label>
            <input
              type="text"
              value={sucursal}
              readOnly
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-default"
              placeholder="Sucursal de la operación"
            />
          </div>

          {/* FECHA Y HORA */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              value={fechaValue}
              readOnly
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR CLIENTE */}
      <FormularioCliente
        isOpen={showModalCliente}
        onClose={() => setShowModalCliente(false)}
        onClienteAgregado={handleClienteAgregado}
        identidadInicial={identidadTemp}
      />
    </>
  );
};

export default EncabezadoFactura;
