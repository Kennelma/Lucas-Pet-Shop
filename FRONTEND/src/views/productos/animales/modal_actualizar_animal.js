import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

//COMPONENTE MODAL ACTUALIZAR ANIMAL
const ModalActualizarAnimal = ({ isOpen, onClose, onSave, editData, animalesExistentes = [] }) => {

  //LISTAS DROPDOWN
  const especies = [
    { label: 'PERRO', value: 'PERRO' },
    { label: 'GATO', value: 'GATO' },
    { label: 'AVE', value: 'AVE' },
    { label: 'PEZ', value: 'PEZ' },
    { label: 'REPTIL', value: 'REPTIL' },
    { label: 'ANFIBIO', value: 'ANFIBIO' }
  ];

  const sexos = [
    { label: 'HEMBRA', value: 'HEMBRA' },
    { label: 'MACHO', value: 'MACHO' }
  ];

  //ESTADOS PRINCIPALES
  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: 0,
    cantidad: 0,
    stock_minimo: 0,
    sku: '',
    tiene_impuesto: false
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);

  //GENERAR SKU
  const generarSKU = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
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
        especie: (editData.especie || '').toUpperCase(),
        sexo: (editData.sexo || '').toUpperCase(),
        precio: precioInicial,
        cantidad: Number.parseInt(editData.stock) || 0,
        stock_minimo: Number.parseInt(editData.stock_minimo) || 0,
        sku: generarSKU(editData.nombre),
        tiene_impuesto: tieneImpuesto
      });
      setAplicaImpuesto(tieneImpuesto);
      setTasaImpuesto(tasa);
      setErrores({});
    }
  }, [isOpen, editData]);

  //RECALCULAR PRECIO CON/SIN IMPUESTO
  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    return aplicar ? (pBase * (1 + pTasa / 100)) : pBase;
  };

  //MANEJAR CAMBIOS INPUTS
  const handleChange = (field, value) => {
    const isText = ['nombre', 'especie', 'sexo'].includes(field);
    const isNumeric = ['precio', 'cantidad', 'stock_minimo'].includes(field);
    let val = value;
    if (isText) val = String(value ?? '').toUpperCase();
    else if (isNumeric) val = (value === null || value === undefined || value === '') ? 0 : Number(value);

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val);
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
          newErrores[field] = 'El nombre del animal es obligatorio';
        } else {
          // Verificar duplicados excluyendo el animal actual
          const nombreExiste = animalesExistentes.some(animal => 
            animal.nombre?.toLowerCase() === val.trim().toLowerCase() &&
            animal.id_producto !== editData.id_producto
          );
          
          if (nombreExiste) {
            newErrores[field] = 'Ya existe un animal con este nombre';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (['especie', 'sexo'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad', 'stock_minimo'].includes(field)) {
        newErrores[field] = val > 0 ? '' : 'Debe ser mayor a 0';
      }
      
      return newErrores;
    });
  };

  //VALIDAR FORMULARIO
  const validarDatos = () => {
    let temp = {};
    
    // ✅ VALIDACIÓN DEL NOMBRE CON VERIFICACIÓN DE DUPLICADOS
    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del animal es obligatorio';
    } else {
      const nombreExiste = animalesExistentes.some(animal => 
        animal.nombre?.toLowerCase() === data.nombre.trim().toLowerCase() &&
        animal.id_producto !== editData.id_producto
      );
      
      if (nombreExiste) {
        temp.nombre = 'Ya existe un animal con este nombre';
      }
    }
    
    if (!data.especie) temp.especie = 'Campo obligatorio';
    if (!data.sexo) temp.sexo = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
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
        especie: data.especie,
        sexo: data.sexo,
        tipo_producto: 'ANIMALES',
        sku: generarSKU(data.nombre),
        tiene_impuesto: aplicaImpuesto ? 1 : 0,
        tasa_impuesto: aplicaImpuesto ? parseFloat(tasaImpuesto) : 0
      };
      const res = await actualizarProducto(body);
      if (res.Consulta) {
        onSave({
          ...editData,
          ...data,
          precio: Number(body.precio_producto.toFixed(2)),
          tiene_impuesto: aplicaImpuesto ? 1 : 0,
        });
        onClose();
      } else alert(`Error al actualizar: ${res.error}`);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el animal.');
    } finally {
      setLoading(false);
    }
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
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ANIMAL</div>}
      visible={isOpen}
      style={{ width: '30rem', height: '85vh', borderRadius: '1.5rem' }}
      modal closable={false} onHide={onClose} footer={footer}
      position="center" dismissableMask={false} draggable={false} resizable={false}
      contentStyle={{ 
        overflowY: 'auto', 
        padding: '1rem',
        height: 'calc(85vh - 120px)'
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
            placeholder="Ej: Rocky" 
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* SKU */}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">SKU</label>
          <InputText id="sku" value={data.sku} readOnly className="w-full rounded-xl h-9 text-sm bg-gray-100" />
        </span>

        {/* ESPECIE Y SEXO */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="especie" className="text-xs font-semibold text-gray-700 mb-1">ESPECIE</label>
            <Dropdown 
              id="especie" 
              value={data.especie} 
              options={especies} 
              onChange={e => handleChange('especie', e.value)} 
              className={`w-full rounded-xl text-sm ${errores.especie ? 'border-red-500' : ''}`}
              placeholder="Seleccionar" 
            />
            {errores.especie && <p className="text-xs text-red-600 mt-1">{errores.especie}</p>}
          </span>
          <span>
            <label htmlFor="sexo" className="text-xs font-semibold text-gray-700 mb-1">SEXO</label>
            <Dropdown 
              id="sexo" 
              value={data.sexo} 
              options={sexos} 
              onChange={e => handleChange('sexo', e.value)} 
              className={`w-full rounded-xl text-sm ${errores.sexo ? 'border-red-500' : ''}`}
              placeholder="Seleccionar" 
            />
            {errores.sexo && <p className="text-xs text-red-600 mt-1">{errores.sexo}</p>}
          </span>
        </div>

        {/* PRECIO */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">{precioLabel}</label>
          <InputNumber 
            id="precio" 
            value={data.precio} 
            onValueChange={e => handleChange('precio', e.value)} 
            mode="decimal" 
            minFractionDigits={2} 
            maxFractionDigits={2} 
            className={`w-full rounded-xl text-sm ${errores.precio ? 'border-red-500' : ''}`}
            inputClassName="h-9 text-sm" 
            placeholder="0.00" 
          />
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

//EXPORTAR COMPONENTE
export default ModalActualizarAnimal;