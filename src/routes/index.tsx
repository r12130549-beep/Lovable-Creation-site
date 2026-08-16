import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Shield, Zap, Search, LayoutDashboard, ChevronDown, Check, Menu, X, User, ShoppingBag, CreditCard, Globe, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getAppSettings } from "@/lib/settings.functions";
import { useLanguage, translations } from "@/hooks/use-language";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Lovable Creation | Premium Browser Extension Store",
    meta: [
      { name: "description", content: "The hub for elite browser tools. Discover verified, high-performance extensions to supercharge your productivity." },
      { property: "og:title", content: "Lovable Creation | Premium Extension Store" },
      { property: "og:description", content: "The hub for elite browser tools. Discover verified, high-performance extensions to supercharge your productivity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = translations[lang];

  const { data: settings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => getAppSettings()
  });

  const serverStatus = settings?.['server_status'] || 'Online';
  const offlineMessage = settings?.['offline_message'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl h-12">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Lovable Creation</span>
          </Link>

          <div className="hidden lg:flex items-center gap-3 text-[7px] font-bold uppercase tracking-widest text-white/50 bg-white/5 px-2 py-1 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${serverStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} />
               <span className={serverStatus === 'Online' ? 'text-green-500' : 'text-red-500'}>
                 {t.serverStatus} {serverStatus}
               </span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-white/50">
            <Link to="/" className="hover:text-white transition-colors">{t.home}</Link>
            <Link to="/extensions" className="hover:text-white transition-colors">{t.extensions}</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">{t.pricing}</Link>
            <a href="#features" className="hover:text-white transition-colors">{t.features}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t.faq}</a>
            <Link to="/track-order" className="hover:text-red-500 transition-colors bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-[8px]">{t.trackOrder}</Link>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
               <button 
                onClick={() => setLang('EN')}
                className={`px-2 py-1 text-[8px] font-black rounded-lg transition-colors ${lang === 'EN' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
               >EN</button>
               <button 
                onClick={() => setLang('BN')}
                className={`px-2 py-1 text-[8px] font-black rounded-lg transition-colors ${lang === 'BN' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
               >BN</button>
            </div>

            <div className="flex items-center gap-4">
              {/* Login option removed as requested */}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-1.5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-12 left-0 right-0 bg-black/95 border-b border-white/10 p-6 space-y-6 backdrop-blur-2xl z-50 overflow-y-auto max-h-[calc(100vh-80px)]"
            >
              <div className="flex flex-col gap-6 text-lg font-bold">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>{t.home}</Link>
                <Link to="/extensions" onClick={() => setIsMenuOpen(false)}>{t.extensions}</Link>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>{t.pricing}</Link>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>{t.features}</a>
                <a href="#faq" onClick={() => setIsMenuOpen(false)}>{t.faq}</a>
                <Link to="/track-order" className="text-red-500" onClick={() => setIsMenuOpen(false)}>{t.trackOrder}</Link>
                {/* Login option removed as requested */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            {serverStatus === 'Offline' && offlineMessage && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                {offlineMessage}
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-red-500 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {t.marketplaceLive}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[100px] leading-[0.9] font-black tracking-tight mb-10 uppercase">
              {t.heroTitlePrefix} <br />{t.heroTitlePlatform} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-[length:200%_auto] animate-gradient-x">{t.heroTitleAI}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/40 mb-12 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-widest text-[10px]">
              {t.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                to="/extensions"
                className="group relative bg-[#111] border border-white/5 hover:border-red-500/30 px-8 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-red-500/5 min-w-[240px]"
              >
                <ShoppingBag className="w-8 h-8 text-red-500" />
                {t.buyCredits}
              </Link>
              <Link 
                to="/extensions"
                className="group relative bg-[#111] border border-white/5 hover:border-purple-500/30 px-8 py-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-500/5 min-w-[240px]"
              >
                <Zap className="w-8 h-8 text-purple-500" />
                {t.extensionLicense}
              </Link>
            </div>
          </motion.div>

          {/* Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
            <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-4 shadow-[0_0_100px_rgba(255,0,0,0.1)] overflow-hidden">
               <div className="bg-[#050505] rounded-[2rem] h-[500px] overflow-hidden flex flex-col">
                  <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-white/5 h-6 rounded-lg" />
                  </div>
                  <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                      <div className="h-10 w-1/2 bg-white/10 rounded-xl" />
                      <div className="h-40 bg-white/5 rounded-[2rem]" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-2xl" />
                        <div className="h-24 bg-white/5 rounded-2xl" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-64 bg-gradient-to-br from-red-600/20 to-purple-600/20 rounded-[2rem] border border-white/5" />
                      <div className="h-20 bg-white/5 rounded-2xl" />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-24 relative border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: t.trustStats.dailyUsers, value: "85K+", suffix: "Users" },
              { label: t.trustStats.extensions, value: "420+", suffix: "Tools" },
              { label: t.trustStats.successRate, value: "99.9%", suffix: "Reliable" },
              { label: t.trustStats.satisfaction, value: "4.9/5", suffix: "Rating" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemVariants}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">{t.builtForWeb}</h2>
              <p className="text-white/40 text-lg leading-relaxed font-medium">{t.heroDesc}</p>
            </div>
            <Link to="/extensions" className="text-sm font-bold uppercase tracking-widest text-red-500 flex items-center gap-2 group">
              {t.viewAllTools} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Ultra Performance", desc: "Optimized code that never slows down your browsing experience.", icon: <Zap className="w-8 h-8 text-red-500" /> },
              { title: "Military Security", desc: "Every tool is manually verified and audited for maximum safety.", icon: <Shield className="w-8 h-8 text-purple-500" /> },
              { title: "Custom Ecosystem", desc: "Connect multiple tools together for a seamless custom workflow.", icon: <LayoutDashboard className="w-8 h-8 text-red-500" /> },
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-[#111] border border-white/5 hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white/2 backdrop-blur-sm border-y border-white/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">{t.questions}</h2>
            <p className="text-white/40 font-medium">{t.heroDesc}</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How do I install the extensions?", a: "Once you purchase or download a free extension, you'll get a direct download link and installation guide for your specific browser." },
              { q: "Are the tools safe for my data?", a: "Yes, all extensions on VIBEX undergo a rigorous security audit. We strictly follow privacy-first principles." },
              { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee if the tool doesn't meet your expectations or doesn't work as described." },
              { q: "How many devices can I use?", a: "Standard licenses allow up to 3 active devices. Pro and Enterprise plans offer more flexibility." },
            ].map((faq, i) => (
              <div key={i} className="p-8 rounded-3xl bg-black border border-white/5 hover:border-white/10 transition-all">
                <button className="w-full flex justify-between items-center text-left group">
                  <span className="text-xl font-bold">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                </button>
                <p className="mt-4 text-white/40 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-12 border-t border-white/5 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter">Lovable Creation</span>
              </Link>
              <p className="text-white/40 text-lg max-w-sm mb-8 leading-relaxed">
                Empowering your browser with the next generation of premium productivity tools.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholder */}
                {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer" />)}
              </div>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase tracking-widest text-[11px] text-red-500">Navigation</h4>
              <ul className="space-y-4 text-sm font-bold text-white/40">
                <li><Link to="/extensions" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase tracking-widest text-[11px] text-red-500">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-black uppercase tracking-[0.2em] text-white/20">
            <div>© 2026 VIBEX INDUSTRIES. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Status</a>
              <a href="#" className="hover:text-white transition-colors">System</a>
              <a href="#" className="hover:text-white transition-colors">Direct</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

