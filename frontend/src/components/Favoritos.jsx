import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, HeartCrack, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import logoImg from '../assets/logo.jpeg';

const Favoritos = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://tienda-backend-fn64.onrender.com' 
        : 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${BASE_URL}/api/favorites/`, { params: { email: user.email } });
                const formattedFavs = res.data.map(item => ({
                    ...item,
                    priceFormatted: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
                    imageUrl: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : logoImg,
                }));
                setFavorites(formattedFavs);
            } catch (error) {
                console.error("Error trayendo favoritos:", error);
            }
            setIsLoading(false);
        };
        fetchFavorites();
    }, [user, BASE_URL]);

    const removeFavorite = async (productId) => {
        try {
            await axios.post(`${BASE_URL}/api/favorites/toggle/`, { email: user.email, product_id: productId });
            setFavorites(favorites.filter(fav => fav.id !== productId));
        } catch (error) {
            console.error("Error al quitar de favoritos:", error);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 p-4">
                <Heart size={48} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tus favoritos</h2>
                <Link to="/perfil" className="text-pink-600 font-bold hover:underline">Ir a mi cuenta</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 bg-white rounded-full text-gray-500 hover:text-indigo-600 shadow-sm border border-gray-100 transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <Heart className="text-pink-500" fill="currentColor" /> Mis Favoritos
                    </h1>
                </div>

                {isLoading ? (
                    <p className="text-center text-gray-500 py-10">Cargando tus piezas favoritas...</p>
                ) : favorites.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <HeartCrack size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">Aún no tienes productos en tu lista de deseos.</p>
                        <Link to="/" className="text-indigo-600 font-bold hover:underline">Ir a vitrinear</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50 flex flex-col h-full group hover:shadow-md transition-all">
                                <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gray-100">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <button 
                                        onClick={() => removeFavorite(product.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
                                        title="Quitar de favoritos"
                                    >
                                        <HeartCrack size={18} />
                                    </button>
                                </div>
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <p className="text-xs text-pink-500 font-bold uppercase tracking-wider mb-1">{product.category__name}</p>
                                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                        <span className="text-sm font-black text-indigo-900">{product.priceFormatted}</span>
                                        <button 
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favoritos;