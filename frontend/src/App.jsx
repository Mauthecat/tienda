import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import { Settings } from 'lucide-react';

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
import Favoritos from './components/Favoritos';

const funnyPhrases = [
  "Despertando a los hámsteres del servidor...",
  "Amasando la arcilla polimérica...",
  "Afilando los cortadores...",
  "Buscando los aritos perdidos...",
  "Calculando cuántos aros caben en una caja...",
  "Pintando detallitos a mano...",
  "¡Casi listos para brillar!"
];

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showFancyLoading, setShowFancyLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(funnyPhrases[0]);
  const [progress, setProgress] = useState(0);

  const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://tienda-backend-fn64.onrender.com'
    : 'http://127.0.0.1:8000';

  useEffect(() => {
    const lastVisit = localStorage.getItem('policromica_last_visit');
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000; 
    
    const isFancy = !lastVisit || (now - parseInt(lastVisit)) > ONE_HOUR;
    setShowFancyLoading(isFancy);
    localStorage.setItem('policromica_last_visit', now.toString());

    let textInterval;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/`);
        const formattedData = response.data.map(item => ({
          ...item,
          price: parseFloat(item.price),
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

    if (isFancy) {
      // 1. Iniciamos la barra para que suba al 85% lentamente (simulando que está cargando)
      setTimeout(() => setProgress(85), 50);

      // 2. Cambiamos las frases cada 1.5 segundos
      let phraseIndex = 0;
      textInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % funnyPhrases.length;
        setLoadingText(funnyPhrases[phraseIndex]);
      }, 1500);

      // 3. Cuando la base de datos responda (no importa cuánto tarde)
      fetchProducts().then(() => {
        clearInterval(textInterval);
        setLoadingText("¡Listo!"); // Mensaje final
        setProgress(100); // Llenamos el 15% restante de golpe
        
        // Esperamos medio segundo para que el usuario alcance a ver la barra llena
        setTimeout(() => {
          setIsLoading(false);
        }, 500); 
      });

    } else {
      // Carga rápida: sin barra ni frases si entró hace poco
      fetchProducts().then(() => {
        setIsLoading(false);
      });
    }

    // Limpieza de seguridad
    return () => clearInterval(textInterval);
  }, []);

  const arosProducts = products.filter(p => p.category__name === 'Aros');
  const cortadoresProducts = products.filter(p => p.category__name === 'Cortadores');
  const destacadosProducts = products.filter(p => p.is_featured);
  const newArrivals = products.slice(-10);

  const heroSlides = [
    { image: logoImg, link: '/destacados', title: 'Destacados' },
    { image: arosBanner, link: '/aros', title: 'Aros' },
    { image: cortadoresBanner, link: '/cortadores', title: 'Cortadores' }
  ];

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#b3f3f5] flex flex-col w-full overflow-x-hidden">
          <Header products={products} />
          <CartDrawer /> 

          {isLoading ? (
            <div className="flex-grow flex flex-col items-center justify-center py-32 px-4 animate-in fade-in duration-500">
              {showFancyLoading ? (
                <div className="w-full max-w-md text-center">
                  <h2 className="text-xl md:text-2xl font-black text-cyan-900 uppercase tracking-widest mb-6 h-8 flex items-center justify-center">
                    {loadingText}
                  </h2>
                  <div className="w-full h-4 bg-cyan-100 rounded-full overflow-hidden shadow-inner p-0.5">
                    <div 
                      className="h-full bg-pink-500 rounded-full relative overflow-hidden"
                      style={{ 
                        width: `${progress}%`, 
                        // Truco CSS: Si llega a 100%, se llena rápido (0.4s). Si está en 85%, avanza muy lento (15s)
                        transition: `width ${progress === 100 ? '0.4s' : '15s'} cubic-bezier(0.1, 0.8, 0.3, 1)`
                      }}
                    >
                    </div>
                  </div>
                  <p className="text-pink-600/60 font-bold text-xs mt-4 uppercase tracking-widest animate-pulse">
                    Encendiendo los hornos...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Settings className="text-pink-400 animate-[spin_3s_linear_infinite]" size={40} />
                  <p className="text-cyan-800 font-bold uppercase tracking-widest text-sm animate-pulse">
                    Acomodando vitrina...
                  </p>
                </div>
              )}
            </div>
          ) : (
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

              <Route path="/aros" element={ <ProductPage title="Colección de Aros" products={arosProducts} bannerImage={arosBanner} /> } />
              <Route path="/cortadores" element={ <ProductPage title="Cortadores" products={cortadoresProducts} bannerImage={cortadoresBanner} /> } />
              <Route path="/producto/:id" element={<ProductDetail products={products} />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/perfil" element={<User />} />
              <Route path="/checkout/status" element={<CheckoutStatus />} />
              <Route path="/envios" element={<Envios />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/destacados" element={ <ProductPage title="Destacados de la Semana" products={destacadosProducts} bannerImage={logoImg} /> } />
            </Routes>
          )}

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App;