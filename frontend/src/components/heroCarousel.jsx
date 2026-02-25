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
      
      {/* Imagen de Fondo clickeable */}
      <Link to={currentSlide.link} className="block w-full h-full relative overflow-hidden">
        <div 
          style={{ backgroundImage: `url(${currentSlide.image})` }} 
          className="w-full h-full bg-center bg-cover duration-700 ease-in-out transition-all hover:scale-105"
        >
          <div className="w-full h-full bg-black/10 hover:bg-black/20 transition-colors"></div>
        </div>
      </Link>

      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm pointer-events-auto z-10">
        <ChevronLeft onClick={prevSlide} size={30} />
      </div>

      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm pointer-events-auto z-10">
        <ChevronRight onClick={nextSlide} size={30} />
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
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