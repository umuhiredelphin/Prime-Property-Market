import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { PROPERTY_TYPES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Map, Warehouse, Landmark, Home as HomeIcon,
  ArrowRight, CheckCircle2, Image as ImageIcon, MapPin, 
  DollarSign, ChevronLeft, Sparkles, ShieldCheck
} from 'lucide-react';

export default function Sell() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    type: '',
    images: [] as string[]
  });

  const propertyIcons: Record<string, any> = {
    house: HomeIcon,
    land: Map,
    apartment: Building2,
    office: Warehouse,
    commercial: Landmark
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return navigate('/auth');
    
    setLoading(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          images: formData.images.length > 0 ? formData.images : [`https://picsum.photos/seed/${Math.random()}/1200/800`]
        })
      });

      if (res.ok) {
        setStep(4); // Success step
      } else {
        alert('Failed to list property. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-4">Seller Account Required</h2>
          <p className="text-neutral-500 mb-8">You need a seller account to list properties. You can change your role in account settings or create a new seller account.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`flex items-center gap-2 ${step >= s ? 'text-neutral-900' : 'text-neutral-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                    step === s ? 'border-neutral-900 bg-neutral-900 text-white' : 
                    step > s ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">
                    {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-neutral-900"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">What are you selling?</h1>
                <p className="text-neutral-500 font-medium">Select the category that best fits your property.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROPERTY_TYPES.map((t) => {
                  const Icon = propertyIcons[t.value] || HomeIcon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => { setFormData({ ...formData, type: t.value }); nextStep(); }}
                      className={`p-8 rounded-[2.5rem] border-2 transition-all text-left group ${
                        formData.type === t.value 
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xl shadow-neutral-900/20' 
                          : 'border-white bg-white hover:border-neutral-200 shadow-sm'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                        formData.type === t.value ? 'bg-white/10' : 'bg-neutral-50 text-neutral-400'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{t.label}</h3>
                      <p className={`text-sm ${formData.type === t.value ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        List your {t.label.toLowerCase()} for sale or rent.
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-neutral-100"
            >
              <button onClick={prevStep} className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-neutral-900 mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Category
              </button>

              <h2 className="text-3xl font-black text-neutral-900 mb-10">Property Details</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Property Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Modern Villa with Ocean View"
                    className="w-full px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                      <input 
                        type="number" 
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                      <input 
                        type="text" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell potential buyers about the features, amenities, and surroundings..."
                    className="w-full h-40 px-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium text-neutral-600 resize-none placeholder:text-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Image URL (Optional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => setFormData({ ...formData, images: e.target.value ? [e.target.value] : [] })}
                      className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!formData.title || !formData.price || !formData.location || !formData.description}
                  className="w-full bg-neutral-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-neutral-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Review Listing
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-sm border border-neutral-100"
            >
              <button onClick={prevStep} className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-neutral-900 mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Details
              </button>

              <h2 className="text-3xl font-black text-neutral-900 mb-10">Review & Publish</h2>

              <div className="space-y-10">
                <div className="bg-neutral-50 rounded-[2.5rem] p-8 border border-neutral-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
                        {formData.type}
                      </span>
                      <h3 className="text-2xl font-black text-neutral-900">{formData.title}</h3>
                      <p className="text-neutral-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" /> {formData.location}
                      </p>
                    </div>
                    <p className="text-3xl font-black text-neutral-900">${Number(formData.price).toLocaleString()}</p>
                  </div>
                  <p className="text-neutral-600 leading-relaxed line-clamp-3 italic">
                    "{formData.description}"
                  </p>
                </div>

                <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex gap-6 items-center">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900">Quality Check</h4>
                    <p className="text-amber-700 text-sm">Your listing will be reviewed by our team before going live. This usually takes less than 24 hours.</p>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-neutral-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-neutral-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {loading ? 'Publishing...' : (
                    <>
                      Publish Listing <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">Listing Submitted!</h1>
              <p className="text-neutral-500 max-w-md mx-auto mb-12 text-lg">
                Your property has been submitted for approval. You can track its status in your dashboard.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-neutral-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => { setStep(1); setFormData({ title: '', description: '', price: '', location: '', type: '', images: [] }); }}
                  className="bg-white text-neutral-900 border border-neutral-200 px-10 py-4 rounded-2xl font-bold hover:bg-neutral-50 transition-all"
                >
                  List Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
