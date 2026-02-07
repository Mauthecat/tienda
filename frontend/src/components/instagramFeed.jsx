import { Instagram } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';

// IMPORTANTE:
// Para que esto se vea profesional, descarga las 3 fotos de tu Instagram
// y guárdalas en src/assets/ (ej: insta1.jpg, insta2.jpg, insta3.jpg)
// O usa las URLs de Cloudinary si ya las subiste ahí.
import insta1 from '../assets/ins1.png'; // Reemplazar con tu foto real 1
import insta2 from '../assets/ins2.png'; // Reemplazar con tu foto real 2
import insta3 from '../assets/ins3.png'; // Reemplazar con tu foto real 3

const InstagramFeed = () => {

    // Array de configuración manual
    // id: único
    // img: la foto importada arriba
    // link: el enlace directo al post de Instagram
    // caption: texto opcional para accesibilidad (alt)
    const posts = [
        {
            id: 1,
            img: insta1,
            link: "https://www.instagram.com/p/DUMizOKEd4-/",
            caption: "Pack de cortadores Girasol"
        },
        {
            id: 2,
            img: insta2,
            link: "https://www.instagram.com/p/DT-rWOhDv0c/",
            caption: "Taller de arcilla polimérica"
        },
        {
            id: 3,
            img: insta3,
            link: "https://www.instagram.com/p/DT8lJT_kQEG/",
            caption: "Cortador Imperio"
        },
    ];

    return (
        <section className="w-full bg-white border-t border-cyan-100 mt-12 mb-12">
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
                                <h3 className="font-bold text-xl text-gray-800">@poli_cromica</h3>
                                <p className="text-gray-500 text-sm">¡Síguenos para novedades Semanales !</p>
                            </div>
                        </div>

                        <a
                            href="https://www.instagram.com/poli_cromica/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105 text-sm"
                        >
                            <Instagram size={18} />
                            Seguir en Instagram
                        </a>
                    </div>

                    {/* Grid de Imágenes - CAMBIO AQUÍ */}
                    {/* Antes: grid-cols-3 md:grid-cols-6 (6 fotos chicas) */}
                    {/* Ahora: grid-cols-1 md:grid-cols-3 (3 fotos grandes) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <a
                                key={post.id}
                                href={post.link}
                                target="_blank"
                                rel="noreferrer"
                                className="aspect-square relative group overflow-hidden rounded-2xl bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all"
                            >
                                {/* Imagen */}
                                <img
                                    src={post.img}
                                    alt={post.caption}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay al pasar el mouse */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
                                        <Instagram size={32} />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;