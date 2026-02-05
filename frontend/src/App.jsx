import { useState, useEffect } from 'react';
import axios from 'axios'; // Importamos el "mensajero"

import Header from './components/header';
import HeroCarousel from './components/heroCarousel';
import CategorySection from './components/categorySection';
import FullWidthCarousel from './components/fullWidthCarousel';
import InstagramFeed from './components/instagramFeed';
import Footer from './components/footer';
import logoImg from './assets/logo.jpeg';

function App() {
  // 1. ESTADO: Aquí guardaremos los datos que vengan de Django
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL de tu Backend (IMPORTANTE: Si subes a producción, esto cambiará)
  const BASE_URL = 'http://127.0.0.1:8000';

  // 2. EFECTO: Se ejecuta una vez cuando carga la página
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/`);

        // Transformamos los datos para que encajen con tu diseño
        const formattedData = response.data.map(item => ({
          ...item,
          // Formatear precio de 15000.00 a $15.000
          price: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
          // Arreglar la URL de la imagen (Django a veces manda ruta relativa)
          image: item.main_image ? (item.main_image.startsWith('http') ? item.main_image : `${BASE_URL}${item.main_image}`) : logoImg
        }));

        setProducts(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error conectando con Django:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 3. FILTROS: Separamos los productos por categoría según lo que creaste en el Admin
  // (Asegúrate que en el Admin las categorías se llamen "Aros" y "Cortadores" o ajusta aquí)
  const arosProducts = products.filter(p => p.category?.name === 'Aros');
  const cortadoresProducts = products.filter(p => p.category?.name === 'Cortadores');

  // Para novedades, simplemente tomamos los últimos 5 agregados (el array viene ordenado o usamos slice)
  const newArrivals = products.slice(-5);

  const heroImages = [logoImg, logoImg, logoImg];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#b3f3f5]">Cargando tienda...</div>;
  }

  return (
    <div className="min-h-screen bg-[#b3f3f5] flex flex-col">

      <Header />

      <HeroCarousel images={heroImages} />

      {/* Carrusel de Novedades (Usamos los datos reales) */}
      <FullWidthCarousel
        title="Novedades de la Semana"
        products={newArrivals.length > 0 ? newArrivals : products}
      />

      <main className="pb-10 flex-grow">

        {/* Sección Aritos */}
        <CategorySection
          title="Nuestros Aritos"
          buttonText="Ver Productos"
          bannerImage={logoImg}
          products={arosProducts.length > 0 ? arosProducts : products} // Fallback a todos si no hay filtro
          isReversed={false}
        />

        <div className="w-full h-px bg-cyan-900/10 max-w-7xl mx-auto my-8"></div>

        {/* Sección Cortadores */}
        <CategorySection
          title="Cortadores Exclusivos"
          buttonText="Ver Productos"
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