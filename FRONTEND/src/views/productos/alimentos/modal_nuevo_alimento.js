// IMPORTACIÓN DE REACT Y COMPONENTES DE PRIME REACT
import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';
import Swal from 'sweetalert2';

// LISTA DE DESTINOS PARA EL DROPDOWN
const destinosBase = [
  { label: 'PERROS', value: 'PERROS' },
  { label: 'GATOS', value: 'GATOS' },
  { label: 'AVES', value: 'AVES' },
  { label: 'PECES', value: 'PECES' },
  { label: 'REPTILES', value: 'REPTILES' },
  { label: 'ANFIBIOS', value: 'ANFIBIOS' }
];

// COMPONENTE PRINCIPAL DEL MODAL PARA CREAR UN NUEVO ALIMENTO
const ModalNuevoAlimento = ({ isOpen, onClose, onSave, alimentosExistentes = [] }) => {

  // ESTADO PRINCIPAL DE LOS DATOS DEL FORMULARIO
  const [data, setData] = useState({
    nombre: '',
    precio: '',
    cantidad: 0,
    peso: 0,
    destino: '',
    tasaImpuesto: 15
  });

  // ESTADO DE ERRORES, LOADING, IMPUESTO Y PRECIO BASE
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);

  // FUNCIÓN AUXILIAR PARA RECALCULAR EL PRECIO SEGÚN SI SE APLICA IMPUESTO
  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    return aplicar ? (pBase * (1 + pTasa / 100)) : pBase;
  };

  // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS DEL FORMULARIO
  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };

      return newData;
    });

    // ACTUALIZA EL PRECIO BASE CUANDO EL USUARIO EDITA EL PRECIO
    if (field === 'precio') {
      const precioActual = parseFloat(val) || 0;
      const tasa = parseFloat(tasaImpuesto) || 0;
      let nuevaBase;

      if (aplicaImpuesto && tasa > 0) {
        // SI EL IMPUESTO ESTÁ ACTIVO, EL VALOR ES CON IMPUESTO, SE CALCULA LA BASE
        nuevaBase = (precioActual / (1 + tasa / 100));
      } else {
        // SI NO HAY IMPUESTO, EL VALOR ES EL PRECIO BASE
        nuevaBase = precioActual;
      }
      // ACTUALIZA EL ESTADO DEL PRECIO BASE
      setPrecioBase(Number(nuevaBase.toFixed(2)));
    }

    // LIMPIA EL ERROR DEL CAMPO SI EXISTE
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  // FUNCIÓN PARA CAMBIAR LA TASA DE IMPUESTO
  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);

    if (aplicaImpuesto) {
      // SI EL IMPUESTO ESTÁ ACTIVO, RECALCULA EL PRECIO MOSTRADO
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: Number(nuevoPrecio) }));
    }
  };

  // FUNCIÓN PARA CAMBIAR SI SE APLICA IMPUESTO O NO
  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);

    // RECALCULA EL PRECIO MOSTRADO EN EL INPUT
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);
    setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
  };

  // FUNCIÓN PARA CALCULAR EL PRECIO FINAL CON ISV
  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  // FUNCIÓN PARA VALIDAR LOS DATOS DEL FORMULARIO
  const validarDatos = () => {
    let temp = {};

    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del alimento es obligatorio';
    } else {
      // ✅ VALIDACIÓN DE NOMBRE DUPLICADO
      const nombreExiste = alimentosExistentes.some(
        (alimento) => alimento.nombre?.toUpperCase() === data.nombre.toUpperCase()
      );
      if (nombreExiste) {
        temp.nombre = 'Ya existe un alimento con este nombre';
      }
    }

    if (!data.destino) temp.destino = 'Debe seleccionar el tipo de mascota';
    if (!data.precio || parseFloat(data.precio) <= 0) temp.precio = 'El precio debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'El stock debe ser mayor a 0';
    if (!data.peso || data.peso <= 0) temp.peso = 'El peso debe ser mayor a 0';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  // FUNCIÓN PARA ENVIAR EL FORMULARIO Y GUARDAR EL ALIMENTO
  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      // OBTIENE EL PRECIO FINAL PARA GUARDAR EN LA BASE DE DATOS
      const precioVentaFinal = parseFloat(data.precio);

      // CREA EL OBJETO BODY PARA ENVIAR AL BACKEND
      const body = {
        nombre_producto: data.nombre,
        precio_producto: precioVentaFinal,
        stock: data.cantidad,
        stock_minimo: 0,
        tipo_producto: 'ALIMENTOS',
        peso_alimento: data.peso,
        alimento_destinado: data.destino,
        tiene_impuesto: aplicaImpuesto ? 1 : 0,
        tasa_impuesto: aplicaImpuesto ? tasaImpuesto : 0,
        activo: 1
      };

      // LLAMA AL SERVICIO PARA INSERTAR EL PRODUCTO
      const res = await insertarProducto(body);

      if (res.Consulta) {
        // SI SE GUARDA CORRECTAMENTE, CREA EL OBJETO DEL NUEVO ALIMENTO Y LO ENVÍA AL PADRE
        const nuevoAlimento = {
          id_producto: res.id_producto_pk,
          nombre: data.nombre,
          precio: precioVentaFinal,
          stock: data.cantidad,
          stock_minimo: 0,
          activo: true,
          tipo_producto: 'ALIMENTOS',
          peso_alimento: data.peso,
          alimento_destinado: data.destino,
          tiene_impuesto: aplicaImpuesto ? 1 : 0,
          tasa_impuesto: aplicaImpuesto ? tasaImpuesto : 0
        };

        onSave(nuevoAlimento);
        onClose();

        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "¡Agregado!",
            text: "El alimento fue agregado correctamente",
            timer: 1800,
            showConfirmButton: false,
          });
        }, 100);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo guardar: ${res.error}`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al guardar el alimento.",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // FOOTER DEL MODAL CON BOTONES DE CANCELAR Y GUARDAR
  const footer = (
    <div className="flex justify-end gap-3 mt-1">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  // ETIQUETA DINÁMICA PARA EL CAMPO PRECIO SEGÚN SI SE APLICA IMPUESTO
  const precioLabel = aplicaImpuesto ? 'PRECIO CON ISV (L)' : 'PRECIO BASE (L)';

  // RENDER DEL MODAL CON TODOS LOS CAMPOS Y COMENTARIOS EXPLICATIVOS
  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">NUEVO ALIMENTO</div>}
      visible={isOpen}
      style={{ width: '30rem', height: '85vh', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{
        overflowY: 'auto',
        padding: '1rem',
        height: 'calc(85vh - 120px)'
      }}
    >
      <div className="flex flex-col gap-2.5">
        {/* CAMPO NOMBRE DEL ALIMENTO */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ALIMENTO</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.nombre ? 'border-red-500' : ''}`}
            placeholder="Ej: Royal Canin Adulto"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* CAMPO DESTINADO A */}
        <span>
          <label htmlFor="destino" className="text-xs font-semibold text-gray-700 mb-1">DESTINADO A</label>
          <Dropdown
            id="destino"
            name="destino"
            value={data.destino}
            options={destinosBase}
            onChange={(e) => handleChange('destino', e.value)}
            className={`w-full rounded-xl text-sm ${errores.destino ? 'border-red-500' : ''}`}
            placeholder="Seleccionar mascota"
          />
          {errores.destino && <p className="text-xs text-red-600 mt-1">{errores.destino}</p>}
        </span>

        {/* CAMPO PESO DEL ALIMENTO */}
        <span>
          <label htmlFor="peso" className="text-xs font-semibold text-gray-700 mb-1">PESO (KG)</label>
          <InputNumber
            id="peso"
            name="peso"
            value={data.peso}
            onValueChange={(e) => handleChange('peso', e.value)}
            className={`w-full rounded-xl text-sm ${errores.peso ? 'border-red-500' : ''}`}
            inputClassName="h-9 text-sm"
            suffix=" kg"
            placeholder="Peso en kilogramos"
          />
          {errores.peso && <p className="text-xs text-red-600 mt-1">{errores.peso}</p>}
        </span>

        {/* CAMPO PRECIO DEL ALIMENTO CON ETIQUETA DINÁMICA */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">
            {precioLabel}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">L</span>
            <input
              type="number"
              id="precio"
              name="precio"
              value={data.precio}
              onChange={e => handleChange('precio', e.target.value)}
              className={`w-full rounded-xl h-9 text-sm ${errores.precio ? 'border border-red-500' : 'border border-gray-300'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              style={{ paddingLeft: '2rem' }}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* SECCIÓN DE IMPUESTO CON INPUTSWITCH Y ETIQUETAS SÍ/NO */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50 mt-1">
          <label className="text-sm font-semibold text-gray-700">¿APLICA ISV?</label>

          <div className="flex items-center gap-2">
            {/* ETIQUETA NO */}
            <span className={`text-sm font-medium ${!aplicaImpuesto ? 'text-red-600' : 'text-gray-500'}`}>NO</span>

            {/* INPUTSWITCH PARA CAMBIAR SI SE APLICA IMPUESTO */}
            <InputSwitch
              id="aplicaImpuestoSwitch"
              checked={aplicaImpuesto}
              onChange={e => handleImpuestoChange(e.value)}
            />

            {/* ETIQUETA SÍ */}
            <span className={`text-sm font-medium ${aplicaImpuesto ? 'text-green-600' : 'text-gray-500'}`}>SÍ</span>
          </div>
        </div>

        {/* SI SE APLICA IMPUESTO, MUESTRA INPUT DE TASA Y PRECIO BASE */}
        {aplicaImpuesto && (
          <div className='mt-3'>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Impuesto (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="tasaImpuesto"
                value={tasaImpuesto}
                onChange={handleTasaChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15"
                step="0.01"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                Precio base: L {precioBase} (sin impuesto)
              </span>
            </div>
          </div>
        )}

        {/* MENSAJE DE ADVERTENCIA SI NO SE APLICA IMPUESTO */}
        {!aplicaImpuesto && data.precio > 0 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 mt-3">
            <p className="text-xs text-yellow-800">
              El precio base es L {parseFloat(data.precio).toFixed(2)}. Si se aplica ISV ({tasaImpuesto}%), el precio con ISV sería L <strong>{(parseFloat(data.precio) * (1 + parseFloat(tasaImpuesto) / 100)).toFixed(2)}</strong>.
            </p>
          </div>
        )}

        {/* CAMPO STOCK DISPONIBLE */}
        <span>
          <label htmlFor="stock" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
          <InputText
            id="stock"
            name="stock"
            value={data.cantidad}
            onChange={(e) => handleChange('cantidad', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.cantidad ? 'border-red-500' : ''}`}
            placeholder="Cantidad disponible"
            keyfilter="int"
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAlimento;