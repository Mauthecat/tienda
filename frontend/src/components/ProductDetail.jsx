import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft } from 'lucide-react'; // Quitamos Star de aquí
import { useCart } from '../context/CartContext';

const ProductDetail = ({ products }) => {
    const { id } = useParams();
    const product = products.find(p => p.id.toString() === id);
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(null);

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

    // LÓGICA NUEVA: Buscar productos similares (misma categoría, excluyendo el actual, máximo 4)
    const similarProducts = products
        .filter(p => p.category__name === product.category__name && p.id.toString() !== id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Migas de pan */}
                <nav className="flex text-sm text-gray-500 mb-8 gap-2">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
                    <span>/</span>
                    <Link to={`/${product.category__name.toLowerCase()}`} className="hover:text-indigo-600 transition-colors">
                        {product.category__name}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate">{product.name}</span>
                </nav>

                {/* DETALLE DEL PRODUCTO */}
                <div className="flex flex-col md:flex-row gap-12 bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-16">

                    {/* COLUMNA IZQUIERDA: Imágenes */}
                    <div className="w-full md:w-1/2 flex gap-4 flex-col-reverse md:flex-row">
                        {product.images && product.images.length > 1 && (
                            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-20 snap-x">
                                {product.images.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 transition-all ${selectedImage === imgUrl
                                                ? 'border-2 border-indigo-600 opacity-100'
                                                : 'border border-gray-200 opacity-50 hover:opacity-100'
                                            }`}
                                        alt={`Miniatura ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

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

                        {/* Removimos la sección de estrellas y reseñas de aquí */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                            {product.name}
                        </h1>

                        <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
                            <span className="text-4xl font-bold text-pink-600">{product.price}</span>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-full md:w-auto bg-gray-900 text-white font-bold text-lg py-4 px-8 rounded-full flex items-center justify-center gap-3 hover:bg-gray-800 hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/20 mb-8 uppercase tracking-wider"
                        >
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

                {/* NUEVA SECCIÓN: ARTÍCULOS QUE PODRÍAN GUSTARTE */}
                {similarProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wider">
                            También te podría gustar
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {similarProducts.map(similar => (
                                <Link
                                    to={`/producto/${similar.id}`}
                                    key={similar.id}
                                    className="group flex flex-col bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        <img
                                            src={similar.image}
                                            alt={similar.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight mb-2 line-clamp-2">
                                            {similar.name}
                                        </h3>
                                        <div className="mt-auto pt-2">
                                            <span className="font-bold text-pink-600">{similar.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetail;