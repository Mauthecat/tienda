import { useState, useEffect } from 'react';
import { 
    Mail, Lock, User as UserIcon, LogIn, UserPlus, LogOut, 
    Package, Settings, Heart, ShoppingCart, Save, Loader2, 
    CreditCard, Clock3, ChevronDown, Truck, MapPin, Phone 
} from 'lucide-react';
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

    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    const [profileData, setProfileData] = useState({ nombre: '', telefono: '', direccion: '', ciudad: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

    const BASE_URL = import.meta.env.MODE === 'production' ? 'https://tienda-backend-fn64.onrender.com' : 'http://127.0.0.1:8000';

    const toggleOrderDetails = async (orderId, orderNumber) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            setOrderDetails(null);
            return;
        }
        
        setExpandedOrderId(orderId);
        setOrderDetails(null); 
        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${BASE_URL}/api/track/`, { 
                params: { code: orderNumber },
                headers: headers
            });
            if (res.data.success) {
                setOrderDetails(res.data);
            }
        } catch (e) {
            console.error("Error cargando detalles del pedido", e);
        }
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

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.post(`${BASE_URL}/api/profile/update/`, 
                { email: user.email, ...profileData },
                { headers: headers }
            );
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
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(`${BASE_URL}/api/payment/retry/`, 
                { order_id: orderId, email: user.email },
                { headers: headers }
            );
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
                    const token = localStorage.getItem('access_token');
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    
                    const resOrders = await axios.get(`${BASE_URL}/api/orders/`, { params: { email: user.email }, ...config });
                    setOrders(resOrders.data);

                    const resFavs = await axios.get(`${BASE_URL}/api/favorites/`, { params: { email: user.email }, ...config });
                    const formattedFavs = resFavs.data.slice(0, 4).map(item => ({
                        ...item,
                        priceFormatted: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.price),
                        imageUrl: item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : logoImg,
                    }));
                    setFavoritesPreview(formattedFavs);

                    const resProfile = await axios.get(`${BASE_URL}/api/profile/`, { params: { email: user.email }, ...config });
                    setProfileData(resProfile.data);

                } catch (error) {
                    console.error("Error trayendo datos del usuario:", error);
                }
                setLoadingData(false);
            };
            fetchData();
        }
    }, [user, BASE_URL]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 italic">Conectando con Policrómica...</div>;

    if (user) {
        return (
            <div className="min-h-screen bg-[#b3f3f5] py-12 px-4 flex justify-center items-start">
                <div className="max-w-5xl w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-10 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col md:flex-row items-start gap-10">

                            <div className="w-full md:w-1/3 text-center md:border-r border-gray-100 md:pr-10 md:sticky top-24">
                                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200 shadow-sm">
                                    <UserIcon size={48} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">¡Hola, {profileData.nombre?.split(' ')[0] || 'Cliente'}!</h2>
                                <p className="text-gray-500 text-xs mb-8 break-all font-medium">{user.email}</p>

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

                            <div className="w-full md:w-2/3 flex flex-col gap-10">
                                
                                {activeTab === 'pedidos' && (
                                    <section className="animate-in slide-in-from-right duration-300">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Package className="text-cyan-500" /> Historial de Compras
                                        </h3>
                                        
                                        <div className="mb-6 bg-pink-50 border border-pink-100 p-4 rounded-xl text-pink-900 flex items-start gap-3">
                                            <Clock3 className="text-pink-400 mt-0.5" size={20} />
                                            <p className="text-xs leading-relaxed">Nota: Las órdenes que permanezcan en estado <span className="font-bold">Pendiente</span> por más de 6 horas se cancelan automáticamente.</p>
                                        </div>

                                        {loadingData && (
                                            <p className="text-sm text-gray-500">Cargando...</p>
                                        )}

                                        {!loadingData && orders.length === 0 && (
                                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                                                <p className="text-sm text-gray-500 italic">No registras pedidos aún.</p>
                                            </div>
                                        )}

                                        {!loadingData && orders.length > 0 && (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {orders.map((order) => (
                                                    <div key={order.id} className={`border rounded-2xl overflow-hidden transition-all ${order.is_expired ? 'bg-gray-100 opacity-60' : 'bg-white hover:border-indigo-200 shadow-sm'}`}>
                                                        <div 
                                                            onClick={() => toggleOrderDetails(order.id, order.order_number)}
                                                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="space-y-1">
                                                                <p className="font-black text-gray-900 tracking-tight">{order.order_number}</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{order.date}</p>
                                                            </div>
                                                            <div className="text-right flex items-center gap-4">
                                                                <div>
                                                                    <p className="font-bold text-gray-900">${new Intl.NumberFormat('es-CL').format(order.total)}</p>
                                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${order.raw_status === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <ChevronDown size={18} className={`text-gray-300 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {expandedOrderId === order.id && (
                                                            <div className="p-4 pt-0 bg-gray-50/30 border-t border-gray-100 animate-in slide-in-from-top duration-200">
                                                                {!orderDetails ? (
                                                                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-300" size={20} /></div>
                                                                ) : (
                                                                    <div className="space-y-4 mt-4">
                                                                        <div className="bg-white p-4 rounded-xl border border-gray-100">
                                                                            <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Artículos Comprados</p>
                                                                            <div className="space-y-1">
                                                                                {(orderDetails.items || []).map((item, idx) => (
                                                                                    <div key={idx} className="flex justify-between text-[11px] border-b border-gray-50 pb-1 last:border-0">
                                                                                        <span className="text-gray-700 font-medium">x{item.quantity} {item.name}</span>
                                                                                        <span className="text-gray-500 font-bold">${new Intl.NumberFormat('es-CL').format(item.price * item.quantity)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                                                                            <div className="space-y-3">
                                                                                <div>
                                                                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1 flex items-center gap-1"><MapPin size={12}/> Dirección de Envío</p>
                                                                                    <p className="text-gray-700 leading-tight">{orderDetails.address || 'No especificada'}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1 flex items-center gap-1"><Truck size={12}/> Transportista</p>
                                                                                    <p className="text-indigo-600 font-bold">{orderDetails.courier}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center text-center shadow-inner">
                                                                                <p className="text-[9px] text-gray-400 uppercase font-black mb-1">N° Seguimiento</p>
                                                                                <p className="text-sm font-black text-gray-900 tracking-wider">
                                                                                    {orderDetails.tracking_number}
                                                                                </p>
                                                                                {order.raw_status === 'pendiente' && !order.is_expired && (
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleRetryPayment(order.id); }} disabled={isRetryingPayment} className="mt-3 w-full py-2 bg-pink-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-pink-700 transition-transform active:scale-95 flex items-center justify-center gap-2">
                                                                                        {isRetryingPayment ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                                                                        Completar Pago
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                )}

                                {activeTab === 'ajustes' && (
                                    <section className="animate-in slide-in-from-right duration-300">
                                        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Settings className="text-cyan-600" /> Ajustar mis Datos
                                        </h3>
                                        <form onSubmit={handleSaveProfile} className="space-y-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nombre Completo</label>
                                                    <div className="relative">
                                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                        <input type="text" name="nombre" value={profileData.nombre} onChange={handleProfileChange} className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-100 outline-none transition-all" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Teléfono / WhatsApp</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                        <input type="text" name="telefono" value={profileData.telefono} onChange={handleProfileChange} placeholder="+56 9..." className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-100 outline-none transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Dirección de Despacho</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                    <input type="text" name="direccion" value={profileData.direccion} onChange={handleProfileChange} placeholder="Calle, Número, Depto..." className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-cyan-100 outline-none transition-all" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Ciudad</label>
                                                <input type="text" name="ciudad" value={profileData.ciudad} onChange={handleProfileChange} className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-cyan-100 outline-none transition-all" />
                                            </div>
                                            <button type="submit" disabled={savingProfile} className="w-full bg-cyan-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 disabled:opacity-50" >
                                                {savingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                                {savingProfile ? 'Guardando...' : 'Actualizar mis Datos'}
                                            </button>
                                        </form>
                                    </section>
                                )}

                                <div className="w-full h-px bg-gray-100"></div>

                                <div className="animate-in fade-in duration-700 delay-200">
                                    <div className="flex justify-between items-center mb-6 px-1">
                                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                            <Heart className="text-pink-500 fill-pink-500" size={22} /> Mis Favoritos
                                        </h3>
                                        <Link to="/favoritos" className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-tighter">
                                            Ver Todo el Catálogo
                                        </Link>
                                    </div>
                                    
                                    {favoritesPreview.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">Aún no has guardado piezas en favoritos.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {favoritesPreview.map((fav) => (
                                                <div key={fav.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100 shadow-sm border border-pink-50">
                                                    <img src={fav.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={fav.name} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                                                        <p className="text-[9px] text-white font-black truncate mb-1 uppercase tracking-tighter">{fav.name}</p>
                                                        <p className="text-[11px] text-pink-300 font-bold mb-2">{fav.priceFormatted}</p>
                                                        <button onClick={(e) => { e.preventDefault(); addToCart(fav); }} className="w-full bg-white text-indigo-600 text-[10px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-50 shadow-xl transition-transform active:scale-95">
                                                            <ShoppingCart size={12} /> Al Carro
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
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#feecd4] text-orange-500 mb-6 shadow-sm border-4 border-white">
                        {isLoginView ? <LogIn size={36} /> : <UserPlus size={36} />}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        {isLoginView ? '¡Bienvenida!' : 'Crear Cuenta'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLoginView && (
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input required={!isLoginView} type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu Nombre Completo" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-cyan-50 outline-none transition-all" />
                        </div>
                    )}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-cyan-50 outline-none transition-all" />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-cyan-50 outline-none transition-all" />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl transition-all mt-4 transform hover:-translate-y-1">
                        {isLoginView ? 'Entrar' : 'Registrarme'}
                    </button>
                </form>

                <div className="mt-10 text-center text-sm">
                    <p className="text-gray-400 font-medium">{isLoginView ? '¿No tienes cuenta todavía?' : '¿Ya eres parte?'}</p>
                    <button onClick={() => setIsLoginView(!isLoginView)} className="mt-2 font-black text-pink-600 uppercase text-xs tracking-widest">
                        {isLoginView ? 'Crear mi cuenta gratis' : 'Inicia Sesión aquí'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default User;