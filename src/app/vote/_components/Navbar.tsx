"use client";

import React, { useEffect, useState } from "react";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const _JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });
const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const Navbar = ({ logoHref }: { logoHref?: string }) => {
  const [CurrentTime, setCurrentTime] = useState("");
  const [IsSpotifyModalOpen, SetIsSpotifyModalOpen] = useState(false);

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

  const SpotifyPlaylistUrl =
    "https://open.spotify.com/playlist/02hdeJ4xNLqi0ek760Znxh?si=2065a5384a0e4c51";

  return (
    <>
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => SetIsSpotifyModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
              aria-label="Otwórz playlistę Spotify"
              title="Playlista Radiowęzła"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </button>

            <div
              className={`font-mono text-sm text-white/70 ${_JetBrainsMono.className} tracking-wider bg-white/5 backdrop-blur-sm py-2 px-4 border border-white/10 rounded-full`}
            >
              <span>{CurrentTime}</span>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {IsSpotifyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => SetIsSpotifyModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-black/80 backdrop-blur-xl rounded-xl w-full max-w-xs border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="opacity-70"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span
                    className={`text-sm ${_SpaceGrotesk.className} text-white`}
                  >
                    Playlista Radiowęzła
                  </span>
                </div>
                <button
                  onClick={() => SetIsSpotifyModalOpen(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Zamknij"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <a
                  href={SpotifyPlaylistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 flex items-center justify-center text-xs text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all duration-300"
                >
                  Przejdź do playlisty
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
