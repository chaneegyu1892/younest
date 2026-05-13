"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SearchModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SearchModalContext = createContext<SearchModalContextValue | null>(null);

export function useSearchModal(): SearchModalContextValue {
  const ctx = useContext(SearchModalContext);
  if (!ctx) throw new Error("useSearchModal must be used within SearchModalProvider");
  return ctx;
}

interface Props {
  children: React.ReactNode;
}

export function SearchModalProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // ⌘K (mac) / Ctrl+K (win/linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <SearchModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </SearchModalContext.Provider>
  );
}
