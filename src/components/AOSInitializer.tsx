'use client'

import { useEffect } from 'react'
import AOS from 'aos'

export default function AOSInitializer() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0,
    })
  }, [])

  return null
} 