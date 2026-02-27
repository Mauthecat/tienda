import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Loader2, Info } from 'lucide-react';
import axios from 'axios';

// Mapeo exacto de tarifas BlueExpress (Talla XS) desde Origen: Rancagua (Centro)
const REGIONES_CHILE = [
    { nombre: "Región de Arica y Parinacota", zona: "extremo", precio: 5200 },
    { nombre: "Región de Tarapacá", zona: "extremo", precio: 5200 },
    { nombre: "Región de Antofagasta", zona: "extremo", precio: 5200 },
    { nombre: "Región de Atacama", zona: "centro", precio: 4300 },
    { nombre: "Región de Coquimbo", zona: "centro", precio: 4300 },
    { nombre: "Región de Valparaíso", zona: "centro", precio: 4300 },
    { nombre: "Región Metropolitana", zona: "santiago", precio: 4300 },
    { nombre: "Región del Libertador Gral. Bernardo O'Higgins", zona: "local", precio: 3100 },
    { nombre: "Región del Maule", zona: "centro", precio: 4300 },
    { nombre: "Región de Ñuble", zona: "centro", precio: 4300 },
    { nombre: "Región del Biobío", zona: "centro", precio: 4300 },
    { nombre: "Región de La Araucanía", zona: "centro", precio: 4300 },
    { nombre: "Región de Los Ríos", zona: "centro", precio: 4300 },
    { nombre: "Región de Los Lagos", zona: "centro", precio: 4300 },
    { nombre: "Región de Aysén", zona: "extremo", precio: 5200 },
    { nombre: "Región de Magallanes", zona: "extremo", precio: 5200 },
];

const Checkout = () => {
    const { cart, totalPrice } = useCart();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [showAutoFillAlert, setShowAutoFillAlert] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);

    const [formData, setFormData] = useState({
        nombre: '', apellido: '', email: '', telefono: '', direccion: '', ciudad: '', region: ''
    });

    const BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://tienda-backend-fn64.onrender.com'
        : 'http://127.0.0.1:8000';

    // AUTO-RELLENADO DE DATOS DESDE LA BASE DE DATOS
    useEffect(() => {
        if (user && user.email) {
            const fetchProfile = async () => {
                try {
                    const res = await axios.get(`${BASE_URL}/api/profile/`, { params: { email: user.email } });
                    
                    // Separar nombre y apellido si viene junto
                    const nombreCompleto = res.data.nombre || '';
                    const partesNombre = nombreCompleto.split(' ');
                    const nombre = partesNombre[0] || '';
                    const apellido = partesNombre.slice(1).join(' ') || '';

                    setFormData(prev => ({
                        ...prev,
                        nombre: nombre,
                        apellido: apellido,
                        email: user.email,
                        telefono: res.data.telefono || '',
                        direccion: res.data.direccion || '',
                        ciudad: res.data.ciudad || '',
                    }));
                    
                    setShowAutoFillAlert(true);
                    setTimeout(() => setShowAutoFillAlert(false), 6000); // Ocultar alerta después de 6s
                } catch (error) {
                    console.error("Error auto-rellenando datos", error);
                }
            };
            fetchProfile();
        }
    }, [user, BASE_URL]);

    // MANEJO DE FORMULARIO Y CÁLCULO DE ENVÍO
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Si el usuario cambia la región, calculamos el nuevo precio de envío
        if (name === 'region') {
            const regionSeleccionada = REGIONES_CHILE.find(r => r.nombre === value);
            setShippingCost(regionSeleccionada ? regionSeleccionada.precio : 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const finalTotal = totalPrice + shippingCost; // Sumamos el envío al total de los productos
            
            const payload = {
                amount: finalTotal,
                email: formData.email,
                shipping: formData,
                cart: cart.map(item => ({ id: item.id, quantity: item.quantity }))
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

    const formatearDinero = (monto) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ChevronLeft size={20} /> Volver a la tienda
                </Link>

                {/* ALERTA DE AUTO-RELLENADO */}
                {showAutoFillAlert && (
                    <div className="mb-6 bg-cyan-50 border border-cyan-200 text-cyan-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <Info size={20} className="text-cyan-600" />
                        <p className="text-sm font-medium">Hemos cargado tus datos guardados para acelerar tu compra. Por favor revísalos y selecciona tu región para calcular el envío.</p>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div className="w-full lg:w-3/5">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Datos de Envío</h2>
                            
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</label>
                                        <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Apellido</label>
                                        <input required type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                                        <input required type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 " className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Dirección completa</label>
                                    <input required type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, Número, Depto..." className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Región</label>
                                        <select 
                                            required 
                                            name="region" 
                                            value={formData.region} 
                                            onChange={handleChange} 
                                            className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                                        >
                                            <option value="" disabled>Selecciona tu región...</option>
                                            {REGIONES_CHILE.map(r => (
                                                <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Ciudad</label>
                                        <input required type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ej: Rancagua" className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                                    </div>
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
                                        <p className="text-sm font-bold text-gray-900">{formatearDinero(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal Productos</span>
                                    <span>{formatearDinero(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Envío BlueExpress</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Selecciona región</span>
                                    ) : (
                                        <span className="font-medium text-indigo-600">+{formatearDinero(shippingCost)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100 mt-2">
                                    <span>Total a Pagar</span>
                                    <span className="text-pink-600">{formatearDinero(totalPrice + shippingCost)}</span>
                                </div>
                            </div>

                            <button 
                                form="checkout-form"
                                type="submit"
                                disabled={isLoading || shippingCost === 0}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                {isLoading ? 'Procesando...' : (shippingCost === 0 ? 'Selecciona Región' : 'Pagar Seguro')}
                            </button>
                            
                            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                                Envío calculado según tarifas BlueExpress XS.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;