import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';

import Header from './components/header';
import HeroCarousel from './components/heroCarousel';
import CategorySection from './components/categorySection';
import FullWidthCarousel from './components/fullWidthCarousel';
import InstagramFeed from './components/instagramFeed';
import Footer from './components/footer';
import ProductPage from './components/ProductPage';
import logoImg from './assets/logo.jpeg';
import arosBanner from './assets/portada_aros.png';
import cortadoresBanner from './assets/portada_cortadores.jpeg';
import ProductDetail from './components/ProductDetail'

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

          // Formateamos la imagen principal
          image: item.main_image
            ? (item.main_image.startsWith('http') ? item.main_image : `${BASE_URL}${item.main_image}`)
            : logoImg,

          // NUEVO: Formateamos el array con TODAS las imágenes
          images: item.all_images && item.all_images.length > 0
            ? item.all_images.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`)
            : [logoImg] // Fallback: si no tiene fotos, metemos el logo en un array
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
  const newArrivals = products.slice(-5);
  const heroImages = [logoImg, logoImg, logoImg];
  const heroSlides = [
    { image: logoImg, link: '/', title: 'Destacados' },           // Slide 1
    { image: arosBanner, link: '/aros', title: 'Aros' },          // Slide 2
    { image: cortadoresBanner, link: '/cortadores', title: 'Cortadores' } // Slide 3
  ];
  return (
    <div className="min-h-screen bg-[#b3f3f5] flex flex-col w-full overflow-x-hidden">
      <Header />

      <Routes>
        {/* CORRECCIÓN: Definimos el JSX directamente en element para evitar re-renderizados destructivos */}
        <Route path="/" element={
          <>
            <HeroCarousel images={heroSlides} />
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
        {/* --- NUEVA RUTA PARA EL PRODUCTO INDIVIDUAL --- */}
        <Route
          path="/producto/:id"
          element={<ProductDetail products={products} />}
        />
      </Routes>

      <Footer />
    </div>
  )
}

export default App;