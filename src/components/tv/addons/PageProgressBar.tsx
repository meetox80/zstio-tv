"use client";

import { useState, useEffect, useRef } from "react";

export default function PageProgressBar() {
  const [_Progress, SetProgress] = useState(0);
  const _TotalSeconds = 30;
  const _StartMsRef = useRef<number>(Date.now());
  const _RafRef = useRef<number | null>(null);

  useEffect(() => {
    const _Tick = () => {
      const Now = Date.now();
      const Elapsed = Now - _StartMsRef.current;
      const Duration = _TotalSeconds * 1000;
      const Ratio = (Elapsed % Duration) / Duration;
      const Pct = Math.min(100, Math.max(0, Ratio * 100));
      SetProgress(Pct);
      _RafRef.current = requestAnimationFrame(_Tick);
    };

    _RafRef.current = requestAnimationFrame(_Tick);

    const HandlePageChange = () => {
      _StartMsRef.current = Date.now();
      SetProgress(0);
    };

    window.addEventListener("pageChange", HandlePageChange as EventListener);

    return () => {
      if (_RafRef.current) cancelAnimationFrame(_RafRef.current);
      window.removeEventListener(
        "pageChange",
        HandlePageChange as EventListener,
      );
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full h-[1px] bg-[#1a1a1a]">
      <div
        className="h-full bg-white/50 transition-all duration-100"
        style={{ width: `${_Progress}%` }}
      />
    </div>
  );
}
