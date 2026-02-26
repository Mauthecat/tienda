import { useState } from 'react';
import { Mail, MapPin, Send, Instagram, Sparkles } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí luego conectaremos el envío de correos (ej: con EmailJS o Django)
        console.log("Mensaje a enviar:", formData);
        alert("¡Gracias por escribirnos! Te responderemos pronto.");
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' }); // Limpia el formulario
    };

    return (
        <div className="min-h-screen bg-[#b3f3f5] pt-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Título de la página */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-widest flex items-center justify-center gap-3">
                        <Sparkles className="text-pink-500" />
                        Contacto & Nosotros
                        <Sparkles className="text-pink-500" />
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Contenedor de 2 columnas (1 en móvil) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* COLUMNA IZQUIERDA: Quiénes Somos */}
                    <div className="flex flex-col justify-center space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider mb-4">
                                ¿Quiénes Somos?
                            </h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                En <strong className="text-pink-600">Policrómica</strong>, creemos que los accesorios son una forma de expresión artística. Nos dedicamos a diseñar y crear aros artesanales y cortadores exclusivos con dedicación, amor y un enfoque en los pequeños detalles.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Cada pieza que sale de nuestro taller está pensada para aportar color, originalidad y estilo a tu día a día. Ya sea que busques el par de aros perfecto o las herramientas para crear tus propias obras, aquí encontrarás calidad y diseño único.
                            </p>
                        </div>

                        {/* Datos de Contacto Directo */}
                        <div className="bg-[#feecd4] p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-4 text-gray-800">
                                <div className="bg-white p-3 rounded-full shadow-sm text-cyan-600">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wider">Ubicación</p>
                                    <p className="text-gray-600">Rancagua, Chile</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-gray-800">
                                <div className="bg-white p-3 rounded-full shadow-sm text-pink-500">
                                    <Instagram size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wider">Instagram</p>
                                    <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">@poli_cromica</a>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Formulario */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider text-center">
                            Envíanos un mensaje
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Tu Nombre</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: María José" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Tu Email</label>
                                <input 
                                    required 
                                    type="email" 
                                    name="email" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Asunto</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="asunto" 
                                    value={formData.asunto}
                                    onChange={handleChange}
                                    placeholder="¿En qué te podemos ayudar?" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Mensaje</label>
                                <textarea 
                                    required 
                                    name="mensaje" 
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    rows="4" 
                                    placeholder="Escribe tu mensaje aquí..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all resize-none" 
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2 mt-4"
                            >
                                <Send size={18} />
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;