import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Property, Message } from '../types';
import { PROPERTY_TYPES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, LayoutDashboard, Heart, MessageSquare, PlusCircle, 
  Settings, Trash2, Edit3, CheckCircle2, Clock, X, Image as ImageIcon,
  Send, MapPin, DollarSign
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    type: 'house',
    images: [] as string[]
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    
    const fetchData = async () => {
      const [propsRes, favRes, msgRes] = await Promise.all([
        fetch('/api/properties', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const allProps = await propsRes.json();
      const favs = await favRes.json();
      const msgs = await msgRes.json();

      setMyProperties(allProps.filter((p: Property) => p.seller_id === user?.id));
      setFavorites(favs);
      setMessages(msgs);
      setLoading(false);
    };

    fetchData();
  }, [token, user?.id]);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/properties', {
      method: 'POST',
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
      setFormData({ title: '', description: '', price: '', location: '', type: 'house', images: [] });
      // Refresh
      window.location.reload();
    }
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMyProperties(myProperties.filter(p => p.id !== id));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  if (user?.role === 'seller' || user?.role === 'admin') {
    tabs.splice(1, 0, { id: 'listings', label: 'My Listings', icon: PlusCircle });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 text-center">
            <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">{user?.name}</h2>
            <p className="text-neutral-500 text-sm font-medium capitalize">{user?.role}</p>
          </div>

          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/10' 
                    : 'text-neutral-500 hover:bg-white hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Saved Properties</p>
                    <p className="text-4xl font-black text-neutral-900">{favorites.length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Unread Messages</p>
                    <p className="text-4xl font-black text-neutral-900">{messages.length}</p>
                  </div>
                  {(user?.role === 'seller' || user?.role === 'admin') && (
                    <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">My Listings</p>
                      <p className="text-4xl font-black text-neutral-900">{myProperties.length}</p>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">Welcome back, {user?.name}!</h3>
                    <p className="text-neutral-400 max-w-md mb-8">
                      Manage your property portfolio, respond to inquiries, and find your next prime investment.
                    </p>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="bg-white text-neutral-900 px-8 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all"
                    >
                      Check Messages
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
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
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black tracking-tight">My Listings</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
                  >
                    <PlusCircle className="w-5 h-5" /> Add New Property
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myProperties.map(property => (
                    <div key={property.id} className="relative group">
                      <PropertyCard property={property} />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => deleteProperty(property.id)}
                          className="p-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        {property.is_approved ? (
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {myProperties.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-neutral-200">
                    <p className="text-neutral-500 font-medium">You haven't listed any properties yet.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                {favorites.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-neutral-200">
                    <p className="text-neutral-500 font-medium">No saved properties yet.</p>
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
                className="space-y-6"
              >
                <h3 className="text-3xl font-black tracking-tight">Messages</h3>
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-white p-6 rounded-3xl border border-neutral-100 hover:border-neutral-900 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-neutral-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900">{msg.sender_name}</h4>
                            <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold">
                              Re: {msg.property_title}
                            </p>
                          </div>
                        </div>
                        <span className="text-neutral-400 text-xs font-medium">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm bg-neutral-50 p-4 rounded-2xl italic">
                        "{msg.content}"
                      </p>
                      <div className="mt-4 flex justify-end">
                        <button className="text-neutral-900 font-bold text-sm flex items-center gap-2 hover:underline">
                          <Send className="w-4 h-4" /> Reply
                        </button>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-neutral-200">
                      <p className="text-neutral-500 font-medium">No messages yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Property Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black tracking-tight">List New Property</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Property Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Luxury Penthouse with City View"
                    className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input 
                        type="number" 
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="500,000"
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Property Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium appearance-none"
                    >
                      {PROPERTY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Manhattan, New York"
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the features, amenities, and surroundings..."
                    className="w-full h-32 px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Image URL (Optional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neutral-900 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-neutral-900/20 active:scale-95 transition-all"
                >
                  Submit for Approval
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
