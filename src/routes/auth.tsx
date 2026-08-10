import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Add standard scopes and parameters to prevent generic redirect issues
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('[Auth] Initiating Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('[Auth] Sign-in successful:', result.user.email);
      
      toast.success('সফলভাবে লগইন করা হয়েছে!');
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('[Auth] Google Login Error:', error);
      
      let errorMessage = 'লগইন করতে সমস্যা হয়েছে।';
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'পপআপ উইন্ডোটি ব্লক করা হয়েছে। অনুগ্রহ করে ব্রাউজারের পপআপ সেটিং অনুমতি দিন।';
      } else if (error.code === 'auth/invalid-continue-uri') {
        errorMessage = 'Firebase: Error (auth/invalid-continue-uri). এই ডোমেইনটি অথোরাইজড তালিকায় যুক্ত নেই।';
      } else if (error.code) {
        errorMessage = `লগইন এরর: ${error.code}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-red-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Link 
        to="/" 
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition group z-10"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-[#0A0A0A] border border-white/5 backdrop-blur-3xl relative overflow-hidden z-10 shadow-2xl mx-auto"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            VIBEX Security
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Secure Login
          </h1>
          <p className="text-white/40 text-sm font-medium">
            Use your Google account to access VIBEX.
          </p>
        </div>
        
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
                <span className="text-xs font-black uppercase tracking-widest">Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-bold leading-relaxed">
            By logging in, you agree to our <br /> terms of service and privacy policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
