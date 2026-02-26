import { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, LogOut, Package, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const User = () => {
    const { user, login, register, logout, loading } = useAuth();
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

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

    // Traer el historial real de pedidos al entrar al perfil
    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                const BASE_URL = import.meta.env.MODE === 'production' 
                    ? 'https://tienda-backend-fn64.onrender.com' 
                    : 'http://127.0.0.1:8000';
                try {
                    const res = await axios.get(`${BASE_URL}/api/orders/`, { params: { email: user.email } });
                    setOrders(res.data);
                } catch (error) {
                    console.error("Error trayendo pedidos:", error);
                }
                setLoadingOrders(false);
            };
            fetchOrders();
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

    // ==========================================
    // VISTA DE PERFIL (Si el usuario ya inició sesión)
    // ==========================================
    if (user) {
        return (
            <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex justify-center items-start">
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            
                            {/* Panel Izquierdo: Datos de Usuario */}
                            <div className="w-full md:w-1/3 text-center md:border-r border-gray-100 md:pr-8">
                                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                                    <UserIcon size={48} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Tu Perfil</h2>
                                <p className="text-gray-500 text-xs mb-6 break-all">{user.email}</p>
                                
                                <button className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors mb-3">
                                    <Settings size={16} /> Ajustes
                                </button>
                                
                                <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 text-pink-600 text-sm font-bold py-3 hover:bg-pink-50 rounded-xl transition-colors border border-pink-100">
                                    <LogOut size={16} /> Cerrar Sesión
                                </button>
                            </div>

                            {/* Panel Derecho: Historial de Pedidos */}
                            <div className="w-full md:w-2/3">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <Package className="text-cyan-500" /> Mis Pedidos
                                </h3>
                                
                                {loadingOrders ? (
                                    <p className="text-sm text-gray-500">Cargando historial...</p>
                                ) : orders.length === 0 ? (
                                    <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-4">Aún no tienes pedidos registrados.</p>
                                        <Link to="/" className="text-xs text-indigo-600 font-bold hover:underline">Ir a la tienda</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {orders.map((order, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-all">
                                                <div>
                                                    <p className="font-bold text-gray-900">{order.order_number}</p>
                                                    <p className="text-xs text-gray-500">{order.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-cyan-600">${order.total}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-pink-500 mt-1 bg-pink-50 inline-block px-2 py-1 rounded">{order.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
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