import { Heart } from 'lucide-react'; // Quitamos ShoppingCart y ChevronRight
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // IMPORTAMOS EL CONTEXTO DEL CARRITO

const CategorySection = ({ title, buttonText, bannerImage, products, isReversed }) => {
  const { addToCart } = useCart(); // Extraemos la función para añadir al carro

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
        {title} <Heart className="text-pink-500 fill-pink-500 w-5 h-5" />
      </h2>

      <div className={`flex flex-col md:flex-row gap-6 ${isReversed ? 'md:flex-row-reverse' : ''}`}>
        
        {/* TARJETA BANNER */}
        <div className="w-full md:w-1/3 relative h-[400px] md:h-auto rounded-3xl overflow-hidden shadow-xl group">
          <img 
            src={bannerImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center">
            <Link 
              to={title.includes('Aritos') ? '/aros' : '/cortadores'}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-[#feecd4] transition-all shadow-lg transform hover:-translate-y-1 w-full md:w-auto text-center uppercase text-sm tracking-widest"
            >
              {buttonText}
            </Link>
          </div>
        </div>

        {/* CARRUSEL DE PRODUCTOS */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          
          {/* Se aplicó scrollbar-hide y snap-mandatory para el deslizamiento magnético */}
          <div 
            className="flex overflow-x-auto gap-4 pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-hide" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            
            {products.map((product) => (
              <Link 
                to={`/producto/${product.id}`} 
                key={product.id} 
                // Se agregó flex-shrink-0 y se redujo el padding inferior (pb-2)
                className="block flex-shrink-0 min-w-[200px] md:min-w-[230px] bg-[#feecd4] rounded-2xl shadow-sm hover:shadow-xl transition-all p-3 pb-2 snap-start snap-always border border-orange-100 flex flex-col justify-between group cursor-pointer"
              >
                
                <div className="relative h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                   <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={product.name} 
                   />
                   {/* SE ELIMINÓ EL BOTÓN DEL CARRITO FLOTANTE AQUÍ */}
                </div>

                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                      {/* SE ELIMINÓ LA ETIQUETA DE STOCK AQUÍ */}
                    </div>
                  </div>
                  
                  {/* NUEVO BOTÓN CÁPSULA: Ver Detalles / Añadir al carro */}
                  <div className="mt-3 flex items-center justify-center w-full bg-white rounded-full overflow-hidden shadow-sm border border-orange-100">
                      <span className="flex-1 text-center py-2 text-cyan-800 text-[11px] md:text-xs font-bold hover:bg-orange-50 hover:text-indigo-600 transition-colors">
                          Ver Detalles
                      </span>
                      
                      {/* Separador diagonal minimalista */}
                      <span className="text-orange-300 font-light text-xs select-none">/</span>
                      
                      <button
                          onClick={(e) => {
                              e.preventDefault(); // Evita navegar a la página del producto al hacer clic aquí
                              addToCart(product); // Llama a la lógica del carrito fantasma
                          }}
                          className="flex-1 text-center py-2 text-pink-600 text-[11px] md:text-xs font-bold hover:bg-orange-50 hover:text-pink-700 transition-colors"
                      >
                          Añadir al carro
                      </button>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategorySection;