import { useState, useRef } from 'react';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // IMPORTAMOS LINK

const FullWidthCarousel = ({ title, products }) => {
    const carouselRef = useRef(null);

    const scroll = (direction) => {
        if (carouselRef.current) {
            const { current } = carouselRef;
            const scrollAmount = 300;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="w-full py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
                        {title}
                    </h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-200 to-transparent ml-6 rounded-full"></div>
                </div>
            </div>

            <div className="relative group max-w-7xl mx-auto"> 
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 -ml-4"
                >
                    <ChevronLeft size={24} />
                </button>

                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto gap-4 pb-4 pt-2 px-4 md:px-0 snap-x scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {products.map((product) => (
                        // CAMBIAMOS DIV POR LINK
                        <Link 
                            to={`/producto/${product.id}`} 
                            key={product.id} 
                            className="block flex-shrink-0 min-w-[200px] md:min-w-[230px] bg-[#e5c2bc] rounded-2xl shadow-sm hover:shadow-xl transition-all p-3 snap-start border border-cyan-100 flex flex-col justify-between group h-full cursor-pointer"
                        >

                            <div className="relative h-48 bg-gray-50 rounded-xl mb-3 overflow-hidden">
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <button 
                                    onClick={(e) => e.preventDefault()} 
                                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                                >
                                    <ShoppingCart size={18} />
                                </button>
                                <span className="absolute top-2 left-2 bg-[#feecd4] text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full">
                                    NUEVO
                                </span>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-indigo-600 font-bold text-lg">{product.price}</span>
                                    {/* Oculté las estrellas ya que no usamos reviews por ahora */}
                                </div>
                                {/* Cambiamos el <button> a un <div> para que no sea un botón dentro de un link */}
                                <div className="w-full text-center mt-3 bg-[#feecd4] text-cyan-700 text-xs font-bold py-2 rounded-lg hover:bg-white hover:text-orange-800 transition-colors">
                                    Ver Detalles
                                </div>
                            </div>

                        </Link>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 -mr-4"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
};

export default FullWidthCarousel;