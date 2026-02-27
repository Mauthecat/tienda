import { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, LogOut, Package, Settings, Heart, ShoppingCart, MapPin, Phone, Save, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import logoImg from '../assets/logo.jpeg';

const User = () => {
    const { user, login, register, logout, loading } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' o 'ajustes'
    
    // Estados para la pestaña de Pedidos
    const [orders, setOrders] = useState([]);
    const [favoritesPreview, setFavoritesPreview] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Estados para la pestaña de Ajustes
    const [profileData, setProfileData] = useState({ nombre: '', telefono: '', direccion: '', ciudad: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

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

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';
        try {
            await axios.post(`${BASE_URL}/api/profile/update/`, { email: user.email, ...profileData });
            alert("¡Tus datos han sido actualizados con éxito!");
            setActiveTab('pedidos'); // Volvemos al panel principal
        } catch (error) {
            alert("Error al guardar los datos. Intenta nuevamente.");
        }
        setSavingProfile(false);
    };

    useEffect(() => {
        if (user && user.email) {
            const fetchData = async () => {
                setLoadingData(true);
                const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';
                try {
                    const resOrders = await axios.get(`${BASE_URL}/api/orders/`, { params: { email: user.email } });
                    setOrders(resOrders.data);

                    const resFavs = await axios.get(`${BASE_URL}/api/favorites/`, { params: { email: user.email } });
                    const formattedFavs = resFavs.data.slice(0, 4).map(item => ({
                        ...item,
                        priceFormatted: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
                        imageUrl: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : logoImg,
                    }));
                    setFavoritesPreview(formattedFavs);

                    const resProfile = await axios.get(`${BASE_URL}/api/profile/`, { params: { email: user.email } });
                    setProfileData(resProfile.data);

                } catch (error) {
                    console.error("Error trayendo datos del usuario:", error);
                }
                setLoadingData(false);
            };
            fetchData();
        }
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

    if (user) {
        return (
            <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex justify-center items-start">
                <div className="max-w-5xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row items-start gap-10">

                            {/* Panel Izquierdo: Menú Lateral */}
                            <div className="w-full md:w-1/3 text-center md:border-r border-gray-100 md:pr-10 md:sticky top-24">
                                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                                    <UserIcon size={48} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Tu Perfil</h2>
                                <p className="text-gray-500 text-xs mb-8 break-all">{user.email}</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('pedidos')}
                                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-colors border ${activeTab === 'pedidos' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100'}`}
                                    >
                                        <Package size={16} /> Mis Pedidos
                                    </button>
                                    
                                    <button
                                        onClick={() => setActiveTab('ajustes')}
                                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-colors border ${activeTab === 'ajustes' ? 'bg-cyan-50 text-cyan-800 border-cyan-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100'}`}
                                    >
                                        <Settings size={16} /> Ajustar Datos
                                    </button>

                                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 text-pink-600 text-sm font-bold py-3 hover:bg-pink-50 rounded-xl transition-colors border border-pink-100 mt-8">
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>

                            {/* Panel Derecho Dinámico */}
                            <div className="w-full md:w-2/3 flex flex-col gap-10">
                                
                                {activeTab === 'pedidos' ? (
                                    <>
                                        {/* SECCIÓN ÓRDENES */}
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                                <Package className="text-cyan-500" /> Historial de Compras
                                            </h3>
                                            {loadingData ? (
                                                <p className="text-sm text-gray-500">Cargando...</p>
                                            ) : orders.length === 0 ? (
                                                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                                    <p className="text-sm text-gray-500">Aún no tienes pedidos registrados.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                    {orders.map((order, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
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

                                        <div className="w-full h-px bg-gray-100"></div>

                                        {/* SECCIÓN FAVORITOS (Mini Expositor) */}
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                                    <Heart className="text-pink-500" fill="currentColor" /> Mis Favoritos
                                                </h3>
                                                <Link to="/favoritos" className="text-xs text-indigo-600 font-bold hover:underline">
                                                    Ver todos
                                                </Link>
                                            </div>
                                            
                                            {loadingData ? (
                                                <p className="text-sm text-gray-500">Cargando...</p>
                                            ) : favoritesPreview.length === 0 ? (
                                                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                                    <p className="text-sm text-gray-500 mb-2">No tienes favoritos guardados.</p>
                                                    <Link to="/" className="text-xs text-pink-600 font-bold hover:underline">Ir a vitrinear</Link>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {favoritesPreview.map((fav) => (
                                                        <div key={fav.id} className="bg-white rounded-xl p-3 border border-pink-50 shadow-sm flex flex-col group relative">
                                                            <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                                                                <img src={fav.imageUrl} alt={fav.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); addToCart(fav); }}
                                                                    disabled={fav.stock === 0}
                                                                    className="absolute bottom-2 right-2 p-2 bg-indigo-600/90 backdrop-blur text-white rounded-full hover:bg-indigo-700 transition-all hover:scale-110 shadow-md disabled:opacity-50 disabled:bg-gray-400"
                                                                    title={fav.stock === 0 ? "Sin stock" : "Añadir al carrito"}
                                                                >
                                                                    <ShoppingCart size={14} />
                                                                </button>
                                                            </div>
                                                            <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-1">{fav.name}</h4>
                                                            <span className="text-xs font-black text-pink-500">{fav.priceFormatted}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    /* SECCIÓN AJUSTES */
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Settings className="text-cyan-500" /> Ajustes de Cuenta
                                        </h3>
                                        
                                        <form onSubmit={handleSaveProfile} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Tu Nombre</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><UserIcon size={16} /></div>
                                                        <input type="text" name="nombre" value={profileData.nombre} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Teléfono</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></div>
                                                        <input type="tel" name="telefono" value={profileData.telefono} onChange={handleProfileChange} placeholder="+56 9" className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Dirección de Envío Principal</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16} /></div>
                                                    <input type="text" name="direccion" value={profileData.direccion} onChange={handleProfileChange} placeholder="Calle, Número, Depto" className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Ciudad</label>
                                                <input type="text" name="ciudad" value={profileData.ciudad} onChange={handleProfileChange} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" required />
                                            </div>

                                            <div className="pt-4 border-t border-gray-200">
                                                <button 
                                                    type="submit" 
                                                    disabled={savingProfile}
                                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
                                                >
                                                    {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                            </div>
                                        </form>
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
    // VISTA DE LOGIN (El formulario original)
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
                                <input required={!isLoginView} type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: María José" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1 font-bold">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 ml-1 font-bold">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all shadow-sm" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-all hover:-translate-y-1 shadow-lg shadow-gray-900/20 mt-2">
                        {isLoginView ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="ml-2 font-bold text-pink-600 hover:text-pink-700 transition-colors">
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