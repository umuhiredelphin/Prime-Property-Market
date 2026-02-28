import { useAuth } from '../../App';
import { motion } from 'motion/react';
import { User, Mail, Shield, Calendar, Edit2, Camera } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
            <div className="relative">
              <div className="w-40 h-40 bg-neutral-900 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white/5 shadow-xl">
                <User className="w-20 h-20 text-neutral-700" />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-4xl font-black text-white tracking-tighter">{user.name.toUpperCase()}</h1>
                <span className="bg-emerald-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
              <p className="text-neutral-500 font-bold text-lg mb-6 uppercase tracking-widest text-xs">Premium Member since 2024</p>
              <button className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-emerald-500/10">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-xs">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Email Address</p>
                    <p className="font-bold text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Account Status</p>
                    <p className="font-bold text-emerald-500 uppercase text-sm tracking-widest">Verified</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Joined Date</p>
                    <p className="font-bold text-white">January 15, 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-xs">Security & Privacy</h3>
              <div className="space-y-4">
                <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <span className="font-bold text-white">Change Password</span>
                  <Edit2 className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                </button>
                <button className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-left hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <span className="font-bold text-white">Two-Factor Auth</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-white/10 px-2 py-1 rounded">Disabled</span>
                </button>
                <button className="w-full p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-left hover:bg-emerald-500/10 transition-colors flex items-center justify-between group">
                  <span className="font-bold text-emerald-500">Deactivate Account</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
