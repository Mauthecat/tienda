import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🛡️ ESCUDO ANTI-PANTALLA BLANCA: Si no hay slides, mostramos un fondo gris cargando
  if (!slides || slides.length === 0) {
      return <div className="w-full h-[250px] md:h-[450px] bg-gray-200 animate-pulse"></div>;
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  // Autoplay para que gire solo cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="w-full h-[250px] md:h-[450px] relative group shadow-lg">
      
      {/* Contenedor principal clickeable */}
      <Link to={currentSlide.link} className="block w-full h-full relative overflow-hidden cursor-pointer">
        
        {/* Imagen de Fondo */}
        <div 
          style={{ backgroundImage: `url(${currentSlide.image})` }} 
          className="w-full h-full bg-center bg-cover duration-700 ease-in-out transition-transform group-hover:scale-105"
        >
          {/* Capa oscura (Overlay) para que el texto blanco resalte siempre */}
          <div className="w-full h-full bg-black/30 group-hover:bg-black/40 transition-colors duration-500"></div>
        </div>

        {/* TEXTO Y BOTÓN (Le agregamos pointer-events-none para que no bloquee el clic del enlace) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
            <h2 
                key={currentIndex} 
                className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700"
            >
                {currentSlide.title}
            </h2>
            <span className="bg-pink-500 text-white text-xs md:text-sm font-bold py-3 px-8 rounded-full shadow-lg shadow-pink-500/30 transition-transform group-hover:scale-110 uppercase tracking-widest">
                Descubrir Colección
            </span>
        </div>

      </Link>

      {/* Flecha Izquierda */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/80 text-gray-800 cursor-pointer transition backdrop-blur-sm pointer-events-auto z-10 shadow-sm">
        <ChevronLeft 
            onClick={(e) => { 
                e.preventDefault();
                prevSlide(); 
            }} 
            size={30} 
        />
      </div>

      {/* Flecha Derecha */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/80 text-gray-800 cursor-pointer transition backdrop-blur-sm pointer-events-auto z-10 shadow-sm">
        <ChevronRight 
            onClick={(e) => { 
                e.preventDefault();
                nextSlide(); 
            }} 
            size={30} 
        />
      </div>

      {/* Puntos inferiores */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10 pointer-events-auto">
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={(e) => { 
                e.preventDefault(); 
                setCurrentIndex(slideIndex); 
            }}
            className={`cursor-pointer w-3 h-3 rounded-full transition-all ${
              currentIndex === slideIndex ? "bg-white scale-125 shadow-md" : "bg-white/50 hover:bg-white/80"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;