import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { checkAdminStatus } from '@/lib/users.functions';

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
      
      // Use the server function to check admin status securely
      // This bypasses client-side "Missing or insufficient permissions" errors
      const result = await checkAdminStatus({ data: { email: user.email || '', uid: user.uid } } as any);
      const isAdmin = result?.isAdmin || false;
      
      console.log('[useAuth] Final Admin status from server:', isAdmin);
      state.setUser(user, isAdmin);
    } catch (error: any) {
      console.error('[useAuth] General error in admin status check:', error);
      
      // Fallback to basic email check if server function fails
      const allowedEmails = ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com', 'kivabe@gmail.com', 'popykhanum2255@gmail.com'];
      const isAdminFallback = user.email ? allowedEmails.includes(user.email) : false;
      
      state.setUser(user, isAdminFallback);
    }
  });
}
