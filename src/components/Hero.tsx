import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury Home"
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/20 to-neutral-900" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 mb-8 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Premium Real Estate Marketplace
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
            UNVEIL YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
              DREAM SPACE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
            Experience the pinnacle of luxury living with our curated collection of 
            the world's most exceptional properties.
          </p>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col md:flex-row gap-3">
            <div className="flex-[1.5] flex items-center px-6 gap-4 py-4">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <input 
                type="text" 
                placeholder="Where would you like to live?"
                className="w-full bg-transparent outline-none text-white text-lg font-bold placeholder:text-neutral-500"
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?location=${(e.target as HTMLInputElement).value}`)}
              />
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="flex-1 bg-white text-neutral-900 px-10 py-5 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all active:scale-95 shadow-xl"
            >
              <Search className="w-6 h-6" />
              Search Properties
            </button>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-12 text-white/40">
            <div className="flex flex-col items-center">
              <span className="text-white font-black text-4xl mb-1">12k+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Listings</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-white font-black text-4xl mb-1">8k+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Clients</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col items-center">
              <span className="text-white font-black text-4xl mb-1">150+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Awards</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Scroll</span>
        <div className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1.5">
          <div className="w-1 h-2.5 bg-emerald-400 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
