import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Landmark, Warehouse, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties?sort=newest')
      .then(res => res.json())
      .then(data => {
        setFeaturedProperties(data.slice(0, 6));
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: 'Apartments', icon: Building2, count: '1,240', color: 'bg-blue-50 text-blue-600' },
    { name: 'Houses', icon: Warehouse, count: '850', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Land', icon: Map, count: '420', color: 'bg-amber-50 text-amber-600' },
    { name: 'Commercial', icon: Landmark, count: '310', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="pb-20">
      <Hero />

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Browse by Category</h2>
            <h3 className="text-4xl font-black text-neutral-900 tracking-tight">Explore Property Types</h3>
          </div>
          <Link to="/search" className="text-neutral-900 font-bold flex items-center gap-2 group">
            View All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 bg-white rounded-3xl border border-neutral-100 hover:border-neutral-900 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${cat.color}`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-1">{cat.name}</h4>
              <p className="text-neutral-500 font-medium">{cat.count} Properties</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-neutral-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Handpicked for you</h2>
              <h3 className="text-4xl font-black text-neutral-900 tracking-tight">Featured Listings</h3>
            </div>
            <Link to="/search" className="text-neutral-900 font-bold flex items-center gap-2 group">
              Explore More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {featuredProperties.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-300">
              <p className="text-neutral-500 font-medium">No properties found. Be the first to list one!</p>
              <Link to="/auth" className="mt-4 inline-block text-neutral-900 font-bold underline">Get Started</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative bg-neutral-900 rounded-[3rem] p-12 md:p-24 overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8 leading-tight">
              Ready to sell your <br />
              <span className="text-emerald-400">Prime Property?</span>
            </h3>
            <p className="text-neutral-400 text-lg mb-12 font-medium">
              Join thousands of sellers who trust us to showcase their premium real estate to a global audience of qualified buyers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth" className="bg-white text-neutral-900 px-8 py-4 rounded-2xl font-bold hover:bg-neutral-100 transition-all active:scale-95">
                List Your Property
              </Link>
              <Link to="/search" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95">
                Browse Listings
              </Link>
            </div>
          </div>
          
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
