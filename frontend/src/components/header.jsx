import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Search } from 'lucide-react'; // Agregamos Search
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import logoImg from '../assets/logo.jpeg';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems, setIsCartOpen } = useCart();

    const navigation = [
        { name: 'Inicio', href: '/' },
        { name: 'Aros', href: '/aros' },
        { name: 'Cortadores', href: '/cortadores' },
    ];

    return (
        <header className="bg-[#b3f3f5] shadow-sm sticky top-0 z-50 w-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">

                    {/* VISTA MÓVIL (Menú Hamburguesa) */}
                    <div className="flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-indigo-600 p-2">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    <div className="flex-shrink-0 flex items-center md:static absolute left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 h-full">
                        <Link to="/" className="h-full flex items-center">
                            <img src={logoImg} alt="Logo Policromica" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* VISTA ESCRITORIO (Navegación + Buscador) */}
                    <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-8">
                        <nav className="flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="text-gray-800 hover:text-indigo-600 font-medium transition-colors uppercase tracking-wide text-sm mt-2"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* BUSCADOR DESKTOP */}
                        <div className="relative group ml-4">
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="pl-9 pr-4 py-1.5 bg-white/60 border border-cyan-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white w-40 transition-all duration-300 focus:w-64"
                            />
                            <Search size={16} className="absolute left-3 top-2 text-gray-500" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4 z-10">
                        <button className="hidden md:block p-2 text-gray-800 hover:text-indigo-600">
                            <User size={24} />
                        </button>
                        <button className="hidden md:block p-2 text-gray-800 hover:text-pink-600">
                            <Heart size={24} />
                        </button>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-gray-800 hover:text-indigo-600 transition-transform hover:scale-110"
                        >
                            <ShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 md:-top-1 md:-right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#b3f3f5] border-t border-cyan-200 shadow-lg animate-in slide-in-from-top-5">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        
                        {/* BUSCADOR MÓVIL */}
                        <div className="relative w-full mb-4">
                            <input 
                                type="text" 
                                placeholder="Buscar productos..." 
                                className="w-full pl-10 pr-4 py-3 bg-white border border-cyan-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        </div>

                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-[#feecd4] hover:text-indigo-900 border-b border-cyan-200/50 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;