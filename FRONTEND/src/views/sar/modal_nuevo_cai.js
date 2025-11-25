import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { crearCAI } from '../../AXIOS.SERVICES/sar-axios';
import Swal from 'sweetalert2';

const ModalNuevoCAI = ({ isOpen, onClose }) => {

  const [formData, setFormData] = useState({
    codigo_cai: '',
    fecha_limite: '',
    rango_inicial: '',
    rango_final: '',
    establecimiento: '000',
    punto_emision: '002',
    tipo_documento: '01',
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Calcular cantidad de facturas automáticamente
  const cantidadFacturas = formData.rango_inicial && formData.rango_final
    ? Math.max(0, parseInt(formData.rango_final) - parseInt(formData.rango_inicial) + 1)
    : 0;

  // Limpiar formulario cuando se cierra/abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        codigo_cai: '',
        fecha_limite: '',
        rango_inicial: '',
        rango_final: '',
        establecimiento: '000',
        punto_emision: '002',
        tipo_documento: '01',
      });
      setErrores({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'codigo_cai') {
      let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      cleaned = cleaned.substring(0, 30);

      let formatted = '';
      for (let i = 0; i < cleaned.length; i++) {
        if (i > 0 && i % 6 === 0) {
          formatted += '-';
        }
        formatted += cleaned[i];
      }

      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'rango_inicial' || name === 'rango_final') {
      let val = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: val }));
    } else if (name === 'establecimiento' || name === 'punto_emision') {
      let val = value.replace(/[^0-9]/g, '');
      val = val.substring(0, 3);
      setFormData(prev => ({ ...prev, [name]: val }));
    } else if (name === 'tipo_documento') {
      let val = value.replace(/[^0-9]/g, '');
      val = val.substring(0, 2);
      setFormData(prev => ({ ...prev, [name]: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar código CAI
    if (!formData.codigo_cai.trim()) {
      nuevosErrores.codigo_cai = 'El código CAI es obligatorio';
    } else {
      const sinGuiones = formData.codigo_cai.replace(/-/g, '');
      if (sinGuiones.length !== 30) {
        nuevosErrores.codigo_cai = 'El código CAI debe tener 30 caracteres';
      }
    }

    // Validar establecimiento
    if (!formData.establecimiento) {
      nuevosErrores.establecimiento = 'El establecimiento es obligatorio';
    } else if (formData.establecimiento.length !== 3) {
      nuevosErrores.establecimiento = 'Debe tener 3 dígitos';
    }

    // Validar punto de emisión
    if (!formData.punto_emision) {
      nuevosErrores.punto_emision = 'El punto de emisión es obligatorio';
    } else if (formData.punto_emision.length !== 3) {
      nuevosErrores.punto_emision = 'Debe tener 3 dígitos';
    }

    // Validar tipo de documento
    if (!formData.tipo_documento) {
      nuevosErrores.tipo_documento = 'El tipo de documento es obligatorio';
    } else if (formData.tipo_documento.length !== 2) {
      nuevosErrores.tipo_documento = 'Debe tener 2 dígitos';
    }

    // Validar fecha límite
    if (!formData.fecha_limite) {
      nuevosErrores.fecha_limite = 'La fecha límite es obligatoria';
    }

    // Validar rango inicial
    if (!formData.rango_inicial) {
      nuevosErrores.rango_inicial = 'El rango inicial es obligatorio';
    }

    // Validar rango final
    if (!formData.rango_final) {
      nuevosErrores.rango_final = 'El rango final es obligatorio';
    } else if (formData.rango_inicial && parseInt(formData.rango_final) < parseInt(formData.rango_inicial)) {
      nuevosErrores.rango_final = 'El rango final debe ser mayor o igual al inicial';
    }

    // Validar que no exceda 5000 facturas
    if (formData.rango_inicial && formData.rango_final) {
      const rangoInicial = parseInt(formData.rango_inicial);
      const rangoFinal = parseInt(formData.rango_final);
      const cantidadCalculada = rangoFinal - rangoInicial + 1;

      if (cantidadCalculada > 5000) {
        nuevosErrores.rango_final = 'El rango no puede exceder 5000 facturas';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (validarFormulario()) {
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Esta seguro que quiere guardar este CAI?',
        text: 'Estos datos no se podrán modificar ni eliminar después de guardarlos.',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#6b7280',
        customClass: {
          container: 'swal-on-top'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        setGuardando(true);

        const prefijo = `${formData.establecimiento}-${formData.punto_emision}-${formData.tipo_documento}`;

        const datosCAI = {
          codigo_cai: formData.codigo_cai,
          fecha_limite: formData.fecha_limite,
          cantidad_facturas: cantidadFacturas,
          establecimiento: formData.establecimiento,
          punto_emision: formData.punto_emision,
          tipo_documento: formData.tipo_documento,
          prefijo: prefijo,
          rango_inicial: formData.rango_inicial,
          rango_final: formData.rango_final,
          rango_inicio: parseInt(formData.rango_inicial),
          rango_fin: parseInt(formData.rango_final),
        };

        await crearCAI(datosCAI);

        handleClose();

        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: '¡CAI registrado!',
            text: 'El CAI se ha registrado correctamente',
            timer: 2000,
            showConfirmButton: false
          });
        }, 100);
      } catch (error) {
        console.error('Error completo al guardar CAI:', error);
        console.error('Respuesta del servidor:', error.response?.data);

        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'No se pudo guardar el CAI';

        handleClose();

        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: 'CAI No Disponible',
            text: errorMsg,
            confirmButtonColor: '#f59e0b'
          });
        }, 100);
      } finally {
        setGuardando(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      codigo_cai: '',
      fecha_limite: '',
      rango_inicial: '',
      rango_final: '',
      establecimiento: '000',
      punto_emision: '002',
      tipo_documento: '01',
    });
    setErrores({});
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        label="Cancelar"
        onClick={handleClose}
        disabled={guardando}
        className="p-button-text p-button-secondary text-sm"
      />
      <Button
        label="Guardar"
        onClick={handleSubmit}
        disabled={guardando}
        loading={guardando}
        className="bg-green-600 hover:bg-green-700 text-white border-none px-4 py-1.5 rounded-lg text-sm"
      />
    </div>
  );

  const tieneErrores = Object.keys(errores).length > 0;

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          NUEVO CAI
        </div>
      }
      visible={isOpen}
      className="w-11/12 sm:w-96 md:w-[30rem]"
      contentStyle={{ padding: '0.5rem 1.25rem' }}
      modal
      closable={false}
      onHide={handleClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="mt-1">
        <div className="flex flex-col gap-2">
          {/* Nota Informativa */}
          <p className="text-[9px] text-gray-600 italic leading-tight">
            * LOS VALORES ESTÁN CONFIGURADOS POR DEFECTO PERO PUEDEN SER EDITADOS SEGÚN SU AUTORIZACIÓN DEL SAR.
          </p>

          {/* CAMPOS AHORA EDITABLES */}
          <div className="grid grid-cols-3 gap-2">
            {/* Establecimiento */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                ESTABLECIMIENTO
              </label>
              <InputText
                name="establecimiento"
                value={formData.establecimiento}
                onChange={handleChange}
                maxLength={3}
                className="w-full rounded-xl h-8 text-sm"
                placeholder="000"
                autoComplete="off"
              />
              {errores.establecimiento && (
                <p className="text-[10px] text-red-600 mt-0.5">{errores.establecimiento}</p>
              )}
            </div>

            {/* Punto de Emisión */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                PUNTO DE EMISIÓN
              </label>
              <InputText
                name="punto_emision"
                value={formData.punto_emision}
                onChange={handleChange}
                maxLength={3}
                className="w-full rounded-xl h-8 text-sm"
                placeholder="002"
                autoComplete="off"
              />
              {errores.punto_emision && (
                <p className="text-[10px] text-red-600 mt-0.5">{errores.punto_emision}</p>
              )}
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                TIPO DE DOCUMENTO
              </label>
              <InputText
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                maxLength={2}
                className="w-full rounded-xl h-8 text-sm"
                placeholder="01"
                autoComplete="off"
              />
              {errores.tipo_documento && (
                <p className="text-[10px] text-red-600 mt-0.5">{errores.tipo_documento}</p>
              )}
            </div>
          </div>

          {/* Código CAI */}
          <div>
            <label htmlFor="codigo_cai" className="block text-[11px] font-semibold text-gray-700 mb-0.5">
              CÓDIGO CAI
            </label>
            <InputText
              id="codigo_cai"
              name="codigo_cai"
              value={formData.codigo_cai}
              onChange={handleChange}
              className="w-full rounded-xl h-8 text-sm"
              placeholder="44009D-F53E7E-7C06E0-63BE03-090938-C3"
              autoComplete="off"
              maxLength={35}
            />
            {errores.codigo_cai && (
              <p className="text-[10px] text-red-600 mt-0.5">{errores.codigo_cai}</p>
            )}
          </div>

          {/* Fecha Límite */}
          <div>
            <label htmlFor="fecha_limite" className="block text-[11px] font-semibold text-gray-700 mb-0.5">
              FECHA LÍMITE
            </label>
            <input
              type="date"
              id="fecha_limite"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, fecha_limite: e.target.value }));
                if (errores.fecha_limite) {
                  setErrores(prev => ({ ...prev, fecha_limite: '' }));
                }
              }}
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
              className="w-full rounded-xl h-8 text-sm border border-gray-300 px-3"
              autoComplete="off"
            />
            {errores.fecha_limite && (
              <p className="text-[10px] text-red-600 mt-0.5">{errores.fecha_limite}</p>
            )}
          </div>

          {/* Rango Inicial y Final */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rango Inicial */}
            <div>
              <label htmlFor="rango_inicial" className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                RANGO INICIAL
              </label>
              <InputText
                id="rango_inicial"
                name="rango_inicial"
                value={formData.rango_inicial}
                onChange={handleChange}
                maxLength={7}
                className={`w-full rounded-xl h-8 text-sm ${errores.rango_inicial ? 'p-invalid' : ''}`}
                placeholder="1 / 0000001"
                autoComplete="off"
              />
              {errores.rango_inicial && (
                <p className="text-[10px] text-red-600 mt-0.5">{errores.rango_inicial}</p>
              )}
            </div>

            {/* Rango Final */}
            <div>
              <label htmlFor="rango_final" className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                RANGO FINAL
              </label>
              <InputText
                id="rango_final"
                name="rango_final"
                value={formData.rango_final}
                onChange={handleChange}
                maxLength={7}
                className={`w-full rounded-xl h-8 text-sm ${errores.rango_final ? 'p-invalid' : ''}`}
                placeholder="1 / 0000001"
                autoComplete="off"
              />
              {errores.rango_final && (
                <p className="text-[10px] text-red-600 mt-0.5">{errores.rango_final}</p>
              )}
            </div>
          </div>

          {/* Cantidad de Facturas Calculada */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
              CANTIDAD DE FACTURAS AUTORIZADAS
            </label>
            <input
              type="text"
              value={cantidadFacturas.toString()}
              readOnly
              className="w-full h-8 px-3 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed font-semibold"
            />
          </div>

        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoCAI;