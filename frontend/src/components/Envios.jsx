import { useState } from 'react';
import { Truck, Search, Package, HelpCircle, ChevronDown, User, MapPin, CreditCard, Loader2, Clock3 } from 'lucide-react';
import axios from 'axios';

const Envios = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRetryingPayment, setIsRetryingPayment] = useState(false);

    const BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://tienda-backend-fn64.onrender.com'
        : 'http://127.0.0.1:8000';

    const handleTrack = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setTrackingResult(null);

        try {
            const res = await axios.get(`${BASE_URL}/api/track/`, { params: { code: trackingCode } });
            if (res.data.success) {
                setTrackingResult(res.data);
            } else {
                setError('No encontramos ningún pedido con ese código. Verifica el formato (ej: POLI-15).');
            }
        } catch (err) {
            setError('Error al consultar el pedido. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // FUNCIÓN PARA REINTENTAR PAGO DESDE EL RASTREADOR
    const handleRetryPayment = async () => {
        if (!trackingResult) return;
        setIsRetryingPayment(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/payment/retry/`, { order_id: trackingResult.id, email: trackingResult.email });
            if (response.data.url) {
                window.location.href = response.data.url; // Redirigimos a Flow Sandbox
            }
        } catch (error) {
            console.error("Error reintentando pago desde track", error);
            alert(error.response?.data?.error || "Hubo un problema al generar el reintento de pago.");
        } finally {
            setIsRetryingPayment(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
                        <Truck className="text-pink-500" size={32} /> Center de Envíos
                    </h1>
                    <p className="text-gray-500">Rastrea tu paquete en tiempo real o resuelve tus dudas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* COLUMNA 1: RASTREO */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-cyan-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Search className="text-cyan-500" /> Rastrea tu Pedido
                        </h2>
                        <form onSubmit={handleTrack} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Código de Pedido</label>
                                <input 
                                    type="text" 
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    placeholder="Ej: POLI-15" 
                                    className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all uppercase font-medium"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-cyan-600/20 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isLoading ? 'Buscando...' : 'Consultar Estado'}
                            </button>
                        </form>

                        {error && <p className="mt-6 text-pink-600 text-sm font-medium p-4 bg-pink-50 rounded-xl border border-pink-100">{error}</p>}
                        
                        {/* RESULTADO COMPLETO DEL RASTREO */}
                        {trackingResult && (
                            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in duration-300 relative">
                                
                                {/* ALERTA DE ORDEN EXPIRADA EN EL TRACKING */}
                                {trackingResult.is_expired && (
                                    <div className="mb-6 bg-gray-100 border border-gray-200 p-4 rounded-xl text-gray-800 flex items-start gap-3">
                                        <Clock3 className="text-gray-400 mt-0.5" size={20} />
                                        <p className="text-xs">Esta orden ha estado <span className="font-bold">Pendiente</span> por más de 6 horas y ha expirado. Por seguridad y control de stock, no es posible reintentar el pago. Por favor, realiza un nuevo pedido.</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Package className="text-pink-500" size={28} />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Orden Número</p>
                                            <p className="font-black text-gray-900 text-xl">{trackingResult.order_number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        {/* ESTADO O BOTÓN DE PAGO */}
                                        {trackingResult.is_expired ? (
                                            <span className="bg-gray-200 text-gray-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">Expirado</span>
                                        ) : trackingResult.raw_status === 'pendiente' ? (
                                            <button 
                                                onClick={handleRetryPayment}
                                                disabled={isRetryingPayment}
                                                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                                            >
                                                {isRetryingPayment ? <Loader2 size={14} className="animate-spin"/> : <CreditCard size={14} />}
                                                {isRetryingPayment ? 'Procesando...' : 'Pagar Ahora'}
                                            </button>
                                        ) : (
                                            <span className="bg-cyan-100 text-cyan-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                {trackingResult.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <User size={16} className="text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">A nombre de</p>
                                            <p className="font-medium text-gray-900">{trackingResult.customer_name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Fecha Compra</p>
                                        <p className="font-medium text-gray-900 ml-6">{trackingResult.date}</p>
                                    </div>
                                    <div className="md:col-span-2 flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-400 mt-0.5 min-w-[16px]" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Dirección de Destino</p>
                                            <p className="font-medium text-gray-900 leading-snug">{trackingResult.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 bg-white p-4 rounded-xl border border-cyan-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Método de Envío</p>
                                        <p className="font-bold text-gray-800 flex items-center gap-2">
                                            <Truck size={16} className="text-cyan-500"/> {trackingResult.courier}
                                        </p>
                                    </div>
                                    <div className="w-full md:w-auto h-px md:h-10 bg-gray-100 md:w-px"></div>
                                    <div className="text-left md:text-right w-full md:w-auto">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">N° Seguimiento</p>
                                        <p className="font-mono font-black text-indigo-600 text-lg tracking-wider bg-indigo-50 px-3 py-1 rounded inline-block">
                                            {trackingResult.tracking_number}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* COLUMNA 2: FAQ (igual que antes) */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100">
                        {/* ... contenido FAQ ... */}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Envios;