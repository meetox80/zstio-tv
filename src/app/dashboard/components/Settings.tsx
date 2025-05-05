'use client'

import { FC, useState } from 'react'
import { GetSpotifyAuthUrl } from '@/lib/spotify.client'

type SettingsProps = {
  username: string | null | undefined
}

const Settings: FC<SettingsProps> = ({ username }) => {
  const [IsOpen, SetIsOpen] = useState(false)
  const [SelectedService, SetSelectedService] = useState('Spotify')
  const [IsLoading, SetIsLoading] = useState(false)
  
  const _Services = ['Spotify']
  
  const ToggleDropdown = () => {
    SetIsOpen(!IsOpen)
  }
  
  const SelectService = (Service: string) => {
    SetSelectedService(Service)
    SetIsOpen(false)
  }

  const AuthorizeSpotify = async () => {
    SetIsLoading(true)
    try {
      const AuthUrl = await GetSpotifyAuthUrl()
      window.location.href = AuthUrl
    } catch (error) {
      console.error('Failed to get auth URL:', error)
      SetIsLoading(false)
    }
  }
  
  return (
    <div className="p-4 md:p-6 rounded-xl backdrop-blur-xl bg-black/40 border border-rose-500/20 shadow-2xl">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Połącz Usługi
      </h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
            Wybierz Player:
          </label>
          
          <div className="flex items-center">
            <div 
              className="relative cursor-pointer w-48"
              onClick={ToggleDropdown}
            >
              <div className="flex items-center justify-between p-2.5 bg-white/5 border border-rose-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-10 transition duration-200 hover:bg-white/10">
                <div className="flex items-center">
                  {SelectedService === 'Spotify' && (
                    <div className="w-4 h-4 mr-2 text-green-500">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                  )}
                  <span className="truncate">{SelectedService}</span>
                </div>
                <svg 
                  className={`w-4 h-4 ml-2 transition-transform duration-300 ${IsOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <div className={`absolute z-10 w-full mt-1 bg-black/80 backdrop-blur-md border border-rose-500/20 rounded-lg shadow-xl transition-all duration-300 origin-top ${
                IsOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
              }`}>
                <ul className="py-1 overflow-hidden">
                  {_Services.map((Service) => (
                    <li 
                      key={Service}
                      className={`px-3 py-1.5 cursor-pointer transition-all duration-200 ${
                        SelectedService === Service 
                          ? 'bg-rose-500/30 text-white' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => SelectService(Service)}
                    >
                      <div className="flex items-center">
                        {Service === 'Spotify' && (
                          <div className="w-4 h-4 mr-2 text-green-500">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
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
              className="relative inline-flex items-center justify-center font-semibold overflow-hidden rounded-lg ml-3 h-10 group"
              aria-label="Autoryzuj"
              title="Autoryzuj"
              onClick={AuthorizeSpotify}
              disabled={IsLoading}
            >
              <div className="absolute inset-0 bg-rose-600 rounded-lg opacity-90"></div>
              <div className="relative z-10 flex items-center justify-center px-5 py-0 h-full text-white rounded-lg transition-all duration-300 group-hover:bg-rose-700">
                {!IsLoading ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
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
  )
}

export default Settings 