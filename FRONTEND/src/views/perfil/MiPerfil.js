import React, { useState } from 'react'
import { CModal, CModalBody } from '@coreui/react'

const MiPerfil = ({ visible, onClose }) => {
  const usuarioString = sessionStorage.getItem('usuario')
  const usuario = usuarioString ? JSON.parse(usuarioString) : null

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: '',
    email: usuario?.email || '',
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: ''
  })

  const [mostrarContraseñas, setMostrarContraseñas] = useState(false)
  const [errores, setErrores] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validarFormulario = () => {
    const nuevosErrores = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido'
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido'
    } else if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    // Validar contraseñas solo si se está intentando cambiar
    if (formData.contraseñaActual || formData.nuevaContraseña || formData.confirmarContraseña) {
      if (!formData.contraseñaActual) {
        nuevosErrores.contraseñaActual = 'Ingrese su contraseña actual'
      }
      if (!formData.nuevaContraseña) {
        nuevosErrores.nuevaContraseña = 'Ingrese una nueva contraseña'
      } else if (formData.nuevaContraseña.length < 6) {
        nuevosErrores.nuevaContraseña = 'Mínimo 6 caracteres'
      }
      if (formData.nuevaContraseña !== formData.confirmarContraseña) {
        nuevosErrores.confirmarContraseña = 'Las contraseñas no coinciden'
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSave = () => {
    if (!validarFormulario()) {
      return
    }

    console.log('Guardando cambios:', formData)
    
    // Actualizar sessionStorage con los nuevos datos
    const usuarioActualizado = {
      ...usuario,
      nombre: formData.nombre,
      email: formData.email
    }
    sessionStorage.setItem('usuario', JSON.stringify(usuarioActualizado))

    // Aquí puedes agregar la lógica para enviar a tu API
    // Por ejemplo:
    // await actualizarPerfil(formData)
    
    alert('Cambios guardados exitosamente')
    onClose()
  }

  return (
    <CModal visible={visible} onClose={onClose} size="lg" alignment="center">
      <CModalBody className="p-0">
        <div className="bg-white p-4 rounded-lg">
          {/* Header con Avatar */}
          <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
            <div className="d-flex flex-wrap flex-grow-1 gap-3 align-items-center">
              {/* Avatar SVG */}
              <div 
                className="d-flex justify-content-center align-items-center bg-light rounded-4 overflow-hidden"
                style={{ width: '70px', height: '70px', minHeight: '70px' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 100 100"
                  height="100"
                  width="100"
                >
                  <g clipPath="url(#clip0_2721_15386)">
                    <rect fill="#EAEFF4" height="100" width="100"></rect>
                    <path
                      fill="#DCE8F3"
                      d="M-50 4.28715L20.8808 86L86 18.8693L-41.0227 -97L-50 4.28715Z"
                    ></path>
                    <path
                      fill="#50FFD2"
                      d="M82.3191 48.7522C82.3191 66.7029 65.9852 81.2548 45.8364 81.2548C25.6876 81.2548 9.35376 66.7029 9.35376 48.7522C9.35376 30.8014 25.6876 16.2495 45.8364 16.2495C65.9852 16.2495 82.3191 30.8014 82.3191 48.7522Z"
                    ></path>
                    <path
                      fill="#A9BFD0"
                      d="M45.7071 30.4947C47.9995 41.4191 41.9487 51.847 32.1922 53.7861C22.4358 55.7252 12.6682 48.4412 10.3757 37.5169C8.08326 26.5925 14.134 16.1646 23.8905 14.2255C33.647 12.2864 43.4146 19.5704 45.7071 30.4947Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M31.6555 51.2282C39.6264 49.644 45.1479 40.8774 43.0788 31.0171C41.0096 21.1568 32.3982 15.1991 24.4273 16.7834C16.4563 18.3676 10.9349 27.1342 13.004 36.9945C15.0732 46.8547 23.6845 52.8125 31.6555 51.2282ZM32.1922 53.7861C41.9487 51.847 47.9995 41.4191 45.7071 30.4947C43.4146 19.5704 33.647 12.2864 23.8905 14.2255C14.134 16.1646 8.08326 26.5925 10.3757 37.5169C12.6682 48.4412 22.4358 55.7252 32.1922 53.7861Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M40.8267 35.0677C42.2059 41.6399 38.741 47.8786 33.0877 49.0022C27.4345 50.1258 21.7335 45.7088 20.3544 39.1366C18.9752 32.5644 22.4401 26.3257 28.0933 25.2021C33.7466 24.0785 39.4475 28.4955 40.8267 35.0677Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M32.3363 45.4212C35.3717 44.8179 38.2419 41.0162 37.1471 35.7991C36.0523 30.5819 31.8803 28.1798 28.8448 28.7831C25.8094 29.3864 22.9392 33.1881 24.034 38.4053C25.1288 43.6225 29.3008 46.0245 32.3363 45.4212ZM33.0877 49.0022C38.741 47.8786 42.2059 41.6399 40.8267 35.0677C39.4475 28.4955 33.7466 24.0785 28.0933 25.2021C22.4401 26.3257 18.9752 32.5644 20.3544 39.1366C21.7335 45.7088 27.4345 50.1258 33.0877 49.0022Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                    <path
                      fill="#A9BFD0"
                      d="M56.5178 30.4947C54.2253 41.4191 60.2761 51.847 70.0326 53.7861C79.7891 55.7252 89.5567 48.4412 91.8491 37.5169C94.1416 26.5925 88.0908 16.1646 78.3343 14.2255C68.5778 12.2864 58.8102 19.5704 56.5178 30.4947Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M70.5694 51.2282C62.5984 49.644 57.0769 40.8774 59.1461 31.0171C61.2152 21.1568 69.8266 15.1991 77.7976 16.7834C85.7685 18.3676 91.29 27.1342 89.2208 36.9945C87.1517 46.8547 78.5403 52.8125 70.5694 51.2282ZM70.0326 53.7861C60.2761 51.847 54.2253 41.4191 56.5178 30.4947C58.8102 19.5704 68.5778 12.2864 78.3343 14.2255C88.0908 16.1646 94.1416 26.5925 91.8491 37.5169C89.5567 48.4412 79.7891 55.7252 70.0326 53.7861Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M60.3897 35.5306C58.9569 42.3585 62.2481 48.7785 67.7409 49.8702C73.2337 50.9619 78.848 46.3118 80.2808 39.484C81.7136 32.6562 78.4224 26.2361 72.9296 25.1444C67.4368 24.0527 61.8225 28.7028 60.3897 35.5306Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M68.4924 46.2892C65.8196 45.758 62.8699 41.9777 64.0693 36.2619C65.2688 30.5462 69.5053 28.1942 72.1781 28.7254C74.8509 29.2566 77.8006 33.0369 76.6012 38.7527C75.4017 44.4684 71.1652 46.8204 68.4924 46.2892ZM67.7409 49.8702C62.2481 48.7785 58.9569 42.3585 60.3897 35.5306C61.8225 28.7028 67.4368 24.0527 72.9296 25.1444C78.4224 26.2361 81.7136 32.6562 80.2808 39.484C78.848 46.3118 73.2337 50.9619 67.7409 49.8702Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                    <path
                      fill="#A9BFD0"
                      d="M50.2344 26.5635C25.0307 26.5635 16.3064 41.4427 16.3064 59.7971V78.8457C16.3064 82.0187 19.8296 82.721 21.1569 85.3949C29.4907 78.7198 38.8232 76.8192 52.3032 76.8192C64.1602 76.8192 74.085 78.148 82.1848 83.4734C82.9007 81.419 84.1624 81.1375 84.1624 78.8457V59.7971C84.1624 41.4427 73.6932 26.5635 50.2344 26.5635Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M43.3794 49.1864C43.3794 52.0937 41.0479 54.4505 38.1718 54.4505C35.2957 54.4505 32.9641 52.0937 32.9641 49.1864C32.9641 46.2792 35.2957 43.9224 38.1718 43.9224C41.0479 43.9224 43.3794 46.2792 43.3794 49.1864Z"
                    ></path>
                    <path
                      fill="white"
                      d="M38.7763 47.4369C38.7763 49.0604 37.4743 50.3765 35.8682 50.3765C34.2621 50.3765 32.9601 49.0604 32.9601 47.4369C32.9601 45.8134 34.2621 44.4973 35.8682 44.4973C37.4743 44.4973 38.7763 45.8134 38.7763 47.4369Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M67.931 49.1864C67.931 52.0937 65.5995 54.4505 62.7234 54.4505C59.8473 54.4505 57.5157 52.0937 57.5157 49.1864C57.5157 46.2792 59.8473 43.9224 62.7234 43.9224C65.5995 43.9224 67.931 46.2792 67.931 49.1864Z"
                    ></path>
                    <path
                      fill="white"
                      d="M63.3266 47.4369C63.3266 49.0604 62.0246 50.3765 60.4185 50.3765C58.8124 50.3765 57.5104 49.0604 57.5104 47.4369C57.5104 45.8134 58.8124 44.4973 60.4185 44.4973C62.0246 44.4973 63.3266 45.8134 63.3266 47.4369Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M45.5681 51.1016C45.5681 48.5784 47.6699 46.533 50.2626 46.533C52.8553 46.533 54.957 48.5784 54.957 51.1016V55.0176C54.957 57.5408 52.8553 59.5862 50.2626 59.5862C47.6699 59.5862 45.5681 57.5408 45.5681 55.0176V51.1016Z"
                    ></path>
                    <path
                      fill="#3A546A"
                      d="M49.2236 66.0938V58.803H51.6379V66.0641L55.8604 63.8106C56.445 63.4986 57.1788 63.7069 57.4993 64.2758C57.8199 64.8447 57.6059 65.5588 57.0213 65.8708L50.4399 69.3832L43.6605 65.8782C43.0717 65.5738 42.848 64.8625 43.1607 64.2895C43.4735 63.7165 44.2044 63.4988 44.7931 63.8032L49.2236 66.0938Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_2721_15386">
                      <rect fill="white" height="100" width="100"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>

              {/* Info del usuario */}
              <div className="d-flex flex-column">
                <div className="fw-semibold text-dark">{formData.nombre || 'Usuario'}</div>
                <div className="small text-muted mt-1">
                  {formData.email || 'usuario@ejemplo.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario en Grid */}
          <div className="row g-3 mb-4">
            {/* Nombre */}
            <div className="col-md-6">
              <div className="position-relative">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  placeholder="Nombre"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: formData.nombre ? '-10px' : '50%',
                    left: '12px',
                    transform: formData.nombre ? 'none' : 'translateY(-50%)',
                    fontSize: formData.nombre ? '12px' : '14px',
                    color: errores.nombre ? '#dc3545' : '#6c757d',
                    transition: 'all 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  Nombre *
                </label>
                {errores.nombre && (
                  <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem' }}>
                    {errores.nombre}
                  </div>
                )}
              </div>
            </div>

            {/* Apellido */}
            <div className="col-md-6">
              <div className="position-relative">
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Apellido"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: formData.apellido ? '-10px' : '50%',
                    left: '12px',
                    transform: formData.apellido ? 'none' : 'translateY(-50%)',
                    fontSize: formData.apellido ? '12px' : '14px',
                    color: '#6c757d',
                    transition: 'all 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  Apellido
                </label>
              </div>
            </div>

            {/* Email - AHORA EDITABLE */}
            <div className="col-12">
              <div className="position-relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  placeholder="E-mail"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: '-10px',
                    left: '12px',
                    fontSize: '12px',
                    color: errores.email ? '#dc3545' : '#6c757d',
                    pointerEvents: 'none'
                  }}
                >
                  E-mail *
                </label>
                {errores.email && (
                  <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem' }}>
                    {errores.email}
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="col-12">
              <hr className="my-2" />
              <h6 className="text-muted mb-0">Cambiar Contraseña (Opcional)</h6>
              <small className="text-muted">Deja los campos vacíos si no deseas cambiar tu contraseña</small>
            </div>

            {/* Contraseña Actual */}
            <div className="col-md-4">
              <div className="position-relative">
                <input
                  type={mostrarContraseñas ? "text" : "password"}
                  name="contraseñaActual"
                  value={formData.contraseñaActual}
                  onChange={handleChange}
                  className={`form-control ${errores.contraseñaActual ? 'is-invalid' : ''}`}
                  placeholder="Contraseña actual"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: formData.contraseñaActual ? '-10px' : '50%',
                    left: '12px',
                    transform: formData.contraseñaActual ? 'none' : 'translateY(-50%)',
                    fontSize: formData.contraseñaActual ? '12px' : '14px',
                    color: errores.contraseñaActual ? '#dc3545' : '#6c757d',
                    transition: 'all 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  Contraseña actual
                </label>
                {errores.contraseñaActual && (
                  <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem' }}>
                    {errores.contraseñaActual}
                  </div>
                )}
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div className="col-md-4">
              <div className="position-relative">
                <input
                  type={mostrarContraseñas ? "text" : "password"}
                  name="nuevaContraseña"
                  value={formData.nuevaContraseña}
                  onChange={handleChange}
                  className={`form-control ${errores.nuevaContraseña ? 'is-invalid' : ''}`}
                  placeholder="Nueva contraseña"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: formData.nuevaContraseña ? '-10px' : '50%',
                    left: '12px',
                    transform: formData.nuevaContraseña ? 'none' : 'translateY(-50%)',
                    fontSize: formData.nuevaContraseña ? '12px' : '14px',
                    color: errores.nuevaContraseña ? '#dc3545' : '#6c757d',
                    transition: 'all 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  Nueva contraseña
                </label>
                {errores.nuevaContraseña && (
                  <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem' }}>
                    {errores.nuevaContraseña}
                  </div>
                )}
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="col-md-4">
              <div className="position-relative">
                <input
                  type={mostrarContraseñas ? "text" : "password"}
                  name="confirmarContraseña"
                  value={formData.confirmarContraseña}
                  onChange={handleChange}
                  className={`form-control ${errores.confirmarContraseña ? 'is-invalid' : ''}`}
                  placeholder="Confirmar contraseña"
                  style={{ height: '50px' }}
                />
                <label 
                  className="position-absolute bg-white px-2"
                  style={{
                    top: formData.confirmarContraseña ? '-10px' : '50%',
                    left: '12px',
                    transform: formData.confirmarContraseña ? 'none' : 'translateY(-50%)',
                    fontSize: formData.confirmarContraseña ? '12px' : '14px',
                    color: errores.confirmarContraseña ? '#dc3545' : '#6c757d',
                    transition: 'all 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  Confirmar contraseña
                </label>
                {errores.confirmarContraseña && (
                  <div className="invalid-feedback d-block" style={{ fontSize: '0.875rem' }}>
                    {errores.confirmarContraseña}
                  </div>
                )}
              </div>
            </div>

            {/* Checkbox para mostrar contraseñas */}
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="mostrarContraseñas"
                  checked={mostrarContraseñas}
                  onChange={(e) => setMostrarContraseñas(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="mostrarContraseñas">
                  Mostrar contraseñas
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-outline-secondary px-4"
              type="button"
              onClick={onClose}
              style={{ height: '50px' }}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary px-4"
              type="button"
              onClick={handleSave}
              style={{ 
                height: '50px',
                backgroundColor: '#6366f1',
                borderColor: '#6366f1'
              }}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </CModalBody>
    </CModal>
  )
}

export default MiPerfil