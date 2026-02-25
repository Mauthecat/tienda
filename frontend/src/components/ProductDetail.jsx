import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Star } from 'lucide-react';

const ProductDetail = ({ products }) => {
    const { id } = useParams();
    const product = products.find(p => p.id.toString() === id);
    
    // Estado para saber qué foto estamos viendo en grande
    const [selectedImage, setSelectedImage] = useState(null);

    // Cuando el producto carga por primera vez, seleccionamos su primera foto
    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (products.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-[#b3f3f5]">Cargando producto...</div>;
    }

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

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
                    <span>/</span>
                    <Link to={`/${product.category__name.toLowerCase()}`} className="hover:text-indigo-600 transition-colors">
                        {product.category__name}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate">{product.name}</span>
                </nav>

                <div className="flex flex-col md:flex-row gap-12 bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                    
                    {/* COLUMNA IZQUIERDA: Imágenes Dinámicas */}
                    <div className="w-full md:w-1/2 flex gap-4 flex-col-reverse md:flex-row">
                        
                        {/* Galería lateral de miniaturas (Solo se muestra si hay más de 1 foto) */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-20 snap-x">
                                {product.images.map((imgUrl, index) => (
                                    <img 
                                        key={index}
                                        src={imgUrl} 
                                        onClick={() => setSelectedImage(imgUrl)} // Cambia la foto principal al hacer clic
                                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 transition-all ${
                                            selectedImage === imgUrl 
                                            ? 'border-2 border-indigo-600 opacity-100' 
                                            : 'border border-gray-200 opacity-50 hover:opacity-100'
                                        }`} 
                                        alt={`Miniatura ${index + 1}`} 
                                    />
                                ))}
                            </div>
                        )}
                        
                        {/* Imagen Principal (Muestra la seleccionada, si no hay, muestra la default) */}
                        <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden aspect-square relative">
                            <img 
                                src={selectedImage || product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Información */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <p className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-2">Policromica</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                            {product.name}
                        </h1>

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

                        <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
                            <span className="text-4xl font-bold text-pink-600">{product.price}</span>
                        </div>

                        <button className="w-full md:w-auto bg-gray-900 text-white font-bold text-lg py-4 px-8 rounded-full flex items-center justify-center gap-3 hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/20 mb-8 uppercase tracking-wider">
                            <ShoppingBag size={24} />
                            Añadir al Carrito
                        </button>

                        <div className="space-y-4">
                            <div className="border border-gray-200 rounded-2xl p-4">
                                <h3 className="font-bold text-gray-900 mb-2">Descripción del Producto</h3>
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {product.description || "Este hermoso producto fue hecho a mano con dedicación y detalle. ¡Destaca con los colores de Policromica!"}
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