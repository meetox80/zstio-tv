'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [Email, setEmail] = useState('')
  const [Password, setPassword] = useState('')
  const [Error, setError] = useState('')
  const [Version, SetVersion] = useState('...')
  const [ShowAnimations, SetShowAnimations] = useState(false)
  const _Router = useRouter()
  const { data: Session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && Session) {
      _Router.push('/dashboard')
      return
    }

    const FetchVersion = async () => {
      try {
        const Response = await fetch('https://api.github.com/repos/meetox80/zstio-tv/commits?per_page=1', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
          cache: 'force-cache'
        })
        
        if (!Response.ok) {
          SetVersion('unknown')
          return
        }
        
        const CommitsData = await Response.json()
        
        if (!CommitsData.length) {
          SetVersion('unknown')
          return
        }
        
        const LatestCommit = CommitsData[0]
        const ShortSha = LatestCommit.sha.substring(0, 7)
        SetVersion(ShortSha)
      } catch {
        SetVersion('unknown')
      }
    }
    
    FetchVersion()
    
    // Enable animations only after hydration is complete
    const Timer = setTimeout(() => {
      SetShowAnimations(true)
    }, 0)
    
    return () => clearTimeout(Timer)
  }, [_Router, Session, status])

  const HandleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const Result = await signIn('credentials', {
      username: Email,
      password: Password,
      redirect: false
    })

    if (Result?.error) {
      setError('Nieprawidłowe dane logowania')
    } else {
      _Router.push('/dashboard')
    }
  }

  return (
    <section className="bg-gray-900 h-screen w-screen overflow-hidden">
      <div className="flex flex-wrap h-full">
        <div className="w-full lg:w-1/2 relative px-5 flex items-center bg-gray-900" suppressHydrationWarning>
          <div className="absolute inset-0 overflow-hidden">
            {ShowAnimations && (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute w-[600px] h-[600px] -bottom-72 -left-72 rounded-full bg-red-900/10 blur-[120px]"
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute w-[500px] h-[500px] -top-64 -right-64 rounded-full bg-red-800/5 blur-[100px]"
                />
                <motion.svg
                  viewBox="0 0 300 300"
                  className="absolute -left-[20%] -bottom-[20%] w-[140%] h-[140%] opacity-10 z-0"
                >
                  <motion.ellipse
                    cx="150"
                    cy="150"
                    rx="100"
                    ry="70"
                    stroke="rgba(185, 28, 28, 0.5)"
                    strokeWidth="0.5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ pathLength: { duration: 2.5, ease: "circOut" }, opacity: { duration: 1.5 } }}
                    transform="rotate(-25 150 150)"
                  />
                  <motion.ellipse
                    cx="150"
                    cy="150"
                    rx="140"
                    ry="90"
                    stroke="rgba(185, 28, 28, 0.3)"
                    strokeWidth="0.5"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ pathLength: { duration: 3, ease: "circOut" }, opacity: { duration: 1.5, delay: 0.5 } }}
                    transform="rotate(15 150 150)"
                  />
                </motion.svg>
              </>
            )}
            
            <span className="absolute w-[1px] h-32 bg-gradient-to-b from-red-800/30 to-transparent top-0 left-[33%] animate-[glow_4s_ease-in-out_infinite]"></span>
            <span className="absolute w-[1px] h-24 bg-gradient-to-b from-red-800/20 to-transparent top-0 left-[66%] animate-[glow_6s_ease-in-out_infinite_1.5s]"></span>
          </div>
          
          <div className="w-full pt-12 pb-12 md:pt-24 lg:pt-0 md:pb-24 xl:pb-0 md:px-8 z-10" suppressHydrationWarning>
            <div className="max-w-sm mx-auto">
              <div className="mb-10">
                {ShowAnimations ? (
                  <>
                    <motion.h3 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                      className="font-heading text-5xl font-bold text-white mb-4 tracking-wide"
                    >
                      Zaloguj się
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-gray-500 mb-8"
                    >
                      Zaloguj się do panelu administracyjnego zstio-tv
                    </motion.p>
                  </>
                ) : (
                  <>
                    <h3 className="font-heading text-5xl font-bold text-white mb-4 tracking-wide">
                      Zaloguj się
                    </h3>
                    <p className="text-gray-500 mb-8">
                      Zaloguj się do panelu administracyjnego zstio-tv
                    </p>
                  </>
                )}
              </div>
              
              <AnimatePresence>
                {Error && (
                  <div className="mb-6 -mt-3 px-4 py-3 border border-red-500 bg-red-900/20 rounded-lg overflow-hidden">
                    <p className="text-red-400 text-sm text-center font-medium">{Error}</p>
                  </div>
                )}
              </AnimatePresence>
              
              <form onSubmit={HandleLogin} className="space-y-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300" htmlFor="email">
                    Użytkownik
                  </label>
                  <div className="group relative">
                    <input 
                      className="py-2 px-4 h-12 w-full text-gray-300 placeholder-gray-500 bg-gray-800/80 border border-gray-700 focus:border-red-700 outline-none rounded-lg transition-colors duration-300" 
                      type="text" 
                      id="email"
                      maxLength={32}
                      value={Email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Podaj nazwę użytkownika"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300" htmlFor="password">
                    Hasło
                  </label>
                  <div className="group relative">
                    <input 
                      className="py-2 px-4 h-12 w-full text-gray-300 placeholder-gray-500 bg-gray-800/80 border border-gray-700 focus:border-red-700 outline-none rounded-lg transition-colors duration-300" 
                      type="password" 
                      id="password"
                      maxLength={128}
                      value={Password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hasło użytkownika"
                      required
                    />
                  </div>
                </div>
                
                <button 
                  className="relative w-full h-12 flex items-center justify-center px-4 font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-all duration-300 overflow-hidden group"
                  type="submit"
                >
                  <span className="relative z-10">
                    Zaloguj się
                  </span>
                  {ShowAnimations && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-red-900/0 group-hover:bg-red-900/30 transition-colors duration-300"></div>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 bg-radial-dark-red h-full" suppressHydrationWarning>
          <div className="relative flex flex-col max-w-md mx-auto lg:max-w-none h-full pt-8 pb-12 px-10 overflow-hidden">
            <div className="relative z-10 flex items-center justify-end">
              <a className="inline-flex items-center leading-loose text-white text-sm font-semibold" href="https://github.com/meetox80/zstio-tv">
                <span className="mr-3 px-3 py-1 bg-white/5 backdrop-blur-sm rounded-md border border-white/10 font-mono text-xs tracking-wider shadow-inner shadow-red-900/10">{Version}</span>
                <i className="fab fa-github text-xl"></i>
              </a>
            </div>
            
            <div className="relative z-10 my-auto py-24">
              {ShowAnimations ? (
                <motion.img 
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 1.2, 
                    type: "spring",
                    bounce: 0.25
                  }}
                  className="block mx-auto w-72" 
                  src="/zstio-512-alt.png" 
                  alt=""
                />
              ) : (
                <img 
                  className="block mx-auto w-72" 
                  src="/zstio-512-alt.png" 
                  alt=""
                />
              )}
            </div>
            
            {ShowAnimations && (
              <>
                <motion.img 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                  className="absolute top-0 left-0 w-full xl:-mt-52" 
                  src="/ui/line-dark-1.png" 
                  alt=""
                />
                <motion.img 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="absolute bottom-0 left-0 w-full" 
                  src="/ui/line-dark-2.png" 
                  alt=""
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}