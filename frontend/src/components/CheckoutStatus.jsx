import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

const CheckoutStatus = () => {
    const { clearCart } = useCart();
    
    // Capturamos el código POLI-XXX de la URL (lo mandó Django)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderNumber = queryParams.get('order');

    useEffect(() => {
        clearCart();
    }, []);

    return (
        <div className="min-h-screen bg-[#b3f3f5] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-6 shadow-sm border border-green-200">
                    <CheckCircle size={40} />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    ¡Pago Exitoso!
                </h1>
                
                {orderNumber && (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 my-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Número de Pedido</p>
                        <p className="text-2xl font-black text-cyan-600 flex justify-center items-center gap-2">
                            <Package size={24} /> {orderNumber}
                        </p>
                    </div>
                )}
                
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    Guarda tu número de pedido para rastrearlo en la sección de Envíos. Igualmente te llegará una copia a tu correo con tu boleta digital y los detalles de tu compra.
                </p>
                
                <Link 
                    to="/envios"
                    className="w-full inline-flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                >
                    Rastrear Pedido <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default CheckoutStatus;