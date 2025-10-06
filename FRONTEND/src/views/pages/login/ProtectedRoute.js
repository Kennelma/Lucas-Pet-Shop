import React from 'react'
import { Navigate } from 'react-router-dom'


const ProtectedRoute = ({ children }) => {

    //ESTADO PARA GUARDAR EL TOKEN EN EL LOCAL STORAGE
    const token = sessionStorage.getItem('token')

    //SI NO HAY TOKEN, SE QUEDA EN EL LOGIN
    if (!token) {
        return <Navigate to="/login" replace />
    }

    //SI HAY TOKEN, RENDERIZA LAS PAGINAS
    return children
}

export default ProtectedRoute