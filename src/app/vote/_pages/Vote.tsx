"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchSpotifyTracks } from "@/lib/spotify.client";
import { SpotifyTrack } from "@/types/spotify";
import { GenerateFingerprint } from "@/lib/client-fingerprint";
import { debounce } from "lodash";
import { Turnstile } from "@marsidev/react-turnstile";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";
import Image from "next/image";

const _JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });
const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const Vote = () => {
  const [SearchTerm, setSearchTerm] = useState("");
  const [ActiveTab, setActiveTab] = useState<"submit" | "recent">("submit");
  const [SearchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [IsAuthenticated, setIsAuthenticated] = useState(true);
  const [SelectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const SearchInputRef = useRef<HTMLInputElement>(null);
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [ClientFingerprint, setClientFingerprint] = useState<string | null>(
    null,
  );
  const [RecentProposals, setRecentProposals] = useState<any[]>([]);
  const [IsLoadingProposals, setIsLoadingProposals] = useState(false);
  const [Notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [IsPendingView, setIsPendingView] = useState(false);
  const [PendingProposals, setPendingProposals] = useState<any[]>([]);
  const [IsLoadingPendingProposals, setIsLoadingPendingProposals] =
    useState(false);
  const [TurnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [IsTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [IsTurnstileLoading, setIsTurnstileLoading] = useState(false);
  const [FooterMetrics, setFooterMetrics] = useState({
    height: 0,
    paddingTop: 0,
  });
  const [IsMobile, setIsMobile] = useState(false);
  const IsSubmitTabActive = ActiveTab === "submit" || !ActiveTab;
  const MobileContentOffset =
    ActiveTab === "submit" ? "mt-[145px]" : "mt-[90px]";

  const ShowNotification = (Message: string, Type: "success" | "error") => {
    setNotification({ message: Message, type: Type });
    setTimeout(() => setNotification(null), 4000);
  };

  const FetchSearchResults = useCallback(
    debounce(async (Query: string) => {
      if (!Query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        const Result = await SearchSpotifyTracks(Query);

        if (Result.isAuthenticated === false) {
          setIsAuthenticated(false);
        }

        setSearchResults(Result.tracks || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  const HandleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const Value = e.target.value;
    setSearchTerm(Value);
    setIsLoading(true);
    FetchSearchResults(Value);
  };

  const SelectTrack = (Track: SpotifyTrack) => {
    setSelectedTrack(Track);
    setSearchResults([]);
    setSearchTerm("");
  };

  const ClearSelection = () => {
    setSelectedTrack(null);
    setTimeout(() => {
      SearchInputRef.current?.focus();
    }, 0);
  };

  const HandleSubmit = async () => {
    if (!SelectedTrack) return;
    if (!TurnstileToken || !IsTurnstileVerified) {
      ShowNotification("Proszę zweryfikować CAPTCHA przed wysłaniem", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const Response = await fetch("/api/songs/propose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Track: SelectedTrack,
          ClientId: ClientFingerprint,
          Token: TurnstileToken,
        }),
      });

      const Data = await Response.json();

      if (Response.ok) {
        setSelectedTrack(null);
        setTurnstileToken(null);
        setIsTurnstileVerified(false);
        FetchRecentProposals();
        ShowNotification("Propozycja piosenki została wysłana!", "success");
      } else {
        if (Response.status === 429) {
          ShowNotification(
            `Limit czasu: ${Data.error || "Spróbuj ponownie za chwilę"}`,
            "error",
          );
        } else if (Data.alreadyExists) {
          ShowNotification(
            "Ta piosenka została już zaproponowana przez innego użytkownika",
            "error",
          );
        } else if (Data.alreadyApproved) {
          ShowNotification(
            "Ta piosenka została już zatwierdzona przez administratora i będzie odtworzona",
            "error",
          );
        } else if (Data.captchaFailed) {
          ShowNotification(
            "Weryfikacja CAPTCHA nie powiodła się. Spróbuj ponownie.",
            "error",
          );
          setIsTurnstileVerified(false);
        } else {
          ShowNotification(
            Data.error || "Nie udało się wysłać propozycji piosenki",
            "error",
          );
        }
      }
    } catch (Error) {
      console.error("Error submitting song:", Error);
      ShowNotification(
        "Wystąpił błąd podczas wysyłania propozycji. Spróbuj ponownie później.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const FetchRecentProposals = useCallback(async () => {
    try {
      setIsLoadingProposals(true);
      const Response = await fetch(
        `/api/songs/proposals?limit=200${ClientFingerprint ? `&clientId=${ClientFingerprint}` : ""}&pending=false`,
      );

      if (Response.ok) {
        const Data = await Response.json();
        const SortedProposals = [...Data.proposals].sort(
          (a, b) =>
            (b.Upvotes || 0) -
            (b.Downvotes || 0) -
            ((a.Upvotes || 0) - (a.Downvotes || 0)),
        );
        setRecentProposals(SortedProposals);
      }
    } catch (Error) {
      console.error("Error fetching recent proposals:", Error);
    } finally {
      setIsLoadingProposals(false);
    }
  }, [ClientFingerprint]);

  const FetchPendingProposals = useCallback(async () => {
    try {
      setIsLoadingPendingProposals(true);
      const Response = await fetch(
        `/api/songs/proposals?limit=10${ClientFingerprint ? `&clientId=${ClientFingerprint}` : ""}&pending=true`,
      );

      if (Response.ok) {
        const Data = await Response.json();
        const SortedProposals = [...Data.proposals].sort(
          (a, b) =>
            (b.Upvotes || 0) -
            (b.Downvotes || 0) -
            ((a.Upvotes || 0) - (a.Downvotes || 0)),
        );
        setPendingProposals(SortedProposals);
      }
    } catch (Error) {
      console.error("Error fetching pending proposals:", Error);
    } finally {
      setIsLoadingPendingProposals(false);
    }
  }, [ClientFingerprint]);

  const HandleTurnstileVerify = async (Token: string) => {
    setTurnstileToken(Token);
    setIsTurnstileVerified(true);
    setIsTurnstileLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const UserAgent = navigator.userAgent;
      const ScreenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const Language = navigator.language;

      const FingerprintData = `${UserAgent}|${ScreenInfo}|${TimeZone}|${Language}`;
      const Fingerprint = GenerateFingerprint(
        FingerprintData,
        navigator.userAgent,
      );

      setClientFingerprint(Fingerprint);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const measure = () => {
      const el = document.getElementById("site-footer");
      if (!el) return;
      const height = el.offsetHeight || 0;
      const computed = window.getComputedStyle(el);
      const paddingTop = parseFloat(computed.paddingTop || "0");
      setFooterMetrics({ height, paddingTop });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    FetchRecentProposals();
  }, [FetchRecentProposals]);

  useEffect(() => {
    if (IsPendingView) {
      FetchPendingProposals();
    }
  }, [IsPendingView, FetchPendingProposals]);

  const BaseStickyOffset = Math.max(
    16,
    FooterMetrics.height - FooterMetrics.paddingTop - 8,
  );
  const StickyBottomOffset = IsMobile
    ? Math.max(BaseStickyOffset, FooterMetrics.height + 16)
    : BaseStickyOffset;
  const ScrollPaddingOffset = StickyBottomOffset + (IsMobile ? 96 : 48);

  const FormatDuration = (Ms: number) => {
    const Minutes = Math.floor(Ms / 60000);
    const Seconds = Math.floor((Ms % 60000) / 1000);
    return `${Minutes}:${Seconds.toString().padStart(2, "0")}`;
  };

  const HandleVote = async (proposalId: string, vote: boolean) => {
    try {
      setIsSubmitting(true);

      if (!TurnstileToken || !IsTurnstileVerified) {
        ShowNotification(
          "Proszę zweryfikować CAPTCHA przed głosowaniem",
          "error",
        );
        return;
      }

      const Response = await fetch("/api/songs/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ProposalId: proposalId,
          Vote: vote,
          ClientId: ClientFingerprint,
          Token: TurnstileToken,
        }),
      });

      const Data = await Response.json();

      if (Response.ok) {
        if (IsPendingView) {
          FetchPendingProposals();
        } else {
          FetchRecentProposals();
        }

        if (Data.changed) {
          ShowNotification("Twój głos został zmieniony!", "success");
        } else {
          ShowNotification("Głos został zapisany!", "success");
        }

        setTurnstileToken(null);
        setIsTurnstileVerified(false);

        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        if (Data && Data.captchaFailed) {
          ShowNotification(
            "Weryfikacja CAPTCHA jest wymagana do głosowania",
            "error",
          );
        } else if (Response.status === 429) {
          ShowNotification(
            `Limit czasu: ${Data.error || "Spróbuj zagłosować za chwilę"}`,
            "error",
          );
        } else if (Data.alreadyVoted) {
          ShowNotification("Już oddałeś taki sam głos na tę piosenkę", "error");
        } else {
          ShowNotification(
            "Nie udało się zagłosować. " + (Data.error || ""),
            "error",
          );
        }
      }
    } catch (Error) {
      console.error("Error voting:", Error);
      ShowNotification(
        "Wystąpił błąd podczas głosowania. Spróbuj ponownie później.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const OpenPendingView = () => {
    setIsPendingView(true);
    FetchPendingProposals();
  };

  const ClosePendingView = () => {
    setIsPendingView(false);
  };

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-black text-white">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {Notification && (
        <div
          className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-lg shadow-xl transition-all duration-500 transform translate-y-0 opacity-100 ${
            Notification.type === "success"
              ? "bg-green-500/90 backdrop-blur-sm border border-green-400 shadow-green-500/20"
              : "bg-red-500/90 backdrop-blur-sm border border-red-400 shadow-red-500/20"
          }`}
        >
          <div className="flex items-center">
            <div className="shrink-0 mr-3">
              {Notification.type === "success" ? (
                <i className="fas fa-check w-5 h-5 text-white"></i>
              ) : (
                <i className="fas fa-times w-5 h-5 text-white"></i>
              )}
            </div>
            <div className="text-white text-sm font-medium">
              {Notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-white hover:text-white/80 p-1"
              aria-label="Zamknij powiadomienie"
              title="Zamknij powiadomienie"
            >
              <i className="fas fa-times w-4 h-4"></i>
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[60vh] h-[60vh] rounded-full bg-white/5 blur-[100px] -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40vh] h-[40vh] rounded-full bg-white/5 blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black via-black/90 to-transparent z-10"></div>

      <Navbar activeTab={ActiveTab} onChangeTab={setActiveTab} />

      <div
        className={`w-full mx-auto px-6 md:px-12 pt-2 pb-12 md:py-28 z-10 ${MobileContentOffset} md:mt-20 flex-1`}
        style={{
          paddingBottom: FooterMetrics.height
            ? FooterMetrics.height + 8
            : undefined,
        }}
      >
        <div className="max-w-6xl mx-auto min-h-full flex flex-col">
          <h1
            className={`hidden md:block text-5xl md:text-7xl font-bold mb-6 ${_SpaceGrotesk.className} tracking-tight`}
          >
            Zaproponuj piosenke
          </h1>
          <p className="hidden md:block text-lg text-white/70 max-w-xl mb-16">
            Pomóż nam tworzyć wyjątkową atmosferę w szkole. Piosenki z
            największą ilością głosów trafiają do playlisty.
          </p>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 flex-1 min-h-0">
            <section className="lg:w-1/2 w-full flex flex-col">
              <div className="mb-8 hidden md:flex space-x-4">
                <button
                  onClick={() => setActiveTab("submit")}
                  className={`py-3 px-6 relative group ${ActiveTab === "submit" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  <span className={`${_SpaceGrotesk.className} tracking-wide`}>
                    WYŚLIJ PIOSENKĘ
                  </span>
                  {ActiveTab === "submit" && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-white"></span>
                  )}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/50 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`py-3 px-6 relative group md:hidden ${ActiveTab === "recent" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  <span className={`${_SpaceGrotesk.className} tracking-wide`}>
                    OSTATNIE
                  </span>
                  {ActiveTab === "recent" && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-white"></span>
                  )}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/50 group-hover:w-full transition-all duration-300"></span>
                </button>
              </div>

              {IsSubmitTabActive && (
                <div className="flex flex-col flex-1">
                  <div className="space-y-10 relative flex-1">
                    <div className="relative">
                      <div className="group">
                        <div
                          className={`flex flex-col w-full ${SelectedTrack ? "mb-2" : ""}`}
                        >
                          <div className="relative flex">
                            <input
                              ref={SearchInputRef}
                              type="text"
                              value={SearchTerm}
                              onChange={HandleSearchChange}
                              className="flex-grow p-4 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300 rounded-xl"
                              placeholder={
                                SelectedTrack
                                  ? "Zmień utwór..."
                                  : "Wyszukaj utwór na Spotify..."
                              }
                              disabled={!IsAuthenticated}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
                              <i className="fas fa-search h-5 w-5"></i>
                            </div>

                            {SearchTerm && (
                              <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                                onClick={() => setSearchTerm("")}
                                aria-label="Wyczyść wyszukiwanie"
                                title="Wyczyść wyszukiwanie"
                              >
                                <i className="fas fa-times h-5 w-5"></i>
                              </button>
                            )}
                          </div>

                          {SelectedTrack && (
                            <div className="flex items-center mt-4 p-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
                              <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden mr-3 border border-white/10">
                                {SelectedTrack.AlbumArt ? (
                                  <Image
                                    src={SelectedTrack.AlbumArt}
                                    alt={SelectedTrack.Album}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                    <i className="fas fa-music w-6 h-6 text-white/60"></i>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {SelectedTrack.Title}
                                </h4>
                                <p className="text-xs text-white/70 truncate">
                                  {SelectedTrack.Artist}
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-2 flex items-center">
                                <span className="text-xs text-white/60 mr-2">
                                  {FormatDuration(SelectedTrack.Duration)}
                                </span>
                                <button
                                  onClick={ClearSelection}
                                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                                  aria-label="Usuń wybrany utwór"
                                  title="Usuń wybrany utwór"
                                >
                                  <i className="fas fa-times h-4 w-4"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {SearchTerm && SearchResults.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar">
                            <div className="divide-y divide-white/10">
                              {SearchResults.map((Track) => (
                                <div
                                  key={Track.Id}
                                  onClick={() => SelectTrack(Track)}
                                  className="flex items-center p-3 hover:bg-white/10 cursor-pointer transition-colors duration-200 group"
                                >
                                  <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden mr-3 border border-white/10 group-hover:border-white/30 transition-all duration-300">
                                    {Track.AlbumArt ? (
                                      <Image
                                        src={Track.AlbumArt}
                                        alt={Track.Album}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                        <i className="fas fa-music w-5 h-5 text-white/60"></i>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate">
                                      {Track.Title}
                                    </h4>
                                    <p className="text-xs text-white/70 truncate">
                                      {Track.Artist}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 text-xs text-white/60">
                                    {FormatDuration(Track.Duration)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {SearchTerm && IsLoading && (
                          <div className="absolute mt-1 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex justify-center">
                            <div className="flex space-x-2 items-center">
                              <div
                                className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {SearchTerm &&
                          !IsLoading &&
                          SearchResults.length === 0 && (
                            <div className="absolute mt-1 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                              <p className="text-white/70">
                                Nie znaleziono utworów
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    {!IsTurnstileVerified && (
                      <div
                        id="turnstile-verify"
                        className="border border-white/10 rounded-xl py-8 px-6 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-white/5 blur-[60px]"></div>
                        <div className="absolute -left-24 -top-24 w-48 h-48 rounded-full bg-white/10 blur-[80px]"></div>

                        <div className="w-full flex flex-col items-center py-3 relative z-10">
                          <span className="text-sm text-white/80 mb-3 flex items-center font-medium">
                            <i className="fas fa-shield-alt w-4 h-4 mr-2 text-white/60"></i>
                            Weryfikacja CAPTCHA
                          </span>
                          <div className="w-full flex justify-center">
                            <Turnstile
                              siteKey={
                                process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
                              }
                              onSuccess={HandleTurnstileVerify}
                              onError={() => {
                                setIsTurnstileVerified(false);
                                ShowNotification(
                                  "Wystąpił błąd podczas ładowania CAPTCHA",
                                  "error",
                                );
                              }}
                              onExpire={() => {
                                setIsTurnstileVerified(false);
                                setTurnstileToken(null);
                              }}
                              options={{
                                theme: "dark",
                                size: "normal",
                              }}
                              className="mx-auto"
                            />
                          </div>
                          <span
                            className={`text-xs text-white/60 mt-2 ${_JetBrainsMono.className} tracking-wider`}
                          >
                            {IsTurnstileVerified ? (
                              <span className="text-green-400 flex items-center">
                                <i className="fas fa-check w-3 h-3 mr-1"></i>
                                Zweryfikowano
                              </span>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-white/40 italic">
                        *Nie akceptujemy propozycji z wulgaryzmami w języku
                        polskim
                      </p>
                    </div>

                    <button
                      className={`w-full mt-6 py-4 bg-white text-black rounded-xl transition-all duration-500 font-medium group relative overflow-hidden ${!SelectedTrack || IsSubmitting || !IsTurnstileVerified ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"}`}
                      type="button"
                      onClick={HandleSubmit}
                      disabled={
                        !SelectedTrack || IsSubmitting || !IsTurnstileVerified
                      }
                    >
                      <span className="relative z-10 group-hover:tracking-[0.15em] transition-all duration-500">
                        {IsSubmitting ? "WYSYŁANIE..." : "WYŚLIJ"}
                      </span>
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-700"></div>
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section
              className={`lg:w-1/2 w-full ${ActiveTab === "recent" ? "flex" : "hidden md:flex"} flex-col`}
            >
              {IsPendingView ? (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={ClosePendingView}
                      className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                    >
                      <i className="fas fa-arrow-left w-4 h-4"></i>
                      Wróć do głosowania
                    </button>
                    {PendingProposals.length > 0 && (
                      <span className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full">
                        {PendingProposals.length} w kolejce
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-h-0">
                    {IsLoadingPendingProposals ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="flex space-x-2 items-center">
                          <div
                            className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    ) : PendingProposals.length === 0 ? (
                      <div className="text-center py-10 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-white/70">
                          Brak oczekujących propozycji
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[70vh]">
                        {PendingProposals.map((Proposal) => (
                          <div
                            key={Proposal.Id}
                            className="flex border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 p-3 items-center"
                          >
                            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-white/10 mr-3">
                              {Proposal.AlbumArt ? (
                                <Image
                                  src={Proposal.AlbumArt}
                                  alt={Proposal.Album || "Album cover"}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                  <i className="fas fa-music w-8 h-8 text-white/60"></i>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <h3 className="text-sm font-medium text-white truncate">
                                {Proposal.Title}
                              </h3>
                              <p className="text-xs text-white/70 truncate">
                                {Proposal.Artist}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-white/50 mr-2">
                                  {FormatDuration(Proposal.Duration)}
                                </span>
                                <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                                  Oczekująca
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8 hidden md:flex">
                    <h2
                      className={`uppercase text-lg font-medium ${_SpaceGrotesk.className} tracking-wide border-b-2 border-white pb-3 text-white`}
                    >
                      Głosowanie
                    </h2>
                  </div>

                  <div className="mb-4">
                    <button
                      onClick={OpenPendingView}
                      className="w-full px-3 md:px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-between text-white hover:bg-white/10 transition-all duration-300"
                    >
                      <span
                        className={`text-base font-medium ${_SpaceGrotesk.className}`}
                      >
                        Piosenki oczekujące
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm">
                        {PendingProposals.length > 0 && (
                          <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
                            {PendingProposals.length}
                          </span>
                        )}
                        <i className="fas fa-chevron-right w-4 h-4 text-white/70"></i>
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-col flex-1 min-h-0">
                    {!IsTurnstileVerified && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-white/70">
                        <i className="fas fa-shield-alt w-3 h-3 text-white/60"></i>
                        <span>
                          Aby zaglosowac, zweryfikuj swoje urzadzenie w sekcji
                          "wyslij piosenke"
                        </span>
                        <button
                          className="ml-auto px-4 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                          type="button"
                          onClick={() => {
                            setActiveTab("submit");
                            setTimeout(() => {
                              const el =
                                document.getElementById("turnstile-verify");
                              el?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                            }, 0);
                          }}
                        >
                          przejdź
                        </button>
                      </div>
                    )}
                    <div className="flex-1 min-h-0">
                      {IsLoadingProposals ? (
                        <div className="flex justify-center items-center py-10">
                          <div className="flex space-x-2 items-center">
                            <div
                              className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-white/70 rounded-full animate-pulse"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                        </div>
                      ) : RecentProposals.length === 0 ? (
                        <div className="text-center py-10 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                          <p className="text-white/70">
                            Brak zatwierdzonych piosenek
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[70vh]">
                          {RecentProposals.map((Proposal) => (
                            <div
                              key={Proposal.Id}
                              className="flex border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                              <div className="flex flex-col items-center justify-center py-2 px-2 border-r border-white/10 relative z-10">
                                <button
                                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                    Proposal.UserVote === "up"
                                      ? "text-green-400 bg-green-400/10"
                                      : "text-white/50 hover:text-white/80 hover:bg-white/10"
                                  } transition-colors duration-300`}
                                  title="Głosuj za"
                                  onClick={() => HandleVote(Proposal.Id, true)}
                                  disabled={
                                    IsSubmitting || !IsTurnstileVerified
                                  }
                                >
                                  <i className="fas fa-chevron-up w-5 h-5"></i>
                                </button>
                                <span className="text-sm font-medium my-1 text-white/70">
                                  {(Proposal.Upvotes || 0) -
                                    (Proposal.Downvotes || 0)}
                                </span>
                                <button
                                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                    Proposal.UserVote === "down"
                                      ? "text-red-400 bg-red-400/10"
                                      : "text-white/50 hover:text-white/80 hover:bg-white/10"
                                  } transition-colors duration-300`}
                                  title="Głosuj przeciw"
                                  onClick={() => HandleVote(Proposal.Id, false)}
                                  disabled={
                                    IsSubmitting || !IsTurnstileVerified
                                  }
                                >
                                  <i className="fas fa-chevron-down w-5 h-5"></i>
                                </button>
                              </div>

                              <div className="flex-grow p-4 pl-4 relative z-10 flex items-center">
                                <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 shrink-0 group-hover:scale-105 transition-all duration-500 border border-white/10">
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
                                      <i className="fas fa-music w-8 h-8 text-white/60"></i>
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                  <h3
                                    className={`font-medium text-white line-clamp-1 ${_SpaceGrotesk.className}`}
                                  >
                                    {Proposal.Title}
                                  </h3>
                                  <p className="text-sm text-white/70">
                                    {Proposal.Artist}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span
                                      className={`text-xs text-white/60 ${_JetBrainsMono.className} tracking-wider`}
                                    >
                                      {new Date(
                                        Proposal.CreatedAt,
                                      ).toLocaleDateString("pl-PL", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                    <span
                                      className={`text-xs text-white/60 ${_JetBrainsMono.className} tracking-wider`}
                                    >
                                      {Proposal.Fingerprint &&
                                        Proposal.Fingerprint.substring(0, 8)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer link={{ href: "/vote/gdpr", text: "GDPR", subtext: "/gdpr" }} />
    </main>
  );
};

export default Vote;
