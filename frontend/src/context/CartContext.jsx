import { createContext, useState, useEffect, useContext } from 'react';

// Creamos el contexto
export const CartContext = createContext();

// Un hook personalizado para usar el carrito fácilmente
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // 1. Iniciar el carrito buscando si hay algo guardado en el navegador (LocalStorage)
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Cada vez que 'cart' cambia, lo guardamos en el navegador
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // 3. Función para añadir productos
    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            // Revisamos si el producto ya está en el carro
            const existingProduct = prevCart.find(item => item.id === product.id);
            if (existingProduct) {
                // Si existe, le sumamos la cantidad nueva
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            // Si no existe, lo agregamos como nuevo
            return [...prevCart, { ...product, quantity }];
        });
    };

    // 4. Función para quitar productos
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // 5. Calcular cuántos ítems en total hay para el globito del Header
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};