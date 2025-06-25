"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardStats from "./components/pages/DashboardStats";
import Settings from "./components/pages/Settings";
import Slajdy from "./components/pages/Slajdy";
import SongRequests from "./components/pages/SongRequests";
import UsersTab from "./components/UsersTab";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Background from "./components/Background";
import { GetStatisticsHistory } from "@/lib/statistics.client";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";
import { useToast } from "../context/ToastContext";
import AdminPasswordModal from "./components/modals/AdminPasswordModal";

export default function DashboardPage() {
  const { data: _Session, status } = useSession();
  const _Router = useRouter();
  const [_ActiveTab, setActiveTab] = useState("dashboard");
  const [_HasNotifications, setHasNotifications] = useState(true);
  const [_IsMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [_GlobalSettings, setGlobalSettings] = useState({
    lessonTime: 45,
  });
  const [_ShowAdminPasswordModal, setShowAdminPasswordModal] = useState(false);

  const { ShowToast } = useToast();

  const [_SpotifyData, setSpotifyData] = useState({
    playCountData: {
      labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      values: [0, 0, 0, 0, 0],
    },
    integrationStatus: "connected" as const,
  });

  const [_ApiData, setApiData] = useState({
    substitutionsStatus: "operational" as const,
  });

  const [_SongRequestData, setSongRequestData] = useState({
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    values: [0, 0, 0, 0, 0],
  });

  const UserPermissions = _Session?.user?.permissions || 0;

  const CanAccessDashboard = HasPermission(UserPermissions, 1 << 0);
  const CanViewSlides = HasPermission(UserPermissions, 1 << 1);
  const CanViewSongRequests = HasPermission(UserPermissions, 1 << 3);
  const CanViewUsers = HasPermission(UserPermissions, 1 << 7);
  const CanViewSettings = HasPermission(UserPermissions, 1 << 9);
  const CanViewClassTimes = HasPermission(UserPermissions, 1 << 5);

  const CanAccessSettings = CanViewSettings || CanViewClassTimes;
  
  useEffect(() => {
    if (status === "unauthenticated") {
      _Router.push("/login");
    }
  }, [status, _Router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      _Router.push("/login");
    }
  }, [status, _Router]);

  useEffect(() => {
    const CheckAdminDefaultPassword = async () => {
      if (_Session?.user?.name === "admin") {
        try {
          const Response = await fetch("/api/users/admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              checkPassword: true,
              password: "admin",
            }),
          });
          
          const Data = await Response.json();
          if (Response.ok && Data.isMatch) {
            setShowAdminPasswordModal(true);
          }
        } catch (Error) {
          console.error("Error checking admin password:", Error);
        }
      }
    };

    if (status === "authenticated" && _Session?.user?.name === "admin") {
      CheckAdminDefaultPassword();
    }
  }, [_Session, status]);

  useEffect(() => {
    const FetchGlobalSettings = async () => {
      try {
        const Response = await fetch("/api/settings");
        if (Response.ok) {
          const Data = await Response.json();
          setGlobalSettings(Data);
        }
      } catch (Error) {
        console.error("Failed to fetch global settings:", Error);
      }
    };

    if (status === "authenticated") {
      FetchGlobalSettings();
    }
  }, [status]);

  useEffect(() => {
    const FetchStatisticsData = async () => {
      try {
        const Stats = await GetStatisticsHistory();

        if (Stats && Stats.labels) {
          setSpotifyData((prevData) => ({
            ...prevData,
            playCountData: {
              labels: Stats.labels,
              values: Stats.spotifyPlays,
            },
          }));

          setSongRequestData({
            labels: Stats.labels,
            values: Stats.songRequests,
          });
        }
      } catch (Error) {
        console.error("Failed to fetch statistics data:", Error);
      }
    };

    if (status === "authenticated" && CanAccessDashboard) {
      FetchStatisticsData();

      const _StatsRefreshInterval = setInterval(
        FetchStatisticsData,
        5 * 60 * 1000,
      );

      return () => {
        clearInterval(_StatsRefreshInterval);
      };
    }
  }, [status, CanAccessDashboard]);

  useEffect(() => {
    if (!_Session?.user) return;

    if (
      (_ActiveTab === "dashboard" && !CanAccessDashboard) ||
      (_ActiveTab === "slajdy" && !CanViewSlides) ||
      (_ActiveTab === "songrequests" && !CanViewSongRequests) ||
      (_ActiveTab === "users" && !CanViewUsers) ||
      (_ActiveTab === "settings" && !CanAccessSettings)
    ) {
      if (CanAccessDashboard) setActiveTab("dashboard");
      else if (CanViewSlides) setActiveTab("slajdy");
      else if (CanViewSongRequests) setActiveTab("songrequests");
      else if (CanViewUsers) setActiveTab("users");
      else if (CanAccessSettings) setActiveTab("settings");
    }
  }, [
    _ActiveTab,
    CanAccessDashboard,
    CanViewSlides,
    CanViewSongRequests,
    CanViewUsers,
    CanAccessSettings,
    _Session,
  ]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  const ToggleTab = (tab: string): void => {
    if (
      (tab === "dashboard" && !CanAccessDashboard) ||
      (tab === "slajdy" && !CanViewSlides) ||
      (tab === "songrequests" && !CanViewSongRequests) ||
      (tab === "users" && !CanViewUsers) ||
      (tab === "settings" && !CanAccessSettings)
    ) {
      ShowToast("Nie masz uprawnień do wyświetlenia tej sekcji", "error");

      if (CanAccessDashboard) tab = "dashboard";
      else if (CanViewSlides) tab = "slajdy";
      else if (CanViewSongRequests) tab = "songrequests";
      else if (CanViewUsers) tab = "users";
      else if (CanAccessSettings) tab = "settings";
      else return;
    }

    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const ToggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!_IsMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      <Background />

      <Sidebar
        activeTab={_ActiveTab}
        isMobileMenuOpen={_IsMobileMenuOpen}
        toggleMobileMenu={ToggleMobileMenu}
        toggleTab={ToggleTab}
        session={_Session}
      />

      <div className="md:ml-72 p-4 md:p-8 pt-20 -mt-10 md:pt-8 relative z-10 flex-1">
        <Header
          activeTab={_ActiveTab}
          hasNotifications={_HasNotifications}
          defaultLessonTime={_GlobalSettings.lessonTime}
        />

        {_ActiveTab === "settings" && CanAccessSettings ? (
          <Settings
            username={_Session?.user?.name}
            defaultLessonTime={_GlobalSettings.lessonTime}
          />
        ) : _ActiveTab === "slajdy" && CanViewSlides ? (
          <Slajdy />
        ) : _ActiveTab === "songrequests" && CanViewSongRequests ? (
          <SongRequests username={_Session?.user?.name} />
        ) : _ActiveTab === "users" && CanViewUsers ? (
          <UsersTab />
        ) : _ActiveTab === "dashboard" && CanAccessDashboard ? (
          <DashboardStats
            spotifyData={_SpotifyData}
            apiData={_ApiData}
            songRequestData={_SongRequestData}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-center">
            <i className="fas fa-lock text-4xl text-rose-500/50 mb-4"></i>
            <h2 className="text-xl font-bold text-white mb-2">Brak dostępu</h2>
            <p className="text-rose-100/70">
              Nie masz uprawnień do wyświetlenia tej sekcji
            </p>
          </div>
        )}
      </div>
      
      {_Session?.user?.name && (
        <AdminPasswordModal 
          IsOpen={_ShowAdminPasswordModal} 
          OnClose={() => setShowAdminPasswordModal(false)} 
          Username={_Session.user.name}
        />
      )}
    </div>
  );
}
