import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Users, Shield, Zap, Check, ChevronRight, 
  ArrowLeft, Download, Globe, Clock, History, 
  MessageSquare, HelpCircle, ExternalLink, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { firestore } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export const Route = createFileRoute("/extensions/$slug")({
  head: ({ loaderData }) => ({
    title: `${(loaderData as any)?.name || "Extension Details"} | VIBEX`,
    meta: [
      { name: "description", content: (loaderData as any)?.description || "Premium browser extension from VIBEX." },
      { property: "og:title", content: `${(loaderData as any)?.name || "Extension"} | VIBEX` },
      { property: "og:description", content: (loaderData as any)?.description || "Premium browser extension from VIBEX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ params }: { params: any }) => {
    const extensionsRef = collection(firestore, "extensions");
    const q = query(extensionsRef, where("slug", "==", params.slug), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) throw new Error("Extension not found");
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },
  component: ExtensionDetailsPage,
});

function ExtensionDetailsPage() {
  const extension = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Extension is guaranteed by loader
  if (!extension) return null;

  if (!extension) {
    return (
      <div className="min-h-screen bg-[#050505] pt-40 text-center">
        <h1 className="text-4xl font-black">Extension not found</h1>
        <Link to="/extensions" className="text-red-500 mt-4 inline-block">Back to Marketplace</Link>
      </div>
    );
  }

  const screenshots = [
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 font-sans selection:bg-red-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Back Button */}
        <Link 
          to="/extensions" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 lg:w-48 lg:h-48 rounded-[2.5rem] bg-[#111] border border-white/5 flex items-center justify-center text-6xl shadow-2xl shadow-red-500/5 shrink-0"
          >
            {extension.icon_url ? <img src={extension.icon_url} alt="" className="w-24 h-24 object-contain" /> : '⚡'}
          </motion.div>

          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 mb-4">
                <Sparkles className="w-3 h-3" />
                Featured Tool
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4">{extension.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/40 font-medium">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-bold">{extension.rating || '4.9'}</span>
                  <span>(1.2k reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-bold">{extension.user_count || '5,000'}+</span>
                  <span>Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-green-500 font-bold uppercase tracking-tighter text-xs">Verified Safe</span>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Price</span>
                <div className="text-4xl font-black tracking-tighter">
                  {extension.price === 0 ? 'FREE' : `৳${extension.price}`}
                </div>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Link 
                  to="/checkout"
                  search={{ productId: extension.id }}
                  className="flex-1 sm:flex-none bg-white text-black font-black px-10 py-5 rounded-2xl text-[13px] uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5 text-center"
                >
                  Buy Now
                </Link>
                <Link 
                  to="/track-order"
                  className="flex-1 sm:flex-none bg-white/5 border border-white/10 hover:bg-white/10 font-black px-10 py-5 rounded-2xl text-[13px] uppercase tracking-widest transition-all active:scale-95 text-center"
                >
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Screenshots */}
            <section>
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                Screenshots
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {screenshots.map((src, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-video rounded-3xl overflow-hidden border border-white/10 cursor-zoom-in bg-white/5"
                    onClick={() => setSelectedImage(src)}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Tabs */}
            <div className="space-y-8">
              <div className="flex border-b border-white/5 gap-8 overflow-x-auto no-scrollbar">
                {['Overview', 'Features', 'Changelog', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab.toLowerCase() ? 'text-white' : 'text-white/20 hover:text-white/40'
                    }`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="prose prose-invert max-w-none space-y-6"
                    >
                      <p className="text-white/60 leading-relaxed text-lg font-medium">
                        {extension.description}
                      </p>
                      <p className="text-white/40 leading-relaxed">
                        Built for high-performance workflows, this extension provides a seamless integration with your browser. 
                        Our team has optimized every line of code to ensure it doesn't impact your browser's speed or memory usage.
                        Join thousands of power users who have already upgraded their workflow with VIBEX tools.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'features' && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid sm:grid-cols-2 gap-6"
                    >
                      {[
                        { title: "One-Click Install", desc: "No complex setup needed. Get started in seconds." },
                        { title: "Cloud Sync", desc: "Your settings follow you across every device." },
                        { title: "Dark Mode Ready", desc: "Native support for dark and light browser themes." },
                        { title: "Privacy First", desc: "We never track your data or sell your information." },
                      ].map((f, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Check className="w-5 h-5 text-red-500" />
                          </div>
                          <h4 className="font-black">{f.title}</h4>
                          <p className="text-xs text-white/40 font-medium">{f.desc}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-[#111] border border-white/5 space-y-8">
              <h3 className="text-lg font-black uppercase tracking-widest">Specifications</h3>
              
              <div className="space-y-6">
                {[
                  { label: "Version", value: "v2.4.0", icon: <History className="w-4 h-4" /> },
                  { label: "Updated", value: "2 days ago", icon: <Clock className="w-4 h-4" /> },
                  { label: "Size", value: "4.2 MB", icon: <Download className="w-4 h-4" /> },
                  { label: "Language", value: "English", icon: <Globe className="w-4 h-4" /> },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3 text-white/40 font-bold uppercase tracking-tighter text-[10px]">
                      {spec.icon}
                      {spec.label}
                    </div>
                    <div className="font-black text-white/80">{spec.value}</div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20">Compatibility</h4>
                 <div className="flex flex-wrap gap-2">
                   {['Chrome', 'Edge', 'Brave', 'Opera'].map(browser => (
                     <span key={browser} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold border border-white/5">
                       {browser}
                     </span>
                   ))}
                 </div>
              </div>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Support Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-purple-600 space-y-6">
               <h3 className="text-xl font-black">Need Help?</h3>
               <p className="text-white/80 text-sm font-medium leading-relaxed">
                 Our technical team is available 24/7 to help you with installation and usage.
               </p>
               <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                 Contact Support
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
             <motion.img 
               layoutId="lightbox"
               src={selectedImage} 
               className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10" 
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
