import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const CheckoutStatus = () => {
    const { clearCart } = useCart();

    // En cuanto el componente carga (el usuario vuelve de Flow), vaciamos el carrito.
    useEffect(() => {
        clearCart();
    }, []);

    return (
        <div className="min-h-screen bg-[#b3f3f5] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-6 shadow-sm">
                    <CheckCircle size={40} />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    ¡Orden Recibida!
                </h1>
                
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    Hemos procesado tu pago correctamente. Recibirás un correo electrónico muy pronto con los detalles de tu compra y el seguimiento del envío.
                </p>
                
                <Link 
                    to="/"
                    className="w-full inline-flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                >
                    Volver al inicio <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default CheckoutStatus;