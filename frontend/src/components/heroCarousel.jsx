import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    // Altura ajustable: 250px en móvil, 450px en escritorio
    <div className="w-full h-[250px] md:h-[450px] relative group shadow-lg">
      
      {/* Imagen de Fondo con transición suave */}
      <div 
        style={{ backgroundImage: `url(${images[currentIndex]})` }} 
        className="w-full h-full bg-center bg-cover duration-700 ease-in-out transition-all"
      >
        {/* Capa oscura sutil para que no brille tanto */}
        <div className="w-full h-full bg-black/10"></div>
      </div>

      {/* Flecha Izquierda */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm">
        <ChevronLeft onClick={prevSlide} size={30} />
      </div>

      {/* Flecha Derecha */}
      <div className="hidden group-hover:block absolute top-[50%] -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-white/30 hover:bg-white/50 text-white cursor-pointer transition backdrop-blur-sm">
        <ChevronRight onClick={nextSlide} size={30} />
      </div>

      {/* Puntos (Dots) abajo */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, slideIndex) => (
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