import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
    const { cart, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    if (!isCartOpen) return null;

    // Formatear el total a pesos chilenos
    const formattedTotal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Fondo oscuro borroso */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Panel lateral blanco */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Cabecera del carrito */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag /> Tu Carrito
                    </h2>
                    <button 
                        onClick={() => setIsCartOpen(false)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <ShoppingBag size={64} className="opacity-20" />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 relative group">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-white" />
                                <div className="flex flex-col justify-between flex-1">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm leading-tight pr-6">{item.name}</h3>
                                        <p className="text-gray-500 text-xs mt-1">Cant: {item.quantity}</p>
                                    </div>
                                    <div className="font-bold text-pink-600">{item.price}</div>
                                </div>
                                {/* Botón eliminar */}
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Pie del carrito (Total y Pagar) */}
                {cart.length > 0 && (
                    <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium uppercase tracking-wider text-sm">Total</span>
                            <span className="text-2xl font-bold text-gray-900">{formattedTotal}</span>
                        </div>
                        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20">
                            Ir a Pagar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;