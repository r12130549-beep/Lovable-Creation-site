import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';

export const Route = createFileRoute("/pricing")({
  head: () => ({
    title: "Pricing Plans | VIBEX",
    meta: [
      { name: "description", content: "Choose the perfect plan for your browser needs. Flexible licensing from free to lifetime access." },
      { property: "og:title", content: "Pricing Plans | VIBEX" },
      { property: "og:description", content: "Flexible licensing plans for VIBEX premium extensions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: 'FREE',
    price: '0',
    description: 'Perfect for getting started.',
    features: ['Access to Free Extensions', 'Community Support', 'Basic Updates', '1 Active Device'],
    icon: Zap,
    color: 'text-blue-500',
  },
  {
    name: 'PRO',
    price: '2,500',
    description: 'Best for power users.',
    features: ['All Premium Extensions', 'Priority Support', 'Early Access Features', '3 Active Devices', 'Ad-free Experience'],
    highlight: true,
    icon: Sparkles,
    color: 'text-red-500',
  },
  {
    name: 'LIFETIME',
    price: '10,000',
    description: 'One-time payment, forever.',
    features: ['Everything in Pro', 'Lifetime Updates', 'Unlimited Devices', 'Exclusive Beta Access', 'Custom Profile Badge'],
    icon: Crown,
    color: 'text-purple-500',
  }
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-40 pb-32 font-sans selection:bg-red-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 mb-6 backdrop-blur-sm">
              <Shield className="w-3 h-3" />
              Flexible Licensing
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Elite Access <br /><span className="text-white/40">Pricing Plans</span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Choose the perfect plan for your browser needs. Every plan includes our core performance optimization engine.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`group p-10 rounded-[3rem] border transition-all relative overflow-hidden flex flex-col ${
                plan.highlight 
                  ? 'bg-[#111] border-red-500/30 shadow-2xl shadow-red-500/5' 
                  : 'bg-[#0A0A0A] border-white/5 hover:border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-purple-600 px-6 py-2 rounded-bl-3xl text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 ${plan.color} group-hover:scale-110 transition-transform duration-500`}>
                  <plan.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black tracking-tighter">৳{plan.price}</span>
                  {plan.name !== 'LIFETIME' && <span className="text-white/20 text-xs font-black uppercase tracking-widest">/ Month</span>}
                </div>
                <p className="text-white/40 text-sm font-medium leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">What's Included</div>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-4 group/item">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-green-500/50 transition-colors">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-bold text-white/60 group-hover/item:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/checkout"
                search={{ plan: plan.name.toLowerCase() }}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center transition-all active:scale-95 shadow-xl ${
                  plan.highlight 
                    ? 'bg-white text-black hover:bg-white/90 shadow-white/5' 
                    : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white shadow-black/20'
                }`}
              >
                Choose {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 rounded-[3.5rem] bg-[#0A0A0A] border border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
          <h2 className="text-2xl font-black mb-4">Enterprise Needs?</h2>
          <p className="text-white/40 mb-8 max-w-xl mx-auto font-medium">Looking for bulk licenses or custom browser solutions for your entire organization?</p>
          <button className="px-10 py-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Contact Sales Team
          </button>
        </div>
      </div>
    </div>
  );
}
