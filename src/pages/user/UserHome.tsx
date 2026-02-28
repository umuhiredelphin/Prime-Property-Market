import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Property } from '../../types';
import { motion } from 'motion/react';
import { 
  Search, MapPin, Heart, MessageSquare, Sparkles, 
  ArrowRight, LayoutGrid, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../components/PropertyCard';

export default function UserHome() {
  const { user, token } = useAuth();
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties?limit=6')
      .then(res => res.json())
      .then(data => {
        setRecommended(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Sparkles className="w-4 h-4" />
                Personalized for you
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter leading-[0.9]">
                WELCOME BACK, <br />
                <span className="text-neutral-400">{user?.name.split(' ')[0].toUpperCase()}</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <Link to="/dashboard" className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/10">
                <LayoutGrid className="w-5 h-5" />
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-neutral-50 p-10 rounded-[3rem] border border-neutral-100 group hover:bg-neutral-900 transition-all duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-neutral-900" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-white transition-colors">Find Your Next Home</h3>
            <p className="text-neutral-500 mb-8 font-medium group-hover:text-neutral-400 transition-colors">Explore thousands of premium listings across the globe.</p>
            <Link to="/search" className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-neutral-900 group-hover:text-emerald-400 transition-colors">
              Start Searching <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-neutral-50 p-10 rounded-[3rem] border border-neutral-100 group hover:bg-neutral-900 transition-all duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-white transition-colors">Saved Collections</h3>
            <p className="text-neutral-500 mb-8 font-medium group-hover:text-neutral-400 transition-colors">Keep track of the properties you love in one place.</p>
            <Link to="/dashboard" className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-neutral-900 group-hover:text-emerald-400 transition-colors">
              View Wishlist <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-neutral-50 p-10 rounded-[3rem] border border-neutral-100 group hover:bg-neutral-900 transition-all duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-white transition-colors">Active Inquiries</h3>
            <p className="text-neutral-500 mb-8 font-medium group-hover:text-neutral-400 transition-colors">Manage your conversations with property sellers.</p>
            <Link to="/dashboard" className="flex items-center gap-2 font-black text-sm uppercase tracking-widest text-neutral-900 group-hover:text-emerald-400 transition-colors">
              Check Messages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Market Trends */}
        <div className="bg-neutral-900 rounded-[4rem] p-12 md:p-20 text-white mb-24 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                <TrendingUp className="w-4 h-4" />
                Market Analysis
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8">
                REAL ESTATE <br />
                <span className="text-neutral-400">INSIGHTS 2024</span>
              </h2>
              <p className="text-neutral-400 text-xl font-medium leading-relaxed mb-10 max-w-lg">
                Property values in your preferred locations have increased by 4.2% this quarter. Now is a strategic time to consider your next investment.
              </p>
              <button className="bg-white text-neutral-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neutral-100 transition-all shadow-2xl">
                Download Full Report
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Avg. Price</p>
                <p className="text-3xl font-black text-white">$1.2M</p>
                <p className="text-emerald-400 text-xs font-bold mt-2">+12% YoY</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">New Listings</p>
                <p className="text-3xl font-black text-white">450+</p>
                <p className="text-emerald-400 text-xs font-bold mt-2">This Week</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Demand</p>
                <p className="text-3xl font-black text-white">High</p>
                <p className="text-emerald-400 text-xs font-bold mt-2">Top 5%</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem]">
                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Verified</p>
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-emerald-400 text-xs font-bold mt-2">Guaranteed</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full translate-y-[-20%] translate-x-[20%] blur-[120px]" />
        </div>

        {/* Recommended for You */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">Curated selection</h2>
              <h3 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-[0.9]">
                RECOMMENDED <br />
                <span className="text-neutral-400">FOR YOU</span>
              </h3>
            </div>
            <Link to="/search" className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 group hover:bg-neutral-800 transition-all">
              Explore All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[1.2/1] bg-neutral-100 rounded-[2.5rem] animate-pulse" />
              ))
            ) : (
              recommended.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </section>

        {/* Trust Banner */}
        <div className="mt-32 p-12 bg-neutral-50 rounded-[4rem] border border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-neutral-900 tracking-tight">Your Security is Our Priority</h4>
              <p className="text-neutral-500 font-medium">Every transaction is protected by our advanced escrow system.</p>
            </div>
          </div>
          <button className="bg-neutral-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/10">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
