"use client"

import type { NextPage } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SearchSpotifyTracks } from "@/lib/spotify.client";
import { SpotifyTrack } from "@/types/spotify";
import { GenerateFingerprint } from "@/lib/client-fingerprint";
import { debounce } from "lodash";
import { Turnstile } from "@marsidev/react-turnstile";

const _Inter = Inter({ subsets: ["latin"] });
const _JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });
const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const Vote: NextPage = () => {
  const [CurrentTime, setCurrentTime] = useState("");
  const [SearchTerm, setSearchTerm] = useState("");
  const [ActiveTab, setActiveTab] = useState("submit");
  const [SearchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [IsAuthenticated, setIsAuthenticated] = useState(true);
  const [SelectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const SearchInputRef = useRef<HTMLInputElement>(null);
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [ClientFingerprint, setClientFingerprint] = useState<string | null>(null);
  const [RecentProposals, setRecentProposals] = useState<any[]>([]);
  const [IsLoadingProposals, setIsLoadingProposals] = useState(false);
  const [Notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [IsPendingExpanded, setIsPendingExpanded] = useState(false);
  const [PendingProposals, setPendingProposals] = useState<any[]>([]);
  const [IsLoadingPendingProposals, setIsLoadingPendingProposals] = useState(false);
  const [TurnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [IsTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const [IsTurnstileLoading, setIsTurnstileLoading] = useState(false);

  const ShowNotification = (Message: string, Type: 'success' | 'error') => {
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
    []
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
      ShowNotification('Proszę zweryfikować CAPTCHA przed wysłaniem', 'error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const Response = await fetch('/api/songs/propose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Track: SelectedTrack,
          ClientId: ClientFingerprint,
          Token: TurnstileToken
        }),
      });
      
      const Data = await Response.json();
      
      if (Response.ok) {
        setSelectedTrack(null);
        setTurnstileToken(null);
        setIsTurnstileVerified(false);
        FetchRecentProposals();
        ShowNotification('Propozycja piosenki została wysłana!', 'success');
      } else {
        if (Response.status === 429) {
          ShowNotification(`Limit czasu: ${Data.error || 'Spróbuj ponownie za chwilę'}`, 'error');
        } else if (Data.alreadyExists) {
          ShowNotification('Ta piosenka została już zaproponowana przez innego użytkownika', 'error');
        } else if (Data.alreadyApproved) {
          ShowNotification('Ta piosenka została już zatwierdzona przez administratora i będzie odtworzona', 'error');
        } else if (Data.captchaFailed) {
          ShowNotification('Weryfikacja CAPTCHA nie powiodła się. Spróbuj ponownie.', 'error');
          setIsTurnstileVerified(false);
        } else {
          ShowNotification(Data.error || 'Nie udało się wysłać propozycji piosenki', 'error');
        }
      }
    } catch (Error) {
      console.error('Error submitting song:', Error);
      ShowNotification('Wystąpił błąd podczas wysyłania propozycji. Spróbuj ponownie później.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const FetchRecentProposals = useCallback(async () => {
    try {
      setIsLoadingProposals(true);
      const Response = await fetch(`/api/songs/proposals?limit=20${ClientFingerprint ? `&clientId=${ClientFingerprint}` : ''}&pending=false`);
      
      if (Response.ok) {
        const Data = await Response.json();
        const SortedProposals = [...Data.proposals].sort((a, b) => (b.Upvotes || 0) - (a.Upvotes || 0));
        setRecentProposals(SortedProposals);
      }
    } catch (Error) {
      console.error('Error fetching recent proposals:', Error);
    } finally {
      setIsLoadingProposals(false);
    }
  }, [ClientFingerprint]);

  const FetchPendingProposals = useCallback(async () => {
    try {
      setIsLoadingPendingProposals(true);
      const Response = await fetch(`/api/songs/proposals?limit=10${ClientFingerprint ? `&clientId=${ClientFingerprint}` : ''}&pending=true`);
      
      if (Response.ok) {
        const Data = await Response.json();
        const SortedProposals = [...Data.proposals].sort((a, b) => (b.Upvotes || 0) - (a.Upvotes || 0));
        setPendingProposals(SortedProposals);
      }
    } catch (Error) {
      console.error('Error fetching pending proposals:', Error);
    } finally {
      setIsLoadingPendingProposals(false);
    }
  }, [ClientFingerprint]);

  const HandleTurnstileVerify = async (Token: string) => {
    console.log('Turnstile token received:', Token ? Token.substring(0, 20) + '...' : null);
    setTurnstileToken(Token);
    setIsTurnstileLoading(true);
    
    const IsDevelopment = process.env.NODE_ENV === 'development';
    if (IsDevelopment) {
      console.log('Development mode: Auto-verifying Turnstile');
      setIsTurnstileVerified(true);
      setIsTurnstileLoading(false);
      return;
    }
    
    try {
      console.log('Verifying Turnstile token...');
      const Response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Token }),
      });
      
      const Result = await Response.json();
      console.log('Turnstile verification result:', Result);
      
      if (Result.Success) {
        setIsTurnstileVerified(true);
        ShowNotification('Weryfikacja CAPTCHA zakończona pomyślnie', 'success');
      } else {
        setIsTurnstileVerified(false);
        ShowNotification('Weryfikacja CAPTCHA nie powiodła się. Spróbuj ponownie.', 'error');
      }
    } catch (Error) {
      console.error('Error verifying Turnstile token:', Error);
      setIsTurnstileVerified(false);
      ShowNotification('Wystąpił błąd podczas weryfikacji CAPTCHA', 'error');
    } finally {
      setIsTurnstileLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const UserAgent = navigator.userAgent;
      const ScreenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const Language = navigator.language;
      
      const FingerprintData = `${UserAgent}|${ScreenInfo}|${TimeZone}|${Language}`;
      const Fingerprint = GenerateFingerprint(FingerprintData, navigator.userAgent);
      
      setClientFingerprint(Fingerprint);
    }
  }, []);

  useEffect(() => {
    FetchRecentProposals();
  }, [FetchRecentProposals]);

  useEffect(() => {
    if (IsPendingExpanded) {
      FetchPendingProposals();
    }
  }, [IsPendingExpanded, FetchPendingProposals]);

  useEffect(() => {
    const UpdateClock = () => {
      const Now = new Date();
      const Hours = Now.getHours().toString().padStart(2, "0");
      const Minutes = Now.getMinutes().toString().padStart(2, "0");
      const Seconds = Now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${Hours}:${Minutes}:${Seconds}`);
    }
    
    UpdateClock();
    const Interval = setInterval(UpdateClock, 1000);
    return () => clearInterval(Interval);
  }, []);

  const FormatDuration = (Ms: number) => {
    const Minutes = Math.floor(Ms / 60000);
    const Seconds = Math.floor((Ms % 60000) / 1000);
    return `${Minutes}:${Seconds.toString().padStart(2, "0")}`;
  };

  const HandleVote = async (proposalId: string, vote: boolean) => {
    try {
      setIsSubmitting(true);
      
      const Response = await fetch('/api/songs/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ProposalId: proposalId,
          Vote: vote,
          ClientId: ClientFingerprint
        }),
      });
      
      const Data = await Response.json();
      
      if (Response.ok) {
        if (IsPendingExpanded) {
          FetchPendingProposals();
        } else {
          FetchRecentProposals();
        }
        
        if (Data.changed) {
          ShowNotification('Twój głos został zmieniony!', 'success');
        } else {
          ShowNotification('Głos został zapisany!', 'success');
        }
      } else {
        if (Response.status === 429) {
          ShowNotification(`Limit czasu: ${Data.error || 'Spróbuj zagłosować za chwilę'}`, 'error');
        } else if (Data.alreadyVoted) {
          ShowNotification('Już oddałeś taki sam głos na tę piosenkę', 'error');
        } else {
          ShowNotification('Nie udało się zagłosować. ' + (Data.error || ''), 'error');
        }
      }
    } catch (Error) {
      console.error('Error voting:', Error);
      ShowNotification('Wystąpił błąd podczas głosowania. Spróbuj ponownie później.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TogglePendingSection = () => {
    setIsPendingExpanded(!IsPendingExpanded);
    if (!IsPendingExpanded) {
      FetchPendingProposals();
    }
  };

  return (
    <main className="flex min-h-screen relative overflow-hidden bg-black text-white">
      {Notification && (
        <div className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-lg shadow-xl transition-all duration-500 transform translate-y-0 opacity-100 ${
          Notification.type === 'success' 
            ? 'bg-green-500/90 backdrop-blur-sm border border-green-400 shadow-green-500/20' 
            : 'bg-red-500/90 backdrop-blur-sm border border-red-400 shadow-red-500/20'
        }`}>
          <div className="flex items-center">
            <div className="shrink-0 mr-3">
              {Notification.type === 'success' ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="text-white text-sm font-medium">{Notification.message}</div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-white hover:text-white/80 p-1"
              aria-label="Zamknij powiadomienie"
              title="Zamknij powiadomienie"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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

      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative w-12 h-12">
              <Image 
                src="/zstio-512-alt.png" 
                alt="ZSTIO Logo" 
                width={48} 
                height={48}
                className="relative hover:scale-105 transition-all duration-500"
                priority
              />
              <div className="absolute -inset-1 border border-white/20 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className={`text-2xl font-bold tracking-tight hidden md:block ${_SpaceGrotesk.className}`}>Radiowęzeł ZSTiO</h2>
          </div>
          
          <div className={`font-mono text-sm text-white/70 ${_JetBrainsMono.className} tracking-wider bg-white/5 backdrop-blur-sm py-2 px-4 border border-white/10 rounded-full`}>
            <span>{CurrentTime}</span>
          </div>
        </div>
      </header>

      <div className="w-full mx-auto px-6 md:px-12 py-28 z-10 mt-20">
        <div className="max-w-6xl mx-auto">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${_SpaceGrotesk.className} tracking-tight`}>Zaproponuj piosenke</h1>
          <p className="text-lg text-white/70 max-w-xl mb-16">Pomóż nam tworzyć wyjątkową atmosferę w szkole</p>
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <section className="lg:w-1/2 w-full">
              <div className="mb-8 flex space-x-4">
                <button 
                  onClick={() => setActiveTab("submit")}
                  className={`py-3 px-6 relative group ${ActiveTab === "submit" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  <span className={`${_SpaceGrotesk.className} tracking-wide`}>WYŚLIJ PIOSENKĘ</span>
                  {ActiveTab === "submit" && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-white"></span>
                  )}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/50 group-hover:w-full transition-all duration-300"></span>
                </button>
                <button 
                  onClick={() => setActiveTab("recent")}
                  className={`py-3 px-6 relative group md:hidden ${ActiveTab === "recent" ? "text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  <span className={`${_SpaceGrotesk.className} tracking-wide`}>OSTATNIE</span>
                  {ActiveTab === "recent" && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-white"></span>
                  )}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/50 group-hover:w-full transition-all duration-300"></span>
                </button>
              </div>
              
              {(ActiveTab === "submit" || !ActiveTab) && (
                <div className="space-y-10 relative">
                  
                  <div className="relative">
                    <div className="group">
                      <div className={`flex flex-col w-full ${SelectedTrack ? 'mb-2' : ''}`}>
                        <div className="relative flex">
                          <input 
                            ref={SearchInputRef}
                            type="text"
                            value={SearchTerm}
                            onChange={HandleSearchChange}
                            className="flex-grow p-4 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300 rounded-xl"
                            placeholder={SelectedTrack ? "Zmień utwór..." : "Wyszukaj utwór na Spotify..."}
                            disabled={!IsAuthenticated}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>

                          {SearchTerm && (
                            <button 
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                              onClick={() => setSearchTerm("")}
                              aria-label="Wyczyść wyszukiwanie"
                              title="Wyczyść wyszukiwanie"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
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
                                  <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{SelectedTrack.Title}</h4>
                              <p className="text-xs text-white/70 truncate">{SelectedTrack.Artist}</p>
                            </div>
                            <div className="flex-shrink-0 ml-2 flex items-center">
                              <span className="text-xs text-white/60 mr-2">{FormatDuration(SelectedTrack.Duration)}</span>
                              <button 
                                onClick={ClearSelection}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                                aria-label="Usuń wybrany utwór"
                                title="Usuń wybrany utwór"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                                      <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-sm font-medium text-white truncate">{Track.Title}</h4>
                                  <p className="text-xs text-white/70 truncate">{Track.Artist}</p>
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
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      )}
                      
                      {SearchTerm && !IsLoading && SearchResults.length === 0 && (
                        <div className="absolute mt-1 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                          <p className="text-white/70">Nie znaleziono utworów</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-white/10 rounded-xl py-8 px-6 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-white/5 blur-[60px]"></div>
                    <div className="absolute -left-24 -top-24 w-48 h-48 rounded-full bg-white/10 blur-[80px]"></div>
                    
                    <div className="w-full flex flex-col items-center py-3 relative z-10">
                      <span className="text-sm text-white/80 mb-3 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-2 text-white/60" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Weryfikacja CAPTCHA
                      </span>
                      <div className="w-full flex justify-center">
                        <Turnstile
                          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                          onSuccess={HandleTurnstileVerify}
                          onError={() => {
                            setIsTurnstileVerified(false);
                            ShowNotification('Wystąpił błąd podczas ładowania CAPTCHA', 'error');
                          }}
                          onExpire={() => {
                            setIsTurnstileVerified(false);
                            setTurnstileToken(null);
                          }}
                          options={{
                            theme: 'dark',
                            size: 'normal',
                          }}
                          className="mx-auto"
                        />
                      </div>
                      <span className={`text-xs text-white/60 mt-2 ${_JetBrainsMono.className} tracking-wider`}>
                        {IsTurnstileVerified ? (
                          <span className="text-green-400 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Zweryfikowano
                          </span>
                        ) : (
                          "Cloudflare Protected"
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className={`w-full mt-6 py-4 bg-white text-black rounded-xl transition-all duration-500 font-medium group relative overflow-hidden ${(!SelectedTrack || IsSubmitting || !IsTurnstileVerified) ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    type="button"
                    onClick={HandleSubmit}
                    disabled={!SelectedTrack || IsSubmitting || !IsTurnstileVerified}
                  >
                    <span className="relative z-10 group-hover:tracking-[0.15em] transition-all duration-500">
                      {IsSubmitting ? 'WYSYŁANIE...' : 'WYŚLIJ'}
                    </span>
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-black group-hover:w-full transition-all duration-700"></div>
                  </button>
                </div>
              )}
            </section>

            <section className={`lg:w-1/2 w-full ${ActiveTab === "recent" ? "block" : "hidden md:block"}`}>
              <div className="mb-8 hidden md:flex">
                <h2 className={`uppercase text-lg font-medium ${_SpaceGrotesk.className} tracking-wide border-b-2 border-white pb-3 text-white`}>
                  Głosowanie
                </h2>
              </div>
              
              <div className="space-y-4 mb-6">
                {IsLoadingProposals ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : RecentProposals.length === 0 ? (
                  <div className="text-center py-10 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                    <p className="text-white/70">Brak zatwierdzonych piosenek</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {RecentProposals.map((Proposal) => (
                      <div 
                        key={Proposal.Id} 
                        className="flex border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="flex flex-col items-center justify-center py-2 px-2 border-r border-white/10 relative z-10">
                          <button 
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              Proposal.UserVote === 'up'
                                ? 'text-green-400 bg-green-400/10'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                            } transition-colors duration-300`}
                            title="Głosuj za"
                            onClick={() => HandleVote(Proposal.Id, true)}
                            disabled={IsSubmitting}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium my-1 text-white/70">{Proposal.Upvotes || 0}</span>
                          <button 
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              Proposal.UserVote === 'down'
                                ? 'text-red-400 bg-red-400/10'
                                : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                            } transition-colors duration-300`}
                            title="Głosuj przeciw"
                            onClick={() => HandleVote(Proposal.Id, false)}
                            disabled={IsSubmitting}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
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
                                <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <h3 className={`font-medium text-white line-clamp-1 ${_SpaceGrotesk.className}`}>{Proposal.Title}</h3>
                            <p className="text-sm text-white/70">{Proposal.Artist}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs text-white/60 ${_JetBrainsMono.className} tracking-wider`}>
                                {new Date(Proposal.CreatedAt).toLocaleDateString('pl-PL', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                              <span className={`text-xs text-white/60 ${_JetBrainsMono.className} tracking-wider`}>
                                {Proposal.Fingerprint && Proposal.Fingerprint.substring(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pending Songs Accordion */}
              <div className="border border-white/10 rounded-xl overflow-hidden mb-16">
                <button 
                  onClick={TogglePendingSection}
                  className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm flex justify-between items-center hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <span className={`text-lg font-medium ${_SpaceGrotesk.className} tracking-wide text-white mr-2`}>
                      Piosenki oczekujące
                    </span>
                    {PendingProposals.length > 0 && (
                      <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
                        {PendingProposals.length}
                      </span>
                    )}
                  </div>
                  <svg 
                    className={`w-5 h-5 text-white/70 transition-transform duration-300 ${IsPendingExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {IsPendingExpanded && (
                  <div className="p-4 border-t border-white/10">
                    {IsLoadingPendingProposals ? (
                      <div className="flex justify-center items-center py-6">
                        <div className="flex space-x-2 items-center">
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    ) : PendingProposals.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-white/60">Brak oczekujących propozycji</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {PendingProposals.map((Proposal) => (
                          <div 
                            key={Proposal.Id} 
                            className="flex border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 p-3 items-center"
                          >
                            <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-white/10 mr-3">
                              {Proposal.AlbumArt ? (
                                <Image 
                                  src={Proposal.AlbumArt} 
                                  alt={Proposal.Album || 'Album cover'} 
                                  width={64} 
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                              <h3 className="text-sm font-medium text-white truncate">{Proposal.Title}</h3>
                              <p className="text-xs text-white/70 truncate">{Proposal.Artist}</p>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-white/50 mr-2">{FormatDuration(Proposal.Duration)}</span>
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
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-6 px-6 md:px-12 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex gap-8">
            <a 
              href="/vote/gdpr" 
              className="text-sm text-white/60 hover:text-white transition-all duration-300 font-mono flex items-center group"
            >
              <span>GDPR</span>
              <span className="opacity-0 group-hover:opacity-50 ml-2 transition-all duration-300">/gdpr</span>
            </a>
          </div>
          
          <div className="text-sm text-white/60 font-mono">
            made by <a 
              href="https://www.instagram.com/lmq4wb" 
              className="hover:text-white transition-all duration-300 border-b border-dotted border-white/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              @lmq4wb
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
};

export default Vote;