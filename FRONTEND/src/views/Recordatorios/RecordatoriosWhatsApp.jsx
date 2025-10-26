import React, { useState } from 'react';
import {
  CCard, CCardHeader, CCardBody,
  CForm, CFormInput, CButton, CAlert
} from '@coreui/react';

const RecordatoriosWhatsApp = () => {
  const [numero, setNumero] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [alerta, setAlerta] = useState('');

  const enviarWhatsApp = (e) => {
    e.preventDefault();

    if (!numero || !mensaje) {
      setAlerta('Debe ingresar número y mensaje');
      setTimeout(() => setAlerta(''), 3000);
      return;
    }

    // Limpia el número (quita espacios o guiones)
    const numeroLimpio = numero.replace(/\D/g, '');

    // Crea el link para abrir WhatsApp Web
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
    setAlerta('Mensaje abierto en WhatsApp Web');
    setNumero('');
    setMensaje('');
    setTimeout(() => setAlerta(''), 4000);
  };

  return (
    <div className="p-4">
      <CCard className="shadow-lg rounded-3xl">
        <CCardHeader className="bg-success text-white fw-bold">
          Enviar Mensajes WhatsApp
        </CCardHeader>
        <CCardBody>
          {alerta && <CAlert color="info">{alerta}</CAlert>}

          <CForm onSubmit={enviarWhatsApp}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Número del cliente (incluye código país)</label>
              <CFormInput
                type="text"
                placeholder="Ejemplo: 50498765432"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Mensaje</label>
              <CFormInput
                type="text"
                placeholder="Escribe tu mensaje aquí"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </div>

            <CButton type="submit" color="success" className="w-100 mt-2">
              Enviar por WhatsApp
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default RecordatoriosWhatsApp;
