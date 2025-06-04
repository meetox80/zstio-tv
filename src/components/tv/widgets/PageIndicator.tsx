"use client";

import { useState, useEffect, useRef } from "react";

interface PageIndicatorProps {
  Pages: Array<{ Key: string }>;
  OnPageChange?: (pageIndex: number) => void;
}

export default function PageIndicator({
  Pages,
  OnPageChange,
}: PageIndicatorProps) {
  const [_CurrentPageIndex, SetCurrentPageIndex] = useState(0);
  const [_LastUpdated, SetLastUpdated] = useState(new Date());
  const _TotalSeconds = 30;
  const _IsInitialMount = useRef(true);

  useEffect(() => {
    if (_IsInitialMount.current) {
      _IsInitialMount.current = false;
      return;
    }

    if (OnPageChange) {
      OnPageChange(_CurrentPageIndex);
    }
  }, [_CurrentPageIndex, OnPageChange]);

  useEffect(() => {
    const _Interval = setInterval(() => {
      SetCurrentPageIndex((PrevIndex) => (PrevIndex + 1) % Pages.length);
      SetLastUpdated(new Date());
    }, _TotalSeconds * 1000);

    return () => clearInterval(_Interval);
  }, [Pages.length]);

  return (
    <div className="flex space-x-3">
      {Pages.map((Page, Index) => (
        <button
          key={Page.Key}
          onClick={() => {
            SetCurrentPageIndex(Index);
            SetLastUpdated(new Date());
          }}
          className={`w-3 h-3 rounded-full ${
            Index === _CurrentPageIndex
              ? "bg-white"
              : "bg-white/30 hover:bg-white/50"
          } transition-all duration-300`}
          aria-label={`Go to page ${Index + 1}`}
        />
      ))}
    </div>
  );
}
