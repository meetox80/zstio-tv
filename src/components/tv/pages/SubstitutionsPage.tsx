'use client'

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export default function SubstitutionsPage() {
  const [_CurrentDate, SetCurrentDate] = useState(new Date())
  const _ContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const _Timer = setInterval(() => {
      SetCurrentDate(new Date())
    }, 1000)
    
    return () => {
      clearInterval(_Timer)
    }
  }, [])

  const _FormattedDate = _CurrentDate.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const _FormattedTime = _CurrentDate.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div ref={_ContainerRef} className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden mt-12">
      <div className="absolute inset-0"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl">
        <motion.div 
          className="relative p-12 rounded-3xl border border-[#2F2F2F] overflow-hidden mb-12 w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="relative z-10">
            <motion.div
              className="flex items-center justify-center mb-8"
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-gradient-to-r from-red-600 to-rose-500 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    "0 0 0px rgba(255,70,70,0)",
                    "0 0 20px rgba(255,70,70,0.5)",
                    "0 0 0px rgba(255,70,70,0)"
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-bold text-white text-center tracking-tight"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,70,70,0)",
                    "0 0 8px rgba(255,70,70,0.3)",
                    "0 0 0px rgba(255,70,70,0)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Brak informacji o zastępstwach
              </motion.span>
            </motion.h1>
          </div>
        </motion.div>
        
        <motion.div
          className="flex items-center gap-4 py-3 px-6 rounded-full backdrop-blur-md border border-[#2F2F2F]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div 
            className="w-3 h-3 rounded-full bg-red-400"
            animate={{ 
              opacity: [0.7, 0.9, 0.7],
              boxShadow: [
                "0 0 0px rgba(255,70,70,0)",
                "0 0 5px rgba(255,70,70,0.4)",
                "0 0 0px rgba(255,70,70,0)"
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.p 
            className="text-white/80 font-medium"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            System monitoruje aktualizacje
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
} 