'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export default function LoginPage() {
  const [Email, setEmail] = useState('')
  const [Password, setPassword] = useState('')
  const [Error, setError] = useState('')
  const [Version, SetVersion] = useState('...')
  const [IsLoaded, SetIsLoaded] = useState(false)
  const _Router = useRouter()
  const ShouldReduceMotion = useReducedMotion()

  useEffect(() => {
    SetIsLoaded(true)
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
  }, [])

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

  const ContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.6
      }
    }
  }

  const SlideInVariants = {
    hidden: { opacity: 0, y: ShouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    }
  }

  const FormItemVariants = {
    hidden: { opacity: 0, y: ShouldReduceMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400
      }
    }
  }

  const OrbitVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { 
          duration: 2.5, 
          ease: "circOut" 
        },
        opacity: { 
          duration: 1.5 
        } 
      }
    }
  }

  const BackgroundGlowVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  }

  return (
    <section className="bg-gray-900 h-screen w-screen overflow-hidden">
      <div className="flex flex-wrap h-full">
        <motion.div 
          className="w-full lg:w-1/2 relative px-5 flex items-center bg-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              initial={BackgroundGlowVariants.initial}
              animate={IsLoaded ? BackgroundGlowVariants.animate : BackgroundGlowVariants.initial}
              className="absolute w-[600px] h-[600px] -bottom-72 -left-72 rounded-full bg-red-900/10 blur-[120px]"
            ></motion.div>
            <motion.div 
              initial={BackgroundGlowVariants.initial}
              animate={IsLoaded ? BackgroundGlowVariants.animate : BackgroundGlowVariants.initial}
              transition={{ 
                ...BackgroundGlowVariants.animate.transition,
                delay: 0.2
              }}
              className="absolute w-[500px] h-[500px] -top-64 -right-64 rounded-full bg-red-800/5 blur-[100px]"
            ></motion.div>
            
            <motion.svg
              viewBox="0 0 300 300"
              className="absolute -left-[20%] -bottom-[20%] w-[140%] h-[140%] opacity-10 z-0"
              initial="initial"
              animate="animate"
            >
              <motion.ellipse
                cx="150"
                cy="150"
                rx="100"
                ry="70"
                stroke="rgba(185, 28, 28, 0.5)"
                strokeWidth="0.5"
                fill="none"
                variants={OrbitVariants}
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
                variants={OrbitVariants}
                transition={{ 
                  pathLength: { duration: 3, ease: "circOut" },
                  opacity: { duration: 1.5, delay: 0.5 } 
                }}
                transform="rotate(15 150 150)"
              />
            </motion.svg>
            
            <span className="absolute w-[1px] h-32 bg-gradient-to-b from-red-800/30 to-transparent top-0 left-[33%] animate-[glow_4s_ease-in-out_infinite]"></span>
            <span className="absolute w-[1px] h-24 bg-gradient-to-b from-red-800/20 to-transparent top-0 left-[66%] animate-[glow_6s_ease-in-out_infinite_1.5s]"></span>
          </div>
          
          <div className="w-full pt-12 pb-12 md:pt-24 lg:pt-0 md:pb-24 xl:pb-0 md:px-8 z-10">
            <motion.div 
              className="max-w-sm mx-auto"
              variants={ContainerVariants}
              initial="hidden"
              animate={IsLoaded ? "visible" : "hidden"}
            >
              <motion.div 
                variants={SlideInVariants}
                className="mb-10"
              >
                <motion.h3 
                  className="font-heading text-5xl font-bold text-white mb-4 tracking-wide"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.7,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  Zaloguj się
                </motion.h3>
                <motion.p 
                  className="text-gray-500 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  Zaloguj się do panelu administracyjnego zstio-tv
                </motion.p>
              </motion.div>
              
              <AnimatePresence>
                {Error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="mb-6 -mt-3 px-4 py-3 border border-red-500 bg-red-900/20 rounded-lg overflow-hidden"
                  >
                    <p className="text-red-400 text-sm text-center font-medium">{Error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={HandleLogin} className="space-y-8">
                <motion.div variants={FormItemVariants}>
                  <motion.label 
                    className="block mb-2 text-sm font-medium text-gray-300" 
                    htmlFor="email"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  >
                    Użytkownik
                  </motion.label>
                  <motion.div 
                    className="group relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
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
                    <motion.div 
                      className="absolute -inset-0.5 rounded-lg bg-red-900/0 group-hover:bg-red-900/5 opacity-0 group-hover:opacity-100 blur-sm -z-10"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 rgba(185, 28, 28, 0)",
                          "0 0 10px rgba(185, 28, 28, 0.3)",
                          "0 0 0 rgba(185, 28, 28, 0)"
                        ] 
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    ></motion.div>
                  </motion.div>
                </motion.div>
                
                <motion.div variants={FormItemVariants}>
                  <motion.label 
                    className="block mb-2 text-sm font-medium text-gray-300" 
                    htmlFor="password"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  >
                    Hasło
                  </motion.label>
                  <motion.div 
                    className="group relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
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
                    <motion.div 
                      className="absolute -inset-0.5 rounded-lg bg-red-900/0 group-hover:bg-red-900/5 opacity-0 group-hover:opacity-100 blur-sm -z-10"
                      animate={{ 
                        boxShadow: [
                          "0 0 0 rgba(185, 28, 28, 0)",
                          "0 0 10px rgba(185, 28, 28, 0.3)",
                          "0 0 0 rgba(185, 28, 28, 0)"
                        ] 
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "mirror"
                      }}
                    ></motion.div>
                  </motion.div>
                </motion.div>
                
                <motion.button 
                  variants={FormItemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 15px rgba(185, 28, 28, 0.5)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full h-12 flex items-center justify-center px-4 font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-all duration-300 overflow-hidden group"
                  type="submit"
                >
                  <motion.span 
                    className="relative z-10"
                    animate={{ 
                      textShadow: [
                        "0 0 0px rgba(255,255,255,0.5)",
                        "0 0 5px rgba(255,255,255,0.5)",
                        "0 0 0px rgba(255,255,255,0.5)"
                      ] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    Zaloguj się
                  </motion.span>
                  <motion.div 
                    className="absolute inset-0 w-full h-full"
                    whileHover={{ 
                      background: [
                        "linear-gradient(90deg, rgba(185,28,28,0) 0%, rgba(185,28,28,0.3) 50%, rgba(185,28,28,0) 100%)",
                        "linear-gradient(90deg, rgba(185,28,28,0) 100%, rgba(185,28,28,0.3) 50%, rgba(185,28,28,0) 0%)"
                      ]
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-red-900/0 group-hover:bg-red-900/30 transition-colors duration-300"></div>
                  </motion.div>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full lg:w-1/2 bg-radial-dark-red h-full"
        >
          <div className="relative flex flex-col max-w-md mx-auto lg:max-w-none h-full pt-8 pb-12 px-10 overflow-hidden">
            <motion.div 
              className="relative z-10 flex items-center justify-end"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <motion.a 
                whileHover={{ scale: 1.05, color: '#ef4444' }}
                className="inline-flex items-center leading-loose text-white text-sm font-semibold" 
                href="https://github.com/meetox80/zstio-tv"
              >
                <motion.span 
                  className="mr-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  {Version}
                </motion.span>
                <motion.i 
                  className="fab fa-github text-xl"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
                ></motion.i>
              </motion.a>
            </motion.div>
            
            <div className="relative z-10 my-auto py-24">
              <motion.img 
                initial={{ opacity: 0, scale: 0.7, filter: 'blur(10px)' }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  filter: 'blur(0px)',
                  transition: {
                    opacity: { duration: 0.8, delay: 0.6 },
                    scale: { 
                      duration: 1.2, 
                      delay: 0.6,
                      type: "spring",
                      bounce: 0.25
                    },
                    filter: { duration: 1, delay: 0.6 }
                  }
                }}
                className="block mx-auto w-72" 
                src="/zstio-512-alt.png" 
                alt=""
                data-aos="zoom-in"
                data-aos-delay="300"
              />
            </div>
            
            <motion.img 
              className="absolute top-0 left-0 w-full xl:-mt-52" 
              src="/ui/line-dark-1.png" 
              alt=""
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.8,
                ease: [0.23, 1, 0.32, 1]
              }}
            />
            
            <motion.img 
              className="absolute bottom-0 left-0 w-full" 
              src="/ui/line-dark-2.png" 
              alt=""
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.9,
                ease: [0.23, 1, 0.32, 1] 
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}