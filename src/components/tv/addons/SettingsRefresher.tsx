'use client'

import { useEffect, useRef } from 'react'

export default function SettingsRefresher() {
  const BroadcastChannelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      BroadcastChannelRef.current = new BroadcastChannel('settings_update_channel')
      
      const HandleMessage = (Event: MessageEvent) => {
        if (Event.data && Event.data.type === 'SETTINGS_UPDATED') {
          window.location.reload()
        }
      }
      
      BroadcastChannelRef.current.addEventListener('message', HandleMessage)
      
      return () => {
        BroadcastChannelRef.current?.removeEventListener('message', HandleMessage)
        BroadcastChannelRef.current?.close()
      }
    }
  }, [])
  
  return null
} 