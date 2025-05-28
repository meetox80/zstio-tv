import { FC, useEffect, useState } from 'react'
import { Space_Grotesk } from 'next/font/google'
import Image from 'next/image'
import { motion } from 'framer-motion'

const _SpaceGrotesk = Space_Grotesk({ subsets: ["latin"] })

type SongRequestsProps = {
  username: string | null | undefined
}

type SongProposal = {
  Id: string
  Title: string
  Artist: string
  Album: string
  AlbumArt: string
  Duration: number
  Uri: string
  Upvotes?: number
  Downvotes?: number
  CreatedAt: string
  Fingerprint?: string
  UserVote?: string | null
}

const SongRequests: FC<SongRequestsProps> = ({ username }) => {
  const [PendingProposals, setPendingProposals] = useState<SongProposal[]>([])
  const [ApprovedSongs, setApprovedSongs] = useState<any[]>([])
  const [ActiveTab, setActiveTab] = useState('pending')
  const [IsLoading, setIsLoading] = useState(false)
  const [Notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null)

  const FetchPendingProposals = async () => {
    try {
      setIsLoading(true)
      const Response = await fetch('/api/songs/proposals?limit=50&pending=true')
      
      if (Response.ok) {
        const Data = await Response.json()
        setPendingProposals(Data.proposals)
      } else {
        const ErrorData = await Response.json()
        console.error('Error response from API:', ErrorData)
        ShowNotification(ErrorData.error || 'Nie udało się pobrać propozycji piosenek', 'error')
      }
    } catch (Error) {
      console.error('Error fetching proposals:', Error)
      ShowNotification('Nie udało się pobrać propozycji piosenek', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const FetchApprovedSongs = async () => {
    try {
      setIsLoading(true)
      const Response = await fetch('/api/songs/proposals?limit=50&pending=false')
      
      if (Response.ok) {
        const Data = await Response.json()
        setApprovedSongs(Data.proposals)
      } else {
        const ErrorData = await Response.json()
        console.error('Error response from API:', ErrorData)
        ShowNotification(ErrorData.error || 'Nie udało się pobrać zatwierdzonych piosenek', 'error')
      }
    } catch (Error) {
      console.error('Error fetching approved songs:', Error)
      ShowNotification('Nie udało się pobrać zatwierdzonych piosenek', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const HandleApprove = async (SongId: string) => {
    try {
      const Response = await fetch('/api/songs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SongId }),
      })
      
      const Data = await Response.json()
      
      if (Response.ok) {
        ShowNotification('Piosenka została zatwierdzona pomyślnie', 'success')
        FetchPendingProposals()
        FetchApprovedSongs()
      } else {
        console.error('Error response from API:', Data)
        ShowNotification(Data.error || 'Nie udało się zatwierdzić piosenki', 'error')
      }
    } catch (Error: any) {
      console.error('Error approving song:', Error)
      ShowNotification(`Wystąpił błąd: ${Error.message || 'Unknown error'}`, 'error')
    }
  }

  const HandleReject = async (SongId: string) => {
    try {
      const Response = await fetch('/api/songs/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SongId }),
      })
      
      if (Response.ok) {
        ShowNotification('Piosenka została odrzucona', 'success')
        FetchPendingProposals()
      } else {
        const Data = await Response.json()
        ShowNotification(Data.error || 'Nie udało się odrzucić piosenki', 'error')
      }
    } catch (Error) {
      console.error('Error rejecting song:', Error)
      ShowNotification('Wystąpił błąd podczas odrzucania piosenki', 'error')
    }
  }

  const ShowNotification = (Message: string, Type: 'success' | 'error') => {
    setNotification({ message: Message, type: Type })
    setTimeout(() => setNotification(null), 4000)
  }

  const FormatDuration = (Ms: number) => {
    const Minutes = Math.floor(Ms / 60000)
    const Seconds = Math.floor((Ms % 60000) / 1000)
    return `${Minutes}:${Seconds.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (ActiveTab === 'pending') {
      FetchPendingProposals()
    } else {
      FetchApprovedSongs()
    }
  }, [ActiveTab])

  return (
    <div className="relative max-w-7xl mx-auto">
      {Notification && (
        <div className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-y-0 opacity-100 ${
          Notification.type === 'success' 
            ? 'bg-green-500/80 backdrop-blur-sm border border-green-400' 
            : 'bg-red-500/80 backdrop-blur-sm border border-red-400'
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
            <div className="text-white text-sm">{Notification.message}</div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-white hover:text-white/80"
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
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 relative mr-4 rounded-full transition-all duration-300 ${ActiveTab === 'pending' 
            ? 'text-white font-medium bg-rose-500/20 backdrop-blur-sm border border-rose-500/30' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
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
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 relative rounded-full transition-all duration-300 ${ActiveTab === 'approved' 
            ? 'text-white font-medium bg-rose-500/20 backdrop-blur-sm border border-rose-500/30' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
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
              <div className="w-3 h-3 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : ActiveTab === 'pending' ? (
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
                          <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">{Proposal.Title}</h3>
                      <p className="text-gray-400">{Proposal.Artist}</p>
                      <div className="flex mt-1 items-center">
                        <span className="text-xs text-gray-500 mr-4">{FormatDuration(Proposal.Duration)}</span>
                        <span className="text-xs text-gray-500">
                          Oczekuje od: {new Date(Proposal.CreatedAt).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => HandleApprove(Proposal.Id)}
                      className="bg-gradient-to-r from-green-600/80 to-green-500/80 hover:from-green-500/90 hover:to-green-400/90 text-white py-2 px-4 rounded-full border border-green-500/30 backdrop-blur-sm shadow-lg shadow-green-900/20 transition-all duration-300 flex items-center"
                    >
                      <i className="fas fa-check mr-2"></i>
                      Zatwierdź
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => HandleReject(Proposal.Id)}
                      className="bg-gradient-to-r from-rose-600/80 to-rose-500/80 hover:from-rose-500/90 hover:to-rose-400/90 text-white py-2 px-4 rounded-full border border-rose-500/30 backdrop-blur-sm shadow-lg shadow-rose-900/20 transition-all duration-300 flex items-center"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Odrzuć
                    </motion.button>
                  </div>
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
                          <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">{Song.Title}</h3>
                      <p className="text-gray-400">{Song.Artist}</p>
                      <div className="flex mt-1 items-center">
                        <span className="text-xs text-gray-500 mr-4">{FormatDuration(Song.Duration)}</span>
                        <span className="text-xs text-gray-500">
                          Zatwierdzona: {new Date(Song.CreatedAt).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 flex items-center shadow-lg"
                  >
                    <i className="fas fa-check text-green-400 mr-2"></i>
                    <span className="text-sm text-white">Zatwierdzona</span>
                  </motion.div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SongRequests 