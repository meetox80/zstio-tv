'use client'

import { useState, useEffect, useRef } from 'react'
import SubstitutionsPage from '../pages/SubstitutionsPage'
import WeatherPage from '../pages/WeatherPage'
import VotePage from '../pages/VotePage'

const Pages = [
  { Component: SubstitutionsPage, Key: 'substitutions' },
  { Component: VotePage, Key: 'vote' },
  { Component: WeatherPage, Key: 'weather' }
]

export default function PageSwitcher() {
  const [_CurrentPageIndex, SetCurrentPageIndex] = useState(0)
  const _TotalSeconds = 30
  const _IsChangingPage = useRef(false)
  
  useEffect(() => {
    const _Interval = setInterval(() => {
      const NewIndex = (_CurrentPageIndex + 1) % Pages.length
      SetCurrentPageIndex(NewIndex)
      
      _IsChangingPage.current = true
      const PageChangeEvent = new CustomEvent('pageChange', { 
        detail: { pageIndex: NewIndex } 
      })
      window.dispatchEvent(PageChangeEvent)
      _IsChangingPage.current = false
    }, _TotalSeconds * 1000)
    
    return () => clearInterval(_Interval)
  }, [_CurrentPageIndex])
  
  useEffect(() => {
    const HandlePageChangeEvent = (Event: CustomEvent<{ pageIndex: number }>) => {
      if (!_IsChangingPage.current && Event.detail.pageIndex !== _CurrentPageIndex) {
        setTimeout(() => {
          SetCurrentPageIndex(Event.detail.pageIndex)
        }, 0)
      }
    }
    
    window.addEventListener('pageChange', HandlePageChangeEvent as EventListener)
    
    return () => {
      window.removeEventListener('pageChange', HandlePageChangeEvent as EventListener)
    }
  }, [_CurrentPageIndex])
  
  const _CurrentPage = Pages[_CurrentPageIndex]
  const CurrentPageComponent = _CurrentPage.Component
  
  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <CurrentPageComponent />
      </div>
    </div>
  )
} 