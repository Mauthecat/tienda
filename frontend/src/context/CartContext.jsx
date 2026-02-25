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
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
        setIsCartOpen(true); 
    };

    // NUEVO: Función para sumar o restar cantidad
    const updateQuantity = (productId, amount) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item => {
                if (item.id === productId) {
                    return { ...item, quantity: item.quantity + amount };
                }
                return item;
            });
            // Filtramos para eliminar los que lleguen a 0
            return updatedCart.filter(item => item.quantity > 0);
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
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
            updateQuantity, // Pasamos la nueva función aquí
            totalItems, 
            totalPrice, 
            isCartOpen, 
            setIsCartOpen 
        }}>
            {children}
        </CartContext.Provider>
    );
};