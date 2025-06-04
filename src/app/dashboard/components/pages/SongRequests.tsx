"use client";

import { FC, useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";
import { useToast } from "@/app/context/ToastContext";

const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

type SongRequestsProps = {
  username: string | null | undefined;
};

type SongProposal = {
  Id: string;
  Title: string;
  Artist: string;
  Album: string;
  AlbumArt: string;
  Duration: number;
  Uri: string;
  Upvotes?: number;
  Downvotes?: number;
  CreatedAt: string;
  Fingerprint?: string;
  UserVote?: string | null;
};

const SongRequests: FC<SongRequestsProps> = ({ username }) => {
  const [PendingProposals, SetPendingProposals] = useState<SongProposal[]>([]);
  const [ApprovedSongs, SetApprovedSongs] = useState<any[]>([]);
  const [ActiveTab, SetActiveTab] = useState("pending");
  const [IsLoading, SetIsLoading] = useState(false);
  const { data: _Session } = useSession();
  const { ShowToast } = useToast();

  const UserPermissions = _Session?.user?.permissions || 0;
  const CanManageSongRequests = HasPermission(
    UserPermissions,
    Permission.SONG_REQUESTS_MANAGE,
  );

  const FetchPendingProposals = async () => {
    try {
      SetIsLoading(true);
      const Response = await fetch(
        "/api/songs/proposals?limit=50&pending=true",
      );

      if (Response.ok) {
        const Data = await Response.json();
        SetPendingProposals(Data.proposals);
      } else {
        const ErrorData = await Response.json();
        ShowToast(
          ErrorData.error || "Nie udało się pobrać propozycji piosenek",
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Nie udało się pobrać propozycji piosenek", "error");
    } finally {
      SetIsLoading(false);
    }
  };

  const FetchApprovedSongs = async () => {
    try {
      SetIsLoading(true);
      const Response = await fetch(
        "/api/songs/proposals?limit=50&pending=false",
      );

      if (Response.ok) {
        const Data = await Response.json();
        SetApprovedSongs(Data.proposals);
      } else {
        const ErrorData = await Response.json();
        ShowToast(
          ErrorData.error || "Nie udało się pobrać zatwierdzonych piosenek",
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Nie udało się pobrać zatwierdzonych piosenek", "error");
    } finally {
      SetIsLoading(false);
    }
  };

  const HandleApprove = async (SongId: string) => {
    if (!CanManageSongRequests) {
      ShowToast(
        "Nie masz uprawnień do zarządzania propozycjami piosenek.",
        "error",
      );
      return;
    }

    try {
      const Response = await fetch("/api/songs/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ SongId }),
      });

      const Data = await Response.json();

      if (Response.ok) {
        ShowToast("Piosenka została zatwierdzona pomyślnie", "success");
        FetchPendingProposals();
        FetchApprovedSongs();
      } else {
        ShowToast(Data.error || "Nie udało się zatwierdzić piosenki", "error");
      }
    } catch (Error: any) {
      ShowToast(`Wystąpił błąd: ${Error.message || "Unknown error"}`, "error");
    }
  };

  const HandleReject = async (SongId: string) => {
    if (!CanManageSongRequests) {
      ShowToast(
        "Nie masz uprawnień do zarządzania propozycjami piosenek.",
        "error",
      );
      return;
    }

    try {
      const Response = await fetch("/api/songs/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ SongId }),
      });

      if (Response.ok) {
        ShowToast("Piosenka została odrzucona/usunięta", "success");
        FetchPendingProposals();
        FetchApprovedSongs();
      } else {
        const Data = await Response.json();
        ShowToast(
          Data.error || "Nie udało się odrzucić/usunąć piosenki",
          "error",
        );
      }
    } catch (Error: any) {
      ShowToast(`Wystąpił błąd: ${Error.message || "Unknown error"}`, "error");
    }
  };

  const FormatDuration = (Ms: number) => {
    const Minutes = Math.floor(Ms / 60000);
    const Seconds = Math.floor((Ms % 60000) / 1000);
    return `${Minutes}:${Seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (ActiveTab === "pending") {
      FetchPendingProposals();
    } else {
      FetchApprovedSongs();
    }
  }, [ActiveTab]);

  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="mb-8 p-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`text-3xl font-bold ${_SpaceGrotesk.className} flex items-center`}
        >
          <i className="fas fa-music text-rose-400 mr-3 text-2xl"></i>
          Zarządzanie propozycjami piosenek
        </motion.h1>
        <p className="text-gray-400 mt-2 ml-1">
          Przeglądaj i zarządzaj propozycjami piosenek od użytkowników
        </p>
      </div>

      <div className="mb-6 flex px-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => SetActiveTab("pending")}
          className={`px-4 py-2 relative mr-4 rounded-full transition-all duration-300 ${
            ActiveTab === "pending"
              ? "text-white font-medium bg-rose-500/20 backdrop-blur-sm border border-rose-500/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="flex items-center">
            <i className="fas fa-clock mr-2 text-rose-400"></i>
            Oczekujące
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => SetActiveTab("approved")}
          className={`px-4 py-2 relative rounded-full transition-all duration-300 ${
            ActiveTab === "approved"
              ? "text-white font-medium bg-rose-500/20 backdrop-blur-sm border border-rose-500/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="flex items-center">
            <i className="fas fa-check mr-2 text-rose-400"></i>
            Zatwierdzone
          </span>
        </motion.button>
      </div>

      <div className="px-6 pb-6">
        {IsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex space-x-2 items-center">
              <div
                className="w-3 h-3 bg-white/70 rounded-full animate-pulse"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-white/70 rounded-full animate-pulse"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-white/70 rounded-full animate-pulse"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        ) : ActiveTab === "pending" ? (
          <div className="grid grid-cols-1 gap-4">
            {PendingProposals.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <p className="text-gray-400">Brak oczekujących propozycji</p>
              </div>
            ) : (
              PendingProposals.map((Proposal, Index) => (
                <div
                  key={Proposal.Id}
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 border border-white/10">
                      {Proposal.AlbumArt ? (
                        <Image
                          src={Proposal.AlbumArt}
                          alt={Proposal.Album}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white/60"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">{Proposal.Title}</h3>
                      <p className="text-gray-400">{Proposal.Artist}</p>
                      <div className="flex mt-1 items-center">
                        <span className="text-xs text-gray-500 mr-4">
                          {FormatDuration(Proposal.Duration)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Oczekuje od:{" "}
                          {new Date(Proposal.CreatedAt).toLocaleDateString(
                            "pl-PL",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {CanManageSongRequests && (
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => HandleApprove(Proposal.Id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="Zatwierdź piosenkę"
                      >
                        <i className="fas fa-check mr-1.5"></i>
                        Zatwierdź
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => HandleReject(Proposal.Id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Odrzuć piosenkę"
                      >
                        <i className="fas fa-times mr-1.5"></i>
                        Odrzuć
                      </motion.button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ApprovedSongs.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <p className="text-gray-400">Brak zatwierdzonych piosenek</p>
              </div>
            ) : (
              ApprovedSongs.map((Song, Index) => (
                <div
                  key={Song.Id}
                  className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 border border-white/10">
                      {Song.AlbumArt ? (
                        <Image
                          src={Song.AlbumArt}
                          alt={Song.Album}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white/60"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">{Song.Title}</h3>
                      <p className="text-gray-400">{Song.Artist}</p>
                      <div className="flex mt-1 items-center">
                        <span className="text-xs text-gray-500 mr-4">
                          {FormatDuration(Song.Duration)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Zatwierdzona:{" "}
                          {new Date(Song.CreatedAt).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {CanManageSongRequests && (
                    <div className="flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => HandleReject(Song.Id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Usuń z zatwierdzonych (odrzuć)"
                      >
                        <i className="fas fa-trash-alt mr-1"></i>
                        Usuń
                      </motion.button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongRequests;
