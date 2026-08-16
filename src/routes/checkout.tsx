import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ChevronLeft, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Smartphone,
  Globe,
  Wallet,
  ArrowRightCircle,
  FileCheck
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/admin/FileUpload';
import { useQuery } from '@tanstack/react-query';
import { getAppSettings } from '@/lib/settings.functions';
import { useAuth } from '@/hooks/use-auth';
import { createManualOrder } from '@/lib/orders.functions';
import { getExtensions } from '@/lib/extensions.functions';
import { validateCoupon, getCoupons } from '@/lib/features.functions';


export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
  validateSearch: (search: Record<string, unknown>): { productId?: string; plan?: string; productName?: string } => {
    return {
      productId: (search['productId'] as string) ?? undefined,
      plan: (search['plan'] as string) ?? undefined,
      productName: (search['productName'] as string) ?? undefined,
    };
  },

});

const PAYMENT_METHODS = [
  { 
    id: 'binance', 
    name: 'Binance Pay', 
    type: 'manual',
    icon: <Wallet className="w-6 h-6" />,
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  { 
    id: 'bkash', 
    name: 'bKash', 
    type: 'manual',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-pink-500/10 text-pink-400 border-pink-500/20'
  },
  { 
    id: 'nagad', 
    name: 'Nagad', 
    type: 'manual',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number];

function CheckoutPage() {
  const { user: firebaseUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const createManualOrderFn = useServerFn(createManualOrder);
  const [formData, setFormData] = useState({ 
    name: firebaseUser?.displayName || '', 
    email: firebaseUser?.email || '', 
    phone: '', 
    trxId: '' 
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [hasValidCoupons, setHasValidCoupons] = useState(false);
  const validateCouponFn = useServerFn(validateCoupon);
  const getCouponsFn = useServerFn(getCoupons);

  const { data: coupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => getCouponsFn(),
  });

  // Keep form in sync if user logs in while on page
  useEffect(() => {
    if (firebaseUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || firebaseUser.displayName || '',
        email: prev.email || firebaseUser.email || '',
      }));
    }
  }, [firebaseUser]);

  
  const search = useSearch({ from: '/checkout' }) as { productId?: string; plan?: string; productName?: string };
  const navigate = useNavigate();
  const getExtensionsFn = useServerFn(getExtensions);

  const { data: extensions } = useQuery({
    queryKey: ['extensions-checkout'],
    queryFn: () => getExtensionsFn(),
  });

  const { data: appSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => getAppSettings().catch(err => {
      console.error("Settings fetch error:", err);
      return {};
    }),
  });

  useEffect(() => {
    if (coupons && product) {
      const valid = (coupons as any[]).some(c => {
        const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
        const limitReached = c.usage_limit && (c.used_count || 0) >= c.usage_limit;
        
        if (isExpired || limitReached) return false;

        const extensionIds = c.extension_ids ? c.extension_ids.split(',').filter(Boolean) : [];
        const isGlobal = extensionIds.length === 0 && (!c.extension_id);
        const isTargeted = extensionIds.includes(product.id) || c.extension_id === product.id;
        
        return isGlobal || isTargeted;
      });
      setHasValidCoupons(valid);
    }
  }, [coupons, product]);

  const product = useMemo(() => {
    if (!extensions || !search.productId) return null;
    return extensions.find((e: any) => e.id === search.productId || e.slug === search.productId);
  }, [extensions, search.productId]);

  useEffect(() => {
    if (coupons && product) {
      const valid = (coupons as any[]).some(c => {
        const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
        const limitReached = c.usage_limit && (c.used_count || 0) >= c.usage_limit;
        
        if (isExpired || limitReached) return false;

        const extensionIds = c.extension_ids ? c.extension_ids.split(',').filter(Boolean) : [];
        const isGlobal = extensionIds.length === 0 && (!c.extension_id);
        const isTargeted = extensionIds.includes(product.id) || c.extension_id === product.id;
        
        return isGlobal || isTargeted;
      });
      setHasValidCoupons(valid);
    }
  }, [coupons, product]);

  const getMethodDetails = (methodId: string) => {
    if (!appSettings || Object.keys(appSettings).length === 0) return null;
    const settings = appSettings as Record<string, any>;
    switch(methodId) {
      case 'binance': return { number: settings['binance_id'] };
      case 'bkash': return { number: settings['bkash_number'] };
      case 'nagad': return { number: settings['nagad_number'] };
      default: return null;
    }
  };

  const usdtRate = useMemo(() => Number((appSettings as Record<string, any>)?.['usdt_rate']) || 130, [appSettings]);
  
  const pricing = useMemo(() => {
    let usd = product?.price_usd ?? product?.price ?? (search.plan === 'premium' ? 12 : 0);
    let bdt = product?.price_bdt ?? (Math.round(usd * usdtRate));

    if (appliedCoupon) {
      if (appliedCoupon.discount_type === 'percentage') {
        const factor = 1 - (appliedCoupon.discount_value / 100);
        usd *= factor;
        bdt *= factor;
      } else {
        usd = Math.max(0, usd - appliedCoupon.discount_value);
        bdt = Math.max(0, bdt - (appliedCoupon.discount_value * usdtRate));
      }
    }

    return { usd, bdt };
  }, [product, search.plan, usdtRate, appliedCoupon]);

  const bdtAmount = Math.round(pricing.bdt);
  const usdtAmount = pricing.usd.toFixed(2);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const coupon = await validateCouponFn({ data: { code: couponCode, extensionId: product?.id } } as any);
      setAppliedCoupon(coupon);
      toast.success('Coupon applied successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!formData.email.includes('@')) {
        toast.error('Please provide a valid email');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedMethod) {
        toast.error('Please select a payment method');
        return;
      }
      if (selectedMethod.id === 'binance') {
        setStep(3);
      } else {
        setStep(4);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const submitOrder = async () => {
    if (!selectedMethod) return;
    
    if (selectedMethod.type === 'manual') {
      if (!formData.trxId || !screenshotUrl) {
        toast.error('Please provide Transaction ID and payment screenshot');
        return;
      }
    }

    setLoading(true);
    try {
      const plan = (search as any)['plan'];
      const searchProductName = (search as any)['productName'];
      const searchProductId = (search as any)['productId'];
      
      const finalCurrency = selectedMethod.id === 'binance' ? "$" : "৳";
      const finalAmount = selectedMethod.id === 'binance' ? pricing.usd : pricing.bdt;
      
      // 1. Generate Order ID locally for immediate UI feedback
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomPart = '';
      for (let i = 0; i < 7; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const generatedOrderId = `ORDER-${randomPart}`;

      // 2. Prepare order data object
      const orderPayload = {
        uid: firebaseUser?.uid || 'guest',
        customerName: formData.name || 'Guest',
        email: formData.email || 'guest@example.com',
        whatsapp: formData.phone || 'N/A',
        productName: String(searchProductName || (plan === 'premium' ? 'Premium Extension' : (searchProductId || 'Premium Extension'))),
        category: 'Extension',
        price: finalAmount || 0,
        currency: finalCurrency,
        paymentMethod: selectedMethod.id,
        paymentStatus: "Pending",
        orderStatus: "Pending",
        transactionId: formData.trxId || 'N/A',
        screenshotUrl: screenshotUrl || '',
        notes: `TRX: ${formData.trxId || 'N/A'}${appliedCoupon ? ` | Coupon: ${appliedCoupon.code}` : ''}`,
        couponId: appliedCoupon?.id,
        couponCode: appliedCoupon?.code,
      };

      // 3. Create order via server function
      const result = await createManualOrderFn({ data: orderPayload });
      if (!result.success || (!result.order_id && !result.orderId)) {
        throw new Error(result.message || 'Could not save the order');
      }
      
      // 4. Update local state with the actual order ID from server
      const finalOrderId = result.order_id || result.orderId;
      setOrderId(finalOrderId);

      setStep(5);
      toast.success('Order completed successfully!');
    } catch (err: any) {
      console.error('Order submission error:', err);
      toast.error(err?.message || 'Could not save the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <ChevronLeft className="w-3 h-3" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              SECURE <span className="text-red-500">CHECKOUT</span> <span className="text-[10px] ml-2 text-white/20">(Save ID to track order)</span>
            </h1>
            <p className="text-white/40 mt-2 font-medium uppercase tracking-[0.2em] text-[10px]">
              Complete your premium experience
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500
                  ${step === s ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : step > s ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/20'}
                `}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 5 && <div className={`w-8 h-[2px] rounded-full transition-colors duration-500 ${step > s ? 'bg-green-500/20' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          <main>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Customer Information</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Tell us who you are</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
                          <input 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white/5 p-4 pl-12 rounded-2xl text-sm font-bold border border-white/5 focus:border-red-500/50 outline-none transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
                          <input 
                            type="email" 
                            placeholder="john@example.com" 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-white/5 p-4 pl-12 rounded-2xl text-sm font-bold border border-white/5 focus:border-red-500/50 outline-none transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">WhatsApp Number</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
                          <input 
                            placeholder="+880 1XXX-XXXXXX" 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-white/5 p-4 pl-12 rounded-2xl text-sm font-bold border border-white/5 focus:border-red-500/50 outline-none transition-all placeholder:text-white/10"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleNext} 
                      className="w-full mt-10 bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-white/10 text-[10px] uppercase tracking-widest"
                    >
                      Go to Payment Options <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </section>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Payment Method</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Select your preferred option</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PAYMENT_METHODS.map(m => (
                        <button 
                          key={m.id} 
                          onClick={() => setSelectedMethod(m)} 
                          className={`
                            group relative p-8 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-4 text-center
                            ${selectedMethod?.id === m.id ? m.color + " ring-1 ring-inset ring-white/10" : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'}
                          `}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedMethod?.id === m.id ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                            {m.icon}
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-sm">{m.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">{m.type}</p>
                          </div>
                          {selectedMethod?.id === m.id && (
                            <motion.div layoutId="payment-indicator" className="absolute top-4 right-4">
                              <CheckCircle2 className="w-5 h-5 text-inherit" />
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-10">
                      <button onClick={() => setStep(1)} className="flex-1 bg-white/5 text-white/40 font-black py-4 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">Back</button>
                      <button 
                        onClick={handleNext} 
                        className="flex-[2] bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-white/10 text-[10px] uppercase tracking-widest"
                      >
                        Review Order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Binance Pay Details</h2>

                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Send payment via Binance Pay</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-[2rem] space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            Manual Verification
                          </span>
                          <Wallet className="w-5 h-5 text-yellow-500/20" />
                        </div>
                        
                        <p className="text-xs font-medium text-white/60 leading-relaxed">
                          Go to Binance App and send USDT to the Pay ID below.
                        </p>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 ml-1">Binance Pay ID</label>
                            <div className="flex items-center gap-2 bg-black/40 p-4 rounded-2xl border border-white/5 group">
                              <code className="flex-1 text-sm font-black tracking-wider text-yellow-400">{(appSettings as Record<string, any>)?.['binance_id']}</code>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText((appSettings as Record<string, any>)?.['binance_id'] as string || '');
                                  toast.success('Pay ID copied!');
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Product Price (USD)</p>
                              <p className="text-sm font-black tracking-tight text-white">${pricing.usd}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Send USDT</p>
                              <p className="text-sm font-black tracking-tight text-yellow-500">{usdtAmount} USDT</p>
                            </div>
                          </div>

                          <div className="text-[9px] font-black text-white/10 uppercase tracking-widest text-center py-2 border-t border-white/5 font-medium opacity-50">
                            Rate: 1 USDT = ৳{usdtRate}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="flex-1 bg-white/5 text-white/40 font-black py-5 rounded-[2rem] hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">Back</button>
                        <button 
                          onClick={handleNext}
                          className="flex-[2] bg-white text-black font-black py-5 rounded-[2rem] hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-white/10"
                        >
                          Next <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Verify Payment</h2>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Submit proof of payment</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {selectedMethod?.id !== 'binance' ? (
                        <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[2rem] text-center space-y-4">
                          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-red-500">Send Payment To</p>
                          <div className="flex items-center justify-center gap-4">
                            <p className="text-3xl font-black tracking-tight font-mono">{getMethodDetails(selectedMethod?.id as string)?.number}</p>
                            <button 
                              onClick={() => {
                                const num = getMethodDetails(selectedMethod?.id as string)?.number;
                                if (num) {
                                  navigator.clipboard.writeText(num);
                                  toast.success('Number copied!');
                                }
                              }}
                              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                            Amount: ৳{bdtAmount} | Personal
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-[2rem] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Sending to Pay ID</p>
                              <p className="text-xs font-black tracking-widest">{(appSettings as Record<string, any>)?.['binance_id']}</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-yellow-500">{usdtAmount} USDT</p>
                        </div>
                      )}

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Transaction ID</label>
                          <input 
                            placeholder="e.g. 8N7X2M9P" 
                            value={formData.trxId}
                            onChange={e => setFormData({...formData, trxId: e.target.value})}
                            className="w-full bg-white/5 p-4 rounded-2xl text-sm font-bold border border-white/5 focus:border-red-500/50 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Payment Screenshot</label>
                          <FileUpload 
                            bucket="order-assets"
                            path={formData.email ? formData.email.replace(/[^a-zA-Z0-9]/g, '_') : 'guest'}
                            label="Screenshot"
                            onUploadComplete={(url) => setScreenshotUrl(url)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => setStep(selectedMethod?.id === 'binance' ? 3 : 2)} className="flex-1 bg-white/5 text-white/40 font-black py-4 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]">Back</button>
                        <button 
                          onClick={submitOrder} 
                          disabled={loading}
                          className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-red-500/20 disabled:opacity-50 text-[10px] uppercase tracking-widest"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>Submit Order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 md:p-20 text-center backdrop-blur-xl"
                >
                  <div className="w-24 h-24 bg-green-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Order Received!</h2>
                  <p className="text-white/40 max-w-md mx-auto mb-10 leading-relaxed">
                    Your payment is being verified by our team. You will receive an email confirmation once approved. You can track your order status using your Order ID.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <button 
                      onClick={() => navigate({ to: '/' })} 
                      className="bg-white text-black font-black py-4 rounded-[1.5rem] hover:bg-white/90 transition-all text-xs uppercase tracking-widest shadow-xl shadow-white/5"
                    >
                      Return to Home
                    </button>
                    <Link 
                      to="/track-order" 
                      className="bg-white/5 text-white/40 font-black py-4 rounded-[1.5rem] hover:bg-white/10 transition-all text-xs uppercase tracking-widest border border-white/5"
                    >
                      Track Order
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <aside className="sticky top-12 space-y-6">
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-6">Order Summary</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-black text-sm uppercase">{search.productName || product?.name || 'VIBEX Premium Tool'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">One-time payment</p>
                  </div>
                  <p className="font-black text-red-500">{selectedMethod?.id === 'binance' ? `$${usdtAmount}` : `৳${bdtAmount}`}</p>
                </div>

                <div className="h-[1px] bg-white/5 w-full" />

                {/* Coupon Input */}
                {(!appliedCoupon && hasValidCoupons) ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Promo Code</label>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Enter code" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl outline-none text-xs font-bold focus:border-red-500/50 transition-all uppercase"
                      />
                      <button 
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="px-4 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  </div>
                ) : appliedCoupon ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Coupon Applied</p>
                      <p className="text-xs font-black uppercase tracking-widest">{appliedCoupon.code}</p>
                    </div>
                    <button 
                      onClick={() => setAppliedCoupon(null)}
                      className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span>{selectedMethod?.id === 'binance' ? `$${(product?.price_usd ?? product?.price ?? (search.plan === 'premium' ? 12 : 0)).toFixed(2)}` : `৳${(product?.price_bdt ?? (Math.round((product?.price_usd ?? product?.price ?? (search.plan === 'premium' ? 12 : 0)) * usdtRate)))}`}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-500">
                      <span>Discount</span>
                      <span>-{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : (selectedMethod?.id === 'binance' ? `$${appliedCoupon.discount_value}` : `৳${Math.round(appliedCoupon.discount_value * usdtRate)}`)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Processing Fee</span>
                    <span>{selectedMethod?.id === 'binance' ? `$0.00` : `৳0.00`}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Total Amount</p>
                    <p className="text-3xl font-black text-white">{selectedMethod?.id === 'binance' ? `$${usdtAmount}` : `৳${bdtAmount}`}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8">
              <div className="flex gap-4">
                <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Secure Transaction</p>
                  <p className="text-[10px] font-medium text-white/40 leading-relaxed uppercase tracking-widest">
                    Your data is encrypted and secure. We never store credit card details.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
