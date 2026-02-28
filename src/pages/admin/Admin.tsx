import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Property, User, Payment, Report, Announcement } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, ShieldCheck, Users, Building2, 
  BarChart3, Clock, MapPin, DollarSign, Trash2, Star, 
  AlertTriangle, Megaphone, LayoutGrid, UserPlus, 
  Ban, UserCheck, MoreVertical, Search, Filter, Send
} from 'lucide-react';

export default function Admin() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingApproval: 0,
    totalUsers: 0,
    totalSales: 0,
    reportedCount: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });

  useEffect(() => {
    if (!token) return;
    fetchAdminData();
  }, [token, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/admin/stats', { headers });
        const data = await res.json();
        if (!data.error) setStats(data);
      } else if (activeTab === 'users') {
        const res = await fetch('/api/admin/users', { headers });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else if (activeTab === 'properties') {
        const res = await fetch('/api/admin/properties', { headers });
        const data = await res.json();
        setProperties(Array.isArray(data) ? data : []);
      } else if (activeTab === 'payments') {
        const res = await fetch('/api/admin/payments', { headers });
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } else if (activeTab === 'reports') {
        const res = await fetch('/api/admin/reports', { headers });
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } else if (activeTab === 'content') {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- User Actions ---
  const updateUserStatus = async (id: number, status: string, role: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status, role })
    });
    fetchAdminData();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAdminData();
  };

  // --- Property Actions ---
  const approveProperty = async (id: number) => {
    await fetch(`/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAdminData();
  };

  const toggleFeatured = async (id: number, current: number) => {
    await fetch(`/api/admin/properties/${id}/feature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_featured: !current })
    });
    fetchAdminData();
  };

  const updatePropertyStatus = async (id: number, status: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...property, status })
    });
    fetchAdminData();
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchAdminData();
  };

  // --- Content Actions ---
  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(announcementForm)
    });
    setAnnouncementForm({ title: '', content: '' });
    fetchAdminData();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'content', label: 'Content', icon: Megaphone },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Platform Controller</h2>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Super Admin</h1>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-sm overflow-x-auto no-scrollbar max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-neutral-900 text-white shadow-lg' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Properties</p>
                <p className="text-3xl font-black text-neutral-900">{stats.totalProperties}</p>
                <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {stats.pendingApproval} Pending
                </p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-3xl font-black text-neutral-900">{stats.totalUsers}</p>
                <p className="text-xs text-neutral-400 font-bold mt-2">Active Community</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-3xl font-black text-neutral-900">${stats.totalSales.toLocaleString()}</p>
                <p className="text-xs text-emerald-500 font-bold mt-2">Promotions & Subs</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Reports</p>
                <p className="text-3xl font-black text-neutral-900">{stats.reportedCount}</p>
                <p className="text-xs text-red-500 font-bold mt-2">Requires Attention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-neutral-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4">System Health</h3>
                  <p className="text-neutral-400 mb-8">All systems are operational. No critical security alerts in the last 24 hours.</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Database Online
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Auth Service Active
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              </div>

              <div className="bg-white p-12 rounded-[3rem] border border-neutral-100">
                <h3 className="text-2xl font-black text-neutral-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('content')} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-neutral-100 transition-all text-left">
                    <Megaphone className="w-6 h-6 text-neutral-900 mb-2" />
                    <p className="font-bold text-sm">Post Announcement</p>
                  </button>
                  <button onClick={() => setActiveTab('users')} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-neutral-100 transition-all text-left">
                    <UserPlus className="w-6 h-6 text-neutral-900 mb-2" />
                    <p className="font-bold text-sm">Manage Users</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-3xl font-black tracking-tight">User Management</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">User</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Role</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Listings</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Status</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Joined</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                      <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center font-bold text-neutral-400">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">{user.name}</p>
                              <p className="text-xs text-neutral-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <select 
                            value={user.role}
                            onChange={(e) => updateUserStatus(user.id, user.status, e.target.value)}
                            className={`border-none rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1 outline-none ${
                              user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                              user.role === 'seller' ? 'bg-emerald-100 text-emerald-700' : 
                              'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-neutral-300" />
                            <span className="font-bold text-neutral-900">{(user as any).property_count || 0}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-neutral-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {user.status === 'active' ? (
                              <button onClick={() => updateUserStatus(user.id, 'blocked', user.role)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors" title="Block User">
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => updateUserStatus(user.id, 'active', user.role)} className="p-2 text-neutral-400 hover:text-emerald-600 transition-colors" title="Unblock User">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteUser(user.id)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors" title="Delete User">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'properties' && (
          <motion.div 
            key="properties"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-3xl font-black tracking-tight">Property Management</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" /> All Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {properties.map(property => (
                <div key={property.id} className="bg-white p-6 rounded-[2rem] border border-neutral-100 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm hover:shadow-md transition-all">
                  <div className="w-full md:w-40 aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0">
                    <img 
                      src={JSON.parse(property.images as any || '[]')[0] || `https://picsum.photos/seed/${property.id}/400/400`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{property.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        property.is_approved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {property.is_approved ? 'Approved' : 'Pending'}
                      </span>
                      {property.is_featured === 1 && (
                        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Star className="w-2 h-2 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-black text-neutral-900 truncate mb-1">{property.title}</h4>
                    <p className="text-sm text-neutral-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5" /> {property.location}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-black text-neutral-900">${property.price.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400 font-medium">By {property.seller_name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {!property.is_approved && (
                      <button 
                        onClick={() => approveProperty(property.id)}
                        className="flex-1 md:flex-none bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button 
                      onClick={() => toggleFeatured(property.id, property.is_featured)}
                      className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        property.is_featured ? 'bg-indigo-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${property.is_featured ? 'fill-current' : ''}`} /> 
                      {property.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <select 
                      value={property.status}
                      onChange={(e) => updatePropertyStatus(property.id, e.target.value)}
                      className="flex-1 md:flex-none bg-neutral-100 border-none rounded-xl text-xs font-bold px-4 py-2.5 outline-none"
                    >
                      <option value="for sale">For Sale</option>
                      <option value="for rent">For Rent</option>
                      <option value="sold">Mark as Sold</option>
                    </select>
                    <button 
                      onClick={() => deleteProperty(property.id)}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div 
            key="payments"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h3 className="text-3xl font-black tracking-tight">Financial Transactions</h3>
            <div className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">User</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Property</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Amount</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Type</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Status</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-neutral-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {payments.map(pay => (
                    <tr key={pay.id}>
                      <td className="px-8 py-6 font-bold text-neutral-900">{pay.user_name}</td>
                      <td className="px-8 py-6 text-sm text-neutral-500 truncate max-w-[200px]">{pay.property_title || 'N/A'}</td>
                      <td className="px-8 py-6 font-black text-neutral-900">${pay.amount.toLocaleString()}</td>
                      <td className="px-8 py-6 text-xs font-bold uppercase text-neutral-400">{pay.type}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pay.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-neutral-500">{new Date(pay.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-neutral-400 font-medium">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h3 className="text-3xl font-black tracking-tight">Reported Content</h3>
            <div className="grid grid-cols-1 gap-4">
              {reports.map(report => (
                <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Reported Property</span>
                    </div>
                    <h4 className="text-xl font-black text-neutral-900 mb-1">{report.property_title}</h4>
                    <p className="text-sm text-neutral-500 mb-4">Reported by <span className="font-bold text-neutral-900">{report.user_name}</span></p>
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <p className="text-sm text-red-700 italic">"{report.reason}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => deleteProperty(report.property_id)}
                      className="flex-1 md:flex-none bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
                    >
                      Remove Property
                    </button>
                    <button className="flex-1 md:flex-none bg-neutral-100 text-neutral-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-all">
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-neutral-200">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900">No active reports</h4>
                  <p className="text-neutral-500">The platform is clean and safe.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div 
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-3xl font-black tracking-tight">Post Announcement</h3>
                <form onSubmit={postAnnouncement} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Title</label>
                    <input 
                      type="text" 
                      required
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
                      placeholder="Maintenance Update..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Content</label>
                    <textarea 
                      required
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="w-full h-32 px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium resize-none"
                      placeholder="Write your message to the community..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
                    <Send className="w-4 h-4" /> Publish Announcement
                  </button>
                </form>
              </div>

              <div className="space-y-8">
                <h3 className="text-3xl font-black tracking-tight">Recent Announcements</h3>
                <div className="space-y-4">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-white p-6 rounded-3xl border border-neutral-100">
                      <h4 className="font-bold text-neutral-900 mb-1">{ann.title}</h4>
                      <p className="text-sm text-neutral-500 mb-4">{new Date(ann.created_at).toLocaleString()}</p>
                      <p className="text-sm text-neutral-600 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-center py-12 text-neutral-400 font-medium italic">No announcements posted yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-3xl font-black tracking-tight">Platform Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                  <h4 className="font-bold mb-4">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {['House', 'Land', 'Apartment', 'Office'].map(c => (
                      <span key={c} className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600">{c}</span>
                    ))}
                    <button className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold">+</button>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                  <h4 className="font-bold mb-4">Top Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {['New York', 'London', 'Dubai', 'Paris'].map(l => (
                      <span key={l} className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600">{l}</span>
                    ))}
                    <button className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold">+</button>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
                  <h4 className="font-bold mb-4">Banners</h4>
                  <p className="text-xs text-neutral-400 mb-4">3 active homepage banners</p>
                  <button className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold">Manage Banners</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
