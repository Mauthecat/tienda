import { ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom'; // IMPORTANTE: Agregamos Link

const CategorySection = ({ title, buttonText, bannerImage, products, isReversed }) => {
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
            {/* Si es Aros, lleva a /aros. Si es Cortadores, lleva a /cortadores */}
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
          <div className="flex overflow-x-auto gap-4 pb-6 pt-2 px-2 snap-x" style={{ scrollbarWidth: 'thin', scrollbarColor: '#eba8a8 transparent' }}>
            
            {products.map((product) => (
              // CAMBIO: div por Link
              <Link 
                to={`/producto/${product.id}`} 
                key={product.id} 
                className="min-w-[200px] bg-[#feecd4] rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 snap-start border border-orange-100 flex flex-col justify-between group block"
              >
                
                <div className="relative h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden">
                   <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                   
                   <button 
                     onClick={(e) => e.preventDefault()} // Evita que al hacer clic en el botón, entres al producto
                     className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                   >
                     <ShoppingCart size={18} />
                   </button>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase font-bold">Stock</span>
                  </div>
                  
                  <button 
                    onClick={(e) => e.preventDefault()} // Evita que al hacer clic en el botón, entres al producto
                    className="w-full mt-3 bg-pink-100 text-pink-700 text-xs font-bold py-2 rounded-lg hover:bg-pink-200 transition-colors"
                  >
                    Añadir al Carro
                  </button>
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