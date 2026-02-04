import { ChevronRight, Heart, ShoppingCart } from 'lucide-react';

const CategorySection = ({ title, buttonText, bannerImage, products, isReversed }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Título de la Sección fuera de la tarjeta (Opcional, estilo referencia) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
        {title} <Heart className="text-pink-500 fill-pink-500 w-5 h-5" />
      </h2>

      {/* CONTENEDOR FLEX: Aquí ocurre la magia del orden */}
      <div className={`flex flex-col md:flex-row gap-6 ${isReversed ? 'md:flex-row-reverse' : ''}`}>
        
        {/* === 1. TARJETA BANNER (Izquierda o Derecha según isReversed) === */}
        {/* md:w-1/3 define que ocupe un tercio del ancho en PC */}
        <div className="w-full md:w-1/3 relative h-[400px] md:h-auto rounded-3xl overflow-hidden shadow-xl group">
          <img 
            src={bannerImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Degradado negro abajo para que se lea el botón */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Botón en la parte inferior (Tu requerimiento) */}
          <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center">
            <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-[#feecd4] transition-all shadow-lg transform hover:-translate-y-1 w-full md:w-auto uppercase text-sm tracking-widest">
              {buttonText}
            </button>
          </div>
        </div>

        {/* === 2. CARRUSEL DE PRODUCTOS (El resto del espacio) === */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          
          {/* Contenedor con Scroll Horizontal (snap-x para efecto magnético) */}
          <div className="flex overflow-x-auto gap-4 pb-6 pt-2 px-2 snap-x" style={{ scrollbarWidth: 'thin', scrollbarColor: '#eba8a8 transparent' }}>
            
            {products.map((product) => (
              // Tarjeta de Producto Individual
              <div key={product.id} className="min-w-[200px] bg-[#feecd4] rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 snap-start border border-orange-100 flex flex-col justify-between group">
                
                {/* Foto Producto */}
                <div className="relative h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                   {/* Usamos bannerImage temporalmente si el producto no tiene foto */}
                   <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                   
                   {/* Botón flotante de añadir rápido */}
                   <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50">
                     <ShoppingCart size={18} />
                   </button>
                </div>

                {/* Info Producto */}
                <div>
                  <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase font-bold">Stock</span>
                  </div>
                  
                  {/* Botón Añadir (Visible siempre) */}
                  <button className="w-full mt-3 bg-pink-100 text-pink-700 text-xs font-bold py-2 rounded-lg hover:bg-pink-200 transition-colors">
                    Añadir al Carro
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategorySection;