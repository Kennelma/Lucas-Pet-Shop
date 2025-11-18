const moment = require('moment-timezone');

function getTimezoneOffset() {
  const tz = process.env.TZ || 'America/Tegucigalpa';

  try {
    //SE OBTIENE EL OFSET
    const offset = moment.tz(tz).format('Z'); 
    return offset;
  } catch (error) {
    console.warn(`Zona horaria inválida: ${tz}, usando -06:00 por defecto`);
    return '-06:00';
  }
}

module.exports = { getTimezoneOffset };