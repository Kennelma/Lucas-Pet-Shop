import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    //SI NO HAY TOKEN, REDIRIGE AL LOGIN
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const verificarExpiracion = () => {
            const token = sessionStorage.getItem('token');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {

                //DECODIFICA EL TOKEN PARA OBTENER LA FECHA DE EXPIRACION
                const decoded = jwtDecode(token);
                const tiempoActual = Date.now() / 1000; 

                //SI EL TOKEN YA EXPIRÓ
                if (decoded.exp < tiempoActual) {
                    console.log('🚨 TOKEN EXPIRADO - Cerrando sesión automáticamente');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('usuario');

                    //GUARDA UN MENSAJE PARA MOSTRAR EN EL LOGIN
                    sessionStorage.setItem('sessionExpired', 'true');

                    navigate('/login');
                }

            } catch (error) {
                console.error('Error al verificar token:', error);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('usuario');
                navigate('/login');
            }
        };

        //VERIFICA INMEDIATAMENTE
        verificarExpiracion();

        //VERIFICA CADA 5 SEGUNDOS (PRUEBA RÁPIDA)
        //const intervalo = setInterval(verificarExpiracion, 5000);

        const intervalo = setInterval(verificarExpiracion, 30000);

        //LIMPIA EL INTERVALO CUANDO SE DESMONTA EL COMPONENTE
        return () => clearInterval(intervalo);
    }, [navigate]);

    return children;
};

export default ProtectedRoute;