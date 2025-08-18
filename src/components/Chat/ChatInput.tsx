import React, { useState, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void> | void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled || isSubmitting) return

    setIsSubmitting(true)
    setMessage('')

    try {
      await onSendMessage(trimmedMessage)
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [message, disabled, isSubmitting, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }, [handleSubmit])

  const isDisabled = disabled || isSubmitting
  const canSend = message.trim() && !isDisabled

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDisabled}
        maxLength={2000}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!canSend}
        className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-3 rounded-full hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[48px]"
        title={canSend ? "Send message" : "Type a message to send"}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  )
}
