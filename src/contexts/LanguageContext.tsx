"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import idDict from "@/lib/i18n/id.json";
import enDict from "@/lib/i18n/en.json";

type Lang = "id" | "en";
const dictionaries = { id: idDict, en: enDict };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  formatCurrency: (val: number, currency?: string) => string;
  formatDate: (date: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tc_lang") as Lang;
      if (stored === "id" || stored === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(stored);
        document.documentElement.setAttribute("lang", stored);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("tc_lang", l);
      document.documentElement.setAttribute("lang", l);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split(".");
    let val: Record<string, unknown> | string | undefined = dictionaries[lang] as Record<string, unknown>;
    for (const k of keys) {
      if (val && typeof val === "object") {
        val = (val as Record<string, unknown>)[k] as Record<string, unknown> | string | undefined;
      } else {
        val = undefined;
        break;
      }
    }
    return typeof val === "string" ? val : key;
  }, [lang]);

  const formatCurrency = useCallback((val: number, currency: string = "IDR"): string => {
    if (currency === "USD") {
      return `$ ${new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)}`;
    }
    const symbol = lang === "id" ? "Rp " : "IDR ";
    return `${symbol}${new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US").format(val)}`;
  }, [lang]);

  const formatDate = useCallback((date: string | number | Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = new Date(date);
      const defaultOpts: Intl.DateTimeFormatOptions = options || {
        dateStyle: "medium",
        timeStyle: "short",
      };
      return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-US", defaultOpts).format(d);
    } catch {
      return String(date);
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Graceful fallback if not wrapped
    return {
      lang: "id" as Lang,
      setLang: () => {},
      t: (key: string) => key,
      formatCurrency: (val: number, currency: string = "IDR") => `${currency === "USD" ? "$" : "Rp"} ${val.toLocaleString()}`,
      formatDate: (date: string | number | Date) => String(date),
    };
  }
  return ctx;
}
