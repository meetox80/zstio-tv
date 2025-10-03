"use client";

import { FC, useState, useRef, useEffect } from "react";
import { useToast } from "@/app/context/ToastContext";
import { useSession } from "next-auth/react";
import { HasPermission } from "@/lib/permissions";
import { Permission } from "@/types/permissions";
import {
  SetLessonDuration,
  GetCurrentLessonDuration,
  InitializeLessonDuration,
} from "@/lib/data/LessonTimes/LessonTimesUtil";
import { GetSpotifyAuthUrl } from "@/lib/spotify.client";

type SettingsProps = {
  username: string | null | undefined;
  defaultLessonTime?: number;
};

const Settings: FC<SettingsProps> = ({ username, defaultLessonTime = 45 }) => {
  const [IsOpen, SetIsOpen] = useState(false);
  const [SelectedService, SetSelectedService] = useState("Spotify");
  const [IsLoading, SetIsLoading] = useState(false);
  const [IsSaving, SetIsSaving] = useState(false);
  const [LessonTime, SetLessonTime] = useState(defaultLessonTime);
  const [_WidgetText, SetWidgetText] = useState("");
  const [_IsWidgetTextSaving, SetIsWidgetTextSaving] = useState(false);
  const [IsDragging, SetIsDragging] = useState(false);
  const StartXRef = useRef(0);
  const SwitchRef = useRef<HTMLDivElement>(null);
  const BroadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const { data: _Session } = useSession();
  const { ShowToast } = useToast();

  const _Services = ["Spotify"];

  const UserPermissions = _Session?.user?.permissions || 0;
  const CanAuthorizeSpotify = HasPermission(
    UserPermissions,
    Permission.SPOTIFY_AUTH,
  );
  const CanEditClassTimes = HasPermission(
    UserPermissions,
    Permission.CLASS_TIMES_EDIT,
  );
  const CanViewClassTimes = HasPermission(
    UserPermissions,
    Permission.CLASS_TIMES_VIEW,
  );

  const CanEditSpotifySettings =
    CanAuthorizeSpotify ||
    HasPermission(UserPermissions, Permission.ADMINISTRATOR);
  const CanEditLessonTimes =
    CanEditClassTimes ||
    HasPermission(UserPermissions, Permission.ADMINISTRATOR);

  const CanEditWidgetText = HasPermission(
    UserPermissions,
    Permission.ADMINISTRATOR,
  );

  useEffect(() => {
    InitializeLessonDuration(defaultLessonTime);

    if (typeof window !== "undefined") {
      BroadcastChannelRef.current = new BroadcastChannel(
        "settings_update_channel",
      );
    }

    const FetchWidgetText = async () => {
      try {
        const Response = await fetch("/api/widgets/text", {
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const Data = await Response.json();

        if (Data.widget_text) {
          SetWidgetText(Data.widget_text);
        }
      } catch (Error) {}
    };

    FetchWidgetText();

    return () => {
      BroadcastChannelRef.current?.close();
    };
  }, [defaultLessonTime]);

  const ToggleDropdown = () => {
    SetIsOpen(!IsOpen);
  };

  const SelectService = (Service: string) => {
    SetSelectedService(Service);
    SetIsOpen(false);
  };

  const AuthorizeSpotify = async () => {
    SetIsLoading(true);
    try {
      const AuthUrl = await GetSpotifyAuthUrl();
      window.location.href = AuthUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      SetIsLoading(false);
    }
  };

  const ToggleLessonTime = async (Time: 30 | 45) => {
    if (LessonTime === Time || !CanEditLessonTimes) return;

    SetIsSaving(true);
    try {
      await SetLessonDuration(Time);
      SetLessonTime(Time);

      BroadcastChannelRef.current?.postMessage({
        type: "SETTINGS_UPDATED",
        data: { lessonTime: Time },
      });
    } catch (Error) {
      ShowToast("Nie udało się zapisać ustawień. Spróbuj ponownie.", "error");
    } finally {
      SetIsSaving(false);
    }
  };

  const HandleMouseDown = (e: React.MouseEvent) => {
    if (!CanEditLessonTimes) return;
    SetIsDragging(true);
    StartXRef.current = e.clientX;
  };

  const HandleMouseUp = () => {
    SetIsDragging(false);
  };

  const HandleMouseMove = (e: React.MouseEvent) => {
    if (IsDragging && CanEditLessonTimes) {
      const NewTime = e.clientX < StartXRef.current ? 45 : 30;
      ToggleLessonTime(NewTime);
      SetIsDragging(false);
    }
  };

  const SaveWidgetText = async () => {
    if (!CanEditWidgetText || _IsWidgetTextSaving) return;

    SetIsWidgetTextSaving(true);
    try {
      const Response = await fetch("/api/widgets/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          widget_text: _WidgetText,
        }),
      });

      const Data = await Response.json();

      if (Response.ok) {
        ShowToast("Tekst widgetu został zaktualizowany", "success");
      } else {
        ShowToast(
          `Błąd: ${Data.error || "Nie udało się zapisać tekstu widgetu"}`,
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Błąd połączenia. Spróbuj ponownie.", "error");
    } finally {
      SetIsWidgetTextSaving(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", HandleMouseUp);
    return () => {
      document.removeEventListener("mouseup", HandleMouseUp);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(CanAuthorizeSpotify || CanViewClassTimes) && (
        <div className="p-4 md:p-6 rounded-xl backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl relative">
          {!CanEditSpotifySettings && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30 rounded-xl z-20 flex items-center justify-center pointer-events-auto">
              <i className="fas fa-lock text-white/30 text-lg"></i>
            </div>
          )}

          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center relative z-10">
            <svg
              className="w-5 h-5 mr-2 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Połącz Usługi
          </h3>

          <div className="space-y-6 relative z-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Wybierz Player:
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto">
                <div
                  className={`relative cursor-pointer w-full sm:w-48 ${!CanEditSpotifySettings ? "pointer-events-none" : ""}`}
                  onClick={ToggleDropdown}
                >
                  <div className="flex items-center justify-between p-2.5 bg-white/5 border border-rose-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-10 transition duration-200 hover:bg-white/10">
                    <div className="flex items-center">
                      {SelectedService === "Spotify" && (
                        <div className="w-4 h-4 mr-2 text-green-500">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                          </svg>
                        </div>
                      )}
                      <span className="truncate">{SelectedService}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-300 ${IsOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <div
                    className={`absolute z-10 w-full mt-1 bg-black/80 backdrop-blur-md border border-rose-500/20 rounded-lg shadow-xl transition-all duration-300 origin-top ${
                      IsOpen
                        ? "opacity-100 scale-y-100 translate-y-0"
                        : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <ul className="overflow-hidden rounded-lg select-none">
                      {_Services.map((Service) => (
                        <li
                          key={Service}
                          className={`px-3 py-1.5 cursor-pointer transition-all duration-200 ${
                            SelectedService === Service
                              ? "bg-rose-500/30 text-white"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                          onClick={() => SelectService(Service)}
                        >
                          <div className="flex items-center">
                            {Service === "Spotify" && (
                              <div className="w-4 h-4 mr-2 text-green-500">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                </svg>
                              </div>
                            )}
                            <span>{Service}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className={`relative inline-flex items-center justify-center font-semibold overflow-hidden rounded-lg h-10 group w-full sm:w-auto mt-3 sm:mt-0 sm:ml-3 ${!CanEditSpotifySettings ? "pointer-events-none" : ""}`}
                  aria-label="Autoryzuj"
                  title="Autoryzuj"
                  onClick={AuthorizeSpotify}
                  disabled={IsLoading || !CanEditSpotifySettings}
                >
                  <div className="absolute inset-0 bg-rose-600 rounded-lg opacity-90"></div>
                  <div className="relative z-10 flex items-center justify-center px-5 py-0 h-full text-white rounded-lg transition-all duration-300 group-hover:bg-rose-700">
                    {!IsLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-1.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        <span>Autoryzuj</span>
                      </>
                    ) : (
                      <span>Łączenie...</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {CanEditWidgetText && (
        <div className="p-4 md:p-6 rounded-xl backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Tekst Widgetu
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-300 whitespace-normal sm:whitespace-nowrap">
                Tekst TV:
              </label>
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  value={_WidgetText}
                  onChange={(e) => {
                    const _Value = e.target.value.slice(0, 112);
                    SetWidgetText(_Value);
                  }}
                  maxLength={112}
                  className="w-full bg-black/30 border border-rose-500/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition duration-200"
                  placeholder="Wprowadź tekst (max 112 znaków)"
                  disabled={_IsWidgetTextSaving}
                />
                <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
                  {_WidgetText.length}/112
                </div>
              </div>
              <button
                className={`relative inline-flex items-center justify-center font-semibold overflow-hidden rounded-lg h-10 px-4 group w-full sm:w-auto ${_IsWidgetTextSaving ? "pointer-events-none" : ""}`}
                onClick={SaveWidgetText}
                disabled={_IsWidgetTextSaving}
              >
                <div className="absolute inset-0 bg-rose-600 rounded-lg opacity-90"></div>
                <div className="relative z-10 flex items-center justify-center h-full text-white rounded-lg transition-all duration-300 group-hover:bg-rose-700">
                  {!_IsWidgetTextSaving ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Zapisz</span>
                    </>
                  ) : (
                    <span>Zapisywanie...</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {CanViewClassTimes && (
        <div className="p-4 md:p-6 rounded-xl backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-rose-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Czasy Lekcyjne
          </h3>

          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Wybierz długość:
              </label>

              <div className="flex items-center w-full sm:w-auto">
                <div
                  ref={SwitchRef}
                  className={`relative flex bg-white/5 border border-rose-500/20 rounded-lg overflow-hidden w-full sm:w-28 cursor-pointer select-none transition-opacity duration-300 ${
                    IsSaving
                      ? "opacity-50 pointer-events-none"
                      : !CanEditLessonTimes
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100"
                  }`}
                  onMouseDown={HandleMouseDown}
                  onMouseMove={HandleMouseMove}
                >
                  <div
                    className={`absolute h-full w-1/2 bg-rose-600 rounded-lg opacity-90 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      LessonTime === 45 ? "translate-x-0" : "translate-x-full"
                    }`}
                  />
                  <div
                    className={`flex-1 text-center py-1.5 z-10 transition-colors duration-300 ${
                      LessonTime === 45 ? "text-white" : "text-gray-300"
                    }`}
                    onClick={() => CanEditLessonTimes && ToggleLessonTime(45)}
                  >
                    45'
                  </div>
                  <div
                    className={`flex-1 text-center py-1.5 z-10 transition-colors duration-300 ${
                      LessonTime === 30 ? "text-white" : "text-gray-300"
                    }`}
                    onClick={() => CanEditLessonTimes && ToggleLessonTime(30)}
                  >
                    30'
                  </div>
                </div>
              </div>
            </div>

            {!CanEditLessonTimes && CanViewClassTimes && (
              <div className="text-sm text-amber-300 mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Masz uprawnienia tylko do podglądu czasów lekcyjnych
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
