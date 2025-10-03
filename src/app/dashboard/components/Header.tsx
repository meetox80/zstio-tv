import { FC, useState, useEffect, useRef } from "react";
import { GetNowPlaying } from "@/lib/spotify.client";
import { signOut } from "next-auth/react";
import {
  GetCurrentPeriodInfo,
  PeriodInfo,
  InitializeLessonDuration,
  SubscribeToLessonDuration,
} from "@/lib/data/LessonTimes/LessonTimesUtil";
import {
  FetchWeatherData,
  WeatherData as WeatherDataType,
} from "@/lib/data/Weather/Weather";

type HeaderProps = {
  activeTab: string;
  hasNotifications: boolean;
  defaultLessonTime?: number;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
};

type SpotifyTrackData = {
  title: string;
  artist: string;
  isPlaying?: boolean;
  progress?: number;
  duration?: number;
};

const Header: FC<HeaderProps> = ({
  activeTab,
  hasNotifications,
  defaultLessonTime = 45,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  const [IsScrolled, setIsScrolled] = useState(false);
  const [TimeString, setTimeString] = useState("");
  const [DateString, setDateString] = useState("");
  const [WeatherData, setWeatherData] = useState({
    temp: "n/a",
    condition: "Jarosław",
  });
  const [SpotifyTrack, setSpotifyTrack] = useState<SpotifyTrackData>({
    title: "Brak danych",
    artist: "Zautoryzuj spotify",
  });
  const [LocalProgress, setLocalProgress] = useState<number | undefined>(
    undefined,
  );
  const [PeriodInfo, setPeriodInfo] = useState<PeriodInfo>({
    IsLesson: false,
    PeriodNumber: 0,
    RemainingTime: "00:00",
    ProgressPercent: 0,
  });

  const HeaderRef = useRef<HTMLDivElement>(null);
  const _ProgressInterval = useRef<NodeJS.Timeout | null>(null);
  const _LastUpdateTime = useRef<number>(Date.now());

  const _GetTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Strona główna";
      case "slajdy":
        return "Slajdy";
      case "settings":
        return "Settings";
      case "archive":
        return "Archive";
      case "substitutions":
        return "Substitutions";
      default:
        return "Dashboard";
    }
  };

  useEffect(() => {
    InitializeLessonDuration(defaultLessonTime);
  }, [defaultLessonTime]);

  useEffect(() => {
    const HandleScroll = () => {
      if (!HeaderRef.current) return;
      const _ScrollPosition = window.scrollY;
      const _ShouldBeScrolled = _ScrollPosition > 10;

      if (IsScrolled !== _ShouldBeScrolled) {
        setIsScrolled(_ShouldBeScrolled);
      }
    };

    const UpdateTimeDate = () => {
      const _Now = new Date();
      setTimeString(
        _Now.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setDateString(
        _Now.toLocaleDateString("pl-PL", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      );
    };

    const UpdateLessonTime = () => {
      const CurrentInfo = GetCurrentPeriodInfo();
      setPeriodInfo(CurrentInfo);
    };

    const UpdateWeather = async () => {
      const WeatherInfo = await FetchWeatherData();
      if (WeatherInfo.Temperature !== null) {
        setWeatherData({
          temp: `${Math.round(WeatherInfo.Temperature)}°C`,
          condition: "Jarosław",
        });
      }
    };

    window.addEventListener("scroll", HandleScroll, { passive: true });
    UpdateTimeDate();
    UpdateLessonTime();
    UpdateWeather();

    const _TimeInterval = setInterval(UpdateTimeDate, 30000);
    const _LessonInterval = setInterval(UpdateLessonTime, 1000);
    const _WeatherInterval = setInterval(UpdateWeather, 30 * 60 * 1000);

    const _Unsubscribe = SubscribeToLessonDuration(() => {
      UpdateLessonTime();
    });

    return () => {
      window.removeEventListener("scroll", HandleScroll);
      clearInterval(_TimeInterval);
      clearInterval(_LessonInterval);
      clearInterval(_WeatherInterval);
      if (_ProgressInterval.current) {
        clearInterval(_ProgressInterval.current);
      }
      _Unsubscribe();
    };
  }, [IsScrolled]);

  useEffect(() => {
    const FetchSpotifyTrack = async () => {
      try {
        const TrackData = await GetNowPlaying();
        if (TrackData && TrackData.isPlaying) {
          setSpotifyTrack({
            title: TrackData.title || "Unknown",
            artist: TrackData.artist || "Unknown",
            isPlaying: TrackData.isPlaying,
            progress: TrackData.progress,
            duration: TrackData.duration,
          });
          setLocalProgress(TrackData.progress);
          _LastUpdateTime.current = Date.now();
        }
      } catch (error) {
        console.error("Failed to fetch Spotify track:", error);
      }
    };

    FetchSpotifyTrack();

    const _SpotifyInterval = setInterval(FetchSpotifyTrack, 10000);

    return () => {
      clearInterval(_SpotifyInterval);
    };
  }, []);

  useEffect(() => {
    if (_ProgressInterval.current) {
      clearInterval(_ProgressInterval.current);
    }

    if (
      SpotifyTrack.isPlaying &&
      SpotifyTrack.progress !== undefined &&
      SpotifyTrack.duration !== undefined
    ) {
      _ProgressInterval.current = setInterval(() => {
        const ElapsedTime = Date.now() - _LastUpdateTime.current;
        const NewProgress = Math.min(
          SpotifyTrack.duration!,
          (SpotifyTrack.progress || 0) + ElapsedTime,
        );

        setLocalProgress(NewProgress);

        if (NewProgress >= SpotifyTrack.duration!) {
          if (_ProgressInterval.current) {
            clearInterval(_ProgressInterval.current);
          }
        }
      }, 1000);
    }

    return () => {
      if (_ProgressInterval.current) {
        clearInterval(_ProgressInterval.current);
      }
    };
  }, [SpotifyTrack]);

  const _GetProgressPercent = (): number => {
    if (!SpotifyTrack.duration || !LocalProgress) return 0;
    return Math.min(100, (LocalProgress / SpotifyTrack.duration) * 100);
  };

  const _IconMap = {
    dashboard: "chart-bar",
    slajdy: "images",
    settings: "cog",
    archive: "archive",
    substitutions: "exchange-alt",
    default: "tachometer-alt",
  };

  const _CurrentIcon =
    _IconMap[activeTab as keyof typeof _IconMap] || _IconMap.default;

  const _GetLessonStatusLabel = (): string => {
    if (PeriodInfo.IsLesson) {
      return "Koniec lekcji za:";
    } else if (PeriodInfo.PeriodNumber > 0) {
      return "Koniec przerwy za:";
    } else {
      return "Lekcje zakończone";
    }
  };

  const _GetLessonTimeColor = (): string => {
    if (PeriodInfo.IsLesson) {
      return "text-amber-400 group-hover:text-amber-300";
    } else if (PeriodInfo.PeriodNumber > 0) {
      return "text-green-400 group-hover:text-green-300";
    } else {
      return "text-gray-400 group-hover:text-gray-300";
    }
  };

  return (
    <>
      <div
        ref={HeaderRef}
        className={`fixed z-50 will-change-transform ${
          IsScrolled
            ? "top-4 right-4 left-4 md:left-[calc(18rem+1rem)] rounded-xl border border-rose-500/30 shadow-[0_0_2rem_rgba(0,0,0,0.3)]"
            : "top-0 right-0 left-0 md:left-72 rounded-none border-b border-rose-500/20"
        } backdrop-blur-xl bg-gradient-to-br from-black/40 via-rose-950/10 to-rose-900/20`}
        style={{ transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-noise-pattern opacity-[0.03]"></div>

          <div
            className={`relative flex justify-between items-center ${
              IsScrolled ? "py-3" : "py-5"
            }`}
            style={{ transition: "padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex items-center pb-[2px] pl-2 md:pl-0">
              <div className="ml-6 hidden lg:block">
                <div
                  className={`rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center ${
                    IsScrolled ? "w-11 h-11" : "w-14 h-14"
                  } shadow-[0_0_1rem_rgba(244,63,94,0.4)] border border-rose-400/40 group overflow-hidden relative`}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/0 to-white/10 opacity-40"></div>
                  <div className="absolute inset-[5%] rounded-lg bg-rose-600/30"></div>
                  <i
                    className={`fas fa-${_CurrentIcon} text-white will-change-transform ${
                      IsScrolled ? "text-base" : "text-lg"
                    } group-hover:scale-110 transform drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]`}
                    style={{
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  ></i>
                </div>
              </div>

              <div className="md:ml-5 ml-4">
                <div className="flex flex-col">
                  <h1
                    className={`font-bold tracking-tight ${
                      IsScrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"
                    } text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}
                    style={{
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {_GetTitle()}
                  </h1>
                  <div
                    className={`will-change-transform ${
                      IsScrolled
                        ? "opacity-0 h-0 overflow-hidden"
                        : "opacity-100"
                    }`}
                    style={{
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div className="text-xs text-rose-200/70 font-medium tracking-wide flex items-center mt-1.5">
                      <i className="fas fa-clock text-rose-300/80 mr-1.5"></i>
                      <span className="inline-flex items-center gap-1 md:gap-2">
                        <span className="backdrop-blur-sm bg-rose-500/5 px-1.5 md:px-2 py-0.5 rounded-md border border-rose-300/10">
                          {TimeString}
                        </span>
                        <span className="text-rose-300/50 flex items-center justify-center">
                          •
                        </span>
                        <span className="backdrop-blur-sm bg-rose-500/5 px-1.5 md:px-2 py-0.5 rounded-md border border-rose-300/10 truncate max-w-[120px] md:max-w-none">
                          {DateString}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center mx-auto pb-[2px]">
              {!IsScrolled && (
                <div className="flex items-center space-x-3 md:space-x-4 xl:space-x-8">
                  <div className="hidden xl:flex items-center bg-rose-500/10 hover:bg-rose-500/15 rounded-xl px-5 py-2.5 border border-rose-500/20 hover:border-rose-500/30 transition-all group select-none">
                    <i className="fas fa-temperature-high text-white/80 group-hover:text-white mr-3"></i>
                    <div className="flex flex-col">
                      <span className="text-white/90 text-sm font-medium group-hover:text-white">
                        {WeatherData.temp}
                      </span>
                      <span className="text-rose-200/50 text-xs group-hover:text-rose-200/70">
                        {WeatherData.condition}
                      </span>
                    </div>
                  </div>

                  <div className="relative flex md:block hidden max-[820px]:hidden items-center bg-rose-500/10 hover:bg-rose-500/15 rounded-xl border border-rose-500/20 hover:border-rose-500/30 transition-all group select-none overflow-hidden">
                    {SpotifyTrack.isPlaying && (
                      <div
                        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-green-500 to-green-400"
                        style={{
                          width: `${_GetProgressPercent()}%`,
                          boxShadow: "0 0 10px rgba(74, 222, 128, 0.4)",
                          transition: "width 1s linear",
                        }}
                      ></div>
                    )}
                    <div className="flex items-center px-3 md:px-5 py-2.5">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2 md:mr-3">
                        <i
                          className={`fab fa-spotify text-green-500 ${SpotifyTrack.isPlaying ? "animate-pulse" : ""}`}
                        ></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white/90 text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-[140px] group-hover:text-white">
                          {SpotifyTrack.title}
                        </span>
                        <span className="text-rose-200/50 text-xs truncate max-w-[100px] md:max-w-[140px] group-hover:text-rose-200/70 flex items-center gap-1.5">
                          {SpotifyTrack.isPlaying && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                          )}
                          {SpotifyTrack.artist}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-[1201px]:flex hidden max-[1200px]:hidden max-[768px]:flex items-center bg-rose-500/10 hover:bg-rose-500/15 rounded-xl px-3 md:px-5 py-2.5 border border-rose-500/20 hover:border-rose-500/30 transition-all group select-none">
                    <i className="fas fa-hourglass-half text-white/80 group-hover:text-white mr-2 md:mr-3"></i>
                    <div className="flex flex-col">
                      <span className="text-white/90 text-xs md:text-sm font-medium group-hover:text-white truncate max-w-[100px] md:max-w-none">
                        {_GetLessonStatusLabel()}
                      </span>
                      <span className={`${_GetLessonTimeColor()} text-xs`}>
                        {PeriodInfo.PeriodNumber === 0
                          ? "Na dziś"
                          : PeriodInfo.RemainingTime}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center pr-6 pb-[2px]">
              <div className="relative mr-4">
                <button
                  onClick={toggleMobileMenu}
                  className={`md:hidden relative group flex items-center justify-center will-change-transform ${
                    IsScrolled ? "h-10 w-10" : "h-12 w-12"
                  } rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/10 to-rose-500/20 border border-rose-500/30 text-gray-300 hover:text-white hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_0.4rem_rgba(244,63,94,0.1)] overflow-hidden`}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  aria-label="Toggle mobile menu"
                  title="Toggle mobile menu"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isMobileMenuOpen ? (
                    <i className="fas fa-times transform group-hover:scale-110 transition-transform"></i>
                  ) : (
                    <i className="fas fa-bars transform group-hover:scale-110 transition-transform"></i>
                  )}
                </button>

                <button
                  className={`hidden md:flex relative group items-center justify-center will-change-transform ${
                    IsScrolled ? "h-10 w-10" : "h-12 w-12"
                  } rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/10 to-rose-500/20 border border-rose-500/30 text-gray-300 hover:text-white hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_0.4rem_rgba(244,63,94,0.1)] overflow-hidden`}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <i className="fas fa-bell transform group-hover:scale-110 transition-transform"></i>
                </button>

                {hasNotifications && (
                  <span className="absolute -top-2 -right-2 z-10 hidden md:inline-block">
                    <span className="absolute inline-flex h-5 w-5 rounded-full bg-rose-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 border border-rose-400/50 shadow-[0_0_0.7rem_rgba(244,63,94,0.7)]"></span>
                  </span>
                )}
              </div>

              <button
                className="hidden xl:flex group items-center will-change-transform rounded-xl backdrop-blur-xl bg-gradient-to-r from-rose-500/10 to-rose-500/20 border border-rose-500/30 text-gray-300 hover:text-white hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_0.4rem_rgba(244,63,94,0.1)] overflow-hidden relative"
                style={{
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  padding: IsScrolled ? "0.625rem 1rem" : "0.75rem 1.25rem",
                }}
                aria-label="Logout"
                title="Logout"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  <span className="text-sm font-medium tracking-wider">
                    Wyloguj
                  </span>
                </div>
              </button>

              <button
                className="hidden md:flex xl:hidden relative group items-center justify-center will-change-transform rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/10 to-rose-500/20 border border-rose-500/30 text-gray-300 hover:text-white hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_0.4rem_rgba(244,63,94,0.1)] overflow-hidden"
                style={{
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  height: IsScrolled ? "2.5rem" : "3rem",
                  width: IsScrolled ? "2.5rem" : "3rem",
                }}
                aria-label="Logout"
                title="Logout"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className="fas fa-sign-out-alt transform group-hover:scale-110 transition-transform"></i>
              </button>

              <button
                className="md:hidden relative group flex items-center justify-center will-change-transform rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/10 to-rose-500/20 border border-rose-500/30 text-gray-300 hover:text-white hover:bg-rose-500/30 hover:border-rose-500/50 shadow-[0_0_0.4rem_rgba(244,63,94,0.1)] overflow-hidden"
                style={{
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  height: IsScrolled ? "2.5rem" : "3rem",
                  width: IsScrolled ? "2.5rem" : "3rem",
                }}
                aria-label="Logout"
                title="Logout"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className="fas fa-sign-out-alt transform group-hover:scale-110 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`will-change-transform ${IsScrolled ? "h-24 md:h-24" : "h-16 md:h-32"} mb-4`}
        style={{ transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      ></div>

      <style jsx global>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(
              to right,
              rgba(244, 63, 94, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(244, 63, 94, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }

        .bg-noise-pattern {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
      `}</style>
    </>
  );
};

export default Header;
