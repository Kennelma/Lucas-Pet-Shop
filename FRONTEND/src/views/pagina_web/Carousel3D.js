import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Carousel3D() {
  const [currentSlide, setCurrentSlide] = useState(2); // Empezar en el slide 3 (índice 2)
  const videoRef = useRef(null); // Referencia para controlar el video

  // Elementos del carrusel 3D (imágenes y videos)
  const carouselImages = [
    {
      src: "/images_LP/car7.jpeg", alt: "Consulta veterinaria profesional", title: "Centro comercial Ecoplaza",
      description: "Contiguo a Ecovivienda, por la entrada a la Col. La Era", type: "image"
    },
    {
      src: "/images_LP/car1.jpg", alt: "Servicio de grooming", title: "Promociones Especiales", 
      description: "Estética y cuidado completo para tu mascota", type: "image"
    },
    {
      src: "/images_LP/car6.jpeg", alt: "Cirugía veterinaria", title: "Atención Personalizada",
      description: "Adaptadas a las necesidades de tu mascota", type: "image"
    },
    {
      src: "/images_LP/car10.jpg", alt: "Servicio de grooming", title: "Grooming Profesional", 
      description: "Estética y cuidado completo para tu mascota", type: "image"
    },
    {
      src: "/images_LP/car8.jpg", alt: "Emergencias 24 horas", title: "Atención de Emergencia",
      description: "Disponibles para tu mascota", type: "image"
    },
    {
      src: "/images_LP/car5.jpeg", alt: "Emergencias 24 horas", title: "Juguetes y accesorios", 
      description: "Los juguetes que tus peludos aman", type: "image"
    },
    {
      src: "/images_LP/car9.jpg", alt: "Emergencias 24 horas", title: "Medicamentos de calidad",
      description: "Todo lo que tu mascota necesita", type: "image"
    },
    {
      src: "/images_LP/video-petshop.mp4", alt: "Video presentación Lucas Pet Shop", title: "Conoce Nuestro Pet Shop", 
      description: "Un recorrido por nuestras instalaciones", type: "video"
    }
  ];

  // Load Poppins font and auto-play del carrusel
  useEffect(() => {
    // Load Poppins font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const currentItem = carouselImages[currentSlide];
    const isVideo = currentItem?.type === 'video';
    const intervalTime = isVideo ? 40000 : 5000; // 40s para video, 5s para imágenes

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, intervalTime);

    return () => {
      clearInterval(interval);
      document.head.removeChild(link);
    };
  }, [carouselImages.length, currentSlide]); // Agregamos currentSlide a las dependencias

  // Controlar el video cuando cambie el slide
  useEffect(() => {
    const currentItem = carouselImages[currentSlide];
    const isVideoSlide = currentItem?.type === 'video';
    const videoSlideIndex = 7; // Índice del video en el array
    
    if (videoRef.current) {
      if (currentSlide === videoSlideIndex && isVideoSlide) {
        // Es el turno del video: reiniciar y reproducir
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.log);
      } else {
        // No es el turno del video: pausar
        videoRef.current.pause();
      }
    }
  }, [currentSlide, carouselImages]);

  return (
   <section className="px-8 pt-8 relative bg-transparent" style={{ 
     fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
   }}>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Título del carrusel */}
        <div className="text-center mb-8">
          <div className="inline-block">
          <h3 className="text-4xl !font-black text-poppins-800 mb-3 sm:mb-4 tracking-tight">CONÓCENOS</h3>
          <p className="text-stone-600 text-xl mb-4">Descubre todo lo que tenemos para ofrecer a tu mascota</p>
          </div>
        </div>

        {/* Carrusel 3D Container */}
        <div className="slider-container h-96 relative" style={{perspective: '1000px', transformStyle: 'preserve-3d'}}>
          {/* Inputs de radio (escondidos) */}
          <input type="radio" name="slider" id="s1" className="hidden" checked={currentSlide === 0} readOnly />
          <input type="radio" name="slider" id="s2" className="hidden" checked={currentSlide === 1} readOnly />
          <input type="radio" name="slider" id="s3" className="hidden" checked={currentSlide === 2} readOnly />
          <input type="radio" name="slider" id="s4" className="hidden" checked={currentSlide === 3} readOnly />
          <input type="radio" name="slider" id="s5" className="hidden" checked={currentSlide === 4} readOnly />
          <input type="radio" name="slider" id="s6" className="hidden" checked={currentSlide === 5} readOnly />
          <input type="radio" name="slider" id="s7" className="hidden" checked={currentSlide === 6} readOnly />
          <input type="radio" name="slider" id="s8" className="hidden" checked={currentSlide === 7} readOnly />

          {/* Slides con imágenes */}
          <label 
            htmlFor="s1" 
            id="slide1" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(0)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[0]?.src} 
                alt={carouselImages[0]?.alt}
                className="w-full h-full object-contain object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[12%] px-[8px] pt-1 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-xs font-bold mb-0.5 text-black">{carouselImages[0]?.title}</h3>
                <p className="text-[10px] text-gray-700 leading-tight">{carouselImages[0]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s2" 
            id="slide2" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(1)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[1]?.src} 
                alt={carouselImages[1]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[1]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[1]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s3" 
            id="slide3" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(2)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[2]?.src} 
                alt={carouselImages[2]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[2]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[2]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s4" 
            id="slide4" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(3)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[3]?.src} 
                alt={carouselImages[3]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[3]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[3]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s5" 
            id="slide5" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(4)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[4]?.src} 
                alt={carouselImages[4]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[4]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[4]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s6" 
            id="slide6" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(5)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[5]?.src} 
                alt={carouselImages[5]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[5]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[5]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s7" 
            id="slide7" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(6)}
          >
            <div className="polaroid-image">
              <img 
                src={carouselImages[6]?.src} 
                alt={carouselImages[6]?.alt}
                className="w-full h-full object-cover object-center"
                style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
              />
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[6]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[6]?.description}</p>
              </div>
            </div>
          </label>

          <label 
            htmlFor="s8" 
            id="slide8" 
            className="slide-label polaroid-frame" 
            onClick={() => setCurrentSlide(7)}
          >
            <div className="polaroid-image">
              {carouselImages[7]?.type === 'video' ? (
                <video 
                  ref={videoRef}
                  src={carouselImages[7]?.src}
                  className="w-full h-full object-cover object-center"
                  controls
                  playsInline
                  preload="auto"
                  style={{borderRadius: '4px'}}
                />
              ) : (
                <img 
                  src={carouselImages[7]?.src} 
                  alt={carouselImages[7]?.alt}
                  className="w-full h-full object-cover object-center"
                  style={{imageRendering: 'auto', filter: 'contrast(1.05) saturate(1.1)'}}
                />
              )}
            </div>
            <div className="h-[15%] px-[8px] pt-2 text-center text-black flex flex-col justify-start items-center">
              <div className="w-full max-w-full">
                <h3 className="text-sm font-bold mb-1 text-black">{carouselImages[7]?.title}</h3>
                <p className="text-xs text-gray-700 leading-tight">{carouselImages[7]?.description}</p>
              </div>
            </div>
          </label>
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-center items-center gap-8 mt-8">
          {/* Botón Anterior */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
            className="bg-white/90 hover:bg-white text-stone-700 p-2 !rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
            aria-label="Slide anterior"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Indicadores */}
          <div className="flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 !rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-orange-500 scale-125 shadow-lg' 
                    : 'bg-orange-300 hover:bg-orange-400'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselImages.length)}
            className="bg-white/90 hover:bg-white text-stone-700 p-2 !rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
            aria-label="Slide siguiente"
          > 
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif !important;
        }
        
        .slide-label {
          margin: auto;
          width: 60%;
          height: 100%;
          position: absolute;
          left: 0; 
          right: 0;
          cursor: pointer;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .polaroid-frame {
          background: white;
          padding: 12px 12px 20px 12px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          transform-style: preserve-3d;
          aspect-ratio: 3/2;
        }

        .polaroid-image {
          width: 100%;
          height: 88%;
          overflow: hidden;
          border-radius: 4px;
          background: #f5f5f5;
        }



        /* Slide activo (centro) */
        #s1:checked ~ #slide1, #s2:checked ~ #slide2,
        #s3:checked ~ #slide3, #s4:checked ~ #slide4,
        #s5:checked ~ #slide5, #s6:checked ~ #slide6,
        #s7:checked ~ #slide7, #s8:checked ~ #slide8 {
          box-shadow: 0 13px 25px 0 rgba(0,0,0,.3), 0 11px 7px 0 rgba(0,0,0,.19);
          transform: translate3d(0,0,0);
          z-index: 10;
        }

        /* Un slide a la derecha */
        #s1:checked ~ #slide2, #s2:checked ~ #slide3,
        #s3:checked ~ #slide4, #s4:checked ~ #slide5,
        #s5:checked ~ #slide6, #s6:checked ~ #slide7,
        #s7:checked ~ #slide8, #s8:checked ~ #slide1 {
          box-shadow: 0 6px 10px 0 rgba(0,0,0,.3), 0 2px 2px 0 rgba(0,0,0,.2);
          transform: translate3d(15%,0,-100px);
          z-index: 9;
        }

        /* Un slide a la izquierda */
        #s1:checked ~ #slide8, #s2:checked ~ #slide1,
        #s3:checked ~ #slide2, #s4:checked ~ #slide3,
        #s5:checked ~ #slide4, #s6:checked ~ #slide5,
        #s7:checked ~ #slide6, #s8:checked ~ #slide7 {
          box-shadow: 0 6px 10px 0 rgba(0,0,0,.3), 0 2px 2px 0 rgba(0,0,0,.2);
          transform: translate3d(-15%,0,-100px);
          z-index: 9;
        }

        /* Dos slides a la derecha */
        #s1:checked ~ #slide3, #s2:checked ~ #slide4,
        #s3:checked ~ #slide5, #s4:checked ~ #slide6,
        #s5:checked ~ #slide7, #s6:checked ~ #slide8,
        #s7:checked ~ #slide1, #s8:checked ~ #slide2 {
          box-shadow: 0 1px 4px 0 rgba(0,0,0,.37);
          transform: translate3d(30%,0,-200px);
          z-index: 8;
        }

        /* Dos slides a la izquierda */
        #s1:checked ~ #slide7, #s2:checked ~ #slide8,
        #s3:checked ~ #slide1, #s4:checked ~ #slide2,
        #s5:checked ~ #slide3, #s6:checked ~ #slide4,
        #s7:checked ~ #slide5, #s8:checked ~ #slide6 {
          box-shadow: 0 1px 4px 0 rgba(0,0,0,.37);
          transform: translate3d(-30%,0,-200px);
          z-index: 8;
        }

        /* Tres o más slides lejos - ocultos */
        #s1:checked ~ #slide4, #s1:checked ~ #slide5, #s1:checked ~ #slide6,
        #s2:checked ~ #slide5, #s2:checked ~ #slide6, #s2:checked ~ #slide7,
        #s3:checked ~ #slide6, #s3:checked ~ #slide7, #s3:checked ~ #slide8,
        #s4:checked ~ #slide7, #s4:checked ~ #slide8, #s4:checked ~ #slide1,
        #s5:checked ~ #slide8, #s5:checked ~ #slide1, #s5:checked ~ #slide2,
        #s6:checked ~ #slide1, #s6:checked ~ #slide2, #s6:checked ~ #slide3,
        #s7:checked ~ #slide2, #s7:checked ~ #slide3, #s7:checked ~ #slide4,
        #s8:checked ~ #slide3, #s8:checked ~ #slide4, #s8:checked ~ #slide5 {
          transform: translate3d(50%,0,-300px);
          opacity: 0;
          z-index: 7;
        }
      `}</style>
    </section>
  );
}