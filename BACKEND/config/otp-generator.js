
exports.generarCodigoOTP = () => {
  
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Lo devolvemos como cadena de texto para mantener el formato '000000' si fuera necesario
    return otp.toString();
};