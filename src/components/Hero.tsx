import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury Home"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 via-transparent to-neutral-900/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
            Premium Real Estate Marketplace
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[0.9]">
            FIND YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              PRIME SPACE
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-12 font-medium">
            Discover the most exclusive properties in the world's most desirable locations. 
            From modern apartments to vast estates.
          </p>

          <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-neutral-100 py-3">
              <MapPin className="w-5 h-5 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Enter location..."
                className="w-full outline-none text-neutral-900 font-medium placeholder:text-neutral-400"
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?location=${(e.target as HTMLInputElement).value}`)}
              />
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
              Search Now
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/60 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">12k+</span> Properties
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">8k+</span> Happy Clients
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">150+</span> Awards Won
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
