import { createFileRoute, Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Users, ArrowRight, Zap, Shield, LayoutDashboard, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getExtensions } from '@/lib/extensions.functions';

export const Route = createFileRoute("/extensions")({
  head: () => ({
    title: "Marketplace | VIBEX Extensions",
    meta: [
      { name: "description", content: "Browse our curated collection of premium browser extensions. Performance-optimized and manually verified." },
      { property: "og:title", content: "Marketplace | VIBEX Extensions" },
      { property: "og:description", content: "Browse our curated collection of premium browser extensions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExtensionsPage,
});

const CATEGORIES = ['All', 'AI', 'Productivity', 'Developer', 'Automation', 'Social', 'Utilities'];

function ExtensionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const getExtensionsFn = useServerFn(getExtensions);

  const { data: extensions, isLoading } = useQuery({
    queryKey: ['extensions', activeCategory, sortBy],
    queryFn: async () => {
      const data = await getExtensionsFn({ data: { category: activeCategory } }) as any[];

      if (sortBy === 'price_low') {
        data.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
      } else if (sortBy === 'price_high') {
        data.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
      } else if (sortBy === 'rating') {
        data.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
      } else {
        data.sort((a: any, b: any) => (b.user_count || 0) - (a.user_count || 0));
      }

      return data;
    }
  });

  const filteredExtensions = (extensions || []).filter((ext: any) => 
    (ext.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ext.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 font-sans selection:bg-red-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Premium Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-none">
              Elite Extension <br /><span className="text-white/40">Marketplace</span>
            </h1>
            <p className="text-white/40 max-w-lg font-medium">
              Discover verified tools designed to elevate your browser's performance and productivity.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-xl"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..." 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all backdrop-blur-xl"
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all backdrop-blur-xl appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value="popular" className="bg-black">Most Popular</option>
              <option value="rating" className="bg-black">Top Rated</option>
              <option value="price_low" className="bg-black">Price: Low to High</option>
              <option value="price_high" className="bg-black">Price: High to Low</option>
            </select>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-8 mb-8 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all text-[8px] font-black uppercase tracking-widest whitespace-nowrap active:scale-95 ${
                activeCategory === cat 
                  ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
                  : 'bg-white/5 border-white/5 hover:border-white/20 text-white/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Extension Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredExtensions?.map((ext) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={ext.id}
                  className="group relative flex flex-col p-8 rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/5 blur-[50px] group-hover:bg-red-600/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                      {ext.icon_url ? <img src={ext.icon_url} alt="" className="w-10 h-10 object-contain" /> : '⚡'}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{ext.category}</span>
                       <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full">
                         <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                         <span className="text-[10px] font-black">{ext.rating || '0.0'}</span>
                       </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-3 group-hover:text-red-500 transition-colors">{ext.name}</h3>
                  <p className="text-white/40 text-sm mb-8 leading-relaxed font-medium line-clamp-2">{ext.description}</p>
                  
                  <div className="flex items-center gap-6 mb-8 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-white/40" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white">{ext.user_count || 0}</span>
                         <span className="text-[8px] font-bold text-white/20 uppercase">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">One-time payment</span>
                      <div className="text-2xl font-black tracking-tight">
                        {ext.price === 0 ? 'FREE' : `৳${ext.price}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        to="/extensions/$slug"
                        params={{ slug: ext.slug || ext.id }}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link 
                        to="/checkout"
                        search={{ productId: ext.id, productName: ext.name }}
                        className="bg-white text-black font-black px-3.5 py-2 rounded-xl text-[8px] uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredExtensions?.length === 0 && !isLoading && (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-[3rem]">
            <div className="text-white/20 text-xl font-bold">No extensions found matching your search.</div>
          </div>
        )}
      </div>
    </div>
  );
}

