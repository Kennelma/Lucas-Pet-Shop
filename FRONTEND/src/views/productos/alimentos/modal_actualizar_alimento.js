// IMPORTACIÓN DE REACT Y COMPONENTES DE PRIME REACT
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';
import Swal from 'sweetalert2';

//COMPONENTE MODAL ACTUALIZAR ALIMENTO
const ModalActualizarAlimento = ({ isOpen, onClose, onSave, editData, alimentosExistentes = [] }) => {

  //LISTAS DROPDOWN
  const destinosBase = [
    { label: 'PERROS', value: 'PERROS' },
    { label: 'GATOS', value: 'GATOS' },
    { label: 'AVES', value: 'AVES' },
    { label: 'PECES', value: 'PECES' },
    { label: 'REPTILES', value: 'REPTILES' },
    { label: 'ANFIBIOS', value: 'ANFIBIOS' }
  ];

  //ESTADOS PRINCIPALES
  const [data, setData] = useState({
    nombre: '',
    precio: 0,
    cantidad: 0,
    peso: '',
    destino: '',
    stock_minimo: 0,
    tiene_impuesto: false
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);


  //RECALCULAR PRECIO CON/SIN IMPUESTO
  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    return aplicar ? (pBase * (1 + pTasa / 100)) : pBase;
  };

  //CALCULAR PRECIO FINAL CON ISV
  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  //EFECTO CARGAR DATOS EDITAR
  useEffect(() => {
    if (isOpen && editData) {
      const tieneImpuesto = Boolean(editData.tiene_impuesto);
      const tasa = parseFloat(editData.tasa_impuesto) || 15;
      const precioInicial = parseFloat(editData.precio) || 0;
      let base = precioInicial;
      if (tieneImpuesto && precioInicial > 0 && tasa > 0) {
        base = (precioInicial / (1 + tasa / 100));
      }
      setPrecioBase(Number(base.toFixed(2)));
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        precio: precioInicial,
        cantidad: Number.parseInt(editData.stock) || 0,
        peso: editData.peso || '',
        destino: (editData.destino || '').toUpperCase(),
        stock_minimo: Number.parseInt(editData.stock_minimo) || 0,
        tiene_impuesto: tieneImpuesto
      });
      setAplicaImpuesto(tieneImpuesto);
      setTasaImpuesto(tasa);
      setErrores({});
    }
  }, [isOpen, editData]);

  //MANEJAR CAMBIOS INPUTS
  const handleChange = (field, value) => {
    const isText = ['nombre', 'destino', 'peso'].includes(field);
    const isNumeric = ['precio', 'cantidad', 'stock_minimo'].includes(field);
    let val = value;
    if (isText) val = String(value ?? '').toUpperCase();
    else if (isNumeric) val = (value === null || value === undefined || value === '') ? 0 : Number(value);

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'precio') {
        const precioActual = parseFloat(val) || 0;
        const tasa = parseFloat(tasaImpuesto) || 0;
        const nuevaBase = aplicaImpuesto && tasa > 0 ? (precioActual / (1 + tasa / 100)) : precioActual;
        setPrecioBase(Number(nuevaBase.toFixed(2)));
      }
      return newData;
    });

    // ✅ VALIDACIÓN EN TIEMPO REAL CON DETECCIÓN DE DUPLICADOS
    setErrores(prev => {
      const newErrores = { ...prev };

      if (field === 'nombre') {
        if (!val.trim()) {
          newErrores[field] = 'El nombre del alimento es obligatorio';
        } else {
          // Verificar duplicados excluyendo el alimento actual
          const nombreExiste = alimentosExistentes.some(alimento =>
            alimento.nombre?.toLowerCase() === val.trim().toLowerCase() &&
            alimento.id_producto !== editData.id_producto
          );

          if (nombreExiste) {
            newErrores[field] = 'Ya existe un alimento con este nombre';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (['destino', 'peso'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad', 'stock_minimo'].includes(field)) {
        newErrores[field] = val > 0 ? '' : 'Debe ser mayor a 0';
      }

      return newErrores;
    });
  };

  //CAMBIO SWITCH IMPUESTO
  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);
    setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
  };

  //CAMBIO TASA IMPUESTO
  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);
    if (aplicaImpuesto) {
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
    }
  };

  //VALIDAR FORMULARIO
  const validarDatos = () => {
    let temp = {};

    // ✅ VALIDACIÓN DEL NOMBRE CON VERIFICACIÓN DE DUPLICADOS
    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del alimento es obligatorio';
    } else {
      const nombreExiste = alimentosExistentes.some(alimento =>
        alimento.nombre?.toLowerCase() === data.nombre.trim().toLowerCase() &&
        alimento.id_producto !== editData.id_producto
      );

      if (nombreExiste) {
        temp.nombre = 'Ya existe un alimento con este nombre';
      }
    }

    if (!data.destino) temp.destino = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
    if (!data.peso || data.peso <= 0) temp.peso = 'Debe ser mayor a 0';
    if (!data.stock_minimo || data.stock_minimo <= 0) temp.stock_minimo = 'Debe ser mayor a 0';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  //ENVIAR FORMULARIO
  const handleSubmit = async () => {
    if (!validarDatos()) return;
    setLoading(true);
    try {
      const body = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        precio_producto: parseFloat(data.precio),
        stock: parseInt(data.cantidad),
        stock_minimo: parseInt(data.stock_minimo),
        tipo_producto: 'ALIMENTOS',
        peso_alimento: data.peso,
        alimento_destinado: data.destino,
        tiene_impuesto: aplicaImpuesto ? 1 : 0,
        tasa_impuesto: aplicaImpuesto ? parseFloat(tasaImpuesto) : 0
      };
      const res = await actualizarProducto(body);
      if (res.Consulta) {
        onSave({
          ...editData,
          ...data,
          precio: Number(body.precio_producto.toFixed(2)),
          tiene_impuesto: aplicaImpuesto ? 1 : 0
        });
        onClose();

        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "¡Alimento actualizado!",
            text: "El alimento se ha actualizado correctamente",
            timer: 1800,
            showConfirmButton: false,
          });
        }, 100);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No se pudo actualizar: ${res.error}`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al actualizar el alimento.",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const destinos =
    data.destino && !destinosBase.some(d => d.value === data.destino)
      ? [...destinosBase, { label: data.destino, value: data.destino }]
      : destinosBase;

  //FOOTER MODAL
  const footer = (
    <div className="flex justify-end gap-3 mt-1">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded text-sm" style={{ padding: '0.375rem 0.75rem' }} onClick={onClose} disabled={loading} />
      <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded text-sm" style={{ padding: '0.375rem 0.75rem' }} onClick={handleSubmit} loading={loading} />
    </div>
  );

  //ETIQUETA PRECIO
  const precioLabel = aplicaImpuesto ? 'PRECIO CON ISV (L)' : 'PRECIO BASE (L)';

  //RENDER MODAL
  return (
    <Dialog
      header={<div className="w-full text-center text-sm sm:text-base md:text-lg font-bold">ACTUALIZAR ALIMENTO</div>}
      visible={isOpen}
      className="w-11/12 sm:w-96 md:w-[30rem]"
      modal closable={false} onHide={onClose} footer={footer}
      position="center" dismissableMask={false} draggable={false} resizable={false}
      contentStyle={{
        overflowY: 'auto',
        padding: '1rem',
        maxHeight: 'calc(100vh - 120px)'
      }}
    >
      <div className="flex flex-col gap-3">
        {/* NOMBRE */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE</label>
          <InputText
            id="nombre"
            value={data.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.nombre ? 'border-red-500' : ''}`}
            placeholder="Ej: Royal Canin Adulto"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* DESTINADO A Y PESO */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="destino" className="text-xs font-semibold text-gray-700 mb-1">DESTINADO A</label>
            <Dropdown
              id="destino"
              value={data.destino}
              options={destinos}
              onChange={e => handleChange('destino', e.value)}
              className={`w-full rounded-xl text-sm ${errores.destino ? 'border-red-500' : ''}`}
              placeholder="Seleccionar"
            />
            {errores.destino && <p className="text-xs text-red-600 mt-1">{errores.destino}</p>}
          </span>
          <span>
            <label htmlFor="peso" className="text-xs font-semibold text-gray-700 mb-1">PESO (KG)</label>
            <InputText
              id="peso"
              value={data.peso}
              onChange={e => handleChange('peso', e.target.value)}
              className={`w-full rounded-xl h-9 text-sm ${errores.peso ? 'border-red-500' : ''}`}
              placeholder="Peso en kg"
              keyfilter="num"
            />
            {errores.peso && <p className="text-xs text-red-600 mt-1">{errores.peso}</p>}
          </span>
        </div>

        {/* PRECIO */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">{precioLabel}</label>
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

        {/* SWITCH ISV */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
          <label className="text-sm font-semibold text-gray-700">¿APLICA ISV?</label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${!aplicaImpuesto ? 'text-red-600' : 'text-gray-500'}`}>NO</span>
            <InputSwitch checked={aplicaImpuesto} onChange={e => handleImpuestoChange(e.value)} />
            <span className={`text-sm font-medium ${aplicaImpuesto ? 'text-green-600' : 'text-gray-500'}`}>SÍ</span>
          </div>
        </div>

        {aplicaImpuesto && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TASA DE IMPUESTO (%)</label>
            <div className="flex items-center gap-4">
              <input type="number" value={tasaImpuesto} onChange={handleTasaChange} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" max="100" />
              <span className="text-sm text-gray-600">PRECIO BASE: L {precioBase.toFixed(2)} (SIN IMPUESTO)</span>
            </div>
          </div>
        )}

        {/* MENSAJE DE ADVERTENCIA SI NO SE APLICA IMPUESTO */}
        {!aplicaImpuesto && data.precio > 0 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2">
            <p className="text-xs text-yellow-800">
              El precio base es L {parseFloat(data.precio).toFixed(2)}. Si se aplica ISV ({tasaImpuesto}%), el precio con ISV sería L <strong>{(parseFloat(data.precio) * (1 + parseFloat(tasaImpuesto) / 100)).toFixed(2)}</strong>.
            </p>
          </div>
        )}

        {/* Stock Disponible y Stock Mínimo */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="cantidad" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
            <InputText
              id="cantidad"
              name="cantidad"
              value={data.cantidad}
              onChange={e => handleChange('cantidad', e.target.value)}
              className={`w-full rounded-xl h-9 text-sm ${errores.cantidad ? 'border-red-500' : ''}`}
              placeholder="Cantidad disponible"
              keyfilter="int"
            />
            {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
          </span>
          <span>
            <label htmlFor="stock_minimo" className="text-xs font-semibold text-gray-700 mb-1">STOCK MÍNIMO (ALERTAS)</label>
            <InputText
              id="stock_minimo"
              name="stock_minimo"
              value={data.stock_minimo}
              onChange={e => handleChange('stock_minimo', e.target.value)}
              className={`w-full rounded-xl h-9 text-sm ${errores.stock_minimo ? 'border-red-500' : ''}`}
              placeholder="Stock mínimo"
              keyfilter="int"
            />
            {errores.stock_minimo && <p className="text-xs text-red-600 mt-1">{errores.stock_minimo}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};


export default ModalActualizarAlimento;