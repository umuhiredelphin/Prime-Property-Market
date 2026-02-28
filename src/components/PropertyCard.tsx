import { Link } from 'react-router-dom';
import { Property } from '../types';
import { MapPin, Home, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const images = JSON.parse(property.images as any || '[]');
  const mainImage = images[0] || `https://picsum.photos/seed/${property.id}/800/600`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-neutral-100 hover:shadow-2xl hover:shadow-neutral-900/5 transition-all duration-500"
    >
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative aspect-[1.2/1] overflow-hidden">
          <img 
            src={mainImage} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-900 shadow-sm">
              {property.type}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${
              property.status === 'for sale' ? 'bg-emerald-500' : 
              property.status === 'for rent' ? 'bg-indigo-500' : 'bg-neutral-500'
            }`}>
              {property.status}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button className="w-full bg-white text-neutral-900 py-3 rounded-2xl font-bold text-sm shadow-xl">
              View Property Details
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-neutral-900 line-clamp-1 mb-1 tracking-tight">
                {property.title}
              </h3>
              <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-neutral-300" />
                <span className="line-clamp-1">{property.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Price</span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight">
                ${property.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-colors duration-300">
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
