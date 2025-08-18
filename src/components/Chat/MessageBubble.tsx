import React, { memo, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bot, User, RotateCcw, AlertCircle, Check, Clock } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: string
  created_at: string
  user_id: string
  chat_id: string
  is_ai?: boolean
  status?: 'sending' | 'sent' | 'failed'
  user?: {
    id: string
    displayName?: string
    email?: string
  }
  chat?: {
    id: string
    title: string
  }
}

interface MessageBubbleProps {
  message: Message
  isAi: boolean
  user?: {
    id: string
    displayName?: string
    email?: string
  } | null
  onRetry?: (messageId: string) => void
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ 
  message, 
  isAi, 
  onRetry 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return ''
    }
  }

  const formatContent = (content: string) => {
    // Handle line breaks and basic formatting
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  const getStatusIcon = () => {
    if (isAi) return null

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-white/40 animate-pulse" />
      case 'sent':
        return <Check className="w-3 h-3 text-green-400" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />
      default:
        return <Check className="w-3 h-3 text-green-400" />
    }
  }

  const handleRetry = () => {
    if (onRetry && message.status === 'failed') {
      onRetry(message.id)
    }
  }

  return (
    <div 
      className={`
        flex items-end space-x-3 transform transition-all duration-500 ease-out
        ${!isAi ? 'flex-row-reverse space-x-reverse' : ''}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAi ? (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-purple-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex flex-col max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Message Bubble */}
        <div className={`
          relative px-4 py-3 rounded-2xl shadow-lg transition-all duration-300
          ${isAi 
            ? 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 text-white backdrop-blur-sm' 
            : message.status === 'failed'
              ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-white backdrop-blur-sm'
              : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
          } 
          ${!isAi ? 'rounded-br-md' : 'rounded-bl-md'}
          ${isHovered ? 'scale-[1.02] shadow-xl' : 'scale-100'}
        `}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {formatContent(message.content)}
          </div>

          {/* Retry button for failed messages */}
          {message.status === 'failed' && onRetry && (
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center space-x-1 text-xs text-red-300 hover:text-red-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}

          {/* Message tail */}
          <div className={`
            absolute bottom-0 w-3 h-3 transform rotate-45
            ${isAi 
              ? 'left-0 -ml-1 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border-l border-b border-purple-500/30' 
              : message.status === 'failed'
                ? 'right-0 -mr-1 bg-gradient-to-r from-red-500/20 to-red-600/20 border-r border-b border-red-500/30'
                : 'right-0 -mr-1 bg-gradient-to-r from-blue-500 to-teal-500'
            }
          `} />
        </div>

        {/* Timestamp and Status */}
        <div className={`
          flex items-center space-x-1 text-xs text-white/60 mt-1 px-1 transition-opacity duration-200
          ${!isAi ? 'flex-row-reverse space-x-reverse justify-end' : 'justify-start'}
          ${isHovered ? 'opacity-100' : 'opacity-60'}
        `}>
          <span>{formatTime(message.created_at)}</span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleComponent)
