import axios from "axios";

const API_URL = "http://localhost:4000/api";


{/*SERVICIO QUE CONSUME EL ENDPOINT DEL LOGIN*/}
export const loginUsuario = async (login, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { login, password });
    return res.data;
  } catch (err) {
    console.error('Error en login:', err);
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return null;
  }
};
