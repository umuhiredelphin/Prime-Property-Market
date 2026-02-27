import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Property, Message } from '../types';
import { PROPERTY_TYPES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, LayoutDashboard, Heart, MessageSquare, PlusCircle, 
  Settings, Trash2, Edit3, CheckCircle2, Clock, X, Image as ImageIcon,
  Send, MapPin, DollarSign, Bell, Shield, LogOut, ExternalLink,
  ChevronRight, Search, Filter, Sparkles
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [updating, setUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    type: 'house',
    images: [] as string[]
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    if (!token) return;
    fetchDashboardData();
  }, [token, user?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [propsRes, favRes, msgRes] = await Promise.all([
        fetch('/api/properties', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const allProps = await propsRes.json();
      const favs = await favRes.json();
      const msgs = await msgRes.json();

      setMyProperties(Array.isArray(allProps) ? allProps.filter((p: Property) => p.seller_id === user?.id) : []);
      setFavorites(Array.isArray(favs) ? favs : []);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';
    const method = editingProperty ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        price: Number(formData.price),
        images: formData.images.length > 0 ? formData.images : [`https://picsum.photos/seed/${Math.random()}/1200/800`]
      })
    });
    if (res.ok) {
      setShowAddModal(false);
      setEditingProperty(null);
      setFormData({ title: '', description: '', price: '', location: '', type: 'house', images: [] });
      fetchDashboardData();
    }
  };

  const startEditing = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      type: property.type,
      images: JSON.parse(property.images as any || '[]')
    });
    setShowAddModal(true);
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMyProperties(myProperties.filter(p => p.id !== id));
  };

  const promoteProperty = async (id: number) => {
    // Simulated promotion logic - in real app this would trigger a payment flow
    if (!confirm('Promote this listing for $49.99? This will feature it on the homepage.')) return;
    
    const res = await fetch(`/api/properties/${id}/promote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      alert('Property promoted successfully!');
      fetchDashboardData();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email
        })
      });

      if (res.ok) {
        alert('Profile updated successfully! Please sign in again to see changes.');
        // In a real app, we'd update the context or re-fetch user
      } else {
        const data = await res.json();
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.newPassword) return alert('Please enter a new password');
    
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        })
      });

      if (res.ok) {
        alert('Password changed successfully!');
        setProfileForm({ ...profileForm, currentPassword: '', newPassword: '' });
      } else {
        const data = await res.json();
        alert(data.error || 'Password change failed');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    const res = await fetch(`/api/messages/${selectedMessage.id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: replyContent })
    });

    if (res.ok) {
      alert('Reply sent!');
      setReplyContent('');
      fetchDashboardData();
    }
  };

  const markAsSold = async (id: number) => {
    const property = myProperties.find(p => p.id === id);
    if (!property) return;

    const res = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...property,
        status: 'sold'
      })
    });

    if (res.ok) {
      alert('Property marked as sold!');
      fetchDashboardData();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'seller' || user?.role === 'admin') {
    tabs.splice(1, 0, { id: 'listings', label: 'My Listings', icon: PlusCircle });
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
              <div className="relative group mx-auto w-24 h-24 mb-6">
                <div className="w-24 h-24 bg-neutral-900 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-neutral-900/20">
                  <User className="w-12 h-12" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-neutral-900 leading-tight">{user?.name}</h2>
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">{user?.role} Account</p>
              </div>
            </div>

            <nav className="bg-white p-3 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all group ${
                    activeTab === tab.id 
                      ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/10' 
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-900'}`} />
                    {tab.label}
                  </div>
                  {tab.id === 'messages' && messages.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      {messages.length}
                    </span>
                  )}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-neutral-50">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </nav>

            {/* Promo Card */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
                <h4 className="text-xl font-black mb-2">Go Premium</h4>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Promote your listings to the top of search results and get 5x more leads.</p>
                <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                  Upgrade Now
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Personal Dashboard</h2>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Saved Items</p>
                      <p className="text-3xl font-black text-neutral-900">{favorites.length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Inquiries</p>
                      <p className="text-3xl font-black text-neutral-900">{messages.length}</p>
                    </div>
                    {(user?.role === 'seller' || user?.role === 'admin') && (
                      <>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Active Listings</p>
                          <p className="text-3xl font-black text-neutral-900">{myProperties.filter(p => p.status !== 'sold').length}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm group hover:shadow-md transition-all">
                          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Sales</p>
                          <p className="text-3xl font-black text-neutral-900">
                            ${myProperties.filter(p => p.status === 'sold').reduce((acc, p) => acc + p.price, 0).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-neutral-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4">Market Insights</h3>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                          Property values in your saved areas have increased by <span className="text-emerald-400 font-bold">4.2%</span> this month. Now might be a great time to invest.
                        </p>
                        <button className="flex items-center gap-2 text-sm font-bold hover:text-emerald-400 transition-colors">
                          View Market Report <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm">
                      <h3 className="text-xl font-black text-neutral-900 mb-6">Recent Activity</h3>
                      <div className="space-y-6">
                        {messages.slice(0, 3).map(msg => (
                          <div key={msg.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0">
                              <MessageSquare className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900">New message from {msg.sender_name}</p>
                              <p className="text-xs text-neutral-400">Re: {msg.property_title}</p>
                            </div>
                          </div>
                        ))}
                        {favorites.slice(0, 2).map(fav => (
                          <div key={fav.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                              <Heart className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-neutral-900">Saved {fav.title}</p>
                              <p className="text-xs text-neutral-400">{fav.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'listings' && (
                <motion.div 
                  key="listings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">My Listings</h3>
                      <p className="text-neutral-400 text-sm">Manage and promote your properties</p>
                    </div>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-neutral-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95 shadow-xl shadow-neutral-900/10"
                    >
                      <PlusCircle className="w-5 h-5" /> List Property
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {myProperties.map(property => (
                      <div key={property.id} className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                        <div className="relative aspect-[16/10]">
                          <img 
                            src={JSON.parse(property.images as any || '[]')[0] || `https://picsum.photos/seed/${property.id}/800/600`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            {property.status === 'sold' ? (
                              <span className="bg-neutral-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Sold
                              </span>
                            ) : property.is_approved ? (
                              <span className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="bg-amber-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                            {property.is_featured === 1 && (
                              <span className="bg-indigo-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteProperty(property.id)}
                              className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-8">
                          <h4 className="text-xl font-black text-neutral-900 mb-2 truncate">{property.title}</h4>
                          <p className="text-sm text-neutral-400 flex items-center gap-1 mb-6">
                            <MapPin className="w-4 h-4" /> {property.location}
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                            <p className="text-2xl font-black text-neutral-900">${property.price.toLocaleString()}</p>
                            <div className="flex gap-2">
                              {property.status !== 'sold' && (
                                <button 
                                  onClick={() => markAsSold(property.id)}
                                  className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                                >
                                  Mark Sold
                                </button>
                              )}
                              <button 
                                onClick={() => promoteProperty(property.id)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                              >
                                Promote
                              </button>
                              <button 
                                onClick={() => startEditing(property)}
                                className="px-4 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-all"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {myProperties.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PlusCircle className="w-8 h-8 text-neutral-300" />
                      </div>
                      <h4 className="text-xl font-bold text-neutral-900">No listings yet</h4>
                      <p className="text-neutral-500 mb-8">Start selling your property today.</p>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold"
                      >
                        Create First Listing
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div 
                  key="favorites"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h3 className="text-3xl font-black tracking-tight">Saved Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {favorites.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                  {favorites.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-red-200" />
                      </div>
                      <h4 className="text-xl font-bold text-neutral-900">Your wishlist is empty</h4>
                      <p className="text-neutral-500">Explore properties and save your favorites.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div 
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-[calc(100vh-200px)] min-h-[600px]"
                >
                  <div className="bg-white rounded-[3rem] border border-neutral-100 shadow-sm h-full flex overflow-hidden">
                    {/* Message List */}
                    <div className="w-full md:w-80 border-r border-neutral-100 flex flex-col">
                      <div className="p-6 border-b border-neutral-100">
                        <h3 className="text-xl font-black text-neutral-900">Inbox</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto no-scrollbar">
                        {messages.map(msg => (
                          <button 
                            key={msg.id}
                            onClick={() => setSelectedMessage(msg)}
                            className={`w-full p-6 text-left border-b border-neutral-50 transition-all ${
                              selectedMessage?.id === msg.id ? 'bg-neutral-50' : 'hover:bg-neutral-50/50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-neutral-900 truncate">{msg.sender_name}</p>
                              <span className="text-[10px] text-neutral-400 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-indigo-600 font-bold mb-2 truncate">Re: {msg.property_title}</p>
                            <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">{msg.content}</p>
                          </button>
                        ))}
                        {messages.length === 0 && (
                          <div className="p-12 text-center">
                            <p className="text-sm text-neutral-400 font-medium italic">No messages yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="hidden md:flex flex-1 flex-col bg-neutral-50/30">
                      {selectedMessage ? (
                        <>
                          <div className="p-8 bg-white border-b border-neutral-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black">
                                {selectedMessage.sender_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-black text-neutral-900">{selectedMessage.sender_name}</h4>
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Inquiry Received</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-3 bg-neutral-50 text-neutral-400 rounded-xl hover:text-neutral-900 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 p-12 overflow-y-auto">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm max-w-2xl">
                              <div className="flex items-center gap-2 mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                  Property Inquiry
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400">
                                  {new Date(selectedMessage.created_at).toLocaleString()}
                                </span>
                              </div>
                              <h5 className="text-lg font-black text-neutral-900 mb-4">Regarding: {selectedMessage.property_title}</h5>
                              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                                {selectedMessage.content}
                              </p>
                            </div>
                          </div>
                          <div className="p-8 bg-white border-t border-neutral-100">
                            <div className="flex gap-4">
                              <input 
                                type="text" 
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                              />
                              <button 
                                onClick={handleReply}
                                disabled={!replyContent.trim()}
                                className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-50"
                              >
                                <Send className="w-5 h-5" /> Send
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                            <MessageSquare className="w-10 h-10 text-neutral-200" />
                          </div>
                          <h4 className="text-xl font-bold text-neutral-900">Select a message</h4>
                          <p className="text-neutral-400 max-w-xs mx-auto">Choose a conversation from the list to view the full inquiry details.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl space-y-12"
                >
                  <div className="max-w-2xl space-y-12">
                    <header>
                      <h3 className="text-3xl font-black tracking-tight">Account Settings</h3>
                      <p className="text-neutral-400 text-sm">Manage your personal information and security</p>
                    </header>

                    <div className="space-y-8">
                      <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                          <User className="w-5 h-5" /> Profile Information
                        </h4>
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Full Name</label>
                            <input 
                              type="text" 
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Email Address</label>
                            <input 
                              type="email" 
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={updating}
                          className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                          {updating ? 'Updating...' : 'Update Profile'}
                        </button>
                      </form>

                      <form onSubmit={handleChangePassword} className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                          <Shield className="w-5 h-5" /> Security
                        </h4>
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Current Password</label>
                            <input 
                              type="password" 
                              required
                              value={profileForm.currentPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">New Password</label>
                            <input 
                              type="password" 
                              required
                              value={profileForm.newPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                              placeholder="Min. 8 characters"
                              className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={updating}
                          className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                          {updating ? 'Updating...' : 'Change Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Add Property Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-14 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl no-scrollbar"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-neutral-900">
                    {editingProperty ? 'Edit Property' : 'List New Property'}
                  </h3>
                  <p className="text-neutral-400 text-sm mt-1">
                    {editingProperty ? 'Update your property details' : 'Fill in the details to submit for review'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProperty(null);
                    setFormData({ title: '', description: '', price: '', location: '', type: 'house', images: [] });
                  }} 
                  className="p-3 hover:bg-neutral-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Property Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Luxury Penthouse with City View"
                      className="w-full px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Price ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                        <input 
                          type="number" 
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="500,000"
                          className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Property Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 appearance-none"
                      >
                        {PROPERTY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                      <input 
                        type="text" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Manhattan, New York"
                        className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the features, amenities, and surroundings..."
                      className="w-full h-40 px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium text-neutral-600 resize-none placeholder:text-neutral-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Image URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                      <input 
                        type="text" 
                        placeholder="https://example.com/image.jpg"
                        onChange={(e) => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
                        className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neutral-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-neutral-900/20 active:scale-[0.98] transition-all"
                >
                  {editingProperty ? 'Update Property' : 'Submit for Approval'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
