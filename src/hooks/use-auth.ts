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

      // 1. Sync user data to Supabase profiles table
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.uid)
          .maybeSingle();

        if (profileError) {
          console.error('[useAuth] Supabase profile fetch error:', profileError);
        }

        if (profile) {
          isAdmin = profile.role === 'admin';
          console.log('[useAuth] Admin status from Supabase:', isAdmin);
        } else {
          // If profile doesn't exist, create it (guest user by default)
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.uid,
              full_name: user.displayName,
              avatar_url: user.photoURL,
              updated_at: new Date().toISOString()
            });
          
          if (insertError) console.error('[useAuth] Supabase profile sync error:', insertError);
        }
      } catch (sbErr) {
        console.warn('[useAuth] Supabase sync failed, falling back to Firebase:', sbErr);
      }

      // 2. Fallback: Check Firebase if Supabase check didn't confirm admin
      if (!isAdmin) {
        // Hardcoded check for primary admin email
        if (user.email === 'admin@gmail.com' || user.email === 'gmail@gmail.com' || user.email === 'r12130549@gmail.com') {
          isAdmin = true;
          console.log('[useAuth] Admin detected by hardcoded email:', user.email);
          
          // Sync admin status back to Supabase if confirmed here
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.uid);
        } else {
          // Check Firestore
          try {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              isAdmin = userData['role'] === 'admin' || userData['isAdmin'] === true;
            }
            
            if (!isAdmin) {
              const adminDoc = await getDoc(doc(firestore, 'admins', user.uid));
              if (adminDoc.exists()) isAdmin = true;
            }
          } catch (fsErr) {
            console.warn('[useAuth] Firestore check failed');
          }

          // Check RTDB
          if (!isAdmin) {
            try {
              const snapshot = await get(ref(db, `admins/${user.uid}`));
              if (snapshot.exists()) {
                const adminData = snapshot.val();
                isAdmin = adminData === true || adminData?.role === 'admin';
              }
            } catch (dbErr) {
              console.warn('[useAuth] RTDB check failed');
            }
          }

          // If found in Firebase, sync back to Supabase
          if (isAdmin) {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.uid);
          }
        }
      }
      
      console.log('[useAuth] Final Admin status:', isAdmin);
      state.setUser(user, isAdmin);
    } catch (error: any) {
      console.error('[useAuth] General error in admin status check:', error);
      state.setUser(user, false);
    }
  });
}
