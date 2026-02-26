import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const FullWidthCarousel = ({ title, products }) => {
    const { addToCart } = useCart(); 
    const { user } = useAuth();
    
    const carouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [favIds, setFavIds] = useState([]);
    
    let isDown = useRef(false);
    let startX = useRef(0);
    let scrollLeft = useRef(0);

    useEffect(() => {
        if (user) {
            const fetchFavs = async () => {
                const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';
                try {
                    const res = await axios.get(`${BASE_URL}/api/favorites/`, { params: { email: user.email } });
                    setFavIds(res.data.map(f => f.id));
                } catch (e) {}
            };
            fetchFavs();
        } else {
            setFavIds([]);
        }
    }, [user]);

    const toggleFav = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert("¡Inicia sesión para guardar tus favoritos!");
        const isFav = favIds.includes(productId);
        setFavIds(prev => isFav ? prev.filter(id => id !== productId) : [...prev, productId]);
        try {
            const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';
            await axios.post(`${BASE_URL}/api/favorites/toggle/`, { email: user.email, product_id: productId });
        } catch (err) {
            setFavIds(prev => isFav ? [...prev, productId] : prev.filter(id => id !== productId));
        }
    };

    const handleMouseDown = (e) => {
        isDown.current = true;
        startX.current = e.pageX - carouselRef.current.offsetLeft;
        scrollLeft.current = carouselRef.current.scrollLeft;
    };
    const handleMouseLeave = () => { isDown.current = false; setIsDragging(false); };
    const handleMouseUp = () => { isDown.current = false; setTimeout(() => setIsDragging(false), 50); };
    const handleMouseMove = (e) => {
        if (!isDown.current) return;
        e.preventDefault();
        if (!isDragging) setIsDragging(true);
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; 
        carouselRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const scroll = (direction) => {
        if (carouselRef.current) {
            const { current } = carouselRef;
            const scrollAmount = current.offsetWidth > 600 ? 500 : 250;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="w-full py-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">{title}</h2>
                    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-200 to-transparent ml-6 rounded-full"></div>
                </div>
            </div>

            <div className="relative group max-w-7xl mx-auto"> 
                <button onClick={() => scroll('left')} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 -ml-4">
                    <ChevronLeft size={24} />
                </button>

                <div ref={carouselRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} className="flex overflow-x-auto gap-4 pb-4 pt-2 px-4 md:px-0 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

                    {products.map((product) => (
                        <Link to={`/producto/${product.id}`} key={product.id} draggable={false} onDragStart={(e) => e.preventDefault()} onClick={(e) => { if (isDragging) e.preventDefault(); }} className="block flex-shrink-0 min-w-[200px] md:min-w-[230px] bg-[#e5c2bc] rounded-2xl shadow-sm hover:shadow-xl transition-all p-3 pb-2 snap-start snap-always border border-cyan-100 flex flex-col justify-between group h-full select-none relative">

                            {/* BOTÓN DE CORAZÓN */}
                            <button onClick={(e) => toggleFav(e, product.id)} className="absolute top-5 right-5 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full text-pink-500 hover:bg-pink-100 hover:scale-110 transition-all shadow-sm pointer-events-auto">
                                <Heart size={18} fill={favIds.includes(product.id) ? "currentColor" : "none"} />
                            </button>

                            <div className="relative h-48 bg-gray-50 rounded-xl mb-3 overflow-hidden pointer-events-none">
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable="false" />
                                </div>
                            </div>

                            <div className="flex flex-col flex-grow justify-between pointer-events-none z-10">
                                <div>
                                    <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-indigo-600 font-bold text-lg">{product.price}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-center w-full bg-[#feecd4] rounded-full overflow-hidden shadow-sm border border-[#f5d7ce] pointer-events-auto z-10 relative">
                                <span className="flex-1 text-center py-2 text-cyan-800 text-[11px] md:text-xs font-bold hover:bg-white hover:text-indigo-600 transition-colors">
                                    Ver Detalles
                                </span>
                                <span className="text-orange-300 font-light text-xs select-none">/</span>
                                <button onClick={(e) => { e.preventDefault(); if (isDragging) return; addToCart(product); }} className="flex-1 text-center py-2 text-pink-600 text-[11px] md:text-xs font-bold hover:bg-white hover:text-pink-700 transition-colors cursor-pointer z-10">
                                    Añadir al carro
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                <button onClick={() => scroll('right')} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 -mr-4">
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
};

export default FullWidthCarousel;