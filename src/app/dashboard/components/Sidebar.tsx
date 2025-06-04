import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";

type SidebarProps = {
  activeTab: string;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  toggleTab: (tab: string) => void;
  session: any;
};

const Sidebar: FC<SidebarProps> = ({
  activeTab,
  isMobileMenuOpen,
  toggleMobileMenu,
  toggleTab,
  session,
}) => {
  const _ActiveTab = activeTab;
  const _IsMobileMenuOpen = isMobileMenuOpen;
  const _ToggleMobileMenu = toggleMobileMenu;
  const _ToggleTab = toggleTab;
  const _Session = session;

  const UserPermissions = _Session?.user?.permissions || 0;

  const CanAccessDashboard = HasPermission(UserPermissions, 1 << 0); // DASHBOARD_ACCESS
  const CanViewSlides = HasPermission(UserPermissions, 1 << 1); // SLIDES_VIEW
  const CanViewSongRequests = HasPermission(UserPermissions, 1 << 3); // SONG_REQUESTS_VIEW
  const CanViewUsers = HasPermission(UserPermissions, 1 << 7); // USERS_VIEW
  const CanViewSettings = HasPermission(UserPermissions, 1 << 9); // SETTINGS_VIEW
  const CanViewClassTimes = HasPermission(UserPermissions, 1 << 5); // CLASS_TIMES_VIEW

  // Allow settings access if user has either SETTINGS_VIEW or CLASS_TIMES_VIEW permission
  const CanAccessSettings = CanViewSettings || CanViewClassTimes;

  const IsAdmin = HasPermission(UserPermissions, 0x7fffffff); // ADMINISTRATOR

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/40 border-b border-rose-500/30 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center">
          <Image
            src="/zstio-512-alt.png"
            alt="zstio Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="ml-2 text-xl font-bold text-white tracking-wider">
            ZSTIO-TV
          </span>
        </div>
        <button
          onClick={_ToggleMobileMenu}
          className="p-2 rounded-lg backdrop-blur-xl bg-rose-500/20 border border-rose-500/40 text-white hover:bg-rose-500/30 hover:border-rose-500/60 active:scale-95 transition-all duration-300"
          aria-label="Toggle mobile menu"
          title="Toggle mobile menu"
        >
          {_IsMobileMenuOpen ? (
            <i className="fas fa-times w-5 h-5 flex items-center justify-center"></i>
          ) : (
            <i className="fas fa-bars w-5 h-5 flex items-center justify-center"></i>
          )}
        </button>
      </div>

      <div className="hidden md:block fixed left-0 top-0 h-full w-72 backdrop-blur-xl bg-gradient-to-br from-black/50 via-rose-950/30 to-rose-900/20 border-r border-rose-500/30 z-40 shadow-[5px_0_25px_rgba(0,0,0,0.3)]">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-center items-center mb-10 pt-2">
            <Image
              src="/zstio-512-alt.png"
              alt="zstio Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>

          <nav className="space-y-4 mt-2">
            {CanAccessDashboard && (
              <Link
                href="#"
                onClick={() => _ToggleTab("dashboard")}
                className={`flex items-center px-5 py-3.5 rounded-xl border ${
                  _ActiveTab === "dashboard"
                    ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                } group transition-all duration-300`}
              >
                <div
                  className={`w-6 h-6 mr-4 flex items-center justify-center ${
                    _ActiveTab === "dashboard"
                      ? "text-rose-300"
                      : "text-gray-400 group-hover:text-rose-300"
                  } transition-colors duration-300`}
                >
                  <i className="fas fa-chart-bar"></i>
                </div>
                <span className="tracking-wide font-medium">Strona główna</span>
              </Link>
            )}

            {CanViewSlides && (
              <Link
                href="#"
                onClick={() => _ToggleTab("slajdy")}
                className={`flex items-center px-5 py-3.5 rounded-xl border ${
                  _ActiveTab === "slajdy"
                    ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                } group transition-all duration-300`}
              >
                <div
                  className={`w-6 h-6 mr-4 flex items-center justify-center ${
                    _ActiveTab === "slajdy"
                      ? "text-rose-300"
                      : "text-gray-400 group-hover:text-rose-300"
                  } transition-colors duration-300`}
                >
                  <i className="fas fa-images"></i>
                </div>
                <span className="tracking-wide font-medium">Slajdy</span>
              </Link>
            )}

            {CanViewSongRequests && (
              <Link
                href="#"
                onClick={() => _ToggleTab("songrequests")}
                className={`flex items-center px-5 py-3.5 rounded-xl border ${
                  _ActiveTab === "songrequests"
                    ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                } group transition-all duration-300`}
              >
                <div
                  className={`w-6 h-6 mr-4 flex items-center justify-center ${
                    _ActiveTab === "songrequests"
                      ? "text-rose-300"
                      : "text-gray-400 group-hover:text-rose-300"
                  } transition-colors duration-300`}
                >
                  <i className="fas fa-music"></i>
                </div>
                <span className="tracking-wide font-medium">Propozycje</span>
              </Link>
            )}

            {CanViewUsers && (
              <Link
                href="#"
                onClick={() => _ToggleTab("users")}
                className={`flex items-center px-5 py-3.5 rounded-xl border ${
                  _ActiveTab === "users"
                    ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                } group transition-all duration-300`}
              >
                <div
                  className={`w-6 h-6 mr-4 flex items-center justify-center ${
                    _ActiveTab === "users"
                      ? "text-rose-300"
                      : "text-gray-400 group-hover:text-rose-300"
                  } transition-colors duration-300`}
                >
                  <i className="fas fa-users"></i>
                </div>
                <span className="tracking-wide font-medium">Użytkownicy</span>
              </Link>
            )}

            {CanAccessSettings && (
              <Link
                href="#"
                onClick={() => _ToggleTab("settings")}
                className={`flex items-center px-5 py-3.5 rounded-xl border ${
                  _ActiveTab === "settings"
                    ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                } group transition-all duration-300`}
              >
                <div
                  className={`w-6 h-6 mr-4 flex items-center justify-center ${
                    _ActiveTab === "settings"
                      ? "text-rose-300"
                      : "text-gray-400 group-hover:text-rose-300"
                  } transition-colors duration-300`}
                >
                  <i className="fas fa-cog"></i>
                </div>
                <span className="tracking-wide font-medium">Ustawienia</span>
              </Link>
            )}
          </nav>

          {_Session?.user && (
            <div className="mt-auto border-t border-rose-500/30 pt-4">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-transparent backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-rose-500 to-rose-800 shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/50">
                    {_Session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium tracking-wide">
                      {_Session.user.name}
                    </p>
                    <p className="text-rose-200/80 text-xs font-medium mt-0.5 flex items-center">
                      <i className="fas fa-shield-alt text-rose-300 mr-1.5 text-xs"></i>
                      {IsAdmin ? "Administrator" : "Użytkownik"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {_IsMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={_ToggleMobileMenu}
          ></div>
          <div className="relative w-72 h-full bg-gradient-to-br from-black/80 via-rose-950/40 to-rose-900/30 border-r border-rose-500/30 shadow-[5px_0_25px_rgba(0,0,0,0.4)] animate-slide-in">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Image
                    src="/zstio-512-alt.png"
                    alt="zstio Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <span className="ml-2 text-xl font-bold text-white tracking-wider">
                    ZSTIO-TV
                  </span>
                </div>
                <button
                  onClick={_ToggleMobileMenu}
                  className="p-2 rounded-lg backdrop-blur-xl bg-rose-500/20 border border-rose-500/40 text-white hover:bg-rose-500/30 hover:border-rose-500/60 active:scale-95 transition-all duration-300"
                  aria-label="Close mobile menu"
                  title="Close mobile menu"
                >
                  <i className="fas fa-times w-5 h-5 flex items-center justify-center"></i>
                </button>
              </div>

              <nav className="space-y-3 mt-2">
                {CanAccessDashboard && (
                  <Link
                    href="#"
                    onClick={() => {
                      _ToggleTab("dashboard");
                      _ToggleMobileMenu();
                    }}
                    className={`flex items-center px-5 py-3.5 rounded-xl border ${
                      _ActiveTab === "dashboard"
                        ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                    } group transition-all duration-300`}
                  >
                    <div
                      className={`w-6 h-6 mr-4 flex items-center justify-center ${
                        _ActiveTab === "dashboard"
                          ? "text-rose-300"
                          : "text-gray-400 group-hover:text-rose-300"
                      } transition-colors duration-300`}
                    >
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <span className="tracking-wide font-medium">
                      Strona główna
                    </span>
                  </Link>
                )}

                {CanViewSlides && (
                  <Link
                    href="#"
                    onClick={() => {
                      _ToggleTab("slajdy");
                      _ToggleMobileMenu();
                    }}
                    className={`flex items-center px-5 py-3.5 rounded-xl border ${
                      _ActiveTab === "slajdy"
                        ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                    } group transition-all duration-300`}
                  >
                    <div
                      className={`w-6 h-6 mr-4 flex items-center justify-center ${
                        _ActiveTab === "slajdy"
                          ? "text-rose-300"
                          : "text-gray-400 group-hover:text-rose-300"
                      } transition-colors duration-300`}
                    >
                      <i className="fas fa-images"></i>
                    </div>
                    <span className="tracking-wide font-medium">Slajdy</span>
                  </Link>
                )}

                {CanViewSongRequests && (
                  <Link
                    href="#"
                    onClick={() => {
                      _ToggleTab("songrequests");
                      _ToggleMobileMenu();
                    }}
                    className={`flex items-center px-5 py-3.5 rounded-xl border ${
                      _ActiveTab === "songrequests"
                        ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                    } group transition-all duration-300`}
                  >
                    <div
                      className={`w-6 h-6 mr-4 flex items-center justify-center ${
                        _ActiveTab === "songrequests"
                          ? "text-rose-300"
                          : "text-gray-400 group-hover:text-rose-300"
                      } transition-colors duration-300`}
                    >
                      <i className="fas fa-music"></i>
                    </div>
                    <span className="tracking-wide font-medium">
                      Propozycje
                    </span>
                  </Link>
                )}

                {CanViewUsers && (
                  <Link
                    href="#"
                    onClick={() => {
                      _ToggleTab("users");
                      _ToggleMobileMenu();
                    }}
                    className={`flex items-center px-5 py-3.5 rounded-xl border ${
                      _ActiveTab === "users"
                        ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                    } group transition-all duration-300`}
                  >
                    <div
                      className={`w-6 h-6 mr-4 flex items-center justify-center ${
                        _ActiveTab === "users"
                          ? "text-rose-300"
                          : "text-gray-400 group-hover:text-rose-300"
                      } transition-colors duration-300`}
                    >
                      <i className="fas fa-users"></i>
                    </div>
                    <span className="tracking-wide font-medium">
                      Użytkownicy
                    </span>
                  </Link>
                )}

                {CanAccessSettings && (
                  <Link
                    href="#"
                    onClick={() => {
                      _ToggleTab("settings");
                      _ToggleMobileMenu();
                    }}
                    className={`flex items-center px-5 py-3.5 rounded-xl border ${
                      _ActiveTab === "settings"
                        ? "bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-white border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        : "text-gray-300 hover:text-white border-transparent hover:bg-rose-500/10 hover:border-rose-500/30"
                    } group transition-all duration-300`}
                  >
                    <div
                      className={`w-6 h-6 mr-4 flex items-center justify-center ${
                        _ActiveTab === "settings"
                          ? "text-rose-300"
                          : "text-gray-400 group-hover:text-rose-300"
                      } transition-colors duration-300`}
                    >
                      <i className="fas fa-cog"></i>
                    </div>
                    <span className="tracking-wide font-medium">
                      Ustawienia
                    </span>
                  </Link>
                )}
              </nav>

              {_Session?.user && (
                <div className="mt-auto border-t border-rose-500/30 pt-4">
                  <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-transparent backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-rose-500 to-rose-800 shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400/50">
                        {_Session.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium tracking-wide">
                          {_Session.user.name}
                        </p>
                        <p className="text-rose-200/80 text-xs font-medium mt-0.5 flex items-center">
                          <i className="fas fa-shield-alt text-rose-300 mr-1.5 text-xs"></i>
                          {IsAdmin ? "Administrator" : "Użytkownik"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
