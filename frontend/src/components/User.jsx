import { useState } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, LogOut, ShoppingBag, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const User = () => {
    const { user, login, register, logout, loading } = useAuth();
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoginView) {
            const result = await login(formData.email, formData.password);
            if (result.success) navigate('/');
            else alert(result.error);
        } else {
            const result = await register(formData.nombre, formData.email, formData.password);
            if (result.success) navigate('/');
            else alert(result.error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

    // ==========================================
    // VISTA DE PERFIL (Si el usuario ya inició sesión)
    // ==========================================
    if (user) {
        return (
            <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-200 shadow-sm">
                        <UserIcon size={48} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">¡Hola de nuevo!</h2>
                    <p className="text-gray-500 text-sm mb-8">{user.email}</p>

                    <div className="space-y-3 mb-8">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={20} className="text-gray-400 group-hover:text-cyan-600" />
                                <span className="text-sm font-medium text-gray-700">Mis Pedidos</span>
                            </div>
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">Próximamente</span>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Settings size={20} className="text-gray-400 group-hover:text-cyan-600" />
                                <span className="text-sm font-medium text-gray-700">Ajustes de Cuenta</span>
                            </div>
                        </button>
                    </div>

                    <button 
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full flex items-center justify-center gap-2 text-pink-600 font-bold py-3 hover:bg-pink-50 rounded-2xl transition-colors border border-pink-100"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>

                    <div className="mt-6">
                        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 underline">Volver a vitrinear</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA DE LOGIN / REGISTRO (Si no hay usuario)
    // ==========================================
    return (
        <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 animate-in zoom-in-95 duration-300">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#feecd4] text-orange-500 mb-4 shadow-sm border border-orange-100">
                        {isLoginView ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">
                        {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {isLoginView ? 'Bienvenida de nuevo a Policromica' : 'Únete para guardar favoritos y comprar más rápido'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLoginView && (
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1 font-bold">Tu Nombre</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <UserIcon size={18} />
                                </div>
                                <input 
                                    required={!isLoginView} 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: María José" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" 
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1 font-bold">Email</label>
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
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1 font-bold">Contraseña</label>
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
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" 
                            />
                        </div>
                        {isLoginView && (
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs text-cyan-600 hover:text-cyan-700 font-bold">¿Olvidaste tu contraseña?</a>
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-all hover:-translate-y-1 shadow-lg shadow-gray-900/20 mt-2"
                    >
                        {isLoginView ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

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