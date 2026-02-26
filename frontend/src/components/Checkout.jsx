import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
    const { cart, totalPrice } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', email: '', telefono: '', direccion: '', ciudad: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const BASE_URL = import.meta.env.MODE === 'production'
            ? 'https://tienda-backend-fn64.onrender.com'
            : 'http://127.0.0.1:8000';

        try {
            // AHORA ENVIAMOS EL CARRITO Y LA DIRECCIÓN COMPLETA
            const payload = {
                amount: totalPrice,
                email: formData.email,
                shipping: formData, // Mandamos nombre, apellido, dirección...
                cart: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await axios.post(`${BASE_URL}/api/payment/create/`, payload);

            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Error conectando con Flow:", error);
            alert("Hubo un problema al generar el pago. Por favor, intenta nuevamente.");
            setIsLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
                <Link to="/" className="text-indigo-600 hover:underline flex items-center gap-2">
                    <ChevronLeft size={20} /> Volver a la tienda
                </Link>
            </div>
        );
    }

    const formattedTotal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
                    <ChevronLeft size={20} /> Volver a la tienda
                </Link>

                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div className="w-full lg:w-3/5">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Datos de Envío</h2>
                            
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                                        <input required type="text" name="nombre" onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Apellido</label>
                                        <input required type="text" name="apellido" onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                        <input required type="email" name="email" onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                                        <input required type="tel" name="telefono" onChange={handleChange} placeholder="+56 9 " className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Dirección completa</label>
                                    <input required type="text" name="direccion" onChange={handleChange} placeholder="Calle, Número, Depto..." className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Ciudad</label>
                                    <input required type="text" name="ciudad" onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Resumen de la Orden */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Tu Pedido</h2>
                            
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                                                <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{item.price}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formattedTotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Por calcular</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total a Pagar</span>
                                    <span className="text-pink-600">{formattedTotal}</span>
                                </div>
                            </div>

                            <button 
                                form="checkout-form"
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                {isLoading ? 'Conectando...' : 'Proceder al Pago Seguro'}
                            </button>
                            
                            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                                Pago procesado de forma segura por Flow
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;