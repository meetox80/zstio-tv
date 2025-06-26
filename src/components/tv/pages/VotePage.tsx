"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

type Song = {
  Id: string;
  Title: string;
  Artist: string;
  Votes: number;
};

export default function VotePage() {
  const [FetchedSongs, SetFetchedSongs] = useState<Song[]>([]);

  const ContainerRef = useRef<HTMLDivElement>(null);
  const _QrCodeValue = "vote.ox80.me";
  const [QrSize, SetQrSize] = useState(450);

  const TopSongs = [...FetchedSongs]
    .sort((A, B) => B.Votes - A.Votes)
    .slice(0, 5);

  const GetSongPluralForm = (Count: number): string => {
    if (Count === 1) {
      return "utwór";
    }
    const LastDigit = Count % 10;
    const LastTwoDigits = Count % 100;

    if (
      LastDigit >= 2 &&
      LastDigit <= 4 &&
      (LastTwoDigits < 10 || LastTwoDigits > 20)
    ) {
      return "utwory";
    }
    return "utworów";
  };

  const FetchTopSongs = async () => {
    try {
      const Response = await fetch(
        "/api/songs/approved?limit=7",
      );
      if (Response.ok) {
        const Data = await Response.json();
        if (Data.songs) {
          const MappedSongs: Song[] = Data.songs.map((proposal: any) => ({
            Id: proposal.Id,
            Title: proposal.Title,
            Artist: proposal.Artist,
            Votes: (proposal.Upvotes || 0) - (proposal.Downvotes || 0),
          }));
          SetFetchedSongs(MappedSongs);
        } else {
          SetFetchedSongs([]);
        }
      } else {
        console.error("Failed to fetch top songs:", Response.statusText);
        SetFetchedSongs([]);
      }
    } catch (Error) {
      console.error("Error fetching top songs:", Error);
      SetFetchedSongs([]);
    }
  };

  useEffect(() => {
    FetchTopSongs();
  }, []);

  useEffect(() => {
    const UpdateSize = () => {
      if (typeof window !== "undefined") {
        SetQrSize(
          Math.min(window.innerHeight * 0.6, window.innerWidth * 0.35, 450),
        );
      }
    };
    UpdateSize();
    window.addEventListener("resize", UpdateSize);

    return () => window.removeEventListener("resize", UpdateSize);
  }, []);

  return (
    <div
      ref={ContainerRef}
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden mt-5"
    >
      <div className="w-full h-full max-w-[1800px] px-8 py-4 z-10 flex flex-row items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-[45%] flex flex-col items-center space-y-8"
        >
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.h1
              className="text-6xl font-bold text-white mb-5"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Zagłosuj na
              <br />
              Utwór
            </motion.h1>
            <motion.p
              className="text-white/70 text-xl"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Zeskanuj kod i wpłyń na playlistę
            </motion.p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="relative flex items-center justify-center p-2 backdrop-blur-md bg-[#1E1E1E]/50 rounded-3xl border border-[#2F2F2F] shadow-lg shadow-black/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="bg-[#1A1A1A] p-6 rounded-2xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <QRCodeSVG
                    value={_QrCodeValue}
                    size={QrSize}
                    bgColor={"#1A1A1A"}
                    fgColor={"#FFFFFF"}
                    level={"H"}
                    includeMargin={false}
                    className="rounded-lg"
                  />
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 px-8 py-2.5 bg-[#1A1A1A] border border-[#2F2F2F] rounded-full text-base text-white/90 font-medium shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              {_QrCodeValue}
            </motion.div>
          </div>
        </motion.div>

        <div className="w-[55%] flex flex-col pl-12">
          <div className="backdrop-blur-md bg-[#1E1E1E]/50 rounded-2xl border border-[#2F2F2F] p-8 shadow-lg shadow-black/20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                Ranking Tygodniowy
              </h2>
              <span className="text-sm font-medium text-white/70 bg-[#2A2A2A] px-5 py-2 rounded-full">
                {TopSongs.length} {GetSongPluralForm(TopSongs.length)}
              </span>
            </div>

            <div className="min-h-[37.50rem]">
              <div className="grid gap-6 items-start">
                <AnimatePresence>
                  {TopSongs.map((SongItem, Index) => (
                    <motion.div
                      key={SongItem.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1 + Index * 0.1,
                      }}
                      className={`
                        flex items-center rounded-xl p-5
                        ${Index === 0 ? "bg-gradient-to-r from-rose-600/90 to-rose-500/80 border border-rose-500/50" : "bg-[#222222] border border-[#2F2F2F]/50"}
                      `}
                    >
                      <div className="mr-6 flex items-center justify-center">
                        <div
                          className={`
                          h-16 w-16 rounded-xl flex items-center justify-center text-2xl font-bold
                          ${
                            Index === 0
                              ? "bg-white/15 text-white"
                              : "bg-[#2A2A2A] text-white/80"
                          }
                        `}
                        >
                          {Index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-2xl font-semibold truncate ${Index === 0 ? "text-white" : "text-white"}`}
                        >
                          {SongItem.Title}
                        </h3>
                        <p
                          className={`text-lg truncate ${Index === 0 ? "text-white/80" : "text-white/60"}`}
                        >
                          {SongItem.Artist}
                        </p>
                      </div>

                      <div className="ml-6">
                        <div
                          className={`
                          px-6 py-3 rounded-full min-w-24 text-center
                          ${
                            Index === 0
                              ? "bg-white/15 text-white font-medium border border-white/20"
                              : "bg-[#2A2A2A] text-white/80 border border-[#3F3F3F]/50"
                          }
                        `}
                        >
                          <span className="tabular-nums font-medium text-2xl">
                            {SongItem.Votes}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
