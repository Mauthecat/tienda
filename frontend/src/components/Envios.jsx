import { useState } from 'react';
import { Truck, Search, Package, HelpCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';

const Envios = () => {
    const [trackingCode, setTrackingCode] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center justify-center gap-3">
                        <Truck className="text-pink-500" size={32} />
                        Envíos y Entregas
                    </h1>
                    <p className="text-gray-500">Rastrea tu paquete o resuelve tus dudas sobre nuestros tiempos de entrega.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* COLUMNA 1: RASTREO */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-cyan-100 h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Search className="text-cyan-500" />
                            Rastrea tu Pedido
                        </h2>
                        <form onSubmit={handleTrack} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Código de Rastreo</label>
                                <input 
                                    type="text" 
                                    value={trackingCode}
                                    onChange={(e) => setTrackingCode(e.target.value)}
                                    placeholder="Ej: POLI-15" 
                                    className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all uppercase"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-cyan-600/20"
                            >
                                {isLoading ? 'Buscando...' : 'Consultar Estado'}
                            </button>
                        </form>

                        {/* Resultado del rastreo */}
                        {error && <p className="mt-6 text-pink-600 text-sm font-medium p-4 bg-pink-50 rounded-xl">{error}</p>}
                        {trackingResult && (
                            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <Package className="text-gray-400" size={24} />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Orden</p>
                                        <p className="font-bold text-gray-900 text-lg">{trackingResult.order_number}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between border-b border-gray-200 pb-2">
                                        <span>Fecha:</span>
                                        <span className="font-medium text-gray-900">{trackingResult.date}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                        <span>Estado:</span>
                                        <span className="font-bold text-cyan-600 uppercase tracking-wider">{trackingResult.status}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA 2: PREGUNTAS FRECUENTES */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <HelpCircle className="text-pink-500" />
                            Preguntas Frecuentes
                        </h2>
                        
                        <div className="space-y-4">
                            <details className="group border border-gray-100 rounded-2xl bg-gray-50 cursor-pointer">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-800">
                                    <span>¿Por qué medio realizan los envíos?</span>
                                    <span className="transition group-open:rotate-180"><ChevronDown size={18} /></span>
                                </summary>
                                <div className="text-gray-600 text-sm mt-2 p-5 pt-0 leading-relaxed border-t border-gray-100">
                                    Realizamos nuestros envíos a todo Chile principalmente a través de Starken y Chilexpress. El cliente puede elegir la modalidad de pago en destino o pagado al momento de coordinar.
                                </div>
                            </details>

                            <details className="group border border-gray-100 rounded-2xl bg-gray-50 cursor-pointer">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-800">
                                    <span>¿Cuánto tarda en llegar mi pedido?</span>
                                    <span className="transition group-open:rotate-180"><ChevronDown size={18} /></span>
                                </summary>
                                <div className="text-gray-600 text-sm mt-2 p-5 pt-0 leading-relaxed border-t border-gray-100">
                                    Una vez confirmado el pago, tardamos entre 1 a 3 días hábiles en procesar y empacar tu pedido. El tiempo de tránsito de la empresa de transporte suele ser de 2 a 5 días hábiles dependiendo de la región.
                                </div>
                            </details>

                            <details className="group border border-gray-100 rounded-2xl bg-gray-50 cursor-pointer">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-gray-800">
                                    <span>¿Qué pasa si mi paquete llega dañado?</span>
                                    <span className="transition group-open:rotate-180"><ChevronDown size={18} /></span>
                                </summary>
                                <div className="text-gray-600 text-sm mt-2 p-5 pt-0 leading-relaxed border-t border-gray-100">
                                    En Policrómica empacamos todo con mucho cuidado. Si el producto llega dañado por mal manejo del transporte, contáctanos en las primeras 24 horas tras la recepción con fotos del producto y el embalaje para gestionar una solución.
                                </div>
                            </details>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Envios;