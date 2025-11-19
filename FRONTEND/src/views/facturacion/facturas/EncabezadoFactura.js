import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { InputMask } from 'primereact/inputmask';
import Swal from 'sweetalert2';
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
  vendedor = "",
  sucursal = "",
  setIdCliente = () => {}, // ⭐ NUEVO
}) => {
  //====================ESTADOS====================
  const [internalFecha, setInternalFecha] = useState('');
  const [identidadBusqueda, setIdentidadBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [identidadTemp, setIdentidadTemp] = useState('');
  const [yaConsultado, setYaConsultado] = useState(false);

  //====================FUNCIONES_AUXILIARES====================

  //CONVIERTE UNA FECHA A FORMATO DATETIME-LOCAL
  // Formato personalizado: '03 de noviembre, 2025 HH:mm'
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const toDateTimeLocal = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    const dia = pad(date.getDate());
    const mesNombre = meses[date.getMonth()];
    const anio = date.getFullYear();
    const hora = pad(date.getHours());
    const minuto = pad(date.getMinutes());
  return `${dia} de ${mesNombre}, ${anio} — ${hora}:${minuto}`;
  };

  //====================EFFECTS====================

  //ACTUALIZA LA FECHA Y HORA EN TIEMPO REAL CADA SEGUNDO
  useEffect(() => {
    const actualizarFecha = () => {
      const ahora = toDateTimeLocal(new Date());
      onFechaChange?.(ahora);
      if (!onFechaChange) setInternalFecha(ahora);
    };

    actualizarFecha();
    const intervalo = setInterval(actualizarFecha, 1000);

    return () => clearInterval(intervalo);
  }, [onFechaChange]);

  //ESTABLECE CONSUMIDOR FINAL COMO VALOR POR DEFECTO AL CARGAR
  useEffect(() => {
    if (!nombreCliente && !identidad) {
      setNombreCliente('CONSUMIDOR FINAL');
      setClienteEncontrado(true);
    }
  }, [nombreCliente, identidad, setNombreCliente]);

  //BUSCA AUTOMÁTICAMENTE EL CLIENTE CUANDO SE COMPLETAN 13 DÍGITOS DE IDENTIDAD
  useEffect(() => {
    const soloDigitos = identidadBusqueda.replace(/\D/g, '');

    if (soloDigitos.length === 0 && identidad === '') {
      setNombreCliente('CONSUMIDOR FINAL');
      setRTN('');
      setIdCliente(null); // ⭐ NUEVO
      setClienteEncontrado(true);
      setYaConsultado(false);
      return;
    }

    if (soloDigitos.length < 13) {
      setYaConsultado(false);
      return;
    }

    if (soloDigitos.length === 13 && !yaConsultado) {
      const timer = setTimeout(async () => {
        setBuscando(true);

        try {
          const response = await buscarCliente(identidadBusqueda);
          const cliente = response?.data?.[0];

          if (cliente) {
            setIdentidad(cliente.identidad_cliente);
            setNombreCliente(`${cliente.nombre_cliente} ${cliente.apellido_cliente}`.trim());
            setRTN('');
            setIdCliente(cliente.id_cliente_pk);
            setClienteEncontrado(true);
            setYaConsultado(true);
          } else {
            setIdentidad('');
            setNombreCliente('');
            setRTN('');
            setIdCliente(null);
            setClienteEncontrado(false);
            setYaConsultado(true);
            setIdentidadTemp(identidadBusqueda);
            setShowModalCliente(true);
          }
        } catch (error) {
          console.error('Error al buscar cliente:', error);
          setClienteEncontrado(false);
          setYaConsultado(true);
        } finally {
          setBuscando(false);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [identidadBusqueda, yaConsultado, identidad, setIdentidad, setNombreCliente, setRTN, setIdCliente]); // ⭐ Agregar setIdCliente

  //====================MANEJADORES_DE_EVENTOS====================

  //MANEJA CUANDO SE AGREGA UN NUEVO CLIENTE DESDE EL MODAL
  const handleClienteAgregado = (nuevoCliente) => {
    if (nuevoCliente) {
      const identidadCliente = nuevoCliente.identidad_cliente || identidadTemp;
      const nombreCompleto = `${nuevoCliente.nombre_cliente || ''} ${nuevoCliente.apellido_cliente || ''}`.trim();

      setIdentidad(identidadCliente);
      setNombreCliente(nombreCompleto);
      setRTN('');
      setIdCliente(nuevoCliente.id_cliente_pk); // ⭐ NUEVO
      setClienteEncontrado(true);
      setYaConsultado(true);
    }

    setShowModalCliente(false);
  };

  //MANEJA EL CAMBIO EN EL INPUT DE IDENTIDAD
  const handleIdentidadChange = (e) => {
    const valor = e.value;
    setIdentidad(valor);
    setIdentidadBusqueda(valor);
    setClienteEncontrado(false);
    setYaConsultado(false);
  };

  //====================VALORES_COMPUTADOS====================
  const fechaActual = fecha || internalFecha;

  //====================RENDER====================
  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-4" style={{ boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)" }}>

        {/*TÍTULO*/}
        <h1 className="text-lg font-semibold text-gray-800 mb-3 text-center font-poppins">Factura</h1>

        {/*SECCIÓN CLIENTE*/}
        <div className="grid grid-cols-3 gap-3 mb-4 border-b pb-4 border-gray-200">

          {/*CAMPO IDENTIDAD CON BÚSQUEDA AUTOMÁTICA*/}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar Cliente (Identidad)
            </label>
            <div className="relative">
              <InputMask
                value={identidad}
                onChange={handleIdentidadChange}
                mask="9999-9999-99999"
                placeholder="0000-0000-00000"
                className={`w-full h-9 px-3 pr-10 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                  clienteEncontrado ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                autoComplete="off"
              />

              {/*ICONOS A LA DERECHA*/}
              {buscando && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin pointer-events-none z-10" size={18} />
              )}
              {!buscando && identidad && (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
              )}
            </div>

            {/*MENSAJE BUSCANDO*/}
            {buscando && (
              <p className="absolute -bottom-5 left-0 text-xs text-gray-500 z-20">
                Buscando cliente...
              </p>
            )}
          </div>

          {/*CAMPO NOMBRE CLIENTE SOLO LECTURA*/}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre Cliente*
            </label>
            <input
              type="text"
              value={nombreCliente}
              readOnly
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Nombre completo del cliente"
            />
          </div>

          {/*CAMPO RTN*/}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              RTN
            </label>
            <InputMask
              value={RTN}
              onChange={(e) => setRTN(e.value)}
              mask="9999-9999-999999"
              placeholder="0000-0000-000000"
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        {/*SECCIÓN INFORMACIÓN ADICIONAL*/}
        <div className="grid grid-cols-3 gap-3">

          {/*CAMPO VENDEDOR SOLO LECTURA*/}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vendedor
            </label>
            <input
              type="text"
              value={vendedor || "Cargando..."}
              readOnly
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Nombre del vendedor"
            />
          </div>

          {/*CAMPO SUCURSAL SOLO LECTURA*/}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sucursal
            </label>
            <input
              type="text"
              value={sucursal || "Cargando..."}
              readOnly
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Sucursal de la operación"
            />
          </div>

          {/*CAMPO FECHA Y HORA SOLO LECTURA*/}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha y hora
            </label>
            <input
              type="text"
              value={fechaActual}
              readOnly
              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/*MODAL AGREGAR NUEVO CLIENTE*/}
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
