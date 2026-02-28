import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Lock, Eye, Globe, CreditCard, ChevronRight } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'Notifications',
      icon: Bell,
      color: 'text-emerald-500',
      items: ['Email Notifications', 'Push Notifications', 'SMS Alerts']
    },
    {
      title: 'Privacy & Security',
      icon: Lock,
      color: 'text-emerald-500',
      items: ['Password', 'Two-Factor Authentication', 'Login History']
    },
    {
      title: 'Appearance',
      icon: Eye,
      color: 'text-emerald-500',
      items: ['Dark Mode', 'Language', 'Region']
    },
    {
      title: 'Billing',
      icon: CreditCard,
      color: 'text-emerald-500',
      items: ['Payment Methods', 'Subscription Plan', 'Invoices']
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <SettingsIcon className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Settings</h1>
              <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">Manage your account preferences and security</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0a] rounded-[3rem] p-10 border border-white/5"
              >
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <section.icon className={`w-7 h-7 ${section.color}`} />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-sm">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <button
                      key={item}
                      className="w-full p-6 bg-black/40 rounded-[1.5rem] border border-white/5 flex items-center justify-between group hover:border-emerald-500/50 transition-all"
                    >
                      <span className="font-bold text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest text-xs">{item}</span>
                      <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-12 bg-emerald-500 rounded-[4rem] text-black flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-4xl font-black mb-2 tracking-tighter">NEED ASSISTANCE?</h3>
              <p className="text-black/60 font-bold text-lg">Our support team is available 24/7 to assist you.</p>
            </div>
            <button className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-2xl relative z-10">
              Contact Support
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
