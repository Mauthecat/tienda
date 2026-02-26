import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';

// IMPORTAMOS EL CEREBRO DEL CARRITO
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import HeroCarousel from './components/heroCarousel';
import CategorySection from './components/categorySection';
import FullWidthCarousel from './components/fullWidthCarousel';
import InstagramFeed from './components/instagramFeed';
import Footer from './components/footer';
import ProductPage from './components/ProductPage';
import ProductDetail from './components/ProductDetail';
import logoImg from './assets/logo.jpeg';
import arosBanner from './assets/portada_aros.png';
import cortadoresBanner from './assets/portada_cortadores.jpeg';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Contact from './components/Contact';
import { AuthProvider } from './context/AuthContext';
import User from './components/User';
import CheckoutStatus from './components/CheckoutStatus';
import Envios from './components/Envios';

function App() {
  const [products, setProducts] = useState([]);

  const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://tienda-backend-fn64.onrender.com'
    : 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/`);
        const formattedData = response.data.map(item => ({
          ...item,
          price: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
          image: item.main_image
            ? (item.main_image.startsWith('http') ? item.main_image : `${BASE_URL}${item.main_image}`)
            : logoImg,
          images: item.all_images && item.all_images.length > 0
            ? item.all_images.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`)
            : [logoImg]
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error("Error conectando con Django:", error);
      }
    };
    fetchProducts();
  }, []);

  const arosProducts = products.filter(p => p.category__name === 'Aros');
  const cortadoresProducts = products.filter(p => p.category__name === 'Cortadores');
  const newArrivals = products.slice(-10);

  const heroSlides = [
    { image: logoImg, link: '/', title: 'Destacados' },
    { image: arosBanner, link: '/aros', title: 'Aros' },
    { image: cortadoresBanner, link: '/cortadores', title: 'Cortadores' }
  ];

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#b3f3f5] flex flex-col w-full overflow-x-hidden">
          <Header products={products} />
          <CartDrawer /> {/* <-- NUEVO: Agregamos el cajón del carrito aquí */}

          <Routes>
            <Route path="/" element={
              <>
                <HeroCarousel slides={heroSlides} />
                <FullWidthCarousel title="Novedades de la Semana" products={newArrivals} />
                <main className="pb-10 flex-grow">
                  <CategorySection
                    title="Nuestros Aritos"
                    buttonText="Ver Aritos"
                    bannerImage={arosBanner}
                    products={arosProducts}
                    isReversed={false}
                  />
                  <div className="w-full h-px bg-cyan-900/10 max-w-7xl mx-auto my-8"></div>
                  <CategorySection
                    title="Cortadores Exclusivos"
                    buttonText="Ver Todos"
                    bannerImage={cortadoresBanner}
                    products={cortadoresProducts}
                    isReversed={true}
                  />
                </main>
                <InstagramFeed />
              </>
            } />

            <Route
              path="/aros"
              element={
                <ProductPage
                  title="Colección de Aros"
                  products={arosProducts}
                  bannerImage={arosBanner}
                />
              }
            />

            <Route
              path="/cortadores"
              element={
                <ProductPage
                  title="Cortadores"
                  products={cortadoresProducts}
                  bannerImage={cortadoresBanner}
                />
              }
            />

            <Route
              path="/producto/:id"
              element={<ProductDetail products={products} />}
            />
            <Route
              path="/checkout"
              element={<Checkout />}
            />
            <Route
              path="/contacto"
              element={<Contact />}
            />
            <Route
              path="/perfil"
              element={<User />}
            />
            <Route
              path="/checkout/status"
              element={<CheckoutStatus />}
            />
            <Route path="/envios" element={<Envios />} />
          </Routes>
          

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App;