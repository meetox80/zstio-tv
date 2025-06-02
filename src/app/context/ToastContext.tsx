'use client'

import { createContext, FC, ReactNode, useContext, useState } from 'react'
import Toast, { ToastType } from '../components/Toast'

type ToastContextType = {
  ShowToast: (message: string, type?: ToastType, duration?: number) => void
  HideToast: () => void
}

const ToastContext = createContext<ToastContextType>({
  ShowToast: () => {},
  HideToast: () => {}
})

export const useToast = () => useContext(ToastContext)

type ToastProviderProps = {
  children: ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [ToastMessage, SetToastMessage] = useState<string | null>(null)
  const [ToastType, SetToastType] = useState<ToastType>('error')
  const [ToastDuration, SetToastDuration] = useState(5000)
  
  const ShowToast = (message: string, type: ToastType = 'error', duration: number = 5000) => {
    SetToastMessage(message)
    SetToastType(type)
    SetToastDuration(duration)
  }
  
  const HideToast = () => {
    SetToastMessage(null)
  }
  
  return (
    <ToastContext.Provider value={{ ShowToast, HideToast }}>
      {children}
      <Toast 
        Message={ToastMessage} 
        Type={ToastType} 
        Duration={ToastDuration}
        OnClose={HideToast}
      />
    </ToastContext.Provider>
  )
} 