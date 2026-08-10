import { create } from 'zustand';
import { auth, firestore, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, get, set } from 'firebase/database';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null, isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  initialized: false,
  setUser: (user: User | null, isAdmin: boolean) => set({ user, isAdmin, loading: false, initialized: true }),
  setLoading: (loading: boolean) => set({ loading }),
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, isAdmin: false });
  },
}));

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user) => {
    console.log('[useAuth] onAuthStateChanged fired:', user?.email);
    const state = useAuth.getState();
    state.setLoading(true);
    
    if (!user) {
      console.log('[useAuth] No user found, clearing state');
      state.setUser(null, false);
      return;
    }
    
    try {
      console.log('[useAuth] User detected:', user.email, user.uid);
      let isAdmin = false;

      // 1. Hardcoded check for primary admin email - ONLY ALLOW THESE EMAILS
      const allowedEmails = ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com'];
      
      if (user.email && allowedEmails.includes(user.email)) {
        isAdmin = true;
        console.log('[useAuth] Admin detected by hardcoded email:', user.email);
      } else {
        // 2. Check Firestore for role - but we still verify against the whitelist for security
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Only allow if whitelisted AND has the role
            if ((userData['role'] === 'admin' || userData['isAdmin'] === true) && user.email && allowedEmails.includes(user.email)) {
              isAdmin = true;
            }
          }
        } catch (fsErr) {
          console.warn('[useAuth] Firestore check failed');
        }

        // 3. Check RTDB - same whitelist check
        if (!isAdmin) {
          try {
            const snapshot = await get(ref(db, `admins/${user.uid}`));
            if (snapshot.exists()) {
              const adminData = snapshot.val();
              const hasRole = adminData === true || adminData?.role === 'admin';
              if (hasRole && user.email && allowedEmails.includes(user.email)) {
                isAdmin = true;
              }
            }
          } catch (dbErr) {
            console.warn('[useAuth] RTDB check failed');
          }
        }
      }

      // If they are not in the whitelist, they are NOT admin, period.
      if (user.email && !allowedEmails.includes(user.email)) {
        isAdmin = false;
      }

      // Sync to Supabase for redundancy if they are confirmed admin
      if (isAdmin) {
        try {
          await supabase.from('profiles').upsert({
            id: user.uid,
            full_name: user.displayName,
            avatar_url: user.photoURL,
            role: 'admin',
            updated_at: new Date().toISOString()
          });
        } catch (sbErr) {}
      }
      
      console.log('[useAuth] Final Admin status:', isAdmin);
      state.setUser(user, isAdmin);
    } catch (error: any) {
      console.error('[useAuth] General error in admin status check:', error);
      state.setUser(user, false);
    }
  });
}
