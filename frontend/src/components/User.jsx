import { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, LogOut, Package, Settings, Heart, ShoppingCart, MapPin, Phone, Save, Loader2, CreditCard, Clock3 } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState('pedidos');
    const [isRetryingPayment, setIsRetryingPayment] = useState(false);
    
    const [orders, setOrders] = useState([]);
    const [favoritesPreview, setFavoritesPreview] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [profileData, setProfileData] = useState({ nombre: '', telefono: '', direccion: '', ciudad: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

    const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';

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
        try {
            await axios.post(`${BASE_URL}/api/profile/update/`, { email: user.email, ...profileData });
            alert("¡Tus datos han sido actualizados con éxito!");
            setActiveTab('pedidos');
        } catch (error) {
            alert("Error al guardar los datos. Intenta nuevamente.");
        }
        setSavingProfile(false);
    };

    const handleRetryPayment = async (orderId) => {
        setIsRetryingPayment(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/payment/retry/`, { order_id: orderId, email: user.email });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            alert(error.response?.data?.error || "Hubo un problema al reintentar el pago.");
        } finally {
            setIsRetryingPayment(false);
        }
    };

    useEffect(() => {
        if (user && user.email) {
            const fetchData = async () => {
                setLoadingData(true);
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
    }, [user, BASE_URL]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;

    if (user) {
        return (
            <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex justify-center items-start">
                <div className="max-w-5xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row items-start gap-10">

                            {/* Menú Lateral */}
                            <div className="w-full md:w-1/3 text-center md:border-r border-gray-100 md:pr-10 md:sticky top-24">
                                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                                    <UserIcon size={48} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">¡Hola, {profileData.nombre || 'Cata'}!</h2>
                                <p className="text-gray-500 text-xs mb-8 break-all">{user.email}</p>

                                <div className="space-y-3">
                                    <button onClick={() => setActiveTab('pedidos')} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-colors border ${activeTab === 'pedidos' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100'}`} >
                                        <Package size={16} /> Mis Pedidos
                                    </button>
                                    <button onClick={() => setActiveTab('ajustes')} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-colors border ${activeTab === 'ajustes' ? 'bg-cyan-50 text-cyan-800 border-cyan-100' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100'}`} >
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
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                                <Package className="text-cyan-500" /> Historial de Compras
                                            </h3>
                                            
                                            <div className="mb-6 bg-pink-50 border border-pink-100 p-4 rounded-xl text-pink-900 flex items-start gap-3">
                                                <Clock3 className="text-pink-400 mt-0.5" size={20} />
                                                <p className="text-xs leading-relaxed">Nota: Las órdenes que permanezcan en estado <span className="font-bold">Pendiente</span> por más de 6 horas serán canceladas por control de stock.</p>
                                            </div>

                                            {loadingData ? (
                                                <p className="text-sm text-gray-500">Cargando...</p>
                                            ) : orders.length === 0 ? (
                                                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                                    <p className="text-sm text-gray-500 italic">No registras pedidos aún.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                    {orders.map((order) => (
                                                        <div key={order.id} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${order.is_expired ? 'bg-gray-100 opacity-60' : 'bg-gray-50 border-gray-100 hover:shadow-md'}`}>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{order.order_number}</p>
                                                                <p className="text-xs text-gray-500">{order.date}</p>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-2">
                                                                <p className="font-bold text-cyan-600">${order.total}</p>
                                                                {order.raw_status === 'pendiente' && !order.is_expired ? (
                                                                    <button onClick={() => handleRetryPayment(order.id)} disabled={isRetryingPayment} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded-lg">
                                                                        {isRetryingPayment ? <Loader2 size={12} className="animate-spin"/> : 'Pagar Ahora'}
                                                                    </button>
                                                                ) : (
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-900 bg-cyan-100 px-2 py-1 rounded">{order.status}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Settings className="text-cyan-500" /> Ajustar mis Datos
                                        </h3>
                                        <form onSubmit={handleSaveProfile} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nombre</label>
                                                    <input type="text" name="nombre" value={profileData.nombre} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Teléfono</label>
                                                    <input type="text" name="telefono" value={profileData.telefono} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Dirección</label>
                                                <input type="text" name="direccion" value={profileData.direccion} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Ciudad</label>
                                                <input type="text" name="ciudad" value={profileData.ciudad} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-400" />
                                            </div>
                                            <button type="submit" disabled={savingProfile} className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors disabled:opacity-50" >
                                                {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <div className="w-full h-px bg-gray-100"></div>

                                {/* SECCIÓN FAVORITOS (Siempre Visible Abajo) */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                            <Heart className="text-pink-500 fill-pink-500" size={20} /> Mis Favoritos
                                        </h3>
                                        <Link to="/favoritos" className="text-xs font-bold text-indigo-600 hover:underline">Ver catálogo</Link>
                                    </div>
                                    
                                    {favoritesPreview.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">Aún no has guardado favoritos.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {favoritesPreview.map((fav) => (
                                                <div key={fav.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-pink-50">
                                                    <img src={fav.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={fav.name} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                        <p className="text-[10px] text-white font-bold truncate mb-2">{fav.name}</p>
                                                        <button onClick={() => addToCart(fav)} className="w-full bg-white text-indigo-600 text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-indigo-50 shadow-lg">
                                                            <ShoppingCart size={10} /> Al carro
                                                        </button>
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 animate-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#feecd4] text-orange-500 mb-4 shadow-sm">
                        {isLoginView ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">{isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLoginView && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><UserIcon size={18} /></div>
                            <input required={!isLoginView} type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu Nombre" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400" />
                        </div>
                    )}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg mt-2">{isLoginView ? 'Entrar' : 'Registrarse'}</button>
                </form>
                <div className="mt-8 text-center text-sm text-gray-600">
                    {isLoginView ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="ml-2 font-bold text-pink-600 hover:text-pink-700">{isLoginView ? 'Regístrate' : 'Inicia Sesión'}</button>
                </div>
                <div className="mt-6 text-center"><Link to="/" className="text-xs text-gray-400 hover:text-gray-600 underline">Volver a la tienda</Link></div>
            </div>
        </div>
    );
};

export default User;