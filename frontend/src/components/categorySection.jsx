import { useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CategorySection = ({ title, buttonText, bannerImage, products, isReversed }) => {
  const { addToCart } = useCart();
  
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  let isDown = useRef(false);
  let startX = useRef(0);
  let scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; 
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
        {title} <Heart className="text-pink-500 fill-pink-500 w-5 h-5" />
      </h2>

      <div className={`flex flex-col md:flex-row gap-6 ${isReversed ? 'md:flex-row-reverse' : ''}`}>
        
        <div className="w-full md:w-1/3 relative h-[400px] md:h-auto rounded-3xl overflow-hidden shadow-xl group">
          <img 
            src={bannerImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center">
            <Link 
              to={title.includes('Aritos') ? '/aros' : '/cortadores'}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-[#feecd4] transition-all shadow-lg transform hover:-translate-y-1 w-full md:w-auto text-center uppercase text-sm tracking-widest"
            >
              {buttonText}
            </Link>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col justify-center overflow-hidden">
          
          <div 
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex overflow-x-auto gap-4 pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
            
            {products.map((product) => (
              <Link 
                to={`/producto/${product.id}`} 
                key={product.id} 
                draggable={false} // <-- BLOQUEO 1: Evita que se trate como archivo
                onDragStart={(e) => e.preventDefault()} // <-- BLOQUEO 2: Mata el evento fantasma del navegador
                onClick={(e) => {
                    if (isDragging) e.preventDefault(); 
                }}
                className="block flex-shrink-0 min-w-[200px] md:min-w-[230px] bg-[#feecd4] rounded-2xl shadow-sm hover:shadow-xl transition-all p-3 pb-2 snap-start snap-always border border-orange-100 flex flex-col justify-between group select-none"
              >
                
                <div className="relative h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden pointer-events-none">
                   <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={product.name} 
                      draggable="false" 
                   />
                </div>

                <div className="flex flex-col flex-grow justify-between pointer-events-none">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                    </div>
                  </div>
                </div>
                  
                <div className="mt-3 flex items-center justify-center w-full bg-white rounded-full overflow-hidden shadow-sm border border-orange-100 pointer-events-auto">
                    <span className="flex-1 text-center py-2 text-cyan-800 text-[11px] md:text-xs font-bold hover:bg-orange-50 hover:text-indigo-600 transition-colors">
                        Ver Detalles
                    </span>
                    
                    <span className="text-orange-300 font-light text-xs select-none">/</span>
                    
                    <button
                        onClick={(e) => {
                            e.preventDefault(); 
                            if (isDragging) return; 
                            addToCart(product); 
                        }}
                        className="flex-1 text-center py-2 text-pink-600 text-[11px] md:text-xs font-bold hover:bg-orange-50 hover:text-pink-700 transition-colors cursor-pointer z-10"
                    >
                        Añadir al carro
                    </button>
                </div>

              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategorySection;