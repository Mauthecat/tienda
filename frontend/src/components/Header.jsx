import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logoImg from '../assets/logo.jpeg';

const Header = ({ products = [] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { totalItems, setIsCartOpen } = useCart();
    const [searchTerm, setSearchTerm] = useState('');

    const navigation = [
        { name: 'Inicio', href: '/' },
        { name: 'Destacados', href: '/destacados' },
        { name: 'Aros', href: '/aros' },
        { name: 'Cortadores', href: '/cortadores' },
    ];

    // LÓGICA DE BÚSQUEDA
    const searchResults = searchTerm.trim() === ''
        ? []
        : products.filter(product => {
            if (!product || !product.name) return false;
            const nameNormalizado = product.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const terminoNormalizado = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nameNormalizado.includes(terminoNormalizado);
        });

    return (
        <header className="bg-[#b3f3f5] shadow-sm sticky top-0 z-[100] w-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">

                    {/* BOTÓN MENÚ MÓVIL */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-indigo-600 p-2 relative z-[110]"
                            aria-label="Abrir menú"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* LOGO */}
                    <div className="flex-shrink-0 flex items-center md:static absolute left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 h-full">
                        <Link to="/" className="h-full flex items-center">
                            <img src={logoImg} alt="Logo Policromica" className="h-16 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* NAVEGACIÓN Y BUSCADOR DESKTOP */}
                    <div className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2 space-x-6 lg:space-x-8">
                        <nav className="flex space-x-6 lg:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="text-gray-800 hover:text-indigo-600 font-medium transition-colors uppercase tracking-wide text-sm mt-1"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* BUSCADOR DESKTOP */}
                        <div className="relative group ml-2">
                            <input
                                type="text"
                                id="search-desktop"
                                name="search-desktop"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`Buscar en ${products.length} productos...`}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-56 transition-all duration-300 focus:w-72 shadow-sm font-sans"
                            />
                            <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400" />

                            {/* RESULTADOS BÚSQUEDA DESKTOP */}
                            {searchTerm && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[120]">
                                    {searchResults.length > 0 ? (
                                        <ul className="max-h-72 overflow-y-auto">
                                            {searchResults.map(product => (
                                                <li key={product.id}>
                                                    <Link
                                                        to={`/producto/${product.id}`}
                                                        onClick={() => setSearchTerm('')}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-xs text-pink-600 font-bold">{product.price}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">No hay resultados</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ICONOS DE ACCIÓN DESKTOP (Carrito siempre visible) */}
                    <div className="flex items-center space-x-2 md:space-x-4 relative z-[110]">
                        <Link
                            to="/perfil"
                            className="hidden md:block p-2 text-gray-800 hover:text-indigo-600 transition-transform hover:scale-110 relative"
                            title="Mi Cuenta"
                        >
                            <User size={24} />
                        </Link>

                        <Link to="/favoritos" className="hidden md:block p-2 text-gray-800 hover:text-pink-600 transition-transform hover:scale-110">
                            <Heart size={24} />
                        </Link>

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
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#b3f3f5] border-t border-cyan-200 shadow-lg animate-in slide-in-from-top-5 z-[105]">
                    <div className="px-4 pt-4 pb-6 space-y-4">

                        {/* BUSCADOR MÓVIL */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="search-mobile"
                                name="search-mobile"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar productos..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 shadow-sm"
                            />
                            <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />

                            {/* RESULTADOS BÚSQUEDA MÓVIL */}
                            {searchTerm && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[120]">
                                    {searchResults.length > 0 ? (
                                        <ul className="max-h-60 overflow-y-auto">
                                            {searchResults.map(product => (
                                                <li key={product.id}>
                                                    <Link
                                                        to={`/producto/${product.id}`}
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setIsMenuOpen(false);
                                                        }}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50"
                                                    >
                                                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                            <p className="text-sm text-pink-600 font-bold">{product.price}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">Sin resultados</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* LINKS DE NAVEGACIÓN MÓVIL */}
                        <nav className="flex flex-col space-y-1 pb-4 border-b border-cyan-200/50">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-white hover:text-indigo-600 transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* ACCIONES DE USUARIO MÓVIL */}
                        <div className="flex gap-3 pt-2">
                            <Link
                                to="/perfil"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex-1 bg-white flex items-center justify-center gap-2 py-3 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                <User size={18} />
                                Mi Perfil
                            </Link>
                            
                            <Link
                                to="/favoritos"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex-1 bg-white flex items-center justify-center gap-2 py-3 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-pink-600 hover:bg-pink-50 transition-colors"
                            >
                                <Heart size={18} />
                                Favoritos
                            </Link>
                        </div>

                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;