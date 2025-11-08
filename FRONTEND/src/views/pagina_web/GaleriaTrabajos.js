import { useState, useEffect } from 'react';
import { Sparkles, Scissors, Heart, ChevronDown } from 'lucide-react';

export default function GaleriaTrabajos() {
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Load Poppins font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Datos de trabajos - Resultados de grooming y accesorios
  const trabajosGaleria = [
    {
      id: 1,
      tipo: 'accesorios',
      titulo: 'Apolo',
      descripcion: 'Disfrutando su nueva camita. ¡Los productos de calidad hacen la diferencia!',
      imagen: '/images_LP/galeria1.png'
    },
    {
      id: 2,
      tipo: 'grooming',
      titulo: 'Verdi',
      descripcion: 'Modelando su corte creativo y estilizado con acabado profesional',
      imagen: '/images_LP/galeria2.png'
    },
    {
      id: 3,
      tipo: 'accesorios',
      titulo: 'Bob',
      descripcion: 'Collares, correas y accesorios de la más alta calidad',
      imagen: '/images_LP/galeria3.png'
    },
    {
      id: 4,
      tipo: 'grooming',
      titulo: 'Rocky',
      descripcion: 'Promocion de shnauzer baño y corte completo',
      imagen: '/images_LP/galeria4.png'
    },
    {
      id: 5,
      tipo: 'accesorios',
      titulo: 'Chloe',
      descripcion: 'Modelando su nuevo tutu, ¡un look encantador!',
      imagen: '/images_LP/galeria5.png'
    },
    {
      id: 6,
      tipo: 'grooming',
      titulo: 'Apolo',
      descripcion: 'Promocion de medianitos baño completo',
      imagen: '/images_LP/galeria6.jpg'
    },
    {
      id: 7,
      tipo: 'accesorios',
      titulo: 'Duque',
      descripcion: 'modelando su collar nuevo, ¡un estilo único!',
      imagen: '/images_LP/galeria7.jpg'
    },
    {
      id: 8,
      tipo: 'grooming',
      titulo: 'Elvis',
      descripcion: 'Vino por su grooming especial para cobayas, ',
      imagen: '/images_LP/galeria8.png'
    },
    {
      id: 9,
      tipo: 'accesorios',
      titulo: 'Channel',
      descripcion: 'Nos modela su pecherita de vaquita, ¡un estilo adorable!',
      imagen: '/images_LP/galeria9.jpg'
    },
    {
      id: 10,
      tipo: 'grooming',
      titulo: 'Max',
      descripcion: 'Sin lugar a dudas nuestros clientes son los más guaperrimos!!!!',
      imagen: '/images_LP/galeria10.jpg'
    },
    {
      id: 11,
      tipo: 'accesorios',
      titulo: 'blacky',
      descripcion: 'Luciendo su nueva corbata, ¡un estilo único!',
      imagen: '/images_LP/galeria11.jpg'
    },
    {
      id: 12,
      tipo: 'grooming',
      titulo: 'Tina',
      descripcion: 'Corte y bañito con champú olor a avena, ¡un lujo para su pelaje!',
      imagen: '/images_LP/galeria12.jpg'
    },
    {
      id: 13,
      tipo: 'accesorios',
      titulo: 'Bella',
      descripcion: 'Hermosa con su vestido florar y su gancho a juego, impecable!',
      imagen: '/images_LP/galeria13.jpg'
    },
    {
      id: 14,
      tipo: 'grooming',
      titulo: 'Mila',
      descripcion: 'Mantiene su pelaje brillante y saludable con nuestro tratamiento especial',
      imagen: '/images_LP/galeria14.jpg'
    },
    {
      id: 15,
      tipo: 'accesorios',
      titulo: 'Totto',
      descripcion: 'Disfrutando de su cama ortopédica y juguetes interactivos nuevos',
      imagen: '/images_LP/galeria15.jpg'
    },
    
  ];

  // Filtros disponibles
  const filtros = [
    { key: 'todos', label: 'Todos los trabajos', icon: <Heart /> },
    { key: 'grooming', label: 'Grooming', icon: <Scissors /> },
    { key: 'accesorios', label: 'Accesorios', icon: <Sparkles /> }
  ];

  // Filtrar trabajos
  const trabajosFiltrados = tipoFiltro === 'todos' 
    ? trabajosGaleria 
    : trabajosGaleria.filter(trabajo => trabajo.tipo === tipoFiltro);

  // Paginación - mostrar solo la primera fila (5 imágenes en desktop)
  const trabajosParaMostrar = mostrarTodos 
    ? trabajosFiltrados 
    : trabajosFiltrados.slice(0, 5);

  // Verificar si hay más elementos para mostrar
  const hayMasElementos = trabajosFiltrados.length > 5 && !mostrarTodos;

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-transparent" style={{ 
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
    }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Título de la sección */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in">
          <h3 className="text-4xl !font-black text-poppins-800 mb-3 sm:mb-4 tracking-tight">
            GALERÍA DE RESULTADOS
          </h3>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre los increíbles resultados de nuestros servicios de grooming
            <br className="hidden sm:block"/>
            y nuestros productos de calidad premium.
          </p>
        </div>

        {/* Filtros centrados */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 lg:mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
          {filtros.map((filtro) => (
            <button
              key={filtro.key}
              onClick={() => {
                setTipoFiltro(filtro.key);
                setMostrarTodos(false); // Resetear paginación al cambiar filtro
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 ${
                tipoFiltro === filtro.key
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-purple-100 shadow-md'
              }`}
            >
              <span className="w-4 h-4">{filtro.icon}</span>
              <span className="hidden sm:inline">{filtro.label}</span>
              <span className="sm:hidden">{filtro.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Grid de trabajos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {trabajosParaMostrar.map((trabajo, index) => (
            <div 
              key={trabajo.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Contenedor de imagen */}
              <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
                <div className="w-full h-full relative overflow-hidden">
                  <img
                    src={trabajo.imagen}
                    alt={trabajo.titulo}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Información del trabajo */}
              <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3 text-center relative">
                <div className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                  trabajo.tipo === 'grooming' ? 'bg-purple-500' : 'bg-pink-500'
                }`}>
                  {trabajo.tipo === 'grooming' ? 'RESULTADO' : 'PRODUCTO'}
                </div>
                
                <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-2 leading-tight mt-4">
                  {trabajo.titulo}
                </h4>
                
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {trabajo.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Ver más/menos a la derecha - después del grid */}
        <div className="flex justify-end mt-8 sm:mt-10 lg:mt-12 animate-fade-in">
          {hayMasElementos && (
            <button
              onClick={() => setMostrarTodos(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Ver más</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}

          {mostrarTodos && trabajosFiltrados.length > 5 && (
            <button
              onClick={() => setMostrarTodos(false)}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Ver menos</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
            </button>
          )}
        </div>

      </div>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        

      `}</style>
    </section>
  );
}