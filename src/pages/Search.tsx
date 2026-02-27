import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { PROPERTY_TYPES, SORT_OPTIONS } from '../constants';
import { Search as SearchIcon, Filter, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    fetch(`/api/properties?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProperties(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Location</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => updateParam('location', e.target.value)}
                    placeholder="City, State..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Property Type</label>
                <select 
                  value={type}
                  onChange={(e) => updateParam('type', e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none transition-all appearance-none"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateParam('minPrice', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateParam('maxPrice', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                {properties.length} Properties Found
              </h1>
              <p className="text-neutral-500 font-medium">Showing results for your search</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              
              <select 
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold outline-none"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {!loading && properties.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-neutral-200">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No properties found</h3>
              <p className="text-neutral-500 max-w-xs mx-auto">
                Try adjusting your filters or searching in a different location.
              </p>
              <button 
                onClick={() => setSearchParams({})}
                className="mt-6 text-neutral-900 font-bold underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm lg:hidden"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => updateParam('location', e.target.value)}
                    placeholder="City, State..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Property Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => updateParam('type', type === t.value ? '' : t.value)}
                        className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${
                          type === t.value 
                            ? 'bg-neutral-900 border-neutral-900 text-white' 
                            : 'bg-white border-neutral-200 text-neutral-600'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Min Price</span>
                      <input 
                        type="number" 
                        value={minPrice}
                        onChange={(e) => updateParam('minPrice', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Max Price</span>
                      <input 
                        type="number" 
                        value={maxPrice}
                        onChange={(e) => updateParam('maxPrice', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-neutral-900/20 active:scale-95 transition-all"
                >
                  Show {properties.length} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
