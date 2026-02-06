import { useState, useEffect } from 'react';
import axios from 'axios'; 

import Header from './components/header';
import HeroCarousel from './components/heroCarousel';
import CategorySection from './components/categorySection';
import FullWidthCarousel from './components/fullWidthCarousel';
import InstagramFeed from './components/instagramFeed';
import Footer from './components/footer';
import logoImg from './assets/logo.jpeg';

function App() {
  const [products, setProducts] = useState([]);
  // Eliminamos el estado 'loading' bloqueante, dejamos solo un indicador visual opcional si quisieras
  
  const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://tienda-backend-fn64.onrender.com'
    : 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/`);
        
        const formattedData = response.data.map(item => ({
          ...item,
          // Formateo de precio
          price: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
          // Lógica de imagen: Si viene de Django usa la URL, si no, usa el logo por defecto
          image: item.main_image 
            ? (item.main_image.startsWith('http') ? item.main_image : `${BASE_URL}${item.main_image}`) 
            : logoImg
        }));

        setProducts(formattedData);
      } catch (error) {
        console.error("Error conectando con Django:", error);
      }
    };

    fetchProducts();
  }, []);

  // --- CORRECCIÓN AQUÍ ---
  // El backend manda 'category__name', no 'category.name'
  const arosProducts = products.filter(p => p.category__name === 'Aros');
  const cortadoresProducts = products.filter(p => p.category__name === 'Cortadores');
  
  const newArrivals = products.slice(-5);
  const heroImages = [logoImg, logoImg, logoImg];

  return (
    <div className="min-h-screen bg-[#b3f3f5] flex flex-col w-full overflow-x-hidden">
      <Header />

      <HeroCarousel images={heroImages} />

      {/* Si no hay productos aún, pasamos array vacío y el componente sabrá qué hacer */}
      <FullWidthCarousel 
        title="Novedades de la Semana" 
        products={newArrivals.length > 0 ? newArrivals : []} 
      />

      <main className="pb-10 flex-grow">
        
        {/* Sección Aritos */}
        <CategorySection 
          title="Nuestros Aritos"
          buttonText="Ver Aritos"
          bannerImage={logoImg} // Esta imagen DEBE cargar si carga en el Header
          products={arosProducts} // Ahora sí debería tener datos
          isReversed={false}
        />

        <div className="w-full h-px bg-cyan-900/10 max-w-7xl mx-auto my-8"></div>

        {/* Sección Cortadores */}
        <CategorySection 
          title="Cortadores Exclusivos"
          buttonText="Ver Todos"
          bannerImage={logoImg}
          products={cortadoresProducts}
          isReversed={true}
        />

      </main>

      <InstagramFeed />
      <Footer />
    </div>
  )
}

export default App;