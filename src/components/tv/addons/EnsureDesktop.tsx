"use client";

import React, { useState } from "react";

export default function EnsureDesktop() {
  const [_IsDismissed, SetIsDismissed] = useState<boolean>(false);

  const _HandleDismiss = () => {
    SetIsDismissed(true);
  };

  if (_IsDismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center md:hidden"
      style={{ backgroundColor: "#000" }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="text-white text-xl mb-8">
          to nie jest strona do glosowania ;p
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={_HandleDismiss}
            className="inline-flex items-center gap-2 border border-white bg-black text-white px-5 py-3 rounded-[10px]"
          >
            <i className="fa-solid fa-heart-crack -ml-1"></i>
            <span>wiem co robie!</span>
          </button>
          <a
            href="/vote"
            className="inline-flex items-center gap-2 border border-white bg-black text-white px-5 py-3 rounded-[10px]"
          >
            <i className="fa-solid fa-arrow-right -ml-1"></i>
            <span>glosowanie</span>
          </a>
        </div>
        <div className="mt-4">
          <a
            href="/login"
            className="inline-flex items-center gap-2 border border-white bg-black text-white px-5 py-3 rounded-[10px] opacity-25"
          >
            <i className="fa-solid fa-screwdriver-wrench -ml-1"></i>
            <span>panel</span>
          </a>
        </div>
      </div>
    </div>
  );
}
