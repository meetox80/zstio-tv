'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import DashboardStats from './components/DashboardStats'
import Settings from './components/Settings'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Background from './components/Background'

export default function DashboardPage() {
  const { data: _Session, status } = useSession()
  const _Router = useRouter()
  const [_ActiveTab, setActiveTab] = useState('dashboard')
  const [_HasNotifications, setHasNotifications] = useState(true)
  const [_IsMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [_SpotifyData, setSpotifyData] = useState({
    playCountData: {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      values: [245, 312, 187, 432, 376]
    },
    integrationStatus: 'connected' as const
  })
  
  const [_ApiData, setApiData] = useState({
    substitutionsStatus: 'operational' as const
  })
  
  const [_SongRequestData, setSongRequestData] = useState({
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    values: [18, 23, 15, 37, 42]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      _Router.push('/login')
    }
  }, [status, _Router])

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

      <div className="md:ml-72 p-4 md:p-8 pt-20 md:pt-8 relative z-10 flex-1">
        <Header 
          activeTab={_ActiveTab}
          hasNotifications={_HasNotifications}
        />

        {_ActiveTab === 'settings' ? (
          <Settings 
            username={_Session?.user?.name}
          />
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