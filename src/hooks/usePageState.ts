"use client";

import { useState, useEffect } from "react";
import PageConfiguration, { GetEnabledPages } from "@/config/pageConfig";

export interface PageInfo {
  Key: string;
  Component?: React.ComponentType;
}

export function usePageState() {
  const [ActiveMainPages, SetActiveMainPages] = useState<PageInfo[]>([]);
  const [ActiveTopBarPages, SetActiveTopBarPages] = useState<PageInfo[]>([]);

  useEffect(() => {
    const EnabledPageKeys = GetEnabledPages();

    // Publish the enabled pages to a global window variable
    if (typeof window !== "undefined") {
      (window as any).EnabledPageKeys = EnabledPageKeys;
    }

    // Dispatch an event to notify components about page config changes
    if (typeof window !== "undefined") {
      const PageConfigEvent = new CustomEvent("pageConfigChanged", {
        detail: { enabledPages: EnabledPageKeys },
      });
      window.dispatchEvent(PageConfigEvent);
    }
  }, []);

  return {
    ActiveMainPages,
    SetActiveMainPages,
    ActiveTopBarPages,
    SetActiveTopBarPages,
  };
}

export default usePageState;
