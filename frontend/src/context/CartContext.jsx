import { createContext, useState, useEffect, useContext } from 'react';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.id === product.id);

            if (existingProduct) {
                // VERIFICACIÓN DE STOCK: Si al sumar se pasa del stock, bloqueamos
                if (existingProduct.quantity + quantity > product.stock) {
                    alert(`¡Lo sentimos! Solo nos quedan ${product.stock} unidades de ${product.name} en stock.`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }

            // VERIFICACIÓN DE STOCK PARA PRODUCTOS NUEVOS
            if (quantity > product.stock) {
                alert(`¡Lo sentimos! Solo nos quedan ${product.stock} unidades de ${product.name} en stock.`);
                return prevCart;
            }

            return [...prevCart, { ...product, quantity }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (productId, amount) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + amount;

                    // VERIFICACIÓN DE STOCK EN EL BOTÓN "+" DEL CARRITO
                    if (amount > 0 && newQuantity > item.stock) {
                        alert(`Has alcanzado el límite de stock disponible para ${item.name}.`);
                        return item;
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            return updatedCart.filter(item => item.quantity > 0);
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
    const clearCart = () => {
        setCart([]);
    };
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = cart.reduce((total, item) => {
        const priceNum = parseInt(item.price.replace(/\D/g, '')) || 0;
        return total + (priceNum * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};