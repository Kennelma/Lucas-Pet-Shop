import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Carousel3D() {
  const [currentSlide, setCurrentSlide] = useState(2); // Empezar en el slide 3 (índice 2)

  // Imágenes del carrusel 3D
  const carouselImages = [
    {
      src: "images/car7.jpeg", alt: "Consulta veterinaria profesional", title: "Centro comercial Ecoplaza",
      description: "Contiguo a Ecovivienda, por la entrada a la Col. La Era"
    },
    {
      src: "images/car1.jpeg", alt: "Servicio de grooming", title: "Promociones Especiales", 
      description: "Estética y cuidado completo para tu mascota"
    },
    {
      src: "images/car6.jpeg", alt: "Cirugía veterinaria", title: "Atención Personalizada",
      description: "Adaptadas a las necesidades de tu mascota"
    },
    {
      src: "images/car10.jpeg", alt: "Servicio de grooming", title: "Grooming Profesional", 
      description: "Estética y cuidado completo para tu mascota"
    },
    {
      src: "images/car8.jpeg", alt: "Emergencias 24 horas",
    },
    {
      src: "images/car5.jpeg", alt: "Emergencias 24 horas", title: "Juguetes y accesorios", 
      description: "Los juguetes que tus peludos aman"
    },
    {
      src: "images/car9.jpeg", alt: "Emergencias 24 horas",
    }
  ];

  // Auto-play del carrusel - cambia cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Cambiar cada 4 segundos

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
   <section className="px-8 pt-8 relative" style={{ background: 'linear-gradient(to bottom, #fff9e2ff, #fff9e2ff, #fecaca)' }}>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Título del carrusel */}
        <div className="text-center mb-8">
          <div className="inline-block">
          <h3 className="text-4xl !font-black text-stone-800">CONÓCENOS</h3>
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

          {/* Slides con imágenes */}
          <label 
            htmlFor="s1" 
            id="slide1" 
            className="slide-label" 
            onClick={() => setCurrentSlide(0)}
            style={{
              backgroundImage: `url(${carouselImages[0]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[0]?.title}</h3>
              <p>{carouselImages[0]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s2" 
            id="slide2" 
            className="slide-label" 
            onClick={() => setCurrentSlide(1)}
            style={{
              backgroundImage: `url(${carouselImages[1]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[1]?.title}</h3>
              <p>{carouselImages[1]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s3" 
            id="slide3" 
            className="slide-label" 
            onClick={() => setCurrentSlide(2)}
            style={{
              backgroundImage: `url(${carouselImages[2]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[2]?.title}</h3>
              <p>{carouselImages[2]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s4" 
            id="slide4" 
            className="slide-label" 
            onClick={() => setCurrentSlide(3)}
            style={{
              backgroundImage: `url(${carouselImages[3]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[3]?.title}</h3>
              <p>{carouselImages[3]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s5" 
            id="slide5" 
            className="slide-label" 
            onClick={() => setCurrentSlide(4)}
            style={{
              backgroundImage: `url(${carouselImages[4]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[4]?.title}</h3>
              <p>{carouselImages[4]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s6" 
            id="slide6" 
            className="slide-label" 
            onClick={() => setCurrentSlide(5)}
            style={{
              backgroundImage: `url(${carouselImages[5]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[5]?.title}</h3>
              <p>{carouselImages[5]?.description}</p>
            </div>
          </label>

          <label 
            htmlFor="s7" 
            id="slide7" 
            className="slide-label" 
            onClick={() => setCurrentSlide(6)}
            style={{
              backgroundImage: `url(${carouselImages[6]?.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="slide-content">
              <h3>{carouselImages[6]?.title}</h3>
              <p>{carouselImages[6]?.description}</p>
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
        .slide-label {
          margin: auto;
          width: 60%;
          height: 100%;
          border-radius: 1rem;
          position: absolute;
          left: 0; 
          right: 0;
          cursor: pointer;
          transition: transform 0.4s ease, opacity 0.4s ease;
          display: flex;
          align-items: end;
          overflow: hidden;
        }

        .slide-content {
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          width: 100%;
          padding: 2rem;
          color: white;
        }

        .slide-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .slide-content p {
          opacity: 0.9;
          font-size: 0.9rem;
        }

        /* Slide activo (centro) */
        #s1:checked ~ #slide1, #s2:checked ~ #slide2,
        #s3:checked ~ #slide3, #s4:checked ~ #slide4,
        #s5:checked ~ #slide5, #s6:checked ~ #slide6,
        #s7:checked ~ #slide7 {
          box-shadow: 0 13px 25px 0 rgba(0,0,0,.3), 0 11px 7px 0 rgba(0,0,0,.19);
          transform: translate3d(0,0,0);
          z-index: 10;
        }

        /* Un slide a la derecha */
        #s1:checked ~ #slide2, #s2:checked ~ #slide3,
        #s3:checked ~ #slide4, #s4:checked ~ #slide5,
        #s5:checked ~ #slide6, #s6:checked ~ #slide7,
        #s7:checked ~ #slide1 {
          box-shadow: 0 6px 10px 0 rgba(0,0,0,.3), 0 2px 2px 0 rgba(0,0,0,.2);
          transform: translate3d(15%,0,-100px);
          z-index: 9;
        }

        /* Un slide a la izquierda */
        #s1:checked ~ #slide7, #s2:checked ~ #slide1,
        #s3:checked ~ #slide2, #s4:checked ~ #slide3,
        #s5:checked ~ #slide4, #s6:checked ~ #slide5,
        #s7:checked ~ #slide6 {
          box-shadow: 0 6px 10px 0 rgba(0,0,0,.3), 0 2px 2px 0 rgba(0,0,0,.2);
          transform: translate3d(-15%,0,-100px);
          z-index: 9;
        }

        /* Dos slides a la derecha */
        #s1:checked ~ #slide3, #s2:checked ~ #slide4,
        #s3:checked ~ #slide5, #s4:checked ~ #slide6,
        #s5:checked ~ #slide7, #s6:checked ~ #slide1,
        #s7:checked ~ #slide2 {
          box-shadow: 0 1px 4px 0 rgba(0,0,0,.37);
          transform: translate3d(30%,0,-200px);
          z-index: 8;
        }

        /* Dos slides a la izquierda */
        #s1:checked ~ #slide6, #s2:checked ~ #slide7,
        #s3:checked ~ #slide1, #s4:checked ~ #slide2,
        #s5:checked ~ #slide3, #s6:checked ~ #slide4,
        #s7:checked ~ #slide5 {
          box-shadow: 0 1px 4px 0 rgba(0,0,0,.37);
          transform: translate3d(-30%,0,-200px);
          z-index: 8;
        }

        /* Tres o más slides lejos - ocultos */
        #s1:checked ~ #slide4, #s1:checked ~ #slide5,
        #s2:checked ~ #slide5, #s2:checked ~ #slide6,
        #s3:checked ~ #slide6, #s3:checked ~ #slide7,
        #s4:checked ~ #slide7, #s4:checked ~ #slide1,
        #s5:checked ~ #slide1, #s5:checked ~ #slide2,
        #s6:checked ~ #slide2, #s6:checked ~ #slide3,
        #s7:checked ~ #slide3, #s7:checked ~ #slide4 {
          transform: translate3d(50%,0,-300px);
          opacity: 0;
          z-index: 7;
        }
      `}</style>
    </section>
  );
}