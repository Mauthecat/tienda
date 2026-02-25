import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Star } from 'lucide-react';

const ProductDetail = ({ products }) => {
    // useParams extrae el ID de la URL (ej: /producto/3 -> saca el 3)
    const { id } = useParams();
    
    // Buscamos el producto específico en la lista de todos los productos
    const product = products.find(p => p.id.toString() === id);

    // Si entramos y aún no cargan los productos, mostramos un mensaje de carga
    if (products.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-[#b3f3f5]">Cargando producto...</div>;
    }

    // Si el usuario pone un ID que no existe (ej: /producto/999)
    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#b3f3f5]">
                <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
                <Link to="/" className="text-indigo-600 hover:underline flex items-center gap-2">
                    <ChevronLeft /> Volver al inicio
                </Link>
            </div>
        );
    }

    // Al entrar a la página, subimos la pantalla hasta arriba
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Migas de pan (Breadcrumbs) para volver atrás */}
                <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
                    <span>/</span>
                    <Link to={`/${product.category__name.toLowerCase()}`} className="hover:text-indigo-600 transition-colors">
                        {product.category__name}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate">{product.name}</span>
                </nav>

                {/* Contenedor Principal: 2 columnas en PC, 1 en móviles */}
                <div className="flex flex-col md:flex-row gap-12 bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                    
                    {/* COLUMNA IZQUIERDA: Imágenes (Estilo Lippi) */}
                    <div className="w-full md:w-1/2 flex gap-4">
                        {/* Galería lateral de miniaturas (Simulada por ahora) */}
                        <div className="hidden md:flex flex-col gap-4 w-20">
                            <img src={product.image} className="w-20 h-20 object-cover border-2 border-indigo-600 rounded-lg cursor-pointer" alt="thumb" />
                            <img src={product.image} className="w-20 h-20 object-cover border border-gray-200 rounded-lg cursor-pointer opacity-50 hover:opacity-100" alt="thumb" />
                        </div>
                        
                        {/* Imagen Principal */}
                        <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden aspect-square md:aspect-[4/5] relative">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Información y Compra */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">Policromica</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                            {product.name}
                        </h1>

                        {/* Estrellas de reseñas (Visual) */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                                <Star size={16} fill="currentColor" />
                            </div>
                            <span className="text-sm text-gray-500 underline cursor-pointer">Ver reseñas</span>
                        </div>

                        {/* Precio */}
                        <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
                            <span className="text-4xl font-bold text-pink-600">{product.price}</span>
                        </div>

                        {/* Botón Añadir al Carro */}
                        <button className="w-full md:w-auto bg-gray-900 text-white font-bold text-lg py-4 px-8 rounded-full flex items-center justify-center gap-3 hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/20 mb-8 uppercase tracking-wider">
                            <ShoppingBag size={24} />
                            Añadir al Carrito
                        </button>

                        {/* Descripción (Acordeón estilo Lippi) */}
                        <div className="space-y-4">
                            <div className="border border-gray-200 rounded-2xl p-4">
                                <h3 className="font-bold text-gray-900 mb-2">Descripción del Producto</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {product.description || "Este hermoso producto fue hecho a mano con dedicación y detalle. Ideal para combinar con tu estilo del día a día o regalar a alguien especial. ¡Destaca con los colores de Policromica!"}
                                </p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-2xl p-4">
                                <h3 className="font-bold text-gray-900">Envíos y Entregas</h3>
                                <p className="text-gray-500 text-sm mt-2">Envíos a todo Chile vía Starken o Chilexpress. Despachamos en 48 hrs hábiles.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;