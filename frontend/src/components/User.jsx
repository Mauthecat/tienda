import { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const User = () => {
    // Estado temporal para alternar entre "Iniciar Sesión" y "Registrarse"
    const [isLoginView, setIsLoginView] = useState(true);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoginView) {
            console.log("Intentando iniciar sesión con:", formData.email);
            alert("Aquí conectaremos con Django para validar el token JWT.");
        } else {
            console.log("Intentando crear cuenta para:", formData);
            alert("Aquí conectaremos con Django para crear el usuario en la base de datos.");
        }
    };

    return (
        <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 animate-in zoom-in-95 duration-300">
                
                {/* Cabecera */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#feecd4] text-orange-500 mb-4 shadow-sm border border-orange-100">
                        {isLoginView ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">
                        {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {isLoginView 
                            ? 'Bienvenida de nuevo a Policromica' 
                            : 'Únete para guardar favoritos y comprar más rápido'}
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Campo Nombre (Solo visible en Registro) */}
                    {!isLoginView && (
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Tu Nombre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <UserIcon size={18} />
                                </div>
                                <input 
                                    required 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: María José" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                                />
                            </div>
                        </div>
                    )}

                    {/* Campo Email */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                required 
                                type="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                            />
                        </div>
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input 
                                required 
                                type="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all" 
                            />
                        </div>
                        {isLoginView && (
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">¿Olvidaste tu contraseña?</a>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-transform hover:-translate-y-1 shadow-lg shadow-gray-900/20 mt-2"
                    >
                        {isLoginView ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                {/* Alternar Vista */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    <button 
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="ml-2 font-bold text-pink-600 hover:text-pink-700 transition-colors"
                    >
                        {isLoginView ? 'Regístrate aquí' : 'Inicia Sesión'}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 underline">Volver a la tienda</Link>
                </div>
            </div>
        </div>
    );
};

export default User;