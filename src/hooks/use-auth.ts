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
    const state = useAuth.getState();
    state.setLoading(true);
    
    if (!user) {
      state.setUser(null, false);
      return;
    }
    
    try {
      // Whitelist check first
      const allowedEmails = ['admin@gmail.com', 'gmail@gmail.com', 'r12130549@gmail.com', 'kivabe@gmail.com', 'popykhanum2255@gmail.com', 'ashik97355@gmail.com', 'emon@gmail.com'];
      if (allowedEmails.includes(user.email || '')) {
        state.setUser(user, true);
        return;
      }

      const result = await checkAdminStatus({ data: { email: user.email || '', uid: user.uid } } as any);
      state.setUser(user, result?.isAdmin || false);
    } catch (error: any) {
      console.error('[useAuth] Error:', error);
      state.setUser(user, false);
    }
  });
}
