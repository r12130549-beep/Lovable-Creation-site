import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Calendar, CreditCard, CheckCircle2, Clock, Shield, Download, ArrowRight, Loader2, AlertCircle, ChevronRight, FileText, Copy, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { trackOrder } from '@/lib/tracking.functions';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const Route = createFileRoute('/track-order')({
  component: TrackOrderPage,
});

const TIMELINE_STEPS = [
  { id: 'placed', label: 'Order Placed', statuses: ['Pending', 'Payment Review', 'Paid', 'Processing', 'Approved', 'Ready', 'Completed'] },
  { id: 'payment_submitted', label: 'Payment Submitted', statuses: ['Payment Review', 'Paid', 'Processing', 'Approved', 'Ready', 'Completed'] },
  { id: 'payment_verified', label: 'Payment Verified', statuses: ['Paid', 'Processing', 'Approved', 'Ready', 'Completed'] },
  { id: 'processing', label: 'Order Approved', statuses: ['Approved', 'Ready', 'Completed'] },
  { id: 'license_generated', label: 'License Generated', statuses: ['Ready', 'Completed'] },
  { id: 'extension_ready', label: 'Extension Ready', statuses: ['Ready', 'Completed'] },
  { id: 'download_available', label: 'Download Available', statuses: ['Ready', 'Completed'] },
  { id: 'completed', label: 'Completed', statuses: ['Completed'] },
];

function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [showResult, setShowResult] = useState(false);
  const trackOrderFn = useServerFn(trackOrder);

  const trackMutation = useMutation({
    mutationFn: (vars: { orderId: string; email?: string }) => trackOrderFn({ data: { orderId: vars.orderId, email: vars.email || null } as any }),
    onSuccess: () => {
      setShowResult(true);
    },
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    trackMutation.mutate({ orderId, email: email || undefined } as any);
  };

  const getStepStatus = (stepStatuses: string[]) => {
    if (trackMutation.data && (trackMutation.data as any).status) {
      const currentStatus = (trackMutation.data as any).status;
      if (stepStatuses.includes(currentStatus)) return 'completed';
      if (['Failed', 'Rejected', 'Cancelled'].includes(currentStatus)) return 'failed';
    }
    return 'upcoming';
  };

  const order = trackMutation.data as any;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 selection:bg-red-500/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        {!showResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-8">
              <Package className="w-3 h-3" />
              Order Tracking System
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">Track Your Order</h1>
            <p className="text-white/40 text-lg font-medium mb-12 max-w-xl mx-auto">
              Enter your Order ID and optional email to check your real-time order and license status.
            </p>

            <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  required
                />
              </div>
              <div className="relative group">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={trackMutation.isPending}
                className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {trackMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {trackMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {(trackMutation.error as any)?.message || "Could not find order. Please check the ID."}
                </motion.div>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition group mb-4">
               <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
               Back to Home
            </Link>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">অর্ডার আইডি</span>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                      <code className="text-sm font-black text-white">{order?.id || orderId}</code>
                      <button onClick={() => { navigator.clipboard.writeText(order?.id || orderId); toast.success('Order ID copied'); }} className="text-white/20 hover:text-red-500 transition-colors">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">অনলাইন</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">অর্ডার স্ট্যাটাস</p>
                    <p className={`text-xs font-black uppercase tracking-widest ${
                      ['Approved', 'Paid', 'Completed', 'Ready'].includes(order.status) ? 'text-green-500' : 'text-yellow-500'
                    }`}>{order.status}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Quick Action Banner */}
              <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 mb-10 flex items-start gap-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-green-500 mb-1">
                    {order.product_name || "VIBEX Secure Product"}
                  </h4>
                  <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                    পেমেন্ট কনফার্ম হওয়ার সাথে সাথে গেটওয়ে স্বয়ংক্রিয়ভাবে লাইসেন্স কী এবং ডাউনলোড লিংক পাঠিয়ে দেবে।
                  </p>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-y-10 gap-x-12 mb-12">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">ইমেইল</p>
                  <p className="text-xs font-bold text-white/80">{order.customer_email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">প্ল্যান</p>
                  <p className="text-xs font-bold text-white/80">লাইফটাইম</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">মূল্য</p>
                  <p className="text-xs font-bold text-white/80">{order.amount || 0} {order.currency || '৳'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">পেমেন্ট</p>
                  <p className="text-xs font-bold text-white/80 uppercase">{order.payment_method}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">ট্রানজেকশন আইডি</p>
                  <p className="text-xs font-mono font-bold text-white/80">{order.transaction_id || 'N/A'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">তারিখ</p>
                  <p className="text-xs font-bold text-white/80">{format(new Date(order.created_at), 'd/M/yyyy')}</p>
                </div>
              </div>

              {/* License/Download Section - The core request */}
              {order.license?.status === 'Active' && !order.isExpired ? (
                <div className="space-y-6 mb-12">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-500">আপনার লাইসেন্স কী</p>
                      <button onClick={() => { navigator.clipboard.writeText(order.license.key); toast.success('License Key copied'); }} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1.5 transition-colors">
                        Copy <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <code className="block w-full p-4 bg-black/40 border border-white/5 rounded-xl text-xs font-mono text-white tracking-widest break-all select-all">
                      {order.license.key}
                    </code>
                  </div>
                  
                  {order.license.download_url && (
                    <a 
                      href={order.license.download_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-xl active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      ডাউনলোড ফাইল
                    </a>
                  )}
                  {order.license.expires_at && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 text-center">
                      মেয়াদ শেষ হবে: {format(new Date(order.license.expires_at), 'PPp')}
                    </p>
                  )}
                </div>
              ) : order.isExpired ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 mb-12 text-center space-y-4">
                  <Shield className="w-12 h-12 text-red-500 mx-auto opacity-50" />
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-red-500">লাইসেন্সের মেয়াদ শেষ</h3>
                    <p className="text-xs font-medium text-white/40 mt-2">
                      এই অর্ডারের মেয়াদের তারিখ অতিক্রম করেছে। এক্সেস পেতে অনুগ্রহ করে নতুন করে সাবস্ক্রিপশন নিন।
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link to="/pricing" className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                      রিউনিউ করুন <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* Status Message */}
              {(order.status === 'Rejected' || order.status === 'Failed') && !order.isExpired ? (
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">পেমেন্ট সময় শেষ</h4>
                    <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                      {order.admin_note || "৩০ মিনিটের মধ্যে পেমেন্ট না হওয়ায় এই অর্ডারটি স্বয়ংক্রিয়ভাবে বাতিল হয়েছে। অনুগ্রহ করে নতুন অর্ডার দিন।"}
                    </p>
                  </div>
                </div>
              ) : (order.status === 'Pending' || order.status === 'Payment Review') && !order.isExpired ? (
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-1">পেমেন্ট ভেরিফিকেশন চলছে</h4>
                    <p className="text-[10px] font-medium text-white/60 leading-relaxed">
                      আপনার পেমেন্টটি বর্তমানে ভেরিফাই করা হচ্ছে। সাধারণত ৫-৩০ মিনিটের মধ্যে লাইসেন্স কী পেয়ে যাবেন।
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-12 text-center">
                <button 
                  onClick={() => setShowResult(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors"
                >
                  হোমে ফিরুন
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
