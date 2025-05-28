import { FC, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ConfirmationModalProps = {
  IsOpen: boolean
  OnClose: () => void
  OnConfirm: () => void
  Title: string
  Message: string
  ConfirmText?: string
  CancelText?: string
  IsLoading?: boolean
  IconClassName?: string
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  IsOpen,
  OnClose,
  OnConfirm,
  Title,
  Message,
  ConfirmText = 'Potwierdź',
  CancelText = 'Anuluj',
  IsLoading = false,
  IconClassName = 'fas fa-exclamation-triangle text-yellow-400'
}) => {
  const CancelButtonRef = useRef<HTMLButtonElement>(null)
  const ConfirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (IsOpen) {
      setTimeout(() => CancelButtonRef.current?.focus(), 0)
    }
  }, [IsOpen])

  const HandleKeyDown = (Event: React.KeyboardEvent<HTMLDivElement>) => {
    if (Event.key === 'Escape') {
      OnClose()
    }
    if (Event.key === 'ArrowLeft' || Event.key === 'ArrowRight') {
      if (document.activeElement === ConfirmButtonRef.current) {
        CancelButtonRef.current?.focus()
      } else {
        ConfirmButtonRef.current?.focus()
      }
    }
  }

  return (
    <AnimatePresence>
      {IsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={OnClose}
          onKeyDown={HandleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="bg-gradient-to-br from-gray-900 via-black to-rose-950/50 rounded-xl shadow-2xl w-full max-w-md border border-rose-500/30"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-message"
          >
            <div className="p-6 border-b border-rose-500/20 flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <i className={`${IconClassName} text-lg`}></i>
              </div>
              <h3 id="modal-title" className="text-xl font-semibold text-white">
                {Title}
              </h3>
            </div>
            
            <div className="p-6">
              <p id="modal-message" className="text-gray-300 mb-8 text-sm leading-relaxed">{Message}</p>
              
              <div className="flex justify-end gap-3">
                <motion.button
                  ref={CancelButtonRef}
                  onClick={OnClose}
                  disabled={IsLoading}
                  className="px-5 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700/80 text-white font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {CancelText}
                </motion.button>
                <motion.button
                  ref={ConfirmButtonRef}
                  onClick={OnConfirm}
                  disabled={IsLoading}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-all duration-200 ease-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {IsLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    IconClassName.includes('trash') && <i className="fas fa-trash-alt mr-2 text-sm"></i>
                  )}
                  {ConfirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal 