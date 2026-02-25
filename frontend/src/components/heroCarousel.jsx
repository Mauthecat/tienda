import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación

const HeroCarousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Opcional: Autoplay para que el carrusel se mueva solo cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    // Altura ajustable: 250px en móvil, 450px en escritorio
    <div className="w-full h-[250px] md:h-[450px] relative group shadow-lg">
      
      {/* Imagen de Fondo clickeable con transición suave */}
      <Link to={slides[currentIndex].link} className="block w-full h-full relative overflow-hidden">
        <div 
          style={{ backgroundImage: `url(${slides[currentIndex].image})` }} 
          className="w-full h-full bg-center bg-cover duration-700 ease-in-out transition-all hover:scale-105"
        >
          {/* Capa oscura sutil para que no brille tanto */}
          <div className="w-full h-full bg-black/10 hover:bg-black/20 transition-colors"></div>
        </div>
      </Link>

      {/* Flecha Izquierda */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm pointer-events-auto">
        <ChevronLeft onClick={prevSlide} size={30} />
      </div>

      {/* Flecha Derecha */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm pointer-events-auto">
        <ChevronRight onClick={nextSlide} size={30} />
      </div>

      {/* Puntos (Dots) abajo */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => setCurrentIndex(slideIndex)}
            className={`cursor-pointer w-3 h-3 rounded-full transition-all ${
              currentIndex === slideIndex ? "bg-white scale-125 shadow" : "bg-white/50"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;