import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../App';
import { 
  MapPin, Calendar, User, Phone, MessageSquare, Heart, 
  Share2, ChevronLeft, ChevronRight, ShieldCheck, ArrowRight 
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { motion } from 'motion/react';

export default function PropertyDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        setLoading(false);
        
        // Fetch similar properties
        fetch(`/api/properties?type=${data.type}&limit=4`)
          .then(res => res.json())
          .then(similar => {
            setSimilarProperties(similar.filter((p: Property) => p.id !== Number(id)).slice(0, 3));
          });
      });

    if (token) {
      fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setIsFavorite(data.some((p: Property) => p.id === Number(id)));
      });
    }
  }, [id, token]);

  const toggleFavorite = async () => {
    if (!token) return alert('Please sign in to save favorites');
    const method = isFavorite ? 'DELETE' : 'POST';
    await fetch(`/api/favorites/${id}`, {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setIsFavorite(!isFavorite);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Please sign in to contact the seller');
    setSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: property?.seller_id,
          property_id: property?.id,
          content: message
        })
      });
      setMessage('');
      alert('Message sent successfully!');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-20 h-20 border-4 border-neutral-100 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  );

  if (!property) return <div className="text-center py-40 font-black text-4xl">Property not found</div>;

  const images = JSON.parse(property.images as any || '[]');
  const displayImages = images.length > 0 ? images : [`https://picsum.photos/seed/${property.id}/1200/800`];

  return (
    <div className="bg-white pb-32">
      {/* Hero Gallery Section */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-neutral-900">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={displayImages[activeImage]} 
          alt={property.title}
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/30" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-white text-neutral-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {property.type}
                </span>
                <span className="bg-emerald-400 text-neutral-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {property.status}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-6">
                {property.title}
              </h1>
              <div className="flex items-center gap-3 text-white/60 text-xl font-medium">
                <MapPin className="w-6 h-6 text-emerald-400" />
                {property.location}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Gallery Controls */}
        <div className="absolute bottom-10 right-10 flex gap-4 z-20">
          <div className="flex gap-2 p-2 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10">
            {displayImages.map((_: string, i: number) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-3 h-3 rounded-full transition-all ${activeImage === i ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-[3rem] overflow-hidden border border-neutral-100">
              <div className="bg-white p-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Price</span>
                <span className="text-3xl font-black text-neutral-900">${property.price.toLocaleString()}</span>
              </div>
              <div className="bg-white p-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Type</span>
                <span className="text-xl font-black text-neutral-900 capitalize">{property.type}</span>
              </div>
              <div className="bg-white p-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Status</span>
                <span className="text-xl font-black text-neutral-900 capitalize">{property.status}</span>
              </div>
              <div className="bg-white p-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Listing ID</span>
                <span className="text-xl font-black text-neutral-900">#PP-{property.id}</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-100" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">The Narrative</h2>
                <div className="h-px flex-1 bg-neutral-100" />
              </div>
              <p className="text-2xl text-neutral-600 leading-[1.6] font-medium whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Features/Amenities Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100">
                <h4 className="text-xl font-black mb-6 tracking-tight">Key Highlights</h4>
                <ul className="space-y-4">
                  {['Prime Location', 'Architectural Masterpiece', 'Premium Finishes', 'Sustainable Design'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-neutral-600 font-medium">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100">
                <h4 className="text-xl font-black mb-6 tracking-tight">Location Context</h4>
                <p className="text-neutral-500 font-medium leading-relaxed">
                  Situated in the heart of {property.location.split(',')[0]}, this property offers unparalleled access to the city's finest amenities and cultural landmarks.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-8">
              
              {/* Action Card */}
              <div className="bg-neutral-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-neutral-900/20">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Investment</span>
                    <span className="text-4xl font-black tracking-tighter">${property.price.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={toggleFavorite}
                    className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                      isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <form onSubmit={sendMessage} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Direct Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="I am interested in this property..."
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all resize-none font-medium"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={sending}
                    className="w-full bg-emerald-400 text-neutral-900 py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-300 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-emerald-400/10"
                  >
                    {sending ? 'Sending...' : (
                      <>
                        <MessageSquare className="w-6 h-6" />
                        Enquire Now
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{property.seller_name}</h4>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Verified Seller</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <a href={`tel:${property.seller_email}`} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                    <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Card */}
              <div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-black tracking-tight">Prime Guarantee</h4>
                </div>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                  Every transaction on Prime Property is protected by our secure escrow system and verified by our legal team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-t border-neutral-100 mt-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">You might also like</h2>
              <h3 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-[0.9]">
                SIMILAR <br />
                <span className="text-neutral-400">PROPERTIES</span>
              </h3>
            </div>
            <Link to="/search" className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 group hover:bg-neutral-800 transition-all">
              Explore More <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {similarProperties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
