import makeWASocket, { useSingleFileAuthState } from '@adiwajshing/baileys';
import P from 'pino';
import mysqlConnection from '../config/conexion.js';

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let sock;

export const iniciarWhatsApp = () => {
  sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close') {
      console.log('Conexión cerrada, reconectando en 5s...');
      setTimeout(iniciarWhatsApp, 5000);
    } else if(connection === 'open') {
      console.log('✅ WhatsApp conectado');
    }
  });

  sock.ev.on('creds.update', saveState);
};

//Iniciar WhatsApp al cargar el módulo
iniciarWhatsApp();

export { sock };
