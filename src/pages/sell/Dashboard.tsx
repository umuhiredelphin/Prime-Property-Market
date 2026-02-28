import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Property, Message } from '../../types';
import { PROPERTY_TYPES } from '../../constants';
import AddPropertyFlow from './AddPropertyFlow';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, LayoutDashboard, Heart, MessageSquare, PlusCircle, 
  Settings, Trash2, Edit3, CheckCircle2, Clock, X, Image as ImageIcon,
  Send, MapPin, DollarSign, Bell, Shield, LogOut, ExternalLink,
  ChevronRight, Search, Filter, Sparkles, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!token) return;
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      navigate('/user-home');
      return;
    }
    fetchDashboardData();
  }, [token, user?.id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [propsRes, msgRes] = await Promise.all([
        fetch('/api/properties', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const allProps = await propsRes.json();
      const msgs = await msgRes.json();

      setMyProperties(Array.isArray(allProps) ? allProps.filter((p: Property) => p.seller_id === user?.id) : []);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
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
      setReplyContent('');
      fetchDashboardData();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-property', label: 'New Asset', icon: PlusCircle },
    { id: 'listings', label: 'Inventory', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Network', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Vertical Navigation Rail */}
      <aside className="w-20 md:w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col py-8 px-4 gap-12 z-50">
        <div className="flex items-center gap-3 px-2 group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
            <LayoutDashboard className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter hidden md:block">
            PRIME<span className="text-neutral-500">SELL</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-3 py-4 rounded-2xl font-bold transition-all group ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20' 
                  : 'text-neutral-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className={`w-6 h-6 shrink-0 ${activeTab === tab.id ? 'text-black' : 'text-neutral-500 group-hover:text-emerald-400'}`} />
              <span className="hidden md:block truncate">{tab.label}</span>
              {tab.id === 'messages' && messages.length > 0 && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full hidden md:block ${activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {messages.length}
                </span>
              )}
              {tab.id === 'notifications' && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full hidden md:block ${activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  4
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-2 pt-8 border-t border-white/5">
          <Link 
            to="/profile"
            className="w-full flex items-center gap-4 px-3 py-4 rounded-2xl font-bold text-neutral-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <User className="w-6 h-6 shrink-0" />
            <span className="hidden md:block">Profile</span>
          </Link>
          <Link 
            to="/settings"
            className="w-full flex items-center gap-4 px-3 py-4 rounded-2xl font-bold text-neutral-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <Settings className="w-6 h-6 shrink-0" />
            <span className="hidden md:block">Settings</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-3 py-4 rounded-2xl font-bold text-neutral-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
          >
            <LogOut className="w-6 h-6 shrink-0" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen no-scrollbar p-6 md:p-12 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                    <Sparkles className="w-4 h-4" />
                    System Active
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                    HELLO, <br />
                    <span className="text-neutral-800">{user?.name.toUpperCase()}</span>
                  </h1>
                </div>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className="relative w-14 h-14 bg-[#0a0a0a] border border-white/5 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition-all group"
                  >
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </button>
                  <div className="flex gap-4">
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center min-w-[140px]">
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Uptime</p>
                      <p className="text-2xl font-black text-emerald-400">99.9%</p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center min-w-[140px]">
                      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Status</p>
                      <p className="text-2xl font-black text-emerald-400">LIVE</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 group hover:border-emerald-500/30 transition-all duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Revenue</p>
                  <p className="text-5xl font-black text-white leading-none">
                    ${myProperties.filter(p => p.status === 'sold').reduce((acc, p) => acc + p.price, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 group hover:border-emerald-500/30 transition-all duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Active Listings</p>
                  <p className="text-5xl font-black text-white leading-none">{myProperties.filter(p => p.status !== 'sold').length}</p>
                </div>
                <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 group hover:border-emerald-500/30 transition-all duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Inquiries</p>
                  <p className="text-5xl font-black text-white leading-none">{messages.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-emerald-500 rounded-[3rem] p-12 text-black relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black mb-4 tracking-tighter">MARKET INSIGHTS</h3>
                    <p className="text-black/60 text-lg font-bold mb-12 max-w-md">
                      Your listings are performing <span className="text-black font-black">24% better</span> than the market average this week.
                    </p>
                    <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                      Full Analysis
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                </div>

                <div className="bg-[#0a0a0a] p-12 rounded-[3rem] border border-white/5">
                  <h3 className="text-2xl font-black mb-8 tracking-tight">SYSTEM LOGS</h3>
                  <div className="space-y-6">
                    {messages.slice(0, 4).map(msg => (
                      <div key={msg.id} className="flex items-center gap-6 group">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Inquiry from {msg.sender_name}</p>
                          <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">{msg.property_title}</p>
                        </div>
                        <span className="text-[10px] font-bold text-neutral-700">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-neutral-600 font-bold uppercase tracking-widest text-[10px]">No recent activity detected</p>}
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
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-5xl font-black tracking-tighter">MY ASSETS</h3>
                  <p className="text-neutral-500 font-bold">Manage and monitor your property portfolio</p>
                </div>
                <button 
                  onClick={() => setActiveTab('add-property')}
                  className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20"
                >
                  <PlusCircle className="w-5 h-5 inline-block mr-2" /> New Asset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myProperties.map(property => (
                  <div key={property.id} className="bg-[#0a0a0a] rounded-[3rem] border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                    <div className="relative aspect-[16/9]">
                      <img 
                        src={JSON.parse(property.images as any || '[]')[0] || `https://picsum.photos/seed/${property.id}/800/600`} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
                      <div className="absolute top-6 left-6 flex gap-2">
                        {property.status === 'sold' ? (
                          <span className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Sold</span>
                        ) : (
                          <span className="bg-emerald-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                        )}
                      </div>
                    </div>
                    <div className="p-10">
                      <h4 className="text-2xl font-black mb-2">{property.title}</h4>
                      <p className="text-neutral-500 font-bold mb-8 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" /> {property.location}
                      </p>
                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <p className="text-3xl font-black text-emerald-400">${property.price.toLocaleString()}</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setActiveTab('add-property')}
                            className="p-4 bg-white/5 text-neutral-400 rounded-2xl hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteProperty(property.id)}
                            className="p-4 bg-white/5 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'add-property' && (
            <motion.div 
              key="add-property"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <AddPropertyFlow onComplete={() => {
                setActiveTab('listings');
                fetchDashboardData();
              }} />
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h3 className="text-5xl font-black tracking-tighter">NOTIFICATIONS</h3>
              <div className="space-y-6">
                {[
                  { title: 'New Inquiry', desc: 'A buyer has inquired about Penthouse X', time: '2m ago', type: 'inquiry' },
                  { title: 'System Update', desc: 'Market analysis engine updated to v2.4', time: '1h ago', type: 'system' },
                  { title: 'Property Sold', desc: 'Modern Villa has been marked as sold', time: '5h ago', type: 'success' },
                  { title: 'Profile Verified', desc: 'Your seller identity has been re-verified', time: '1d ago', type: 'system' }
                ].map((notif, i) => (
                  <div key={i} className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/5 flex items-center gap-8 group hover:border-emerald-500/30 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      notif.type === 'inquiry' ? 'bg-emerald-500/10 text-emerald-400' : 
                      notif.type === 'success' ? 'bg-white/10 text-white' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-lg">{notif.title}</h4>
                      <p className="text-neutral-500 font-bold text-sm">{notif.desc}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">{notif.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <h3 className="text-5xl font-black tracking-tighter">ANALYTICS ENGINE</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Network Reach', val: '12.4K', trend: '+15%' },
                  { label: 'Conversion', val: '3.2%', trend: '+0.5%' },
                  { label: 'Response', val: '2.4h', trend: '-15%' },
                  { label: 'Market Rank', val: 'Top 5%', trend: 'Global' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4">{stat.label}</p>
                    <p className="text-4xl font-black text-white mb-2">{stat.val}</p>
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{stat.trend}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0a0a0a] rounded-[4rem] p-16 border border-white/5 relative overflow-hidden">
                <h3 className="text-2xl font-black mb-12 tracking-tight uppercase tracking-widest">Performance Matrix</h3>
                <div className="h-80 flex items-end gap-6">
                  {[40, 70, 45, 90, 65, 80, 100, 60, 85, 75, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <div className="bg-[#0a0a0a] rounded-[4rem] border border-white/5 h-[calc(100vh-100px)] flex overflow-hidden">
                {/* Message List */}
                <div className="w-full md:w-96 border-r border-white/5 flex flex-col">
                  <div className="p-10 border-b border-white/5">
                    <h3 className="text-3xl font-black tracking-tighter">INBOX</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {messages.map(msg => (
                      <button 
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className={`w-full p-8 text-left border-b border-white/5 transition-all ${
                          selectedMessage?.id === msg.id ? 'bg-emerald-500 text-black' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className={`font-black truncate ${selectedMessage?.id === msg.id ? 'text-black' : 'text-white'}`}>{msg.sender_name}</p>
                          <span className={`text-[10px] font-bold ${selectedMessage?.id === msg.id ? 'text-black/60' : 'text-neutral-600'}`}>
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${selectedMessage?.id === msg.id ? 'text-black/80' : 'text-emerald-400'}`}>
                          {msg.property_title}
                        </p>
                        <p className={`text-sm line-clamp-2 ${selectedMessage?.id === msg.id ? 'text-black/60' : 'text-neutral-500'}`}>{msg.content}</p>
                      </button>
                    ))}
                    {messages.length === 0 && (
                      <div className="p-12 text-center">
                        <p className="text-neutral-600 font-bold uppercase tracking-widest text-[10px]">No messages in buffer</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="hidden md:flex flex-1 flex-col bg-black/40">
                  {selectedMessage ? (
                    <>
                      <div className="p-10 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-black font-black text-2xl">
                            {selectedMessage.sender_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black">{selectedMessage.sender_name}</h4>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Verified Buyer</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-16 overflow-y-auto">
                        <div className="bg-[#0a0a0a] p-12 rounded-[3rem] border border-white/5 max-w-3xl">
                          <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black bg-emerald-500 px-4 py-1.5 rounded-full">
                              Property Inquiry
                            </span>
                            <span className="text-[10px] font-bold text-neutral-600">
                              {new Date(selectedMessage.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h5 className="text-3xl font-black mb-6 tracking-tight">RE: {selectedMessage.property_title}</h5>
                          <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="p-10 border-t border-white/5">
                        <div className="flex gap-6">
                          <input 
                            type="text" 
                            placeholder="Initialize response..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 px-8 py-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:border-emerald-500 transition-all font-bold"
                          />
                          <button 
                            onClick={handleReply}
                            disabled={!replyContent.trim()}
                            className="bg-emerald-500 text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                      <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8">
                        <MessageSquare className="w-16 h-16 text-neutral-800" />
                      </div>
                      <h4 className="text-3xl font-black mb-4">SELECT A CHANNEL</h4>
                      <p className="text-neutral-600 max-w-sm mx-auto font-bold uppercase tracking-widest text-xs">Awaiting communication input from the network</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
