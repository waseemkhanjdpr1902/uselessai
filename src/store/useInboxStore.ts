import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InboxSession {
  id: string;
  email: string;
  expiresAt: number;
}

interface InboxState {
  session: InboxSession | null;
  language: string;
  setSession: (session: InboxSession | null) => void;
  setLanguage: (lang: string) => void;
  extendSession: (minutes: number) => void;
  clearSession: () => void;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      session: null,
      language: 'English',
      setSession: (session) => set({ session }),
      setLanguage: (language) => set({ language }),
      extendSession: (minutes) => set((state) => {
        if (!state.session) return state;
        return {
          session: {
            ...state.session,
            expiresAt: state.session.expiresAt + minutes * 60 * 1000
          }
        };
      }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'swiftmail-storage',
    }
  )
);
