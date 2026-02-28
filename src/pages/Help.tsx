import { motion } from 'motion/react';
import { HelpCircle, MessageCircle, FileText, Phone, Search, ChevronRight } from 'lucide-react';

export default function Help() {
  const faqs = [
    { q: 'How do I list my property?', a: 'To list a property, navigate to your dashboard and click on "Add Property". Fill in the required details and submit for review.' },
    { q: 'What are the fees for selling?', a: 'Listing is free. We only charge a small commission once your property is successfully sold.' },
    { q: 'How do I contact a buyer?', a: 'You can communicate with potential buyers through the "Messages" tab in your dashboard.' },
    { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption and secure payment gateways to protect your information.' }
  ];

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-neutral-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-4">Help Center</h1>
          <p className="text-neutral-500 text-xl font-medium">How can we assist you today?</p>
        </motion.div>

        <div className="relative mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search for help articles..."
            className="w-full pl-16 pr-8 py-6 bg-neutral-50 border border-neutral-100 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100 hover:bg-neutral-900 group transition-all duration-500">
            <MessageCircle className="w-10 h-10 text-neutral-900 group-hover:text-emerald-400 mb-6 transition-colors" />
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-white transition-colors">Live Chat</h3>
            <p className="text-neutral-500 group-hover:text-neutral-400 mb-8 transition-colors">Speak with our support team in real-time for immediate assistance.</p>
            <button className="text-neutral-900 group-hover:text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
              Start Chat <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-10 bg-neutral-50 rounded-[3rem] border border-neutral-100 hover:bg-neutral-900 group transition-all duration-500">
            <FileText className="w-10 h-10 text-neutral-900 group-hover:text-emerald-400 mb-6 transition-colors" />
            <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-white transition-colors">Documentation</h3>
            <p className="text-neutral-500 group-hover:text-neutral-400 mb-8 transition-colors">Browse our detailed guides and tutorials for sellers and buyers.</p>
            <button className="text-neutral-900 group-hover:text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
              View Guides <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-8">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white border border-neutral-100 rounded-3xl hover:shadow-lg transition-all"
            >
              <h4 className="text-xl font-black text-neutral-900 mb-3">{faq.q}</h4>
              <p className="text-neutral-500 font-medium leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-neutral-900 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12">
          <div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">Still need help?</h3>
            <p className="text-neutral-400 font-medium">Our support team is available 24/7 via phone or email.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-neutral-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-neutral-100 transition-all">
              <Phone className="w-4 h-4" /> Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
