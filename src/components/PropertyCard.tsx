import { Link } from 'react-router-dom';
import { Property } from '../types';
import { MapPin, Home, Tag } from 'lucide-react';
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
      className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={mainImage} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-900">
              {property.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
              property.status === 'for sale' ? 'bg-emerald-500' : 
              property.status === 'for rent' ? 'bg-indigo-500' : 'bg-neutral-500'
            }`}>
              {property.status}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-neutral-700 transition-colors">
              {property.title}
            </h3>
            <span className="text-xl font-black text-neutral-900">
              ${property.price.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 text-neutral-500 text-sm mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3 text-neutral-400 text-xs font-medium">
              <div className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Premium</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </div>
            <span className="text-neutral-900 text-sm font-semibold group-hover:translate-x-1 transition-transform">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
