import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// We keep the structure for compatibility but hardcode it to English
type Language = 'EN';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'EN',
      setLanguage: () => set({ language: 'EN' }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const translations = {
  EN: {
    home: "Home",
    extensions: "Extensions",
    pricing: "Pricing",
    features: "Features",
    faq: "FAQ",
    trackOrder: "Track Order",
    serverStatus: "Server Status",
    buyCredits: "BUY CREDITS",
    extensionLicense: "EXTENSION LICENSE",
    heroTitlePrefix: "Make Your",
    heroTitlePlatform: "Platform Using",
    heroTitleAI: "AI Tools",
    heroDesc: "The hub for elite browser tools. Discovery verified, high-performance extensions to supercharge your productivity.",
    marketplaceLive: "Marketplace v2.0 is Live",
    viewAllTools: "View all tools",
    questions: "Questions?",
    builtForWeb: "Built for the modern web.",
    trustStats: {
      dailyUsers: "Daily Users",
      extensions: "Extensions",
      successRate: "Success Rate",
      satisfaction: "Satisfaction"
    }
  }
};
