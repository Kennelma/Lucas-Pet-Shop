// IMPORTACIÓN DE REACT Y COMPONENTES DE PRIME REACT
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

// COMPONENTE PRINCIPAL DEL MODAL PARA ACTUALIZAR ALIMENTO
const ModalActualizarAnimal = ({ isOpen, onClose, onSave, editData }) => {
  // LISTA DE ESPECIES PARA EL DROPDOWN
  const especies = [
    { label: 'PERRO', value: 'PERRO' },
    { label: 'GATO', value: 'GATO' },
    { label: 'AVE', value: 'AVE' },
    { label: 'PEZ', value: 'PEZ' },
    { label: 'REPTIL', value: 'REPTIL' },
    { label: 'ANFIBIO', value: 'ANFIBIO' }
  ];

  // LISTA DE SEXOS PARA EL DROPDOWN
  const sexos = [
    { label: 'HEMBRA', value: 'HEMBRA' },
    { label: 'MACHO', value: 'MACHO' }
  ];

  // ESTADO PRINCIPAL DE LOS DATOS DEL FORMULARIO
  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: null, // Usaremos null para campos numéricos
    cantidad: null,
    stock_minimo: null,
    sku: '',
    tiene_impuesto: false
  });

  // ESTADO DE ERRORES, LOADING, IMPUESTO Y PRECIO BASE
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0); // PRECIO SIN ISV

  // FUNCIÓN PARA GENERAR EL SKU DEL ALIMENTO
  const generarSKU = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
  };

  // EFECTO PARA CARGAR LOS DATOS DEL ALIMENTO A EDITAR
  useEffect(() => {
    if (isOpen && editData) {
      const tieneImpuesto = Boolean(editData.tiene_impuesto);
      const tasa = parseFloat(editData.tasa_impuesto) || 15;
      const precioInicial = parseFloat(editData.precio) || 0;
      let base = precioInicial;

      // Si el precio inicial ya incluye impuesto, calculamos la base sin impuesto
      if (tieneImpuesto && precioInicial > 0 && tasa > 0) {
        base = (precioInicial / (1 + tasa / 100));
      }

      setPrecioBase(base.toFixed(2));

      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        especie: (editData.especie || '').toUpperCase(),
        sexo: (editData.sexo || '').toUpperCase(),
        precio: precioInicial,
        cantidad: parseInt(editData.stock) || null,
        stock_minimo: parseInt(editData.stock_minimo) || null,
        sku: generarSKU(editData.nombre)
      });
      setAplicaImpuesto(tieneImpuesto);
      setTasaImpuesto(tasa);
      setErrores({});
    }
  }, [isOpen, editData]);


  // FUNCIÓN PARA RECALCULAR EL PRECIO SEGÚN SI SE APLICA IMPUESTO
  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    if (aplicar) {
      return (pBase * (1 + pTasa / 100)); // Devuelve un número
    } else {
      return pBase; // Devuelve un número
    }
  }


  // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS INPUTS DEL FORMULARIO
  const handleChange = (field, value) => {
    const isText = ['nombre', 'especie', 'sexo'].includes(field);
    const isNumeric = ['precio', 'cantidad', 'stock_minimo'].includes(field);

    let val = value;
    if (isText) {
      val = String(value).toUpperCase();
    } else if (isNumeric) {
      // Aseguramos que los campos numéricos sean null si están vacíos, para InputNumber
      val = (value === null || value === undefined) ? null : Number(value);
    }
   
    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val);

      // LÓGICA DE ACTUALIZACIÓN DEL PRECIO BASE CUANDO EL USUARIO EDITA EL PRECIO TOTAL
      if (field === 'precio') {
        const precioActual = parseFloat(val) || 0;
        const tasa = parseFloat(tasaImpuesto) || 0;
        let nuevaBase;

        if (aplicaImpuesto && tasa > 0) {
          // Si el impuesto está activo, el valor introducido es CON impuesto.
          nuevaBase = (precioActual / (1 + tasa / 100));
        } else {
          // Si no hay impuesto, el valor introducido es el precio base.
          nuevaBase = precioActual;
        }
        setPrecioBase(nuevaBase.toFixed(2));
      }
      return newData;
    });

    // Validación en tiempo real
    setErrores(prev => {
      const newErrores = { ...prev };
      if (['nombre', 'especie', 'sexo'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad', 'stock_minimo'].includes(field)) {
        newErrores[field] = val > 0 ? '' : 'Debe ser mayor a 0';
      }
      return newErrores;
    });
  };

  // FUNCIÓN PARA VALIDAR LOS DATOS DEL FORMULARIO
  const validarDatos = () => {
    let temp = {};
    if (!data.nombre) temp.nombre = 'Campo obligatorio';
    if (!data.especie) temp.especie = 'Campo obligatorio';
    if (!data.sexo) temp.sexo = 'Campo obligatorio';
    // Validamos contra el valor numérico en data.precio
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
    if (!data.stock_minimo || data.stock_minimo <= 0) temp.stock_minimo = 'Debe ser mayor a 0';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  // FUNCIÓN PARA ENVIAR EL FORMULARIO Y ACTUALIZAR EL ALIMENTO
  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      const body = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        // Aseguramos que los valores sean numéricos para la API
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
        // Devolvemos el precio actualizado a la tabla para la recarga
        onSave({
          ...editData,
          ...data,
          precio: body.precio_producto,
          tiene_impuesto: aplicaImpuesto ? 1 : 0,
          tasa_impuesto: aplicaImpuesto ? tasaImpuesto : 0
        });
        onClose();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el animal.');
    } finally {
      setLoading(false);
    }
  };

  // HANDLER PARA EL INPUTSWITCH DE IMPUESTO
  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);

    // Usamos el precioBase (siempre sin impuesto) para recalcular el precio mostrado
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);

    // Actualizamos el precio mostrado en el formulario
    setData(prev => ({ ...prev, precio: nuevoPrecio }));
  };

  // HANDLER PARA LA TASA DE IMPUESTO (TAMBIÉN DEBE RECALCULAR EL PRECIO)
  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);

    if (aplicaImpuesto) {
      // Si el impuesto está activo, recalcular el precio con la nueva tasa
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: nuevoPrecio }));
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
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ANIMAL</div>}
      visible={isOpen}
      style={{ width: '30rem', maxHeight: '90vh', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ overflowY: 'visible', padding: '1rem' }}
    >
      <div className="flex flex-col gap-3">
        {/* NOMBRE DEL ALIMENTO */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Rocky"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* SKU DEL ALIMENTO */}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">SKU</label>
          <InputText
            id="sku"
            name="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-9 text-sm bg-gray-100"
          />
        </span>

        {/* ESPECIE Y SEXO DEL ALIMENTO */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="especie" className="text-xs font-semibold text-gray-700 mb-1">ESPECIE</label>
            <Dropdown
              id="especie"
              name="especie"
              value={data.especie}
              options={especies}
              onChange={e => handleChange('especie', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            {errores.especie && <p className="text-xs text-red-600 mt-1">{errores.especie}</p>}
          </span>
          <span>
            <label htmlFor="sexo" className="text-xs font-semibold text-gray-700 mb-1">SEXO</label>
            <Dropdown
              id="sexo"
              name="sexo"
              value={data.sexo}
              options={sexos}
              onChange={e => handleChange('sexo', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            {errores.sexo && <p className="text-xs text-red-600 mt-1">{errores.sexo}</p>}
          </span>
        </div>

        {/* PRECIO DEL ALIMENTO CON ETIQUETA DINÁMICA */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">
            {precioLabel}
          </label>
          <InputNumber
            id="precio"
            name="precio"
            value={data.precio}
            onValueChange={e => handleChange('precio', e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            className="w-full rounded-xl text-sm"
            inputClassName="h-9 text-sm"
            placeholder="0.00"
          />
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* APLICA IMPUESTO - INPUTSWITCH CON SÍ/NO */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
          <label className="text-sm font-semibold text-gray-700">¿APLICA ISV?</label>

          <div className="flex items-center gap-2">
            {/* Etiqueta NO */}
            <span className={`text-sm font-medium ${!aplicaImpuesto ? 'text-red-600' : 'text-gray-500'}`}>NO</span>

            {/* InputSwitch */}
            <InputSwitch
              id="aplicaImpuestoSwitch"
              checked={aplicaImpuesto}
              onChange={e => handleImpuestoChange(e.value)}
            />

            {/* Etiqueta SÍ */}
            <span className={`text-sm font-medium ${aplicaImpuesto ? 'text-green-600' : 'text-gray-500'}`}>SÍ</span>
          </div>
        </div>

        {aplicaImpuesto && (
          <div>
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

        {/* STOCK DISPONIBLE Y STOCK MÍNIMO */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="cantidad" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
            <InputNumber
              id="cantidad"
              name="cantidad"
              value={data.cantidad}
              onValueChange={e => handleChange('cantidad', e.value)}
              mode="decimal" // 🔑 Corregido de "none" a "decimal"
              minFractionDigits={0} // 🔑 Forzar entero
              maxFractionDigits={0} // 🔑 Forzar entero
              useGrouping={false}
              className="w-full rounded-xl h-9 text-sm"
              inputClassName="h-9 text-sm"
              placeholder="Cantidad disponible"
            />
            {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
          </span>
          <span>
            <label htmlFor="stock_minimo" className="text-xs font-semibold text-gray-700 mb-1">STOCK MÍNIMO (ALERTAS)</label>
            <InputNumber
              id="stock_minimo"
              name="stock_minimo"
              value={data.stock_minimo}
              onValueChange={e => handleChange('stock_minimo', e.value)}
              mode="decimal" // 🔑 Corregido de "none" a "decimal"
              minFractionDigits={0} // 🔑 Forzar entero
              maxFractionDigits={0} // 🔑 Forzar entero
              useGrouping={false}
              className="w-full rounded-xl h-9 text-sm"
              inputClassName="h-9 text-sm"
              placeholder="Stock mínimo"
            />
            {errores.stock_minimo && <p className="text-xs text-red-600 mt-1">{errores.stock_minimo}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

// EXPORTA EL COMPONENTE
export default ModalActualizarAnimal;