
const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {

    //OBTIENE EL TOKEN DEL HEADER AUTHORIZATION: 'BEARER TOKEN' 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: '🔒 Token no proporcionado' 
        });
    }
    
    try {
        //VERFIFICA Y DECODIFICA TOKEN 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(' Auth: Token decodificado para ID:', decoded.id_usuario_pk);
        //GUARDA INFO DEL USUARIO EN REQ PARA USARLO EN OTRAS RUTAS
        req.usuario = decoded;
        
        //CONTINUA AL SIGUIENTE MIDDLEWARE O RUTA
        next();
        
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'SE EXPIRÓ LA SESIÓN, INICIA SESIÓN DE NUEVO' 
            });
        }
        
        return res.status(403).json({ 
            success: false,
            message: 'TOKEN INVALIDO' 
        });
    }
};