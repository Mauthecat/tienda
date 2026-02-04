import { Instagram, ExternalLink } from 'lucide-react';
import logoImg from '../assets/logo.jpeg'; // Usamos el logo como foto de perfil por ahora

const InstagramFeed = () => {
  // Simulación de posts (en el futuro vendrían de la API)
  const posts = [1, 2, 3, 4, 5, 6]; 

  return (
    <section className="w-full bg-white border-t border-cyan-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Tarjeta Tipo Widget */}
            <div className="bg-[#feecd4]/30 rounded-3xl p-6 md:p-8 border border-[#feecd4]">
                
                {/* Cabecera del Widget */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full">
                            <img src={logoImg} alt="Policromica Profile" className="w-16 h-16 rounded-full border-2 border-white object-cover" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-xl text-gray-800">@policromica</h3>
                            <p className="text-gray-500 text-sm">¡Síguenos para novedades diarias!</p>
                        </div>
                    </div>
                    
                    <a 
                        href="https://instagram.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 text-sm"
                    >
                        <Instagram size={18} />
                        Seguir en Instagram
                    </a>
                </div>

                {/* Grid de Imágenes (Simulación Feed) */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                    {posts.map((post, index) => (
                        <div key={index} className="aspect-square relative group overflow-hidden rounded-xl bg-gray-200 cursor-pointer">
                            {/* Placeholder de imagen */}
                            <img 
                                src={`https://picsum.photos/400?random=${index}`} 
                                alt="Instagram Post" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            
                            {/* Overlay al pasar el mouse */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Instagram size={24} />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    </section>
  );
};

export default InstagramFeed;