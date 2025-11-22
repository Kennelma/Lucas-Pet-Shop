import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Carousel3D from './Carousel3D';
import GaleriaTrabajos from './GaleriaTrabajos';
import CarouselProductos from './CarouselProductos';
import { Heart, Stethoscope, Scissors, Home, Phone, Mail, MapPin, Clock, Sparkles, Award, ArrowRight, Play, Instagram, Facebook } from 'lucide-react';
import MapaGoogle from "./MapaGoogle";
import { useNavigate } from 'react-router-dom';

export default function VeterinariaLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Load Poppins font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(link);
    };
  }, [lastScrollY]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
      setShowNavbar(true);
    }
  };

 // 🔹 Lista de botones de contacto
const contactButtons = [
  {
    icon: <img src="/icons/instagram-icon.png" alt="Instagram" className="w-12 h-12 rounded-lg hover:scale-110 transition-transform duration-300" />,
    link: "https://www.instagram.com/lucas_petshop_hn?utm_source=qr&igsh=NHB6dXUyejE3YTNz"
  },
  {
    icon: <img src="/icons/facebook-icon.png" alt="Facebook" className="w-12 h-12 rounded-lg hover:scale-110 transition-transform duration-300" />,
    link: "https://www.facebook.com/share/1EshaJDckp/"
  },
  {
    icon: <img src="/icons/whatsapp-icon.png" alt="WhatsApp" className="w-12 h-12 rounded-lg hover:scale-110 transition-transform duration-300" />,
    link: "https://wa.me/50489204753"
  },
  {
    icon: <img src="/icons/email-icon.png" alt="Email" className="w-12 h-12 rounded-lg hover:scale-110 transition-transform duration-300" />,
    link: "mailto:lucaspetshop1@gmail.com"
  },
  {
    icon: <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center"><Phone className="w-6 h-6 text-blue-500" /></div>,
    phone: "+504 2281-7170"
  },
];

  const navigate = useNavigate();

  return (

    <div className="min-h-screen font-poppins" style={{
      background: 'linear-gradient(to bottom, #fff9e2 0%, #fff9e2 40%, #fffbf0 75%, #fdf2f8 100%)',
      fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
    }}>
      <nav className={`bg-black shadow-sm fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex justify-between items-center">
            {/* Logo y nombre  */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/images_LP/logo.png"
                alt="Lucas Pet Shop"
                className="w-12 h-12 sm:w-16 sm:h-16 lg:w-[90px] lg:h-[90px] object-contain"
                loading="lazy"
              />
              <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white">
                LUCAS PET SHOP
              </span>
            </div>

            {/* Navegación desktop */}
            <div className="hidden lg:flex items-center gap-1 bg-white rounded-full px-2 py-0">
                <button onClick={() => scrollToSection('inicio')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Inicio
                </button>
                <button onClick={() => scrollToSection('servicios')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Servicios
                </button>
                <button onClick={() => scrollToSection('galeria')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Galería
                </button>
                <button onClick={() => scrollToSection('productos')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Productos
                </button>
                <button onClick={() => scrollToSection('nosotros')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Nosotros
                </button>
                <button onClick={() => scrollToSection('contacto')} className="text-black px-4 lg:px-5 py-2 rounded-full! font-semibold hover:bg-gray-100 hover:shadow-sm transition-all duration-300 hover:scale-105 tracking-wide">
                  Contacto
                </button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')}
                  className="bg-linear-to-r from-yellow-400 to-yellow-600 text-black px-3 sm:px-4 lg:px-6 py-2 rounded-full! font-semibold hover:from-yellow-300 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm lg:text-base"
                >
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Login</span>
                </button>

                {/* Botón hamburguesa para móvil */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                  </svg>
                </button>
              </div>
            </div>

          {/* Menu móvil  */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-700 animate-fade-in">
              <div className="flex flex-col space-y-1 p-4">
                {['inicio', 'servicios', 'galeria', 'productos', 'nosotros', 'contacto'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="px-4 py-3 text-left rounded-xl text-white hover:bg-white hover:text-black transition-all duration-300 font-semibold transform hover:scale-105 tracking-wide"
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
        <section id="inicio" className="bg-yellow-50 relative min-h-[600px] sm:min-h-[750px] lg:min-h-[850px] overflow-visible -mt-[60px] sm:-mt-20 lg:-mt-[106px] pt-[60px] sm:pt-20 lg:pt-[106px]">
          <div className="absolute inset-0 z-0">
            <img
              src="/images_LP/landing.jpeg"
              alt="Mascotas felices en Lucas Pet Shop"
              className="w-full h-full object-cover animate-fade-in"
              loading="eager"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/20"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20">
            <div className="max-w-xl lg:max-w-2xl animate-fade-in">
              {/* Banner */}
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-400/20 to-pink-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-full px-4 py-2 mb-6 animate-slide-up">
                <Heart className="w-4 h-4 text-yellow-300" />
                <span className="text-yellow-200 font-semibold text-sm tracking-wide">Con amor desde 2015</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-yellow-100! mb-4 sm:mb-6 leading-tight animate-slide-up tracking-tight">
                MÁS QUE UNA TIENDA,<br className="hidden sm:block"/>
                <span className="text-yellow-300">UN HOGAR PARA TU MASCOTA</span>
              </h1>
              <p className="text-yellow-100/90 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                Cuidamos con amor y dedicación a tu mejor amigo. Servicios veterinarios, grooming y productos de calidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up" style={{animationDelay: '0.4s'}}>
                <button
                  onClick={() => scrollToSection('conocenos')}
                  className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full! font-bold hover:bg-white hover:text-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base tracking-wide"
                >
                  Conoce más
                </button>
                <button
                  onClick={() => scrollToSection('contacto')}
                  className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full! font-bold hover:bg-white hover:text-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base tracking-wide"
                >
                  Contactanos
                </button>
              </div>
            </div>
          </div>

          {/* Horario de atención*/}
          <div className="absolute bottom-0 w-full flex justify-center animate-slide-up transform -translate-y-30" style={{animationDelay: '0.6s'}}>
            <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-sm rounded-full px-5 py-3 border border-white/50 shadow-xl">
              <Clock className="w-6 h-6 text-yellow-300" />
              <span className="text-yellow-100 font-extrabold text-xl sm:text-2xl whitespace-nowrap tracking-wide">
                Lun-Sab: 9:00 AM - 5:00 PM
              </span>
            </div>
          </div>

          {/* Curva SVG elegante al final de la imagen */}
          <svg className="absolute -bottom-px left-0 w-full z-20" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="url(#gradientCurve)"/>
            <defs>
              <linearGradient id="gradientCurve" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fff9e2"/>
                <stop offset="100%" stopColor="#fff4e6"/>
              </linearGradient>
            </defs>
          </svg>
        </section>

        <section id="conocenos" className="pt-20 relative min-h-[600px] overflow-hidden bg-transparent">
          <Carousel3D />
        </section>

          {/*SERVICIOS */}
        <section
          id="servicios"
          className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative bg-transparent"
        >
          <div className="max-w-7xl mx-auto relative z-5 pt-2 sm:pt-4 lg:pt-5">
            <div className="relative text-center mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
              <h3 className="text-4xl font-black! text-poppins-800 mb-3 sm:mb-4 tracking-tight ">SERVICIOS QUE TE OFRECEMOS</h3>
              <p className="text-stone-800 leading-relaxed text-sm sm:text-base lg:text-lg max-w-4xl mx-auto">
                En Lucas Pet Shop brindamos atención veterinaria, grooming profesional, alimentación balanceada y
                <br className="hidden sm:block"/> productos de calidad para el bienestar completo de tu mascota.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              <div
                className="bg-white rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 text-stone-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden animate-fade-in group"
              >
                <div className="absolute -top-10 -right-10 w-20 sm:w-32 h-20 sm:h-32 bg-purple-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-purple-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 mx-auto group-hover:bg-purple-500/40 transition-colors">
                    <Home className="text-purple-700" size={16} />
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 leading-tight text-purple-800 tracking-wide">PRODUCTOS ESENCIALES</h3>
                  <p className="text-purple-700 text-xs sm:text-sm leading-relaxed opacity-90">
                    Accesorios y productos de cuidado diario para tu mascota.
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 text-stone-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden animate-fade-in group"
                style={{animationDelay: '0.1s'}}
              >
                <div className="absolute -top-10 -right-10 w-20 sm:w-32 h-20 sm:h-32 bg-rose-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-rose-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 mx-auto group-hover:bg-rose-500/40 transition-colors">
                    <Sparkles className="text-rose-700" size={16} />
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 leading-tight text-rose-800 tracking-wide">SERVICIOS DE ESTÉTICA</h3>
                  <p className="text-rose-700 text-xs sm:text-sm leading-relaxed opacity-90">
                    Grooming profesional, baños terapéuticos y cortes especializados.
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 text-stone-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden animate-fade-in group"
                style={{animationDelay: '0.2s'}}
              >
                <div className="absolute -top-10 -right-10 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-emerald-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 mx-auto group-hover:bg-emerald-500/40 transition-colors">
                    <Heart className="text-emerald-700" size={16} fill="currentColor" />
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 leading-tight text-emerald-800 tracking-wide">VARIEDAD DE ESPECIES</h3>
                  <p className="text-emerald-700 text-xs sm:text-sm leading-relaxed opacity-90">
                    Perros, aves, conejos, tortugas y más.
                  </p>
                </div>
              </div>

              <div
                className="bg-white rounded-2xl sm:rounded-4xl lg:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 text-stone-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden animate-fade-in group"
                style={{animationDelay: '0.3s'}}
              >
                <div className="absolute -top-10 -right-10 w-20 sm:w-32 h-20 sm:h-32 bg-amber-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-amber-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-5 mx-auto group-hover:bg-amber-500/40 transition-colors">
                    <Sparkles className="text-amber-700" size={16} />
                  </div>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 leading-tight text-amber-800 tracking-wide">COMIDAS SALUDABLES</h3>
                  <p className="text-amber-700 text-xs sm:text-sm leading-relaxed opacity-90">
                    Dietas balanceadas y nutritivas adaptadas a cada etapa de vida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/**GALERÍA DE TRABAJOS */}
        <section id="galeria">
          <GaleriaTrabajos />
        </section>

        {/**PRODUCTOS */}
        <section id="productos">
          <CarouselProductos />
        </section>

        {/**NOSOTROS */}
         <section id="nosotros" className="relative min-h-[700px] overflow-hidden bg-transparent">



        {/* Imagen de fondo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1600&q=80"
            alt="Equipo veterinario"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-pink-400/50 to-indigo-900/80"></div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-20">
          <div className="max-w-xl lg:max-w-2xl animate-fade-in">
            {/* Título con efectos mejorados */}
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 animate-slide-up tracking-tight drop-shadow-2xl">
                ¿Por qué <span className="text-yellow-300">elegirnos</span>?
              </h2>
              <div className="w-24 h-1 bg-linear-to-r from-yellow-400 to-pink-400 rounded-full animate-slide-up" style={{animationDelay: '0.1s'}}></div>
            </div>

            <p className="text-sm sm:text-base lg:text-lg xl:text-xl mb-8 sm:mb-10 lg:mb-12 text-white/90 leading-relaxed animate-slide-up font-medium tracking-wide backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20" style={{animationDelay: '0.2s'}}>
              Somos un equipo de <span className="text-yellow-300 font-bold">profesionales apasionados</span> por el bienestar animal, comprometidos con brindar la <span className="text-yellow-300 font-bold">mejor atención</span> a sus mascotas.
            </p>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  titulo: 'Comprometidos con su bienestar',
                  desc: 'Cuidamos con amor y respeto a su mascota.',
                  icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                },
                {
                  titulo: 'Confianza en cada compra',
                  desc: 'Productos que cuidan vidas.',
                  icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                },
                {
                  titulo: 'Atención Personalizada',
                  desc: 'Cada mascota es única y merece cuidados especiales.',
                  icon: <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                }
              ].map((item, index) => (
                <div key={index} className="group">
                  <div className="flex items-start space-x-4 animate-slide-up bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{animationDelay: `${0.4 + index * 0.2}s`}}>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:bg-yellow-400/30 group-hover:scale-110 transition-all duration-300 border border-white/30">
                      <div className="text-white group-hover:text-yellow-900">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-black mb-2 text-white tracking-wide group-hover:text-yellow-300 transition-colors">
                        {item.titulo}
                      </h3>
                      <p className="text-white/90 text-sm sm:text-base leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </section>


        {/**CONTACTO  */}
   <section id="contacto" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-transparent relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-500 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título  */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-fade-in">
          <div className="inline-block relative">
            <h3 className="text-4xl font-black! text-poppins-800 mb-3 sm:mb-4 tracking-tight">
              CONTÁCTANOS
            </h3>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mt-6 max-w-2xl mx-auto font-medium tracking-wide">
            🐾 Estamos aquí para cuidar de tu mejor amigo. ¡Conecta con nosotros!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 items-start">
          {/* 🟣 Columna izquierda: Información mejorada */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-wide text-center">Atención Personalizada</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed font-medium text-center">
                Puedes visitarnos en nuestro centro veterinario o contactarnos a través de nuestras redes sociales, WhatsApp, correo electrónico o una llamada telefónica. ¡Estamos aquí para ayudarte!
              </p>

              {/* Iconos de contacto */}
              <div className="flex flex-wrap gap-4 justify-center">
                {contactButtons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-2 animate-slide-up" style={{animationDelay: `${i * 0.1}s`}}>
                    {btn.link ? (
                      <a
                        href={btn.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {btn.icon}
                      </a>
                    ) : (
                      <div className="flex items-center gap-2">
                        {btn.icon}
                        <span className="text-sm font-normal text-gray-600">
                          {btn.phone}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas destacadas */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/30">
                    <div className="text-2xl font-extrabold text-purple-600 tracking-tight">10+</div>
                    <div className="text-xs text-gray-600 font-semibold">Años de experiencia</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/30">
                    <div className="text-2xl font-extrabold text-pink-600 tracking-tight">1000+</div>
                    <div className="text-xs text-gray-600 font-semibold">Mascotas felices</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/30">
                    <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
                      <Clock className="w-6 h-6 animate-pulse " />
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">Atención Inmediata</div>
                    </div>
                  </div>
                  </div>

                  {/* Columna derecha: mapa  */}
          <div className="lg:col-span-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl border border-white/20">
              <div className="rounded-2xl overflow-hidden">
                <MapaGoogle />
              </div>

              {/* Información de ubicación compacta */}
              <div className="px-2 py-1 text-center">
                <h4 className="font-extrabold text-gray-800 mb-0.5 tracking-wide text-xs">📍 Nuestra Ubicación</h4>
                <p className="text-xs text-gray-600 leading-tight font-medium">
                  Centro Comercial Ecoplaza<br/>
                  Contiguo a Ecovivienda, Col. La Era<br/>
                  <span className="font-bold text-purple-600 tracking-wide">¡Te esperamos!</span>
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
      </div>

      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl font-bold">Lucas Pet Shop</span>
          </div>
          <p className="text-gray-400 mb-6">Tu Pet shop de confianza</p>

          <p className="text-gray-500 text-sm">© 2025 Lucas Pet Shop. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Responsive utilities */
        @media (max-width: 640px) {
          .slide-label {
            width: 80% !important;
          }

          .slide-content h3 {
            font-size: 1.2rem !important;
          }

          .slide-content p {
            font-size: 0.8rem !important;
          }
        }

        /* Smooth scrolling  */
        html {
          scroll-behavior: smooth;
        }

        /* Loading state para imágenes */
        img[loading="lazy"] {
          transition: opacity 0.3s ease-in-out;
        }

        /* Hover effects globales */
        .hover-lift {
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}