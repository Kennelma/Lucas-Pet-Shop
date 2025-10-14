const nodemailer = require('nodemailer');

//CONFIGURACION DEL TRANSPORTADOR DE EMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',  //'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASSWORD  
    }
});

// Función para enviar código 2FA
exports.enviarCodigo2FA = async (email, codigo) => {
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Código de verificación - Lucas Pet Shop',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Código de verificación</h2>
                <p>Tu código de autenticación de dos factores es:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${codigo}</h1>
                <p>Este código expira en <strong>5 minutos</strong>.</p>
                <p>Si no solicitaste este código, ignora este mensaje.</p>
            </div>
        `
    };
    
    return await transporter.sendMail(mailOptions);
};