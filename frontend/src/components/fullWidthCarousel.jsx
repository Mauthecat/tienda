import { useState, useRef } from 'react';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
const FullWidthCarousel = ({ title, products }) => {
    const carouselRef = useRef(null);

    // Función para mover el scroll con los botones
    const scroll = (direction) => {
        if (carouselRef.current) {
            const { current } = carouselRef;
            const scrollAmount = 300; // Cantidad de píxeles que se mueve por click
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Encabezado de sección simple */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
                    {title}
                </h2>
                {/* Decoración visual simple */}
                <div className="h-1 flex-1 bg-gradient-to-r from-cyan-200 to-transparent ml-6 rounded-full"></div>
            </div>
            <div className="relative group">

                {/* BOTÓN IZQUIERDA (Solo visible en Desktop al hacer hover, o siempre si prefieres) */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 -ml-4"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* CONTENEDOR DE PRODUCTOS (Scroll oculto pero funcional) */}
                <div
                    ref={carouselRef}
                    className="flex overflow-x-auto gap-4 pb-4 pt-2 px-2 snap-x scrollbar-hide"
                    style={{
                        scrollbarWidth: 'none',  // Firefox
                        msOverflowStyle: 'none'  // IE/Edge
                    }}
                >
                    {/* Estilo en línea para ocultar scrollbar en Chrome/Safari/Webkit */}
                    <style>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
          `}</style>

                    {products.map((product) => (
                        // min-w reducido a 200px/230px para hacerlo más compacto
                        <div key={product.id} className="min-w-[200px] md:min-w-[230px] bg-[#e5c2bc] rounded-2xl shadow-sm hover:shadow-xl transition-all p-3 snap-start border border-cyan-100 flex flex-col justify-between group h-full">

                            {/* Foto Producto (Altura reducida a h-48) */}
                            <div className="relative h-48 bg-gray-50 rounded-xl mb-3 overflow-hidden">
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                {/* Botón flotante */}
                                <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50">
                                    <ShoppingCart size={18} />
                                </button>

                                {/* Etiqueta Nuevo */}
                                <span className="absolute top-2 left-2 bg-[#feecd4] text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full">
                                    NUEVO
                                </span>
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-indigo-600 font-bold text-lg">{product.price}</span>
                                    <div className="flex text-yellow-400 text-xs">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-gray-400 ml-1">4.8</span>
                                    </div>
                                </div>

                                <button className="w-full mt-3 bg-[#feecd4] text-cyan-700 text-xs font-bold py-2 rounded-lg hover:bg-white hover:text-orange-800 transition-colors">
                                    Ver Detalles
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

                {/* BOTÓN DERECHA */}
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