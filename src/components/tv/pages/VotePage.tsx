'use client'

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from 'qrcode.react'
import { motion } from "framer-motion"

type Song = {
  Id: string
  Title: string
  Artist: string
  Votes: number
}

export default function VotePage() {
  const [_Songs, SetSongs] = useState<Song[]>([
    { Id: "1", Title: "Bohemian Rhapsody", Artist: "Queen", Votes: 24 },
    { Id: "2", Title: "Stairway to Heaven", Artist: "Led Zeppelin", Votes: 18 },
    { Id: "3", Title: "Hotel California", Artist: "Eagles", Votes: 32 },
    { Id: "4", Title: "Sweet Child O' Mine", Artist: "Guns N' Roses", Votes: 15 },
    { Id: "5", Title: "Smells Like Teen Spirit", Artist: "Nirvana", Votes: 28 },
    { Id: "6", Title: "Nothing Else Matters", Artist: "Metallica", Votes: 22 },
    { Id: "7", Title: "Livin' On A Prayer", Artist: "Bon Jovi", Votes: 19 }
  ])
  const [_CurrentDate, SetCurrentDate] = useState(new Date())
  const _ContainerRef = useRef<HTMLDivElement>(null)
  
  const _QrCodeValue = "https://vote.zstio.edu.pl/music"
  const _TopSongs = _Songs.sort((A, B) => B.Votes - A.Votes)
  
  useEffect(() => {
    const _Timer = setInterval(() => {
      SetCurrentDate(new Date())
    }, 1000)
    
    return () => {
      clearInterval(_Timer)
    }
  }, [])

  return (
    <div ref={_ContainerRef} className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[#101010]"></div>
      
      <div className="relative z-10 flex w-full h-full px-15 py-15">
        <motion.div 
          className="flex-1 flex items-center justify-center pr-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="p-4 bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <QRCodeSVG 
                value={_QrCodeValue} 
                size={Math.min(window.innerHeight - 100, 600)} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"H"}
                includeMargin={false}
              />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 flex flex-col pl-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl font-bold text-white mb-8 tracking-tighter"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 0px rgba(66,153,225,0)",
                  "0 0 10px rgba(66,153,225,0.5)",
                  "0 0 0px rgba(66,153,225,0)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Wybierz nastepny utwór
            </motion.span>
          </motion.h1>
          
          <motion.div 
            className="rounded-3xl overflow-hidden backdrop-blur-md bg-[#151515]/40 border border-[#2F2F2F] shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2F2F2F]">
                  <th className="px-8 py-5 text-left text-2xl font-bold text-white">Utwór</th>
                  <th className="px-8 py-5 text-left text-2xl font-bold text-white">Artysta</th>
                  <th className="px-8 py-5 text-center text-2xl font-bold text-white">Głosy</th>
                </tr>
              </thead>
              <tbody>
                {_TopSongs.map((Song, Index) => (
                  <motion.tr 
                    key={Song.Id} 
                    className={`border-b border-[#2F2F2F] last:border-b-0 ${Index === 0 ? 'bg-blue-900/20' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + Index * 0.1 }}
                  >
                    <td className="px-8 py-5 text-2xl text-white">{Song.Title}</td>
                    <td className="px-8 py-5 text-2xl text-white/80">{Song.Artist}</td>
                    <td className="px-8 py-5 text-center">
                      <motion.span 
                        className={`text-2xl font-bold text-white px-6 py-2 rounded-full ${Index === 0 ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-blue-600'}`}
                        animate={Index === 0 ? { 
                          boxShadow: [
                            "0 0 0px rgba(66,153,225,0)",
                            "0 0 15px rgba(66,153,225,0.6)",
                            "0 0 0px rgba(66,153,225,0)"
                          ]
                        } : {}}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {Song.Votes}
                      </motion.span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-4 mt-6 self-center bg-[#151515]/60 py-3 px-6 rounded-full backdrop-blur-md border border-[#2F2F2F]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.9 }}
          >
            <motion.div 
              className="w-3 h-3 rounded-full bg-blue-400"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  "0 0 0px rgba(66,153,225,0)",
                  "0 0 10px rgba(66,153,225,0.7)",
                  "0 0 0px rgba(66,153,225,0)"
                ]
              }}
              transition={{ 
                duration: 2,
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
              Zeskanuj kod QR aby zagłosować
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 