import { useState, useEffect } from 'react';
import { Filter, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // IMPORTAMOS EL CARRITO
import logoImg from '../assets/logo.jpeg';

const ProductPage = ({ title, products, bannerImage }) => {
    const { addToCart } = useCart(); // EXTRAEMOS LA FUNCIÓN DE AÑADIR
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Helper para formatear dinero (mantenemos la consistencia visual de $6.000)
    const formatearDinero = (monto) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

    // Filtros simplificados para Precios
    const [priceFilter, setPriceFilter] = useState({
        normal: false,
        oferta: false,
    });

    const getSortedProducts = () => {
        let sorted = [...products];

        // LÓGICA DE FILTRADO (Usa discount_percent de tu base de datos)
        if (priceFilter.normal && !priceFilter.oferta) {
            // Si tiene 0 o nada de descuento, es normal
            sorted = sorted.filter(p => !p.discount_percent || p.discount_percent === 0);
        } else if (!priceFilter.normal && priceFilter.oferta) {
            // Si tiene más de 0, es oferta
            sorted = sorted.filter(p => p.discount_percent && p.discount_percent > 0);
        }

        // LÓGICA DE ORDENAMIENTO (Corregida para números)
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => {
                    // Ya no usamos .replace porque ahora son números puros
                    const priceA = a.price;
                    const priceB = b.price;
                    return priceA - priceB;
                });
            case 'price-desc':
                return sorted.sort((a, b) => {
                    const priceA = a.price;
                    const priceB = b.price;
                    return priceB - priceA;
                });
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    };

    const sortedProducts = getSortedProducts();

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    // Función para manejar los checkboxes
    const handleFilterChange = (type) => {
        setPriceFilter(prev => ({ ...prev, [type]: !prev[type] }));
        setCurrentPage(1); // Volver a la página 1 al filtrar
    };

    return (
        <div className="min-h-screen bg-[#b3f3f5]">

            {/* === BANNER SUPERIOR === */}
            <div className="relative h-48 md:h-64 bg-gray-900 overflow-hidden">
                <img
                    src={bannerImage || logoImg}
                    alt={title}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest text-center px-4">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="md:hidden w-full bg-gray-900 text-white py-3 uppercase font-bold tracking-wider flex justify-center items-center gap-2 text-sm rounded-xl"
                    >
                        <Filter size={16} /> Filtros
                    </button>

                    <div className="hidden md:block text-gray-500 text-sm">
                        Mostrando {currentProducts.length} de {sortedProducts.length} productos
                    </div>

                    <div className="flex items-center gap-2 self-end">
                        <span className="text-sm text-gray-600 hidden md:inline">Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-xl p-2 text-sm focus:outline-none focus:border-cyan-400 bg-[#feecd4]"
                        >
                            <option value="relevance">Relevancia</option>
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="name">Nombre: A-Z</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">

                    {/* === SIDEBAR FILTROS (Desktop) === */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8 bg-white/40 p-6 rounded-[2rem] border border-white/20 backdrop-blur-sm">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Tipo de Precio</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={priceFilter.normal}
                                            onChange={() => handleFilterChange('normal')}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer" 
                                        />
                                        <span className="text-gray-600 text-sm group-hover:text-cyan-600">Precio Normal</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={priceFilter.oferta}
                                            onChange={() => handleFilterChange('oferta')}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 cursor-pointer" 
                                        />
                                        <span className="text-gray-600 text-sm group-hover:text-cyan-600">Precio en Oferta</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* === GRILLA DE PRODUCTOS === */}
                    <div className="flex-1">
                        {currentProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white/30 rounded-[3rem] border border-dashed border-gray-400">
                                <p className="text-gray-500 italic">No hay productos que coincidan con los filtros seleccionados.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {currentProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col bg-[#feecd4] border border-orange-100 hover:shadow-xl transition-all duration-300 rounded-2xl p-3"
                                    >
                                        <Link to={`/producto/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-xl mb-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {product.discount_percent > 0 && (
                                                <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                    -{product.discount_percent}%
                                                </span>
                                            )}
                                        </Link>

                                        <div className="flex flex-col flex-grow justify-between">
                                            <div>
                                                <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wider mb-1">Policromica</p>
                                                <h3 className="font-semibold text-gray-700 text-sm md:text-base leading-tight mb-1 line-clamp-2 h-10">
                                                    {product.name}
                                                </h3>
                                                <div className="flex justify-between items-center mt-1">
                                                    {/* Usamos el helper para que el número se vea como $6.000 */}
                                                    <span className="text-indigo-600 font-bold text-base md:text-lg">
                                                        {formatearDinero(product.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CÁPSULA DE BOTONES */}
                                            <div className="mt-3 flex items-center justify-center w-full bg-white rounded-full overflow-hidden shadow-sm border border-orange-100">
                                                <Link 
                                                    to={`/producto/${product.id}`}
                                                    className="flex-1 text-center py-2 text-cyan-800 text-[11px] font-bold hover:bg-orange-50 hover:text-indigo-600 transition-colors border-r border-orange-50"
                                                >
                                                    Detalles
                                                </Link>
                                                
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); 
                                                        addToCart(product); 
                                                    }}
                                                    className="flex-1 text-center py-2 text-pink-600 text-[11px] font-bold hover:bg-orange-50 hover:text-pink-700 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <ShoppingCart size={12} /> Añadir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* === PAGINACIÓN === */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`w-10 h-10 flex items-center justify-center border rounded-xl font-bold ${currentPage === number
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                : 'bg-[#feecd4] text-gray-600 border-gray-300 hover:border-gray-900'
                                            } transition-all`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === MOBILE FILTER DRAWER === */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileFilterOpen(false)}
                    ></div>

                    <div className="relative w-[80%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-800 uppercase tracking-widest">Filtros</h2>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Tipo de Precio</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={priceFilter.normal}
                                            onChange={() => handleFilterChange('normal')}
                                            className="w-5 h-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" 
                                        />
                                        <span className="text-gray-600">Precio Normal</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={priceFilter.oferta}
                                            onChange={() => handleFilterChange('oferta')}
                                            className="w-5 h-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" 
                                        />
                                        <span className="text-gray-600">Precio en Oferta</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;