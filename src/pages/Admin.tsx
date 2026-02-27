import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Property } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ShieldCheck, Users, Building2, BarChart3, Clock, MapPin, DollarSign } from 'lucide-react';

export default function Admin() {
  const { token } = useAuth();
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingApproval: 0,
    totalUsers: 0,
    totalSales: 0
  });

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      const [pendingRes, allRes] = await Promise.all([
        fetch('/api/admin/pending', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/properties')
      ]);

      const pending = await pendingRes.json();
      const all = await allRes.json();

      setPendingProperties(pending);
      setStats({
        totalProperties: all.length + pending.length,
        pendingApproval: pending.length,
        totalUsers: 156, // Mock for demo
        totalSales: 12400000 // Mock for demo
      });
      setLoading(false);
    };

    fetchData();
  }, [token]);

  const approveProperty = async (id: number) => {
    await fetch(`/api/admin/approve/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setPendingProperties(pendingProperties.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, pendingApproval: prev.pendingApproval - 1 }));
  };

  const rejectProperty = async (id: number) => {
    if (!confirm('Are you sure you want to reject and delete this listing?')) return;
    await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setPendingProperties(pendingProperties.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, pendingApproval: prev.pendingApproval - 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">System Administration</h2>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          Authorized Access
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Properties</p>
          <p className="text-3xl font-black text-neutral-900">{stats.totalProperties}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Pending Approval</p>
          <p className="text-3xl font-black text-neutral-900">{stats.pendingApproval}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-3xl font-black text-neutral-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Market Volume</p>
          <p className="text-3xl font-black text-neutral-900">${(stats.totalSales / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Pending Approvals List */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6" /> Pending Approvals
          </h3>

          <div className="space-y-4">
            {pendingProperties.map(property => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-neutral-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
              >
                <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={JSON.parse(property.images as any || '[]')[0] || `https://picsum.photos/seed/${property.id}/400/400`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{property.type}</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{property.status}</span>
                  </div>
                  <h4 className="text-xl font-black text-neutral-900 truncate mb-1">{property.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {property.location}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-neutral-900">
                      <DollarSign className="w-3.5 h-3.5" /> {property.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => approveProperty(property.id)}
                    className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => rejectProperty(property.id)}
                    className="flex-1 sm:flex-none bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}

            {pendingProperties.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-neutral-200">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 mb-1">All caught up!</h4>
                <p className="text-neutral-500">No properties waiting for approval.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Recent Activity
          </h3>

          <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white space-y-6">
            <div className="flex gap-4">
              <div className="w-1 h-12 bg-emerald-500 rounded-full" />
              <div>
                <p className="text-sm font-bold">New User Registered</p>
                <p className="text-xs text-neutral-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 h-12 bg-indigo-500 rounded-full" />
              <div>
                <p className="text-sm font-bold">Property #PP-45 Sold</p>
                <p className="text-xs text-neutral-400">45 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 h-12 bg-amber-500 rounded-full" />
              <div>
                <p className="text-sm font-bold">New Listing Submitted</p>
                <p className="text-xs text-neutral-400">1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 h-12 bg-blue-500 rounded-full" />
              <div>
                <p className="text-sm font-bold">System Backup Complete</p>
                <p className="text-xs text-neutral-400">3 hours ago</p>
              </div>
            </div>

            <button className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all">
              View Full Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
