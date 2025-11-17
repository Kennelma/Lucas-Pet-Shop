import Usuarios from './usuarios/Usuarios';

const Seguridad = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      {/* Componente de Usuarios */}
      <Usuarios />
    </div>
  );
};

export default Seguridad;