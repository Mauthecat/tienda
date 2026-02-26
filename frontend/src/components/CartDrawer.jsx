import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'; // Agregamos Plus y Minus
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
    // Traemos updateQuantity del contexto
    const { cart, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    if (!isCartOpen) return null;

    const formattedTotal = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalPrice);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            ></div>

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

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

                                <div className="flex flex-col justify-between flex-1 py-1">
                                    <h3 className="font-bold text-gray-800 text-sm leading-tight pr-6">{item.name}</h3>

                                    {/* CONTROLES DE CANTIDAD */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold text-gray-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="font-bold text-pink-600">{item.price}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600 font-medium uppercase tracking-wider text-sm">Total</span>
                            <span className="text-2xl font-bold text-gray-900">{formattedTotal}</span>
                        </div>
                        <button
                            onClick={() => {
                                setIsCartOpen(false); // Cierra el drawer
                                navigate('/checkout'); // Navega al checkout
                            }}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                        >
                            Ir a Pagar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;