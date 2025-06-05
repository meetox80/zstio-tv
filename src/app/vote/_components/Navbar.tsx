"use client";

import React, { useEffect, useState } from "react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const _JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });
const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const Navbar = ({ logoHref }: { logoHref?: string }) => {
  const [CurrentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const UpdateClock = () => {
      const Now = new Date();
      const Hours = Now.getHours().toString().padStart(2, "0");
      const Minutes = Now.getMinutes().toString().padStart(2, "0");
      const Seconds = Now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${Hours}:${Minutes}:${Seconds}`);
    };

    UpdateClock();
    const Interval = setInterval(UpdateClock, 1000);
    return () => clearInterval(Interval);
  }, []);

  const Logo = () => (
    <>
      <Image
        src="/zstio-512-alt.png"
        alt="ZSTIO Logo"
        width={48}
        height={48}
        className="relative hover:scale-105 transition-all duration-500"
        priority
      />
      <div className="absolute -inset-1 border border-white/20 rounded-full animate-ping opacity-20"></div>
    </>
  );

  return (
    <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          {logoHref ? (
            <Link href={logoHref} className="relative w-12 h-12">
              <Logo />
            </Link>
          ) : (
            <div className="relative w-12 h-12">
              <Logo />
            </div>
          )}
          <h2
            className={`text-2xl font-bold tracking-tight hidden md:block ${_SpaceGrotesk.className}`}
          >
            Radiowęzeł ZSTiO
          </h2>
        </div>

        <div
          className={`font-mono text-sm text-white/70 ${_JetBrainsMono.className} tracking-wider bg-white/5 backdrop-blur-sm py-2 px-4 border border-white/10 rounded-full`}
        >
          <span>{CurrentTime}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
