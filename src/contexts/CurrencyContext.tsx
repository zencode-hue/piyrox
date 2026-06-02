"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// ─── Types ──────────────────────────────────────────────────

export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from USD
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  currencies: CurrencyInfo[];
  setCurrency: (code: CurrencyCode) => void;
  convert: (amountUSD: number) => number;
  format: (amountUSD: number) => string;
}

// ─── Currency Data ──────────────────────────────────────────

const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1550 },
];

const STORAGE_KEY = "piyrox-currency";
const DEFAULT_CURRENCY: CurrencyCode = "USD";

// ─── Context ────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

// ─── Provider ───────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCode] =
    useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES.some((c) => c.code === stored)) {
        setCurrencyCode(stored as CurrencyCode);
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, currencyCode);
    } catch {
      // Ignore
    }
  }, [currencyCode, isHydrated]);

  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0],
    [currencyCode]
  );

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (CURRENCIES.some((c) => c.code === code)) {
      setCurrencyCode(code);
    }
  }, []);

  const convert = useCallback(
    (amountUSD: number): number => {
      return Math.round(amountUSD * currency.rate * 100) / 100;
    },
    [currency]
  );

  const format = useCallback(
    (amountUSD: number): string => {
      const converted = convert(amountUSD);

      // Use Intl.NumberFormat for proper locale formatting
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.code,
          minimumFractionDigits: currency.code === "NGN" ? 0 : 2,
          maximumFractionDigits: currency.code === "NGN" ? 0 : 2,
        }).format(converted);
      } catch {
        return `${currency.symbol}${converted.toFixed(2)}`;
      }
    },
    [currency, convert]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      currencies: CURRENCIES,
      setCurrency,
      convert,
      format,
    }),
    [currency, setCurrency, convert, format]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
