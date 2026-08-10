import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'EN' | 'BN';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'EN',
      setLanguage: (language) => set({ language }),
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
    },
    // Admin dashboard translations can be added here as well if needed
  },
  BN: {
    home: "হোম",
    extensions: "এক্সটেনশন",
    pricing: "প্রাইসিং",
    features: "ফিচার",
    faq: "প্রশ্নোত্তর",
    trackOrder: "অর্ডার ট্রাক করুন",
    serverStatus: "সার্ভার স্ট্যাটাস",
    buyCredits: "ক্রেডিট কিনুন",
    extensionLicense: "এক্সটেনশন লাইসেন্স",
    heroTitlePrefix: "আপনার",
    heroTitlePlatform: "প্ল্যাটফর্ম তৈরি করুন",
    heroTitleAI: "এআই টুলস দিয়ে",
    heroDesc: "এলিট ব্রাউজার টুলের কেন্দ্র। আপনার প্রোডাক্টিভিটি বাড়াতে যাচাইকৃত, উচ্চ-কার্যক্ষমতা সম্পন্ন এক্সটেনশন আবিষ্কার করুন।",
    marketplaceLive: "মার্কেটপ্লেস v2.0 লাইভ আছে",
    viewAllTools: "সব টুল দেখুন",
    questions: "প্রশ্ন আছে?",
    builtForWeb: "আধুনিক ওয়েবের জন্য নির্মিত।",
    trustStats: {
      dailyUsers: "দৈনিক ব্যবহারকারী",
      extensions: "এক্সটেনশন",
      successRate: "সফলতার হার",
      satisfaction: "সন্তুষ্টি"
    }
  }
};
