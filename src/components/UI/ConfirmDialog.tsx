import React, { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onCancel, 150)
  }

  const handleConfirm = () => {
    setIsVisible(false)
    setTimeout(onConfirm, 150)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-400',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      case 'warning':
        return {
          icon: 'text-yellow-400',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'info':
        return {
          icon: 'text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    }
  }

  if (!isOpen) return null

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/20 
            shadow-2xl max-w-md w-full p-6 transform transition-all duration-150
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-white/10">
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-white/70 mb-6">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`
                flex-1 px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors
                ${styles.button}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
