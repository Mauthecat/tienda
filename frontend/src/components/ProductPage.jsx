import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import logoImg from '../assets/logo.jpeg'; // Usaremos esto de banner por defecto

const ProductPage = ({ title, products, bannerImage }) => {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('relevance'); // relevance, price-asc, price-desc, name
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Estado para filtros (Simulado por ahora)
    const [filters, setFilters] = useState({
        stock: false,
        ofertas: false,
    });

    // 1. LÓGICA DE ORDENAMIENTO
    const getSortedProducts = () => {
        // Creamos una copia para no mutar el original
        let sorted = [...products];

        switch (sortBy) {
            case 'price-asc':
                // Limpiamos el signo $ y puntos para ordenar números
                return sorted.sort((a, b) => {
                    const priceA = parseInt(a.price.replace(/\D/g, ''));
                    const priceB = parseInt(b.price.replace(/\D/g, ''));
                    return priceA - priceB;
                });
            case 'price-desc':
                return sorted.sort((a, b) => {
                    const priceA = parseInt(a.price.replace(/\D/g, ''));
                    const priceB = parseInt(b.price.replace(/\D/g, ''));
                    return priceB - priceA;
                });
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    };

    const sortedProducts = getSortedProducts();

    // 2. LÓGICA DE PAGINACIÓN
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    // Scroll al inicio cuando cambia la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-gray-50">

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

                {/* === BARRA DE CONTROLES (Móvil: Filtro | PC: Ordenar) === */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

                    {/* Botón Filtros Móvil (Igual a la imagen 2) */}
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="md:hidden w-full bg-gray-900 text-white py-3 uppercase font-bold tracking-wider flex justify-center items-center gap-2 text-sm"
                    >
                        <Filter size={16} /> Filtros
                    </button>

                    <div className="hidden md:block text-gray-500 text-sm">
                        Mostrando {currentProducts.length} de {products.length} productos
                    </div>

                    {/* Selector de Ordenar */}
                    <div className="flex items-center gap-2 self-end">
                        <span className="text-sm text-gray-600 hidden md:inline">Ordenar por:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-cyan-400 bg-[#feecd4]"
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
                        <div className="sticky top-24 space-y-8">
                            {/* Grupo de Filtros 1 */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Disponibilidad</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-cyan-400"></div>
                                        <span className="text-gray-600 text-sm group-hover:text-cyan-600">En Stock</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-cyan-400"></div>
                                        <span className="text-gray-600 text-sm group-hover:text-cyan-600">En Oferta</span>
                                    </label>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-200"></div>

                            {/* Grupo de Filtros 2 */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Material</h3>
                                <div className="space-y-2">
                                    {['Arcilla Polimérica', 'Resina UV', 'Acero Inoxidable'].map(mat => (
                                        <label key={mat} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="w-4 h-4 border border-gray-300 rounded group-hover:border-cyan-400"></div>
                                            <span className="text-gray-600 text-sm group-hover:text-cyan-600">{mat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* === GRILLA DE PRODUCTOS === */}
                    <div className="flex-1">
                        {/* Grid: 2 columnas móvil, 3 columnas desktop */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {currentProducts.map((product) => (
                                <div key={product.id} className="group flex flex-col bg-[#feecd4] border border-gray-100 hover:shadow-lg transition-all duration-300">

                                    {/* Imagen */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {/* Badge de Descuento (Simulado) */}
                                        <span className="absolute top-2 left-2 bg-white/90 text-xs font-bold px-2 py-1 uppercase tracking-wider">
                                            -20%
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Policromica</p>
                                        <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
                                            <span className="font-bold text-gray-900">{product.price}</span>
                                            {/* Precio anterior simulado */}
                                            <span className="text-xs text-gray-400 line-through decoration-red-400">
                                                $12.990
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* === PAGINACIÓN === */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`w-10 h-10 flex items-center justify-center border ${currentPage === number
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-900'
                                            } transition-colors`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* === MOBILE FILTER DRAWER (Overlay) === */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop oscuro */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileFilterOpen(false)}
                    ></div>

                    {/* Panel Blanco Deslizable */}
                    <div className="relative w-[80%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-800 uppercase tracking-widest">Filtros</h2>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {/* Copia de los filtros para móvil */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Disponibilidad</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" />
                                        <span className="text-gray-600">En Stock</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Material</h3>
                                <div className="space-y-3">
                                    {['Arcilla Polimérica', 'Resina UV', 'Acero Inoxidable'].map(mat => (
                                        <label key={mat} className="flex items-center gap-3">
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500" />
                                            <span className="text-gray-600">{mat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 rounded-none uppercase tracking-widest transition-colors"
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;