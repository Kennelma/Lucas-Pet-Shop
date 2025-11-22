import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import Swal from 'sweetalert2';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';


const ModalEditar = ({ isOpen, onClose, onSave, editData, accesoriosExistentes = [] }) => {
  const [data, setData] = useState({
    nombre: '',
    categoria: 'COLLAR',
    cantidad: 0,
    precio: 0,
    activo: true
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);

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

  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    if (aplicar && pTasa > 0) {
      return (pBase * (1 + pTasa / 100));
    } else {
      return pBase;
    }
  }

  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  useEffect(() => {
    if (isOpen && editData) {
      const tieneImpuesto = Boolean(editData.tiene_impuesto);
      const tasa = 15;
      const precioInicial = parseFloat(editData.precio_producto || editData.precio || 0);
      let base = precioInicial;

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
        precio: precioInicial,
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

      if (field === 'precio') {
        const precioActual = parseFloat(val) || 0;
        const tasa = parseFloat(tasaImpuesto) || 0;
        let nuevaBase;

        if (aplicaImpuesto && tasa > 0) {
          nuevaBase = (precioActual / (1 + tasa / 100));
        } else {
          nuevaBase = precioActual;
        }
        setPrecioBase(nuevaBase.toFixed(2));
      }

      return newData;
    });

    // ✅ VALIDACIÓN MEJORADA CON NOMBRES DUPLICADOS
    setErrores(prev => {
      const newErrores = { ...prev };

      if (field === 'nombre') {
        if (!val.trim()) {
          newErrores[field] = 'El nombre del accesorio es obligatorio';
        } else {
          // Verificar si ya existe otro accesorio con ese nombre (excluyendo el actual)
          const nombreExiste = accesoriosExistentes.some(acc =>
            acc.nombre.toLowerCase() === val.trim().toLowerCase() &&
            acc.id_producto !== editData.id_producto
          );

          if (nombreExiste) {
            newErrores[field] = 'Ya existe un accesorio con este nombre';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (field === 'categoria') {
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

  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);
    setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
  };

  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);

    if (aplicaImpuesto) {
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
    }
  };

  const validarDatos = () => {
    let temp = {};

    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del accesorio es obligatorio';
    } else {
      // ✅ VALIDACIÓN DE NOMBRE DUPLICADO EN EL SUBMIT
      const nombreExiste = accesoriosExistentes.some(acc =>
        acc.nombre.toLowerCase() === data.nombre.trim().toLowerCase() &&
        acc.id_producto !== editData.id_producto
      );

      if (nombreExiste) {
        temp.nombre = 'Ya existe un accesorio con este nombre';
      }
    }

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
        precio_producto: parseFloat(data.precio),
        tipo_producto: 'ACCESORIOS',
        activo: data.activo ? 1 : 0,
        tiene_impuesto: aplicaImpuesto ? 1 : 0
      };

      const res = await actualizarProducto(body);

      if (res.Consulta) {
        Swal.fire({
          icon: 'success',
          title: '¡Accesorio actualizado!',
          text: 'El accesorio se ha actualizado correctamente',
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

        {/* Sección de Impuestos */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50 mt-1">
          <label className="text-sm font-semibold text-gray-700">¿APLICA ISV?</label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${!aplicaImpuesto ? 'text-red-600' : 'text-gray-500'}`}>NO</span>
            <InputSwitch
              id="aplicaImpuestoSwitch"
              checked={aplicaImpuesto}
              onChange={e => handleImpuestoChange(e.value)}
            />
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

        {!aplicaImpuesto && data.precio > 0 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 mt-1">
            <p className="text-xs text-yellow-800">
              El precio base es L {parseFloat(data.precio).toFixed(2)}. Si se aplica ISV ({tasaImpuesto}%), el precio con ISV sería L <strong>{(parseFloat(data.precio) * (1 + parseFloat(tasaImpuesto) / 100)).toFixed(2)}</strong>.
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