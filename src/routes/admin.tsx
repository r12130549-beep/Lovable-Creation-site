import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight, Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db, firestore } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, initialized, loading } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('[AdminLayout] Component mounted');
  }, []);

  useEffect(() => {
    if (!mounted || isRedirecting) return;
    
    const isDashboardPath = pathname.startsWith('/admin/dashboard');
    console.log('[AdminLayout] Guard check:', { pathname, user: user?.email, isAdmin, initialized, loading });

    // Only redirect IF we are sure about the auth state
    if (initialized) {
      if (!user) {
        if (isDashboardPath) {
          console.log('[AdminLayout] Unauthorized access. Redirecting to login');
          setIsRedirecting(true);
          navigate({ to: '/admin', replace: true });
          setTimeout(() => setIsRedirecting(false), 500);
        }
      } else {
        // We have a user, check admin status
        if (isAdmin) {
          if (pathname === '/admin' || pathname === '/admin/') {
            console.log('[AdminLayout] Admin authorized. Redirecting to dashboard');
            setIsRedirecting(true);
            navigate({ to: '/admin/dashboard', replace: true });
            setTimeout(() => setIsRedirecting(false), 500);
          }
        } else {
          console.log('[AdminLayout] Unauthorized user. Showing access denied');
          // No redirect, just let it render AdminLoginPage which will handle non-admin
        }
      }
    }
  }, [mounted, user, isAdmin, initialized, loading, navigate, pathname, isRedirecting]);

  // Show a loader only until we are mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  // If we are on a dashboard sub-route, we need auth and admin status
  const isDashboardPath = pathname.startsWith('/admin/dashboard');
  if (isDashboardPath) {
    if (initialized) {
      if (user && isAdmin) {
        return <Outlet />;
      } else {
        return (
          <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-red-500">ACCESS DENIED</h1>
              <p className="text-white/40">আপনি এই পেজটি দেখার জন্য অনুমোদিত নন।</p>
              <Link to="/admin" className="inline-block bg-white text-black px-6 py-2 rounded-xl font-bold">লগইন পেজে ফিরে যান</Link>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  // Default to showing the login page (for /admin route or unauthorized access)
  return <AdminLoginPage />;
}


function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[AdminLogin] Attempting sign in with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('[AdminLogin] Firebase sign in successful:', user.email);
      
      // Removed auto-sync to Firestore to prevent unauthorized admin creation
      /*
      try {
        const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
        const { firestore } = await import('@/lib/firebase');
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          isAdmin: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('[AdminLogin] Admin record synced to Firestore for UID:', user.uid);
      } catch (fsErr) {
        console.warn('[AdminLogin] Firestore sync failed, but login succeeded:', fsErr);
      }
      */

      
      let isAdmin = false;

      // Primary hardcoded check for admin email
      const allowedEmails = ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com'];
      if (user.email && allowedEmails.includes(user.email)) {
        isAdmin = true;
      } else {
        // 1. Try Firestore
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            isAdmin = userData['role'] === 'admin' || userData['isAdmin'] === true;
          }
        } catch (fsErr: any) {
          console.warn('[AdminLogin] Firestore check failed:', fsErr.message);
        }

        // 2. Try RTDB
        if (!isAdmin) {
          try {
            const adminRef = ref(db, `admins/${user.uid}`);
            const snapshot = await get(adminRef);
            if (snapshot.exists()) {
              const adminData = snapshot.val();
              isAdmin = adminData === true || adminData?.role === 'admin' || adminData?.isAdmin === true;
            }
          } catch (dbErr: any) {
            console.warn('[AdminLogin] RTDB check failed:', dbErr.message);
          }
        }
      }
      
      // Final validation: Only allow if whitelisted
      const isWhitelisted = user.email && allowedEmails.includes(user.email);
      
      if (isAdmin && isWhitelisted) {
        toast.success('অ্যাডমিন অ্যাক্সেস মঞ্জুর করা হয়েছে');
        console.log('[AdminLogin] Redirecting to dashboard...');
        navigate({ to: '/admin/dashboard' });
      } else {
        console.log('[AdminLogin] Access denied. Admin:', isAdmin, 'Whitelisted:', isWhitelisted);
        // FORCE SIGN OUT IMMEDIATELY
        await auth.signOut();
        toast.error('অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে: আপনি অনুমোদিত অ্যাডমিন নন');
      }
    } catch (err: any) {
      console.error('[AdminLogin] Error:', err);
      let message = 'ভুল ইমেল বা পাসওয়ার্ড।';
      const errorCode = err.code || '';
      
      if (errorCode === 'auth/invalid-continue-uri') {
        message = 'Firebase: Error (auth/invalid-continue-uri). অ্যাডমিন ডোমেইন কনফিগারেশন চেক করুন।';
      } else if (errorCode.includes('invalid-credential') || 
                 errorCode.includes('user-not-found') || 
                 errorCode.includes('wrong-password')) {
        message = 'ভুল ইমেল বা পাসওয়ার্ড।';
      } else if (errorCode.includes('invalid-api-key')) {
        message = 'Firebase API Key সঠিক নয়।';
      }
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <Link to="/" className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition group z-10">
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        হোমে ফিরে যান
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 rounded-[3rem] bg-[#0A0A0A] border border-white/5 backdrop-blur-3xl relative overflow-hidden z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-red-500 mb-6">
            <Sparkles className="w-3 h-3" />
            VIBEX Admin
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 uppercase">অ্যাডমিন লগইন</h1>
          <p className="text-white/40 text-sm font-medium">সুরক্ষিত প্রশাসনিক অ্যাক্সেস হাব।</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="অ্যাডমিন ইমেল" 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20" 
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড" 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20" 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-all shadow-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>প্যানেলে লগইন করুন <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

