import { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import Carousel3D from './Carousel3D';
import { Heart, Stethoscope, Scissors, Home, Phone, Mail, MapPin, Clock, Sparkles, Award, ArrowRight, Play, Instagram, Facebook } from 'lucide-react';
import MapaGoogle from "./MapaGoogle";
import { useNavigate } from 'react-router-dom';

export default function VeterinariaLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
      setShowNavbar(true);
    }
  };

  const serviciosData = {
    productos: {
      titulo: "PRODUCTOS ESENCIALES",
      descripcion: "Todo lo que tu mascota necesita para su cuidado diario",
      items: [
        {
          imagen: "images/mod4.jpeg",
          titulo: "Collares y Correas",
          descripcion: "Accesorios resistentes y elegantes para paseos seguros"
        },
        {
          imagen: "images/mod8.jpeg",
          titulo: "Camas Premium",
          descripcion: "Descanso confortable y ortopédico"
        }
      ]
    },
    estetica: { titulo: "SERVICIOS DE ESTÉTICA", descripcion: "Tu mascota lucirá hermosa y saludable",
      items: [
        { imagen: "images/car10.jpeg", titulo: "Baño Completo", descripcion: "Limpieza profunda con shampoo premium y acondicionador" },
        { imagen: "images/mod1.jpeg", titulo: "Corte de Pelo", descripcion: "Estilizado según raza o preferencia del dueño" }
      ]
    },
    especies: {
      titulo: "VARIEDAD DE ESPECIES",
      descripcion: "Encuentra a tu nuevo compañero ideal",
      items: [
        {
          imagen: "images/mod9.jpeg",
          titulo: "Hamster",
          descripcion: "Hamster certificado de las mejores líneas"
        },
        {
          imagen: "images/mod11.jpeg",
          titulo: "Gatos Domésticos",
          descripcion: "Felinos cariñosos y bien socializados"
        }
      ]
    },
    comidas: {
      titulo: "COMIDAS SALUDABLES",
      descripcion: "Nutrición balanceada para cada etapa de vida",
      items: [
        {
          imagen: "images/mod6.jpeg",
          titulo: "Alimento para Cachorros",
          descripcion: "Fórmulas ricas en proteínas para el crecimiento"
        },
        {
          imagen: "images/mod10.jpeg",
          titulo: "Alimento para Adultos",
          descripcion: "Nutrición balanceada"
        }
      ]
    }
  };

 // 🔹 Lista de botones de contacto
const contactButtons = [
  { icon: <Instagram />, label: "Instagram", color: "from-pink-500 to-purple-500", link: "https://www.instagram.com/lucas_petshop_hn?utm_source=qr&igsh=NHB6dXUyejE3YTNz" },
  { icon: <Facebook />, label: "Facebook", color: "from-blue-500 to-cyan-500", link: "https://www.facebook.com/share/1EshaJDckp/" },
  { icon: <Phone />, label: "Teléfono", color: "from-green-500 to-emerald-500",  info: "Fijo: +504 2281-7170        WhatsApp: +504 8920-4753" },
  { icon: <Mail />, label: "Correo", color: "from-yellow-500 to-orange-500", info: "lucaspetshop1@gmail.com" },
  { icon: <Clock />, label: "Horario", color: "from-indigo-500 to-blue-500",  info: "Lun-Dom: 8:00 AM - 8:00 PM" },
];

const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setServicioSeleccionado(null);
  };

  const navigate = useNavigate();

  return (

    <div className="bg-white min-h-screen">
      <nav className={`bg-black shadow-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-9xl mx-auto px-8 py-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/images/logo.png"
                alt="Lucas Pet Shop"
                className="w-[90px] h-[90px] object-contain"
              />
              <span className="text-xl md:text-2xl font-bold text-white">
                LUCAS PET SHOP
              </span>
            </div>
            
            <div className="flex items-center gap-1 bg-white rounded-full px-2 py-0">
                <button onClick={() => scrollToSection('inicio')} className="text-black px-5 py-2 !rounded-full font-medium hover:bg-gray-100 hover:shadow-sm transition-all">
                  Inicio
                </button>
                <button onClick={() => scrollToSection('servicios')} className="text-black px-5 py-2 !rounded-full font-medium hover:bg-gray-100 hover:shadow-sm transition-all">
                  Servicios
                </button>
                <button onClick={() => scrollToSection('nosotros')} className="text-black px-5 py-2 !rounded-full font-medium hover:bg-gray-100 hover:shadow-sm transition-all">
                  Nosotros
                </button>
                <button onClick={() => scrollToSection('contacto')} className="text-black px-5 py-2 !rounded-full font-medium hover:bg-gray-100 hover:shadow-sm transition-all">
                  Contacto
                </button>
              </div>
              
              <button onClick={() => navigate('/login')}
        className="bg-gradient-to-r from-white to-indigo-600 text-black px-6 py-2 !rounded-full font-semibold hover:from-blue-100 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
      >
        Iniciar Sesión
      </button>
            </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                {['inicio', 'servicios', 'nosotros', 'contacto'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="px-4 py-2 text-left rounded-lg text-white hover:bg-gray-800 transition-colors"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="pt-[200px]">
        <section id="inicio" className="bg-yellow-50 relative min-h-[640px] overflow-hidden -mt-[106px] pt-[106px]">
          <div className="absolute inset-0 z-0">
            <img 
              src="images/landing.jpeg"
              alt="Mascotas" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-1 pt-12 pb-20">
            <div className="max-w-xl">
              <h1 className="-pt-10 text-2xl md:text-4xl font-bold !text-yellow-100 mb-6 leading-tight">
                MÁS QUE UNA TIENDA, UN HOGAR PARA TU MASCOTA<br/> 
              </h1>
              <button onClick={() => scrollToSection('conocenos')} className="bg-white text-gray-800 px-4 py-3 !rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg">
                Conoce más
              </button>
            </div>
          </div>

          <svg className="absolute bottom-[-1px] left-0 w-full z-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#fff9e2ff"/>
          </svg>
        </section>

        <section id="conocenos" className="pt-20 bg-yellow-50 relative min-h-[600px] overflow-hidden" style={{ backgroundColor: '#fff9e2ff' }}>
          <Carousel3D />
        </section>

          {/**SERVICIOS */}
        <section 
          id="servicios"
          className="px-8 py-20 relative" 
          style={{ 
            background: 'linear-gradient(to bottom, #fecaca 0%, #fdd5d5 20%, #fff9e2ff 60%, #fff9e2ff 100%)' 
          }}
        >
          <div className="max-w-7xl mx-auto relative z-5 pt-5">
            <div className="relative text-center mb-12">
              <h3 className="text-4xl !font-black text-stone-800">SERVICIOS QUE TE OFRECEMOS</h3>
              <p className="text-stone-800 leading-relaxed text-lg">
                En Lucas Pet Shop brindamos atención veterinaria, grooming profesional, alimentación balanceada y
                <br/>productos de calidad para el bienestar completo de tu mascota.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto justify-items-center">
              <div 
                onClick={() => abrirModal(serviciosData.productos)}
                className="bg-white from-purple-200 to-purple-300 rounded-[2.5rem] p-8 text-stone-800 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
                <div className="relative text-center">
                  <div className="w-14 h-14 bg-purple-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto">
                    <Home className="text-purple-700" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 leading-tight text-purple-800">PRODUCTOS ESENCIALES</h3>
                  <p className="text-purple-700 text-sm leading-relaxed opacity-90">
                    Accesorios y productos de cuidado diario para tu mascota.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => abrirModal(serviciosData.estetica)}
                className="bg-white from-rose-200 to-pink-300 rounded-[2.5rem] p-8 text-stone-800 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
                <div className="relative text-center">
                  <div className="w-14 h-14 bg-rose-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto">
                    <Sparkles className="text-rose-700" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 leading-tight text-rose-800">SERVICIOS DE ESTÉTICA</h3>
                  <p className="text-rose-700 text-sm leading-relaxed opacity-90">
                    Grooming profesional, baños terapéuticos y cortes de pelo especializados.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => abrirModal(serviciosData.especies)}
                className="bg-white from-emerald-200 to-green-300 rounded-[2.5rem] p-8 text-stone-800 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
                <div className="relative text-center">
                  <div className="w-14 h-14 bg-emerald-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto">
                    <Heart className="text-emerald-700" size={24} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 leading-tight text-emerald-800">VARIEDAD DE ESPECIES A LA VENTA</h3>
                  <p className="text-emerald-700 text-sm leading-relaxed opacity-90">
                    Perros, aves, conejos, tortugas y mas.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => abrirModal(serviciosData.comidas)}
                className="bg-white from-amber-200 to-orange-300 rounded-[2.5rem] p-8 text-stone-800 shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-20"></div>
                <div className="relative text-center">
                  <div className="w-14 h-14 bg-amber-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-5 mx-auto">
                    <Sparkles className="text-amber-700" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 leading-tight text-amber-800">COMIDAS SALUDABLES</h3>
                  <p className="text-amber-700 text-sm leading-relaxed opacity-90">
                    Dietas balanceadas y nutritivas adaptadas a cada etapa de vida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {modalAbierto && servicioSeleccionado && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/70 backdrop-blur-sm" 
            onClick={cerrarModal}
          >
            <div 
              className="bg-yellow-50 rounded-3xl max-w-4xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="from-purple-500 to-indigo-600 p-8 rounded-t-2xl relative">
                <button
                  onClick={cerrarModal}
                  className="absolute top-3 right-3 bg-black/30 hover:bg-black/30 !rounded-full p-1 transition-all"
                >
                  <X className="text-white" size={18} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-black mb-1">{servicioSeleccionado.titulo}</h2>
                  <p className="text-black/80 text-xs">{servicioSeleccionado.descripcion}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-center items-center gap-6 mb-6">
                  {servicioSeleccionado.items.map((item, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-xl shadow-lg w-48 h-48">
                        <img
                          src={item.imagen}
                          alt={item.titulo}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                          <h6 className="font-bold text-white text-sm mb-1 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{item.titulo}</h6>
                          <p className="text-white text-xs leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{item.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => {
                      cerrarModal();
                      scrollToSection('contacto');
                    }}
                    className="from-purple-500 to-indigo-600 text-black px-6 py-2.5 rounded-lg font-bold text-xs hover:shadow-xl transform hover:scale-105 transition-all inline-block"
                  >
                    Solicitar este servicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/**NOSOTROS */}
         <section id="nosotros" className="relative min-h-[700px] overflow-hidden" style={{ backgroundColor: '#fff9e2ff'}}>
          
        {/* Onda superior */}
        <svg className="absolute top-0 w-full z-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" fill="#fff9e2ff"/>
        </svg>

        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&q=80"
            alt="Equipo veterinario"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/50 to-indigo-900/80"></div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">¿Por qué elegirnos?</h2>
            <p className="text-xl mb-10 text-purple-100">
              Somos un equipo de profesionales apasionados por el bienestar animal, comprometidos con brindar la mejor atención a sus mascotas.
            </p>
            <div className="space-y-6">
              {[
                { titulo: 'Comprometidos con su bienestar', desc: 'Cuidamos con amor y respeto a su mascota.' },
                { titulo: 'Confianza en cada compra', desc: 'Productos que cuidan vidas.' },
                { titulo: 'Atención Personalizada', desc: 'Cada mascota es única y merece cuidados especiales.' }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl text-white">✓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{item.titulo}</h3>
                    <p className="text-purple-100 ">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Onda inferior */}
        <svg className="absolute bottom-[-1px] left-0 w-full z-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#fff9e2ff"/>
        </svg>
      </section>


        {/**CONTACTO */}
   <section id="contacto" className="py-20 px-6 bg-[#fff9e2ff]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-4xl !font-black text-stone-800">CONTÁCTANOS</h3>
          <p className="text-xl text-gray-600">Estamos aquí para ayudarte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 🟣 Columna izquierda: botones */}
          <div className="space-y-4">
            <h3 className="text-3xl !font-bold mb-8 text-gray-800">Atención Personalizada</h3>
            <p className="text-gray-600 mb-4">
              Encuentra nuestra ubicación o contáctanos fácilmente por nuestras redes.
            </p>
             {contactButtons.map((btn, i) => (
                <a
                  key={i}
                  href={btn.link || "#"}
                  className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Ícono con degradado */}
                  <div
                    className={`p-3 bg-gradient-to-r ${btn.color} text-white flex items-center justify-center`}
                  >
                    {btn.icon}
                  </div>

                  {/* Fondo blanco con texto e info */}
                  <div className="bg-white px-4 py-2 text-gray-800">
                    <div className="font-semibold">{btn.label}</div>
                    {btn.info && <div className="text-sm text-gray-600">{btn.info}</div>}
                  </div>
                </a>
              ))}
            </div>
          {/* 🗺️ Columna derecha: mapa */}
          <div>
            <MapaGoogle />
          </div>
        </div>
      </div>
    </section>
      </div>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl font-bold">Lucas Pet Shot</span>
          </div>
          <p className="text-gray-400 mb-6">Tu veterinaria de confianza</p>
          
          <p className="text-gray-500 text-sm">© 2025 Lucas Pet Shot. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}