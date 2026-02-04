import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigation = [
        { name: 'Inicio', href: '#' },
        { name: 'Aros', href: '#' },
        { name: 'Cortadores', href: '#' }, // Cambio solicitado: Moldes -> Cortadores
    ];

    return (
        // Cambio de color: bg-[#feecd4] -> bg-[#b3f3f5]
        <header className="bg-[#b3f3f5] shadow-sm sticky top-0 z-50 w-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 relative">

                    {/* VISTA MÓVIL */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-indigo-600 p-2"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center md:static absolute left-1/2 md:left-auto transform -translate-x-1/2 md:translate-x-0 h-full">
                        <a href="#" className="h-full flex items-center">
                            <img src={logoImg} alt="Logo Joyas Sister" className="h-16 w-auto object-contain" />
                        </a>
                    </div>

                    {/* Icono Usuario Móvil */}
                    <div className="flex md:hidden">
                        <button className="p-2 text-gray-600 hover:text-indigo-600">
                            <User size={24} />
                        </button>
                    </div>

                    {/* VISTA ESCRITORIO */}
                    <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-gray-800 hover:text-indigo-600 font-medium transition-colors uppercase tracking-wide text-sm"
                            >
                                {item.name}
                            </a>
                        ))}
                    </nav>

                    {/* Iconos Derecha */}
                    <div className="flex items-center space-x-4 md:space-x-6 z-10">
                        <button className="text-gray-800 hover:text-indigo-600">
                            <User size={24} />
                        </button>
                        <button className="hidden md:block text-gray-800 hover:text-pink-600">
                            <Heart size={24} />
                        </button>
                        <button className="hidden md:block relative text-gray-800 hover:text-indigo-600">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">0</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ MÓVIL */}
            {isMenuOpen && (
                // Fondo actualizado a #b3f3f5
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#b3f3f5] border-t border-cyan-200 shadow-lg animate-in slide-in-from-top-5">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                // Hover usa el color secundario (antiguo primario) para contraste
                                className="block px-3 py-3 rounded-md text-base font-medium text-gray-800 hover:bg-[#feecd4] hover:text-indigo-900 border-b border-cyan-200/50 transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;