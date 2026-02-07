import { Instagram, Mail, MapPin, Phone, Heart } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-cyan-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* COLUMNA 1: Marca y Sobre Nosotros */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <img src={logoImg} alt="Policromica Logo" className="h-10 w-10 rounded-full object-cover border border-cyan-100" />
                            <span className="font-bold text-xl text-gray-800 tracking-wide">Policromica</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            Accesorios únicos y cortadores diseñados con pasión. Hecho a mano para resaltar tu estilo con un toque de arte y color.
                        </p>
                        <div className="flex gap-4">
                            {/* Redes Sociales */}
                            <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* COLUMNA 2: Enlaces Rápidos */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Tienda</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Inicio</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Aros de Arcilla</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cortadores</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Novedades</a></li>
                        </ul>
                    </div>

                    {/* COLUMNA 3: Ayuda / Legal */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Ayuda</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Envíos y Entregas</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cambios y Devoluciones</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Preguntas Frecuentes</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Términos y Condiciones</a></li>
                        </ul>
                    </div>

                    {/* COLUMNA 4: Contacto */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Contacto</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-[#e5c2bc] flex-shrink-0" />
                                <span>Rancagua, Chile (Envíos a todo el país)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-[#e5c2bc] flex-shrink-0" />
                                <a href="mailto:hola@policromica.cl" className="hover:text-indigo-600">mona@policromica.cl</a>
                            </li>
                            {/* Opcional: Teléfono si aplica */}
                            {/* <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#e5c2bc] flex-shrink-0" />
                <span>+56 9 1234 5678</span>
              </li> 
              */}
                        </ul>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-100 my-8"></div>

                {/* Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Policromica. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-1 mt-2 md:mt-0">
                        <span>Desarrollado por Xtek Spa</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;