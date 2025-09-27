"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GetEnabledPages } from "@/config/pageConfig";

interface PageContextType {
  EnabledPages: string[];
  CurrentPageIndex: number;
  SetCurrentPageIndex: (index: number) => void;
  ActivePages: Array<{ Key: string; Component?: React.ComponentType }>;
  SetActivePages: React.Dispatch<React.SetStateAction<Array<{ Key: string; Component?: React.ComponentType }>>>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [EnabledPages, SetEnabledPages] = useState<string[]>(GetEnabledPages());
  const [CurrentPageIndex, SetCurrentPageIndex] = useState(0);
  const [ActivePages, SetActivePages] = useState<Array<{ Key: string; Component?: React.ComponentType }>>([]);

  useEffect(() => {
    const HandlePageConfigChanged = (Event: CustomEvent<{ enabledPages: string[] }>) => {
      SetEnabledPages(Event.detail.enabledPages);
    };

    window.addEventListener("pageConfigChanged", HandlePageConfigChanged as EventListener);
    
    return () => {
      window.removeEventListener("pageConfigChanged", HandlePageConfigChanged as EventListener);
    };
  }, []);

  return (
    <PageContext.Provider value={{ 
      EnabledPages,
      CurrentPageIndex, 
      SetCurrentPageIndex,
      ActivePages,
      SetActivePages
    }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const Context = useContext(PageContext);
  if (Context === undefined) {
    throw new Error("usePageContext must be used within a PageProvider");
  }
  return Context;
}
