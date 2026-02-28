import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowRight, Building2, Landmark, Warehouse, Map, 
  ShieldCheck, Zap, Globe, Star, Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties?sort=newest')
      .then(res => res.json())
      .then(data => {
        setFeaturedProperties(Array.isArray(data) ? data.slice(0, 6) : []);
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: 'Apartments', icon: Building2, count: '1,240', color: 'bg-blue-50 text-blue-600' },
    { name: 'Houses', icon: Warehouse, count: '850', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Land', icon: Map, count: '420', color: 'bg-amber-50 text-amber-600' },
    { name: 'Commercial', icon: Landmark, count: '310', color: 'bg-purple-50 text-purple-600' },
  ];

  const features = [
    {
      title: 'Verified Listings',
      desc: 'Every property on our platform undergoes a rigorous verification process.',
      icon: ShieldCheck,
      color: 'text-emerald-500'
    },
    {
      title: 'Fast Transactions',
      desc: 'Our streamlined process ensures you close deals faster than ever.',
      icon: Zap,
      color: 'text-amber-500'
    },
    {
      title: 'Global Reach',
      desc: 'Connect with buyers and sellers from across the globe seamlessly.',
      icon: Globe,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="pb-20 bg-white">
      <Hero />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-neutral-900/5 border border-neutral-100 group hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-4 tracking-tight">{feature.title}</h4>
              <p className="text-neutral-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">Browse by Category</h2>
            <h3 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-[0.9]">
              FIND YOUR <br />
              <span className="text-neutral-400">PERFECT MATCH</span>
            </h3>
          </div>
          <Link to="/search" className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 group hover:bg-neutral-800 transition-all">
            View All Categories <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-10 bg-neutral-50 rounded-[3rem] border border-transparent hover:border-neutral-200 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-12 ${cat.color}`}>
                <cat.icon className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-neutral-900 mb-2 tracking-tight">{cat.name}</h4>
              <p className="text-neutral-400 font-bold text-sm tracking-widest uppercase">{cat.count} Listings</p>
              
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-neutral-200/20 rounded-full blur-2xl group-hover:bg-emerald-200/20 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-neutral-900 py-32 rounded-[4rem] mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Handpicked for you</h2>
              <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                FEATURED <br />
                <span className="text-white/30">LISTINGS</span>
              </h3>
            </div>
            <Link to="/search" className="bg-white text-neutral-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 group hover:bg-neutral-100 transition-all">
              Explore More <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 rounded-[3rem] h-[500px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {featuredProperties.length === 0 && !loading && (
            <div className="text-center py-32 bg-white/5 rounded-[4rem] border border-dashed border-white/10">
              <p className="text-white/40 font-bold text-xl mb-8">No properties found. Be the first to list one!</p>
              <Link to="/login" className="bg-emerald-400 text-neutral-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-300 transition-all">
                Get Started Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-4">Testimonials</h2>
            <h3 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-[0.9] mb-8">
              WHAT OUR <br />
              <span className="text-neutral-400">CLIENTS SAY</span>
            </h3>
            <p className="text-xl text-neutral-500 font-medium leading-relaxed mb-12">
              We've helped thousands of people find their perfect home. 
              Here's what some of them have to say about their experience with Prime Property.
            </p>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
              ))}
              <span className="ml-2 font-black text-neutral-900">4.9/5 Rating</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -left-10 text-neutral-100">
              <Quote className="w-40 h-40 fill-current" />
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative z-10 bg-white p-12 rounded-[3rem] shadow-2xl shadow-neutral-900/5 border border-neutral-100"
            >
              <p className="text-2xl font-medium text-neutral-700 italic mb-10 leading-relaxed">
                "Finding a home was always a stressful process for me until I found Prime Property. 
                The interface is so clean, and the verification process gave me peace of mind."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 overflow-hidden">
                  <img src="https://picsum.photos/seed/avatar1/200/200" alt="Client" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-neutral-900">Alex Thompson</h4>
                  <p className="text-neutral-400 font-bold text-xs uppercase tracking-widest">New Homeowner</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-neutral-900 rounded-[4rem] p-12 md:p-24 overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
              READY TO SELL YOUR <br />
              <span className="text-emerald-400">PRIME PROPERTY?</span>
            </h3>
            <p className="text-xl text-neutral-400 mb-16 font-medium leading-relaxed">
              Join thousands of elite sellers who trust us to showcase their premium real estate 
              to a global audience of qualified buyers.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/sell" className="bg-white text-neutral-900 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-neutral-100 transition-all active:scale-95 shadow-2xl">
                List Your Property
              </Link>
              <Link to="/search" className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-white/10 transition-all active:scale-95">
                Browse Listings
              </Link>
            </div>
          </div>
          
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[180px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
