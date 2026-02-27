import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../App';
import { MapPin, Calendar, User, Phone, MessageSquare, Heart, Share2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        setLoading(false);
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
    setSending(false);
    setMessage('');
    alert('Message sent successfully!');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="h-[60vh] bg-neutral-200 rounded-[3rem] animate-pulse" />
    </div>
  );

  if (!property) return <div className="text-center py-20">Property not found</div>;

  const images = JSON.parse(property.images as any || '[]');
  const displayImages = images.length > 0 ? images : [`https://picsum.photos/seed/${property.id}/1200/800`];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-500">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-neutral-900">Search</Link>
        <span>/</span>
        <span className="text-neutral-900 line-clamp-1">{property.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2 space-y-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-neutral-100 group">
              <img 
                src={displayImages[activeImage]} 
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {displayImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : displayImages.length - 1))}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev < displayImages.length - 1 ? prev + 1 : 0))}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute top-6 right-6 flex gap-3">
                <button 
                  onClick={toggleFavorite}
                  className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                    isFavorite ? 'bg-red-500 border-red-500 text-white' : 'bg-white/90 border-neutral-200 text-neutral-900'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="w-12 h-12 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-full flex items-center justify-center text-neutral-900">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {displayImages.map((img: string, i: number) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative shrink-0 w-32 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-neutral-900 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-neutral-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                {property.type}
              </span>
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                {property.status}
              </span>
              <div className="flex items-center gap-1 text-neutral-500 text-sm font-medium ml-auto">
                <Calendar className="w-4 h-4" />
                Listed on {new Date(property.created_at).toLocaleDateString()}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-4 leading-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-neutral-500 text-lg mb-8">
              <MapPin className="w-5 h-5" />
              {property.location}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 bg-white rounded-[2rem] border border-neutral-100 mb-12">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Price</span>
                <p className="text-2xl font-black text-neutral-900">${property.price.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Type</span>
                <p className="text-lg font-bold text-neutral-900 capitalize">{property.type}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</span>
                <p className="text-lg font-bold text-neutral-900 capitalize">{property.status}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID</span>
                <p className="text-lg font-bold text-neutral-900">#PP-{property.id}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black tracking-tight">Description</h3>
              <p className="text-neutral-600 leading-relaxed text-lg whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Seller */}
        <div className="space-y-8">
          <div className="sticky top-28 space-y-8">
            {/* Seller Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-900/5">
              <h3 className="text-xl font-black mb-6">Listed by</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-neutral-900">{property.seller_name}</h4>
                  <p className="text-neutral-500 text-sm">Professional Seller</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Verified Identity</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Fast Responder</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`tel:${property.seller_email}`} 
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-neutral-900" />
                  <span className="text-xs font-bold uppercase">Call</span>
                </a>
                <a 
                  href={`https://wa.me/1234567890`} 
                  target="_blank"
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase text-emerald-600">WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-xl font-black mb-6">Enquire Now</h3>
              <form onSubmit={sendMessage} className="space-y-4">
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I'm interested in this property..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none"
                  required
                />
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full bg-white text-neutral-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
              <p className="mt-4 text-[10px] text-center text-white/40 font-medium uppercase tracking-widest">
                By clicking send, you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
