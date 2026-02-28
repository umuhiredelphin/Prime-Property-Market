import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Map, Building2, ChevronRight, ChevronLeft, 
  Upload, ShieldCheck, CreditCard, CheckCircle2, 
  Phone, Mail, MapPin, DollarSign, Image as ImageIcon,
  Camera, FileText, Smartphone, Loader2, Sparkles,
  Bed, Bath, Car, Trees, Layers, Ruler, Route, Briefcase
} from 'lucide-react';
import { useAuth } from '../../App';
import { PropertyType } from '../../types';

interface AddPropertyFlowProps {
  onComplete: () => void;
}

export default function AddPropertyFlow({ onComplete }: AddPropertyFlowProps) {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'house' as PropertyType,
    // Step 1: Type Specific
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    has_garden: false,
    floors: 1,
    land_size: 0,
    zoning_type: '',
    has_road_access: false,
    office_space: 0,
    parking_capacity: 0,
    business_type_allowed: '',
    
    // Step 2: Basic Info
    title: '',
    description: '',
    price: '',
    location: '',
    phone_contact: '',
    email_contact: '',
    
    // Step 3: Images
    images: [] as string[],
    
    // Step 4: Verification
    id_number: '',
    id_image: '',
    selfie_image: '',
    
    // Step 5: Payment
    is_featured: false,
    payment_method: 'mobile_money'
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPreviews = [...imagePreviews];
    const newImages = [...formData.images];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        newImages.push(reader.result as string);
        setImagePreviews([...newPreviews]);
        setFormData(prev => ({ ...prev, images: [...newImages] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const sendOTP = () => {
    if (!formData.phone_contact) return;
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1500);
  };

  const verifyOTP = () => {
    if (otpCode === '1234') {
      setOtpVerified(true);
    } else {
      alert('Invalid OTP. Use 1234 for demo.');
    }
  };

  const handleSubmit = async () => {
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
          is_approved: 0, // Admin must approve
          status: 'for sale'
        })
      });
      
      if (res.ok) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-12">
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Step 01</span>
              <h2 className="text-5xl font-black tracking-tighter">CHOOSE PROPERTY TYPE</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'house', label: 'House', icon: Home, desc: 'Residential buildings' },
                { id: 'land', label: 'Land', icon: Map, desc: 'Empty plots & acreage' },
                { id: 'commercial', label: 'Commercial', icon: Building2, desc: 'Offices & retail' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, type: type.id as PropertyType })}
                  className={`p-10 rounded-[3rem] border-2 transition-all text-left group ${
                    formData.type === type.id 
                      ? 'bg-emerald-500 border-emerald-500 text-black' 
                      : 'bg-[#0a0a0a] border-white/5 text-white hover:border-white/20'
                  }`}
                >
                  <type.icon className={`w-12 h-12 mb-6 ${formData.type === type.id ? 'text-black' : 'text-emerald-500'}`} />
                  <h3 className="text-2xl font-black mb-2">{type.label}</h3>
                  <p className={`text-sm font-bold ${formData.type === type.id ? 'text-black/60' : 'text-neutral-500'}`}>{type.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 mt-12">
              <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-xs text-neutral-500">Specifications</h4>
              
              {formData.type === 'house' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Bed className="w-4 h-4" /> Bedrooms
                    </label>
                    <input 
                      type="number" 
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Bath className="w-4 h-4" /> Bathrooms
                    </label>
                    <input 
                      type="number" 
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Car className="w-4 h-4" /> Parking
                    </label>
                    <input 
                      type="number" 
                      value={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Trees className="w-4 h-4" /> Garden
                    </label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFormData({ ...formData, has_garden: true })}
                        className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.has_garden ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500'}`}
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setFormData({ ...formData, has_garden: false })}
                        className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!formData.has_garden ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Layers className="w-4 h-4" /> Floors
                    </label>
                    <input 
                      type="number" 
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'land' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Ruler className="w-4 h-4" /> Size (sqm)
                    </label>
                    <input 
                      type="number" 
                      value={formData.land_size}
                      onChange={(e) => setFormData({ ...formData, land_size: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <MapPin className="w-4 h-4" /> Zoning
                    </label>
                    <input 
                      type="text" 
                      value={formData.zoning_type}
                      onChange={(e) => setFormData({ ...formData, zoning_type: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                      placeholder="Residential"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Route className="w-4 h-4" /> Road Access
                    </label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFormData({ ...formData, has_road_access: true })}
                        className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.has_road_access ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500'}`}
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setFormData({ ...formData, has_road_access: false })}
                        className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!formData.has_road_access ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-500'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'commercial' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Building2 className="w-4 h-4" /> Office Space (sqm)
                    </label>
                    <input 
                      type="number" 
                      value={formData.office_space}
                      onChange={(e) => setFormData({ ...formData, office_space: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Car className="w-4 h-4" /> Parking Capacity
                    </label>
                    <input 
                      type="number" 
                      value={formData.parking_capacity}
                      onChange={(e) => setFormData({ ...formData, parking_capacity: Number(e.target.value) })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                      <Briefcase className="w-4 h-4" /> Business Types
                    </label>
                    <input 
                      type="text" 
                      value={formData.business_type_allowed}
                      onChange={(e) => setFormData({ ...formData, business_type_allowed: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-emerald-500 font-black text-2xl"
                      placeholder="Retail, Office"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={nextStep}
              className="w-full bg-emerald-500 text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20"
            >
              Continue to Step 2
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Step 02</span>
              <h2 className="text-5xl font-black tracking-tighter">BASIC INFORMATION</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Property Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="Penthouse X"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Valuation ($)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Location</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Contact Phone ☎️</label>
                  <input 
                    type="tel" 
                    value={formData.phone_contact}
                    onChange={(e) => setFormData({ ...formData, phone_contact: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="+1 234 567 890"
                  />
                  <p className="text-[10px] text-neutral-700 mt-2 font-bold uppercase tracking-widest">Buyers will call this number</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Contact Email (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email_contact}
                    onChange={(e) => setFormData({ ...formData, email_contact: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 rounded-[2rem] p-8 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-lg resize-none"
                placeholder="Specify asset parameters..."
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="px-12 bg-white/5 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-emerald-500 text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20"
              >
                Continue to Step 3
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Step 03</span>
              <h2 className="text-5xl font-black tracking-tighter">IMAGE UPLOAD</h2>
              <p className="text-neutral-500 font-bold mt-2 uppercase tracking-widest text-xs">Minimum 5 high-quality images required</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-[3rem] p-20 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-16 h-16 text-neutral-800 group-hover:text-emerald-500 mx-auto mb-6 transition-colors" />
              <h3 className="text-2xl font-black mb-2">DRAG & DROP</h3>
              <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs">or click to browse files (Max 5MB each)</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
                    <img src={src} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newPreviews = [...imagePreviews];
                        const newImages = [...formData.images];
                        newPreviews.splice(i, 1);
                        newImages.splice(i, 1);
                        setImagePreviews(newPreviews);
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="px-12 bg-white/5 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                disabled={imagePreviews.length < 5}
                className="flex-1 bg-emerald-500 text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {imagePreviews.length < 5 ? `Upload ${5 - imagePreviews.length} more` : 'Continue to Step 4'}
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Step 04</span>
              <h2 className="text-5xl font-black tracking-tighter">SELLER VERIFICATION</h2>
              <p className="text-neutral-500 font-bold mt-2 uppercase tracking-widest text-xs">Mandatory for platform trust & security</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-4">National ID Number</label>
                  <input 
                    type="text" 
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="w-full bg-transparent border-b-2 border-white/10 py-4 outline-none focus:border-emerald-500 transition-all font-black text-2xl"
                    placeholder="ID-XXXX-XXXX"
                  />
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Verification Documents</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => {/* Simulate upload */}}
                      className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <FileText className="w-8 h-8 text-neutral-700 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">National ID</span>
                    </div>
                    <div 
                      onClick={() => {/* Simulate upload */}}
                      className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <Camera className="w-8 h-8 text-neutral-700 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Selfie with ID</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-10 rounded-[3rem] border border-white/5 space-y-8">
                <h4 className="text-xl font-black tracking-tight">PHONE VERIFICATION</h4>
                <p className="text-neutral-500 font-bold text-sm">Verify your contact number via SMS OTP</p>
                
                <div className="space-y-6">
                  <div className="relative">
                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                    <input 
                      type="tel" 
                      readOnly
                      value={formData.phone_contact}
                      className="w-full pl-16 pr-6 py-5 bg-white/5 rounded-2xl border border-white/5 outline-none font-black text-xl text-neutral-400"
                    />
                  </div>
                  
                  {!otpSent ? (
                    <button 
                      onClick={sendOTP}
                      disabled={loading}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                    </button>
                  ) : !otpVerified ? (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        maxLength={4}
                        placeholder="Enter 4-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-white/10 border border-emerald-500/50 py-5 rounded-2xl text-center font-black text-3xl tracking-[0.5em] outline-none"
                      />
                      <button 
                        onClick={verifyOTP}
                        className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
                      >
                        Verify Code
                      </button>
                      <p className="text-center text-[10px] font-black text-neutral-600 uppercase tracking-widest">Demo Code: 1234</p>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-4 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-black uppercase tracking-widest text-xs">Phone Verified Successfully</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="px-12 bg-white/5 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button 
                onClick={nextStep}
                disabled={!otpVerified || !formData.id_number}
                className="flex-1 bg-emerald-500 text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 disabled:opacity-50"
              >
                Continue to Final Step
              </button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="text-center mb-12">
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Step 05</span>
              <h2 className="text-5xl font-black tracking-tighter">PREMIUM FEATURES</h2>
              <p className="text-neutral-500 font-bold mt-2 uppercase tracking-widest text-xs">Boost your visibility and reach more buyers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button 
                onClick={() => setFormData({ ...formData, is_featured: false })}
                className={`p-12 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${
                  !formData.is_featured ? 'bg-white text-black border-white' : 'bg-[#0a0a0a] border-white/5 text-white hover:border-white/20'
                }`}
              >
                <h3 className="text-3xl font-black mb-4 tracking-tighter">BASIC LISTING</h3>
                <p className={`text-sm font-bold mb-8 ${!formData.is_featured ? 'text-black/60' : 'text-neutral-500'}`}>Standard visibility in search results</p>
                <p className="text-4xl font-black">FREE</p>
                {!formData.is_featured && <CheckCircle2 className="absolute top-8 right-8 w-8 h-8 text-black" />}
              </button>

              <button 
                onClick={() => setFormData({ ...formData, is_featured: true })}
                className={`p-12 rounded-[3rem] border-2 text-left transition-all relative overflow-hidden group ${
                  formData.is_featured ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-[#0a0a0a] border-white/5 text-white hover:border-white/20'
                }`}
              >
                <div className="absolute top-0 right-0 p-6">
                  <Sparkles className={`w-12 h-12 ${formData.is_featured ? 'text-black/20' : 'text-emerald-500/20'}`} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">FEATURED LISTING</h3>
                <p className={`text-sm font-bold mb-8 ${formData.is_featured ? 'text-black/60' : 'text-neutral-500'}`}>Homepage placement + Priority in search</p>
                <p className="text-4xl font-black">$49.99</p>
                {formData.is_featured && <CheckCircle2 className="absolute top-8 right-8 w-8 h-8 text-black" />}
              </button>
            </div>

            {formData.is_featured && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] p-12 rounded-[3rem] border border-white/5"
              >
                <h4 className="text-xl font-black mb-8 uppercase tracking-widest text-xs text-neutral-500">Payment Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'bank', label: 'Bank Transfer', icon: Building2 }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setFormData({ ...formData, payment_method: method.id })}
                      className={`p-6 rounded-2xl border transition-all flex items-center gap-4 ${
                        formData.payment_method === method.id 
                          ? 'bg-white/10 border-emerald-500 text-emerald-400' 
                          : 'bg-white/5 border-white/5 text-neutral-500 hover:bg-white/10'
                      }`}
                    >
                      <method.icon className="w-6 h-6" />
                      <span className="font-black uppercase tracking-widest text-[10px]">{method.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="px-12 bg-white/5 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-emerald-500 text-black py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalize & Submit'}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12 flex justify-between items-center px-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step >= i ? 'bg-emerald-500 text-black' : 'bg-white/5 text-neutral-700'
            }`}>
              {i}
            </div>
            {i < 5 && <div className={`w-12 h-0.5 rounded-full ${step > i ? 'bg-emerald-500' : 'bg-white/5'}`} />}
          </div>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
