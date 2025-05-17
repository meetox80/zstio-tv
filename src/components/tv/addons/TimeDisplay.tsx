'use client'

import { useState, useEffect } from 'react'

const PolishDays = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota'
]

const PolishMonths = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia'
]

export default function TimeDisplay() {
  const [CurrentTime, SetCurrentTime] = useState<Date>(new Date())
  
  useEffect(() => {
    const _TimeInterval = setInterval(() => {
      SetCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(_TimeInterval)
  }, [])
  
  const FormatTime = (Time: Date): string => {
    const Hours = Time.getHours().toString().padStart(2, '0')
    const Minutes = Time.getMinutes().toString().padStart(2, '0')
    return `${Hours}:${Minutes}`
  }
  
  const FormatDate = (Time: Date): string => {
    const DayName = PolishDays[Time.getDay()]
    const Day = Time.getDate()
    const Month = PolishMonths[Time.getMonth()]
    
    return `${DayName}, ${Day} ${Month}`
  }
  
  return (
    <>
      <span className="text-[72px] font-bold text-white leading-none">{FormatTime(CurrentTime)}</span>
      <span className="text-[24px] text-gray-300 mt-1 ml-1">{FormatDate(CurrentTime)}</span>
    </>
  )
} 