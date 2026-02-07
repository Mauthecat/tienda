import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';

import Header from './components/header';
import HeroCarousel from './components/heroCarousel';
import CategorySection from './components/categorySection';
import FullWidthCarousel from './components/fullWidthCarousel';
import InstagramFeed from './components/instagramFeed';
import Footer from './components/footer';
import ProductPage from './components/ProductPage'; // Nuevo componente
import logoImg from './assets/logo.jpeg';

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
            : logoImg
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error("Error conectando con Django:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filtramos datos para pasarlos a las páginas
  const arosProducts = products.filter(p => p.category__name === 'Aros');
  const cortadoresProducts = products.filter(p => p.category__name === 'Cortadores');
  const newArrivals = products.slice(-5);
  const heroImages = [logoImg, logoImg, logoImg];

  // Componente interno para la PORTADA (Lo que ya tenías)
  const HomePage = () => (
    <>
      <HeroCarousel images={heroImages} />
      <FullWidthCarousel title="Novedades de la Semana" products={newArrivals} />
      <main className="pb-10 flex-grow">
        <CategorySection
          title="Nuestros Aritos"
          buttonText="Ver Aritos"
          bannerImage={logoImg}
          products={arosProducts}
          isReversed={false}
        />
        <div className="w-full h-px bg-cyan-900/10 max-w-7xl mx-auto my-8"></div>
        <CategorySection
          title="Cortadores Exclusivos"
          buttonText="Ver Todos"
          bannerImage={logoImg}
          products={cortadoresProducts}
          isReversed={true}
        />
      </main>
      <InstagramFeed />
    </>
  );

  return (

    <div className="min-h-screen bg-[#b3f3f5] flex flex-col w-full overflow-x-hidden">
      {/* El Header siempre se muestra */}
      <Header />

      <Routes>
        {/* RUTA 1: Inicio */}
        <Route path="/" element={<HomePage />} />

        {/* RUTA 2: Catálogo Aros */}
        <Route
          path="/aros"
          element={
            <ProductPage
              title="Colección de Aros"
              products={arosProducts}
              bannerImage={logoImg}
            />
          }
        />

        {/* RUTA 3: Catálogo Cortadores */}
        <Route
          path="/cortadores"
          element={
            <ProductPage
              title="Cortadores & Herramientas"
              products={cortadoresProducts}
              bannerImage={logoImg}
            />
          }
        />
      </Routes>

      {/* El Footer siempre se muestra */}
      <Footer />
    </div>
  )
}

export default App;