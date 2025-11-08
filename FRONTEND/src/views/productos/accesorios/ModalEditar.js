import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch'; // Importación necesaria
import Swal from 'sweetalert2';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalEditar = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({
    nombre: '',
    categoria: 'COLLAR',
    cantidad: 0,
    precio: 0,
    sku: '',
    activo: true
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // 💡 Estados para la lógica de Impuestos (ISV)
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);

  // Verificar si hay errores para mostrar scroll
  const hayErrores = Object.keys(errores).some(key => errores[key]);

  const categorias = [
    { label: 'COLLAR', value: 'COLLAR' },
    { label: 'CORREA', value: 'CORREA' },
    { label: 'JUGUETE', value: 'JUGUETE' },
    { label: 'CAMA', value: 'CAMA' },
    { label: 'COMEDERO', value: 'COMEDERO' },
    { label: 'TRANSPORTADORA', value: 'TRANSPORTADORA' },
    { label: 'HIGIENE', value: 'HIGIENE' },
    { label: 'ROPA', value: 'ROPA' }
  ];

  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    // Usar el ID del producto para garantizar unicidad al actualizar
    return partes.join('-') + (id ? `-${id}` : '-XXX');
  };

  // Función auxiliar para recalcular el precio final
  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    if (aplicar && pTasa > 0) {
      return (pBase * (1 + pTasa / 100));
    } else {
      return pBase;
    }
  }

  // Función para calcular el precio final con ISV (usado en el mensaje de advertencia)
  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  useEffect(() => {
    if (isOpen && editData) {
      // Lógica de Impuesto al cargar
      const tieneImpuesto = Boolean(editData.tiene_impuesto);
      const tasa = 15; // Tasa fija del 15% como en alimentos
      const precioInicial = parseFloat(editData.precio_producto || editData.precio || 0); // Asumiendo que 'precio' o 'precio_producto' es el precio final
      let base = precioInicial;

      // Si el precio inicial ya incluye impuesto, calculamos la base sin impuesto
      if (tieneImpuesto && precioInicial > 0) {
        base = (precioInicial / (1 + tasa / 100));
      }

      setPrecioBase(base.toFixed(2));
      setAplicaImpuesto(tieneImpuesto);
      setTasaImpuesto(tasa);

      setData({
        nombre: (editData.nombre_producto || editData.nombre || '').toUpperCase(),
        categoria: (editData.tipo_accesorio || editData.categoria || 'COLLAR').toUpperCase(),
        cantidad: editData.stock || 0,
        // Usamos el precio inicial (el que viene de la BD) para mostrarlo
        precio: precioInicial,
        sku: generarSKU(editData.nombre_producto || editData.nombre || '', editData.id_producto),
        activo: editData.activo !== undefined ? editData.activo : true
      });
      setErrores({});
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'categoria'].includes(field)
      ? value.toUpperCase()
      : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val, editData.id_producto);

      // LÓGICA DE ACTUALIZACIÓN DEL PRECIO BASE CUANDO EL USUARIO LO EDITA
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
      if (['nombre', 'categoria'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad'].includes(field)) {
        newErrores[field] = (parseFloat(val) || 0) >= 0 ? '' : 'No puede ser negativo';
        if (field === 'precio' && (parseFloat(val) || 0) <= 0) {
            newErrores[field] = 'Debe ser mayor a 0';
        }
      }
      return newErrores;
    });
  };

  // Handler para el InputSwitch de impuesto
  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);

    // Usamos el precioBase (siempre sin impuesto) para recalcular el precio mostrado
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);

    // Actualizamos el precio mostrado en el formulario
    setData(prev => ({ ...prev, precio: parseFloat(nuevoPrecio).toFixed(2) }));
  };

  // Handler para la tasa de impuesto (también debe recalcular el precio)
  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);

    if (aplicaImpuesto) {
      // Si el impuesto está activo, recalcular el precio con la nueva tasa
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: parseFloat(nuevoPrecio).toFixed(2) }));
    }
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre?.trim()) temp.nombre = 'Campo obligatorio';
    if (!data.categoria) temp.categoria = 'Campo obligatorio';
    if (parseFloat(data.precio) <= 0) temp.precio = 'Debe ser mayor a 0';
    if (data.cantidad < 0) temp.cantidad = 'No puede ser negativo';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      const body = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        tipo_accesorio: data.categoria,
        stock: data.cantidad,
        precio_producto: parseFloat(data.precio), // Ya tiene el ISV si aplica
        tipo_producto: 'ACCESORIOS',
        sku: data.sku,
        activo: data.activo ? 1 : 0,
        // 💡 Campos de Impuesto
        tiene_impuesto: aplicaImpuesto ? 1 : 0
      };

      const res = await actualizarProducto(body);

      if (res.Consulta) {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `${data.nombre} fue actualizado correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        onSave();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.error || 'No se pudo actualizar el accesorio'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar el accesorio.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 💡 Etiqueta dinámica para el precio
  const precioLabel = aplicaImpuesto ? 'PRECIO CON ISV (L)' : 'PRECIO BASE (L)';


  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded"
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ACCESORIO</div>}
      visible={isOpen}
      style={{
        width: '28rem',
        borderRadius: '1.5rem',
        maxHeight: '85vh',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3 overflow-visible">
        {/* Nombre del Accesorio */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ACCESORIO</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Collar de cuero"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* SKU */}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">SKU (GENERADO AUTOMÁTICAMENTE)</label>
          <InputText
            id="sku"
            name="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-9 text-sm bg-gray-100"
          />
        </span>

        {/* Categoría */}
        <span>
          <label htmlFor="categoria" className="text-xs font-semibold text-gray-700 mb-1">CATEGORÍA</label>
          <Dropdown
            id="categoria"
            name="categoria"
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar categoría"
          />
          {errores.categoria && <p className="text-xs text-red-600 mt-1">{errores.categoria}</p>}
        </span>

        {/* Precio */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">
            {precioLabel} {/* 👈 Etiqueta dinámica aplicada */}
          </label>
          <InputNumber
            id="precio"
            name="precio"
            value={parseFloat(data.precio)}
            onValueChange={(e) => handleChange('precio', e.value)}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="0.00"
            min={0}
          />
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* 🚨 Sección de Impuestos */}
        {/* Aplica impuesto - INPUTSWITCH */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50 mt-1">
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
            <div className='mt-1'>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                    TASA DE IMPUESTO (%)
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        name="tasaImpuesto"
                        value={tasaImpuesto}
                        onChange={handleTasaChange}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="15"
                        step="0.01"
                        min="0"
                        max="100"
                    />
                    <span className="text-xs text-gray-600">
                        Precio base: L {precioBase} (sin impuesto)
                    </span>
                </div>
            </div>
        )}

        {/* Mensaje de advertencia si NO aplica impuesto */}
        {!aplicaImpuesto && parseFloat(data.precio) > 0 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 mt-1">
            <p className="text-xs text-yellow-800">
              El precio base es L {parseFloat(data.precio).toFixed(2)}. Si se aplica ISV (L {tasaImpuesto}%), el precio con ISV sería L {calcularPrecioFinalConISV()}.
            </p>
          </div>
        )}

        {/* Stock */}
        <span>
          <label htmlFor="stock" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
          <InputNumber
            id="stock"
            name="stock"
            value={data.cantidad}
            onValueChange={(e) => handleChange('cantidad', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="Cantidad disponible"
            min={0}
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>


      </div>
    </Dialog>
  );
};

export default ModalEditar;