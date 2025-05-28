'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import DashboardStats from './components/pages/DashboardStats'
import Settings from './components/pages/Settings'
import Slajdy from './components/pages/Slajdy'
import SongRequests from './components/pages/SongRequests'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Background from './components/Background'
import { GetStatisticsHistory } from '@/lib/statistics.client'

export default function DashboardPage() {
  const { data: _Session, status } = useSession()
  const _Router = useRouter()
  const [_ActiveTab, setActiveTab] = useState('dashboard')
  const [_HasNotifications, setHasNotifications] = useState(true)
  const [_IsMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [_GlobalSettings, setGlobalSettings] = useState({
    lessonTime: 45
  })
  
  const [_SpotifyData, setSpotifyData] = useState({
    playCountData: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      values: [0, 0, 0, 0, 0]
    },
    integrationStatus: 'connected' as const
  })
  
  const [_ApiData, setApiData] = useState({
    substitutionsStatus: 'operational' as const
  })
  
  const [_SongRequestData, setSongRequestData] = useState({
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    values: [0, 0, 0, 0, 0]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      _Router.push('/login')
    }
  }, [status, _Router])
  
  useEffect(() => {
    const FetchGlobalSettings = async () => {
      try {
        const Response = await fetch('/api/settings')
        if (Response.ok) {
          const Data = await Response.json()
          setGlobalSettings(Data)
        }
      } catch (Error) {
        console.error('Failed to fetch global settings:', Error)
      }
    }
    
    FetchGlobalSettings()
  }, [])
  
  useEffect(() => {
    const FetchStatisticsData = async () => {
      try {
        const Stats = await GetStatisticsHistory()
        
        if (Stats && Stats.labels) {
          setSpotifyData(prevData => ({
            ...prevData,
            playCountData: {
              labels: Stats.labels,
              values: Stats.spotifyPlays
            }
          }))
          
          setSongRequestData({
            labels: Stats.labels,
            values: Stats.songRequests
          })
        }
      } catch (Error) {
        console.error('Failed to fetch statistics data:', Error)
      }
    }
    
    FetchStatisticsData()
    
    const _StatsRefreshInterval = setInterval(FetchStatisticsData, 5 * 60 * 1000)
    
    return () => {
      clearInterval(_StatsRefreshInterval)
    }
  }, [])

  if (status !== 'authenticated') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
  }

  const ToggleTab = (tab: string): void => {
    setActiveTab(tab)
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false)
    }
  }

  const ToggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!_IsMobileMenuOpen)
  }

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

        {_ActiveTab === 'settings' ? (
          <Settings 
            username={_Session?.user?.name}
            defaultLessonTime={_GlobalSettings.lessonTime}
          />
        ) : _ActiveTab === 'slajdy' ? (
          <Slajdy />
        ) : _ActiveTab === 'songrequests' ? (
          <SongRequests username={_Session?.user?.name} />
        ) : (
          <DashboardStats 
            spotifyData={_SpotifyData}
            apiData={_ApiData}
            songRequestData={_SongRequestData}
          />
        )}
      </div>
    </div>
  )
} 