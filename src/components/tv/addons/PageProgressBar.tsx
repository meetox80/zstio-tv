'use client'

import { useState, useEffect } from 'react'

export default function PageProgressBar() {
  const [_Progress, SetProgress] = useState(0)
  const _TotalSeconds = 30
  const _UpdateInterval = 100

  useEffect(() => {
    const _Interval = setInterval(() => {
      SetProgress((PrevProgress) => {
        const NewProgress = PrevProgress + (100 / (_TotalSeconds * 1000 / _UpdateInterval))
        return NewProgress >= 100 ? 0 : NewProgress
      })
    }, _UpdateInterval)

    const HandlePageChange = () => {
      SetProgress(0)
    }

    window.addEventListener('pageChange', HandlePageChange as EventListener)

    return () => {
      clearInterval(_Interval)
      window.removeEventListener('pageChange', HandlePageChange as EventListener)
    }
  }, [])

  return (
    <div className="fixed bottom-0 left-0 w-full h-[1px] bg-[#1a1a1a]">
      <div 
        className="h-full bg-gray-500 transition-all duration-100"
        style={{ width: `${_Progress}%` }}
      />
    </div>
  )
} 